/**
 * Cloud singletons.
 *
 * After the migration to the Browser Operations Service, the cloud no longer
 * runs a relay server, ChromePool, or laptop bridge. The browser is reached
 * over MCP Streamable HTTP at BROWSER_OPS_MCP_URL (default
 * http://127.0.0.1:8787/mcp — the local playwrightRunner).
 *
 * Each chat task constructs its own `BrowserOpsHost` (per-task session_id
 * isolation); the underlying MCP client connection is shared via the
 * singleton below.
 */

import { prisma } from './prisma';
import { CredentialVault } from './credential-vault';
import { WorkflowEngine } from './workflow-engine';
import { PrismaLessonStore } from './lesson-store';
import { loadSkills, type SkillMetadata } from '@shofferai/agent-core';
import type { LessonStore } from '@shofferai/agent-core';
import { BrowserOpsMcpClient } from './browser-ops';

const g = globalThis as unknown as {
  browserOpsClient?: BrowserOpsMcpClient;
  workflowEngine?: WorkflowEngine;
  vault?: CredentialVault;
  lessonStore?: LessonStore;
  skills?: SkillMetadata[];
};

const BROWSER_OPS_MCP_URL = process.env.BROWSER_OPS_MCP_URL || 'http://127.0.0.1:8787/mcp';
const BROWSER_OPS_TOKEN   = process.env.BROWSER_OPS_TOKEN || process.env.RUNNER_TOKEN;

if (!g.browserOpsClient) {
  console.log('[singletons] Browser Ops MCP client → %s', BROWSER_OPS_MCP_URL);
  if (!BROWSER_OPS_TOKEN) {
    console.warn('[singletons] BROWSER_OPS_TOKEN unset — runner will reject calls (set in env)');
  }
  g.browserOpsClient = new BrowserOpsMcpClient(BROWSER_OPS_MCP_URL, BROWSER_OPS_TOKEN);
}

export const browserOpsClient = g.browserOpsClient;

export const workflowEngine = g.workflowEngine || new WorkflowEngine(prisma);

export const vault = g.vault || new CredentialVault(prisma);

export const lessonStore: LessonStore = g.lessonStore || new PrismaLessonStore(prisma);

if (!g.skills) {
  // Resolve skills directory robustly:
  //   1. Explicit SKILLS_DIR env (preferred — set in apps/web/.env.local for dev,
  //      Dockerfile copies SKILL.md files to /app/skills in prod)
  //   2. Walk up from cwd looking for packages/agent-core/src/skills
  //      (handles cwd=apps/web vs cwd=monorepo-root)
  let skillsDir = process.env.SKILLS_DIR;
  if (!skillsDir) {
    const path = require('path');
    const fs = require('fs');
    let dir = process.cwd();
    for (let i = 0; i < 4; i++) {
      const candidate = path.join(dir, 'packages', 'agent-core', 'src', 'skills');
      if (fs.existsSync(candidate)) { skillsDir = candidate; break; }
      dir = path.dirname(dir);
    }
    if (!skillsDir) {
      skillsDir = path.join(process.cwd(), 'packages', 'agent-core', 'src', 'skills');
    }
  }
  g.skills = loadSkills(skillsDir);
  console.log('[singletons] Loaded %d skills from %s', g.skills.length, skillsDir);
}
export const skills = g.skills;

g.workflowEngine = workflowEngine;
g.vault = vault;
g.lessonStore = lessonStore;
