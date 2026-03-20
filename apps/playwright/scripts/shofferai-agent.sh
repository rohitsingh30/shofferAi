#!/bin/bash
# shofferai-agent.sh — Run a ShofferAI task using Claude Code + Playwright MCP
#
# Each invocation spawns its OWN Chrome window on a unique CDP port.
# Chrome uses a copy of the signed-in Profile 3 for authenticated sessions.
# After the task completes, the Chrome instance is killed and cleaned up.
#
# For parallel execution, run multiple instances:
#   ./shofferai-agent.sh "Book a hotel in Goa on Booking.com" &
#   ./shofferai-agent.sh "Order milk from Blinkit" &
#   ./shofferai-agent.sh "Order butter chicken from Zomato" &
#   wait
#
# Usage:
#   ./shofferai-agent.sh "<task description>"
#   ./shofferai-agent.sh "<task description>" [model]
#
# Environment:
#   CDP_PORT    Override the auto-assigned port (default: auto 9300+)
#   CHROME_PATH Override Chrome binary path
#
# Examples:
#   ./shofferai-agent.sh "Book cheapest hotel in Goa for March 22-23 on Booking.com"
#   ./shofferai-agent.sh "Order milk, bread, eggs from Blinkit to Sector 62 Noida" sonnet
#   MODEL=opus ./shofferai-agent.sh "Search for wireless earbuds under 2000 on Flipkart"

set -euo pipefail

TASK="${1:?Usage: $0 '<task description>' [model]}"
MODEL="${2:-${MODEL:-sonnet}}"
CHROME_PATH="${CHROME_PATH:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
SOURCE_PROFILE="${HOME}/Library/Application Support/Google/Chrome-Debug"
TEMP_DIR=""
CHROME_PID=""

# Auto-assign a unique CDP port (9300-9399 range)
if [ -z "${CDP_PORT:-}" ]; then
  for PORT in $(seq 9300 9399); do
    if ! lsof -i ":${PORT}" > /dev/null 2>&1; then
      CDP_PORT="${PORT}"
      break
    fi
  done
  if [ -z "${CDP_PORT:-}" ]; then
    echo "ERROR: No free ports in 9300-9399 range"
    exit 1
  fi
fi

# Cleanup on exit — kill Chrome and remove temp profile
cleanup() {
  if [ -n "${CHROME_PID}" ] && kill -0 "${CHROME_PID}" 2>/dev/null; then
    kill "${CHROME_PID}" 2>/dev/null || true
    wait "${CHROME_PID}" 2>/dev/null || true
  fi
  if [ -n "${TEMP_DIR}" ] && [ -d "${TEMP_DIR}" ]; then
    rm -rf "${TEMP_DIR}"
  fi
}
trap cleanup EXIT INT TERM

# Create temp Chrome profile directory with session data from Profile 3
TEMP_DIR=$(mktemp -d -t shofferai-chrome-XXXXXX)
PROFILE_DIR="${TEMP_DIR}/Profile 3"
mkdir -p "${PROFILE_DIR}"

# Copy session files from the signed-in profile
SOURCE="${SOURCE_PROFILE}/Profile 3"
if [ -d "${SOURCE}" ]; then
  for FILE in Cookies Cookies-journal "Login Data" "Login Data-journal" \
              "Web Data" "Web Data-journal" Preferences "Secure Preferences"; do
    [ -f "${SOURCE}/${FILE}" ] && cp "${SOURCE}/${FILE}" "${PROFILE_DIR}/" 2>/dev/null || true
  done
  for DIR in "Session Storage" "Local Storage" IndexedDB Accounts Network; do
    [ -d "${SOURCE}/${DIR}" ] && cp -r "${SOURCE}/${DIR}" "${PROFILE_DIR}/" 2>/dev/null || true
  done
fi

# Launch Chrome with its own window, profile, and CDP port
"${CHROME_PATH}" \
  --remote-debugging-port="${CDP_PORT}" \
  --remote-debugging-address=127.0.0.1 \
  --user-data-dir="${TEMP_DIR}" \
  --profile-directory="Profile 3" \
  --no-first-run \
  --no-default-browser-check \
  --disable-blink-features=AutomationControlled \
  --disable-sync \
  --disable-default-apps \
  > /dev/null 2>&1 &
CHROME_PID=$!

# Wait for CDP to be ready
for i in $(seq 1 30); do
  if curl -sf "http://localhost:${CDP_PORT}/json/version" > /dev/null 2>&1; then
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "ERROR: Chrome failed to start on port ${CDP_PORT}"
    exit 1
  fi
  sleep 1
done

echo "=== ShofferAI Agent ==="
echo "Task:   ${TASK}"
echo "Chrome: http://localhost:${CDP_PORT} (PID: ${CHROME_PID})"
echo "Model:  ${MODEL}"
echo "========================"
echo ""

# System prompt for the agent
SYSTEM_PROMPT="You are ShofferAI, an AI assistant that executes real browser tasks.

You have Playwright MCP tools to control a Chrome browser.
Chrome is pre-authenticated as rsinghtomar3011@gmail.com (Booking.com Genius account).

RULES:
1. ALWAYS open a new tab first before navigating to any website
2. Do NOT login — Chrome is already signed in
3. Be concise — report what you see and do
4. If you need user input (OTP, choice), output the question clearly
5. Before any irreversible action (order, payment), ask for confirmation
6. Use browser_snapshot to read pages, browser_click to click, browser_type to type
7. Use browser_navigate to go to URLs
8. Use browser_tabs to manage tabs"

# Run Claude agent with its own Playwright MCP connected to this Chrome instance
claude -p "${TASK}" \
  --model "${MODEL}" \
  --append-system-prompt "${SYSTEM_PROMPT}" \
  --mcp-config "{\"mcpServers\":{\"playwright\":{\"type\":\"stdio\",\"command\":\"playwright-mcp\",\"args\":[\"--cdp-endpoint\",\"http://127.0.0.1:${CDP_PORT}\",\"--output-dir\",\"/tmp/playwright-mcp-output\"]}}}" \
  --allowedTools "mcp__playwright__browser_navigate mcp__playwright__browser_snapshot mcp__playwright__browser_click mcp__playwright__browser_type mcp__playwright__browser_tabs mcp__playwright__browser_press_key mcp__playwright__browser_select_option mcp__playwright__browser_fill_form mcp__playwright__browser_hover mcp__playwright__browser_drag mcp__playwright__browser_wait_for mcp__playwright__browser_take_screenshot mcp__playwright__browser_handle_dialog mcp__playwright__browser_console_messages mcp__playwright__browser_navigate_back mcp__playwright__browser_network_requests mcp__playwright__browser_evaluate mcp__playwright__browser_file_upload mcp__playwright__browser_run_code mcp__playwright__browser_resize mcp__playwright__browser_close" \
  --dangerously-skip-permissions

# Chrome and temp profile are cleaned up by the trap
