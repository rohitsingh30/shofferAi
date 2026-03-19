---
name: test-skills
description: Validate all agent skills — frontmatter, triggers, steps, site notes, consistency. Use this when asked to validate skills, check skill quality, or audit SKILL.md files.
---

Run a comprehensive validation of all SKILL.md files in `packages/agent-core/src/skills/`.

## Instructions

### Step 1: Discover all skills

```bash
ls packages/agent-core/src/skills/*/SKILL.md
```

### Step 2: Validate each skill

For EVERY SKILL.md file, check:

**Frontmatter (YAML between --- markers):**
- [ ] `name` field exists and matches directory name
- [ ] `description` exists and is under 100 chars
- [ ] `triggers` array exists with 6+ entries (natural phrases users would say)
- [ ] `siteUrl` exists and is a valid URL
- [ ] `requiresAuth` is set (true/false)
- [ ] `params` array exists with at least 1 param, each having `name`, `required`, `hint`

**Steps section:**
- [ ] Has numbered steps (### 1, ### 2, etc.)
- [ ] Step 1 gathers requirements or clarifies user intent
- [ ] Has a step to open site and verify login
- [ ] Has `ask_user` calls for user choices (input_type specified)
- [ ] Has `confirm_action` before any payment/booking
- [ ] Has `collect_payment` for checkout
- [ ] Has a final confirmation step reporting order/booking details
- [ ] Every navigation step includes "Take snapshot"
- [ ] Contains "Do NOT proceed unless user confirms"
- [ ] Contains "WAIT for payment confirmation" or "STOP and WAIT"

**Site Notes section:**
- [ ] `## Site Notes` section exists
- [ ] Mentions Chrome profile / operator login
- [ ] Mentions session expiry handling
- [ ] Has site-specific quirks documented

**Security:**
- [ ] Never asks user for login credentials (operator handles login)
- [ ] Uses `fill_saved_credential` or operator profile for sensitive data
- [ ] No hardcoded passwords, API keys, or secrets

### Step 3: Cross-skill consistency

Check across ALL skills:
- [ ] All use same `confirm_action` → `collect_payment` → confirm pattern
- [ ] All mention "Open a NEW tab" (never hijack existing tab)
- [ ] All have session expiry handling with same message pattern
- [ ] All params use consistent naming (e.g. `budget` not `max_price`)
- [ ] No duplicate trigger phrases across different skills
- [ ] All `collect_payment` descriptions match skill name

### Step 4: Run the automated test

```bash
npx vitest run packages/agent-core/src/skills/skills.test.ts
```

If the test file doesn't exist yet, CREATE IT with these checks automated:

```typescript
// packages/agent-core/src/skills/skills.test.ts
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'fs';
import { join, basename } from 'path';

const SKILLS_DIR = join(__dirname);

function getSkillFiles() {
  return readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => join(SKILLS_DIR, d.name, 'SKILL.md'))
    .filter(f => { try { readFileSync(f); return true; } catch { return false; } });
}

function parseFrontmatter(content: string) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const lines = match[1].split('\n');
  const result: Record<string, any> = {};
  let currentKey = '';
  let currentArray: string[] = [];
  let inArray = false;

  for (const line of lines) {
    if (line.match(/^\w+:/)) {
      if (inArray) { result[currentKey] = currentArray; inArray = false; currentArray = []; }
      const [key, ...rest] = line.split(':');
      const value = rest.join(':').trim();
      currentKey = key.trim();
      if (value === '') { inArray = false; }
      else { result[currentKey] = value; }
    } else if (line.trim().startsWith('- ') && !line.trim().startsWith('- name:')) {
      if (!inArray) { inArray = true; currentArray = []; }
      currentArray.push(line.trim().slice(2));
    }
  }
  if (inArray) result[currentKey] = currentArray;
  return result;
}

describe('Agent Skills Validation', () => {
  const skillFiles = getSkillFiles();

  it('has at least 15 skills', () => {
    expect(skillFiles.length).toBeGreaterThanOrEqual(15);
  });

  const allTriggers = new Map<string, string>();

  describe.each(skillFiles.map(f => [basename(join(f, '..')), f]))('%s', (name, filePath) => {
    const content = readFileSync(filePath as string, 'utf-8');
    const fm = parseFrontmatter(content);

    it('has valid frontmatter', () => {
      expect(fm).not.toBeNull();
      expect(fm!.name).toBeDefined();
      expect(fm!.description).toBeDefined();
      expect(fm!.siteUrl).toBeDefined();
      expect(fm!.requiresAuth).toBeDefined();
    });

    it('name matches directory', () => {
      expect(fm!.name).toBe(name);
    });

    it('has 6+ trigger phrases', () => {
      expect(fm!.triggers).toBeDefined();
      expect(Array.isArray(fm!.triggers)).toBe(true);
      expect(fm!.triggers.length).toBeGreaterThanOrEqual(6);
    });

    it('has params with required fields', () => {
      expect(content).toMatch(/params:/);
      expect(content).toMatch(/name:/);
      expect(content).toMatch(/hint:/);
    });

    it('has numbered steps', () => {
      const steps = content.match(/### \d+/g) || [];
      expect(steps.length).toBeGreaterThanOrEqual(4);
    });

    it('gathers requirements in step 1', () => {
      const step1 = content.match(/### 1[\s\S]*?(?=### 2)/);
      expect(step1).not.toBeNull();
      expect(step1![0]).toMatch(/ask_user|clarif|confirm|gather|require/i);
    });

    it('opens site in a NEW tab', () => {
      expect(content).toMatch(/NEW tab/i);
    });

    it('verifies login', () => {
      expect(content).toMatch(/verify.*log|logged in/i);
    });

    it('handles session expiry', () => {
      expect(content).toMatch(/session expired/i);
    });

    it('uses ask_user for choices', () => {
      expect(content).toMatch(/ask_user/);
    });

    it('uses confirm_action before payment', () => {
      expect(content).toMatch(/confirm_action/);
    });

    it('uses collect_payment for checkout', () => {
      expect(content).toMatch(/collect_payment/);
    });

    it('waits for user confirmation', () => {
      expect(content).toMatch(/WAIT|Do NOT proceed/i);
    });

    it('takes snapshots', () => {
      expect(content).toMatch(/[Tt]ake snapshot/);
    });

    it('has Site Notes section', () => {
      expect(content).toMatch(/## Site Notes/);
    });

    it('mentions Chrome profile or operator', () => {
      expect(content).toMatch(/Chrome profile|operator/i);
    });

    it('never asks user for login credentials', () => {
      expect(content).toMatch(/Do NOT ask user for credentials/i);
    });

    it('has substantive content (80+ lines)', () => {
      const lines = content.split('\n').length;
      expect(lines).toBeGreaterThanOrEqual(60);
    });
  });

  it('no duplicate triggers across skills', () => {
    const triggerMap = new Map<string, string>();
    const duplicates: string[] = [];

    for (const f of skillFiles) {
      const name = basename(join(f, '..'));
      const content = readFileSync(f, 'utf-8');
      const fm = parseFrontmatter(content);
      if (fm?.triggers) {
        for (const t of fm.triggers) {
          const normalized = t.toLowerCase().trim();
          if (triggerMap.has(normalized)) {
            duplicates.push(`"${normalized}" in both ${triggerMap.get(normalized)} and ${name}`);
          }
          triggerMap.set(normalized, name);
        }
      }
    }
    expect(duplicates).toEqual([]);
  });
});
```

### Step 5: Report

Generate a summary table:

```
Skill Validation Report
────────────────────────────────────────────────
| Skill              | Triggers | Steps | Notes | Status |
|--------------------|----------|-------|-------|--------|
| booking-hotel      | 8        | 7     | ✓     | ✅ PASS |
| zomato-food        | 5        | 6     | ✓     | ✅ PASS |
...
────────────────────────────────────────────────
Total: XX skills, XX passed, XX failed
Duplicate triggers: [list any]
Missing patterns: [list any skills missing confirm_action/collect_payment/etc]
```

Fix any issues found before reporting success.
