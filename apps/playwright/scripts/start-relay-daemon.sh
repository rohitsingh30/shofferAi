#!/bin/bash
# start-relay-daemon.sh — Start the relay as a daemon (for LaunchAgent)
#
# ChromePool launches Chrome with --remote-debugging-port=0 (OS-assigned).
# No hardcoded ports. Connects outbound to Cloud Run (no tunnel needed).

set -e

cd /Users/rohit/shofferAi

# Load nvm/node if available (LaunchAgents don't get shell profile)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

# Fallback: add common node paths
export PATH="$HOME/.nvm/versions/node/$(ls "$HOME/.nvm/versions/node/" 2>/dev/null | tail -1)/bin:$PATH"
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"

# Config
CLOUD_URL="wss://shofferai-27188185100.asia-south1.run.app/api/relay/ws"

# Load .env for RELAY_AUTH_TOKEN
if [ -f /Users/rohit/shofferAi/.env ]; then
  export $(grep -E '^RELAY_AUTH_TOKEN=' /Users/rohit/shofferAi/.env | xargs)
fi
export RELAY_CLOUD_URL="$CLOUD_URL"
export RELAY_AUTH_TOKEN="${RELAY_AUTH_TOKEN:-}"
export POOL_SIZE="${POOL_SIZE:-3}"

echo "$(date) - ShofferAI Relay Daemon starting..."
echo "  Cloud URL: $CLOUD_URL"
echo "  Auth token: ${RELAY_AUTH_TOKEN:+SET}${RELAY_AUTH_TOKEN:-EMPTY}"
echo "  Pool size: $POOL_SIZE (1 warm, rest on demand)"

# Run the relay — ChromePool handles Chrome lifecycle (launch + cleanup)
exec npx tsx apps/playwright/src/index.ts
