import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import WebSocket from 'ws';
import { RelayServer } from './relay-server';

vi.mock('@shofferai/shared', async () => {
  const actual = await vi.importActual<typeof import('@shofferai/shared')>('@shofferai/shared');
  return {
    ...actual,
    logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  };
});

function createMockMcpHost() {
  return {
    getTools: vi.fn(() => [
      { name: 'browser_click', description: 'Click element', inputSchema: { type: 'object' } },
      { name: 'browser_type', description: 'Type text', inputSchema: { type: 'object' } },
    ]),
    getToolsAsAnthropicFormat: vi.fn(),
    callTool: vi.fn(async () => ({ success: true })),
    isMCPTool: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
  };
}

function connectClient(port: number, token?: string): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const url = token
      ? `ws://localhost:${port}?token=${encodeURIComponent(token)}`
      : `ws://localhost:${port}`;
    const ws = new WebSocket(url);
    ws.on('open', () => resolve(ws));
    ws.on('error', reject);
  });
}

function sendAndReceive(ws: WebSocket, msg: object): Promise<any> {
  return new Promise((resolve) => {
    ws.once('message', (data) => resolve(JSON.parse(data.toString())));
    ws.send(JSON.stringify(msg));
  });
}

describe('RelayServer', () => {
  let mcpHost: ReturnType<typeof createMockMcpHost>;
  let server: RelayServer;
  let port: number;
  let clients: WebSocket[];

  beforeEach(async () => {
    mcpHost = createMockMcpHost();
    // Use port 0 to get random available port
    port = 9800 + Math.floor(Math.random() * 200);
    clients = [];
  });

  afterEach(async () => {
    for (const c of clients) {
      if (c.readyState === WebSocket.OPEN) c.close();
    }
    if (server) await server.stop();
  });

  it('starts server and accepts connections without auth', async () => {
    server = new RelayServer(mcpHost as any, { port });
    await server.start();

    const ws = await connectClient(port);
    clients.push(ws);
    expect(ws.readyState).toBe(WebSocket.OPEN);
  });

  it('rejects connections with invalid auth token', async () => {
    server = new RelayServer(mcpHost as any, { port, authToken: 'secret' });
    await server.start();

    await expect(connectClient(port, 'wrong-token')).rejects.toThrow();
  });

  it('accepts connections with valid auth token', async () => {
    server = new RelayServer(mcpHost as any, { port, authToken: 'secret' });
    await server.start();

    const ws = await connectClient(port, 'secret');
    clients.push(ws);
    expect(ws.readyState).toBe(WebSocket.OPEN);
  });

  it('responds to tool_list requests with MCPHost tools', async () => {
    server = new RelayServer(mcpHost as any, { port });
    await server.start();

    const ws = await connectClient(port);
    clients.push(ws);

    const response = await sendAndReceive(ws, {
      id: 'req-1',
      type: 'tool_list',
    });

    expect(response.type).toBe('tool_list_result');
    expect(response.id).toBe('req-1');
    expect(response.tools).toHaveLength(2);
    expect(response.tools[0].name).toBe('browser_click');
  });

  it('responds to tool_call requests with MCPHost result', async () => {
    server = new RelayServer(mcpHost as any, { port });
    await server.start();

    const ws = await connectClient(port);
    clients.push(ws);

    const response = await sendAndReceive(ws, {
      id: 'req-2',
      type: 'tool_call',
      name: 'browser_click',
      args: { selector: '#btn' },
    });

    expect(response.type).toBe('tool_result');
    expect(response.result).toEqual({ success: true });
    expect(mcpHost.callTool).toHaveBeenCalledWith('browser_click', { selector: '#btn' });
  });

  it('responds to tool_call with error when MCPHost throws', async () => {
    mcpHost.callTool.mockRejectedValueOnce(new Error('Browser crashed'));
    server = new RelayServer(mcpHost as any, { port });
    await server.start();

    const ws = await connectClient(port);
    clients.push(ws);

    const response = await sendAndReceive(ws, {
      id: 'req-3',
      type: 'tool_call',
      name: 'browser_click',
      args: {},
    });

    expect(response.type).toBe('tool_result');
    expect(response.error).toBe('Browser crashed');
    expect(response.result).toBeNull();
  });

  it('responds to ping with pong', async () => {
    server = new RelayServer(mcpHost as any, { port });
    await server.start();

    const ws = await connectClient(port);
    clients.push(ws);

    const response = await sendAndReceive(ws, {
      type: 'ping',
      timestamp: 12345,
    });

    expect(response.type).toBe('pong');
    expect(response.timestamp).toBeTypeOf('number');
  });
});
