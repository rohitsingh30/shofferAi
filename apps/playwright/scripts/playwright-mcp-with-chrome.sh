#!/bin/bash
# playwright-mcp-with-chrome.sh — Per-instance Playwright MCP launcher
#
# DEDICATED CHROME: Each invocation gets its OWN Chrome instance in an
# isolated directory (/tmp/shofferai-chrome-<PID>/). This prevents the
# sharing bug where relay tasks and QA sessions navigate the same window.
#
# How it works:
#   1. Copy Chrome-Debug/Profile 3 session data → /tmp/shofferai-chrome-$$/
#   2. Launch a dedicated Chrome with --remote-debugging-port=0 (OS picks port)
#   3. Parse CDP port from stderr
#   4. Start Playwright MCP connected to THIS Chrome via CDP
#   5. On exit: kill Chrome + clean up temp dir
#
# Chrome is launched manually (not by Playwright MCP) to avoid the
# --use-mock-keychain flag that prevents macOS Keychain cookie decryption.
#
# Called by .mcp.json — no manual Chrome launch needed.

set -euo pipefail

# ─── Per-instance state (PID-namespaced, fully isolated) ─────────────
INSTANCE_DIR="/tmp/shofferai-chrome-$$"
PROFILE_DIR="${INSTANCE_DIR}/profile"
CONFIG_FILE="${INSTANCE_DIR}/mcp-config.json"
CDP_STDERR="${INSTANCE_DIR}/chrome-stderr"
CHROME_PID=""

mkdir -p "$INSTANCE_DIR"

# ─── Resolve playwright-mcp binary (global install, no npx) ─────────
PLAYWRIGHT_MCP=""
if command -v playwright-mcp >/dev/null 2>&1; then
  PLAYWRIGHT_MCP="$(command -v playwright-mcp)"
elif [ -x /opt/homebrew/bin/playwright-mcp ]; then
  PLAYWRIGHT_MCP="/opt/homebrew/bin/playwright-mcp"
elif [ -x /usr/local/bin/playwright-mcp ]; then
  PLAYWRIGHT_MCP="/usr/local/bin/playwright-mcp"
fi

if [ -z "$PLAYWRIGHT_MCP" ]; then
  echo "❌ playwright-mcp not found! Install with: npm install -g @playwright/mcp" >&2
  exit 1
fi

echo "🎭 playwright-mcp $("$PLAYWRIGHT_MCP" --version 2>&1 || echo 'unknown')" >&2

PROFILE="Profile 3"
BASE_USER_DATA_DIR="$HOME/Library/Application Support/Google/Chrome-Debug"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# ─── Cleanup on exit — always kill OUR Chrome + remove temp dir ───────
cleanup() {
  if [ -n "$CHROME_PID" ] && kill -0 "$CHROME_PID" 2>/dev/null; then
    echo "🧹 Killing Chrome (PID $CHROME_PID)" >&2
    kill "$CHROME_PID" 2>/dev/null || true
    wait "$CHROME_PID" 2>/dev/null || true
  fi
  rm -rf "$INSTANCE_DIR"
}
trap cleanup EXIT INT TERM

# ─── Clean up stale instance dirs from crashed previous runs ──────────
find /tmp -maxdepth 1 -name "shofferai-chrome-*" -type d -mmin +120 2>/dev/null | while read -r stale_dir; do
  stale_pid=$(basename "$stale_dir" | sed 's/shofferai-chrome-//')
  if ! kill -0 "$stale_pid" 2>/dev/null; then
    echo "🧹 Removing stale instance: $(basename "$stale_dir")" >&2
    rm -rf "$stale_dir" 2>/dev/null || true
  fi
done

# Also clean up old singleton dir if no live clients
if [ -d "/tmp/shofferai-chrome-singleton" ]; then
  old_pid=$(cat "/tmp/shofferai-chrome-singleton/chrome.pid" 2>/dev/null || true)
  if [ -z "$old_pid" ] || ! kill -0 "$old_pid" 2>/dev/null; then
    echo "🧹 Removing old singleton dir" >&2
    rm -rf "/tmp/shofferai-chrome-singleton" 2>/dev/null || true
  fi
fi

