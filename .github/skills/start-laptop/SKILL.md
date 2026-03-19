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
| `playwright` (mcp__playwright__*) | 9225 | Single Chrome-Debug window with Profile 3 (rsinghtomar3011@gmail.com) |

### Test Step 1: Open chat UI and login

Use `playwright` (port 9225) to browse the chat interface:

- **Prod**: `https://shofferai-27188185100.asia-south1.run.app/login`
- **Local**: `http://localhost:3000/login`

The Chrome-Debug profile should already be logged in. If not, use Google OAuth.

### Test Step 2: Send a test order

Using `playwright`, send an order from the dashboard:
```
Book a hotel in Goa for this weekend under 4000/night on Booking.com
```

### Test Step 3: Verify relay connectivity

```bash
curl -s http://localhost:8765 | python3 -m json.tool
```

### Test Step 4: Observe agent execution

Take snapshots via `playwright` to watch the agent navigate the site.

---

## Critical Rules

- **Single browser** — only `playwright` MCP, connected to Chrome-Debug on port 9225
- **Profile 3** — always signed in as rsinghtomar3011@gmail.com
- **Don't interfere with agent tabs** — the agent opens new tabs for each task; don't close them

## Troubleshooting

- **"Chrome CDP not responding"** → Profile data missing. Run `bash apps/playwright/scripts/setup-chrome-pool.sh 3`
- **"Slot X failed to initialize"** → Another Chrome on that port. Kill it: `lsof -ti :922X | xargs kill -9`
- **"No slots initialized"** → Chrome binary not found. Verify: `ls "/Applications/Google Chrome.app/"`
- **"Connection refused" to Cloud Run** → Check `RELAY_AUTH_TOKEN` matches Cloud Run's token. Mismatched tokens = silent rejection.
- **"WebSocket handshake failed"** → Cloud Run may need redeployment. Check if `custom-server.js` handles `/api/relay/ws` upgrade.
- **Auto-reconnect**: If Cloud Run restarts, RelayOutbound reconnects automatically (1s, 2s, 4s... max 30s backoff)
