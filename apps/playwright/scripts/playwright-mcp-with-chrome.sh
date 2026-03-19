#!/bin/bash
# playwright-mcp-with-chrome.sh — Self-contained Playwright MCP launcher
#
# Ensures a dedicated Chrome-Debug window (Profile 3 / rsinghtomar3011@gmail.com)
# is running BEFORE starting Playwright MCP.
#
# Port selection:
#   1. If Chrome-Debug is already running on ANY port → reuse it
#   2. Otherwise → find a free port (9222+) and launch Chrome on it
#
# Called by .mcp.json — no manual Chrome launch needed.

set -euo pipefail

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PROFILE="Profile 3"
USER_DATA_DIR="$HOME/Library/Application Support/Google/Chrome-Debug"
LOG_FILE="/tmp/chrome-cdp.log"
TIMEOUT=15

# --- Check if Chrome-Debug is already running on any port ---
find_running_chrome_cdp() {
  for port in $(seq 9222 9240); do
    if curl -sf "http://127.0.0.1:$port/json/version" >/dev/null 2>&1; then
      echo "$port"
      return 0
    fi
  done
  return 1
}

# --- Find a free port starting from 9222 ---
find_free_port() {
  for port in $(seq 9222 9240); do
    if ! lsof -ti :$port >/dev/null 2>&1; then
      echo "$port"
      return 0
    fi
  done
  echo "ERROR: No free port in 9222-9240 range" >&2
  return 1
}

# --- Try to reuse an existing Chrome-Debug instance ---
EXISTING_PORT=$(find_running_chrome_cdp || true)

if [ -n "$EXISTING_PORT" ]; then
  echo "✅ Chrome-Debug already running on port $EXISTING_PORT" >&2
  exec npx -y @playwright/mcp@latest --cdp-endpoint "http://127.0.0.1:$EXISTING_PORT" --output-dir /tmp/playwright-mcp-output
fi

# --- Launch new Chrome-Debug on a free port ---
PORT=$(find_free_port)
CDP_URL="http://127.0.0.1:$PORT"

echo "Launching Chrome-Debug (Profile 3) on port $PORT..." >&2

nohup "$CHROME" \
  --remote-debugging-port=$PORT \
  --remote-debugging-address=127.0.0.1 \
  --user-data-dir="$USER_DATA_DIR" \
  --profile-directory="$PROFILE" \
  --no-first-run \
  --no-default-browser-check \
  --disable-background-timer-throttling \
  --disable-backgrounding-occluded-windows \
  --disable-renderer-backgrounding \
  >"$LOG_FILE" 2>&1 &
disown $! 2>/dev/null || true

# Wait for CDP
ELAPSED=0
while [ $ELAPSED -lt $TIMEOUT ]; do
  if curl -sf "$CDP_URL/json/version" >/dev/null 2>&1; then
    echo "✅ Chrome-Debug ready on port $PORT" >&2
    exec npx -y @playwright/mcp@latest --cdp-endpoint "$CDP_URL" --output-dir /tmp/playwright-mcp-output
  fi
  sleep 1
  ELAPSED=$((ELAPSED + 1))
done

echo "ERROR: Chrome CDP not responding after ${TIMEOUT}s. Check $LOG_FILE" >&2
exit 1
