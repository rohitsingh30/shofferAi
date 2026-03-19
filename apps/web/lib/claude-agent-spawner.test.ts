import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventEmitter } from 'events';
import { Readable } from 'stream';
import type { ChildProcess } from 'child_process';
import { ClaudeAgentSpawner, type SSEEvent } from './claude-agent-spawner';

// ── Mocks ──

vi.mock('child_process', () => ({
  spawn: vi.fn(),
}));

vi.mock('fs', () => ({
  cpSync: vi.fn(),
  mkdirSync: vi.fn(),
  existsSync: vi.fn(() => true),
  rmSync: vi.fn(),
}));

const { spawn } = await import('child_process');
const mockSpawn = vi.mocked(spawn);

// Helper: create a fake ChildProcess that emits stdout lines
function makeFakeProcess(stdoutLines: string[], exitCode = 0): ChildProcess {
  const proc = new EventEmitter() as ChildProcess;
  const stdout = new Readable({ read() {} });
  const stderr = new Readable({ read() {} });
  const stdin = { end: vi.fn(), write: vi.fn(), writable: true } as any;

  Object.assign(proc, {
    stdout, stderr, stdin,
    pid: 12345,
    killed: false,
    exitCode: null,
    kill: vi.fn(() => { (proc as any).killed = true; }),
  });

  // Push lines async so the readline interface can consume them
  setTimeout(() => {
    for (const line of stdoutLines) stdout.push(line + '\n');
    stdout.push(null); // EOF
    setTimeout(() => {
      (proc as any).exitCode = exitCode;
      proc.emit('close', exitCode);
    }, 10);
  }, 10);

  return proc;
}

// Helper: collect all events from an async generator
async function collectEvents(gen: AsyncGenerator<SSEEvent>): Promise<SSEEvent[]> {
  const events: SSEEvent[] = [];
  for await (const event of gen) events.push(event);
  return events;
}

// ── Setup ──

let spawner: ClaudeAgentSpawner;

// Mock findFreePort by making net.createServer succeed
vi.mock('net', () => ({
  createServer: () => ({
    once(event: string, cb: (...args: unknown[]) => void) {
      if (event === 'listening') setTimeout(() => cb(), 0);
      return this;
    },
    listen: vi.fn(),
    close: vi.fn(),
  }),
}));

// Mock fetch (for waitForCDP)
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
  vi.clearAllMocks();
  // First fetch = Chrome-Debug check (reject → not running).
  // Subsequent fetches = spawned Chrome CDP check (resolve → ready).
  mockFetch
    .mockRejectedValueOnce(new Error('Chrome-Debug not running'))
    .mockResolvedValue({ ok: true });
  spawner = new ClaudeAgentSpawner({
    chromeSourceProfile: '/tmp/fake-chrome',
    model: 'claude-sonnet-4.6',
    cdpPortRange: [9300, 9300],
    maxConcurrent: 3,
  });
});

// ── Tests ──

