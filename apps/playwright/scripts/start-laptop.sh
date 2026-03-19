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
