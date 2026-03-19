#!/bin/bash
# playwright-mcp-with-chrome.sh — Self-contained Playwright MCP launcher
#
# ALWAYS launches a BRAND NEW Chrome-Debug window (Profile 3 / rsinghtomar3011@gmail.com)
# on a free port BEFORE starting Playwright MCP.
#
# NEVER reuses an existing Chrome window — existing windows may be running
# other tasks (relay, user browsing, etc.) and must not be hijacked.
#
# How it works:
#   1. Find a free port in 9222-9260 (skips ports already in use)
#   2. APFS-clone the entire Chrome-Debug user-data-dir so the new Chrome
#      instance has the FULL signed-in Profile 3 (rsinghtomar3011@gmail.com)
#      including cookies, sessions, login data — everything.
#   3. Launch a new Chrome window on that port using the cloned dir
#   4. Wait for CDP to respond
#   5. Start Playwright MCP connected to the new window
#
# The APFS clone (`cp -c`) is near-instant regardless of profile size and
# preserves all signed-in sessions (cookies are encrypted via macOS Keychain,
# which is per-user, not per-user-data-dir — so clones can decrypt them).
#
# Called by .mcp.json — no manual Chrome launch needed.

set -euo pipefail

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PROFILE="Profile 3"
BASE_USER_DATA_DIR="$HOME/Library/Application Support/Google/Chrome-Debug"
TIMEOUT=15

# --- Find a free port starting from 9222 ---
find_free_port() {
  for port in $(seq 9222 9260); do
    if ! lsof -ti :$port >/dev/null 2>&1; then
      echo "$port"
      return 0
    fi
  done
  echo "ERROR: No free port in 9222-9260 range" >&2
  return 1
}

# --- Always launch a new Chrome-Debug on a free port ---
PORT=$(find_free_port)
CDP_URL="http://127.0.0.1:$PORT"
LOG_FILE="/tmp/chrome-cdp-${PORT}.log"

# Port 9222 uses the base dir (for backward compat with relay/pool).
# All other ports get an APFS clone of the base dir.
if [ "$PORT" -eq 9222 ]; then
  USER_DATA_DIR="$BASE_USER_DATA_DIR"
else
  USER_DATA_DIR="${BASE_USER_DATA_DIR}-${PORT}"

  # Always clone fresh from the base dir to get latest signed-in sessions.
  # Remove stale clone if it exists, then APFS-clone the entire dir.
  if [ -d "$USER_DATA_DIR" ]; then
    rm -rf "$USER_DATA_DIR"
  fi

  echo "📋 Cloning Chrome-Debug → Chrome-Debug-${PORT} (APFS instant clone)..." >&2
  cp -cR "$BASE_USER_DATA_DIR" "$USER_DATA_DIR"

  # Remove lock files from the clone so Chrome doesn't think another instance owns it
  rm -f "$USER_DATA_DIR/SingletonLock" "$USER_DATA_DIR/SingletonSocket" "$USER_DATA_DIR/SingletonCookie" 2>/dev/null || true
fi

echo "🚀 Launching NEW Chrome-Debug (Profile 3 / rsinghtomar3011@gmail.com) on port $PORT..." >&2

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
    echo "✅ Chrome-Debug ready on port $PORT — signed in as rsinghtomar3011@gmail.com (Profile 3)" >&2
    exec npx -y @playwright/mcp@latest --cdp-endpoint "$CDP_URL" --output-dir /tmp/playwright-mcp-output
  fi
  sleep 1
  ELAPSED=$((ELAPSED + 1))
done

echo "ERROR: Chrome CDP not responding after ${TIMEOUT}s. Check $LOG_FILE" >&2
exit 1
