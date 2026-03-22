# ShofferAI — Compiled Script Architecture

> **Last Updated**: March 22, 2026
> **Status**: Existing pipeline works for Tier 1. Tier 2 (loop scripts) being built.

---

## 1. Why Compiled Scripts?

The browser agent uses an LLM (Claude Sonnet) for every click, type, and navigation — 15-30 LLM calls per task. Each call is ~0.5-2s. Total: 2-6 minutes.

Compiled scripts replace the LLM with **native Playwright JavaScript**. Same clicks, same selectors, zero LLM calls. Execution: 10-60 seconds.

```
WITHOUT compiled script:
  LLM: "I see a search box" → tool: browser_type("Goa") → LLM: "I see results"
  → tool: browser_click(hotel) → LLM: "I see room options" → tool: browser_click(room)
  → ... 25 more rounds ... → 6 minutes

WITH compiled script:
  page.fill('#search', params.destination)
  page.click('[data-testid="search-button"]')
  page.click('[data-testid="property-card"]:first-child')
  → ... all scripted ... → 15 seconds
```

---

## 2. The Three-Tier Model

Not all skills can be compiled the same way. We use three tiers:

```
┌─────────────────────────────────────────────────────────────┐
│ TIER 1: FULLY COMPILABLE                                     │
│ Flow is deterministic. Params fully define every action.     │
│                                                              │
│ Examples: Hotel booking, flight search, recharge, bill pay   │
│ Method: Auto-record with ScriptRecorder, auto-compile        │
│ Speed: 6min → 10-30s                                         │
│ Count: ~80 of 500 skills                                     │
│                                                              │
│ How it works:                                                │
│   User says "Book hotel in Goa Mar 15-20"                    │
│   → ParamExtractor: {destination:"Goa", checkin, checkout}   │
│   → Compiled script runs with those params                   │
│   → Interactive pauses only for: room selection, payment     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ TIER 2: LOOP SCRIPTS (hand-written templates)                │
│ Flow has a REPEATING PATTERN with user choices mid-loop.     │
│                                                              │
│ Examples: Grocery ordering, food ordering, shopping          │
│ Method: Hand-written Playwright JS with loop + ask_user      │
│ Speed: 6min → 30-60s                                         │
│ Count: ~100 skills (but 80% of real-world usage)             │
│                                                              │
│ Why not auto-record?                                         │
│   - Variable item count (1 item vs 15 items)                │
│   - Dynamic search results (different products each time)    │
│   - User picks variants at runtime (which milk? what size?)  │
│   - Conditional logic (item not found, out of stock)         │
│                                                              │
│ How it works:                                                │
│   User says "Order milk, bread, eggs from BigBasket"         │
│   → ParamExtractor: {items:["milk","bread","eggs"]}          │
│   → Script loops: for each item → search → scrape results   │
│     → ask_user "which variant?" → add to cart → next item   │
│   → Checkout with confirm_action                             │
│   Navigation is SCRIPTED (instant). Decisions are INTERACTIVE│
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ TIER 3: ORCHESTRATION (compose Tier 1/2 scripts)             │
│ Multi-site or complex tasks that combine existing scripts.   │
│                                                              │
│ Examples: "Cheapest flight across MakeMyTrip AND Cleartrip"  │
│ Method: Thin LLM layer picks scripts, runs them, compares   │
│ Speed: 2x single script time (parallel possible)             │
│ Count: Anything that combines existing skills                │
│                                                              │
│ How it works:                                                │
│   LLM call: "Run makemytrip-flight.js + cleartrip-flight.js │
│              with same params, compare results"               │
│   → Both scripts run (could be parallel with 2 Chrome slots) │
│   → Results compared → user sees "Cleartrip ₹4,200 wins"    │
│   The LLM NEVER touches a browser — it just orchestrates.   │
└─────────────────────────────────────────────────────────────┘
```

**Key insight**: Every site gets scripted once. The LLM's job shrinks from "navigate websites from scratch" to "decide which scripts to run and compare results."

---

## 3. Existing Pipeline (Tier 1)

### Record → Compile → Replay

```
First run (LLM-driven):
  AgentExecutor → LLM → MCP tool calls
    ↓
  ScriptRecorder captures every tool call
    ↓
  ScriptCompiler generates native Playwright JS
    ↓
  ScriptStore saves to compiled/{skillId}.generated.js

Next run (instant):
  ScriptPlayer detects compiled script exists
    ↓
  Spawns: node compiled-script.js '{"destination":"Goa",...}'
    ↓
  Script runs (~10-30s, no LLM)
    ↓
  If script fails → automatic LLM fallback → re-records
```

### How parameterization works

The recorder detects dynamic values via three strategies:
1. **Exact match**: `"2026-03-15"` = param value → becomes `{{checkin}}`
2. **Substring match**: URL containing search term → `{{destination}}:substring`
3. **Date variant matching**: `"March 15"`, `"15 Mar"` all match `{{checkin}}:date`

The compiler converts `{{destination}}` → `params.destination` in generated JS.

### Interactive protocol (stdin/stdout JSON)

Compiled scripts pause for user decisions via JSON messages:

```
Script → stdout: {"type":"input_required","question":"Which room?","options":["A","B"]}
Player → calls ask_user callback → user picks "A"
Player → stdin:  {"type":"input","value":"A"}
Script resumes
```

Supported pause types:
| Type | Use Case |
|------|----------|
| `input_required` | OTP, variant selection, freetext |
| `confirm_action` | "Place order?" yes/no |
| `fill_credential` | Inject password from encrypted vault |
| `payment_required` | Trigger Razorpay L2 payment panel |

### Key files

