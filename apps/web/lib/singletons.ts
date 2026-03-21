import { prisma } from './prisma';
import { RemoteMCPHost } from './remote-mcp-host';
import { RelayBridge } from './relay-bridge';
import { CredentialVault } from './credential-vault';
import { WorkflowEngine } from './workflow-engine';
import { PrismaLessonStore } from './lesson-store';
import { loadSkills, type SkillMetadata } from '@shofferai/agent-core';
import type { LessonStore } from '@shofferai/agent-core';
import type { MCPHostLike, TaskRelayMessage } from '@shofferai/shared';

// Use globalThis to ensure singletons are shared across Next.js route bundles
const g = globalThis as unknown as {
  mcpHost: MCPHostLike & {
    callToolWithSession: RemoteMCPHost['callToolWithSession'];
    isConnected(): boolean;
    releaseSession(sessionId: string): Promise<void>;
    sendTaskMessage(msg: TaskRelayMessage): void;
    onTaskEvent(handler: (msg: TaskRelayMessage) => void, taskId?: string): void;
    removeTaskEventHandler(taskId?: string): void;
  };
  relayBridge: RelayBridge;
  workflowEngine: WorkflowEngine;
  vault: CredentialVault;
  lessonStore: LessonStore;
  skills: SkillMetadata[];
  __relayBridge: RelayBridge; // Accessed by custom-server.js
};

// Create or reuse the relay bridge / MCP host
if (!g.mcpHost) {
  console.log('[singletons] Initializing MCP host (RELAY_MODE=%s, NODE_ENV=%s)', process.env.RELAY_MODE, process.env.NODE_ENV);
  if (process.env.RELAY_MODE === 'cloud' || process.env.NODE_ENV === 'production') {
    // Production: RelayBridge — laptop connects IN to us (no tunnel needed)
    console.log('[singletons] Using RelayBridge (cloud/production mode)');
    const bridge = g.relayBridge || new RelayBridge();
    g.relayBridge = bridge;
    g.__relayBridge = bridge; // custom-server.js reads this to wire up WebSocket
    g.mcpHost = bridge;
  } else {
    // Dev: connect OUT to local relay server (laptop runs RelayServer on localhost:8765)
    const relayUrl = process.env.RELAY_LAPTOP_URL || 'ws://localhost:8765';
    console.log('[singletons] Using RemoteMCPHost (dev mode) -> %s', relayUrl);
    g.mcpHost = new RemoteMCPHost(relayUrl, {
      authToken: process.env.RELAY_AUTH_TOKEN,
    });
  }
  console.log('[singletons] MCP host initialized');
}

export const remoteMcpHost = g.mcpHost;

export const workflowEngine = g.workflowEngine || new WorkflowEngine(prisma);

export const vault = g.vault || new CredentialVault(prisma);

export const lessonStore: LessonStore = g.lessonStore || new PrismaLessonStore(prisma);

// Skills loaded from SKILL.md files in packages/agent-core/src/skills/
if (!g.skills) {
  // In Docker/prod: SKILL.md files are copied to /app/skills
  // In dev: resolve from monorepo root
  const skillsDir = process.env.SKILLS_DIR
    || require('path').join(process.cwd(), 'packages', 'agent-core', 'src', 'skills');
  g.skills = loadSkills(skillsDir);
  console.log('[singletons] Loaded %d skills from %s', g.skills.length, skillsDir);
}
export const skills = g.skills;

// Cache singletons on globalThis
g.workflowEngine = workflowEngine;
g.vault = vault;
g.lessonStore = lessonStore;
