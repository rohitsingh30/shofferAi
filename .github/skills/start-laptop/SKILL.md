---
name: start-laptop
description: Start the laptop relay (Chrome Pool + relay server) for browser automation, and optionally test parallel Chrome slots. Use this when asked to start the relay, start Chrome, prepare for browser automation, test Chrome Pool, or verify slot isolation.
---

This skill handles both starting the laptop infrastructure and testing multi-browser parallelism.

- **Start**: Launch Chrome Pool + Relay + Playwright MCP
- **Test**: Send parallel orders to verify 3 Chrome slots work independently

**What runs on the laptop:** Chrome Pool (signed-in Chrome instances) + Playwright MCP + Relay (connects to Cloud Run or listens locally).

See `docs/DEPLOYMENT.md` for the full Cloud Run vs Laptop architecture.

---

## Part 1: Start the Laptop Relay

### Step 1: Kill stale processes

Check and kill any existing processes on relay and Chrome ports:

```bash
for port in 9222 9223 9224 8765; do lsof -ti :$port | xargs kill -9 2>/dev/null; done
```

### Step 2: Check Chrome Debug is available

```bash
curl -s http://localhost:9222/json/version 2>/dev/null | python3 -c "import sys,json; print('Chrome OK:', json.load(sys.stdin)['Browser'])" 2>/dev/null || echo "Chrome Debug NOT running — will be started by ChromePool"
```

### Step 3: Start (Production — default)

The laptop connects OUTBOUND to Cloud Run via WSS. No Cloudflare Tunnel needed.

```bash
export RELAY_CLOUD_URL=wss://shofferai-27188185100.asia-south1.run.app/api/relay/ws
export RELAY_AUTH_TOKEN=shofferai-relay-2026
POOL_SIZE=3 npm run laptop
```

This launches:
- ChromePool with N Chrome instances (Profile 3: rsinghtomar3011@gmail.com)
- Playwright MCP process per Chrome
- **RelayOutbound**: connects OUT to Cloud Run via `RELAY_CLOUD_URL`

Expected log: `"Connected to Cloud Run — ready for tool calls."`

#### Local dev mode (only if needed)

Omit `RELAY_CLOUD_URL` to start in server mode instead:

```bash
POOL_SIZE=3 npm run laptop
# → RelayServer listens on ws://localhost:8765
# Then: cd apps/web && npx next dev
```

### Step 4: Verify

Wait 15 seconds for Chrome instances to boot, then:

```bash
# Check relay health
curl -s http://localhost:8765 2>/dev/null | python3 -m json.tool || echo "Relay not in server mode (outbound mode has no local HTTP)"
```

Verify each Chrome CDP:
```bash
for port in 9222 9223 9224; do
  echo -n "Port $port: "
  curl -s "http://localhost:$port/json/version" | python3 -c "import sys,json; print(json.load(sys.stdin)['Browser'])" 2>/dev/null || echo "DOWN"
done
```

For production mode, verify Cloud Run connection:
```bash
curl -s https://shofferai-27188185100.asia-south1.run.app/api/relay/health 2>/dev/null || echo "Check Cloud Run logs directly"
```

### Step 5: Report status

```
ShofferAI Laptop Relay
──────────────────────────────────────
Mode:        Outbound (prod) | Server (dev)
Cloud URL:   wss://... | N/A (local)
Pool:        N/N Chrome instances ready
Chrome:
  Slot 0 (9222): ✓ Chrome XXX | ✗ DOWN
  Slot 1 (9223): ✓ Chrome XXX | ✗ DOWN
  Slot 2 (9224): ✓ Chrome XXX | ✗ DOWN
Tools:       N Playwright MCP tools available
Connection:  ✓ Connected to Cloud Run | ✓ Listening on :8765
──────────────────────────────────────
```

---

## Part 2: Test Multi-Browser Parallel Slots

Test the Chrome Pool by spawning 3 independent orders and verifying each pool Chrome works on a different site with zero interference.

### Prerequisites

```bash
curl -s http://localhost:8765 | python3 -m json.tool  # Pool status
curl -s http://localhost:9225/json/version             # Test Chrome
curl -s http://localhost:3000                           # Next.js
```

If anything is down:
1. Run Part 1 above to start the relay
2. `cd apps/web && npx next dev` — chat UI on localhost:3000
3. Test Chrome on 9225 should already be running. If not:
   `/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9225 --user-data-dir="$HOME/Library/Application Support/Google/Chrome-Claude" --no-first-run --no-default-browser-check`

