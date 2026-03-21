# Repeating Mistakes — Copilot Agent Anti-Patterns

> A living document of mistakes the AI agent keeps making across ShofferAI sessions.
> **Every agent session MUST read this file before starting work.**

---

## 1. Not Reading Documentation Before Acting

**What happens:** The agent jumps into code changes without reading `.github/copilot-instructions.md`, `DEPLOYMENT.md`, or existing skill files. It then makes changes that contradict established patterns or re-introduces already-fixed bugs.

**Examples:**
- Agent launched Chrome on hardcoded port 9222 after docs already specified `--remote-debugging-port=0`
- Agent tried to connect relay on port 8765 after architecture switched to outbound mode
- Agent modified ChromePool to pre-launch 3 instances after it was already refactored to lazy mode

**Rule:** Always read `.github/copilot-instructions.md` and relevant docs/skill files BEFORE making any changes.

---

## 2. Hardcoded Ports / Port Conflicts

**What happens:** Agent hardcodes Chrome CDP ports (9222, 9223, 9224) or relay ports instead of using OS-assigned ephemeral ports. This causes port conflicts, stale connections, and "address already in use" errors.

**Examples:**
- ChromePool hardcoded to ports 9222-9224, causing conflicts when Chrome didn't shut down cleanly
- `TaskManager` required a hardcoded Chrome port instead of using `playwright-mcp-with-chrome.sh`
- User repeatedly asked "why there still 3?" / "why we still launching 3 ports?"

**Rule:** Always use `--remote-debugging-port=0` and parse the actual port from stderr. Never hardcode port numbers. The only fixed port is dev relay 8765. TaskManager bridge and MCP log ports are dynamic (9400-9499 range, printed in relay startup logs).

---

## 3. Infinite Retry Loops

**What happens:** When a browser action fails, the agent retries the exact same approach in an infinite loop instead of stopping and reporting the failure. The LLM's "try a different approach" instruction leads to trying the same thing with slightly different wording.

**Examples:**
- Blinkit search returned 0 results (no delivery address set) → agent retried search 20+ times
- Swiggy page wouldn't load → agent kept refreshing in a loop
- Hotel booking form fill failed → agent re-filled the same fields repeatedly

**Rule:** If the same action fails twice, STOP. Report the failure to the user. Never retry the same action more than 2 times. Check preconditions (login, location, page state) before retrying.

---

## 4. Re-Asking Questions the User Already Answered

**What happens:** The LLM asks the user for information they already provided (dates, location, preferences), often because the conversation was pruned or the agent lost context.

**Examples:**
- User said "Book hotel in Goa this weekend under 4000/night" → agent asked for dates, location, AND budget again
- User provided phone number → agent asked for it again 2 messages later
- After handoff failure, agent re-asked ALL questions from scratch

**Rule:** Extract ALL parameters from the user's initial message before asking anything. Only ask for genuinely missing information. Never re-ask for info already in the conversation.

---

## 5. Excessive Verbose Output to User

**What happens:** Agent shows every intermediate browser step (navigate, scroll, click, dismiss popup, refresh) to the user instead of working silently between meaningful interaction points.

**Examples:**
- "Open a new tab and navigate to https://www.zomato.com" shown as a user-facing message
- "Find the location input field on Zomato homepage, type 'c 502 honer Aqua'" shown step-by-step
- User complained: "I don't like the amount of information we are showing to the user"

**Rule:** Suppress ALL browser action step_updates. Only show the user: questions, choices, results, errors, and confirmations. The browser works silently.

---

## 6. Forgetting Fixes Between Sessions (Statelessness)

**What happens:** The agent is stateless across sessions. A bug gets fixed in one session, then the next session re-introduces it because it doesn't know the fix exists. The user gets extremely frustrated.

**Examples:**
- Chrome port hardcoding fixed → next session re-introduced hardcoded ports
- Multi-browser setup removed → next session referenced `browser1`/`browser2`/`browser3`
- User: "motherfucker, whatever issue you faced document it first you idiot keep cycling through same issue"

**Rule:** After fixing any bug, update `.github/copilot-instructions.md` or relevant docs. This is the ONLY way to persist knowledge. If you fixed it, DOCUMENT it.

---

## 7. Eager Relay Connection Blocking Chat

**What happens:** The Cloud Run execute route tries to connect to the laptop relay BEFORE the chat LLM even determines if browser automation is needed. If the relay is down, the entire chat is blocked with a 30-second timeout.

**Examples:**
- User sends "hi" → 30-second hang → timeout error (relay not connected)
- Simple text questions blocked by relay connection attempt
- Fixed 3 times across different sessions

**Rule:** Relay connection must be LAZY — only connect when `handoff_to_browser_agent` is actually called. Chat must always work even if the laptop is offline.

---

## 8. Not Testing E2E After Changes

**What happens:** Agent makes code changes, runs `turbo build`, sees it pass, and declares success — without testing the actual user flow through the chat interface.

**Examples:**
- Deployed relay changes without testing if laptop actually connects
- Changed system prompt without testing if LLM behavior actually improved
- Modified TaskManager without testing if Copilot CLI actually spawns

**Rule:** After any change that affects the user flow: deploy → open prod chat → send a real request → verify the FULL pipeline works. Build passing ≠ feature working.

---

## 9. Multiple Fix-Deploy Cycles for One Issue

**What happens:** Instead of understanding the full problem before coding, the agent makes a quick fix, deploys, tests, finds it's broken, makes another fix, deploys again — sometimes 5-6 commits for what should be one fix.

**Examples:**
- Session `228c8692`: 6 commits to fix handoff flow (defer relay, propagate errors, rewrite prompt, fix TaskManager, fix CLI flags)
- Session `03aa178f`: 6 commits to show terminal steps
- Session `f25afddd`: 5 commits for dev-loop implementation

