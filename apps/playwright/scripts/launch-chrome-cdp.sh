#!/bin/bash
# launch-chrome-cdp.sh — Reliable Chrome CDP launcher for Playwright MCP
#
# Finds an empty port, launches Chrome with IPv4-only CDP binding + Profile 3,
# waits until CDP is ready, then prints the port and endpoint URL.
#
# Usage:
#   ./apps/playwright/scripts/launch-chrome-cdp.sh              # auto-pick port from 9225
#   ./apps/playwright/scripts/launch-chrome-cdp.sh 9230         # start scanning from 9230
#
# IMPORTANT: Always use 127.0.0.1 (IPv4), never "localhost".
# macOS can resolve "localhost" to ::1 (IPv6) causing ECONNREFUSED when
# Chrome is bound to 127.0.0.1 only.

set -euo pipefail

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PROFILE="Profile 3"  # rsinghtomar3011@gmail.com (Booking.com Genius)
BASE_PORT="${1:-9225}"
MAX_PORT=$((BASE_PORT + 50))
TIMEOUT=15  # seconds to wait for CDP

# --- Find empty port ---
PORT=$BASE_PORT
while [ $PORT -le $MAX_PORT ]; do
  if ! lsof -ti :$PORT >/dev/null 2>&1; then
    break
  fi
  PORT=$((PORT + 1))
done

if [ $PORT -gt $MAX_PORT ]; then
  echo "ERROR: No free port found between $BASE_PORT and $MAX_PORT" >&2
  exit 1
fi

USER_DATA_DIR="$HOME/Library/Application Support/Google/Chrome-Debug-$PORT"

echo "Launching Chrome CDP on port $PORT..."
echo "  Profile:  $PROFILE (rsinghtomar3011@gmail.com)"
echo "  Data dir: $USER_DATA_DIR"

# --- Launch Chrome ---
"$CHROME" \
  --remote-debugging-port=$PORT \
  --remote-debugging-address=127.0.0.1 \
  --user-data-dir="$USER_DATA_DIR" \
  --profile-directory="$PROFILE" \
  --no-first-run \
  --no-default-browser-check \
  --disable-background-timer-throttling \
  --disable-backgrounding-occluded-windows \
  --disable-renderer-backgrounding \
  &

CHROME_PID=$!

# --- Wait for CDP to be ready ---
echo "Waiting for CDP (PID $CHROME_PID)..."
ELAPSED=0
while [ $ELAPSED -lt $TIMEOUT ]; do
  if curl -sf "http://127.0.0.1:$PORT/json/version" >/dev/null 2>&1; then
    BROWSER=$(curl -s "http://127.0.0.1:$PORT/json/version" | python3 -c "import sys,json; print(json.load(sys.stdin)['Browser'])" 2>/dev/null || echo "unknown")
    echo ""
    echo "✅ Chrome CDP ready!"
    echo "  Port:     $PORT"
    echo "  PID:      $CHROME_PID"
    echo "  Browser:  $BROWSER"
    echo "  Endpoint: http://127.0.0.1:$PORT"
    echo ""
    echo "Connect Playwright MCP with:"
    echo "  npx -y @playwright/mcp@latest --cdp-endpoint http://127.0.0.1:$PORT"
    exit 0
  fi
  sleep 1
  ELAPSED=$((ELAPSED + 1))
done

# --- Timeout: Chrome didn't start ---
echo ""
echo "ERROR: Chrome CDP not responding on port $PORT after ${TIMEOUT}s" >&2
echo "  Check if Chrome launched (PID $CHROME_PID):" >&2
echo "  ps -p $CHROME_PID" >&2

# Check if Chrome process is even alive
if ! kill -0 $CHROME_PID 2>/dev/null; then
  echo "  Chrome process $CHROME_PID is NOT running — it crashed on startup." >&2
  echo "  Try deleting the data dir and retrying:" >&2
  echo "    rm -rf \"$USER_DATA_DIR\"" >&2
fi

exit 1