| File | Role |
|------|------|
| `packages/agent-core/src/scripts/recorder.ts` | Captures MCP tool calls during LLM execution |
| `packages/agent-core/src/scripts/compiler.ts` | RecordedAction[] → Playwright JS |
| `packages/agent-core/src/scripts/player.ts` | Executes compiled scripts as child processes |
| `packages/agent-core/src/scripts/store.ts` | Maps skillId → compiled script path |
| `packages/agent-core/src/scripts/script-template.ts` | Template for generated JS (CDP connect, helpers) |
| `packages/agent-core/src/scripts/template.ts` | Template binding detection (exact, substring, date) |
| `packages/agent-core/src/scripts/compiled/` | Directory of compiled .generated.js files |

### Currently compiled skills

| Skill | Lines | Params |
|-------|-------|--------|
| `booking-com-hotel` | 730 | destination, checkin, checkout, guests |
| `save-profile-address` | 152 | line1, pincode |

---

## 4. Tier 2: Loop Scripts (Hand-Written)

### Why hand-written?

The auto-recorder captures ONE linear path. Grocery ordering is inherently a **loop with branches**:

| Edge Case | Why Auto-Record Fails |
|-----------|----------------------|
| Variable item count (1 vs 15) | No loop support in compiler |
| Dynamic search results | Need runtime scrape + ask_user |
| Item not found (0 results) | No conditional logic |
| Out of stock mid-flow | Need fallback branch |
| Quantity (2x vs 1x) | Variable +/- button clicks |
| Budget filtering | Runtime price comparison |
| Delivery slot selection | Changes hourly, dynamic scrape |
| Min order value (₹99-149) | Conditional warning needed |
| Substitutions ("if no Amul...") | Fallback search loop |

### Architecture of a loop script

```javascript
// bigbasket-grocery.generated.js
// HAND-WRITTEN template, not auto-compiled

// ── Scripted: Login + location (same every time) ──
await loginIfNeeded(page);
await setDeliveryLocation(page, params.address);

// ── Loop: Search + pick + add (per item) ──
for (const item of params.items) {
  await page.fill('input[placeholder*="Search"]', item);
  await page.keyboard.press('Enter');
  await page.waitForSelector('.product-card');

  const products = await scrapeProducts(page);

  if (products.length === 0) {
    // Interactive: item not found
    await requestFromHost({
      type: 'message',
      content: `"${item}" not found on BigBasket. Skipping.`
    });
    continue;
  }

  // Interactive: user picks variant
  const choice = await requestFromHost({
    type: 'input_required',
    question: `Which ${item}?`,
    inputType: 'choice',
    options: products.map(p => `${p.name} - ₹${p.price}`)
  });

  // Scripted: add to cart (instant)
  await products[choice.index].addButton.click();
}

// ── Scripted: Checkout (same every time) ──
await navigateToCart(page);
const summary = await scrapeCartSummary(page);
await requestFromHost({ type: 'confirm_action', action: 'Place order?', details: summary });
await page.click('button:has-text("Place Order")');
```

**Key principle**: Navigation is SCRIPTED (instant, known selectors). Decisions are INTERACTIVE (ask_user pauses). The LLM is never involved.

### In progress

| Site | Status | Notes |
|------|--------|-------|
| BigBasket | 🔨 Building | Login + location + search loop + cart + checkout |
| Blinkit | 🔨 Building | Similar flow, different selectors, React Modal cart |

### Selectors source

Selectors come from:
1. **SKILL.md files** — step-by-step instructions with selector hints
2. **SITE_NOTES.md files** — crawled selector data (March 2026)
3. **crawl-results/*.json** — automated crawl output
4. **Manual verification** — always test against live site before shipping

---

## 5. Tier 3: Orchestration (PLANNED)

Multi-site tasks reuse Tier 1/2 scripts:

```
"Cheapest flight across MakeMyTrip AND Cleartrip"

  ┌──────────────────────────────────────┐
  │  ORCHESTRATOR (1 cheap LLM call)     │
  │  "Run both, compare results"         │
  └──────────┬───────────┬──────────────┘
             │           │
   ┌─────────▼───┐ ┌────▼─────────┐
   │ makemytrip- │ │ cleartrip-   │
   │ flight.js   │ │ flight.js    │
   │ (compiled)  │ │ (compiled)   │
   └──────┬──────┘ └──────┬───────┘
          │               │
          └───────┬───────┘
                  ▼
        Compare → show user
```

The orchestration layer doesn't exist yet. When built, it will:
1. Parse user intent → identify which scripts to run
2. Extract params once → pass to each script
3. Run scripts (parallel if multiple Chrome slots available)
4. Merge/compare results → present to user

---

## 6. Testing Compiled Scripts

### Manual testing
```bash
# Run a compiled script directly
node packages/agent-core/src/scripts/compiled/booking-com-hotel.generated.js \
  '{"destination":"Goa","checkin":"2026-04-01","checkout":"2026-04-03","guests":"2"}' \
  '{"cdpUrl":"http://127.0.0.1:PORT"}'
```

### Dev-loop mode B (record new scripts)
Use the `dev-loop` skill with mode B to record a new skill execution and auto-compile.

### Fallback guarantee
If a compiled script fails at any point:
1. ScriptPlayer catches the error
2. Falls back to full LLM-driven execution
3. If LLM succeeds, re-records and re-compiles (self-healing)

---

## 7. Rules

1. **Never hardcode user data** — all user-specific values must be params or interactive
2. **Never skip ask_user for choices** — users must always pick their own variants
3. **Always test against live site** — selectors change, scripts must be verified
4. **Fallback is mandatory** — every compiled script must gracefully fail to LLM mode
5. **Credential injection via vault only** — never put passwords in scripts
6. **One Chrome instance per script** — never share browser windows
7. **Screenshots on error** — always capture state when script fails
