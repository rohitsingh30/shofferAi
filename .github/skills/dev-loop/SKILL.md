---
name: dev-loop
description: "Dev loop with 5 modes: (A) Visual QA, (B) Create new E2E skill, (C) Batch-compile skills, (D) Continue Skill, (E) Multi-browser parallel test."
---

This skill has five modes:

- **Mode A: Visual QA** — Browse the running app with Playwright MCP, evaluate, fix, repeat
- **Mode B: Create a NEW E2E skill** — Research a website, write SKILL.md, auto-compile
- **Mode C: Batch-compile EXISTING skills** — Browse each site, record real selectors, update compiled scripts
- **Mode D: Continue Skill** — Pick ONE existing skill, browse the real site, improve its SKILL.md + compiled script with real selectors
- **Mode E: Multi-browser** — Test Chrome Pool with 3 parallel orders, verify slot isolation

Ask the user which mode, or infer from context.

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

Browse each skill's website, record the real UI flow via Playwright MCP, and compile production-ready Playwright scripts with actual selectors.

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

### Step 0: Verify prerequisites

```bash
curl -s http://localhost:8765 | python3 -m json.tool  # Pool running
curl -s http://localhost:9222/json/version             # Chrome available
```

If not running, use `/start-laptop` first.

### Step 1: Get the skill queue

```bash
ls packages/agent-core/src/skills/*/SKILL.md | wc -l
```

### Step 2: For EACH skill

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

Pick ONE existing skill and deeply improve it — browse the real site, update SKILL.md with real observations, compile real Playwright selectors, fix broken steps.

### Step 1: Suggest a Skill

If the user didn't specify a skill, **suggest one** using this priority system.

**Check current state:**
```bash
# How many skills have real selectors vs auto-generated templates?
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

**Selection logic:**
1. Find skills in the highest tier that still have "Auto-generated" compiled scripts
2. Within a tier, prefer popular Indian sites (more likely to be accessible)
3. Present the suggestion with: skill name, site URL, what needs improvement
4. Let user confirm or pick a different one

### Step 2: Audit the Current Skill

Read the skill's SKILL.md and compiled .ts script. Assess quality:

```bash
cat packages/agent-core/src/skills/{skill-name}/SKILL.md
head -20 packages/agent-core/src/scripts/compiled/{skill-name}.ts
```

**Score the skill (out of 5):**

| Check | ✅ Good | ❌ Needs work |
|-------|---------|-------------|
| Triggers | 8-15 specific, natural phrases | Generic or fewer than 8 |
| Steps | Exact URLs, selectors, error handling | Vague "click the button" |
| Site Notes | Real quirks from browsing (popups, login walls, dynamic loading) | Generic template notes |
| Compiled script | "real selectors from live browsing" in header | "Auto-generated Playwright script" |
| Selectors | Real `data-testid`, `aria-label`, or stable class names | Generic/guessed selectors |

Report: "This skill scores X/5. Needs: [what's missing]"

### Step 3: Browse the Real Site

Navigate to the site and walk through the full user journey:

1. **Open site** → snapshot → check login status
2. **Dismiss popups** (cookie banners, app-install, location — note selectors!)
3. **Walk the flow** step by step:
   - Search/browse → results → detail → cart → checkout
   - Take snapshot at EVERY page
   - Record real selectors: `data-testid`, `aria-label`, unique class names, text content
4. **Verify login** — is Profile 3 (rsinghtomar3011@gmail.com) logged in?
5. **Note all quirks**: redirects, lazy loading, modal interruptions, required fields

### Step 4: Update SKILL.md

Improve the skill definition with real observations:

- **Fix step instructions** — use exact URLs, real button text, real selectors discovered
- **Add missing steps** — popup dismissal, location setting, login verification
- **Update Site Notes** — replace generic notes with actual quirks discovered
- **Improve triggers** — add natural phrases users would actually say
- **Add selector hints** in steps (e.g., "Click 'Add to Cart' `[data-testid='add-to-cart']`")

### Step 5: Update Compiled Script

Update `packages/agent-core/src/scripts/compiled/{skill-name}.ts`:

- Replace generic selectors with real ones from live browsing
- Update header: change "Auto-generated" → "Compiled with real selectors from live browsing"
- Add discovered selector notes in the header comment
- Fix the flow to match reality (handle popups, redirects, etc.)

### Step 6: Report

```
✅ Skill improved: {skill-name}
   Score: {before}/5 → {after}/5
   Changes:
   - SKILL.md: {what changed}
   - Compiled script: {what changed}
   - Real selectors recorded: {count}
   Suggested next skill: {next-skill-name} (Tier {N} — {reason})
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

