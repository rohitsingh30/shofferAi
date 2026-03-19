import { mcpEventBus, type McpToolEvent } from '@/lib/mcp-event-bus';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const filterSessionId = url.searchParams.get('sessionId');
  const test = url.searchParams.get('test');

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      let closed = false;

      function write(text: string) {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(text));
        } catch { /* stream closed */ }
      }

      function send(event: McpToolEvent) {
        if (filterSessionId && event.sessionId !== filterSessionId) return;
        const line = formatLine(event);
        write(`data: ${JSON.stringify(event)}\n\n`);
        write(`: ${line}\n\n`);
      }

      mcpEventBus.on('mcp_tool', send);

      // Heartbeat every 10s to keep Cloud Run connection alive
      const heartbeat = setInterval(() => {
        write(`: heartbeat\n\n`);
      }, 10_000);

      // Clean up when client disconnects
      request.signal.addEventListener('abort', () => {
        closed = true;
        mcpEventBus.off('mcp_tool', send);
        clearInterval(heartbeat);
        try { controller.close(); } catch { /* already closed */ }
      });

      // Initial connection message
      write(`: 🔌 Connected to MCP log stream${filterSessionId ? ` (session: ${filterSessionId})` : ''}\n\n`);
      write(`: Listening for Playwright MCP tool calls...\n\n`);

      // Fire a test event so user can verify the stream works
      if (test === '1') {
        mcpEventBus.emitToolStart('test-session', 'browser_snapshot', { description: 'test event' });
        setTimeout(() => {
          mcpEventBus.emitToolEnd('test-session', 'browser_snapshot', 42, { success: true });
        }, 100);
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
      Connection: 'keep-alive',
    },
  });
}

function formatLine(e: McpToolEvent): string {
  const ts = e.timestamp.slice(11, 23); // HH:mm:ss.SSS
  switch (e.type) {
    case 'tool_start':
      return `${ts} ▶ ${e.toolName}  args=${JSON.stringify(e.args ?? {}).slice(0, 120)}`;
    case 'tool_end':
      return `${ts} ✓ ${e.toolName}  ${e.durationMs}ms  result=${e.resultSummary?.slice(0, 100) ?? ''}`;
    case 'tool_error':
      return `${ts} ✗ ${e.toolName}  ${e.durationMs}ms  error=${e.error}`;
    default:
      return `${ts} ? ${e.toolName}`;
  }
}
