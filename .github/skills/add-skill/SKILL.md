---
name: add-skill
description: Add a new website skill for the agent (e.g., Flipkart shopping, Swiggy food, PayTM bills). Use this when asked to create a new skill, add a website, or teach the agent a new task.
---

Create a new agent skill that teaches ShofferAI how to execute a task on a specific website.

## Instructions

### Step 1: Ask what site + task

If not already specified, ask: "What website and what task? (e.g., 'Flipkart — buy electronics', 'Swiggy — order food')"

### Step 2: Browse the real site

Use Playwright MCP to actually navigate the site and map the UI flow:

1. `mcp__playwright__browser_navigate` to the site
2. `mcp__playwright__browser_snapshot` every page
3. Map: Landing → Auth → Search → Results → Detail → Cart → Checkout → Confirmation
4. Note every quirk: popups, login walls, OTP steps, dynamic loading

### Step 3: Create SKILL.md

Create at `packages/agent-core/src/skills/{site-name}-{task}/SKILL.md`:

```markdown
---
name: site-task
description: One-line description
triggers:
  - 8-15 natural trigger phrases
siteUrl: https://example.com
requiresAuth: true
params:
  - name: param_name
    required: true
    hint: Description
---

# Site — Task

Chrome profile: rsinghtomar3011@gmail.com

## Steps

### 1. Gather Requirements
Use `ask_user` for missing params.

### 2. Open Site & Verify Auth
Navigate to site. Snapshot. Verify signed in.

### 3-N. Execute Task
Exact URLs, selectors, actions per step.
Snapshot after every navigation.
`ask_user` for choices/OTP.
`confirm_action` before payments.

### Final. Report Confirmation
Capture and report confirmation details.

## Site Notes
All quirks discovered.
```

### Step 4: Verify

1. Check skill loads: The `loadSkills()` function auto-discovers `*/SKILL.md` files
2. Test trigger matching: Would common user messages match?
3. Walkthrough steps on the real site using Playwright MCP

### Step 5: Report

```
Skill created: {name}
  Path:     packages/agent-core/src/skills/{name}/SKILL.md
  Steps:    {count}
  Triggers: {3 example trigger phrases}
```
