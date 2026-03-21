#!/bin/bash
# ShofferAI Laptop Relay Starter
#
# Starts ChromePool (lazy — launches Chrome on demand) and connects
# outbound to Cloud Run via WSS. No tunnel needed.
#
# Usage:
#   ./start-laptop.sh              # Start relay (connects to prod Cloud Run)
#   POOL_SIZE=5 ./start-laptop.sh  # Max concurrent Chrome slots
#
# ChromePool handles everything:
#   - Boots 1 Chrome for tool discovery, rest launch on demand when tasks arrive
#   - Each Chrome uses --remote-debugging-port=0 (OS picks port)
#   - Profile 3 (rsinghtomar3011@gmail.com) — always signed in
#   - Idle Chrome torn down after 30 min

set -e

DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$DIR/../../.." && pwd)"

echo ""
echo "=== ShofferAI Laptop Relay ==="
echo ""

# ─── Kill any existing relay instances (prevents duplicate-process flapping) ───
EXISTING_PIDS=$(ps aux | grep 'tsx.*apps/playwright/src/index' | grep -v grep | awk '{print $2}' || true)
if [ -n "$EXISTING_PIDS" ]; then
  echo "⚠️  Killing existing relay processes: $EXISTING_PIDS"
  echo "$EXISTING_PIDS" | xargs kill 2>/dev/null || true
  # Wait until all old processes are fully dead (up to 10s)
  for i in $(seq 1 20); do
    REMAINING=$(ps aux | grep 'tsx.*apps/playwright/src/index' | grep -v grep | awk '{print $2}' || true)
    [ -z "$REMAINING" ] && break
    sleep 0.5
  done
fi

# Clean up stale PID file from previous instance
rm -f /tmp/shofferai-relay.pid

# Also stop the LaunchAgent daemon if running (it would restart and fight us)
if launchctl list 2>/dev/null | grep -q 'com.shofferai.relay'; then
  echo "⚠️  Stopping LaunchAgent relay daemon (manual mode takes priority)"
  launchctl bootout gui/$(id -u) ~/Library/LaunchAgents/com.shofferai.relay.plist 2>/dev/null || true
fi

# Check prerequisites
if ! command -v npx &> /dev/null; then
  echo "ERROR: npx not found. Install Node.js 20+"
  exit 1
fi

# Config — override via env vars
export RELAY_CLOUD_URL="${RELAY_CLOUD_URL:-wss://shofferai-27188185100.asia-south1.run.app/api/relay/ws}"
export RELAY_AUTH_TOKEN="${RELAY_AUTH_TOKEN:-shofferai-relay-2026}"
export POOL_SIZE="${POOL_SIZE:-3}"

echo "Cloud:      $RELAY_CLOUD_URL"
echo "Chrome:     1 warm slot (up to $POOL_SIZE on demand)"
echo "Profile:    Profile 3 (rsinghtomar3011@gmail.com)"
echo ""
echo "Press Ctrl+C to stop."
echo ""

# Start the relay (ChromePool is lazy — 1 warm Chrome, rest on demand)
cd "$ROOT"
exec npx tsx apps/playwright/src/index.ts
