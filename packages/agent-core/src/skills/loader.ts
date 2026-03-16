import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { SkillMetadata } from './types';

/**
 * Parse YAML-like frontmatter from a SKILL.md file.
 * Supports: strings, booleans, string arrays (with "- item" syntax),
 * and arrays of objects (with "  - name: x" syntax).
 */
function parseFrontmatter(content: string): { meta: Record<string, unknown>; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return { meta: {}, body: content };
  }

  const [, yaml, body] = match;
  const meta: Record<string, unknown> = {};
  let currentKey = '';
  let currentArray: unknown[] | null = null;
  let currentObject: Record<string, string> | null = null;

  for (const rawLine of yaml.split('\n')) {
    const line = rawLine;

    // Top-level key: value
    const kvMatch = line.match(/^(\w+):\s*(.*)$/);
    if (kvMatch) {
      // Flush previous array
      if (currentArray && currentKey) {
        if (currentObject) {
          currentArray.push(currentObject);
          currentObject = null;
        }
        meta[currentKey] = currentArray;
      }

      currentKey = kvMatch[1];
      const val = kvMatch[2].trim();

      if (val === '' || val === '>') {
        // Start of array or multiline
        currentArray = [];
        currentObject = null;
      } else if (val === 'true' || val === 'false') {
        meta[currentKey] = val === 'true';
        currentArray = null;
      } else {
        meta[currentKey] = val;
        currentArray = null;
      }
      continue;
    }

    // Array item: "  - value" or "    key: value" (object property)
    const arrayItemMatch = line.match(/^\s{2,4}-\s+(.+)$/);
    if (arrayItemMatch && currentArray !== null) {
      const itemVal = arrayItemMatch[1];
      const objPropMatch = itemVal.match(/^(\w+):\s*(.+)$/);

      if (objPropMatch) {
        // Object property in array item
        if (currentObject && currentObject[objPropMatch[1]] !== undefined) {
          // New object starts (duplicate key)
          currentArray.push(currentObject);
          currentObject = {};
        }
        if (!currentObject) currentObject = {};
        const propVal = objPropMatch[2].trim();
        currentObject[objPropMatch[1]] = propVal === 'true' ? true as unknown as string : propVal === 'false' ? false as unknown as string : propVal;
      } else {
        // Simple string array item
        if (currentObject) {
          currentArray.push(currentObject);
          currentObject = null;
        }
        currentArray.push(itemVal);
      }
      continue;
    }

    // Object property continuation: "    key: value"
    const objPropCont = line.match(/^\s{4,}(\w+):\s*(.+)$/);
    if (objPropCont && currentObject) {
      const propVal = objPropCont[2].trim();
      currentObject[objPropCont[1]] = propVal === 'true' ? true as unknown as string : propVal === 'false' ? false as unknown as string : propVal;
      continue;
    }

    // Multiline string continuation
    if (currentKey && typeof meta[currentKey] === 'string' && line.startsWith('  ')) {
      meta[currentKey] = (meta[currentKey] as string) + ' ' + line.trim();
    }
  }

  // Flush final array
  if (currentArray && currentKey) {
    if (currentObject) {
      currentArray.push(currentObject);
    }
    meta[currentKey] = currentArray;
  }

  return { meta, body: body.trim() };
}

/**
 * Load all SKILL.md files from the skills directory.
 * Each subdirectory with a SKILL.md file is a skill.
 */
export function loadSkills(skillsDir?: string): SkillMetadata[] {
  const dir = skillsDir || join(__dirname, '.');
  const skills: SkillMetadata[] = [];

  let entries: string[];
  try {
    entries = readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch {
    return skills;
  }

  for (const entry of entries) {
    const skillFile = join(dir, entry, 'SKILL.md');
    if (!existsSync(skillFile)) continue;

    const content = readFileSync(skillFile, 'utf-8');
    const { meta, body } = parseFrontmatter(content);

    skills.push({
      name: (meta.name as string) || entry,
      description: (meta.description as string) || '',
      triggers: (meta.triggers as string[]) || [],
      siteUrl: (meta.siteUrl as string) || '',
      requiresAuth: (meta.requiresAuth as boolean) || false,
      params: (meta.params as SkillMetadata['params']) || [],
      instructions: body,
    });
  }

  return skills;
}

/**
 * Match a user message to a skill based on trigger phrases.
 * Returns the best matching skill or null.
 */
export function matchSkill(skills: SkillMetadata[], userMessage: string): SkillMetadata | null {
  const msg = userMessage.toLowerCase();
  let bestSkill: SkillMetadata | null = null;
  let bestScore = 0;

  for (const skill of skills) {
    let score = 0;

    for (const trigger of skill.triggers) {
      if (msg.includes(trigger.toLowerCase())) {
        score += 1;
      }
    }

    // Domain mention is a strong signal
    if (skill.siteUrl) {
      const domain = skill.siteUrl.replace('https://', '').replace('www.', '');
      if (msg.includes(domain)) {
        score += 3;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestSkill = skill;
    }
  }

  return bestScore >= 1 ? bestSkill : null;
}
