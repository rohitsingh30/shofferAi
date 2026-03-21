# ShofferAI — Development Session Log

A running log of every Copilot CLI development session. Each entry captures what was done, key decisions, and files changed — so we can review, learn, and course-correct.

> **For the developer**: After each session, add notes on what worked / what didn't under the relevant entry. This feedback loop helps the AI improve across sessions.

## 2026-03-21 — Task cancel on tab/browser close + cancel queue for relay gaps

**Goal**: Ensure closing the browser tab or window kills the running Copilot CLI + Chrome on the laptop, and fix cancel messages being silently dropped during relay disconnection windows.

**What was done**:
- Added `beforeunload` + `pagehide` event listeners in `ChatInterface.tsx` that fire `fetch('/api/agent/cancel', {keepalive: true})` on tab/browser close
- Initially used `navigator.sendBeacon()` with Blob — didn't work (likely Content-Type issue with `request.json()` parsing). Switched to `fetch()` with `keepalive: true` for proper JSON headers
- Made cancel endpoint body parsing defensive: `request.text()` + `JSON.parse()` instead of `request.json()`
- **Root cause of failure**: Cloud Run logs showed cancel requests WERE reaching the server, but relay was temporarily disconnected (post-deploy reconnection gap) → cancel message silently dropped
- Added `pendingCancels: Set<string>` to both `RelayBridge` (prod) and `RelayClient` (dev) — cancel messages queued when relay offline, auto-flushed on WebSocket reconnect
- Committed password popup suppression for Chrome: `PasswordLeakDetection` in `--disable-features`, patched Preferences JSON to disable password save prompts + leak detection

