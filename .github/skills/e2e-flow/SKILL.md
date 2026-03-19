---
name: e2e-flow
description: Create a complete E2E workflow skill for any website — browse once, auto-compile to native Playwright, replay instantly
---

You are building a new E2E workflow skill for the ShofferAI concierge agent. The key principle: **browse the site ONCE with Playwright MCP, record everything, auto-compile to a native Playwright script that replays instantly on subsequent runs.**

```
First run:   User message → Skill match → LLM + MCP browse → Record → Auto-compile → Save
Next runs:   User message → Skill match → Load cached script → Native Playwright → Done (instant!)
```

## Input

The user provides a website + task, e.g.:
- "MakeMyTrip flight booking"
- "Swiggy food ordering"
- "PayTM electricity bill"

If vague, ask for: specific site, specific task, login method, payment type.

## The Pipeline

### Phase 0: Launch a Dedicated Chrome Window

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

# Verify it's up
sleep 3
curl -s http://localhost:$PORT/json/version
```

⚠️ **Never reuse an existing Chrome window** — always find an empty port and launch fresh. Then connect Playwright MCP: `npx -y @playwright/mcp@latest --cdp-endpoint http://localhost:$PORT`

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

## Step Design Rules

Every step instruction MUST include:
- **Exact action** — URL, button text, element to interact with
- **Snapshot** — "Take a snapshot" after navigation
- **Verification** — How to confirm correct page loaded
- **Error handling** — Popups, out-of-stock, redirects
- **User interaction** — `ask_user` for OTP/choices, `confirm_action` before payment

## Quality Checklist

- [ ] Every step has a snapshot instruction
- [ ] Sensitive data uses `fill_saved_credential` (NEVER plain text)
- [ ] OTP steps use `ask_user` with `input_type: "otp"`
- [ ] Choices use `ask_user` with `input_type: "choice"`
- [ ] Auth step verifies rsinghtomar3011@gmail.com profile
- [ ] Payment steps use `confirm_action` + `collect_payment`
- [ ] `## Site Notes` covers ALL quirks found during research
- [ ] 8-15 trigger phrases in frontmatter
- [ ] SKILL.md created in `packages/agent-core/src/skills/{name}/SKILL.md`

## Output

Report:
1. **Skill created**: Name, file path, steps count
2. **Steps summary**: One-line per step
3. **Auto-compile**: First real user request will generate the native script
4. **Trigger examples**: 3 messages that activate this skill
5. **Known limitations**: What can't be handled yet

Now — what E2E flow are we building?
