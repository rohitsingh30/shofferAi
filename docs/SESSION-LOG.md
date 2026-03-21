# ShofferAI — Development Session Log

A running log of every Copilot CLI development session. Each entry captures what was done, key decisions, and files changed — so we can review, learn, and course-correct.

> **For the developer**: After each session, add notes on what worked / what didn't under the relevant entry. This feedback loop helps the AI improve across sessions.

## 2026-03-21 — Fix fake product cards + always confirm address & phone

**Goal**: Fix BigBasket (and all grocery/food skills) showing hallucinated product cards before browsing, and ensure address is always confirmed even when user provides a partial location.

**What was done**:
- **Bug 1 — Fake product cards**: SKILL.md Step 0 told LLM to show `card_grid` with emoji items/fake prices before browser visit. The `agent.ts` image validation had a bypass: `layout` sections with nested `card_grid` weren't checked.
  - Fixed `agent.ts` to validate card_grids inside `layout.sections[]`
  - Removed `card_grid` from Step 0 in 18 grocery SKILL.md files
- **Bug 2 — Skipping address**: When user said "deliver to Tellapur Hyderabad", agent treated it as complete address and skipped the address picker. Area name ≠ full delivery address.
  - Changed Step 0 to **always** show address picker (saved addresses + new address form)
  - Only skip if user provides FULL address with building, street, city, pincode, AND phone
  - Updated 24 grocery/food delivery skills
- Deployed and E2E verified on prod via Playwright MCP:
  - ✅ "order milk and eggs from bigbasket, deliver to Tellapur Hyderabad" → agent shows address picker with "Confirm your delivery address and phone for BigBasket:"
  - ✅ No fake product cards, no hallucinated prices
  - ✅ After address selection → handoff → browser opens BigBasket → real OTP prompt

