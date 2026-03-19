/**
 * Validates all SKILL.md files across the skills directory.
 *
 * Checks: frontmatter, triggers, steps, security, site notes, cross-skill consistency.
 */

import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, existsSync } from 'fs';
import { join, basename } from 'path';

const SKILLS_DIR = join(__dirname);

function getSkillDirs(): string[] {
  return readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .filter((d) => existsSync(join(SKILLS_DIR, d.name, 'SKILL.md')))
    .map((d) => d.name);
}

function readSkill(name: string): string {
  return readFileSync(join(SKILLS_DIR, name, 'SKILL.md'), 'utf-8');
}

function parseFrontmatter(content: string): Record<string, unknown> | null {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const lines = match[1].split('\n');
  const result: Record<string, unknown> = {};
  let currentKey = '';
  let currentArray: string[] = [];
  let inTriggerArray = false;

  for (const line of lines) {
    const keyMatch = line.match(/^(\w+):\s*(.*)/);
    if (keyMatch) {
      if (inTriggerArray) {
        result[currentKey] = currentArray;
        inTriggerArray = false;
        currentArray = [];
      }
      currentKey = keyMatch[1];
      const value = keyMatch[2].trim();
      if (value === '') {
        // Could be start of array or object
      } else {
        result[currentKey] = value;
      }
    } else if (line.trim().startsWith('- ') && !line.trim().startsWith('- name:') && !line.trim().startsWith('- name ')) {
      // Simple array item (triggers)
      if (!inTriggerArray) {
        inTriggerArray = true;
        currentArray = [];
      }
      currentArray.push(line.trim().slice(2).trim());
    }
  }
  if (inTriggerArray) result[currentKey] = currentArray;
  return result;
}

