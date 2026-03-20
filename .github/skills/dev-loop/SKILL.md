---
name: dev-loop
description: "Dev loop with 5 modes: (A) Visual QA, (B) Create new E2E skill, (C) Batch-compile skills, (D) Continue Skill, (E) Multi-browser parallel test."
---

This skill has five modes:

- **Mode A: Visual QA** — Browse the running app with Playwright MCP, evaluate, fix, repeat
- **Mode B: Create a NEW E2E skill** — Research a website, write SKILL.md, auto-compile
- **Mode C: Batch-compile EXISTING skills** — Browse each site, record real selectors, update compiled scripts
- **Mode D: Continue Skill** — Pick ONE existing skill, test it E2E via the ShofferAI chat interface, improve SKILL.md + compiled script
- **Mode E: Multi-browser** — Test Chrome Pool with 3 parallel orders, verify slot isolation

Ask the user which mode, or infer from context.

> ⚠️ **MANDATORY FOR ALL MODES EXCEPT A**: Testing MUST go through the **ShofferAI chat interface** (prod: `https://shofferai-27188185100.asia-south1.run.app`). NEVER open target websites (swiggy.com, booking.com, etc.) directly in the browser. The pipeline is: **User → Chat UI → Agent → Relay → Chrome → Target Site**. Skipping to the target site tests nothing.

---

## Mode A: Visual QA Loop

Run a visual QA loop on the ShofferAI web app using Playwright MCP.

You MUST use Playwright MCP tools to browse the running app and visually verify every page. Do NOT just read code — actually look at the app.

### The Loop

For each page in the app:

1. **Navigate** — Use `mcp__playwright__browser_navigate` to go to the page URL
2. **Snapshot** — Use `mcp__playwright__browser_snapshot` to see the page content/accessibility tree
3. **Evaluate** — Analyze the snapshot for:
   - Layout issues (alignment, spacing, overflow)
   - Missing content or broken elements
   - Accessibility problems
   - UX issues (confusing flow, missing feedback)
   - Visual design quality (does it look premium?)
4. **Fix** — If issues found, edit the code to fix them
5. **Re-test** — Navigate back and snapshot again to verify the fix
6. **Next page** — Move to the next page

### Pages to Test

Use the **production URL** for E2E testing. Use localhost only for UI iteration.

**Production**: `https://shofferai-27188185100.asia-south1.run.app`
**Local dev**: `http://localhost:3000`

| Page | Prod URL | What to test |
|------|----------|-------------|
| Landing | `/` | Hero, CTAs, quick-action cards |
| Login | `/login` | Google OAuth, credentials login |
| Register | `/register` | Registration flow |
| Dashboard | `/dashboard` | Chat interface, quick actions, agent execution |
| Chat | `/dashboard` | Send a real message, verify agent responds via SSE, watch tool calls stream in, confirm the full conversation renders correctly |
| History | `/dashboard/tasks` | Task list, conversation replay |
| Profile | `/dashboard/profile` | Profile editing, credential vault |

### Chat Interface Test

**Always test on production**: `https://shofferai-27188185100.asia-south1.run.app/dashboard`

After logging in, navigate to the dashboard and actually **use the chat**:

1. Type a simple message (e.g., "Hello" or "What can you do?")
2. Send it and watch the SSE stream — verify the agent response appears progressively
3. Check: message bubbles render correctly, timestamps show, scroll behavior works
4. If the relay is connected, try a real task (e.g., "Search hotels in Goa on Booking.com") and verify:
   - Tool calls appear in the UI (browser actions, snapshots)
   - Progress updates stream in real-time
   - The conversation stays responsive during agent execution
5. Verify the chat input resets after sending, handles Enter key, and shows a loading state

### For Authenticated Pages

Use **real credentials** — sign in with your actual account:
1. Navigate to `/login`
2. Use Google OAuth or your registered email/password
3. Then navigate to authenticated pages

For local dev only (test account): test@shofferai.com / testpass123

### Quality Bar

The UI should look as good as or better than ChatGPT. Look for:
- Smooth animations and transitions
- Consistent spacing and typography
- Dark theme that feels premium, not just "dark"
- Intuitive navigation
- Responsive layout
- Professional feel — no amateur vibes

