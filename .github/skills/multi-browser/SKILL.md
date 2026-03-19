---
name: multi-browser
description: Control 3 independent Chrome windows simultaneously for parallel testing
---

Test the Chrome Pool by spawning 3 independent orders from the chat UI and verifying each pool Chrome works on a different site with zero interference.

## Prerequisites

Before using this skill, check what's running:

```bash
curl -s http://localhost:8765 | python3 -m json.tool  # Pool status
curl -s http://localhost:9225/json/version             # Test Chrome
curl -s http://localhost:3000                           # Next.js
```

If anything is down, restart:
1. `POOL_SIZE=3 npm run laptop` — launches 3 Chrome windows (9222/9223/9224) + relay on 8765
2. `cd apps/web && npx next dev` — chat UI on localhost:3000
3. Launch a **fresh Chrome window** for the `playwright` MCP on an empty port, signed in as `rsinghtomar3011@gmail.com`:
   ```bash
   PORT=9225
   while lsof -ti :$PORT >/dev/null 2>&1; do PORT=$((PORT + 1)); done
   /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
     --remote-debugging-port=$PORT \
     --user-data-dir="$HOME/Library/Application Support/Google/Chrome-Debug-$PORT" \
     --profile-directory="Profile 3" \
     --no-first-run --no-default-browser-check &
   ```
   ⚠️ **Always find an empty port and launch a NEW window** — never reuse existing. Connect Playwright MCP: `npx -y @playwright/mcp@latest --cdp-endpoint http://localhost:$PORT`

## MCP Tool Mapping

You have 4 Playwright MCP connections:

| MCP Server | Chrome Port | Role |
|------------|-------------|------|
| `playwright` (mcp__playwright__*) | 9225 | YOUR test browser — browse the chat UI only (Profile 3: rsinghtomar3011@gmail.com) |
| `browser1` (mcp__browser1__*) | 9222 | AGENT's Chrome Slot 0 — observe only |
| `browser2` (mcp__browser2__*) | 9223 | AGENT's Chrome Slot 1 — observe only |
| `browser3` (mcp__browser3__*) | 9224 | AGENT's Chrome Slot 2 — observe only |

## Execution Steps

### Step 1: Open chat UI and login

Use `playwright` (port 9225) to browse the chat interface:

- **Local**: `http://localhost:3000/login`
- **Prod**: `https://shofferai-27188185100.asia-south1.run.app/login`
  (Prod requires relay tunnel: `cloudflared tunnel --url http://localhost:8765`)

Login with Dev Login → land on dashboard.

### Step 2: Send 3 orders from 3 separate chat tabs

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

### Step 3: Verify slot assignment

Check the relay health endpoint:
```bash
curl -s http://localhost:8765 | python3 -m json.tool
```
Expected: `"busy": 3, "ready": 0`

### Step 4: Observe each pool Chrome independently

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

### Step 5: Take screenshots as proof

Call all 3 in ONE message:
```
mcp__browser1__browser_take_screenshot({ filename: "slot0.png" })
mcp__browser2__browser_take_screenshot({ filename: "slot1.png" })
mcp__browser3__browser_take_screenshot({ filename: "slot2.png" })
```

### Step 6: Interact with agent prompts

When the agent asks questions via `ask_user` (dates, address, platform choice):
1. Switch to the correct chat tab in `playwright`
2. Answer the prompt
3. Then snapshot browser1/2/3 again to watch each Chrome execute the next step

Keep round-robining between the chat UI (playwright) and pool observations (browser1/2/3) until all 3 orders are progressing.

## Critical Rules

- **`playwright` = chat UI only** — NEVER browse localhost:3000 with browser1/2/3
- **browser1/2/3 = agent's windows** — you OBSERVE them, the agent CONTROLS them via the relay
- **Don't interfere** — clicking or navigating in browser1/2/3 will break the agent's flow
- **Each browser is isolated** — actions in Slot 0 never affect Slot 1 or Slot 2
- **Parallel calls** — always snapshot/screenshot all 3 browsers in ONE message for efficiency
- **If a slot shows about:blank** — the agent hasn't started browser work yet (still in LLM reasoning or ask_user)
