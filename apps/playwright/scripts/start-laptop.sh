#!/bin/bash
# ShofferAI Laptop Relay Starter
#
# Starts ChromePool (3 Chrome windows, OS-assigned ports, signed-in Profile 3)
# and connects outbound to Cloud Run via WSS. No tunnel needed.
#
# Usage:
#   ./start-laptop.sh              # Start relay (connects to prod Cloud Run)
#   POOL_SIZE=5 ./start-laptop.sh  # Custom pool size
#
# ChromePool handles everything:
#   - Launches N Chrome instances with --remote-debugging-port=0 (OS picks port)
#   - Parses actual port from Chrome's stderr
#   - Connects Playwright MCP to each Chrome instance
#   - Session isolation via slot assignment

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

echo "Cloud:     $RELAY_CLOUD_URL"
echo "Pool size: $POOL_SIZE Chrome instances"
echo "Profile:   Profile 3 (rsinghtomar3011@gmail.com)"
echo ""
echo "ChromePool will launch $POOL_SIZE Chrome windows with OS-assigned ports."
echo "Press Ctrl+C to stop."
echo ""

# Start the relay (ChromePool launches Chrome instances internally)
cd "$ROOT"
exec npx tsx apps/playwright/src/index.ts
