import { prisma } from './prisma';
import { RemoteMCPHost } from './remote-mcp-host';
import { RelayBridge } from './relay-bridge';
import { CredentialVault } from './credential-vault';
import { WorkflowEngine } from './workflow-engine';
import { loadSkills, type SkillMetadata } from '@shofferai/agent-core';
import type { MCPHostLike } from '@shofferai/shared';

// Use globalThis to ensure singletons are shared across Next.js route bundles
const g = globalThis as unknown as {
  mcpHost: MCPHostLike & {
    callToolWithSession: RemoteMCPHost['callToolWithSession'];
    isConnected(): boolean;
    releaseSession(sessionId: string): Promise<void>;
  };
  relayBridge: RelayBridge;
  workflowEngine: WorkflowEngine;
  vault: CredentialVault;
  skills: SkillMetadata[];
  __relayBridge: RelayBridge; // Accessed by custom-server.js
};

// Create or reuse the relay bridge / MCP host
if (!g.mcpHost) {
  if (process.env.RELAY_MODE === 'cloud' || process.env.NODE_ENV === 'production') {
    // Production: RelayBridge — laptop connects IN to us (no tunnel needed)
    const bridge = g.relayBridge || new RelayBridge();
    g.relayBridge = bridge;
    g.__relayBridge = bridge; // custom-server.js reads this to wire up WebSocket
    g.mcpHost = bridge;
  } else {
    // Dev: connect OUT to local relay server (laptop runs RelayServer on localhost:8765)
    const relayUrl = process.env.RELAY_LAPTOP_URL || 'ws://localhost:8765';
    g.mcpHost = new RemoteMCPHost(relayUrl, {
      authToken: process.env.RELAY_AUTH_TOKEN,
    });
  }
}

export const remoteMcpHost = g.mcpHost;

export const workflowEngine = g.workflowEngine || new WorkflowEngine(prisma);

export const vault = g.vault || new CredentialVault(prisma);

// Skills loaded from SKILL.md files in packages/agent-core/src/skills/
export const skills = g.skills || loadSkills();

// Cache singletons on globalThis
g.workflowEngine = workflowEngine;
g.vault = vault;
g.skills = skills;