Report all findings and fixes made at the end.

---

## Mode B: Create a New E2E Skill

Build a new workflow skill for the ShofferAI concierge agent. Key principle: **browse the site ONCE with Playwright MCP, record everything, auto-compile to a native Playwright script that replays instantly.**

```
First run:   User message → Skill match → LLM + MCP browse → Record → Auto-compile → Save
Next runs:   User message → Skill match → Load cached script → Native Playwright → Done (instant!)
```

### Input

The user provides a website + task, e.g.:
- "MakeMyTrip flight booking"
- "Swiggy food ordering"
- "PayTM electricity bill"

If vague, ask for: specific site, specific task, login method, payment type.

### Phase 1: Research — Browse the Real Site with Playwright MCP

**You MUST actually browse the website** to map the real UI flow. Do NOT guess.

1. `mcp__playwright__browser_navigate` to the site
2. `mcp__playwright__browser_snapshot` every page
3. Map the complete journey:

| Stage | What to capture |
|---|---|
| Landing | Popups, cookie banners, app-install prompts |
| Auth | Login method (phone OTP, Google, email+password) |
| Search/Browse | How users find what they want |
| Results | How options are presented, filters, sorting |
| Detail/Select | What info shown, what choices exist |
| Cart/Review | What needs confirmation |
| Checkout/Pay | Payment methods, form fields, gateway redirects |
| Confirmation | What info appears after completion |

4. Document **every quirk**: popups, dynamic loading, required fields, CAPTCHA, OTP steps.

### Phase 2: Create Skill Definition (SKILL.md)

Based on research, create a new skill directory at:
`packages/agent-core/src/skills/{site-name}-{task}/SKILL.md`

```markdown
---
name: site-name-task
description: One-line description of what this skill does
triggers:
  - trigger phrase 1
  - trigger phrase 2
  - site name
  # 8-15 natural trigger phrases
siteUrl: https://example.com
requiresAuth: true
params:
  - name: param_name
    required: true
    hint: What this parameter is and how to extract it
---

# Site Name — Task Description

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
Confirm all required params. Use `ask_user` for missing ones.

### 2. Verify Authentication
Open site, take snapshot. Verify signed in as rsinghtomar3011@gmail.com.
If session expired, STOP and report error.

### 3-N. Core Task Steps
Hyper-specific instructions for each step:
- Exact URLs, button text, element selectors
- Snapshot after every navigation
- Error handling for popups, out-of-stock, redirects
- `ask_user` for user choices, OTP
- `confirm_action` before irreversible actions

### Final. Confirmation
Capture confirmation details. Report to user.

## Site Notes

All quirks discovered during research.
```

**Skills are loaded automatically** — just creating the SKILL.md file is enough. The `loadSkills()` function in `packages/agent-core/src/skills/loader.ts` reads all `*/SKILL.md` files at startup.

### Phase 3: Auto-Compile Pipeline (happens automatically!)

The framework handles compilation automatically:

1. **First user request** triggers the skill → LLM + MCP browse the site
2. `ScriptRecorder` captures every MCP tool call with selector hints
3. On completion, `recorder.compile()` auto-generates native Playwright JS code
4. **Next request** → `ScriptPlayer` loads and runs natively. No LLM needed.

### Phase 4: Verify

1. **Trigger test**: Would common user messages match the skill?
2. **Step walkthrough**: Use Playwright MCP to manually follow each step on the real site
3. **Fix any mismatches** between instructions and actual site UI

### Output

Report:
1. **Skill created**: Name, file path, steps count
2. **Steps summary**: One-line per step
3. **Auto-compile**: First real user request will generate the native script
4. **Trigger examples**: 3 messages that activate this skill
5. **Known limitations**: What can't be handled yet

---

## Mode C: Batch-Compile Existing Skills

Browse each skill's website **through the ShofferAI chat interface**, record the real UI flow, and compile production-ready Playwright scripts with actual selectors.

> 🚫 **DO NOT** open target websites directly. Test through the chat UI: `https://shofferai-27188185100.asia-south1.run.app`

