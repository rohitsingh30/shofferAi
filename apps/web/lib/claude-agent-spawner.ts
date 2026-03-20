import { spawn, type ChildProcess } from 'child_process';
import { cpSync, mkdirSync, existsSync, rmSync } from 'fs';
import { join } from 'path';
import { homedir, tmpdir } from 'os';
import { createInterface } from 'readline';

export interface SSEEvent {
  type: 'message' | 'step_update' | 'input_required' | 'complete' | 'error';
  payload: Record<string, unknown>;
  taskIndex?: number;
}

interface RunningTask {
  taskId: string;
  cdpPort: number;
  chromeProcess: ChildProcess | null;
  agentProcess: ChildProcess;
  tempDir: string;
}

interface SpawnerOptions {
  chromeSourceProfile?: string;
  profileDirectory?: string;
  model?: string;
  chromePath?: string;
  cdpPortRange?: [number, number];
  maxConcurrent?: number;
  /** Port of the persistent Chrome-Debug instance (default 9222). Used instead of spawning temp Chrome. */
  chromeDebugPort?: number;
}

const SESSION_FILES = [
  'Cookies', 'Cookies-journal', 'Login Data', 'Login Data-journal',
  'Web Data', 'Web Data-journal', 'Preferences', 'Secure Preferences',
];

const SESSION_DIRS = [
  'Session Storage', 'Local Storage', 'IndexedDB', 'Accounts', 'Network',
];

const SYSTEM_PROMPT = `You are ShofferAI, an AI assistant that executes real browser tasks.
You have Playwright MCP tools to control a Chrome browser.
Chrome is pre-authenticated as rsinghtomar3011@gmail.com (Booking.com Genius account).

RULES:
1. First call browser_navigate to go to the target URL — this opens a NEW tab automatically
2. After navigating, ALWAYS call browser_snapshot to read the page — do NOT retry navigation if the page loaded
3. Do NOT login — Chrome is already signed in
4. Be concise — report what you see and do
5. If you need user input (OTP, choice), output the question clearly
6. Before any irreversible action (order, payment), ask for confirmation
7. Use browser_snapshot to read pages, browser_click to click, browser_type to type
8. Include prices, quantities, and totals when presenting options
9. If browser_navigate succeeds (no error), the page IS loaded — take a snapshot to see it
10. NEVER retry navigation more than twice — if it fails twice, report the error`;

export class ClaudeAgentSpawner {
  private tasks = new Map<string, RunningTask>();
  private usedPorts = new Set<number>();
  private options: Required<SpawnerOptions>;

  private chromeDebugPort: number;

  constructor(options: SpawnerOptions = {}) {
    this.chromeDebugPort = options.chromeDebugPort ?? (Number(process.env.CHROME_DEBUG_PORT) || 9222);
    this.options = {
      chromeDebugPort: this.chromeDebugPort,
      chromeSourceProfile: options.chromeSourceProfile ||
        join(homedir(), 'Library', 'Application Support', 'Google', 'Chrome-Debug'),
      profileDirectory: options.profileDirectory || 'Profile 3',
      model: options.model || process.env.COPILOT_MODEL || 'claude-sonnet-4.6',
      chromePath: options.chromePath ||
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      cdpPortRange: options.cdpPortRange || [9300, 9399],
      maxConcurrent: options.maxConcurrent || 10,
    };
  }

