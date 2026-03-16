import { describe, it, expect, vi } from 'vitest';
import { SessionMCPHost } from './session-mcp-host';
import type { RemoteMCPHost } from './remote-mcp-host';

vi.mock('@shofferai/shared', async () => {
  const actual = await vi.importActual<typeof import('@shofferai/shared')>('@shofferai/shared');
  return {
    ...actual,
    logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  };
});

function createMockRemoteMcpHost() {
  return {
    connect: vi.fn(),
    isConnected: vi.fn(() => true),
    getTools: vi.fn(() => [
      { name: 'browser_click', description: 'Click', inputSchema: {} },
    ]),
    getToolsAsAnthropicFormat: vi.fn(() => [
      { name: 'browser_click', description: 'Click', input_schema: {} },
    ]),
    isMCPTool: vi.fn((name: string) => name.startsWith('browser_')),
    callTool: vi.fn(async () => ({ success: true })),
    callToolWithSession: vi.fn(async () => ({ success: true })),
    disconnect: vi.fn(),
  } as unknown as RemoteMCPHost;
}

describe('SessionMCPHost', () => {
  it('passes sessionId through callToolWithSession', async () => {
    const inner = createMockRemoteMcpHost();
    const session = new SessionMCPHost(inner, 'task-123');

    await session.callTool('browser_click', { ref: '1' });

    expect((inner as any).callToolWithSession).toHaveBeenCalledWith(
      'browser_click',
      { ref: '1' },
      'task-123'
    );
  });

  it('delegates getTools to inner', () => {
    const inner = createMockRemoteMcpHost();
    const session = new SessionMCPHost(inner, 'task-123');

    const tools = session.getTools();
    expect(tools).toHaveLength(1);
    expect(inner.getTools).toHaveBeenCalled();
  });

  it('delegates isMCPTool to inner', () => {
    const inner = createMockRemoteMcpHost();
    const session = new SessionMCPHost(inner, 'task-123');

    expect(session.isMCPTool('browser_click')).toBe(true);
    expect(inner.isMCPTool).toHaveBeenCalledWith('browser_click');
  });

  it('connects inner if not connected', async () => {
    const inner = createMockRemoteMcpHost();
    (inner as any).isConnected = vi.fn(() => false);
    const session = new SessionMCPHost(inner, 'task-123');

    await session.connect();
    expect(inner.connect).toHaveBeenCalled();
  });

  it('skips connect if inner already connected', async () => {
    const inner = createMockRemoteMcpHost();
    const session = new SessionMCPHost(inner, 'task-123');

    await session.connect();
    expect(inner.connect).not.toHaveBeenCalled();
  });

  it('disconnect is a no-op (singleton shared)', async () => {
    const inner = createMockRemoteMcpHost();
    const session = new SessionMCPHost(inner, 'task-123');

    await session.disconnect();
    expect(inner.disconnect).not.toHaveBeenCalled();
  });
});
