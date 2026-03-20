---
name: start-laptop
description: Start the laptop relay (Chrome Pool + relay server) for browser automation, and optionally test parallel Chrome slots. Use this when asked to start the relay, start Chrome, prepare for browser automation, test Chrome Pool, or verify slot isolation.
---

This skill starts the laptop relay infrastructure. ChromePool is lazy — it launches Chrome on demand, not upfront.

- **Start**: Launch relay service (ChromePool boots 1 warm Chrome, rest on demand)
- **Test**: Verify relay is connected and Chrome can be launched

**What runs on the laptop:** ChromePool (lazy Chrome management) + Playwright MCP + Relay (connects to Cloud Run or listens locally).

See `docs/DEPLOYMENT.md` for the full Cloud Run vs Laptop architecture.

---

## Part 1: Start the Laptop Relay

### Step 1: Kill stale processes

Check and kill any existing relay processes:

```bash
# Find and kill stale relay processes
ps aux | grep 'tsx.*src/index' | grep -v grep | awk '{print $2}' | xargs kill 2>/dev/null || true
```

### Step 2: Start (Production — default)

The laptop connects OUTBOUND to Cloud Run via WSS. No Cloudflare Tunnel needed.

```bash
./apps/playwright/scripts/start-laptop.sh
```

This launches:
- ChromePool in lazy mode (1 warm Chrome for tool discovery, rest on demand)
- Chrome uses Profile 3: rsinghtomar3011@gmail.com, OS-assigned port
- **RelayOutbound**: connects OUT to Cloud Run

Expected log: `"Chrome Pool ready (lazy mode — Chrome launches on demand)"`

#### Local dev mode (only if needed)

Unset `RELAY_CLOUD_URL` before running start-laptop.sh:

```bash
unset RELAY_CLOUD_URL
./apps/playwright/scripts/start-laptop.sh
# → RelayServer listens on ws://localhost:8765 (server mode only)
# → TaskManager bridge on dynamic port (9400-9499, printed in logs)
# Then: cd apps/web && npx next dev
```

### Step 3: Verify

The operator verifies by checking the relay startup logs in the terminal where the script was launched. Bridge and MCP log ports are dynamic (9400-9499 range) and printed in the startup output.

```bash
# Server mode only (dev without RELAY_CLOUD_URL): RelayServer on port 8765
curl -s http://localhost:8765 2>/dev/null | python3 -m json.tool && echo "(server mode)" || true

# Production: check Cloud Run health
curl -s https://shofferai-27188185100.asia-south1.run.app/api/relay/health 2>/dev/null || echo "Check Cloud Run logs directly"
```

### Step 4: Report status

```
ShofferAI Laptop Relay
──────────────────────────────────────
Mode:        Outbound (prod) | Server (dev)
Cloud URL:   wss://... | N/A (local)
Pool:        lazy (max N slots, M active)
Tools:       22 Playwright MCP tools available
Connection:  ✓ Connected to Cloud Run | ✓ Listening on :8765 (server mode)
TaskManager: ✓ Bridge WS on :<dynamic port>
──────────────────────────────────────
```

---

## Troubleshooting

- **"Chrome didn't report a CDP port"** → Chrome binary issue. Verify: `ls "/Applications/Google Chrome.app/"`
- **"Source profile not found"** → Base Chrome-Debug dir missing. Create it by launching Chrome once with `--user-data-dir="$HOME/Library/Application Support/Google/Chrome-Debug" --profile-directory="Profile 3"`
- **"Connection refused" to Cloud Run** → Check `RELAY_AUTH_TOKEN` matches Cloud Run's token
- **Auto-reconnect**: If Cloud Run restarts, RelayOutbound reconnects automatically (1s, 2s, 4s... max 30s backoff)
