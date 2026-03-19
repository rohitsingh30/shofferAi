import { EventEmitter } from 'events';

export interface McpToolEvent {
  type: 'tool_start' | 'tool_end' | 'tool_error';
  timestamp: string;
  sessionId: string;
  toolName: string;
  args?: Record<string, unknown>;
  durationMs?: number;
  resultSummary?: string;
  error?: string;
}

class McpEventBus extends EventEmitter {
  emitToolStart(sessionId: string, toolName: string, args: Record<string, unknown>) {
    const event: McpToolEvent = {
      type: 'tool_start',
      timestamp: new Date().toISOString(),
      sessionId,
      toolName,
      args: truncateArgs(args),
    };
    this.emit('mcp_tool', event);
  }

  emitToolEnd(sessionId: string, toolName: string, durationMs: number, result: unknown) {
    const event: McpToolEvent = {
      type: 'tool_end',
      timestamp: new Date().toISOString(),
      sessionId,
      toolName,
      durationMs,
      resultSummary: summarizeResult(result),
    };
    this.emit('mcp_tool', event);
  }

  emitToolError(sessionId: string, toolName: string, durationMs: number, error: unknown) {
    const event: McpToolEvent = {
      type: 'tool_error',
      timestamp: new Date().toISOString(),
      sessionId,
      toolName,
      durationMs,
      error: error instanceof Error ? error.message : String(error),
    };
    this.emit('mcp_tool', event);
  }
}

function truncateArgs(args: Record<string, unknown>): Record<string, unknown> {
  const truncated: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(args)) {
    if (typeof value === 'string' && value.length > 200) {
      truncated[key] = value.slice(0, 200) + '…';
    } else {
      truncated[key] = value;
    }
  }
  return truncated;
}

function summarizeResult(result: unknown): string {
  if (result == null) return 'null';
  const json = JSON.stringify(result);
  return json.length > 300 ? json.slice(0, 300) + '…' : json;
}

// Singleton — shared across all requests in the same Next.js process
export const mcpEventBus = new McpEventBus();
mcpEventBus.setMaxListeners(50);