**Files changed**:
- `packages/agent-core/src/agent.ts` (updated — layout section validation for nested card_grid/carousel)
- 24 grocery/food SKILL.md files (updated — Step 0: always confirm address & phone, no fake cards)
- `docs/REPEATING-MISTAKES.md` (updated — anti-pattern #31: fake product cards + layout bypass)

**Key decisions**:
- Address is ALWAYS confirmed for delivery orders — area names are not enough
- Phone is critical for delivery — address widget already captures it, skill just needs to trigger it
- `agent.ts` validation is systemic safety net; SKILL.md changes are per-skill prevention
- Two validation points needed: `agent.ts` (Cloud Run) + `bridge-mcp-server.ts` (relay/laptop)

**What worked / what didn't** *(fill in after review)*:
-

## 2026-03-21 — Cart UX E2E verified on prod (images + ProductCard + CartBar + L2 Panel)

**Goal**: Verify the entire cart UX pipeline on production — carousel with real images, ProductCard widget, CartBar, and L2 Cart Panel.

**What was done**:
- Discovered image validation was in the wrong place — `agent.ts` only covers Cloud Run LLM calls, but shopping flows use the **relay** path (Copilot CLI → bridge MCP → relay → frontend). The bridge-mcp-server.ts needed its own validation.
- Added image validation bounce-back in `apps/playwright/src/bridge-mcp-server.ts` — intercepts `ask_user` calls with carousel/card_grid/product_card that lack real `https://` image URLs, returns system message telling LLM to snapshot and extract real URLs.
- Fixed Playwright MCP browser recovery — killed stale playwright-mcp process (dead Chrome on port 60471), lazy proxy auto-respawned with fresh Chrome.
- Full E2E test on prod verified:
  - ✅ Carousel: 5 boAt products with **real Flipkart product images** (bounce-back worked!)
  - ✅ ProductCard: Image, store badge, price/MRP/discount, rating, delivery, color, spec chips, bank offers, Add to Cart button
  - ✅ CartBar: "1 item · Flipkart · ₹799 · View >" persistent bar above chat input
  - ✅ L2 Cart Panel: Split view with product row, qty ±, delete, line items, Total ₹799, "Proceed to Buy · ₹799", Razorpay footer

**Files changed**:
- `apps/playwright/src/bridge-mcp-server.ts` (updated — image validation for relay-side ask_user)

**Key decisions**:
- Image validation must exist in TWO places: `agent.ts` (Cloud Run LLM path) AND `bridge-mcp-server.ts` (laptop relay path). The relay path is the one used for all browser-based shopping flows.
- Lazy proxy's child process recovery: when playwright-mcp child dies (Chrome killed), proxy sets `child = null` and respawns on next `tools/call`. This was key to recovering the browser session.

**What worked / what didn't** *(fill in after review)*:
- 

## 2026-03-21 — Fix fake product cards in grocery skills + layout validation bypass

**Goal**: BigBasket (and other grocery skills) were showing hallucinated product cards with fake prices/images before the browser agent ever visited the website. The intermediate image validation layer had a bypass hole for `layout` sections.

**What was done**:
- Diagnosed root cause: SKILL.md Step 0 instructed LLM to show `card_grid` with fake data; `agent.ts` validation only checked top-level `input_type`, missing `card_grid` nested inside `layout` sections
- Fixed `agent.ts` image validation to also inspect `layout.sections[]` for card_grids/carousels without real image URLs
- Rewrote BigBasket SKILL.md Step 0: address-only, no item collection, no fake product cards
- Batch-fixed 17 other grocery SKILL.md files with the same pattern (amazon-fresh, zepto, swiggy-instamart, dmart, flipkart-grocery, etc.)
- Deployed to prod, verified via Playwright MCP: agent correctly asks only for address, extracts items from message, hands off to browser immediately

**Files changed**:
- `packages/agent-core/src/agent.ts` (updated — layout section validation for card_grid/carousel image URLs)
- `packages/agent-core/src/skills/bigbasket-grocery/SKILL.md` (updated — Step 0 address-only, merged Step 1)
- 17 other grocery SKILL.md files (updated — same Step 0 fix)
- `docs/REPEATING-MISTAKES.md` (updated — added anti-pattern #31)

**Key decisions**:
- Step 0 should ONLY collect delivery address — items extracted from user's message, real product data only from browser agent
- `agent.ts` validation is the systemic safety net; SKILL.md changes are the per-skill fix
- Removed `card_grid` entirely from Step 0 rather than keeping it with emoji-only (user chose cleanest option)

**What worked / what didn't** *(fill in after review)*:
-

## 2026-03-21 — Fix Chrome zombie windows on task cancellation

**Goal**: When a user presses "New Chat" or closes the tab mid-task, Chrome windows lingered as zombies. Fix `cleanupTask()` to actually kill stopped Chrome processes.

**What was done**:
- **First attempt (wrong)**: Added `chromePool.releaseSlot(sessionId)` to `cleanupTask()` — but per-task Chrome is launched by `playwright-mcp-with-chrome.sh`, NOT by ChromePool. This did nothing.
- **Root cause found**: `cleanupTask()` sent `SIGTERM` to the process group, but the CLI was in `SIGSTOP` state (paused for `ask_user`). Stopped processes **silently ignore SIGTERM**. Chrome shares the same process group as the CLI, so it survived too.
- **Actual fix**: Send `SIGCONT` immediately before `SIGTERM` in `cleanupTask()` itself (line 678-679 in compiled output). This resumes the process group before killing it.
- Removed the `chromePool.releaseSlot()` call (wrong approach)
- Kept `sessionId` on `RunningTask` and `chromePool` on `TaskManagerOptions` (useful for future ChromePool integration)
- Cleaned up 6+ orphaned `gh copilot` processes with stuck Chrome windows from previous runs
- Verified: `SIGCONT` + `SIGTERM` on process group kills both CLI and its Chrome child

**Files changed**:
- `apps/playwright/src/task-manager.ts` (updated — SIGCONT before SIGTERM in cleanupTask)
- `docs/ARCHITECTURE.md` (updated — cancellation cleanup in tab isolation section)
- `docs/REPEATING-MISTAKES.md` (updated — entry #29 with correct root cause)

**Key decisions**:
- Per-task Chrome is NOT managed by ChromePool — it shares the CLI's process group (PGID)
- `cleanupTask()` must be self-contained: SIGCONT+SIGTERM, don't rely on caller
- `proc.unref()` + `detached: true` means if TaskManager restarts, orphans are invisible — future work needed for orphan reaping

**What worked / what didn't** *(fill in after review)*:
-

## 2026-03-21 — Eliminate vanishing messages (async rewriter race + missing complete display)

**Goal**: Fix agent messages that appear then vanish, and ensure errors always show with trackable codes.

**What was done**:
- **Bug 1 (prior fix)**: Removed client-side `shouldSuppressMessage()` double-filter that false-positived on rewritten messages
- **Bug 2 (prior fix)**: Replaced `Date.now().toString()` message IDs with unique `msg-{ts}-{random}` to prevent React key collisions
- **Bug 3 (this fix)**: Fixed async rewriter race condition — `onMessage()` fired async rewriter `.then()` but `onComplete()`/`finally` closed the stream before rewriter finished → `send()` wrote to dead stream
- **Bug 4 (this fix)**: Frontend `case 'complete'` only did `setCurrentSteps([])` — never showed the summary text to the user
- Added `pendingRewrites[]` tracking — all rewrite promises flushed with `Promise.allSettled()` before `controller.close()` in all 3 close paths (finally, task_complete, task_error)
- Frontend `complete` event now displays summary as assistant message
- Frontend `error` event shows error code + taskId suffix for task-analyser lookup (e.g. `AGENT_ERROR:g636xk38`)
- All SSE error/complete events include `taskId` and `code` field
- Added rewriter error fallback — sends original message if LLM fails

**Files changed**:
- `apps/web/app/api/agent/execute/route.ts` (updated — pendingRewrites flush, error codes, taskId in events)
- `apps/web/components/chat/ChatInterface.tsx` (updated — complete shows summary, error shows code+taskId)

**Key decisions**:
- Error codes: `AGENT_ERROR` (LLM), `BROWSER_ERROR` (relay), `FATAL_ERROR` (crash)
- TaskId last 8 chars in error display — enough for task-analyser lookup
- `Promise.allSettled` (not `Promise.all`) — one failed rewrite shouldn't block others
- Server-side two-tier filter remains authoritative — no client-side double-check

**What worked / what didn't** *(fill in after review)*:
-

**Goal**: Build an LLM-powered InputEnricher to transform bare text `ask_user` calls from the laptop CLI into structured UI widgets (card_grid, product_card, carousel), and verify the full SIGSTOP/SIGCONT freeze/resume cycle works end-to-end on prod.

**What was done**:
- Verified SIGSTOP/SIGCONT works: all ~20 processes in the spawned process group (copilot, Chrome, bridge MCP, esbuild) freeze on `ask_user` and resume on user response
- Diagnosed bare `ask_user` issue: laptop CLI sends plain text instead of structured `product_card`/`carousel` types despite SKILL.md instructions
- Built `InputEnricher` — cloud-side LLM layer that intercepts `task_input_required` events and enriches bare text into structured types using accumulated progress messages as context
- Wired enricher into `route.ts` at the `task_input_required` handler with async IIFE + fallback
- Deployed to prod and verified full E2E flow:
  1. Sent "search for wireless earbuds under 2000 on flipkart"
  2. Agent browsed Flipkart, found products, called bare `ask_user`
  3. **InputEnricher** transformed it into `card_grid` with 5 product cards (images, ratings, prices)
  4. SIGSTOP froze process group while user picked a product
  5. Selected OPPO Enco Buds3 Pro → SIGCONT resumed agent
  6. Agent navigated to product, extracted details, triggered payment panel (₹1,499)

**Files changed**:
- `packages/agent-core/src/input-enricher.ts` (created — LLM enrichment module)
- `packages/agent-core/src/index.ts` (updated — added InputEnricher export)
- `apps/web/app/api/agent/execute/route.ts` (updated — progress accumulator + enrichment logic)

**Key decisions**:
- InputEnricher is cloud-side only — no changes to laptop CLI or bridge MCP
- Fast path: already-structured inputs pass through with zero overhead
- Only activates for shopping skills (flipkart, myntra, amazon, blinkit, zepto, swiggy)
- Uses accumulated `task_progress` messages as context for the LLM to extract product data
- Async IIFE wrapper in route.ts because `handleTaskEvent` is synchronous — enrichment runs async with fallback to original on error

**What worked / what didn't** *(fill in after review)*:
-

## 2026-03-21 — Fix vanishing agent messages (double-filter + ID collisions)

**Goal**: Diagnose and fix agent messages that "appear and then vanish" from chat UI.

**What was done**:
- Traced message lifecycle: SSE event → server rewriter → client filter → React state
- Found two bugs working together:
  1. Client-side `shouldSuppressMessage()` re-filtered messages already cleaned by server AI rewriter — regex false positives silently dropped valid messages
  2. `Date.now().toString()` for message IDs — rapid messages got same ID, React deduped
- Removed client-side suppression entirely (server two-tier filter is authoritative)
- Replaced all `Date.now().toString()` IDs with `msg-{timestamp}-{random}` for uniqueness
- Added error fallback in rewriter `.catch()` — sends original message instead of silent drop

**Files changed**:
- `apps/web/components/chat/ChatInterface.tsx` (updated — removed client-side filter, unique IDs)
- `apps/web/app/api/agent/execute/route.ts` (updated — rewriter error fallback)

**Key decisions**:
- Server-side two-tier filter (regex + AI rewrite) is the single source of truth for message filtering
- Client should trust what the server sends — no second-guessing with redundant regex
- Random suffix in IDs prevents React key collisions without needing uuid dependency

**What worked / what didn't** *(fill in after review)*:
-

## 2026-03-21 — Cart UX: ProductCard widget + L2 cart panel + CartBar

**Goal**: Replace the text + "Yes, proceed / Cancel" product confirmation with a proper shopping cart UX — rich product widget, persistent cart bar, L2 cart panel.

**What was done**:
- Added `ProductCardData` type and `product_card` to `RichInputType` across shared/bridge/relay types
- Created `CartContext` — client-side cart state (items, add/remove/qty, single-store MVP)
- Created `ProductCardInput` — rich product widget (image, price/MRP/discount, rating, delivery, specs, offers, Add to Cart button)
- Created `CartBar` — persistent bar above chat input showing item count, store, total, opens L2
- Created `L2CartContext` — cart panel open/close state machine (mirrors L2PaymentContext)
- Created `L2CartPanel` — full cart view with qty controls, price breakdown, "Proceed to Buy" → triggers payment L2
- Updated `L2SplitView` to support BOTH payment and cart panels (was payment-only)
- Wired `product` field through entire pipeline: agent.ts → execute/route.ts → SSE → ChatInterface → InputPrompt → ProductCardInput
- Updated bridge-mcp-server.ts with `product_card` input type and `product` schema
- Updated task-manager.ts to forward `product` field
- Updated system prompt with `product_card` docs and usage guidance
- Updated 3 shopping skills (flipkart, amazon, boat) to use `product_card` instead of `confirm_action`

**Files changed**:
- `packages/shared/src/types/agent.ts` (updated — ProductCardData, product_card type, product field)
- `packages/shared/src/types/bridge.ts` (updated — product field)
- `packages/shared/src/types/relay.ts` (updated — product field)
- `apps/web/components/chat/CartContext.tsx` (created — cart state management)
- `apps/web/components/chat/CartBar.tsx` (created — persistent bottom bar)
- `apps/web/components/chat/L2CartContext.tsx` (created — cart panel state)
- `apps/web/components/chat/L2CartPanel.tsx` (created — cart L2 panel)
- `apps/web/components/chat/inputs/ProductCardInput.tsx` (created — product widget)
- `apps/web/components/chat/InputPrompt.tsx` (updated — product_card routing)
- `apps/web/components/chat/ChatInterface.tsx` (updated — providers, CartBar, product passthrough)
- `apps/web/components/chat/L2SplitView.tsx` (updated — dual panel support)
- `apps/web/app/api/agent/execute/route.ts` (updated — product field in SSE)
- `packages/agent-core/src/agent.ts` (updated — product passthrough)
- `packages/agent-core/src/prompts/system.ts` (updated — product_card docs)
- `apps/playwright/src/bridge-mcp-server.ts` (updated — product schema + input_type)
- `apps/playwright/src/task-manager.ts` (updated — product field forwarding)
- `packages/agent-core/src/skills/flipkart-shopping/SKILL.md` (updated — product_card flow)
- `packages/agent-core/src/skills/amazon-shopping/SKILL.md` (updated — product_card flow)
- `packages/agent-core/src/skills/boat-electronics/SKILL.md` (updated — product_card flow)

**Key decisions**:
- Cart is client-side only (MVP) — no database persistence yet
- Single-store cart — adding from different store clears previous cart
- "Add to Cart" replaces "Yes, proceed" — the product_card widget IS the confirmation
- L2SplitView generalized to support multiple panels (payment takes priority over cart)
- "Proceed to Buy" in cart panel triggers existing Razorpay payment flow via L2PaymentContext
- Product field flows through entire pipeline: LLM → agent.ts → SSE → frontend

**What worked / what didn't** *(fill in after review)*:
-

---

## 2026-03-21 — AI message rewrite layer

**Goal**: Replace regex-only filtering with an AI-powered rewrite layer that classifies browser agent messages and transforms them into clean user-facing text.

**What was done**:
- Created `MessageRewriter` class with two-tier architecture: regex fast path (~90% free) + LLM rewrite (~10% ~200ms)
- LLM prompt classifies messages as SUPPRESS or rewrites into clean 1-2 sentence user text
- Integrated into `execute/route.ts` at both message paths (relay `task_progress` + chat-only `onMessage`)
- Added `REWRITER_MODEL` env var for configuring a cheaper model
- Lazy singleton pattern — LLM client created on first use
- 8 unit tests with mocked LLM client
- Fallback: if LLM fails, original message passes through (already cleared regex)

**Files changed**:
- `packages/agent-core/src/message-rewriter.ts` (created — MessageRewriter class)
- `packages/agent-core/src/message-rewriter.test.ts` (created — 8 tests with mock LLM)
- `packages/agent-core/src/index.ts` (updated — export MessageRewriter)
- `apps/web/app/api/agent/execute/route.ts` (updated — replaced shouldSuppressMessage with getMessageRewriter().rewrite())
- `.env.example` (updated — added REWRITER_MODEL)
- `docs/REPEATING-MISTAKES.md` (updated — documented two-tier architecture)

**Key decisions**:
- Per-message LLM call (not batched) — most messages caught by regex, only ~5-10 per task hit LLM
- Regex stays as fast pre-filter — free, instant, catches obvious cases
- Post-rewrite regex check — if LLM's rewrite is itself narration, suppress it
- `.then()` pattern in route handler — keeps SSE stream non-blocking
- No separate mini model deployment required initially — falls back to main LLM_MODEL

**What worked / what didn't** *(fill in after review)*:
-

---

## 2026-03-21 — Fix message filter leaks once and for all

**Goal**: Stop internal agent narration ("It opened a wrong product tab. Let me switch...") from reaching the user's chat UI.

**What was done**:
- Diagnosed root cause: `isAgentNarration()` tested full message against `^`-anchored regexes — multi-sentence messages with narration in later sentences slipped through
- Refactored `isAgentNarration()` to split messages into sentences and test each independently
- Added filler-prefix stripping ("Good,", "Got it,", "OK so", "Alright,", etc.) before pattern matching
- Added new patterns: "It opened/loaded/redirected...", "This looks/seems...", "Here we can see...", "That was/is..."
- Fixed unfiltered `callbacks.onMessage()` path in `agent.ts` line 618-620 (text-only LLM responses bypassed `shouldSuppressMessage`)
- Added defense-in-depth filter to `execute/route.ts` `onMessage` callback
- Expanded test suite from 23 to 31 tests with false-positive checks

**Files changed**:
- `packages/shared/src/internal-message-filter.ts` (updated — sentence splitting, prefix stripping, new patterns)
- `packages/shared/src/internal-message-filter.test.ts` (updated — 31 tests covering multi-sentence, filler prefixes, false positives)
- `packages/agent-core/src/agent.ts` (fixed — added `shouldSuppressMessage` to text-only response path)
- `apps/web/app/api/agent/execute/route.ts` (fixed — added filter to `onMessage` callback)
- `docs/REPEATING-MISTAKES.md` (updated — documented 5-gate architecture + new patterns)

**Key decisions**:
- Sentence splitting > adding more `^` patterns — fundamentally solves the multi-sentence bypass
- Filler prefix stripping handles infinite variations of "Good/Great/OK/Alright + narration"
- Defense-in-depth at every layer — no single point of failure
- Did NOT filter `task_complete`/`task_error` — those are semantically different (user-facing summaries/errors)

**What worked / what didn't** *(fill in after review)*:
-

## 2026-03-21 — Session logging & documentation rules

**Goal**: Set up session logging and enforce documentation updates with every change.

**What was done**:
- Created `docs/SESSION-LOG.md` (this file) for tracking all Copilot CLI sessions
- Updated `.github/copilot-instructions.md` with documentation-update and session-logging rules
- Updated cofounder skill to include documentation requirements in the dev loop

**Files changed**:
- `docs/SESSION-LOG.md` (created)
- `.github/copilot-instructions.md` (updated — added Documentation & Session Logging section)
- `.github/skills/cofounder/SKILL.md` (updated — added step 6.5 for docs/log)

**Key decisions**:
- Session log lives in `docs/SESSION-LOG.md` (committed to repo, reviewable in PRs)
- Each entry: date, goal, what was done, files changed, decisions, feedback section
- Newest sessions at the top for easy scanning

**What worked / what didn't** *(fill in after review)*:
- _TBD_

---

<!-- 
## TEMPLATE — Copy this for new sessions

## YYYY-MM-DD — Short title

**Goal**: What the session set out to accomplish.

**What was done**:
- Bullet list of changes made

**Files changed**:
- `path/to/file` (created/updated/deleted — brief note)

**Key decisions**:
- Any architectural or design choices worth remembering

**What worked / what didn't** *(fill in after review)*:
- 
-->
