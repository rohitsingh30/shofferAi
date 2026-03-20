import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskManager } from './task-manager';

// Mock shared module — keep isInternalToolLabel real, stub logger
vi.mock('@shofferai/shared', async () => {
  const actual = await vi.importActual<typeof import('@shofferai/shared')>('@shofferai/shared');
  return {
    ...actual,
    logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  };
});

// Mock chrome-pool's mcpToolEvents
vi.mock('./chrome-pool', () => {
  const { EventEmitter } = require('events');
  const emitter = new EventEmitter();
  return { mcpToolEvents: emitter };
});

const { logger } = await import('@shofferai/shared');
const { mcpToolEvents } = await import('./chrome-pool');

// ── Helpers ──

function createTaskManager(): TaskManager {
  return new TaskManager({
    bridgePortRange: [19400, 19499],
    maxConcurrent: 3,
  });
}

/** Calls the private handleCopilotEvent method directly */
function callHandleCopilotEvent(
  tm: TaskManager,
  taskId: string,
  event: { type: string; data?: Record<string, unknown> },
  state = { resultYielded: false, lastMessage: '' },
) {
  (tm as any).handleCopilotEvent(taskId, event, state);
}

// ── Tests ──

describe('TaskManager — handleCopilotEvent message filtering', () => {
  let tm: TaskManager;
  let relayMessages: Array<{ type: string; message?: string; [k: string]: unknown }>;

  beforeEach(() => {
    vi.clearAllMocks();
    tm = createTaskManager();
    relayMessages = [];
    // Capture all sendToRelay calls
    tm.setRelaySend((msg) => {
      relayMessages.push(msg as any);
    });
  });

  describe('suppresses internal tool-call labels', () => {
    const internalMessages = [
      'Browser: report_intent',
      'Browser: playwright-browser_navigate',
      'Browser: browser_snapshot',
      'browser_navigate',
      'mcp__playwright__browser_click',
      'report_intent',
      'Agent starting...',
    ];

    for (const content of internalMessages) {
      it(`suppresses "${content}"`, () => {
        callHandleCopilotEvent(tm, 'task-123', {
          type: 'assistant.message',
          data: { content },
        });

        // Should NOT be sent to relay
        const progressMsgs = relayMessages.filter((m) => m.type === 'task_progress');
        expect(progressMsgs).toHaveLength(0);

        // Should be logged
        expect(logger.info).toHaveBeenCalledWith(
          expect.stringContaining('suppressed internal message'),
        );
      });
    }
  });

  describe('forwards natural language messages', () => {
    const userMessages = [
      'I found 3 hotels under ₹4000/night in Goa',
      'Adding butter chicken to your cart',
      'Opening Zomato to search for restaurants near you',
      'Your order has been placed successfully!',
      'I need your delivery address to proceed',
    ];

    for (const content of userMessages) {
      it(`forwards "${content.slice(0, 50)}..."`, () => {
        callHandleCopilotEvent(tm, 'task-456', {
          type: 'assistant.message',
          data: { content },
        });

        const progressMsgs = relayMessages.filter((m) => m.type === 'task_progress');
        expect(progressMsgs).toHaveLength(1);
        expect(progressMsgs[0].message).toBe(content);
      });
    }
  });

  describe('does not forward duplicate messages', () => {
    it('skips message if same as lastMessage', () => {
      callHandleCopilotEvent(tm, 'task-789', {
        type: 'assistant.message',
        data: { content: 'Hello!' },
      }, { resultYielded: false, lastMessage: 'Hello!' });

      expect(relayMessages.filter((m) => m.type === 'task_progress')).toHaveLength(0);
    });
  });

  describe('tool calls go to mcpToolEvents only', () => {
    it('emits tool_start to mcpToolEvents, not to relay', () => {
      const emitted: any[] = [];
      mcpToolEvents.on('mcp_tool', (e: any) => emitted.push(e));

      callHandleCopilotEvent(tm, 'task-abc', {
        type: 'assistant.tool_call',
        data: { toolName: 'mcp__playwright__browser_navigate', input: { url: 'https://zomato.com' } },
      });

      // Should emit to MCP log stream
      expect(emitted).toHaveLength(1);
      expect(emitted[0].type).toBe('tool_start');
      expect(emitted[0].toolName).toBe('browser_navigate');

      // Should NOT send any task_progress to relay
      expect(relayMessages.filter((m) => m.type === 'task_progress')).toHaveLength(0);

      mcpToolEvents.removeAllListeners('mcp_tool');
    });

    it('emits tool_end for execution_complete', () => {
      const emitted: any[] = [];
      mcpToolEvents.on('mcp_tool', (e: any) => emitted.push(e));

      callHandleCopilotEvent(tm, 'task-abc', {
        type: 'tool.execution_complete',
        data: { toolCallId: 'browser_snapshot', success: true, result: 'Page loaded' },
      });

      expect(emitted).toHaveLength(1);
      expect(emitted[0].type).toBe('tool_end');

      // No relay message
      expect(relayMessages.filter((m) => m.type === 'task_progress')).toHaveLength(0);

      mcpToolEvents.removeAllListeners('mcp_tool');
    });
  });

  describe('empty/undefined content', () => {
    it('skips empty content', () => {
      callHandleCopilotEvent(tm, 'task-empty', {
        type: 'assistant.message',
        data: { content: '' },
      });
      expect(relayMessages).toHaveLength(0);
    });

    it('skips undefined content', () => {
      callHandleCopilotEvent(tm, 'task-undef', {
        type: 'assistant.message',
        data: {},
      });
      expect(relayMessages).toHaveLength(0);
    });
  });
});
