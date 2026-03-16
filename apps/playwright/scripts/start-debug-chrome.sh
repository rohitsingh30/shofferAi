#!/bin/bash
# Start Chrome Debug with CDP enabled for Playwright MCP.
#
# IMPORTANT: Always uses Profile 3 (rsinghtomar3011@gmail.com).
# Never use --headless — persistent profiles require headed mode.
# Chrome 136+ requires --user-data-dir for remote debugging.

set -e

PROFILE_DIR="$HOME/Library/Application Support/Google/Chrome-Debug"
CHROME_PROFILE="Profile 3"  # rsinghtomar3011@gmail.com (Booking.com Genius)
CDP_PORT=9222

# Check if Chrome Debug is already running on this port
if curl -s "http://localhost:${CDP_PORT}/json/version" > /dev/null 2>&1; then
  echo "Chrome Debug already running on port ${CDP_PORT}"
  curl -s "http://localhost:${CDP_PORT}/json/version" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(f'  Browser: {d.get(\"Browser\", \"unknown\")}')
print(f'  WS URL:  {d.get(\"webSocketDebuggerUrl\", \"unknown\")}')
"
  # Verify correct profile
  if ps aux | grep "Chrome-Debug" | grep -q "Profile 3"; then
    echo "  Profile: ✓ Profile 3 (rsinghtomar3011@gmail.com)"
  else
    echo "  Profile: ⚠ Could not verify Profile 3 — check process flags"
  fi
  exit 0
fi

# Ensure profile directory exists
mkdir -p "$PROFILE_DIR/$CHROME_PROFILE"

echo "Starting Chrome Debug..."
echo "  Profile: $CHROME_PROFILE (rsinghtomar3011@gmail.com)"
echo "  CDP:     http://localhost:${CDP_PORT}"
echo "  Dir:     $PROFILE_DIR"
echo ""

exec /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=${CDP_PORT} \
  --remote-debugging-address=127.0.0.1 \
  --user-data-dir="$PROFILE_DIR" \
  --profile-directory="$CHROME_PROFILE" \
  --no-first-run \
  --no-default-browser-check \
  --disable-sync \
  --disable-default-apps
