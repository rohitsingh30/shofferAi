#!/bin/bash
# playwright-mcp-with-chrome.sh — Self-contained Playwright MCP launcher
#
# ALWAYS launches a BRAND NEW Chrome-Debug window (Profile 3 / rsinghtomar3011@gmail.com)
# before starting Playwright MCP.
#
# NEVER reuses an existing Chrome window — existing windows may be running
# other tasks (relay, user browsing, etc.) and must not be hijacked.
#
# How it works:
#   1. Generate a unique instance ID (PID-based)
#   2. APFS-clone the Chrome-Debug user-data-dir (preserves all signed-in sessions)
#   3. Launch Chrome with --remote-debugging-port=0 (OS picks a free port)
#   4. Parse the actual port from Chrome's "DevTools listening on..." stderr line
#   5. Start Playwright MCP connected to the new Chrome window
#
# Why port=0?
#   The OS kernel assigns a guaranteed-free ephemeral port. No scanning, no
#   conflicts, no race conditions. Works every time regardless of what else
#   is running (relay, pool, other MCP instances, dev-loop).
#
# APFS clone (`cp -c`) is near-instant and preserves all signed-in sessions
# (cookies are encrypted via macOS Keychain per-user, not per-dir).
#
# Called by .mcp.json — no manual Chrome launch needed.

set -euo pipefail

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PROFILE="Profile 3"
BASE_USER_DATA_DIR="$HOME/Library/Application Support/Google/Chrome-Debug"
TIMEOUT=15
INSTANCE_ID="mcp-$$-$(date +%s)"

# --- APFS-clone the profile for this instance ---
USER_DATA_DIR="${BASE_USER_DATA_DIR}-${INSTANCE_ID}"
LOG_FILE="/tmp/chrome-mcp-${INSTANCE_ID}.log"

# Pre-exec cleanup (for errors before exec)
cleanup() {
  if [ -n "${CHROME_PID:-}" ] && kill -0 "$CHROME_PID" 2>/dev/null; then
    kill "$CHROME_PID" 2>/dev/null || true
  fi
  rm -rf "$USER_DATA_DIR" 2>/dev/null || true
}
trap cleanup EXIT

echo "📋 Cloning Chrome-Debug → ${INSTANCE_ID} (APFS instant clone)..." >&2
cp -cR "$BASE_USER_DATA_DIR" "$USER_DATA_DIR"

# Remove lock files so Chrome doesn't think another instance owns the profile
rm -f "$USER_DATA_DIR/SingletonLock" \
      "$USER_DATA_DIR/SingletonSocket" \
      "$USER_DATA_DIR/SingletonCookie" 2>/dev/null || true

echo "🚀 Launching Chrome-Debug (Profile 3 / rsinghtomar3011@gmail.com) — OS picks port..." >&2

# Launch Chrome with port=0 — OS assigns a free ephemeral port.
# Chrome prints "DevTools listening on ws://127.0.0.1:PORT/..." to stderr.
"$CHROME" \
  --remote-debugging-port=0 \
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

# Parse the actual port Chrome chose from its stderr output
ELAPSED=0
PORT=""
while [ $ELAPSED -lt $TIMEOUT ]; do
  # Chrome writes: "DevTools listening on ws://127.0.0.1:PORT/devtools/browser/..."
  if [ -f "$LOG_FILE" ]; then
    PORT=$(grep -oE 'ws://127\.0\.0\.1:[0-9]+' "$LOG_FILE" 2>/dev/null | head -1 | grep -oE '[0-9]+$' || true)
    if [ -n "$PORT" ]; then
      break
    fi
  fi
  sleep 0.5
  ELAPSED=$((ELAPSED + 1))
done

if [ -z "$PORT" ]; then
  echo "ERROR: Chrome didn't report a CDP port after ${TIMEOUT}s. Check $LOG_FILE" >&2
  exit 1
fi

CDP_URL="http://127.0.0.1:$PORT"

# Verify CDP is actually responding
ELAPSED=0
while [ $ELAPSED -lt 5 ]; do
  if curl -sf "$CDP_URL/json/version" >/dev/null 2>&1; then
    echo "✅ Chrome-Debug ready on port $PORT — signed in as rsinghtomar3011@gmail.com (Profile 3)" >&2

    # --- Watchdog: monitor Chrome health, kill MCP if Chrome dies ---
    # After exec, the shell PID becomes the MCP process. The watchdog runs
    # as a background subshell that survives exec. It monitors Chrome PID
    # and CDP health. If either fail, it kills MCP so the CLI host sees the
    # server die and can restart it.
    SHELL_PID=$$
    (
      CDP_FAILS=0
      CYCLE=0
      while true; do
        sleep 5
        CYCLE=$((CYCLE + 1))

        # Check Chrome process alive
        if ! kill -0 "$CHROME_PID" 2>/dev/null; then
          echo "⚠️  Chrome (PID $CHROME_PID) died — killing MCP to trigger restart" >&2
          kill "$SHELL_PID" 2>/dev/null
          rm -rf "$USER_DATA_DIR" 2>/dev/null
          exit 1
        fi

        # Check MCP still alive (normal exit = we should clean up)
        if ! kill -0 "$SHELL_PID" 2>/dev/null; then
          kill "$CHROME_PID" 2>/dev/null
          rm -rf "$USER_DATA_DIR" 2>/dev/null
          exit 0
        fi

        # CDP health check every 3 cycles (15s) — catches frozen Chrome
        if [ "$((CYCLE % 3))" = "0" ]; then
          if ! curl -sf --connect-timeout 3 "$CDP_URL/json/version" >/dev/null 2>&1; then
            CDP_FAILS=$((CDP_FAILS + 1))
            if [ "$CDP_FAILS" -ge 3 ]; then
              echo "⚠️  Chrome CDP unresponsive for 3 checks — killing Chrome + MCP" >&2
              kill "$CHROME_PID" 2>/dev/null
              kill "$SHELL_PID" 2>/dev/null
              rm -rf "$USER_DATA_DIR" 2>/dev/null
              exit 1
            fi
          else
            CDP_FAILS=0
          fi
        fi
      done
    ) &

    # exec replaces this shell with MCP — watchdog keeps running independently
    exec npx -y @playwright/mcp@latest --cdp-endpoint "$CDP_URL" --output-dir /tmp/playwright-mcp-output
  fi
  sleep 0.5
  ELAPSED=$((ELAPSED + 1))
done

echo "ERROR: Chrome CDP on port $PORT not responding. Check $LOG_FILE" >&2
exit 1
