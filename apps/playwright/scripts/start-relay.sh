#!/bin/bash
# start-relay.sh — Start Chrome Pool relay + Cloudflare tunnel + update Cloud Run
#
# Usage: bash apps/playwright/scripts/start-relay.sh [pool_size]
#
# This script:
# 1. Starts Chrome Pool relay on port 8765
# 2. Starts a Cloudflare quick tunnel
# 3. Automatically updates Cloud Run with the new tunnel URL
# 4. Keeps everything running until Ctrl+C

set -euo pipefail

POOL_SIZE="${1:-2}"
RELAY_PORT="${RELAY_PORT:-8765}"
CLOUD_RUN_SERVICE="${CLOUD_RUN_SERVICE:-shofferai}"
CLOUD_RUN_REGION="${CLOUD_RUN_REGION:-asia-south1}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

cleanup() {
  echo -e "\n${YELLOW}Shutting down...${NC}"
  [ -n "${RELAY_PID:-}" ] && kill "$RELAY_PID" 2>/dev/null
  [ -n "${TUNNEL_PID:-}" ] && kill "$TUNNEL_PID" 2>/dev/null
  [ -f /tmp/shofferai-tunnel.log ] && rm -f /tmp/shofferai-tunnel.log
  echo -e "${GREEN}Done.${NC}"
  exit 0
}
trap cleanup SIGINT SIGTERM

# Step 1: Verify Chrome-Debug is running
echo -e "${YELLOW}[1/4] Checking Chrome-Debug on port 9222...${NC}"
if ! curl -s http://127.0.0.1:9222/json/version > /dev/null 2>&1; then
  echo -e "${RED}Chrome-Debug not running on port 9222!${NC}"
  echo "Start it with: bash apps/playwright/scripts/setup-chrome-pool.sh"
  exit 1
fi
echo -e "${GREEN}Chrome-Debug is running.${NC}"

# Step 2: Start relay
echo -e "${YELLOW}[2/4] Starting Chrome Pool relay (${POOL_SIZE} slots) on port ${RELAY_PORT}...${NC}"
POOL_SIZE="$POOL_SIZE" npm run laptop > /tmp/shofferai-relay.log 2>&1 &
RELAY_PID=$!

# Wait for relay to be ready
for i in $(seq 1 30); do
  if curl -s "http://localhost:${RELAY_PORT}" > /dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! curl -s "http://localhost:${RELAY_PORT}" > /dev/null 2>&1; then
  echo -e "${RED}Relay failed to start! Check /tmp/shofferai-relay.log${NC}"
  exit 1
fi
echo -e "${GREEN}Relay ready on port ${RELAY_PORT}.${NC}"

# Step 3: Start Cloudflare quick tunnel
echo -e "${YELLOW}[3/4] Starting Cloudflare tunnel...${NC}"
cloudflared tunnel --url "http://localhost:${RELAY_PORT}" > /tmp/shofferai-tunnel.log 2>&1 &
TUNNEL_PID=$!

# Wait for tunnel URL
TUNNEL_URL=""
for i in $(seq 1 30); do
  TUNNEL_URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' /tmp/shofferai-tunnel.log 2>/dev/null | head -1)
  if [ -n "$TUNNEL_URL" ]; then
    break
  fi
  sleep 1
done

if [ -z "$TUNNEL_URL" ]; then
  echo -e "${RED}Tunnel failed to start! Check /tmp/shofferai-tunnel.log${NC}"
  kill "$RELAY_PID" 2>/dev/null
  exit 1
fi
echo -e "${GREEN}Tunnel: ${TUNNEL_URL}${NC}"

# Step 4: Update Cloud Run
WSS_URL="wss://$(echo "$TUNNEL_URL" | sed 's|https://||')"
echo -e "${YELLOW}[4/4] Updating Cloud Run with tunnel URL...${NC}"
gcloud run services update "$CLOUD_RUN_SERVICE" \
  --region="$CLOUD_RUN_REGION" \
  --update-env-vars="RELAY_LAPTOP_URL=${WSS_URL}" \
  --quiet 2>&1 | tail -3

echo ""
echo -e "${GREEN}=== ShofferAI Relay Ready ===${NC}"
echo -e "  Relay:   http://localhost:${RELAY_PORT}"
echo -e "  Tunnel:  ${TUNNEL_URL}"
echo -e "  Cloud:   ${WSS_URL}"
echo -e "  Pool:    ${POOL_SIZE} Chrome slots"
echo -e "  Prod:    https://shofferai-27188185100.asia-south1.run.app"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop.${NC}"

# Keep alive
wait "$RELAY_PID" "$TUNNEL_PID"