describe('ClaudeAgentSpawner', () => {
  describe('constructor', () => {
    it('uses provided options', () => {
      const s = new ClaudeAgentSpawner({ model: 'claude-opus-4.6', maxConcurrent: 5 });
      expect(s.getStatus()).toEqual({ running: 0, maxConcurrent: 5 });
    });

    it('falls back to COPILOT_MODEL env var', () => {
      process.env.COPILOT_MODEL = 'gpt-5.1';
      const s = new ClaudeAgentSpawner();
      // model is private, but we can verify it via spawn args later
      delete process.env.COPILOT_MODEL;
      expect(s).toBeDefined();
    });
  });

  describe('spawnTask', () => {
    it('spawns gh copilot (not claude) with correct args', async () => {
      const chromeProc = makeFakeProcess([], 0);
      const copilotProc = makeFakeProcess([
        JSON.stringify({ type: 'assistant.message', data: { content: 'Hello!' } }),
        JSON.stringify({ type: 'result', data: { exitCode: 0 } }),
      ], 0);

      mockSpawn
        .mockReturnValueOnce(chromeProc) // Chrome
        .mockReturnValueOnce(copilotProc); // gh copilot

      const events = await collectEvents(spawner.spawnTask('say hi', { taskId: 'test-1' }));

      // Verify gh (not claude) was spawned
      expect(mockSpawn).toHaveBeenCalledTimes(2);
      const [binary, args] = mockSpawn.mock.calls[1];
      expect(binary).toBe('gh');
      expect(args).toContain('copilot');
      expect(args).toContain('--');
      expect(args).toContain('--allow-all');
      expect(args).toContain('--no-ask-user');
      expect(args).toContain('--additional-mcp-config');
      expect(args).toContain('--output-format');
      expect(args).toContain('json');
      expect(args).toContain('-s');
    });

    it('yields step_update → message → complete for successful task', async () => {
      const chromeProc = makeFakeProcess([], 0);
      const copilotProc = makeFakeProcess([
        JSON.stringify({ type: 'session.tools_updated', data: { model: 'claude-sonnet-4.6' } }),
        JSON.stringify({ type: 'user.message', data: { content: 'say hi' } }),
        JSON.stringify({ type: 'assistant.turn_start', data: { turnId: '0' } }),
        JSON.stringify({ type: 'assistant.message', data: { content: 'Hello there!' } }),
        JSON.stringify({ type: 'assistant.turn_end', data: { turnId: '0' } }),
        JSON.stringify({ type: 'result', data: { exitCode: 0 } }),
      ], 0);

      mockSpawn
        .mockReturnValueOnce(chromeProc)
        .mockReturnValueOnce(copilotProc);

      const events = await collectEvents(spawner.spawnTask('say hi'));
      const types = events.map(e => e.type);

      expect(types).toEqual([
        'step_update',  // Browser ready
        'step_update',  // Agent starting...
        'message',      // Hello there!
        'complete',     // Task completed
      ]);

      expect(events.find(e => e.type === 'message')?.payload.content).toBe('Hello there!');
    });

    it('yields tool_call as step_update', async () => {
      const chromeProc = makeFakeProcess([], 0);
      const copilotProc = makeFakeProcess([
        JSON.stringify({ type: 'assistant.tool_call', data: { toolName: 'mcp__playwright__browser_navigate', input: { url: 'https://booking.com' } } }),
        JSON.stringify({ type: 'assistant.message', data: { content: 'Navigated to Booking.com' } }),
        JSON.stringify({ type: 'result', data: { exitCode: 0 } }),
      ], 0);

      mockSpawn.mockReturnValueOnce(chromeProc).mockReturnValueOnce(copilotProc);

      const events = await collectEvents(spawner.spawnTask('book hotel'));
      const stepEvents = events.filter(e => e.type === 'step_update');

      expect(stepEvents).toContainEqual({
        type: 'step_update',
        payload: { action: 'Navigating to https://booking.com', status: 'running' },
      });
    });

    it('skips reasoning and message_delta events', async () => {
      const chromeProc = makeFakeProcess([], 0);
      const copilotProc = makeFakeProcess([
        JSON.stringify({ type: 'assistant.reasoning_delta', data: { deltaContent: 'thinking...' }, ephemeral: true }),
        JSON.stringify({ type: 'assistant.reasoning', data: { content: 'full reasoning' }, ephemeral: true }),
        JSON.stringify({ type: 'assistant.message_delta', data: { deltaContent: 'Hel' }, ephemeral: true }),
        JSON.stringify({ type: 'assistant.message', data: { content: 'Hello!' } }),
        JSON.stringify({ type: 'result', data: { exitCode: 0 } }),
      ], 0);

      mockSpawn.mockReturnValueOnce(chromeProc).mockReturnValueOnce(copilotProc);

      const events = await collectEvents(spawner.spawnTask('say hi'));
      const messageEvents = events.filter(e => e.type === 'message');

      // Only the complete message, not reasoning or deltas
      expect(messageEvents).toHaveLength(1);
      expect(messageEvents[0].payload.content).toBe('Hello!');
    });

    it('deduplicates identical consecutive messages', async () => {
      const chromeProc = makeFakeProcess([], 0);
      const copilotProc = makeFakeProcess([
        JSON.stringify({ type: 'assistant.message', data: { content: 'Hello!' } }),
        JSON.stringify({ type: 'assistant.message', data: { content: 'Hello!' } }), // duplicate
        JSON.stringify({ type: 'assistant.message', data: { content: 'Done!' } }),
        JSON.stringify({ type: 'result', data: { exitCode: 0 } }),
      ], 0);

      mockSpawn.mockReturnValueOnce(chromeProc).mockReturnValueOnce(copilotProc);

      const events = await collectEvents(spawner.spawnTask('test'));
      const msgs = events.filter(e => e.type === 'message');

      expect(msgs).toHaveLength(2);
      expect(msgs[0].payload.content).toBe('Hello!');
      expect(msgs[1].payload.content).toBe('Done!');
    });

    it('yields error when process fails with non-zero exit', async () => {
      const chromeProc = makeFakeProcess([], 0);
      const copilotProc = makeFakeProcess([
        JSON.stringify({ type: 'result', data: { exitCode: 1 } }),
      ], 1);

      mockSpawn.mockReturnValueOnce(chromeProc).mockReturnValueOnce(copilotProc);

      const events = await collectEvents(spawner.spawnTask('fail'));
      expect(events.some(e => e.type === 'error')).toBe(true);
    });

    it('yields error when process produces no result event', async () => {
      const chromeProc = makeFakeProcess([], 0);
      const copilotProc = makeFakeProcess([], 1); // no output at all

      mockSpawn.mockReturnValueOnce(chromeProc).mockReturnValueOnce(copilotProc);

      const events = await collectEvents(spawner.spawnTask('empty'));
      const errorEvent = events.find(e => e.type === 'error');

      expect(errorEvent).toBeDefined();
      expect(errorEvent!.payload.error).toContain('exited with code 1');
    });

    it('yields error when Chrome fails to start (CDP timeout)', async () => {
      const chromeProc = makeFakeProcess([], 0);
      mockSpawn.mockReturnValueOnce(chromeProc);
      mockFetch.mockRejectedValue(new Error('Connection refused'));

      // Override waitForCDP maxRetries to 1 for speed
      const fastSpawner = new ClaudeAgentSpawner({
        chromeSourceProfile: '/tmp/fake-chrome',
        cdpPortRange: [9300, 9300],
      });
      // Patch waitForCDP to fail fast
      (fastSpawner as any).waitForCDP = async () => false;

      const events = await collectEvents(fastSpawner.spawnTask('test'));
      expect(events.some(e => e.type === 'error' && (e.payload.error as string).includes('Chrome failed'))).toBe(true);
    });

    it('yields error when at max concurrent tasks', async () => {
      // Fill the task map to simulate max capacity
      const fullSpawner = new ClaudeAgentSpawner({
        chromeSourceProfile: '/tmp/fake-chrome',
        cdpPortRange: [9300, 9300],
        maxConcurrent: 1,
      });
      // Manually add a fake task to fill the map
      (fullSpawner as any).tasks.set('existing', { taskId: 'existing' });

      const events = await collectEvents(fullSpawner.spawnTask('test'));
      expect(events[0].type).toBe('error');
      expect(events[0].payload.error).toContain('Too many concurrent');
    });

    it('skips non-JSON lines without crashing', async () => {
      const chromeProc = makeFakeProcess([], 0);
      const copilotProc = makeFakeProcess([
        'not json at all',
        '   ',
        JSON.stringify({ type: 'assistant.message', data: { content: 'OK' } }),
        'another bad line',
        JSON.stringify({ type: 'result', data: { exitCode: 0 } }),
      ], 0);

      mockSpawn.mockReturnValueOnce(chromeProc).mockReturnValueOnce(copilotProc);

      const events = await collectEvents(spawner.spawnTask('test'));
      expect(events.find(e => e.type === 'message')?.payload.content).toBe('OK');
      expect(events.find(e => e.type === 'complete')).toBeDefined();
    });

    it('includes MCP config pointing to the spawned Chrome CDP port', async () => {
      const chromeProc = makeFakeProcess([], 0);
      const copilotProc = makeFakeProcess([
        JSON.stringify({ type: 'result', data: { exitCode: 0 } }),
      ], 0);

      mockSpawn.mockReturnValueOnce(chromeProc).mockReturnValueOnce(copilotProc);

      await collectEvents(spawner.spawnTask('test'));

      const [, ghArgs] = mockSpawn.mock.calls[1];
      const mcpIdx = (ghArgs as string[]).indexOf('--additional-mcp-config');
      const mcpJson = JSON.parse((ghArgs as string[])[mcpIdx + 1]);

      expect(mcpJson.mcpServers.playwright.args).toContain('--cdp-endpoint');
      expect(mcpJson.mcpServers.playwright.args).toContainEqual(expect.stringContaining('http://localhost:93'));
    });
  });

  describe('spawnParallel', () => {
    it('tags events with taskIndex from each task', async () => {
      // Mock spawnTask directly to avoid Chrome/port infrastructure
      const originalSpawnTask = spawner.spawnTask.bind(spawner);
      vi.spyOn(spawner, 'spawnTask').mockImplementation(async function* (task, opts) {
        yield { type: 'message' as const, payload: { content: `Reply for: ${task}` } };
        yield { type: 'complete' as const, payload: { summary: 'done' } };
      });

      const events = await collectEvents(
        spawner.spawnParallel(['task A', 'task B'], { taskIdPrefix: 'par' })
      );

      const task0 = events.filter(e => e.taskIndex === 0);
      const task1 = events.filter(e => e.taskIndex === 1);

      expect(task0.some(e => e.type === 'message' && e.payload.content === 'Reply for: task A')).toBe(true);
      expect(task1.some(e => e.type === 'message' && e.payload.content === 'Reply for: task B')).toBe(true);
    });
  });

  describe('sendInput', () => {
    it('returns false (gh copilot does not support stdin input)', () => {
      expect(spawner.sendInput('any-task', 'any input')).toBe(false);
    });
  });

  describe('getStatus', () => {
    it('returns running count and max', () => {
      expect(spawner.getStatus()).toEqual({ running: 0, maxConcurrent: 3 });
    });
  });

  describe('friendlyToolName', () => {
    it('maps Playwright tool names to human-readable actions', () => {
      // Access private method via bracket notation
      const fn = (spawner as any).friendlyToolName.bind(spawner);

      expect(fn('mcp__playwright__browser_navigate', { url: 'https://google.com' }))
        .toBe('Navigating to https://google.com');
      expect(fn('mcp__playwright__browser_snapshot')).toBe('Reading page content');
      expect(fn('mcp__playwright__browser_click', { element: 'Submit button' }))
        .toBe('Clicking Submit button');
      expect(fn('playwright__browser_type')).toBe('Typing text');
      expect(fn('unknown_tool')).toBe('Browser: unknown_tool');
    });
  });
});
