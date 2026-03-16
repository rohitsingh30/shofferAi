import { spawn, type ChildProcess } from 'child_process';
import { cpSync, mkdirSync, existsSync, rmSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { logger } from '@shofferai/shared';
import { MCPHost } from './mcp-host';

type SlotState = 'starting' | 'ready' | 'busy' | 'resetting' | 'error';

interface ChromeSlot {
  index: number;
  port: number;
  userDataDir: string;
  chromeProcess: ChildProcess | null;
  mcpHost: MCPHost | null;
  assignedSessionId: string | null;
  lastActivityAt: number;
  state: SlotState;
}

interface QueueEntry {
  sessionId: string;
  resolve: (slot: ChromeSlot) => void;
  reject: (error: Error) => void;
  timeoutId: ReturnType<typeof setTimeout>;
}

export interface ChromePoolOptions {
  poolSize: number;
  basePort: number;
  profileSourceDir: string;
  poolDataDir: string;
  slotTtlMs: number;
  chromePath: string;
  queueTimeoutMs: number;
}

const DEFAULT_OPTIONS: ChromePoolOptions = {
  poolSize: parseInt(process.env.POOL_SIZE || '3', 10),
  basePort: parseInt(process.env.POOL_BASE_PORT || '9222', 10),
  profileSourceDir: process.env.CHROME_PROFILE_SOURCE ||
    join(homedir(), 'Library', 'Application Support', 'Google', 'Chrome-Debug'),
  poolDataDir: process.env.POOL_DATA_DIR ||
    join(homedir(), 'Library', 'Application Support', 'Google', 'Chrome-Pool'),
  slotTtlMs: 15 * 60 * 1000, // 15 min
  chromePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  queueTimeoutMs: 30_000, // 30s
};

// Session files to copy from the source profile (same as setup-chrome-profile.sh)
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

export class ChromePool {
  private slots: ChromeSlot[] = [];
  private sessionMap = new Map<string, number>(); // sessionId → slot index
  private waitQueue: QueueEntry[] = [];
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;
  private options: ChromePoolOptions;
  private tools: ReturnType<MCPHost['getTools']> = [];

  constructor(options: Partial<ChromePoolOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  async initialize(): Promise<void> {
    logger.info('Initializing Chrome Pool', {
      poolSize: this.options.poolSize,
      basePort: this.options.basePort,
      poolDataDir: this.options.poolDataDir,
    });

    mkdirSync(this.options.poolDataDir, { recursive: true });

    // Initialize all slots in parallel
    const initPromises: Promise<void>[] = [];
    for (let i = 0; i < this.options.poolSize; i++) {
      const slot: ChromeSlot = {
        index: i,
        port: this.options.basePort + i,
        userDataDir: join(this.options.poolDataDir, `slot-${i}`),
        chromeProcess: null,
        mcpHost: null,
        assignedSessionId: null,
        lastActivityAt: 0,
        state: 'starting',
      };
      this.slots.push(slot);
      initPromises.push(this.initSlot(slot));
    }

    await Promise.all(initPromises);

    const readyCount = this.slots.filter(s => s.state === 'ready').length;
    if (readyCount === 0) {
      throw new Error('Chrome Pool: no slots initialized successfully');
    }

    // Cache tools from the first ready slot (all slots have identical Playwright MCP tools)
    const firstReady = this.slots.find(s => s.state === 'ready');
    if (firstReady?.mcpHost) {
      this.tools = firstReady.mcpHost.getTools();
    }

    logger.info(`Chrome Pool ready: ${readyCount}/${this.options.poolSize} slots`, {
      tools: this.tools.length,
    });

    // Start idle cleanup timer
    this.cleanupInterval = setInterval(() => this.cleanupIdleSlots(), 60_000);
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
      slot.mcpHost = new MCPHost({ cdpEndpoint: `http://localhost:${slot.port}` });
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
    // Kill any existing Chrome on this port
    await this.killChromeOnPort(slot.port);

    const args = [
      `--remote-debugging-port=${slot.port}`,
      '--remote-debugging-address=127.0.0.1',
      `--user-data-dir=${slot.userDataDir}`,
      '--profile-directory=Profile 3',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-sync',
      '--disable-default-apps',
    ];

    slot.chromeProcess = spawn(this.options.chromePath, args, {
      stdio: 'ignore',
      detached: false,
    });

    slot.chromeProcess.on('exit', (code) => {
      logger.warn(`Slot ${slot.index} Chrome process exited`, { code, port: slot.port });
      if (slot.state === 'busy' || slot.state === 'ready') {
        slot.state = 'error';
        // Auto-recover: try to restart
        this.recoverSlot(slot).catch(err => {
          logger.error(`Slot ${slot.index} recovery failed`, { error: String(err) });
        });
      }
    });

    logger.debug(`Slot ${slot.index} Chrome launched`, { pid: slot.chromeProcess.pid, port: slot.port });
  }

  private async killChromeOnPort(port: number): Promise<void> {
    try {
      const res = await fetch(`http://localhost:${port}/json/version`, {
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) {
        // Chrome is running on this port — find and kill it
        const { execSync } = await import('child_process');
        try {
          execSync(`lsof -ti :${port} | xargs kill -9 2>/dev/null`, { encoding: 'utf-8' });
          // Wait a moment for the port to free
          await new Promise(r => setTimeout(r, 1000));
        } catch {
          // Process might already be gone
        }
      }
    } catch {
      // Port not in use, good
    }
  }

  private async waitForCDP(slot: ChromeSlot, maxRetries = 30): Promise<void> {
    const url = `http://localhost:${slot.port}/json/version`;
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
    // No sessionId → use first ready slot (legacy/testing)
    if (!sessionId) {
      const slot = this.slots.find(s => s.state === 'ready' || s.state === 'busy');
      if (!slot?.mcpHost) throw new Error('No Chrome slots available');
      return slot.mcpHost.callTool(name, args);
    }

    // Find or acquire a slot for this session
    const slot = await this.acquireSlot(sessionId);
    slot.lastActivityAt = Date.now();

    return slot.mcpHost!.callTool(name, args);
  }

  private async acquireSlot(sessionId: string): Promise<ChromeSlot> {
    // Already assigned?
    const existingIndex = this.sessionMap.get(sessionId);
    if (existingIndex !== undefined) {
      const slot = this.slots[existingIndex];
      if (slot.state === 'busy' && slot.mcpHost) {
        return slot;
      }
      // Slot died, remove stale mapping
      this.sessionMap.delete(sessionId);
    }

    // Find a free slot
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

    // All slots busy — queue with timeout
    logger.info(`All slots busy, queueing session ${sessionId.slice(0, 8)}...`, {
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

  private async cleanupIdleSlots(): Promise<void> {
    const now = Date.now();
    for (const slot of this.slots) {
      if (
        slot.state === 'busy' &&
        slot.assignedSessionId &&
        slot.lastActivityAt > 0 &&
        now - slot.lastActivityAt > this.options.slotTtlMs
      ) {
        logger.info(`Slot ${slot.index} idle timeout, releasing`, {
          sessionId: slot.assignedSessionId.slice(0, 8),
          idleMs: now - slot.lastActivityAt,
        });
        await this.releaseSlot(slot.assignedSessionId).catch(err => {
          logger.error(`Idle cleanup failed for slot ${slot.index}`, { error: String(err) });
        });
      }
    }
  }

  getTools(): ReturnType<MCPHost['getTools']> {
    return this.tools;
  }

  getStatus(): {
    total: number;
    ready: number;
    busy: number;
    error: number;
    queueLength: number;
  } {
    return {
      total: this.slots.length,
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