**Rule:** Trace the FULL code path before writing any fix. Understand all the pieces. Make ONE comprehensive commit, not six incremental guesses.

---

## 10. Tab Isolation / Session Confusion

**What happens:** Agent opens a site in one tab but actions affect a different tab, or every tab shows the same site content because session isolation isn't working.

**Examples:**
- User reported: "Every tab we open — even Swiggy — is showing Blinkit's page content"
- Agent navigated to booking.com but actions ran on the chat tab
- ChromePool sessions not properly isolated

**Rule:** Always use `SessionMCPHost` with a unique `sessionId`. Always open a NEW tab before navigating to any external site. Never reuse tabs across tasks.

---

## 11. Skipping Login / Precondition Steps

**What happens:** Agent jumps straight to the action (searching products, filling forms) without first ensuring preconditions are met (logged in, location set, correct page loaded).

**Examples:**
- Blinkit: Searched for "milk" without setting delivery address → 0 results → infinite loop
- Swiggy: Tried to order without logging in → login wall blocked checkout
- Booking.com: Tried to fill details without verifying the correct room was selected

**Rule:** ALWAYS follow the skill's step order. Login FIRST. Set location SECOND. Then proceed. If a step fails, don't skip ahead — fix the precondition.

---

## 12. Not Updating .github/copilot-instructions.md After Architecture Changes

**What happens:** Major architecture changes (relay mode, ChromePool, prompt rewrites) are implemented but `.github/copilot-instructions.md` still describes the old architecture. Next session reads stale docs and regresses.

**Examples:**
- Outbound relay mode implemented but docs still described tunnel-based relay
- Lazy ChromePool shipped but docs still said "3 Chrome instances pre-launched"
- TaskManager bridge added but not documented anywhere

**Rule:** If you change HOW something works, update `.github/copilot-instructions.md` in the SAME commit. This is non-negotiable.

---

## 13. Asking User for Login Credentials Instead of Checking the Code

**What happens:** Agent asks the user "what email/password should I use to log in?" instead of looking at the codebase where the dev login is clearly defined.

**The answer is always in the code:**
- **Dev Login route:** `apps/web/app/api/auth/dev-login/route.ts`
- **Email:** `demo@shofferai.com`
- **Password:** `demo1234`
- **How it works:** POST to `/api/auth/dev-login` upserts the demo user, then use `signIn('credentials', { email, password })` via NextAuth
- **Login page:** `apps/web/app/(auth)/login/page.tsx` — has a "Dev Login" button that calls the above route
- **On prod:** Click the "Dev Login (demo@shofferai.com)" button on the login page, or POST `/api/auth/dev-login` first then sign in with credentials
- **Google OAuth:** Also available via NextAuth Google provider (needs `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` env vars)

**Rule:** NEVER ask the user for credentials. Look at the auth routes in the codebase. The dev login is hardcoded and always available.

---

## Quick Reference Checklist

Before starting ANY task:
- [ ] Read `.github/copilot-instructions.md`
- [ ] Read relevant skill files
- [ ] Check if this issue was fixed before (search this doc)

Before making changes:
- [ ] Trace the FULL code path first
- [ ] Understand all affected files
- [ ] Plan ONE comprehensive fix

After making changes:
- [ ] Update `.github/copilot-instructions.md` if architecture changed
- [ ] Update this doc if you encountered a new repeating pattern
- [ ] Test E2E through the chat interface (not just `turbo build`)
- [ ] Deploy and verify on prod if it's a prod-affecting change

---

## 14. Showing Browser Tool Calls to the User in Chat

**What happens:** Internal browser tool calls (navigate, click, snapshot, screenshot, bash) and tool-call label text (e.g. `"Browser: report_intent"`, `"Browser: playwright-browser_navigate"`) appear as chat bubbles in the ShofferAI UI, cluttering the conversation with technical noise the user doesn't need to see.

**Root cause (two layers):**
1. The relay handoff path in `task-manager.ts` was sending ALL tool calls as `task_progress` messages. Fixed by routing tool calls ONLY to `mcpToolEvents.emit`.
2. The `gh copilot --output-format json` JSONL includes `assistant.message` events that contain tool-call label text (e.g. `"Browser: report_intent"`). These were forwarded as `task_progress` (no `step` field) → SSE `message` → rendered in chat.

**The fix (2026-03-20):**
- `task-manager.ts`: `assistant.tool_call` events ONLY go to the MCP log stream (`mcpToolEvents.emit`). `assistant.message` events pass through `isInternalMessage()` filter — tool-label-like text (`Browser: <name>`, raw tool names, status labels) is suppressed. Still logged at debug level.
- `execute/route.ts`: Defense-in-depth — `shouldSuppressMessage()` filter on `task_progress` messages before sending as SSE. Catches anything that slips through. Also applied to `onMessage` callback for chat-only mode.
- `ChatInterface.tsx` (frontend): `shouldSuppressMessage()` filter on `message` events — last line of defense before rendering.

**Patterns suppressed:** `"Browser: report_intent"`, `"Browser: playwright-browser_navigate"`, `"browser_snapshot"`, `"mcp__playwright__browser_click"`, `"report_intent"`, `"Agent starting..."`, plus 100+ narration patterns (observations, actions, status, reasoning, browser internals).

**Architecture (2026-03-21 — AI rewrite layer):**
Two-tier message filtering:
1. **Fast path (regex)**: `shouldSuppressMessage()` catches ~90% of narration instantly (free, <1ms). Splits multi-sentence messages, strips filler prefixes, 100+ patterns.
2. **AI path (LLM)**: `MessageRewriter` in `packages/agent-core/src/message-rewriter.ts` sends ambiguous messages through a lightweight LLM call (~200ms) that either SUPPRESSes or rewrites into clean user-facing text.

