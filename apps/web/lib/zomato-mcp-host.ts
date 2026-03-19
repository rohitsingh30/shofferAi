import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { logger, type MCPTool, type AnthropicTool, type MCPHostLike } from '@shofferai/shared';
import { ZomatoOAuthProvider } from './zomato-oauth-provider';

const ZOMATO_MCP_URL = 'https://mcp-server.zomato.com/mcp';

/**
 * MCP host that connects to Zomato's official MCP server.
 * Provides food ordering tools: restaurant search, menu browsing, cart, checkout.
 */
export class ZomatoMCPHost implements MCPHostLike {
  private client: Client | null = null;
  private transport: StreamableHTTPClientTransport | null = null;
  private tools: MCPTool[] = [];
  private oauthProvider: ZomatoOAuthProvider;
  private serverUrl: string;
  private connected = false;

  constructor(options?: {
    serverUrl?: string;
    oauthProvider?: ZomatoOAuthProvider;
  }) {
    this.serverUrl = options?.serverUrl || ZOMATO_MCP_URL;
    this.oauthProvider = options?.oauthProvider || new ZomatoOAuthProvider();
  }

  async connect(): Promise<void> {
    if (this.connected) return;

    try {
      // Get OAuth token
      const accessToken = await this.oauthProvider.getAccessToken();

      // Create transport with auth header
      const headers: Record<string, string> = {};
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      this.transport = new StreamableHTTPClientTransport(
        new URL(this.serverUrl),
        { requestInit: { headers } }
      );

      this.client = new Client(
        { name: 'shofferai-agent', version: '1.0.0' },
        { capabilities: {} }
      );

      await this.client.connect(this.transport);
      logger.info('ZomatoMCPHost: connected to Zomato MCP server');

      // Discover tools
      const toolsResult = await this.client.listTools();
      this.tools = (toolsResult.tools || []).map((t) => ({
        name: t.name,
        description: t.description || '',
        inputSchema: (t.inputSchema || {}) as Record<string, unknown>,
      }));

      this.connected = true;
      logger.info(`ZomatoMCPHost: discovered ${this.tools.length} Zomato tools: ${this.tools.map(t => t.name).join(', ')}`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      logger.warn(`ZomatoMCPHost: failed to connect — ${msg}. Zomato ordering will be unavailable.`);
      // Don't throw — graceful degradation. Agent falls back to browse_website.
      this.tools = [];
      this.connected = false;
    }
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

  async callTool(
    name: string,
    args: Record<string, unknown>,
  ): Promise<unknown> {
    if (!this.client || !this.connected) {
      throw new Error('ZomatoMCPHost: not connected');
    }

    logger.debug(`ZomatoMCPHost: calling tool ${name}`, { args });

    try {
      const result = await this.client.callTool({
        name,
        arguments: args,
      });

      logger.debug(`ZomatoMCPHost: tool ${name} completed`);
      return result;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`ZomatoMCPHost: tool ${name} failed — ${msg}`);
      throw new Error(`Zomato MCP tool ${name} failed: ${msg}`);
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.close();
      } catch {
        // ignore
      }
    }
    this.client = null;
    this.transport = null;
    this.tools = [];
    this.connected = false;
    logger.info('ZomatoMCPHost: disconnected');
  }

  isConnected(): boolean {
    return this.connected;
  }
}
