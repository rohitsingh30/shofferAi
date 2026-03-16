import { logger, BrowserError, type MCPTool, type AnthropicTool, type MCPHostLike } from '@shofferai/shared';
import { RelayClient } from './relay-client';

export class RemoteMCPHost implements MCPHostLike {
  private relayClient: RelayClient;
  private tools: MCPTool[] = [];
  private url: string;

  constructor(url: string, options?: { authToken?: string }) {
    this.url = url;
    this.relayClient = new RelayClient({
      authToken: options?.authToken,
    });
  }

  async connect(): Promise<void> {
    await this.relayClient.connect(this.url);
    logger.info('RemoteMCPHost connected to relay');

    // Fetch and cache tool list from laptop
    const remoteTools = await this.relayClient.listTools();
    this.tools = remoteTools.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
    }));

    logger.info(`RemoteMCPHost discovered ${this.tools.length} tools via relay`);
  }

  getTools(): MCPTool[] {
    return this.tools;
  }

  getToolsAsAnthropicFormat(): AnthropicTool[] {
    return this.tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.inputSchema,
    }));
  }

  isMCPTool(toolName: string): boolean {
    return this.tools.some((t) => t.name === toolName);
  }

  /**
   * Call a tool without session isolation (legacy/default behavior).
   */
  async callTool(
    name: string,
    args: Record<string, unknown>,
  ): Promise<unknown> {
    return this.callToolWithSession(name, args);
  }

  /**
   * Call a tool with session-based tab isolation.
   * Each sessionId gets its own browser tab on the laptop.
   */
  async callToolWithSession(
    name: string,
    args: Record<string, unknown>,
    sessionId?: string,
  ): Promise<unknown> {
    if (!this.relayClient.isConnected()) {
      throw new BrowserError('RemoteMCPHost: relay not connected');
    }

    logger.debug(`RemoteMCPHost calling tool: ${name}`, { toolArgs: args, sessionId });

    try {
      const result = await this.relayClient.callTool(name, args, sessionId);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown relay error';
      throw new BrowserError(`Remote MCP tool ${name} failed: ${message}`, { tool: name, args });
    }
  }

  async releaseSession(sessionId: string): Promise<void> {
    await this.relayClient.releaseSession(sessionId);
  }

  async disconnect(): Promise<void> {
    await this.relayClient.disconnect();
    this.tools = [];
    logger.info('RemoteMCPHost disconnected');
  }

  isConnected(): boolean {
    return this.relayClient.isConnected();
  }
}
