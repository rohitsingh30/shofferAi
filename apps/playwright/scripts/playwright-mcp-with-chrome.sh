#!/bin/bash
# playwright-mcp-with-chrome.sh — Lazy Playwright MCP launcher
#
# LAZY LAUNCH: Chrome is NOT started on script startup. Instead, Playwright MCP
# launches Chrome on-demand when the first tool call arrives. This is critical
# because Copilot CLI spawns 2 MCP server instances from .mcp.json — with eager
# launch we'd get 2 Chrome windows, but only 1 is ever used. With lazy launch,
# only the instance that receives tool calls opens Chrome.
#
# How it works:
#   1. Resolve globally-installed playwright-mcp binary (no npx, no network)
#   2. Clean up any orphaned Chrome-Debug clones from previous crashes
#   3. Selective copy of Chrome-Debug session data (~26MB, <1s vs 13s full clone)
#   4. Remove stale lock files from the copy
#   5. Generate a Playwright MCP config JSON with Chrome launch options
#   6. Start Playwright MCP with --config (no --cdp-endpoint → lazy browser launch)
#   7. Playwright MCP launches Chrome only on first tool call
#   8. On exit, clean up the copied dir and temp config
#
# Selective copy preserves all signed-in sessions (Cookies, Local Storage,
# Preferences, etc.) while skipping large caches Chrome regenerates on its own
# (Service Worker, IndexedDB, GPUCache — saves ~6.8GB → 26MB).
#
# IMPORTANT: Uses globally-installed playwright-mcp binary (not npx @latest)
# to eliminate npm registry lookups and avoid slow/failed startups.
# Update with: npm install -g @playwright/mcp@<version>
#
# Called by .mcp.json — no manual Chrome launch needed.

set -euo pipefail

# --- Resolve playwright-mcp binary (global install, no npx) ---
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
  echo "   Then restart the CLI session." >&2
  exit 1
fi

PLAYWRIGHT_MCP_VERSION="$("$PLAYWRIGHT_MCP" --version 2>&1 || echo 'unknown')"
echo "🎭 playwright-mcp $PLAYWRIGHT_MCP_VERSION" >&2

PROFILE="Profile 3"
BASE_USER_DATA_DIR="$HOME/Library/Application Support/Google/Chrome-Debug"
INSTANCE_ID="mcp-$$-$(date +%s)"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# --- Clean up orphaned Chrome-Debug clones from previous crashes (>1 hour old) ---
find "$HOME/Library/Application Support/Google" -maxdepth 1 -name "Chrome-Debug-mcp-*" -type d -mmin +60 2>/dev/null | while read -r stale_dir; do
  echo "🧹 Removing stale clone: $(basename "$stale_dir")" >&2
  rm -rf "$stale_dir" 2>/dev/null || true
done

# --- Selective copy of Chrome profile (only session-critical files) ---
# Full APFS clone of 6.8GB Chrome-Debug takes ~13s. Selective copy of only
# the files needed for signed-in sessions takes <1s (~26MB).
# Chrome regenerates caches (Service Worker, IndexedDB, GPUCache, etc.) on its own.
USER_DATA_DIR="${BASE_USER_DATA_DIR}-${INSTANCE_ID}"
CONFIG_FILE="/tmp/playwright-mcp-config-${INSTANCE_ID}.json"
CDP_PORT_FILE="/tmp/playwright-mcp-cdp-port-${INSTANCE_ID}"
CHROME_PID=""

cleanup() {
  echo "🧹 Cleaning up Chrome + cloned profile..." >&2
  [ -n "$CHROME_PID" ] && kill $CHROME_PID 2>/dev/null || true
  rm -rf "$USER_DATA_DIR" "$CONFIG_FILE" "$CDP_PORT_FILE" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "📋 Copying Chrome session data → ${INSTANCE_ID} (~26MB selective copy)..." >&2
mkdir -p "$USER_DATA_DIR/$PROFILE"

# Top-level: Local State has the encryption key reference for cookies
cp "$BASE_USER_DATA_DIR/Local State" "$USER_DATA_DIR/" 2>/dev/null || true
cp "$BASE_USER_DATA_DIR/First Run" "$USER_DATA_DIR/" 2>/dev/null || true

# Profile 3: copy everything EXCEPT large regeneratable caches
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
  "$BASE_USER_DATA_DIR/$PROFILE/" "$USER_DATA_DIR/$PROFILE/"

# Remove lock files so Chrome doesn't think another instance owns the profile
rm -f "$USER_DATA_DIR/SingletonLock" \
      "$USER_DATA_DIR/SingletonSocket" \
      "$USER_DATA_DIR/SingletonCookie" 2>/dev/null || true

# --- Launch Chrome ourselves (NOT via Playwright) ---
# WHY: Playwright's launchPersistentContext adds --use-mock-keychain and
# --password-store=basic by default. These flags prevent Chrome from accessing
# the macOS Keychain, which means encrypted cookies can't be decrypted.
# Result: all saved sessions (Swiggy, Booking.com, etc.) appear logged out.
# By launching Chrome ourselves, we control ALL flags — no mock keychain.

CHROME_BIN="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

"$CHROME_BIN" \
  --remote-debugging-port=0 \
  --remote-debugging-address=127.0.0.1 \
  --user-data-dir="$USER_DATA_DIR" \
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
  about:blank 2>"$CDP_PORT_FILE" &

CHROME_PID=$!

# Parse the CDP port from Chrome's stderr (DevTools listening on ws://127.0.0.1:PORT/...)
CDP_PORT=""
for i in $(seq 1 30); do
  if [ -f "$CDP_PORT_FILE" ]; then
    CDP_PORT=$(grep -oE 'ws://127\.0\.0\.1:[0-9]+' "$CDP_PORT_FILE" 2>/dev/null | head -1 | grep -oE '[0-9]+$' || true)
    if [ -n "$CDP_PORT" ]; then
      break
    fi
  fi
  sleep 0.3
done

if [ -z "$CDP_PORT" ]; then
  echo "❌ Failed to get CDP port from Chrome (PID $CHROME_PID)" >&2
  exit 1
fi

echo "🌐 Chrome launched (PID $CHROME_PID, CDP port $CDP_PORT, Profile 3 / rsinghtomar3011@gmail.com)" >&2

# --- Generate Playwright MCP config with CDP endpoint ---
# Since we launched Chrome ourselves, tell Playwright MCP to CONNECT to it
# via CDP instead of launching its own browser. This avoids mock keychain.
cat > "$CONFIG_FILE" <<JSONEOF
{
  "browser": {
    "browserName": "chromium",
    "cdpEndpoint": "http://127.0.0.1:${CDP_PORT}"
  }
}
JSONEOF

echo "⏳ Playwright MCP connecting to Chrome via CDP (port $CDP_PORT)..." >&2

# Run Playwright MCP as a foreground process (not exec) so the EXIT trap fires on exit.
# Uses globally-installed binary — no npm registry lookup, instant startup.
# --cdp-endpoint not needed as it's in the config.
# --init-script: stealth anti-bot-detection patches (evaluated before any page JS)
# --output-dir: where screenshots/traces go
"$PLAYWRIGHT_MCP" \
  --config "$CONFIG_FILE" \
  --init-script "$SCRIPT_DIR/stealth-init.js" \
  --output-dir /tmp/playwright-mcp-output
