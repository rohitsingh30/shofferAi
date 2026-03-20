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
#   1. APFS-clone the Chrome-Debug user-data-dir (instant, preserves signed-in sessions)
#   2. Remove stale lock files from the clone
#   3. Generate a Playwright MCP config JSON with Chrome launch options
#   4. Start Playwright MCP with --config (no --cdp-endpoint → lazy browser launch)
#   5. Playwright MCP launches Chrome only on first tool call
#   6. On exit, clean up the cloned dir and temp config
#
# APFS clone (`cp -c`) is near-instant and preserves all signed-in sessions
# (cookies are encrypted via macOS Keychain per-user, not per-dir).
#
# Called by .mcp.json — no manual Chrome launch needed.

set -euo pipefail

PROFILE="Profile 3"
BASE_USER_DATA_DIR="$HOME/Library/Application Support/Google/Chrome-Debug"
INSTANCE_ID="mcp-$$-$(date +%s)"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# --- APFS-clone the profile for this instance ---
USER_DATA_DIR="${BASE_USER_DATA_DIR}-${INSTANCE_ID}"
CONFIG_FILE="/tmp/playwright-mcp-config-${INSTANCE_ID}.json"

cleanup() {
  rm -rf "$USER_DATA_DIR" 2>/dev/null || true
  rm -f "$CONFIG_FILE" 2>/dev/null || true
}
trap cleanup EXIT

echo "📋 Cloning Chrome-Debug → ${INSTANCE_ID} (APFS instant clone)..." >&2
cp -cR "$BASE_USER_DATA_DIR" "$USER_DATA_DIR"

# Remove lock files so Chrome doesn't think another instance owns the profile
rm -f "$USER_DATA_DIR/SingletonLock" \
      "$USER_DATA_DIR/SingletonSocket" \
      "$USER_DATA_DIR/SingletonCookie" 2>/dev/null || true

# --- Generate Playwright MCP config ---
# Playwright MCP will launch Chrome lazily on first tool call using these settings.
# Config schema: @playwright/mcp config.d.ts → browser.launchOptions is Playwright's BrowserLaunchOptions.
cat > "$CONFIG_FILE" <<JSONEOF
{
  "browser": {
    "browserName": "chromium",
    "userDataDir": "$USER_DATA_DIR",
    "launchOptions": {
      "channel": "chrome",
      "args": [
        "--profile-directory=$PROFILE",
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-blink-features=AutomationControlled",
        "--disable-features=AutomationControlled",
        "--disable-infobars",
        "--disable-ipc-flooding-protection",
        "--disable-popup-blocking",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-renderer-backgrounding"
      ]
    }
  }
}
JSONEOF

echo "⏳ Playwright MCP starting (Chrome launches lazily on first tool call)..." >&2

# Run Playwright MCP as a foreground process (not exec) so the EXIT trap fires on exit.
# --config: our Chrome profile + launch args
# --init-script: stealth anti-bot-detection patches (evaluated before any page JS)
# --output-dir: where screenshots/traces go
# No --cdp-endpoint → Playwright MCP launches Chrome lazily on first tool call.
npx -y @playwright/mcp@latest \
  --config "$CONFIG_FILE" \
  --init-script "$SCRIPT_DIR/stealth-init.js" \
  --output-dir /tmp/playwright-mcp-output
