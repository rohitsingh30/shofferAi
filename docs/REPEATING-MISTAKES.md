# Repeating Mistakes — Copilot Agent Anti-Patterns

> A living document of mistakes the AI agent keeps making across ShofferAI sessions.
> **Every agent session MUST read this file before starting work.**

---

## 1. Not Reading Documentation Before Acting

**What happens:** The agent jumps into code changes without reading `CLAUDE.md`, `DEPLOYMENT.md`, or existing skill files. It then makes changes that contradict established patterns or re-introduces already-fixed bugs.

**Examples:**
- Agent launched Chrome on hardcoded port 9222 after docs already specified `--remote-debugging-port=0`
- Agent tried to connect relay on port 8765 after architecture switched to outbound mode
- Agent modified ChromePool to pre-launch 3 instances after it was already refactored to lazy mode

**Rule:** Always read `CLAUDE.md` and relevant docs/skill files BEFORE making any changes.

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

**Rule:** After fixing any bug, update `CLAUDE.md` or relevant docs. This is the ONLY way to persist knowledge. If you fixed it, DOCUMENT it.

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

## 12. Not Updating CLAUDE.md After Architecture Changes

**What happens:** Major architecture changes (relay mode, ChromePool, prompt rewrites) are implemented but `CLAUDE.md` still describes the old architecture. Next session reads stale docs and regresses.

**Examples:**
- Outbound relay mode implemented but docs still described tunnel-based relay
- Lazy ChromePool shipped but docs still said "3 Chrome instances pre-launched"
- TaskManager bridge added but not documented anywhere

**Rule:** If you change HOW something works, update `CLAUDE.md` in the SAME commit. This is non-negotiable.

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
- [ ] Read `CLAUDE.md`
- [ ] Read relevant skill files
- [ ] Check if this issue was fixed before (search this doc)

Before making changes:
- [ ] Trace the FULL code path first
- [ ] Understand all affected files
- [ ] Plan ONE comprehensive fix

After making changes:
- [ ] Update `CLAUDE.md` if architecture changed
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
- `execute/route.ts`: Defense-in-depth — `isInternalToolLabel()` filter on `task_progress` messages before sending as SSE. Catches anything that slips through.
- `ChatInterface.tsx` (frontend): Existing filter hides `step_update` events with `status: 'running'` (unchanged, acts as third safety net).

**Patterns suppressed:** `"Browser: report_intent"`, `"Browser: playwright-browser_navigate"`, `"browser_snapshot"`, `"mcp__playwright__browser_click"`, `"report_intent"`, `"Agent starting..."`.

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

*Last updated: 2026-03-20*
