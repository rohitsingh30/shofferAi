import type { MCPTool, AnthropicTool, MCPHostLike } from '@shofferai/shared';
import { mcpEventBus } from './mcp-event-bus';

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
    console.log('[mcp] session=%s callTool(%s) args=%s', this.sessionId, name, JSON.stringify(args).slice(0, 200));
    const start = Date.now();
    mcpEventBus.emitToolStart(this.sessionId, name, args);
    try {
      const result = await this.inner.callToolWithSession(name, args, this.sessionId);
      const duration = Date.now() - start;
      console.log('[mcp] session=%s callTool(%s) OK in %dms', this.sessionId, name, duration);
      mcpEventBus.emitToolEnd(this.sessionId, name, duration, result);
      return result;
    } catch (err) {
      const duration = Date.now() - start;
      console.error('[mcp] session=%s callTool(%s) FAILED in %dms:', this.sessionId, name, duration, err);
      mcpEventBus.emitToolError(this.sessionId, name, duration, err);
      throw err;
    }
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