# ─── Selective copy of Chrome profile (~26MB, <1s) ───────────────────
echo "📋 Cloning Chrome session data for instance $$ (~26MB)..." >&2
mkdir -p "$PROFILE_DIR/$PROFILE"

cp "$BASE_USER_DATA_DIR/Local State" "$PROFILE_DIR/" 2>/dev/null || true
cp "$BASE_USER_DATA_DIR/First Run" "$PROFILE_DIR/" 2>/dev/null || true

rsync -a \
  --exclude='Service Worker' \
  --exclude='IndexedDB' \
  --exclude='GPUCache' \
  --exclude='DawnWebGPUCache' \
  --exclude='DawnGraphiteCache' \
  --exclude='DawnWebGPUBlobCache' \
  --exclude='Code Cache' \
  --exclude='Cache' \
  --exclude='ScriptCache' \
  --exclude='blob_storage' \
  "$BASE_USER_DATA_DIR/$PROFILE/" "$PROFILE_DIR/$PROFILE/"

rm -f "$PROFILE_DIR/SingletonLock" \
      "$PROFILE_DIR/SingletonSocket" \
      "$PROFILE_DIR/SingletonCookie" 2>/dev/null || true

# Mark clean exit — suppresses "Restore pages?" bubble
PREFS="$PROFILE_DIR/$PROFILE/Preferences"
if [ -f "$PREFS" ] && command -v python3 &>/dev/null; then
  python3 -c "
import json
p = json.load(open('$PREFS'))
p.setdefault('profile', {})['exit_type'] = 'Normal'
p.setdefault('profile', {})['exited_cleanly'] = True
json.dump(p, open('$PREFS', 'w'))
" 2>/dev/null || true
fi

# ─── Launch Chrome manually (avoids --use-mock-keychain) ─────────────
CHROME_BIN="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

"$CHROME_BIN" \
  --remote-debugging-port=0 \
  --remote-debugging-address=127.0.0.1 \
  --user-data-dir="$PROFILE_DIR" \
  --profile-directory="$PROFILE" \
  --no-first-run \
  --no-default-browser-check \
  --disable-sync \
  --disable-default-apps \
  --disable-blink-features=AutomationControlled \
  --disable-features=AutomationControlled,SigninInterceptBubble,IdentityStatusConsistency,OptimizationGuideModelDownloading,OptimizationHintsFetching \
  --disable-infobars \
  --disable-ipc-flooding-protection \
  --disable-popup-blocking \
  --disable-background-timer-throttling \
  --disable-backgrounding-occluded-windows \
  --disable-renderer-backgrounding \
  --noerrdialogs \
  --disable-gaia-services \
  --hide-crash-restore-bubble \
  --disable-session-crashed-bubble \
  about:blank 2>"$CDP_STDERR" &

CHROME_PID=$!

CDP_PORT=""
for i in $(seq 1 30); do
  if [ -f "$CDP_STDERR" ]; then
    CDP_PORT=$(grep -oE 'ws://127\.0\.0\.1:[0-9]+' "$CDP_STDERR" 2>/dev/null | head -1 | grep -oE '[0-9]+$' || true)
    [ -n "$CDP_PORT" ] && break
  fi
  sleep 0.3
done

rm -f "$CDP_STDERR"

if [ -z "$CDP_PORT" ]; then
  echo "❌ Failed to get CDP port from Chrome (PID $CHROME_PID)" >&2
  exit 1
fi

echo "🌐 Chrome instance $$ launched (PID $CHROME_PID, CDP port $CDP_PORT, Profile 3)" >&2

# ─── Playwright MCP config (connect to OUR dedicated Chrome via CDP) ──
cat > "$CONFIG_FILE" <<JSONEOF
{
  "browser": {
    "browserName": "chromium",
    "cdpEndpoint": "http://127.0.0.1:${CDP_PORT}"
  }
}
JSONEOF

echo "⏳ Playwright MCP → Chrome CDP port $CDP_PORT (instance $$)" >&2

# ─── Start Playwright MCP (foreground so EXIT trap fires on exit) ─────
"$PLAYWRIGHT_MCP" \
  --config "$CONFIG_FILE" \
  --init-script "$SCRIPT_DIR/stealth-init.js" \
  --output-dir /tmp/playwright-mcp-output
