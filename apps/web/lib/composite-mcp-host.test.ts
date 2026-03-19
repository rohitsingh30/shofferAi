import { describe, it, expect, vi } from 'vitest';
import { CompositeMCPHost } from './composite-mcp-host';
import type { MCPHostLike } from '@shofferai/shared';

vi.mock('@shofferai/shared', async () => {
  const actual = await vi.importActual<typeof import('@shofferai/shared')>('@shofferai/shared');
  return {
    ...actual,
    logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  };
});

function createMockHost(name: string, tools: string[]): MCPHostLike {
  const toolList = tools.map(t => ({ name: t, description: `${t} desc`, inputSchema: {} }));
  return {
    connect: vi.fn(),
    getTools: vi.fn(() => toolList),
    getToolsAsAnthropicFormat: vi.fn(() => toolList.map(t => ({ name: t.name, description: t.description, input_schema: t.inputSchema }))),
    isMCPTool: vi.fn((n: string) => tools.includes(n)),
    callTool: vi.fn(async (n: string) => ({ result: `${name}:${n}` })),
    disconnect: vi.fn(),
  };
}

describe('CompositeMCPHost', () => {
  it('merges tools from multiple hosts', async () => {
    const playwright = createMockHost('playwright', ['browser_click', 'browser_navigate', 'browser_snapshot']);
    const zomato = createMockHost('zomato', ['get_restaurants_for_keyword', 'create_cart', 'checkout_cart']);
    const composite = new CompositeMCPHost([playwright, zomato]);

    await composite.connect();

    expect(composite.getTools()).toHaveLength(6);
    expect(composite.isMCPTool('browser_click')).toBe(true);
    expect(composite.isMCPTool('create_cart')).toBe(true);
    expect(composite.isMCPTool('unknown_tool')).toBe(false);
  });

  it('routes tool calls to the correct host', async () => {
    const playwright = createMockHost('playwright', ['browser_click']);
    const zomato = createMockHost('zomato', ['create_cart']);
    const composite = new CompositeMCPHost([playwright, zomato]);

    await composite.connect();

    await composite.callTool('browser_click', { ref: 'e1' });
    expect(playwright.callTool).toHaveBeenCalledWith('browser_click', { ref: 'e1' });
    expect(zomato.callTool).not.toHaveBeenCalled();

    await composite.callTool('create_cart', { items: [] });
    expect(zomato.callTool).toHaveBeenCalledWith('create_cart', { items: [] });
  });

  it('throws for unknown tool', async () => {
    const host = createMockHost('host', ['tool_a']);
    const composite = new CompositeMCPHost([host]);
    await composite.connect();

    await expect(composite.callTool('nonexistent', {})).rejects.toThrow('unknown tool');
  });

  it('gracefully handles host connect failure', async () => {
    const working = createMockHost('working', ['tool_a']);
    const failing: MCPHostLike = {
      connect: vi.fn(async () => { throw new Error('connection refused'); }),
      getTools: vi.fn(() => []),
      getToolsAsAnthropicFormat: vi.fn(() => []),
      isMCPTool: vi.fn(() => false),
      callTool: vi.fn(),
      disconnect: vi.fn(),
    };
    const composite = new CompositeMCPHost([working, failing]);

    await composite.connect(); // should not throw

    expect(composite.getTools()).toHaveLength(1);
    expect(composite.isMCPTool('tool_a')).toBe(true);
  });

  it('disconnects all hosts', async () => {
    const a = createMockHost('a', ['tool_a']);
    const b = createMockHost('b', ['tool_b']);
    const composite = new CompositeMCPHost([a, b]);
    await composite.connect();

    await composite.disconnect();
    expect(a.disconnect).toHaveBeenCalled();
    expect(b.disconnect).toHaveBeenCalled();
    expect(composite.getTools()).toHaveLength(0);
  });

  it('getToolsAsAnthropicFormat merges all hosts', async () => {
    const a = createMockHost('a', ['tool_a']);
    const b = createMockHost('b', ['tool_b']);
    const composite = new CompositeMCPHost([a, b]);
    await composite.connect();

    const tools = composite.getToolsAsAnthropicFormat();
    expect(tools).toHaveLength(2);
    expect(tools.map(t => t.name)).toEqual(['tool_a', 'tool_b']);
  });
});
