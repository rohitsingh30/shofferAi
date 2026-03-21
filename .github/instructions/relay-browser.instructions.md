---
applyTo: "apps/playwright/**,apps/playwright/scripts/**"
---

# Browser Automation & Relay (apps/playwright/)

## Chrome Profile

- **Base dir**: `~/Library/Application Support/Google/Chrome-Debug`
- **Profile 3**: `rsinghtomar3011@gmail.com` (Booking.com Genius Level 1) — **always use this**
- Profile 1: rsinghtomar54@gmail.com (secondary)
- Profile 4: rohit30.iitkgp@gmail.com (wrong account, do not use)
- Cookies encrypted via macOS Keychain (per-user, not per-dir) — cloned dirs inherit all sessions

**If sessions expire:** Open base Chrome-Debug manually, sign in again. Future clones pick up new sessions.

## ChromePool

- **Lazy mode**: starts with 1 warm slot (tool discovery), rest launch on demand
- Each slot: copies session files → launches Chrome with `--remote-debugging-port=0` → parses port from stderr → connects MCPHost
- Slots auto-release after 15 min idle, Chrome torn down after 30 min unused
- Max slots: `POOL_SIZE` env var (default 3)
- Each `sessionId` maps to exactly one Chrome instance — tab isolation
- NEVER launch Chrome manually — ChromePool handles everything

## Playwright MCP Launch Rules

Every launch MUST include these flags:
- `--remote-debugging-port=0` — OS assigns ephemeral port, never hardcode
- `--output-dir /tmp/playwright-mcp-output` — screenshots never go to CWD/repo root
- Use globally-installed `playwright-mcp` binary — NEVER `npx @playwright/mcp@latest`
- Update with: `./apps/playwright/scripts/update-playwright-mcp.sh`

Launch paths (all must follow above rules):
- `mcp-host.ts` — ChromePool relay
- `claude-agent-spawner.ts` — Copilot CLI spawner
- `shofferai-agent.sh` — standalone agent
- `lazy-playwright-proxy.mjs` → `playwright-mcp-with-chrome.sh` — Copilot CLI (via lazy proxy)

## Relay Modes

| Env Var | Mode | Who Connects | Use Case |
|---------|------|-------------|----------|
| `RELAY_CLOUD_URL` set | **Outbound** | Laptop → Cloud Run (WSS) | Production |
| `RELAY_CLOUD_URL` not set | **Server** | Cloud Run → Laptop (WS :8765) | Local dev |

- Both modes: TaskManager bridge on dynamic port (9400-9499, printed in logs)
- Relay status check: `lsof -iTCP -sTCP:LISTEN -P 2>/dev/null | grep -E ":(9[0-4][0-9]{2})"`
- Do NOT trust `/tmp/shofferai-relay.log` — may be from previous run
- `start-laptop.sh` writes to terminal stdout, not to log file
- RelayOutbound auto-reconnects with exponential backoff (1s → 2s → 4s... max 30s)

## Site-Specific Selectors

### Booking.com
```
[data-testid="property-card"]              — hotel search result card
[data-testid="title"]                      — hotel name in card
[data-testid="price-and-discounted-price"] — price in card
[data-testid="review-score"]               — review score in card
[data-testid="title-link"]                 — hotel detail link in card
[data-testid="user-details-firstname"]     — first name field
[data-testid="user-details-lastname"]      — last name field
[data-testid="user-details-email"]         — email field
[data-testid="phone-number-input"]         — phone field
```

### Blinkit Grocery Flow
1. Ask user for delivery address (via `ask_user`)
2. Open new tab → blinkit.com
3. Set delivery location (first thing — Blinkit shows location popup immediately)
4. Login with operator phone (8109137158) + OTP (goes to operator, not user)
5. **Login MUST happen before searching** — Blinkit blocks checkout without login
6. Search & add each item (user picks variants)
7. Review cart → `confirm_action` (no money yet)
8. Checkout → `confirm_action` (place order)
9. Min order usually ₹99-149 — warn user if below

## Key Rules

- IPv4 only — always `127.0.0.1`, never `localhost`
- Never hardcode ports — parse from stderr
- Never curl localhost to health-check — operator manages services
- Never use `open` command to launch browsers
- Every `sessionId` → exactly one Chrome instance
- **Only ONE relay instance may run at a time** — duplicates cause WebSocket flapping on Cloud Run. `start-laptop.sh` handles cleanup automatically.
- Never start, stop, or restart the relay — the operator manages it manually
