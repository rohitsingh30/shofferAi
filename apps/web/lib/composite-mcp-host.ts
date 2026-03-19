import { logger, type MCPTool, type AnthropicTool, type MCPHostLike } from '@shofferai/shared';

/**
 * Composite MCP host that wraps multiple MCPHostLike instances.
 * Routes tool calls to the correct host based on tool name.
 *
 * Usage:
 *   const composite = new CompositeMCPHost([playwrightHost, zomatoHost]);
 *   await composite.connect(); // connects all hosts (graceful if some fail)
 *   composite.callTool('browser_click', args);  // → playwrightHost
 *   composite.callTool('create_cart', args);     // → zomatoHost
 */
export class CompositeMCPHost implements MCPHostLike {
  private hosts: MCPHostLike[];
  private toolRouting = new Map<string, MCPHostLike>();
  private allTools: MCPTool[] = [];

  constructor(hosts: MCPHostLike[]) {
    this.hosts = hosts;
  }

  async connect(): Promise<void> {
    // Connect all hosts in parallel, with 10s timeout per host.
    // If a host (e.g., Playwright relay) is unreachable, we still proceed
    // with the other hosts (e.g., Zomato MCP).
    const withTimeout = (p: Promise<void>, ms: number) =>
      Promise.race([p, new Promise<void>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))]);

    const results = await Promise.allSettled(
      this.hosts.map((h) => withTimeout(h.connect(), 10_000))
    );

    for (let i = 0; i < results.length; i++) {
      if (results[i].status === 'rejected') {
        const reason = (results[i] as PromiseRejectedResult).reason;
        logger.warn(`CompositeMCPHost: host ${i} failed to connect: ${reason}`);
      }
    }

    // Build routing table from all connected hosts
    this.toolRouting.clear();
    this.allTools = [];

    for (const host of this.hosts) {
      const tools = host.getTools();
      for (const tool of tools) {
        if (this.toolRouting.has(tool.name)) {
          logger.warn(`CompositeMCPHost: duplicate tool name "${tool.name}" — last host wins`);
        }
        this.toolRouting.set(tool.name, host);
        this.allTools.push(tool);
      }
    }

    logger.info(`CompositeMCPHost: ${this.allTools.length} total tools from ${this.hosts.length} hosts`);
  }

  getTools(): MCPTool[] {
    return this.allTools;
  }

  getToolsAsAnthropicFormat(): AnthropicTool[] {
    return this.allTools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.inputSchema,
    }));
  }

  isMCPTool(toolName: string): boolean {
    return this.toolRouting.has(toolName);
  }

  async callTool(
    name: string,
    args: Record<string, unknown>,
  ): Promise<unknown> {
    const host = this.toolRouting.get(name);
    if (!host) {
      throw new Error(`CompositeMCPHost: unknown tool "${name}"`);
    }
    return host.callTool(name, args);
  }

  async disconnect(): Promise<void> {
    await Promise.allSettled(this.hosts.map((h) => h.disconnect()));
    this.toolRouting.clear();
    this.allTools = [];
  }

  createScope(scopeId: string): MCPHostLike {
    // Delegate to the first host that supports scoping (usually Playwright)
    for (const host of this.hosts) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((host as any).createScope) {
        // Create a composite where the scoped host replaces the original
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const scopedHost = (host as any).createScope(scopeId) as MCPHostLike;
        const otherHosts = this.hosts.filter((h) => h !== host);
        const scoped = new CompositeMCPHost([scopedHost, ...otherHosts]);
        // Copy over the routing table (scoped host provides same tools)
        scoped.toolRouting = new Map(this.toolRouting);
        scoped.allTools = [...this.allTools];
        // Update routing for scoped host's tools
        for (const tool of scopedHost.getTools()) {
          scoped.toolRouting.set(tool.name, scopedHost);
        }
        return scoped;
      }
    }
    // No host supports scoping — return self
    return this;
  }
}