### MCP Tool Mapping

| MCP Server | Chrome Port | Role |
|------------|-------------|------|
| `playwright` (mcp__playwright__*) | 9225 | YOUR test browser — browse the chat UI only |
| `browser1` (mcp__browser1__*) | 9222 | AGENT's Chrome Slot 0 — observe only |
| `browser2` (mcp__browser2__*) | 9223 | AGENT's Chrome Slot 1 — observe only |
| `browser3` (mcp__browser3__*) | 9224 | AGENT's Chrome Slot 2 — observe only |

### Test Step 1: Open chat UI and login

Use `playwright` (port 9225) to browse the chat interface:

- **Local**: `http://localhost:3000/login`
- **Prod**: `https://shofferai-27188185100.asia-south1.run.app/login`

Login with Dev Login → land on dashboard.

### Test Step 2: Send 3 orders from 3 separate chat tabs

Using `playwright`, send each order in a NEW chat tab:

**Order 1** (in current tab):
```
Book a hotel in Goa for March 22-23 under 4000/night on Booking.com
```

**Order 2** (open new tab → localhost:3000/dashboard):
```
Order milk, bread and eggs from Blinkit to Sector 62 Noida
```

**Order 3** (open new tab → localhost:3000/dashboard):
```
Order butter chicken from Zomato to Sector 62 Noida
```

Each order creates a unique taskId/sessionId → the relay assigns each to a different Chrome Pool slot.

### Test Step 3: Verify slot assignment

```bash
curl -s http://localhost:8765 | python3 -m json.tool
```
Expected: `"busy": 3, "ready": 0`

### Test Step 4: Observe each pool Chrome independently

Snapshot all 3 pool browsers in ONE message (parallel):
```
mcp__browser1__browser_snapshot  → See what Slot 0 is doing
mcp__browser2__browser_snapshot  → See what Slot 1 is doing
mcp__browser3__browser_snapshot  → See what Slot 2 is doing
```

Each should be on a DIFFERENT website:
- One on booking.com (hotel search)
- One on blinkit.com (grocery search)
- One on zomato.com (food order)

### Test Step 5: Take screenshots as proof

Call all 3 in ONE message:
```
mcp__browser1__browser_take_screenshot({ filename: "slot0.png" })
mcp__browser2__browser_take_screenshot({ filename: "slot1.png" })
mcp__browser3__browser_take_screenshot({ filename: "slot2.png" })
```

### Test Step 6: Interact with agent prompts

When the agent asks questions via `ask_user` (dates, address, platform choice):
1. Switch to the correct chat tab in `playwright`
2. Answer the prompt
3. Then snapshot browser1/2/3 again to watch each Chrome execute the next step

Keep round-robining between the chat UI (playwright) and pool observations (browser1/2/3) until all 3 orders are progressing.

---

## Critical Rules

- **`playwright` = chat UI only** — NEVER browse localhost:3000 with browser1/2/3
- **browser1/2/3 = agent's windows** — you OBSERVE them, the agent CONTROLS them via the relay
- **Don't interfere** — clicking or navigating in browser1/2/3 will break the agent's flow
- **Each browser is isolated** — actions in Slot 0 never affect Slot 1 or Slot 2
- **Parallel calls** — always snapshot/screenshot all 3 browsers in ONE message for efficiency
- **If a slot shows about:blank** — the agent hasn't started browser work yet (still in LLM reasoning or ask_user)

## Troubleshooting

- **"Chrome CDP not responding"** → Profile data missing. Run `bash apps/playwright/scripts/setup-chrome-pool.sh 3`
- **"Slot X failed to initialize"** → Another Chrome on that port. Kill it: `lsof -ti :922X | xargs kill -9`
- **"No slots initialized"** → Chrome binary not found. Verify: `ls "/Applications/Google Chrome.app/"`
- **"Connection refused" to Cloud Run** → Check `RELAY_AUTH_TOKEN` matches Cloud Run's token. Mismatched tokens = silent rejection.
- **"WebSocket handshake failed"** → Cloud Run may need redeployment. Check if `custom-server.js` handles `/api/relay/ws` upgrade.
- **Auto-reconnect**: If Cloud Run restarts, RelayOutbound reconnects automatically (1s, 2s, 4s... max 30s backoff)