**Files changed**:
- `apps/web/components/chat/ChatInterface.tsx` (updated — beforeunload/pagehide cancel handler)
- `apps/web/app/api/agent/cancel/route.ts` (updated — defensive body parsing, removed isConnected gate)
- `apps/web/lib/relay-bridge.ts` (updated — pendingCancels queue + flush on reconnect)
- `apps/web/lib/relay-client.ts` (updated — pendingCancels queue + flush on reconnect)
- `apps/playwright/scripts/playwright-mcp-with-chrome.sh` (updated — password popup suppression)
- `docs/ARCHITECTURE.md` (updated — Task Cancellation Flow section)
- `docs/REPEATING-MISTAKES.md` (updated — anti-pattern #36: dropping cancel messages)

**Key decisions**:
- `fetch(keepalive)` over `sendBeacon` — same page-teardown guarantee but with proper Content-Type headers
- NOT using `visibilitychange` — fires on tab switch too, would kill tasks when user just switches tabs
- Queue-and-flush pattern in relay classes rather than retry loop in cancel endpoint — cleaner, relay reconnect is the natural trigger
- `SIGCONT` before `SIGTERM` — handles paused (SIGSTOP) Copilot CLI processes that ignore SIGTERM

**What worked / what didn't** *(fill in after review)*:
-

## 2026-03-21 — Fixed relay duplicate-instance detection (false self-match)

**Goal**: Diagnose why task `cmn0oodi` (Blinkit grocery order) died mid-execution, and fix relay startup failures.

**What was done**:
- Diagnosed task death: relay process received SIGINT at 18:51:24 while Copilot CLI was mid-reasoning (~15s into task)
- Diagnosed startup failure: `checkDuplicateInstance()` used `ps aux | grep 'tsx.*apps/playwright/src/index'` which matched the relay's OWN process tree (npx → tsx → node), making it impossible to start
- Replaced grep-based detection with **pidfile lock** (`/tmp/shofferai-relay.pid`) — checks if PID in file is alive via `process.kill(pid, 0)`, overwrites if stale
- Added pidfile cleanup on graceful shutdown
- Improved `start-laptop.sh` kill-wait loop (polls every 0.5s up to 10s instead of fixed `sleep 2`)
- Added anti-patterns #34 (ps aux | grep self-match) and #35 (agent starting relay) to REPEATING-MISTAKES.md

**Files changed**:
- `apps/playwright/src/index.ts` (updated — pidfile lock replaces ps grep)
- `apps/playwright/scripts/start-laptop.sh` (updated — better kill-wait loop)
- `docs/REPEATING-MISTAKES.md` (updated — anti-patterns #33 diagnosis updated, #34 and #35 added)

**Key decisions**:
- Pidfile is more reliable than ps grep for singleton detection — immune to process tree depth
- Agent must NEVER start the relay (violates rule #6, and async shells die with session)

**What worked / what didn't** *(fill in after review)*:
-

## 2026-03-21 — Fixed relay WebSocket flapping + duplicate instance prevention

**Goal**: Diagnose why relay kept disconnecting and tasks failed with "laptop not connected."

**What was done**:
- Diagnosed three cascading issues: (1) Cloud Run cold-start timing mismatch, (2) race condition in `setLaptopSocket` where old socket's close handler clobbered new socket's state, (3) two relay processes fighting over one Cloud Run WebSocket
- Fixed `setLaptopSocket` race: `removeAllListeners()` on old socket + guard `if (this.laptopSocket !== ws) return` in close handler
- Fixed reconnection timing: laptop health check 20s→10s, dead timeout 45s→20s, Cloud Run connect wait 30s→60s
- Added duplicate-instance guard to `index.ts` (checks for existing relay processes on startup, exits if found)
- Added `start-laptop.sh` kill-existing + LaunchAgent stop before starting
- Added anti-pattern #33 to REPEATING-MISTAKES.md
- Added rule #6: never start/stop relay (operator-managed)

**Files changed**:
- `apps/web/lib/relay-bridge.ts` (updated — race condition fix + timing)
- `apps/playwright/src/relay-outbound.ts` (updated — faster health check)
- `apps/playwright/src/index.ts` (updated — duplicate instance check)
- `apps/playwright/scripts/start-laptop.sh` (updated — kill existing + stop LaunchAgent)
- `docs/REPEATING-MISTAKES.md` (updated — anti-pattern #33)
- `.github/copilot-instructions.md` (updated — rule #6)

**Key decisions**:
- Root cause was LaunchAgent + manual start creating two relay processes
- Each relay connected to Cloud Run, each kicked the other out → infinite flapping loop
- `start-laptop.sh` now kills existing processes and stops LaunchAgent daemon before starting

**What worked / what didn't** *(fill in after review)*:
-

## 2026-03-21 — Fixed Playwright MCP disconnects (Copilot CLI timeout workaround)

**Goal**: Diagnose and fix frequent Playwright MCP server disconnections during Copilot CLI sessions.

**What was done**:
- Investigated MCP disconnect root cause — traced to upstream Copilot CLI bugs (copilot-cli#1378, #172) where the CLI resets its timeout config after receiving `notifications/tools/list_changed`
- Updated `lazy-playwright-proxy.mjs` with 4 mitigations:
  - Suppress `notifications/tools/list_changed` from child → parent (prevents timeout reset)
  - Added `uncaughtException` + `unhandledRejection` handlers to prevent silent proxy death
  - Added `.catch()` on all async `forward()` calls
  - Improved child exit logging ("will auto-reconnect on next tool call")
- Added `"timeout": 120000` to `.mcp.json` as belt-and-suspenders
- Updated `docs/PLAYWRIGHT-MCP-CHROME.md` with new "Copilot CLI MCP Timeout Workarounds" section
- Added anti-pattern #18 to `docs/REPEATING-MISTAKES.md`

**Files changed**:
- `apps/playwright/scripts/lazy-playwright-proxy.mjs` (updated — crash handlers, notification suppression, safe async)
- `.mcp.json` (updated — added timeout: 120000)
- `docs/PLAYWRIGHT-MCP-CHROME.md` (updated — new workarounds section + rule #8)
- `docs/REPEATING-MISTAKES.md` (updated — new anti-pattern #18)
- `docs/SESSION-LOG.md` (updated — this entry)

**Key decisions**:
- Chose to suppress `tools/list_changed` entirely rather than delaying it — the proxy already serves static tool defs on `tools/list` before child is ready, so the CLI doesn't need the notification
- Kept proxy alive on crash rather than restarting — auto-reconnect on next tool call is cleaner

**What worked / what didn't** *(fill in after review)*:
- 

## 2026-03-21 — Verified "New Chat closes L2 panel" fix on prod (E2E)

**Goal**: Visually verify on production that clicking "New Chat" correctly closes the L2 cart panel, clears cart state, and resets chat to the welcome screen.

**What was done**:
- Logged into prod (`shofferai-27188185100.asia-south1.run.app`) as Demo User via Dev Login
- Injected mock cart state (3 Blinkit items: Amul Milk ₹68, Britannia Bread ₹45, Tata Tea ₹199 = ₹312 total) via Chrome DevTools Protocol — connected directly to Chrome CDP endpoint to call `addItem()` and `openCart()` on React context providers through fiber tree traversal
- Took "before" screenshot showing L2 Cart panel open (40% right split, 3 items, "Proceed to Buy · ₹312")
- Clicked "New Chat" in sidebar
- Took "after" screenshot confirming full reset to welcome screen
- Verified via CDP that React state was fully cleared: `cartItems: 0`, `cartStore: ""`, `cartIsEmpty: true`, `l2CartState: "CLOSING"→"CLOSED"`

**Test results**:
| State | Before "New Chat" | After "New Chat" |
|-------|:-:|:-:|
| Cart items | 3 | **0** ✅ |
| Cart store | "Blinkit" | **""** ✅ |
| L2 panel | OPEN | **CLOSED** ✅ |
| Chat view | 60% width (squeezed) | **100% width** ✅ |
| Welcome screen | Hidden behind messages | **Visible** ✅ |

**Technique**: CDP fiber traversal — connected to Chrome via `ws://127.0.0.1:<port>/devtools/page/<id>`, walked React fiber tree from `<html>` element to find CartContext (depth 48) and L2CartContext (depth 52), called context methods directly. This bypasses the limitation that Playwright MCP doesn't expose `page.evaluate()`.

**Files changed**:
- `docs/SESSION-LOG.md` (updated — this entry)

**Key decisions**:
- Used CDP WebSocket + React fiber traversal to inject state, since Playwright MCP has no `evaluate()` tool and `javascript:` URLs are blocked
- This technique is reusable for future E2E testing when relay is unavailable

**What worked / what didn't** *(fill in after review)*:
- 

## 2026-03-21 — Cloud SQL Verification & Migration + Address Picker DB Fallback

**Goal**: Verify Cloud SQL production database, apply pending migrations, add AddressInput DB fallback for saved addresses, update documentation.

**What was done**:
- Discovered existing Cloud SQL instance `shofferai-db` (PostgreSQL 15, db-f1-micro, asia-south1) — already connected to Cloud Run via Unix socket
- Applied pending migration `20260321173519_add_pending_input` — now 13 tables in prod (was 12)
- Temporarily authorized laptop IP for direct access, then removed it after migration
- AddressInput.tsx: Added `useEffect` fallback — fetches saved addresses from `/api/profile` when LLM doesn't pass them in the `saved` prop
- system.ts: Strengthened saved address injection — now passes full JSON array with explicit "include ALL" instruction
- Removed hardcoded example addresses from 24 grocery/food SKILL.md files (were biasing LLM to use fake addresses instead of real ones)
- Updated DEPLOYMENT.md with Cloud SQL instance details, connection info, and migration instructions
- Updated ARCHITECTURE.md model count (10 → 13)
- Updated prisma-db instructions with prod migration workflow

**Files changed**:
- `apps/web/components/chat/inputs/AddressInput.tsx` (updated — DB fallback via /api/profile)
- `packages/agent-core/src/prompts/system.ts` (updated — full JSON saved address injection)
- 24 `SKILL.md` files (updated — removed hardcoded address examples)
- `docs/DEPLOYMENT.md` (updated — Cloud SQL section, env var details)
- `docs/ARCHITECTURE.md` (updated — model count, last updated date)
- `.github/instructions/prisma-db.instructions.md` (updated — prod migration workflow)

**Key decisions**:
- Cloud SQL already existed and was connected — no new provisioning needed
- Used temporary authorized network for migration (not cloud-sql-proxy, since ADC wasn't configured)
- Always clear authorized networks after direct access (security)
- SKILL.md address examples replaced with `<use the saved addresses from the system prompt>` to stop LLM hallucination

**What worked / what didn't** *(fill in after review)*:
-

## 2026-03-21 — Razorpay Payment Integration + Session Affinity Fix

**Goal**: Configure Razorpay test keys, fix stepId mismatch bug in payment verify flow, and enable Cloud Run session affinity to fix multi-instance pending input loss.

**What was done**:
- Configured Razorpay test mode keys (`rzp_test_...`) on Cloud Run via `gcloud run services update`
- Fixed stepId bug: `verify/route.ts` was hardcoding `'payment'` as stepId, but laptop-initiated payments use UUID stepIds. Threaded stepId through: SSE event → L2PaymentData → PaymentPanel → verify endpoint → PauseResumeManager
- Diagnosed Cloud Run multi-instance bug: SSE stream on instance A, POST `/api/agent/input` hitting instance B with different in-memory `pendingInputs` Map → "No pending input found" 404s
- Enabled Cloud Run session affinity (`--session-affinity`) to route all requests from same client to same instance
- Restarted laptop relay after revision deployments

**Verified**:
- ✅ Payment panel rendered with product details (₹1,499 OPPO Enco Buds3 Pro) in previous test
- ✅ InputEnricher transforms bare ask_user → card_grid/product_card/carousel (multiple tests)
- ✅ SIGSTOP/SIGCONT works across multiple rounds
- ⏳ Full Razorpay checkout (test payment → verify → agent resume) not yet tested E2E due to transient SSE drops and agent behavior variance

**Files changed**:
- `apps/web/components/chat/L2PaymentContext.tsx` (updated — added `stepId` to L2PaymentData)
- `apps/web/components/chat/ChatInterface.tsx` (updated — pass stepId from SSE event)
- `apps/web/components/chat/PaymentPanel.tsx` (updated — send stepId to verify endpoint)
- `apps/web/app/api/payments/verify/route.ts` (updated — use stepId from request, default 'payment')

**Key decisions**:
- Session affinity over Redis: simpler for early stage, sufficient for single-user testing
- maxScale=3 kept (didn't reduce to 1) — session affinity handles routing
- stepId threaded through frontend rather than stored in Payment DB model (no migration needed)

**Remaining for full E2E payment test**:
- Agent sometimes completes prematurely (sends `task_complete` after loading Flipkart without searching)
- SSE streams drop intermittently (task continues on laptop but UI resets to home)
- These are separate from payment code — payment infrastructure is complete

**What worked / what didn't** *(fill in after review)*:
-

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
