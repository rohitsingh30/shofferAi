# ShofferAI — Development Session Log

A running log of every Copilot CLI development session. Each entry captures what was done, key decisions, and files changed — so we can review, learn, and course-correct.

> **For the developer**: After each session, add notes on what worked / what didn't under the relevant entry. This feedback loop helps the AI improve across sessions.

## 2026-03-21 — InputEnricher + SIGSTOP/SIGCONT E2E verification

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
