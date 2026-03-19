---
name: compile-skills
description: Browse each site live, record MCP actions, compile real Playwright scripts for all skills
---

Automatically browse each skill's website, record the real UI flow via Playwright MCP, and compile production-ready Playwright scripts with actual selectors.

## How It Works

```
For each skill (sequential):
  1. Read SKILL.md → extract siteUrl, params, steps
  2. Open site in browser1 (pool Chrome)
  3. Follow the SKILL.md steps using Playwright MCP
  4. Record every MCP action (navigate, click, type, snapshot)
  5. Compile recorded actions → native Playwright script
  6. Save to packages/agent-core/src/scripts/compiled/{skill-name}.ts
  7. Move to next skill
```

## Instructions

### Step 0: Launch a Dedicated Chrome Window & Verify Prerequisites

Before any Playwright MCP usage, launch a **fresh Chrome window** on an empty port, signed in as `rsinghtomar3011@gmail.com`:

```bash
# Find an empty port starting from 9225
PORT=9225
while lsof -ti :$PORT >/dev/null 2>&1; do PORT=$((PORT + 1)); done
echo "Using port $PORT"

# Launch NEW Chrome with Profile 3 (rsinghtomar3011@gmail.com)
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=$PORT \
  --user-data-dir="$HOME/Library/Application Support/Google/Chrome-Debug-$PORT" \
  --profile-directory="Profile 3" \
  --no-first-run --no-default-browser-check &

# Verify Chrome + Pool
sleep 3
curl -s http://localhost:$PORT/json/version            # Playwright MCP Chrome
curl -s http://localhost:8765 | python3 -m json.tool   # Pool running
curl -s http://localhost:9222/json/version              # Pool Chrome available
```

⚠️ **Never reuse an existing Chrome window** — always find an empty port and launch fresh. Then connect Playwright MCP: `npx -y @playwright/mcp@latest --cdp-endpoint http://localhost:$PORT`

If the pool is not running, use `/start-laptop` first.

### Step 1: Get the skill queue

```bash
ls packages/agent-core/src/skills/*/SKILL.md | wc -l
```

### Step 2: For EACH skill, do the following

Read the SKILL.md to get `siteUrl` and step instructions. Then:

**a) Navigate to the site:**
```
mcp__browser1__browser_navigate({ url: siteUrl })
```

**b) Take snapshot to see the page:**
```
mcp__browser1__browser_snapshot
```

**c) Follow SKILL.md steps:**
- Dismiss popups (cookie banners, app-install prompts, login walls)
- Verify login status (check for profile icon/name)
- Perform search if applicable (type in search bar, press Enter)
- Take snapshot of results
- Record all selectors you find (data-testid, aria-label, class names, text content)

**d) Record findings for the compiled script:**
For each page, note:
- Exact selectors for key elements (search bar, result cards, price, rating, buttons)
- Popup dismiss selectors
- Login check selectors
- Cart/checkout flow selectors
- Payment form selectors

**e) Update the compiled script:**
Read the existing `packages/agent-core/src/scripts/compiled/{skill-name}.ts` and replace generic selectors with the real ones discovered.

### Step 3: Track progress

After each skill, log:
```
✅ {skill-name} — {N} selectors recorded, script updated
```

Keep a running count: `X/500 skills compiled`

### Step 4: Batch by category

Process skills in category batches for efficiency (similar sites share selectors):

**Batch 1: Food delivery** (Zomato, Swiggy, Dominos, KFC, etc.)
**Batch 2: Grocery** (Blinkit, Zepto, BigBasket, JioMart, etc.)
**Batch 3: Shopping** (Amazon, Flipkart, Myntra, Nykaa, etc.)
**Batch 4: Travel** (Booking.com, MakeMyTrip, Goibibo, IRCTC, etc.)
**Batch 5: Bills** (Paytm, PhonePe, CRED, etc.)
**Batch 6: Services** (Urban Company, Practo, BookMyShow, etc.)
**Batch 7: Everything else**

### Step 5: Verify compiled scripts

After completing a batch:
```bash
npx turbo build --filter=@shofferai/agent-core
```

## Key Selectors to Record Per Site

| Element | What to look for |
|---------|-----------------|
| Search bar | `input[type="search"]`, `input[name="q"]`, `[data-testid*="search"]` |
| Result cards | `[data-testid*="card"]`, `[class*="result"]`, `[class*="product"]` |
| Price | `[data-testid*="price"]`, `[class*="price"]`, `[class*="amount"]` |
| Rating | `[data-testid*="rating"]`, `[class*="rating"]`, `[class*="star"]` |
| Add to cart | `button:has-text("Add")`, `[data-testid*="add-to-cart"]` |
| Cart icon | `[data-testid*="cart"]`, `[class*="cart"]`, `[aria-label*="cart"]` |
| Checkout | `button:has-text("Checkout")`, `button:has-text("Place Order")` |
| Login check | `[class*="profile"]`, `[class*="account"]`, `[data-testid*="user"]` |
| Popup close | `button[aria-label="Close"]`, `[class*="close"]`, `.modal button` |

## Important Rules

- Use `browser1` (port 9222) for browsing — NOT `playwright` (that's the test browser)
- Take snapshots frequently — they contain the real accessibility tree with selectors
- If a site requires login and the session expired, note it and move on
- Don't spend more than 3 minutes per skill — record what you can and move on
- Sites that are down or behind paywalls: skip and note
- Save progress frequently — don't lose work if something crashes