Integration points in `execute/route.ts`:
- `handleTaskEvent` → `task_progress` case: `getMessageRewriter().rewrite(msg.message)`
- `callbacks.onMessage`: `getMessageRewriter().rewrite(content)`
- Both use `.then()` to stay non-blocking in the SSE stream

Other filter gates still active:
- `task-manager.ts` — regex filter on `assistant.message` events (Gate 1)
- `bridge-mcp-server.ts` — regex filter on `send_progress` calls (Gate 2)
- `agent.ts` — regex filter on LLM text blocks (Gate 3)
- `ChatInterface.tsx` — regex client-side defense-in-depth (Gate 5)

`REWRITER_MODEL` env var configures a fast/cheap model for the rewriter (defaults to `LLM_MODEL`).

**Rule:** The user should ONLY see in the chat: LLM natural language messages, `ask_user` prompts, `confirm_action` prompts, payment panels, and completion/error messages. ALL browser tool actions and internal labels are invisible to the user — they go to the MCP log stream (`mcpToolEvents`) and console debug logs for monitoring.

**Where to view tool logs:** The MCP log stream emits via `mcpToolEvents` in `task-manager.ts`. Use the relay terminal (`start-laptop.sh`) or the `/api/mcp-logs` SSE endpoint to monitor tool execution in real time.

---

---

## 15. Testing UI on localhost Instead of Production

**What happens:** Agent makes UI changes and tests them on `localhost:3000` instead of the production URL. Localhost requires the relay running, has different auth state, and doesn't prove the change works in production. The agent wastes time trying to send messages through localhost when the relay isn't connected.

**Examples:**
- Agent redesigned the chat UI, tested locally, relay wasn't running → got "couldn't reach browser agent" error
- Agent tested message flow on localhost instead of just deploying and testing on prod
- Multiple sessions wasted time starting `npx next dev` for visual testing when prod was already deployed

**Rule:** For UI/visual testing, ALWAYS use production: `https://shofferai-27188185100.asia-south1.run.app`. Deploy first, then test on prod. Only use localhost for rapid iteration on CSS/layout (no need to send actual messages). For testing the full agent flow (sending messages, seeing steps, input prompts), ALWAYS use prod where the relay is connected.

---

## 16. Saving Screenshots / Images in the Repo Root

**What happens:** During dev-loop testing or Playwright MCP usage, `browser_take_screenshot` saves files to the current working directory — which is the repo root. This clutters the project with `page-*.png`, `screenshot-*.png`, and similar junk files that don't belong there.

**Examples:**
- Dev-loop visual QA saved `page-1710936000.png` in the repo root
- Agent took a screenshot for debugging and left it in `/Users/rohit/shofferAi/`
- Multiple `.png` files accumulating in root after testing sessions

**Rule:** NEVER save screenshots or images to the repo root. When using `browser_take_screenshot`:
- Always use a **relative path** under the Copilot session folder (e.g., `~/.copilot/session-state/<id>/files/screenshot.png`)
- Or use the `/tmp/` directory for throwaway screenshots
- If a screenshot tool defaults to CWD, explicitly set `filename` to redirect output away from the repo root
- After any testing session, clean up any stray images from the repo root: `rm -f *.png *.jpg *.jpeg` from the project root

---

## 17. Running localhost Health Checks / curl Against Local Ports

**What happens:** Agent runs `curl http://localhost:3000`, `curl http://localhost:8765`, or checks Chrome CDP ports (9222-9225) to "check health" — but these services are operator-managed, not agent-managed. The agent has no business probing localhost ports. The relay, Chrome, and dev server are started by the operator manually.

**Examples:**
- Agent ran `curl http://localhost:8765` to check relay → wasted time, operator hadn't started it
- Agent curled Chrome ports 9222-9225 checking "pool health" → these are dynamic ports, never hardcoded
- Agent ran health checks against localhost:3000 before testing → should just deploy to prod and test there

**Rule:** NEVER curl localhost ports to check service health. NEVER start, stop, restart, or `kill` the laptop relay process — the operator manages the relay lifecycle manually. If you need to test, deploy to prod and test there. If the relay appears to be down, inform the operator and wait for them to fix it.

---

## 18. Opening Browsers via `open` Command

**What happens:** Agent uses `open <url>` to open a URL, which launches the OS default browser (Edge on this machine) instead of Chrome. The agent has no business opening browsers — the operator tests UI manually. If browser automation is needed, use Playwright MCP (which always uses the Chrome-Debug profile).

**Examples:**
- Agent ran `open https://shofferai-....run.app/login` → opened in Edge instead of Chrome
- Agent tried to "test on prod" by opening a browser → can't interact with it anyway

**Rule:** NEVER use the `open` command to launch browsers. You cannot interact with a browser opened via `open`. For testing, tell the user the prod URL and let them test. For automated testing, use Playwright MCP tools (when connected). The operator handles all manual browser testing.

---

## 16. Using `npx @playwright/mcp@latest` Instead of Global Binary

**What happens:** Agent or scripts use `npx -y @playwright/mcp@latest` to start the Playwright MCP server. The `@latest` tag forces an npm registry check on EVERY startup, adding 5-20 seconds (or timing out entirely on slow/flaky network). This causes "MCP server taking longer than expected" warnings and mid-session disconnects.

**Examples:**
- `npx -y @playwright/mcp@latest` in `mcp-host.ts`, `claude-agent-spawner.ts`, `shofferai-agent.sh`
- MCP server times out during Copilot CLI startup because npx is waiting on npm registry
- Mid-session disconnects when the npx cache becomes stale

