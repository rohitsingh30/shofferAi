#!/bin/bash
# launch-chrome-cdp.sh — Reliable Chrome CDP launcher for Playwright MCP
#
# IDEMPOTENT: If Chrome is already alive on the target port, prints its info and exits.
# If not, launches Chrome as a DETACHED DAEMON that survives shell exit.
#
# Usage:
#   ./apps/playwright/scripts/launch-chrome-cdp.sh          # default port 9225
#   ./apps/playwright/scripts/launch-chrome-cdp.sh 9230     # use port 9230
#
# IMPORTANT: Always use 127.0.0.1 (IPv4), never "localhost".
# macOS resolves "localhost" to ::1 (IPv6) causing ECONNREFUSED.

set -euo pipefail

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PROFILE="Profile 3"  # rsinghtomar3011@gmail.com (Booking.com Genius)
PORT="${1:-9225}"
TIMEOUT=15  # seconds to wait for CDP
CDP_URL="http://127.0.0.1:$PORT"
USER_DATA_DIR="$HOME/Library/Application Support/Google/Chrome-Debug-$PORT"
LOG_FILE="/tmp/chrome-cdp-$PORT.log"

# --- Already running? Just print info and exit ---
if curl -sf "$CDP_URL/json/version" >/dev/null 2>&1; then
  BROWSER=$(curl -s "$CDP_URL/json/version" | python3 -c "import sys,json; print(json.load(sys.stdin)['Browser'])" 2>/dev/null || echo "unknown")
  PID=$(lsof -ti :$PORT 2>/dev/null | head -1 || echo "?")
  echo "✅ Chrome CDP already running on port $PORT"
  echo "  PID:      $PID"
  echo "  Browser:  $BROWSER"
  echo "  Endpoint: $CDP_URL"
  exit 0
fi

# --- Check port is free ---
if lsof -ti :$PORT >/dev/null 2>&1; then
  echo "ERROR: Port $PORT is in use but NOT responding to CDP." >&2
  echo "  Kill the process: lsof -ti :$PORT | xargs kill" >&2
  exit 1
fi

echo "Launching Chrome CDP on port $PORT..."
echo "  Profile:  $PROFILE (rsinghtomar3011@gmail.com)"
echo "  Data dir: $USER_DATA_DIR"
echo "  Log:      $LOG_FILE"

# --- Launch Chrome as a DETACHED daemon ---
# nohup + stdout/stderr redirect + disown ensures Chrome survives shell exit.
nohup "$CHROME" \
  --remote-debugging-port=$PORT \
  --remote-debugging-address=127.0.0.1 \
  --user-data-dir="$USER_DATA_DIR" \
  --profile-directory="$PROFILE" \
  --no-first-run \
  --no-default-browser-check \
  --disable-blink-features=AutomationControlled \
  --disable-background-timer-throttling \
  --disable-backgrounding-occluded-windows \
  --disable-renderer-backgrounding \
  >"$LOG_FILE" 2>&1 &

CHROME_PID=$!
disown $CHROME_PID 2>/dev/null || true

# --- Wait for CDP to be ready ---
echo "Waiting for CDP (PID $CHROME_PID)..."
ELAPSED=0
while [ $ELAPSED -lt $TIMEOUT ]; do
  if curl -sf "$CDP_URL/json/version" >/dev/null 2>&1; then
    BROWSER=$(curl -s "$CDP_URL/json/version" | python3 -c "import sys,json; print(json.load(sys.stdin)['Browser'])" 2>/dev/null || echo "unknown")
    echo ""
    echo "✅ Chrome CDP ready!"
    echo "  Port:     $PORT"
    echo "  PID:      $CHROME_PID"
    echo "  Browser:  $BROWSER"
    echo "  Endpoint: $CDP_URL"
    exit 0
  fi
  sleep 1
  ELAPSED=$((ELAPSED + 1))
done

# --- Timeout ---
echo ""
echo "ERROR: Chrome CDP not responding on port $PORT after ${TIMEOUT}s" >&2

if ! kill -0 $CHROME_PID 2>/dev/null; then
  echo "  Chrome process $CHROME_PID is NOT running — it crashed." >&2
  echo "  Check log: cat $LOG_FILE" >&2
  echo "  Try deleting the data dir: rm -rf \"$USER_DATA_DIR\"" >&2
else
  echo "  Chrome is running (PID $CHROME_PID) but CDP not responding." >&2
  echo "  Check log: cat $LOG_FILE" >&2
fi

exit 1
