#!/bin/bash
# playwright-mcp-with-chrome.sh — Self-contained Playwright MCP launcher
#
# Ensures a dedicated Chrome-Debug window (Profile 3 / rsinghtomar3011@gmail.com)
# is running on port 9225 BEFORE starting Playwright MCP.
#
# Called by .mcp.json — no manual Chrome launch needed.

set -euo pipefail

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PROFILE="Profile 3"
PORT=9225
CDP_URL="http://127.0.0.1:$PORT"
USER_DATA_DIR="$HOME/Library/Application Support/Google/Chrome-Debug-$PORT"
LOG_FILE="/tmp/chrome-cdp-$PORT.log"
TIMEOUT=15

# --- Launch Chrome if not already running ---
if ! curl -sf "$CDP_URL/json/version" >/dev/null 2>&1; then
  # Port occupied but not CDP? Bail.
  if lsof -ti :$PORT >/dev/null 2>&1; then
    echo "ERROR: Port $PORT in use but not CDP. Kill it: lsof -ti :$PORT | xargs kill" >&2
    exit 1
  fi

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
      break
    fi
    sleep 1
    ELAPSED=$((ELAPSED + 1))
  done

  if ! curl -sf "$CDP_URL/json/version" >/dev/null 2>&1; then
    echo "ERROR: Chrome CDP not responding after ${TIMEOUT}s. Check $LOG_FILE" >&2
    exit 1
  fi
else
  echo "✅ Chrome-Debug already on port $PORT" >&2
fi

# --- Start Playwright MCP, connected to Chrome-Debug ---
exec npx -y @playwright/mcp@latest --cdp-endpoint "$CDP_URL" --output-dir /tmp/playwright-mcp-output
