import type { MCPTool, AnthropicTool, MCPHostLike } from '@shofferai/shared';

/**
 * Inner host must support session-aware tool calls and session release.
 * Both RemoteMCPHost and RelayBridge implement this.
 */
interface SessionAwareMCPHost extends MCPHostLike {
  callToolWithSession(
    name: string,
    args: Record<string, unknown>,
    sessionId?: string,
  ): Promise<unknown>;
  releaseSession(sessionId: string): Promise<void>;
  isConnected(): boolean;
}

/**
 * Per-request wrapper around the singleton MCP host.
 * Injects sessionId into every tool call for tab isolation on the laptop.
 *
 * Race-safe: sessionId is passed atomically with each call,
 * not stored as mutable state on the singleton.
 *
 * Usage:
 *   const mcpHost = new SessionMCPHost(remoteMcpHost, taskId);
 *   const agent = new AgentExecutor({ mcpHost, ... });
 */
export class SessionMCPHost implements MCPHostLike {
  constructor(
    private inner: SessionAwareMCPHost,
    private sessionId: string
  ) {}

  async connect(): Promise<void> {
    if (!this.inner.isConnected()) {
      await this.inner.connect();
    }
  }

  getTools(): MCPTool[] {
    return this.inner.getTools();
  }

  getToolsAsAnthropicFormat(): AnthropicTool[] {
    return this.inner.getToolsAsAnthropicFormat();
  }

  isMCPTool(toolName: string): boolean {
    return this.inner.isMCPTool(toolName);
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    return this.inner.callToolWithSession(name, args, this.sessionId);
  }

  async disconnect(): Promise<void> {
    // Release the Chrome slot on the laptop (don't disconnect the singleton)
    try {
      await this.inner.releaseSession(this.sessionId);
    } catch {
      // Best effort — slot TTL will clean up eventually
    }
  }
}