**Rule:** ALWAYS use the globally-installed `playwright-mcp` binary. Never use `npx @playwright/mcp@latest`. The binary is installed via `npm install -g @playwright/mcp` and updated with `./apps/playwright/scripts/update-playwright-mcp.sh`. In code: `command: 'playwright-mcp'` (not `command: 'npx'`). In shell scripts: `playwright-mcp --cdp-endpoint ...` (not `npx -y @playwright/mcp@latest --cdp-endpoint ...`).

---

## 19. Misdiagnosing Relay Status from Stale Log Files

**What happens:** Agent reads `/tmp/shofferai-relay.log` to check relay status, sees "Goodbye." or "Shutting down", and concludes the relay is dead. But the current relay was started via `start-laptop.sh` which uses `exec npx tsx` — stdout goes to the **terminal**, not to that log file. The log file is from a previous daemon-mode run. Agent then repeatedly insists the relay is down, frustrating the operator.

**Examples:**
- Relay PID was alive, ports 9400/9401 LISTENING — but agent read stale log and said "Goodbye means it's dead"
- Agent ignored `lsof` port evidence in favor of a log file modified 50 minutes ago
- Agent kept saying "please restart the relay" when it was already running

**How to ACTUALLY check relay status:**
1. **Primary check:** `lsof -iTCP -sTCP:LISTEN -P 2>/dev/null | grep -E ":(9[0-4][0-9]{2})"` — if ports 9400-9499 are LISTEN, relay IS running
2. **Process check:** `ps aux | grep "index.ts" | grep -v grep` — look for the Node process
3. **Do NOT trust** `/tmp/shofferai-relay.log` — it may be from a previous run
4. The `start-laptop.sh` script writes to terminal stdout, not to a log file

**Rule:** Check LISTENING PORTS first, not log files. If ports 9400-9499 are listening, the relay is alive regardless of what any log file says. Never tell the operator to restart the relay without first checking `lsof`.

---

## 20. Testing E2E Immediately After Cloud Run Deploy (Race Condition)

**What happens:** Agent deploys to Cloud Run, then immediately tests E2E. The laptop relay needs a few seconds to detect the disconnection and reconnect to the new instance.

**How it's mitigated (auto-heal):**
1. `cloudbuild.yaml` Step #1 curls `POST /api/admin/release-relay` before deploying — force-closes the laptop WS on the current instance so the laptop reconnects immediately (within 1-4s)
2. `relay-outbound.ts` tracks application-level messages separately from WS pong frames — if no app-level message for 45s, terminates and reconnects (catches cases where the pre-deploy curl misses)

**Why WS pong alone isn't enough:** Cloud Run's load balancer responds to WS ping/pong frames even when the backend instance is dead (e.g., old instance after deploy). The laptop thinks the connection is alive because WS pongs keep arriving, but the backend isn't processing any messages.

**Root cause of the original bug:** Cloud Run deploys create new instances while keeping old ones alive. WebSocket connections are treated as "active requests" — Cloud Run won't send SIGTERM until the WS closes or `--timeout` (3600s) expires. New HTTP requests route to the new instance (no laptop WS), while the laptop stays connected to the old instance.

**Rule:** After deploying to Cloud Run, WAIT at least 30 seconds before running an E2E test. The relay auto-heals but needs a few seconds. If the first attempt fails with a relay error, wait 30 seconds and retry once before investigating further.

---

## 21. Playwright MCP Screenshots Saving to CWD / Opening on Desktop