  async *spawnTask(
    task: string,
    opts?: { taskId?: string; model?: string }
  ): AsyncGenerator<SSEEvent> {
    const taskId = opts?.taskId || `task-${Date.now()}`;
    const model = opts?.model || this.options.model;

    if (this.tasks.size >= this.options.maxConcurrent) {
      yield { type: 'error', payload: { error: 'Too many concurrent tasks. Try again shortly.' } };
      return;
    }

    let tempDir = '';

    try {
      // Strategy: prefer existing Chrome-Debug (has real signed-in sessions).
      // Fall back to spawning a new Chrome only if Chrome-Debug is not running.
      let cdpPort: number;
      let chromeProcess: ChildProcess | null = null;

      const chromeDebugAlive = await this.waitForCDP(this.chromeDebugPort, 1);
      if (chromeDebugAlive) {
        // Use the persistent Chrome-Debug — sessions are real, no temp profile needed.
        cdpPort = this.chromeDebugPort;
        yield { type: 'step_update', payload: { action: `Using Chrome-Debug (port ${cdpPort})`, status: 'running' } };
      } else {
        // Chrome-Debug not running — spawn an isolated Chrome with temp profile.
        const freePort = await this.findFreePort();
        if (!freePort) {
          yield { type: 'error', payload: { error: 'No free CDP ports available.' } };
          return;
        }
        cdpPort = freePort;

        tempDir = join(tmpdir(), `shofferai-chrome-${taskId}`);
        this.setupTempProfile(tempDir);
        chromeProcess = this.spawnChrome(cdpPort, tempDir);

        const cdpReady = await this.waitForCDP(cdpPort);
        if (!cdpReady) {
          yield { type: 'error', payload: { error: `Chrome failed to start on port ${cdpPort}` } };
          this.killProcess(chromeProcess);
          return;
        }
        yield { type: 'step_update', payload: { action: `Browser ready (port ${cdpPort})`, status: 'running' } };
      }

      // gh copilot with Playwright MCP pointed at Chrome
      // Uses globally-installed playwright-mcp binary (not npx) for instant startup
      const mcpConfig = JSON.stringify({
        mcpServers: {
          playwright: {
            type: 'stdio',
            command: 'playwright-mcp',
            args: [
              '--cdp-endpoint', `http://127.0.0.1:${cdpPort}`,
              '--cdp-timeout', '60000',
            ],
          },
        },
      });

      const agentProcess = spawn('gh', [
        'copilot', '--',
        '-p', task,
        '-s', SYSTEM_PROMPT,
        '--model', model,
        '--allow-all',
        '--no-ask-user',
        '--output-format', 'json',
        '--additional-mcp-config', mcpConfig,
      ], {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      this.tasks.set(taskId, {
        taskId, cdpPort, chromeProcess, agentProcess, tempDir,
      });
      this.usedPorts.add(cdpPort);

      yield { type: 'step_update', payload: { action: 'Agent starting...', status: 'running' } };

      // Parse structured JSONL output from gh copilot
      for await (const event of this.parseCopilotOutput(agentProcess, taskId)) {
        yield event;
      }

    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      yield { type: 'error', payload: { error: msg } };
    } finally {
      this.cleanup(taskId, tempDir);
    }
  }

  async *spawnParallel(
    tasks: string[],
    opts?: { taskIdPrefix?: string; model?: string }
  ): AsyncGenerator<SSEEvent> {
    const prefix = opts?.taskIdPrefix || `batch-${Date.now()}`;
    const generators = tasks.map((task, i) => ({
      index: i,
      gen: this.spawnTask(task, { taskId: `${prefix}-${i}`, model: opts?.model }),
    }));
    const pending = new Map<number, AsyncGenerator<SSEEvent>>();
    for (const { index, gen } of generators) pending.set(index, gen);
    while (pending.size > 0) {
      for (const [index, gen] of [...pending.entries()]) {
        const { value, done } = await gen.next();
        if (done) pending.delete(index);
        else if (value) yield { ...value, taskIndex: index };
      }
    }
  }

  sendInput(_taskId: string, _message: string): boolean {
    return false; // gh copilot -p doesn't support mid-execution stdin
  }

  kill(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (task) this.cleanup(taskId, task.tempDir);
  }

  killAll(): void {
    for (const taskId of this.tasks.keys()) this.kill(taskId);
  }

  // Copilot JSONL events:
  //   assistant.message       → yield SSE message
  //   assistant.tool_call     → yield step_update
  //   result                  → yield complete/error
  //   everything else         → skip

  private async *parseCopilotOutput(
    agentProcess: ChildProcess,
    taskId: string
  ): AsyncGenerator<SSEEvent> {
    let stderrOutput = '';
    agentProcess.stderr?.on('data', (chunk: Buffer) => {
      stderrOutput += chunk.toString();
      if (stderrOutput.length > 4096) stderrOutput = stderrOutput.slice(-4096);
    });

    const rl = createInterface({ input: agentProcess.stdout! });
    let resultYielded = false;
    let lastMessageSent = '';

    for await (const line of rl) {
      if (!line.trim()) continue;
      try {
        const event = JSON.parse(line);
        const type = event.type as string;
        const data = event.data || {};

        if (type === 'assistant.message') {
          const content = data.content as string;
          if (content && content !== lastMessageSent) {
            lastMessageSent = content;
            yield { type: 'message', payload: { content } };
          }
        } else if (type === 'assistant.tool_call') {
          const toolName = data.toolName || data.name || 'tool';
          yield { type: 'step_update', payload: {
            action: this.friendlyToolName(toolName, data.input || data.arguments),
            status: 'running',
          }};
        } else if (type === 'result') {
          resultYielded = true;
          const code = data.exitCode ?? event.exitCode;
          if (code && code !== 0) {
            yield { type: 'error', payload: { error: `Agent exited with code ${code}` } };
          } else {
            yield { type: 'complete', payload: { summary: 'Task completed' } };
          }
        }
      } catch { /* skip non-JSON */ }
    }

    const exitCode = await new Promise<number | null>((resolve) => {
      if (agentProcess.exitCode !== null) return resolve(agentProcess.exitCode);
      agentProcess.on('close', (code) => resolve(code));
    });

    if (!resultYielded) {
      const errMsg = stderrOutput.trim()
        || (exitCode ? `Agent exited with code ${exitCode}` : 'Agent produced no response');
      console.error(`[CopilotAgent] ${taskId}: no result. exit=${exitCode} stderr=${stderrOutput.slice(0, 500)}`);
      yield { type: 'error', payload: { error: errMsg } };
    }
  }

  private friendlyToolName(toolName: string, input?: Record<string, unknown>): string {
    const name = toolName.replace('mcp__playwright__', '').replace('playwright__', '');
    switch (name) {
      case 'browser_navigate': return `Navigating to ${input?.url || 'page'}`;
      case 'browser_snapshot': return 'Reading page content';
      case 'browser_click': return `Clicking ${input?.element || 'element'}`;
      case 'browser_type': return 'Typing text';
      case 'browser_tabs': return `Tab action: ${input?.action || 'manage'}`;
      case 'browser_take_screenshot': return 'Taking screenshot';
      case 'browser_wait_for': return 'Waiting for page';
      case 'browser_select_option': return 'Selecting option';
      case 'browser_navigate_back': return 'Going back';
      case 'browser_fill_form': return 'Filling form';
      default: return `Browser: ${name}`;
    }
  }

  private async findFreePort(): Promise<number | null> {
    const [min, max] = this.options.cdpPortRange;
    for (let port = min; port <= max; port++) {
      if (this.usedPorts.has(port)) continue;
      const free = await new Promise<boolean>((resolve) => {
        const net = require('net');
        const server = net.createServer();
        server.once('error', () => resolve(false));
        server.once('listening', () => { server.close(); resolve(true); });
        server.listen(port, '127.0.0.1');
      });
      if (free) return port;
    }
    return null;
  }

  private setupTempProfile(tempDir: string): void {
    const profileDir = join(tempDir, this.options.profileDirectory);
    const sourceDir = join(this.options.chromeSourceProfile, this.options.profileDirectory);
    mkdirSync(profileDir, { recursive: true });
    if (!existsSync(sourceDir)) return;
    for (const file of SESSION_FILES) {
      const src = join(sourceDir, file);
      if (existsSync(src)) {
        try { cpSync(src, join(profileDir, file), { force: true }); } catch { /* skip */ }
      }
    }
    for (const dir of SESSION_DIRS) {
      const src = join(sourceDir, dir);
      if (existsSync(src)) {
        try { cpSync(src, join(profileDir, dir), { recursive: true, force: true }); } catch { /* skip */ }
      }
    }
  }

  private spawnChrome(cdpPort: number, userDataDir: string): ChildProcess {
    return spawn(this.options.chromePath, [
      `--remote-debugging-port=${cdpPort}`,
      '--remote-debugging-address=127.0.0.1',
      `--user-data-dir=${userDataDir}`,
      `--profile-directory=${this.options.profileDirectory}`,
      '--no-first-run', '--no-default-browser-check', '--disable-blink-features=AutomationControlled', '--disable-sync', '--disable-default-apps',
    ], { stdio: 'ignore', detached: false });
  }

  private async waitForCDP(port: number, maxRetries = 30): Promise<boolean> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const res = await fetch(`http://127.0.0.1:${port}/json/version`, { signal: AbortSignal.timeout(2000) });
        if (res.ok) return true;
      } catch { /* not ready */ }
      await new Promise(r => setTimeout(r, 1000));
    }
    return false;
  }

  private killProcess(proc: ChildProcess): void {
    try {
      if (!proc.killed) proc.kill('SIGTERM');
      setTimeout(() => { try { if (!proc.killed) proc.kill('SIGKILL'); } catch { /* */ } }, 3000);
    } catch { /* already dead */ }
  }

  private cleanup(taskId: string, tempDir: string): void {
    const task = this.tasks.get(taskId);
    if (task) {
      this.killProcess(task.agentProcess);
      // Only kill Chrome if we spawned it (not the persistent Chrome-Debug)
      if (task.chromeProcess) this.killProcess(task.chromeProcess);
      this.usedPorts.delete(task.cdpPort);
      this.tasks.delete(taskId);
    }
    if (tempDir && existsSync(tempDir)) {
      try { rmSync(tempDir, { recursive: true, force: true }); } catch { /* */ }
    }
  }

  getStatus(): { running: number; maxConcurrent: number } {
    return { running: this.tasks.size, maxConcurrent: this.options.maxConcurrent };
  }
}
