import { spawn, type ChildProcess } from 'child_process';
import { cpSync, mkdirSync, existsSync, rmSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { EventEmitter } from 'events';
import { logger } from '@shofferai/shared';
import { MCPHost } from './mcp-host';

export interface McpToolEvent {
  type: 'tool_start' | 'tool_end' | 'tool_error';
  timestamp: string;
  sessionId: string;
  toolName: string;
  args?: Record<string, unknown>;
  durationMs?: number;
  resultSummary?: string;
  error?: string;
  pool?: { busy: number; ready: number; max: number; queued: number };
}

export const mcpToolEvents = new EventEmitter();
mcpToolEvents.setMaxListeners(50);

type SlotState = 'idle' | 'starting' | 'ready' | 'busy' | 'resetting' | 'error';

interface ChromeSlot {
  index: number;
  port: number; // 0 until Chrome reports actual port via stderr
  userDataDir: string;
  chromeProcess: ChildProcess | null;
  mcpHost: MCPHost | null;
  assignedSessionId: string | null;
  lastActivityAt: number;
  state: SlotState;
  cdpFailCount: number; // consecutive CDP health check failures
}

interface QueueEntry {
  sessionId: string;
  resolve: (slot: ChromeSlot) => void;
  reject: (error: Error) => void;
  timeoutId: ReturnType<typeof setTimeout>;
}

export interface ChromePoolOptions {
  maxSlots: number;
  profileSourceDir: string;
  poolDataDir: string;
  slotTtlMs: number;
  chromePath: string;
  queueTimeoutMs: number;
}

const DEFAULT_OPTIONS: ChromePoolOptions = {
  maxSlots: parseInt(process.env.POOL_SIZE || '6', 10),
  profileSourceDir: process.env.CHROME_PROFILE_SOURCE ||
    join(homedir(), 'Library', 'Application Support', 'Google', 'Chrome-Debug'),
  poolDataDir: process.env.POOL_DATA_DIR ||
    join(homedir(), 'Library', 'Application Support', 'Google', 'Chrome-Pool'),
  slotTtlMs: 15 * 60 * 1000, // 15 min
  chromePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  queueTimeoutMs: 30_000, // 30s
};

// Session files to copy from the source profile
const SESSION_FILES = [
  'Cookies',
  'Cookies-journal',
  'Login Data',
  'Login Data-journal',
  'Web Data',
  'Web Data-journal',
  'Preferences',
  'Secure Preferences',
  join('Network', 'Cookies'),
  join('Network', 'Cookies-journal'),
];

const SESSION_DIRS = [
  'Session Storage',
  'Local Storage',
  'IndexedDB',
  'Accounts',
];

/**
 * Lazy Chrome Pool — starts with 0 Chrome instances.
 * Chrome only launches when a task actually needs one.
 * `maxSlots` is the concurrency limit, not a pre-launch count.
 */
export class ChromePool {
  private slots: ChromeSlot[] = [];
  private sessionMap = new Map<string, number>(); // sessionId → slot index
  private waitQueue: QueueEntry[] = [];
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;
  private healthCheckInterval: ReturnType<typeof setInterval> | null = null;
  private options: ChromePoolOptions;
  private tools: ReturnType<MCPHost['getTools']> = [];
  private nextSlotIndex = 0;

  constructor(options: Partial<ChromePoolOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Initialize the pool — just creates the data dir and starts cleanup timer.
   * No Chrome instances are launched until a task arrives.
   * One temporary Chrome is launched to discover available Playwright MCP tools,
   * then immediately shut down.
   */
  async initialize(): Promise<void> {
    logger.info('Initializing Chrome Pool (lazy mode)', {
      maxSlots: this.options.maxSlots,
      poolDataDir: this.options.poolDataDir,
    });

    mkdirSync(this.options.poolDataDir, { recursive: true });

    // Bootstrap: launch one temporary Chrome to discover tool list
    const bootstrapSlot = this.createSlot();
    try {
      await this.initSlot(bootstrapSlot);
      this.tools = bootstrapSlot.mcpHost!.getTools();
      logger.info(`Discovered ${this.tools.length} Playwright MCP tools`);
      // Keep this slot warm — it's ready for the first task
      this.slots.push(bootstrapSlot);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown';
      throw new Error(`Chrome Pool bootstrap failed (cannot discover tools): ${msg}`);
    }

    logger.info('Chrome Pool ready (lazy mode — Chrome launches on demand)', {
      tools: this.tools.length,
      warmSlots: 1,
    });

    this.cleanupInterval = setInterval(() => this.cleanupIdleSlots(), 60_000);
    // Periodic CDP health check — catches frozen Chrome before tool calls fail
    this.healthCheckInterval = setInterval(() => this.healthCheckSlots(), 15_000);
  }

  private createSlot(): ChromeSlot {
    const index = this.nextSlotIndex++;
    return {
      index,
      port: 0,
      userDataDir: join(this.options.poolDataDir, `slot-${index}`),
      chromeProcess: null,
      mcpHost: null,
      assignedSessionId: null,
      lastActivityAt: 0,
      state: 'idle',
      cdpFailCount: 0,
    };
  }

  private async initSlot(slot: ChromeSlot): Promise<void> {
    try {
      // 1. Setup profile directory
      await this.setupSlotProfile(slot);

      // 2. Launch Chrome
      await this.launchChrome(slot);

      // 3. Wait for CDP to be ready
      await this.waitForCDP(slot);

      // 4. Connect MCP host
      slot.mcpHost = new MCPHost({ cdpEndpoint: `http://127.0.0.1:${slot.port}` });
      await slot.mcpHost.connect();

      slot.state = 'ready';
      logger.info(`Slot ${slot.index} ready`, { port: slot.port });
    } catch (error) {
      slot.state = 'error';
      const msg = error instanceof Error ? error.message : 'Unknown';
      logger.error(`Slot ${slot.index} failed to initialize`, { port: slot.port, error: msg });
    }
  }

  private async setupSlotProfile(slot: ChromeSlot): Promise<void> {
    const profileDir = join(slot.userDataDir, 'Profile 3');
    const sourceProfileDir = join(this.options.profileSourceDir, 'Profile 3');

    if (!existsSync(sourceProfileDir)) {
      throw new Error(`Source profile not found: ${sourceProfileDir}`);
    }

    mkdirSync(profileDir, { recursive: true });

    // Remove stale singleton files
    for (const lock of ['SingletonLock', 'SingletonSocket', 'SingletonCookie']) {
      const lockPath = join(slot.userDataDir, lock);
      if (existsSync(lockPath)) {
        rmSync(lockPath, { force: true });
      }
    }

    // Copy session files
    for (const file of SESSION_FILES) {
      const src = join(sourceProfileDir, file);
      const dest = join(profileDir, file);
      if (existsSync(src)) {
        mkdirSync(join(dest, '..'), { recursive: true });
        cpSync(src, dest, { force: true });
      }
    }

    // Copy session directories
    for (const dir of SESSION_DIRS) {
      const src = join(sourceProfileDir, dir);
      const dest = join(profileDir, dir);
      if (existsSync(src)) {
        if (existsSync(dest)) {
          rmSync(dest, { recursive: true, force: true });
        }
        cpSync(src, dest, { recursive: true, force: true });
      }
    }

    logger.debug(`Slot ${slot.index} profile setup complete`);
  }

  private async launchChrome(slot: ChromeSlot): Promise<void> {
    // Launch Chrome with port=0 — OS assigns a guaranteed-free ephemeral port.
    // Chrome prints "DevTools listening on ws://127.0.0.1:PORT/..." to stderr.
    const args = [
      '--remote-debugging-port=0',
      '--remote-debugging-address=127.0.0.1',
      `--user-data-dir=${slot.userDataDir}`,
      '--profile-directory=Profile 3',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-sync',
      '--disable-default-apps',
    ];

    slot.chromeProcess = spawn(this.options.chromePath, args, {
      stdio: ['ignore', 'ignore', 'pipe'], // capture stderr for port parsing
      detached: false,
    });

    // Parse the actual port from Chrome's stderr
    const port = await new Promise<number>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Slot ${slot.index}: Chrome didn't report a CDP port within 15s`));
      }, 15_000);

      let stderrData = '';
      slot.chromeProcess!.stderr!.on('data', (chunk: Buffer) => {
        stderrData += chunk.toString();
        // Chrome writes: "DevTools listening on ws://127.0.0.1:PORT/devtools/browser/..."
        const match = stderrData.match(/ws:\/\/127\.0\.0\.1:(\d+)\//);
        if (match) {
          clearTimeout(timeout);
          resolve(parseInt(match[1], 10));
        }
      });

      slot.chromeProcess!.on('exit', (code) => {
        clearTimeout(timeout);
        reject(new Error(`Slot ${slot.index}: Chrome exited with code ${code} before reporting port`));
      });
    });

    slot.port = port;

    slot.chromeProcess.on('exit', (code) => {
      logger.warn(`Slot ${slot.index} Chrome process exited`, { code, port: slot.port });
      if (slot.state === 'busy' || slot.state === 'ready') {
        slot.state = 'error';
        this.recoverSlot(slot).catch(err => {
          logger.error(`Slot ${slot.index} recovery failed`, { error: String(err) });
        });
      }
    });

    logger.debug(`Slot ${slot.index} Chrome launched`, { pid: slot.chromeProcess.pid, port: slot.port });
  }

  private async waitForCDP(slot: ChromeSlot, maxRetries = 30): Promise<void> {
    const url = `http://127.0.0.1:${slot.port}/json/version`;
    for (let i = 0; i < maxRetries; i++) {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
        if (res.ok) {
          const info = await res.json() as { Browser?: string };
          logger.debug(`Slot ${slot.index} CDP ready`, { browser: info.Browser });
          return;
        }
      } catch {
        // Not ready yet
      }
      await new Promise(r => setTimeout(r, 1000));
    }
    throw new Error(`Slot ${slot.index}: CDP not ready after ${maxRetries}s on port ${slot.port}`);
  }

  private async recoverSlot(slot: ChromeSlot): Promise<void> {
    logger.info(`Recovering slot ${slot.index}...`);

    // Release any assigned session
    if (slot.assignedSessionId) {
      this.sessionMap.delete(slot.assignedSessionId);
      slot.assignedSessionId = null;
    }

    // Disconnect MCP
    if (slot.mcpHost) {
      try { await slot.mcpHost.disconnect(); } catch { /* ignore */ }
      slot.mcpHost = null;
    }

    // Kill Chrome process
    if (slot.chromeProcess && !slot.chromeProcess.killed) {
      slot.chromeProcess.kill('SIGKILL');
      slot.chromeProcess = null;
    }

    // Re-initialize
    slot.state = 'starting';
    await this.initSlot(slot);

    // If recovery succeeded and there are waiters, assign
    // (initSlot mutates slot.state asynchronously, so re-check)
    if ((slot.state as SlotState) === 'ready' && this.waitQueue.length > 0) {
      this.dequeueNext(slot);
    }
  }

  async callTool(
    sessionId: string | undefined,
    name: string,
    args: Record<string, unknown>
  ): Promise<unknown> {
    const sid = sessionId?.slice(0, 12) || '__default__';
    const poolStatus = this.getStatus();
    const pool = { busy: poolStatus.busy, ready: poolStatus.ready, max: poolStatus.maxSlots, queued: poolStatus.queueLength };

    mcpToolEvents.emit('mcp_tool', {
      type: 'tool_start', timestamp: new Date().toISOString(),
      sessionId: sid, toolName: name,
      args: truncateArgs(args), pool,
    } as McpToolEvent);

    const start = Date.now();
    try {
      let result: unknown;
      // No sessionId → use first ready slot or launch one
      if (!sessionId) {
        const slot = this.slots.find(s => s.state === 'ready' || s.state === 'busy');
        if (slot?.mcpHost) {
          result = await slot.mcpHost.callTool(name, args);
        } else {
          const newSlot = await this.launchSlotOnDemand('__default__');
          result = await newSlot.mcpHost!.callTool(name, args);
        }
      } else {
        const slot = await this.acquireSlot(sessionId);
        slot.lastActivityAt = Date.now();
        result = await slot.mcpHost!.callTool(name, args);
      }

      mcpToolEvents.emit('mcp_tool', {
        type: 'tool_end', timestamp: new Date().toISOString(),
        sessionId: sid, toolName: name,
        durationMs: Date.now() - start,
        resultSummary: summarizeResult(result),
      } as McpToolEvent);

      return result;
    } catch (err) {
      mcpToolEvents.emit('mcp_tool', {
        type: 'tool_error', timestamp: new Date().toISOString(),
        sessionId: sid, toolName: name,
        durationMs: Date.now() - start,
        error: err instanceof Error ? err.message : String(err),
      } as McpToolEvent);
      throw err;
    }
  }

  private async acquireSlot(sessionId: string): Promise<ChromeSlot> {
    // Already assigned?
    const existingIndex = this.sessionMap.get(sessionId);
    if (existingIndex !== undefined) {
      const slot = this.slots[existingIndex];
      if (slot.state === 'busy' && slot.mcpHost) {
        return slot;
      }
      this.sessionMap.delete(sessionId);
    }

    // Find a free ready slot
    const freeSlot = this.slots.find(s => s.state === 'ready' && s.assignedSessionId === null);
    if (freeSlot) {
      freeSlot.assignedSessionId = sessionId;
      freeSlot.state = 'busy';
      freeSlot.lastActivityAt = Date.now();
      this.sessionMap.set(sessionId, freeSlot.index);
      logger.info(`Session ${sessionId.slice(0, 8)}... assigned to slot ${freeSlot.index}`, {
        port: freeSlot.port,
      });
      return freeSlot;
    }

    // No free slot — can we launch a new one?
    const activeSlots = this.slots.filter(s => s.state !== 'error' && s.state !== 'idle');
    if (activeSlots.length < this.options.maxSlots) {
      return this.launchSlotOnDemand(sessionId);
    }

    // All slots busy and at capacity — queue with timeout
    logger.info(`All ${this.options.maxSlots} slots busy, queueing session ${sessionId.slice(0, 8)}...`, {
      queueLength: this.waitQueue.length,
    });

    return new Promise<ChromeSlot>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        const idx = this.waitQueue.findIndex(e => e.sessionId === sessionId);
        if (idx !== -1) this.waitQueue.splice(idx, 1);
        reject(new Error('Server busy: all Chrome slots occupied. Try again shortly.'));
      }, this.options.queueTimeoutMs);

      this.waitQueue.push({ sessionId, resolve, reject, timeoutId });
    });
  }

  /** Launch a new Chrome slot on demand and assign it to a session */
  private async launchSlotOnDemand(sessionId: string): Promise<ChromeSlot> {
    const slot = this.createSlot();
    this.slots.push(slot);

    logger.info(`Launching Chrome on demand for session ${sessionId.slice(0, 8)}...`);
    await this.initSlot(slot);

    if (slot.state !== 'ready') {
      throw new Error(`Failed to launch Chrome for session ${sessionId.slice(0, 8)}`);
    }

    slot.assignedSessionId = sessionId;
    slot.state = 'busy';
    slot.lastActivityAt = Date.now();
    this.sessionMap.set(sessionId, slot.index);
    return slot;
  }

  async releaseSlot(sessionId: string): Promise<void> {
    const slotIndex = this.sessionMap.get(sessionId);
    if (slotIndex === undefined) {
      logger.debug(`No slot found for session ${sessionId.slice(0, 8)}... (already released)`);
      return;
    }

    const slot = this.slots[slotIndex];
    this.sessionMap.delete(sessionId);
    slot.assignedSessionId = null;

    logger.info(`Releasing slot ${slot.index} from session ${sessionId.slice(0, 8)}...`);

    // Reset Chrome state: close all tabs except one, navigate to about:blank
    slot.state = 'resetting';
    try {
      if (slot.mcpHost) {
        // Navigate to blank page to clear state
        await slot.mcpHost.callTool('browser_navigate', { url: 'about:blank' });
      }
      slot.state = 'ready';
    } catch (error) {
      logger.warn(`Slot ${slot.index} reset failed, recovering...`, { error: String(error) });
      await this.recoverSlot(slot).catch(() => {});
      return;
    }

    // Check if someone is waiting for a slot
    if (this.waitQueue.length > 0) {
      this.dequeueNext(slot);
    }
  }

  private dequeueNext(slot: ChromeSlot): void {
    const entry = this.waitQueue.shift();
    if (!entry) return;

    clearTimeout(entry.timeoutId);
    slot.assignedSessionId = entry.sessionId;
    slot.state = 'busy';
    slot.lastActivityAt = Date.now();
    this.sessionMap.set(entry.sessionId, slot.index);

    logger.info(`Dequeued session ${entry.sessionId.slice(0, 8)}... → slot ${slot.index}`);
    entry.resolve(slot);
  }

  /** Periodic CDP health check — detects frozen/unresponsive Chrome */
  private async healthCheckSlots(): Promise<void> {
    for (const slot of this.slots) {
      if (slot.state !== 'ready' && slot.state !== 'busy') continue;
      if (!slot.port) continue;

      try {
        const res = await fetch(`http://127.0.0.1:${slot.port}/json/version`, {
          signal: AbortSignal.timeout(3000),
        });
        if (res.ok) {
          slot.cdpFailCount = 0;
          continue;
        }
      } catch {
        // CDP not responding
      }

      slot.cdpFailCount++;
      logger.warn(`Slot ${slot.index} CDP health check failed`, {
        port: slot.port,
        failCount: slot.cdpFailCount,
        state: slot.state,
      });

      // 3 consecutive failures (45s) → recover the slot
      if (slot.cdpFailCount >= 3) {
        logger.error(`Slot ${slot.index} Chrome unresponsive for ${slot.cdpFailCount} checks — recovering`);
        slot.state = 'error';
        slot.cdpFailCount = 0;
        this.recoverSlot(slot).catch(err => {
          logger.error(`Slot ${slot.index} health-triggered recovery failed`, { error: String(err) });
        });
      }
    }
  }

  private async cleanupIdleSlots(): Promise<void> {
    const now = Date.now();
    for (const slot of this.slots) {
      // Release sessions that have been idle too long
      if (
        slot.state === 'busy' &&
        slot.assignedSessionId &&
        slot.lastActivityAt > 0 &&
        now - slot.lastActivityAt > this.options.slotTtlMs
      ) {
        logger.info(`Slot ${slot.index} idle timeout, releasing session`, {
          sessionId: slot.assignedSessionId.slice(0, 8),
          idleMs: now - slot.lastActivityAt,
        });
        await this.releaseSlot(slot.assignedSessionId).catch(err => {
          logger.error(`Idle cleanup failed for slot ${slot.index}`, { error: String(err) });
        });
      }

      // Tear down ready slots that have been unused for 2x TTL (save resources)
      if (
        slot.state === 'ready' &&
        !slot.assignedSessionId &&
        slot.lastActivityAt > 0 &&
        now - slot.lastActivityAt > this.options.slotTtlMs * 2
      ) {
        logger.info(`Slot ${slot.index} unused, tearing down Chrome to save resources`);
        await this.teardownSlot(slot);
      }
    }
  }

  /** Fully tear down a slot — kill Chrome, disconnect MCP, remove from slots */
  private async teardownSlot(slot: ChromeSlot): Promise<void> {
    if (slot.assignedSessionId) {
      this.sessionMap.delete(slot.assignedSessionId);
      slot.assignedSessionId = null;
    }
    if (slot.mcpHost) {
      try { await slot.mcpHost.disconnect(); } catch { /* ignore */ }
      slot.mcpHost = null;
    }
    if (slot.chromeProcess && !slot.chromeProcess.killed) {
      slot.chromeProcess.kill('SIGTERM');
      slot.chromeProcess = null;
    }
    slot.state = 'idle';
    slot.port = 0;
    // Remove from active slots
    const idx = this.slots.indexOf(slot);
    if (idx !== -1) this.slots.splice(idx, 1);
    logger.debug(`Slot ${slot.index} torn down`);
  }

  getTools(): ReturnType<MCPHost['getTools']> {
    return this.tools;
  }

  getStatus(): {
    maxSlots: number;
    active: number;
    ready: number;
    busy: number;
    error: number;
    queueLength: number;
  } {
    return {
      maxSlots: this.options.maxSlots,
      active: this.slots.length,
      ready: this.slots.filter(s => s.state === 'ready' && !s.assignedSessionId).length,
      busy: this.slots.filter(s => s.state === 'busy').length,
      error: this.slots.filter(s => s.state === 'error').length,
      queueLength: this.waitQueue.length,
    };
  }

  async shutdown(): Promise<void> {
    logger.info('Shutting down Chrome Pool...');

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    // Reject all queued entries
    for (const entry of this.waitQueue) {
      clearTimeout(entry.timeoutId);
      entry.reject(new Error('Chrome Pool shutting down'));
    }
    this.waitQueue = [];

    // Shutdown all slots
    for (const slot of this.slots) {
      if (slot.mcpHost) {
        try { await slot.mcpHost.disconnect(); } catch { /* ignore */ }
      }
      if (slot.chromeProcess && !slot.chromeProcess.killed) {
        slot.chromeProcess.kill('SIGTERM');
      }
    }

    // Give Chrome processes a moment to exit gracefully
    await new Promise(r => setTimeout(r, 2000));

    // Force kill any remaining
    for (const slot of this.slots) {
      if (slot.chromeProcess && !slot.chromeProcess.killed) {
        slot.chromeProcess.kill('SIGKILL');
      }
    }

    this.slots = [];
    this.sessionMap.clear();
    logger.info('Chrome Pool shutdown complete');
  }
}

// ── helpers for event emission ──
function truncateArgs(args: Record<string, unknown>): Record<string, unknown> {
  const t: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(args)) {
    t[k] = typeof v === 'string' && v.length > 200 ? v.slice(0, 200) + '…' : v;
  }
  return t;
}

function summarizeResult(result: unknown): string {
  if (result == null) return 'null';
  const json = JSON.stringify(result);
  return json.length > 300 ? json.slice(0, 300) + '…' : json;
}