```
For each skill (sequential):
  1. Read SKILL.md → extract siteUrl, params, steps
  2. Send a trigger message in ShofferAI chat to invoke the skill
  3. Watch the agent execute via relay → Chrome → Target Site
  4. Record every real selector from agent snapshot tool calls
  5. Compile recorded actions → native Playwright script
  6. Save to packages/agent-core/src/scripts/compiled/{skill-name}.ts
  7. Move to next skill
```

### Step 0: Verify prerequisites

The operator starts the laptop relay manually — **do NOT attempt to start or health-check it programmatically**.
Just confirm with the user that it's running before proceeding.

If not running, ask the user to run `./apps/playwright/scripts/start-laptop.sh` in a separate terminal.

### Step 1: Get the skill queue

```bash
ls packages/agent-core/src/skills/*/SKILL.md | wc -l
```

### Step 2: For EACH skill

Read the SKILL.md to get `siteUrl` and step instructions. Then:

**a) Navigate to the site:**
```
mcp__playwright__browser_navigate({ url: siteUrl })
```

**b) Take snapshot to see the page:**
```
mcp__playwright__browser_snapshot
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

---

## Mode D: Continue Skill

Pick ONE existing skill and improve it by testing E2E through the **real ShofferAI production app**.

> 🚫 **DO NOT** open the target website directly (e.g. swiggy.com, booking.com, amazon.in).
> ✅ **ALWAYS** start from the ShofferAI chat interface: `https://shofferai-27188185100.asia-south1.run.app`
> The full pipeline is: **User → Chat UI → Agent → Relay → Chrome → Target Site**.
> If you navigate to the target site directly, you are testing nothing useful. STOP and go to the chat UI.

### Step 0: Prerequisites

**Laptop relay MUST be running.** The operator starts it manually — do NOT attempt to start or health-check it programmatically.
Ask the user to confirm the relay is running before proceeding.

### Step 1: Pick a Skill

If the user didn't specify a skill, **suggest one** using this priority system.

**Check current state:**
```bash
echo "Live-compiled:"
grep -l "real selectors from live browsing" packages/agent-core/src/scripts/compiled/*.ts | wc -l
echo "Auto-generated (need work):"
grep -l "Auto-generated Playwright script" packages/agent-core/src/scripts/compiled/*.ts | wc -l
```

**Priority tiers** (work on highest-tier uncompiled skills first):

| Tier | Category | Example Skills | Why |
|------|----------|---------------|-----|
| 🔴 1 | Food & Grocery | zomato-food, swiggy-food, swiggy-instamart, blinkit-grocery, zepto-grocery, bigbasket-grocery, dominos-pizza | Highest daily usage |
| 🟠 2 | Shopping | amazon-shopping, flipkart-shopping, myntra-fashion, ajio-fashion, nykaa-beauty, meesho-shopping | Core e-commerce |
| 🟡 3 | Travel & Stays | booking-com-hotel, makemytrip-hotel, makemytrip-flight, irctc-train, goibibo-flight, redbus-bus | High-value transactions |
| 🟢 4 | Bills & Recharge | paytm-electricity, phonepe-recharge, airtel-recharge, jio-recharge, cred-creditcard | Recurring use case |
| 🔵 5 | Services | urbancompany-service, practo-doctor, apollo-doctor, bookmyshow-movie, cult-fitness | Lifestyle services |
| ⚪ 6 | Everything else | All remaining skills | Long tail |

### Step 2: Audit the Current Skill

Read the skill's SKILL.md and compiled .ts script. Score it (out of 5):

| Check | ✅ Good | ❌ Needs work |
|-------|---------|-------------|
| Triggers | 8-15 specific, natural phrases | Generic or fewer than 8 |
| Steps | Exact URLs, selectors, error handling | Vague "click the button" |
| Site Notes | Real quirks from browsing | Generic template notes |
| Compiled script | "real selectors from live browsing" header | "Auto-generated Playwright script" |
| Selectors | Real `data-testid`, `aria-label`, stable classes | Generic/guessed selectors |

### Step 3: Open ShofferAI Prod & Trigger the Skill

**This is the core of Mode D. You test by USING the app as a real user would.**

1. **Navigate to prod**: `https://shofferai-27188185100.asia-south1.run.app`
2. **Log in** if needed (Google OAuth or credentials)
3. **Go to dashboard** → the chat interface
4. **Type a realistic user message** that should trigger the skill:
   - Use one of the skill's trigger phrases with real params
   - e.g., "Order milk and bread from Swiggy Instamart"
   - e.g., "Book a hotel in Goa on Booking.com for this weekend"
