#!/bin/bash
# playwright-mcp-with-chrome.sh — Singleton Playwright MCP launcher
#
# SINGLETON CHROME: Only ONE Chrome instance is shared by ALL MCP server
# processes. Copilot CLI spawns 2 MCP servers from .mcp.json, and the user
# may have multiple CLI sessions open — all share a single Chrome window.
#
# How it works:
#   1. Acquire atomic lock (mkdir — atomic on all filesystems)
#   2. Check if singleton Chrome is already running (PID file + kill -0)
#   3. If not running: selective-copy profile, launch Chrome, write PID/port
#   4. If already running: read existing CDP port, skip Chrome launch
#   5. Register self as client (reference counting), release lock
#   6. Start Playwright MCP connected to shared Chrome via CDP
#   7. On exit: unregister; if last client, kill Chrome + clean up
#
# Chrome is launched manually (not by Playwright MCP) to avoid the
# --use-mock-keychain flag that prevents macOS Keychain cookie decryption.
#
# Called by .mcp.json — no manual Chrome launch needed.

set -euo pipefail

# ─── Singleton state ─────────────────────────────────────────────────
SINGLETON_DIR="/tmp/shofferai-chrome-singleton"
LOCK_DIR="${SINGLETON_DIR}/.lock"
PID_FILE="${SINGLETON_DIR}/chrome.pid"
PORT_FILE="${SINGLETON_DIR}/cdp.port"
PROFILE_DIR="${SINGLETON_DIR}/profile"
CLIENTS_DIR="${SINGLETON_DIR}/clients"
CONFIG_FILE="/tmp/playwright-mcp-config-$$.json"

mkdir -p "$SINGLETON_DIR" "$CLIENTS_DIR"

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
I_LAUNCHED_CHROME=false

# ─── Lock helpers (atomic mkdir) ─────────────────────────────────────
acquire_lock() {
  local attempts=0
  while ! mkdir "$LOCK_DIR" 2>/dev/null; do
    sleep 0.2
    attempts=$((attempts + 1))
    if [ $attempts -gt 50 ]; then
      echo "⚠️  Force-clearing stale lock" >&2
      rm -rf "$LOCK_DIR"
      mkdir "$LOCK_DIR" 2>/dev/null || true
      break
    fi
  done
}

release_lock() {
  rmdir "$LOCK_DIR" 2>/dev/null || true
}

# ─── Client registration (reference counting) ────────────────────────
register_client() { echo "$$" > "$CLIENTS_DIR/$$"; }
unregister_client() { rm -f "$CLIENTS_DIR/$$"; }

count_live_clients() {
  local count=0
  for f in "$CLIENTS_DIR"/*; do
    [ -f "$f" ] || continue
    local pid
    pid=$(cat "$f" 2>/dev/null) || continue
    if kill -0 "$pid" 2>/dev/null; then
      count=$((count + 1))
    else
      rm -f "$f"
    fi
  done
  echo "$count"
}

# ─── Cleanup on exit ─────────────────────────────────────────────────
cleanup() {
  unregister_client
  rm -f "$CONFIG_FILE"

  local live
  live=$(count_live_clients)
  if [ "$live" -eq 0 ] && [ -f "$PID_FILE" ]; then
    local chrome_pid
    chrome_pid=$(cat "$PID_FILE" 2>/dev/null) || true
    echo "🧹 Last client — killing Chrome (PID ${chrome_pid:-?})" >&2
    [ -n "$chrome_pid" ] && kill "$chrome_pid" 2>/dev/null || true
    rm -rf "$SINGLETON_DIR"
  fi
}
trap cleanup EXIT INT TERM

# ─── Remove orphaned Chrome-Debug clones from old per-instance approach ─
find "$HOME/Library/Application Support/Google" -maxdepth 1 -name "Chrome-Debug-mcp-*" -type d 2>/dev/null | while read -r stale_dir; do
  echo "🧹 Removing old clone: $(basename "$stale_dir")" >&2
  rm -rf "$stale_dir" 2>/dev/null || true
done

# ─── Acquire lock & check singleton Chrome ────────────────────────────
acquire_lock

CDP_PORT=""
CHROME_ALIVE=false

if [ -f "$PID_FILE" ] && [ -f "$PORT_FILE" ]; then
  STORED_PID=$(cat "$PID_FILE" 2>/dev/null) || true
  STORED_PORT=$(cat "$PORT_FILE" 2>/dev/null) || true
  if [ -n "$STORED_PID" ] && kill -0 "$STORED_PID" 2>/dev/null; then
    CDP_PORT="$STORED_PORT"
    CHROME_ALIVE=true
  fi
fi

if [ "$CHROME_ALIVE" = true ]; then
  echo "🔗 Reusing Chrome singleton (PID $STORED_PID, CDP port $CDP_PORT)" >&2
else
  # ─── Selective copy of Chrome profile (~26MB, <1s) ──────────────────
  echo "📋 Cloning Chrome session data (~26MB selective copy)..." >&2
  rm -rf "$PROFILE_DIR"
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

  # ─── Launch Chrome manually (avoids --use-mock-keychain) ────────────
  CHROME_BIN="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  CDP_STDERR="/tmp/shofferai-chrome-singleton-stderr-$$"

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
    release_lock
    exit 1
  fi

  echo "$CHROME_PID" > "$PID_FILE"
  echo "$CDP_PORT" > "$PORT_FILE"
  I_LAUNCHED_CHROME=true

  echo "🌐 Chrome singleton launched (PID $CHROME_PID, CDP port $CDP_PORT, Profile 3)" >&2
fi

register_client
release_lock

# ─── Playwright MCP config (connect to shared Chrome via CDP) ────────
cat > "$CONFIG_FILE" <<JSONEOF
{
  "browser": {
    "browserName": "chromium",
    "cdpEndpoint": "http://127.0.0.1:${CDP_PORT}"
  }
}
JSONEOF

echo "⏳ Playwright MCP → Chrome CDP port $CDP_PORT (client $$)" >&2

# ─── Start Playwright MCP (foreground so EXIT trap fires on exit) ─────
"$PLAYWRIGHT_MCP" \
  --config "$CONFIG_FILE" \
  --init-script "$SCRIPT_DIR/stealth-init.js" \
  --output-dir /tmp/playwright-mcp-output
