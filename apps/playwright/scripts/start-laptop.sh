#!/bin/bash
# ShofferAI Laptop Relay Starter
# Starts: Chrome Debug (CDP) → Playwright Runner (relay) → Cloudflare Tunnel

set -e

echo "=== ShofferAI Laptop Relay ==="
echo ""

# Check prerequisites
if ! command -v cloudflared &> /dev/null; then
  echo "ERROR: cloudflared not found. Install with: brew install cloudflared"
  exit 1
fi

if ! command -v npx &> /dev/null; then
  echo "ERROR: npx not found. Install Node.js 20+"
  exit 1
fi

# Step 1: Ensure Chrome Debug is running with Profile 3
CDP_PORT=${CDP_PORT:-9222}
echo "Checking Chrome Debug on port $CDP_PORT..."
if ! curl -s "http://localhost:${CDP_PORT}/json/version" > /dev/null 2>&1; then
  echo "Chrome Debug not running. Starting it..."
  DIR="$(cd "$(dirname "$0")" && pwd)"
  "$DIR/start-debug-chrome.sh" &
  sleep 3
  if ! curl -s "http://localhost:${CDP_PORT}/json/version" > /dev/null 2>&1; then
    echo "ERROR: Chrome Debug failed to start on port $CDP_PORT"
    exit 1
  fi
fi
echo "✓ Chrome Debug is running on port $CDP_PORT"

# Step 2: Generate relay auth token if not set
if [ -z "$RELAY_AUTH_TOKEN" ]; then
  export RELAY_AUTH_TOKEN=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  echo ""
  echo "Generated RELAY_AUTH_TOKEN: $RELAY_AUTH_TOKEN"
  echo ">>> SET THIS IN YOUR CLOUD RUN ENV VARS <<<"
  echo ""
fi

RELAY_PORT=${RELAY_PORT:-8765}
export CHROME_CDP_ENDPOINT="http://localhost:${CDP_PORT}"

# Step 3: Start relay server
echo "Starting relay server on port $RELAY_PORT..."
npm run start --workspace=@shofferai/playwright &
RELAY_PID=$!

sleep 3

# Step 4: Start Cloudflare Tunnel
echo ""
echo "Starting Cloudflare Tunnel..."
echo "The tunnel URL will appear below — copy it to RELAY_LAPTOP_URL in Cloud Run."
echo ""
cloudflared tunnel --url http://localhost:$RELAY_PORT &
TUNNEL_PID=$!

# Cleanup on exit
cleanup() {
  echo ""
  echo "Shutting down..."
  kill $RELAY_PID 2>/dev/null
  kill $TUNNEL_PID 2>/dev/null
  echo "Done."
}
trap cleanup EXIT SIGINT SIGTERM

# Wait for both processes
wait