5. **Send it and watch the agent execute end-to-end**

### Step 4: Observe & Record the Full Agent Execution

While the agent runs, monitor and record everything:

**What to watch:**
- ✅ **Skill matching** — did the agent pick the right skill?
- ✅ **SSE streaming** — do progress updates appear in real-time?
- ✅ **Tool calls** — watch `browser_navigate`, `browser_snapshot`, `browser_click` in the UI
- ✅ **Target site behavior** — agent opens site in a new tab via relay
- ✅ **Login handling** — agent verifies Chrome Profile 3 is logged in
- ✅ **Popup handling** — agent dismisses cookie banners, app-install prompts
- ✅ **User interactions** — `ask_user` and `confirm_action` render correctly in chat
- ✅ **Selectors** — record every real `data-testid`, `aria-label` selector from agent snapshots

**What to document when the agent finishes (or gets stuck):**
- Which step it got stuck on (and why)
- Real selectors it discovered (from snapshot tool calls)
- Missing steps in SKILL.md that the agent needed
- Popups/modals that weren't anticipated
- Incorrect selectors or stale page assumptions
- Any quirks: redirects, lazy loading, login walls, dynamic content

### Step 5: Update SKILL.md with Real Observations

Based on what you observed in Steps 3–4, improve the skill:

- **Fix step instructions** — use exact URLs, real button text, real selectors discovered
- **Add missing steps** — popup dismissal, location setting, login verification
- **Update Site Notes** — replace generic notes with actual quirks discovered
- **Improve triggers** — add natural phrases users would actually say
- **Add selector hints** in steps (e.g., "Click 'Add to Cart' `[data-testid='add-to-cart']`")

### Step 6: Update Compiled Script

Update `packages/agent-core/src/scripts/compiled/{skill-name}.ts`:

- Replace generic selectors with real ones from the agent's execution
- Update header: change "Auto-generated" → "Compiled with real selectors from live browsing"
- Fix the flow to match reality (handle popups, redirects, etc.)

### Step 7: Re-test via Prod Chat

**Go back to Step 3 and run the skill again through ShofferAI prod.** Verify the fixes actually work. Repeat the loop until the skill completes successfully or you've documented all remaining blockers.

### Step 8: Report

```
✅ Skill improved: {skill-name}
   Score: {before}/5 → {after}/5
   Changes:
   - SKILL.md: {what changed}
   - Compiled script: {what changed}
   - Real selectors recorded: {count}
   E2E result: {passed / stuck at step N — reason}
   Suggested next skill: {next-skill-name} (Tier {N})
```

Always suggest the next skill to work on at the end!

---

## Shared References

### Key Selectors to Record Per Site

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

### Step Design Rules

Every step instruction MUST include:
- **Exact action** — URL, button text, element to interact with
- **Snapshot** — "Take a snapshot" after navigation
- **Verification** — How to confirm correct page loaded
- **Error handling** — Popups, out-of-stock, redirects
- **User interaction** — `ask_user` for OTP/choices, `confirm_action` before payment

### Quality Checklist

- [ ] Every step has a snapshot instruction
- [ ] Sensitive data uses `fill_saved_credential` (NEVER plain text)
- [ ] OTP steps use `ask_user` with `input_type: "otp"`
- [ ] Choices use `ask_user` with `input_type: "choice"`
- [ ] Auth step verifies rsinghtomar3011@gmail.com profile
- [ ] Payment steps use `confirm_action` + `collect_payment`
- [ ] `## Site Notes` covers ALL quirks found during research
- [ ] 8-15 trigger phrases in frontmatter

### Important Rules

- Each Playwright MCP session gets its own Chrome window (Profile 3, rsinghtomar3011@gmail.com) — see `docs/PLAYWRIGHT-MCP-CHROME.md`
- Take snapshots frequently — they contain the real accessibility tree with selectors
- If a site requires login and the session expired, note it and move on
- Don't spend more than 3 minutes per skill when batch-compiling
- Sites that are down or behind paywalls: skip and note
- Save progress frequently — don't lose work if something crashes