**What happens:** `browser_take_screenshot` saves `.png` files to the current working directory (repo root or operator's machine) because Playwright MCP wasn't launched with `--output-dir`. The file then opens on the operator's desktop — disrupting their workflow with random images like `bb_header.png`, `page-*.png`, etc.

**Root cause:** Playwright MCP defaults to saving screenshots in CWD when no `--output-dir` is specified. Three of four launch paths were missing the flag:
- `mcp-host.ts` (ChromePool relay) — **was missing `--output-dir`**
- `claude-agent-spawner.ts` (Copilot CLI spawner) — **was missing `--output-dir`**
- `shofferai-agent.sh` (standalone agent) — **was missing `--output-dir`**
- `playwright-mcp-with-chrome.sh` (local Copilot/Claude Desktop) — already had it ✅

**The fix (2026-03-20):** Added `--output-dir /tmp/playwright-mcp-output` to ALL Playwright MCP launch points:
- `apps/playwright/src/mcp-host.ts` — added `'--output-dir', '/tmp/playwright-mcp-output'` to args
- `apps/web/lib/claude-agent-spawner.ts` — added `'--output-dir', '/tmp/playwright-mcp-output'` to args
- `apps/playwright/scripts/shofferai-agent.sh` — added `--output-dir /tmp/playwright-mcp-output` to MCP config
- `apps/playwright/scripts/playwright-mcp-with-chrome.sh` — already had `--output-dir /tmp/playwright-mcp-output`

**Rule:** EVERY Playwright MCP launch MUST include `--output-dir /tmp/playwright-mcp-output`. Never let screenshots default to CWD. When adding a new MCP launch point, always include `--output-dir`.

---

## 22. ask_user Rendering as Step Card Instead of Interactive InputPrompt

**What happens:** When the agent calls `ask_user`, the UI shows a grey "Waiting for your input 0/1" progress card with the question text, but NO interactive elements (no address buttons, no text field, no Continue button). The user cannot respond. The task hangs indefinitely.

**Root cause:** `agent.ts` fired `onStepUpdate({ status: 'paused_for_input' })` BEFORE `onInputRequired()`. This sent TWO SSE events: first `step_update` (renders TaskProgress card), then `input_required` (renders InputPrompt). The TaskProgress card dominated the UI, making InputPrompt invisible or inaccessible.

**The fix (2026-03-20):**
1. Removed `onStepUpdate('paused_for_input')` from both the direct `ask_user` handler (line 790) and auto-conversion path (line 596) in `agent.ts`
2. Added `setCurrentSteps([])` in ChatInterface when `input_required` arrives — clears any lingering progress cards

**Rule:** `ask_user` should ONLY fire `onInputRequired()`, never `onStepUpdate()`. The InputPrompt component is the interactive UI for user input. TaskProgress is for displaying non-interactive progress. Never mix them.

---

## 23. Skills Not Loading in Docker (0 Skills on Cloud Run)

**What happens:** Cloud Run logs show `[singletons] Loaded 0 skills` on EVERY request. Skill matching always returns null. The Copilot CLI gets no site-specific instructions, tries to login to pre-authenticated sites, and doesn't know how to navigate target websites.

**Root cause:** `loadSkills()` in `loader.ts` uses `__dirname` to find SKILL.md files. In the Next.js standalone Docker build, `__dirname` resolves to the bundled chunk directory — SKILL.md files (plain markdown) are NOT bundled by webpack/Next.js, so they don't exist in the container.

**The fix (2026-03-20):**
1. Added `COPY --from=builder /app/packages/agent-core/src/skills ./skills` to Dockerfile
2. Added `ENV SKILLS_DIR=/app/skills` to Dockerfile
3. Updated `singletons.ts` to pass explicit `skillsDir` path: `process.env.SKILLS_DIR || join(process.cwd(), 'packages/agent-core/src/skills')`

**Rule:** Plain markdown files (SKILL.md) are NOT included in Next.js standalone builds. Any non-code assets needed at runtime must be explicitly COPY'd in the Dockerfile. Always verify with `gcloud logging read` that skills load after deployment.

---

## 24. Event Handler Singleton Breaks Concurrent Tasks

**What happens:** When two tasks run simultaneously, the second task's events are delivered correctly but the first task's events silently vanish. The first task appears to stall — `UserInputTimeoutError` after 5 minutes.

**Root cause:** `RelayBridge.onTaskEvent(handler)` was `this.taskEventHandler = handler` — a single slot. Starting a new task replaced the previous task's handler. Events from task A dispatched to task B's handler, which filtered them out (wrong taskId).

**The fix (2026-03-20):**
1. Changed `taskEventHandler` singleton → `taskEventHandlers: Map<string, handler>` in RelayBridge, RelayClient, and RemoteMCPHost
2. `onTaskEvent(handler, taskId?)` registers handlers by taskId
3. `removeTaskEventHandler(taskId?)` cleans up after task completion
4. `handleMessage()` dispatches to ALL registered handlers (each filters by its own taskId)

**Rule:** Never use singleton patterns for per-task state. Any handler, callback, or state that is task-specific MUST be keyed by taskId.

---

## 25. Re-Asking for Information Already in User's Message

**What happens:** User says "Order milk and bread from Swiggy Instamart" and the agent shows an input form asking "What do you want to buy?" — even though items are clearly stated. Terrible UX.

**Root cause:** Two issues:
1. `system.ts` injected skill instructions but NOT skill `params` definitions. LLM never saw which params could be extracted from the message.
2. Every SKILL.md's Step 0 explicitly said "call ask_user with layout and TWO sections: address AND items" — the LLM followed the instruction literally.

**The fix (2026-03-20):**
1. System prompt now injects params with OVERRIDE directive: "Extract parameter values from the user's ORIGINAL message. Do NOT ask for values already provided."
2. Includes explicit examples: "If the user said 'order milk and bread' → items are ALREADY KNOWN"
3. Updated 17 grocery SKILL.md files with extract-first Step 0 logic

**Rule:** ALWAYS extract parameters from the user's message first. Only call `ask_user` for values that are genuinely missing. The system prompt OVERRIDE directive applies to all 500 skills.

---

## 26. Playwright MCP Mock Keychain Breaks Chrome Sessions

**What happens:** Chrome window opened by Playwright MCP during handoff appears completely logged out of every site (Swiggy, Booking.com, etc.) — even though the cloned Chrome-Debug Profile 3 has valid Cookies file with all sessions.

**Root cause:** Playwright's `launchPersistentContext()` adds `--use-mock-keychain` and `--password-store=basic` as default Chrome args. On macOS, Chrome encrypts ALL cookies using the macOS Keychain. Mock keychain = Chrome can't decrypt cookies = every site appears logged out.

These flags are hardcoded in `playwright-core/lib/server/chromium/chromiumSwitches.js` lines 81-82. Playwright MCP's `browserContextFactory.js` also hardcodes `ignoreDefaultArgs: ["--disable-extensions"]` which overwrites any `ignoreDefaultArgs` from our config. So there's NO config-based way to remove mock keychain.

**The fix (2026-03-20):**
1. Changed `playwright-mcp-with-chrome.sh` to launch Chrome OURSELVES (not via Playwright)
2. Our Chrome launch has NO mock-keychain flags — uses real macOS Keychain
3. Parse the CDP port from Chrome's stderr (`DevTools listening on ws://127.0.0.1:PORT/...`)
4. Pass `cdpEndpoint: "http://127.0.0.1:PORT"` in the Playwright MCP config
5. Playwright MCP CONNECTS to our Chrome via CDP instead of launching its own

**Rule:** NEVER let Playwright launch Chrome when you need real cookie sessions. Always launch Chrome yourself and connect Playwright via CDP. This applies to both `playwright-mcp-with-chrome.sh` and any future MCP launch scripts. Verify with: `ps aux | grep Chrome | grep mock-keychain` — should return nothing for your Chrome process.

---

## 27. Singleton Chrome Causes Browser Sharing Between Sessions

**What happens:** When Copilot CLI triggers a task through the ShofferAI chat interface (Mode D testing), the relay-spawned agent navigates to the target site (e.g., blinkit.com) in the SAME Chrome window that the QA session is viewing. The QA browser tab gets hijacked — suddenly showing Blinkit instead of ShofferAI.

**Root cause:** `playwright-mcp-with-chrome.sh` used a SINGLETON pattern — one Chrome instance in `/tmp/shofferai-chrome-singleton/` shared by ALL Copilot CLI processes via reference counting. The QA session's Playwright MCP and the relay's TaskManager-spawned CLI both connected to the same Chrome CDP port. Any navigation by one process affected all others.

**The fix (2026-03-20):**
1. Rewrote `playwright-mcp-with-chrome.sh` to use PER-INSTANCE Chrome: `/tmp/shofferai-chrome-$$/`
2. Each invocation: copies Chrome-Debug/Profile 3 → launches its own Chrome → parses CDP port → connects Playwright MCP
3. On exit: kills its own Chrome + removes temp dir
4. Stale instance cleanup: finds `/tmp/shofferai-chrome-*` dirs older than 2 hours with dead PIDs
5. Removed all singleton machinery: atomic locking, reference counting, shared PID/port files

**Rule:** EVERY Playwright MCP invocation MUST get its own dedicated Chrome instance. Never share a Chrome window between sessions. The per-instance pattern in `playwright-mcp-with-chrome.sh` handles this automatically — each PID gets its own `/tmp/shofferai-chrome-<PID>/` directory with a separate Chrome process.

---

## 28. Duplicate Chrome Windows on Copilot Launch

**What happens:** Launching Copilot CLI opens 2 (or more) empty Chrome `about:blank` windows.

**Two root causes found:**

1. **Global + project MCP config overlap:** `~/.copilot/mcp-config.json` AND `.mcp.json` both defined `"playwright"` MCP server. Both ran instead of project overriding global. The global config also used the anti-pattern `npx @playwright/mcp@latest`.

2. **Copilot spawns the MCP server twice:** Even with one config, Copilot CLI spawns `playwright-mcp-with-chrome.sh` twice from the same parent process (tool discovery + active use). With the old `$$`-keyed instance dirs, each spawn got its own Chrome.

**The fix (2026-03-21):**
1. Cleared `~/.copilot/mcp-config.json` — project `.mcp.json` is the single source of truth
2. Changed `playwright-mcp-with-chrome.sh` to key on `$PPID` (parent PID) instead of `$$` (script PID)
3. First invocation launches Chrome and writes a lockfile with PID + CDP port
4. Second invocation detects the lockfile, verifies Chrome is alive, reuses it
5. Different Copilot sessions (different parents) still get isolated Chrome instances
6. Added `lazy-playwright-proxy.mjs` — `.mcp.json` now points to a proxy that defers Chrome entirely until first browser tool call

**Rule:** Instance dirs MUST be keyed on `$PPID` (parent Copilot binary), not `$$` (script). NEVER put `playwright` in `~/.copilot/mcp-config.json`. NEVER use `npx @playwright/mcp@latest`. NEVER point `.mcp.json` directly at `playwright-mcp-with-chrome.sh` — always use `lazy-playwright-proxy.mjs`.

---

## 29. Orphaned Copilot CLI + Chrome After Chat Disconnect

**What happens:** When the user closes the chat tab, navigates away, or the request times out, the Copilot CLI process and Chrome window spawned on the laptop keep running for up to 10 minutes (task timeout). Wastes resources, leaves orphaned Chrome windows.

**Root cause:** The SSE execute route detected client disconnection (`streamClosed = true`) but never sent a `task_cancel` message to the laptop relay. The relay protocol already defined `task_cancel` and the laptop-side handler was wired up — it just never received the signal.

**The fix (2026-03-21):**
1. Added `request.signal` abort listener in `execute/route.ts`
2. On abort: sends `task_cancel` to laptop relay if a handoff is active
3. Laptop relay forwards to `TaskManager.cancelTask()` which kills Copilot CLI + cleans up Chrome
4. Heartbeat, event listener, and stream are cleaned up immediately
5. *(2026-03-21 follow-up)* `cancelTask()` → `cleanupTask()` now sends `SIGCONT` immediately before `SIGTERM` in the process group kill. Previously, `cleanupTask()` only sent `SIGTERM` — but SIGSTOP'd processes (waiting for `ask_user`) silently ignore `SIGTERM`, leaving both CLI and Chrome as zombies. Chrome shares the Copilot CLI's process group (spawned by `playwright-mcp-with-chrome.sh`), so killing the group kills Chrome too.

**Rule:** Every task lifecycle MUST have a cleanup path for client disconnection. If the client goes away, the laptop must know immediately. The `task_cancel` relay message is the mechanism — it MUST be sent on SSE disconnect when `handoffSent === true`. In `cleanupTask()`, ALWAYS `SIGCONT` before `SIGTERM` — stopped processes silently drop signals.

---

## 30. Copilot CLI Continues Browsing While Waiting for User Input

**What happens:** The laptop Copilot CLI agent calls `ask_user` to ask the user a question, but while the user is still reading/responding, the CLI agent continues executing browser actions (navigating to buy page, clicking buttons). The user sees an input prompt while Chrome is already 3 steps ahead.

**Root cause:** The Copilot CLI binary has an internal ~3 minute tool execution timeout. When Bridge MCP's `ask_user` blocks (waiting for user to respond via the relay), the CLI's timeout fires, the tool call returns an error, and the LLM continues autonomously — often re-asking the same question or proceeding without user input.

**Evidence from task `cmn0cwx8d0001s601nmqn1kl8`:** Three `ask_user` calls at 3-minute intervals (13:24:49, 13:27:59, 13:31:09), all asking the same "which earbuds?" question.

**The fix (2026-03-21):**
1. TaskManager sends `SIGSTOP` to the Copilot CLI process when `bridge_ask_user` or `bridge_request_payment` is received
2. This freezes the CLI — no more tool calls, no timeout firing
3. When user responds → TaskManager sends `SIGCONT` → CLI resumes, reads the result, continues
4. `cancelTask()` sends `SIGCONT` before `SIGTERM` to ensure stopped processes can be killed cleanly

Also added in `agent.ts` (cloud-side): break the tool processing loop after `ask_user`/`confirm_action`/`collect_payment` to prevent the LLM from batching user-blocking tools with browser actions.

**Rule:** User-blocking tools (`ask_user`, `confirm_action`, `collect_payment`) MUST freeze agent execution. On the laptop, this means SIGSTOP/SIGCONT. On the cloud, this means breaking the tool loop. The agent MUST NOT proceed until the user responds.

---

## 31. Skills Showing Fake Product Cards Before Browsing

**What happens:** Grocery skills (BigBasket, Zepto, Swiggy Instamart, etc.) instruct the cloud LLM in Step 0 to show a `card_grid` with product items — complete with emoji icons and sometimes hallucinated prices — BEFORE the browser agent ever visits the website. The cloud LLM has no access to the site's catalog, so all data is fabricated.

**Root cause (two bugs):**
1. SKILL.md Step 0 explicitly said: "Show common items as cards with emoji. Enable quantity steppers." — This told the LLM to present a `card_grid` it had no data for.
2. The image URL validation layer in `agent.ts` only checked top-level `input_type === 'card_grid'`, but these skills used `input_type: "layout"` with a `card_grid` nested inside `sections[]` — completely bypassing the validation gate.

**The fix (2026-03-21):**
1. Extended `agent.ts` image validation to also inspect `layout` sections — card_grids/carousels nested inside layouts are now validated for real `https://` image URLs
2. Removed `card_grid` from Step 0 in 18 grocery SKILL.md files — Step 0 now only collects the delivery address
3. Items are extracted from the user's message; real product data only comes from the browser agent after visiting the site

**Rule:** The cloud LLM MUST NEVER show product cards with prices or images unless the data came from an actual browser visit. Step 0 should only collect genuinely missing info (address). The `agent.ts` validation layer is the safety net — it rejects visual widgets without real `https://` image URLs, including those nested inside `layout` sections.

---

## 32. Retry/Fallback Logic Using Const — Infinite Loop on Same Value

**What happens:** A retry handler (e.g., `EADDRINUSE` → try next port) references a `const` variable instead of mutating a counter. The retry always attempts the same value, creating an infinite loop that floods logs.

**Example (MCP Log port):**
```typescript
// ❌ BUG: MCP_LOG_PORT is const — retry always tries 9402
const MCP_LOG_PORT = 9401;
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    server.listen(MCP_LOG_PORT + 1);  // always 9402 → infinite loop
  }
});

// ✅ FIX: mutable counter + max attempts
let mcpLogPort = 9401;
const MCP_LOG_PORT_MAX = mcpLogPort + 10;
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    mcpLogPort++;
    if (mcpLogPort > MCP_LOG_PORT_MAX) { logger.error('All ports exhausted'); return; }
    server.listen(mcpLogPort);
  }
});
```

**Root cause:** The Node.js `server.on('error')` handler fires repeatedly — once per failed `.listen()` call. If the retry value never changes, each failure triggers the same retry, forever.

**Rule:** Any retry/fallback logic MUST:
1. **Mutate** the retry parameter (port, index, delay) — never recompute from a const
2. **Cap** the number of attempts — always have a max before giving up
3. **Log the attempt number** — so infinite loops are immediately visible

This applies to: port scanning, reconnect backoff, file path fallbacks, API endpoint failover — anywhere a value should change between retries.

---

## 18. Copilot CLI MCP Timeout Reset (Upstream Bug)

**What happens:** Copilot CLI silently resets its MCP timeout config after receiving `notifications/tools/list_changed` from the MCP server (copilot-cli#1378). The CLI reverts to a short default timeout (~10s), causing `-32001: Request timed out` disconnects during normal browser operations that take a few seconds.

**Examples:**
- Playwright MCP connects, sends `tools/list_changed` → CLI drops 120s timeout → next `browser_snapshot` disconnects
- Proxy crashes silently from unhandled rejection → Copilot CLI marks server as disconnected → no auto-recovery
- Multiple stale Chrome instances and orphaned processes accumulate from repeated disconnect/reconnect cycles

**Root cause:** Upstream bug in Copilot CLI's MCP protocol handler — not in our code.

**Workaround (in `lazy-playwright-proxy.mjs`):**
1. Suppress `notifications/tools/list_changed` from child → parent (prevents timeout reset)
2. `uncaughtException` + `unhandledRejection` handlers keep proxy alive
3. `.catch()` on all async `forward()` calls to prevent unhandled rejections
4. `.mcp.json` includes `"timeout": 120000` as belt-and-suspenders

**Rule:** NEVER remove the `tools/list_changed` suppression from the lazy proxy. NEVER remove the crash handlers. These are workarounds for upstream Copilot CLI bugs (copilot-cli#1378, copilot-cli#172) and must stay until the CLI team fixes the root cause.

**Tracking:** [copilot-cli#1378](https://github.com/github/copilot-cli/issues/1378), [copilot-cli#172](https://github.com/github/copilot-cli/issues/172)

---

## 33. Running Multiple Laptop Relay Instances (WebSocket Flapping)

**What happens:** Two (or more) relay processes connect to the same Cloud Run WebSocket endpoint simultaneously. Each connection triggers `setLaptopSocket()` which closes the previous socket. The displaced process detects the disconnect and reconnects, kicking out the other process. This creates an infinite flapping loop — connect/disconnect every 1-2 seconds — making the relay completely unusable.

**Common causes:**
- LaunchAgent daemon (`com.shofferai.relay.plist`) is running AND the operator manually starts `start-laptop.sh` in a terminal
- Operator opens two terminal tabs and runs `start-laptop.sh` in both
- Copilot agent starts the relay programmatically while operator's relay is already running

**Symptoms:**
- Laptop logs: "Connected to Cloud Run relay" / "Disconnected from Cloud Run relay" repeating every 1-2 seconds
- Cloud Run logs: "Laptop WebSocket connected" every 1-2 seconds with no stable connection
- Tasks fail with "Laptop not connected to relay bridge (waited 30/60s)"

**How to diagnose:**
```bash
# Check pidfile — should contain PID of the running relay
cat /tmp/shofferai-relay.pid

# Verify that PID is alive
kill -0 $(cat /tmp/shofferai-relay.pid) 2>/dev/null && echo "running" || echo "stale pidfile"

# Check if LaunchAgent is also running
launchctl list | grep shofferai
```

**Rule:** NEVER run more than one relay instance. `start-laptop.sh` automatically kills existing instances and stops the LaunchAgent daemon before starting. Duplicate detection uses a pidfile (`/tmp/shofferai-relay.pid`), NOT `ps aux | grep` (which falsely matches its own process tree).

---

## 34. Using `ps aux | grep` for Process Detection (False Self-Matches)

**What happens:** The relay duplicate-instance guard used `ps aux | grep 'tsx.*apps/playwright/src/index'` to detect other relay processes. But `npx tsx` spawns a process tree (npx → tsx → node), and the grep matches ALL of them — including the current process's own parent/child. Filtering by `process.pid` or even `process.ppid` is insufficient because the tree can be 3+ levels deep.

**Symptoms:**
- Relay exits immediately on startup with "Another relay instance is already running" when no other relay exists
- The listed PIDs belong to the relay's own process tree
- Relay is impossible to start

**Rule:** Use a **pidfile lock** (`/tmp/shofferai-relay.pid`) for singleton detection. On startup, check if the PID in the file is alive (`process.kill(pid, 0)`). If dead, overwrite. If alive, abort. Clean up the pidfile on graceful shutdown.

---

## 35. Agent Starting/Stopping the Laptop Relay

**What happens:** The Copilot agent starts the relay in an async shell. When the agent session ends, the shell is killed, taking the relay down with it — causing the exact same "relay died mid-task" failure it was trying to fix.

**Rule:** NEVER start, stop, or restart the laptop relay. The operator manages the relay lifecycle manually. If the relay is down, inform the operator and wait.

---

## 36. Dropping Cancel Messages When Relay is Disconnected

**What happens:** User closes browser tab → `beforeunload` fires → cancel request reaches Cloud Run → relay is temporarily disconnected (e.g. post-deploy revision change) → cancel message silently dropped → Chrome stays alive as zombie on laptop forever.

**Symptoms:**
- Chrome processes accumulate on the laptop after deployments
- Cloud Run logs show `[cancel] relay not connected, cannot send task_cancel`
- Cancel works sometimes (relay connected) but not others (relay briefly disconnected)

**Rule:** NEVER drop cancel messages. Queue them in `pendingCancels` and flush when the relay WebSocket reconnects. Both `RelayBridge` (prod) and `RelayClient` (dev) have `pendingCancels: Set<string>` that auto-flush on the `ws.on('open')` handler. The `sendTaskMessage()` method handles queuing automatically for `task_cancel` type messages.

---

## 37. Trusting WS Ping/Pong to Detect Dead Cloud Run Backends

**What happens:** The laptop relay sends WebSocket ping frames to detect dead connections. Cloud Run's load balancer responds to WS ping/pong at the proxy layer, even when the backend instance is gone (terminated, replaced by deploy). The laptop thinks the connection is alive because pong frames keep arriving, but no application-level messages are being processed.

**Symptoms:**
- Laptop shows "Connected to Cloud Run relay" indefinitely after deploy
- Cloud Run logs show no laptop connection on the new instance
- `lsof` shows ESTABLISHED TCP to Cloud Run's IP, but `release-relay` endpoint returns `wasConnected: false`
- Tasks fail with "Laptop not connected to relay bridge"

**Root cause:** WS ping/pong operates at the WebSocket protocol layer. Cloud Run's HTTP/2 reverse proxy handles these frames independently of the backend container. When the backend is dead, the proxy keeps the TCP/TLS connection alive and responds to pings, creating a zombie WS connection.

**The fix (2026-03-21):**
1. `relay-outbound.ts` now tracks `lastAppMessageAt` separately from `lastDataAt`
2. WS `pong` frames update `lastDataAt` only (for TCP-level dead detection at 20s)
3. Application-level messages (JSON from server) update both `lastDataAt` AND `lastAppMessageAt`
4. If `lastAppMessageAt` exceeds 45s (3 missed server heartbeats at 15s interval), connection is terminated and laptop reconnects

**Rule:** NEVER rely solely on WS ping/pong for health checks when behind a reverse proxy (Cloud Run, ALB, Nginx). Always include application-level heartbeats with their own timeout. The server sends `{"type":"ping"}` every 15s — if the laptop doesn't receive any for 45s, the backend is dead.

---

*Last updated: 2026-03-22*
