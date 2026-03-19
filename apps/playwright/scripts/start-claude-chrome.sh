#!/bin/bash
# Launch a separate Chrome Debug instance for Claude Code's Playwright MCP.
# Port 9223 (distinct from operator's 9222).
# First run: sign into rsinghtomar3011@gmail.com manually → session persists forever.

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
USER_DATA_DIR="$HOME/Library/Application Support/Google/Chrome-Claude"
PORT=9223
PROFILE="Profile 1"

# Check if already running
if curl -s "http://127.0.0.1:$PORT/json/version" > /dev/null 2>&1; then
  echo "Chrome-Claude already running on port $PORT"
  curl -s "http://127.0.0.1:$PORT/json/version" | python3 -m json.tool
  exit 0
fi

echo "Starting Chrome-Claude on port $PORT..."
echo "User data dir: $USER_DATA_DIR"
echo "Profile: $PROFILE"

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

sleep 2

if curl -s "http://127.0.0.1:$PORT/json/version" > /dev/null 2>&1; then
  echo "Chrome-Claude started successfully!"
  echo "Sign into rsinghtomar3011@gmail.com if this is the first run."
else
  echo "Failed to start Chrome-Claude"
  exit 1
fi
