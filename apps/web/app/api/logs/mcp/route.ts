import { mcpEventBus, type McpToolEvent } from '@/lib/mcp-event-bus';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const filterSessionId = url.searchParams.get('sessionId');

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      function send(event: McpToolEvent) {
        if (filterSessionId && event.sessionId !== filterSessionId) return;

        const line = formatLine(event);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        // Also send a human-readable comment for terminal readability
        controller.enqueue(encoder.encode(`: ${line}\n\n`));
      }

      mcpEventBus.on('mcp_tool', send);

      // Send a heartbeat comment every 15s to keep the connection alive
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(`: heartbeat\n\n`));
      }, 15_000);

      // Clean up when client disconnects
      request.signal.addEventListener('abort', () => {
        mcpEventBus.off('mcp_tool', send);
        clearInterval(heartbeat);
        controller.close();
      });

      // Initial connection message
      controller.enqueue(
        encoder.encode(`: 🔌 Connected to MCP log stream${filterSessionId ? ` (session: ${filterSessionId})` : ''}\n\n`)
      );
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
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