- Use `browser1` (port 9222) for browsing — NOT `playwright` (that's the test browser)
- Take snapshots frequently — they contain the real accessibility tree with selectors
- If a site requires login and the session expired, note it and move on
- Don't spend more than 3 minutes per skill when batch-compiling
- Sites that are down or behind paywalls: skip and note
- Save progress frequently — don't lose work if something crashes

---

## Mode E: Multi-Browser Parallel Test

Test the Chrome Pool by spawning 3 independent orders from the chat UI and verifying each pool Chrome works on a different site with zero interference.

### Prerequisites

```bash
curl -s http://localhost:8765 | python3 -m json.tool  # Pool status
curl -s http://localhost:9225/json/version             # Test Chrome
curl -s http://localhost:3000                           # Next.js
```

If anything is down:
1. `POOL_SIZE=3 npm run laptop` — launches 3 Chrome windows (9222/9223/9224) + relay on 8765
2. `cd apps/web && npx next dev` — chat UI on localhost:3000
3. Launch a fresh Chrome for `playwright` MCP on an empty port (see Pre-Flight above)

### MCP Tool Mapping

| MCP Server | Chrome Port | Role |
|------------|-------------|------|
| `playwright` (mcp__playwright__*) | 9225+ | YOUR test browser — browse the chat UI only |
| `browser1` (mcp__browser1__*) | 9222 | AGENT's Chrome Slot 0 — observe only |
| `browser2` (mcp__browser2__*) | 9223 | AGENT's Chrome Slot 1 — observe only |
| `browser3` (mcp__browser3__*) | 9224 | AGENT's Chrome Slot 2 — observe only |

### Steps

**1. Open chat UI and login** — Use `playwright` to browse `/login`, sign in, land on dashboard.

**2. Send 3 orders from 3 separate chat tabs** using `playwright`:

- Tab 1: `Book a hotel in Goa for March 22-23 under 4000/night on Booking.com`
- Tab 2: `Order milk, bread and eggs from Blinkit to Sector 62 Noida`
- Tab 3: `Order butter chicken from Zomato to Sector 62 Noida`

**3. Verify slot assignment:**
```bash
curl -s http://localhost:8765 | python3 -m json.tool
```
Expected: `"busy": 3, "ready": 0`

**4. Observe all 3 pool Chromes** (snapshot in parallel):
```
mcp__browser1__browser_snapshot
mcp__browser2__browser_snapshot
mcp__browser3__browser_snapshot
```
Each should be on a DIFFERENT website.

**5. Take screenshots as proof** (all 3 in one call):
```
mcp__browser1__browser_take_screenshot({ filename: "slot0.png" })
mcp__browser2__browser_take_screenshot({ filename: "slot1.png" })
mcp__browser3__browser_take_screenshot({ filename: "slot2.png" })
```

**6. Interact with agent prompts** — answer `ask_user` questions in the correct chat tab via `playwright`, then snapshot browser1/2/3 again.

### Critical Rules

- **`playwright` = chat UI only** — NEVER browse localhost:3000 with browser1/2/3
- **browser1/2/3 = agent's windows** — observe only, don't click/navigate
- **Each browser is isolated** — Slot 0 never affects Slot 1 or Slot 2
- **Parallel calls** — always snapshot all 3 in ONE message
- **about:blank** = agent hasn't started browser work yet (still reasoning)
