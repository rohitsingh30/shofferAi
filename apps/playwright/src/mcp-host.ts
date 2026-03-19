import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { logger, BrowserError, type MCPTool, type AnthropicTool, type MCPHostLike } from '@shofferai/shared';

/**
 * MCPHost connects to Playwright MCP via a running Chrome CDP instance.
 * Chrome must already be running with --remote-debugging-port on the given endpoint.
 * ChromePool handles launching Chrome — this class only connects to it.
 */
export class MCPHost implements MCPHostLike {
  private client: Client | null = null;
  private transport: StdioClientTransport | null = null;
  private tools: MCPTool[] = [];
  private cdpEndpoint: string;

  constructor(options: { cdpEndpoint: string }) {
    this.cdpEndpoint = options.cdpEndpoint;
  }

  async connect(): Promise<void> {
    const args = [
      '@playwright/mcp@latest',
      '--cdp-endpoint', this.cdpEndpoint,
    ];

    this.transport = new StdioClientTransport({
      command: 'npx',
      args,
    });

    this.client = new Client({
      name: 'shofferai-agent',
      version: '1.0.0',
    });

    await this.client.connect(this.transport);
    logger.info('Connected to Playwright MCP via CDP', { cdpEndpoint: this.cdpEndpoint });

    // Discover available tools
    const response = await this.client.listTools();
    this.tools = response.tools.map((t) => ({
      name: t.name,
      description: t.description || '',
      inputSchema: t.inputSchema as Record<string, unknown>,
    }));

    logger.info(`Discovered ${this.tools.length} Playwright MCP tools`);
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
    args: Record<string, unknown>
  ): Promise<unknown> {
    if (!this.client) {
      throw new BrowserError('MCP client not connected');
    }

    logger.debug(`Calling MCP tool: ${name}`, { toolArgs: args });

    try {
      const result = await this.client.callTool({
        name,
        arguments: args,
      });
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown MCP error';
      throw new BrowserError(`MCP tool ${name} failed: ${message}`, { tool: name, args });
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
    if (this.transport) {
      await this.transport.close();
      this.transport = null;
    }
    logger.info('Disconnected from Playwright MCP server');
  }
}