function countSteps(content: string): number {
  return (content.match(/^### \d+/gm) || []).length;
}

function getBody(content: string): string {
  return content.replace(/^---[\s\S]*?---\n*/, '');
}

describe('Agent Skills — Full Validation', () => {
  const skillDirs = getSkillDirs();

  it('has at least 15 skills', () => {
    expect(skillDirs.length).toBeGreaterThanOrEqual(15);
  });

  // ─── Per-skill checks ────────────────────────────────────────

  describe.each(skillDirs)('%s', (name) => {
    const content = readSkill(name);
    const fm = parseFrontmatter(content);
    const body = getBody(content);

    // Frontmatter
    describe('frontmatter', () => {
      it('exists', () => {
        expect(fm).not.toBeNull();
      });

      it('name matches directory', () => {
        expect(fm!.name).toBe(name);
      });

      it('has description', () => {
        expect(fm!.description).toBeDefined();
        expect(typeof fm!.description).toBe('string');
        expect((fm!.description as string).length).toBeGreaterThan(10);
      });

      it('has siteUrl', () => {
        expect(fm!.siteUrl).toBeDefined();
        expect((fm!.siteUrl as string)).toMatch(/^https?:\/\//);
      });

      it('has requiresAuth', () => {
        expect(fm!.requiresAuth).toBeDefined();
      });

      it('has 6+ triggers', () => {
        const triggers = fm!.triggers as string[];
        expect(triggers).toBeDefined();
        expect(Array.isArray(triggers)).toBe(true);
        expect(triggers.length).toBeGreaterThanOrEqual(6);
      });

      it('has params section', () => {
        expect(content).toMatch(/params:/);
        // At least one param with name and hint
        expect(content).toMatch(/- name:/);
        expect(content).toMatch(/hint:/);
      });
    });

    // Steps structure
    describe('steps', () => {
      it('has 4+ numbered steps', () => {
        expect(countSteps(content)).toBeGreaterThanOrEqual(4);
      });

      it('step 1 gathers requirements', () => {
        const step1Match = body.match(/### 1[\s\S]*?(?=### 2)/);
        expect(step1Match).not.toBeNull();
        const step1 = step1Match![0].toLowerCase();
        expect(
          step1.includes('ask_user') ||
          step1.includes('clarif') ||
          step1.includes('confirm') ||
          step1.includes('gather') ||
          step1.includes('require') ||
          step1.includes('determine') ||
          step1.includes('understand') ||
          step1.includes('get ')
        ).toBe(true);
      });

      it('opens site in a NEW tab', () => {
        expect(body).toMatch(/NEW tab/);
      });

      it('verifies login status', () => {
        expect(body.toLowerCase()).toMatch(/verify|verified|logged in|log.?in/);
      });

      it('takes snapshots after navigation', () => {
        const snapshotCount = (body.match(/[Tt]ake (?:a )?snapshot/g) || []).length;
        expect(snapshotCount).toBeGreaterThanOrEqual(2);
      });
    });

    // Determine if this is a transactional skill (involves payment as an actual step)
    // Look for collect_payment in a step context (### heading nearby), not just in Site Notes
    const stepsSection = body.split('## Site Notes')[0] || body;
    const isTransactional = stepsSection.includes('collect_payment');
    const isInfoSkill = !isTransactional;

    // User interaction patterns
    describe('user interaction', () => {
      it('uses ask_user for choices', () => {
        expect(body).toMatch(/ask_user/);
      });

      it('uses confirm_action or confirm before action', () => {
        expect(body).toMatch(/confirm_action|confirm|review|verify/i);
      });

      if (isTransactional) {
        it('uses collect_payment for checkout', () => {
          expect(body).toMatch(/collect_payment/);
        });

        it('waits for user before proceeding', () => {
          expect(body).toMatch(/WAIT|Do NOT proceed/i);
        });

        it('collect_payment has payment context', () => {
          // Must mention amount/price/total and some description
          expect(body).toMatch(/amount|price|total|cost|fee/i);
          expect(body).toMatch(/summary|description|details|order/i);
        });
      }

      if (isInfoSkill) {
        it('reports results to user', () => {
          expect(body).toMatch(/[Rr]eport|[Pp]resent|[Ss]how|[Dd]isplay|[Ss]hare|[Ss]napshot/);
        });
      }
    });

    // Security
    describe('security', () => {
      it('never asks user for credentials', () => {
        const requiresAuth = content.includes('requiresAuth: true');
        if (requiresAuth) {
          // Auth-required skills must mention not asking for credentials
          expect(body).toMatch(/Do NOT ask user for credentials|not ask.*credentials|credentials.*operator|login transparently|operator credentials/i);
        }
      });

      it('handles session expiry or auth state', () => {
        // Transactional/login-required skills must handle session expiry
        // Public/info skills may not need login at all
        const requiresAuth = content.includes('requiresAuth: true');
        if (requiresAuth) {
          expect(body).toMatch(/session expired|session.*expir|re-login|sign.?in|log.?in|not logged/i);
        }
      });

      it('mentions operator/Chrome profile', () => {
        expect(body.toLowerCase()).toMatch(/chrome profile|operator|profile 3/);
      });

      it('no hardcoded secrets', () => {
        // Allow "password" in context of form fields, but not actual credentials
        expect(body).not.toMatch(/password\s*[:=]\s*["'][A-Za-z0-9!@#$%]{6,}/i);
        expect(body).not.toMatch(/api[_-]?key\s*[:=]\s*["'][A-Za-z0-9]{10,}/i);
      });
    });

    // Site Notes
    describe('site notes', () => {
      it('has Site Notes section', () => {
        expect(content).toMatch(/## Site Notes/);
      });

      it('site notes have 5+ points', () => {
        const notesSection = content.split('## Site Notes')[1] || '';
        const bulletPoints = (notesSection.match(/^- /gm) || []).length;
        expect(bulletPoints).toBeGreaterThanOrEqual(5);
      });
    });

    // Content quality
    describe('quality', () => {
      it('has 60+ lines', () => {
        expect(content.split('\n').length).toBeGreaterThanOrEqual(60);
      });

      if (isTransactional) {
        it('has confirm before payment flow', () => {
          const confirmIdx = stepsSection.indexOf('confirm_action');
          const paymentIdx = stepsSection.indexOf('collect_payment');
          if (confirmIdx >= 0 && paymentIdx >= 0) {
            expect(confirmIdx).toBeLessThan(paymentIdx);
          }
        });
      }
    });
  });

  // ─── Cross-skill consistency ─────────────────────────────────

  describe('cross-skill consistency', () => {
    it('minimal duplicate triggers (< 5% overlap)', () => {
      const triggerMap = new Map<string, string>();
      const duplicates: string[] = [];

      for (const name of skillDirs) {
        const content = readSkill(name);
        const fm = parseFrontmatter(content);
        const triggers = fm?.triggers as string[] | undefined;
        if (!triggers) continue;

        for (const t of triggers) {
          const normalized = t.toLowerCase().trim();
          if (triggerMap.has(normalized)) {
            duplicates.push(`"${normalized}" in both ${triggerMap.get(normalized)} and ${name}`);
          }
          triggerMap.set(normalized, name);
        }
      }
      // With 500 skills, some overlap is expected (< 5% of total triggers)
      const totalTriggers = triggerMap.size + duplicates.length;
      const dupeRate = duplicates.length / totalTriggers;
      expect(dupeRate).toBeLessThan(0.05);
    });

    it('all skills use NEW tab pattern', () => {
      for (const name of skillDirs) {
        const content = readSkill(name);
        expect(content).toMatch(/NEW tab/);
      }
    });

    it('auth-required skills handle session expiry', () => {
      let authCount = 0;
      let handledCount = 0;
      for (const name of skillDirs) {
        const content = readSkill(name);
        if (content.includes('requiresAuth: true')) {
          authCount++;
          if (content.toLowerCase().match(/session expired|re-login|sign.?in|not logged/)) {
            handledCount++;
          }
        }
      }
      // At least 90% of auth-required skills should handle session expiry
      expect(handledCount / authCount).toBeGreaterThan(0.9);
    });

    it('most transactional skills use confirm_action + collect_payment', () => {
      let transactionalCount = 0;
      let withConfirm = 0;
      for (const name of skillDirs) {
        const content = readSkill(name);
        const steps = (content.split('## Site Notes')[0] || content);
        if (steps.includes('collect_payment')) {
          transactionalCount++;
          if (steps.includes('confirm_action')) {
            withConfirm++;
          }
        }
      }
      // At least 70% of skills should be transactional
      expect(transactionalCount).toBeGreaterThan(skillDirs.length * 0.7);
      // At least 90% of transactional skills should have confirm_action
      expect(withConfirm / transactionalCount).toBeGreaterThan(0.9);
    });

    it('total trigger count is healthy (100+)', () => {
      let total = 0;
      for (const name of skillDirs) {
        const fm = parseFrontmatter(readSkill(name));
        total += (fm?.triggers as string[] || []).length;
      }
      expect(total).toBeGreaterThanOrEqual(100);
    });
  });
});
