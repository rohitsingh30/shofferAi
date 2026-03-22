import { spawn, execSync, type ChildProcess } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { createInterface } from 'readline';
import { randomUUID } from 'crypto';
import WebSocket, { WebSocketServer } from 'ws';
import { createServer, type Server as HttpServer } from 'http';
import { mcpToolEvents, ChromePool } from './chrome-pool';
import {
  logger,
  shouldSuppressMessage,
  type TaskHandoffMessage,
  type TaskRelayMessage,
  type BridgeMessage,
  type BridgeOutgoingMessage,
  isBridgeRegister,
  isBridgeAskUser,
  isBridgeRequestPayment,
  isBridgeProgress,
  isBridgeComplete,
  isBridgeError,
} from '@shofferai/shared';

// ─── Types ────────────────────────────────────────────────────────────────

interface RunningTask {
  taskId: string;
  userId: string;
  description: string;
  skill?: string;
  agentProcess: ChildProcess;
  bridgeWs: WebSocket | null;
  startedAt: number;
  status: 'starting' | 'running' | 'complete' | 'error';
  /** ChromePool sessionId — set when bridge registers (taskId IS the sessionId) */
  sessionId: string | null;
}

export interface TaskManagerOptions {
  /** Port range for Bridge MCP local WebSocket server */
  bridgePortRange?: [number, number];
  /** Path to gh copilot binary */
  copilotBin?: string;
  /** Default model for Copilot CLI */
  model?: string;
  /** CDP port for persistent Chrome-Debug (default 9222) */
  chromeDebugPort?: number;
  /** Task timeout in ms (default 10 minutes) */
  taskTimeoutMs?: number;
  /** Max concurrent tasks */
  maxConcurrent?: number;
  /** ChromePool reference for releasing slots on cancellation */
  chromePool?: ChromePool;
}

type RelaySendFn = (msg: TaskRelayMessage) => void;

// ─── Constants ────────────────────────────────────────────────────────────

const BRIDGE_MCP_SCRIPT = join(__dirname, 'bridge-mcp-server.ts');
const BRIDGE_MCP_SCRIPT_JS = join(__dirname, 'bridge-mcp-server.js');
const PLAYWRIGHT_CHROME_SCRIPT = join(__dirname, '..', 'scripts', 'playwright-mcp-with-chrome.sh');

const SYSTEM_PROMPT = `You are ShofferAI, an AI assistant that executes real browser tasks on behalf of users.
You have Playwright MCP tools to control a Chrome browser AND Bridge MCP tools to communicate with the user.

Chrome is pre-authenticated as rsinghtomar3011@gmail.com (Booking.com Genius account).

RULES:
1. First call browser_navigate to go to the target URL — this opens a NEW tab automatically
2. After navigating, ALWAYS call browser_snapshot to read the page — do NOT retry navigation if the page loaded
3. Do NOT login to booking.com — Chrome is already signed in
4. Use send_progress to keep the user informed about what you're doing
5. Use ask_user when you need the user's input (e.g., choosing a hotel, providing OTP)
6. Use confirm_action before any irreversible action (order, payment)
7. Use request_payment when payment is required — WAIT for the payment to be confirmed before placing any order
8. Use browser_snapshot to read pages, browser_click to click, browser_type to type
9. Include prices, quantities, and totals when presenting options to the user
10. If browser_navigate succeeds (no error), the page IS loaded — take a snapshot to see it
11. NEVER retry navigation more than twice — if it fails twice, report the error via send_progress
12. When the task is complete, give a clear summary of what was accomplished`;

// ─── TaskManager ──────────────────────────────────────────────────────────

export class TaskManager {
  private tasks = new Map<string, RunningTask>();
  private bridgeWss: WebSocketServer | null = null;
  private bridgeHttpServer: HttpServer | null = null;
  private bridgePort = 0;
  private relaySend: RelaySendFn | null = null;
  private options: Required<Omit<TaskManagerOptions, 'chromePool'>>;
  private chromePool: ChromePool | null = null;
  private taskTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
  /** Cached GitHub token — avoids keyring issues in detached child processes */
  private ghTokenCache: { token: string; fetchedAt: number } | null = null;

  constructor(options: TaskManagerOptions = {}) {
    this.chromePool = options.chromePool || null;
    this.options = {
      bridgePortRange: options.bridgePortRange || [9400, 9499],
      copilotBin: options.copilotBin || process.env.COPILOT_BIN || 'gh',
      model: options.model || process.env.COPILOT_MODEL || 'claude-opus-4.6',
      chromeDebugPort: options.chromeDebugPort || Number(process.env.CHROME_DEBUG_PORT) || 9222,
      taskTimeoutMs: options.taskTimeoutMs || 15 * 60_000,
      maxConcurrent: options.maxConcurrent || 5,
    };
  }

  /** Start the local WebSocket server for Bridge MCP connections */
  async initialize(): Promise<void> {
    this.bridgePort = await this.findFreePort();
    if (!this.bridgePort) {
      throw new Error('TaskManager: no free port for Bridge WS server');
    }

    await new Promise<void>((resolve, reject) => {
      this.bridgeHttpServer = createServer();
      this.bridgeWss = new WebSocketServer({ server: this.bridgeHttpServer });

      this.bridgeWss.on('connection', (ws) => {
        this.handleBridgeConnection(ws);
      });

      this.bridgeWss.on('error', (err) => {
        logger.error('TaskManager: Bridge WSS error (non-fatal)', { error: err.message });
      });

      this.bridgeHttpServer.on('error', reject);
      this.bridgeHttpServer.listen(this.bridgePort, '127.0.0.1', () => {
        logger.info(`TaskManager: Bridge WS server listening on 127.0.0.1:${this.bridgePort}`);
        resolve();
      });
    });
  }

  /** Set the relay send function (called by relay-outbound or relay-server) */
  setRelaySend(fn: RelaySendFn): void {
    this.relaySend = fn;
  }

  /** Handle a task handoff from Cloud Run */
  async handleTaskHandoff(msg: TaskHandoffMessage): Promise<void> {
    const { taskId, userId, description, skill, extractedParams, conversationContext } = msg;

    if (this.tasks.size >= this.options.maxConcurrent) {
      this.sendToRelay({
        id: randomUUID(),
        type: 'task_error',
        taskId,
        error: 'Too many concurrent tasks. Try again shortly.',
        recoverable: true,
      });
      return;
    }

    if (this.tasks.has(taskId)) {
      logger.warn(`TaskManager: task ${taskId} already exists, ignoring duplicate handoff`);
      return;
    }

    logger.info(`TaskManager: received handoff for task ${taskId}`, { userId, skill: skill?.name });

    // Pre-flight: resolve GitHub token (parent reads keyring, child gets env var)
    const ghToken = this.resolveGhToken();
    if (!ghToken) {
      logger.error('TaskManager: GitHub auth unavailable — cannot spawn Copilot CLI');
      this.sendToRelay({
        id: randomUUID(),
        type: 'task_error',
        taskId,
        error: 'GitHub CLI is not authenticated. Run `gh auth login` on the laptop to fix.',
        recoverable: true,
      });
      return;
    }

    // Build the prompt for Copilot CLI
    const prompt = this.buildPrompt(description, skill, extractedParams, conversationContext);

    // Build MCP config: Playwright (with auto-launched Chrome) + Bridge
    const mcpConfig = this.buildMcpConfig(taskId);

    // Spawn Copilot CLI
    try {
      const agentProcess = this.spawnCopilotCLI(prompt, mcpConfig, taskId, ghToken);

      const task: RunningTask = {
        taskId,
        userId,
        description,
        skill: skill?.name,
        agentProcess,
        bridgeWs: null,
        startedAt: Date.now(),
        status: 'starting',
        sessionId: null,
      };
      this.tasks.set(taskId, task);

      // Set task timeout
      const timeoutId = setTimeout(() => {
        this.handleTaskTimeout(taskId);
      }, this.options.taskTimeoutMs);
      this.taskTimeouts.set(taskId, timeoutId);

      // Send initial progress
      this.sendToRelay({
        id: randomUUID(),
        type: 'task_progress',
        taskId,
        message: 'Agent starting...',
        step: 'init',
      });

      // Monitor process output and exit
      this.monitorProcess(taskId, agentProcess);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Failed to spawn agent';
      logger.error(`TaskManager: failed to spawn for task ${taskId}`, { error: errMsg });
      this.sendToRelay({
        id: randomUUID(),
        type: 'task_error',
        taskId,
        error: errMsg,
        recoverable: false,
      });
    }
  }

  /** Route an input response from Cloud Run to the appropriate Bridge MCP */
  handleInputResponse(taskId: string, stepId: string, value: string): void {
    const task = this.tasks.get(taskId);
    if (!task?.bridgeWs || task.bridgeWs.readyState !== WebSocket.OPEN) {
      logger.warn(`TaskManager: no bridge connection for task ${taskId}`);
      return;
    }

    // Resume the Copilot CLI process BEFORE sending the response so it can
    // read the Bridge MCP result. See SIGSTOP in handleBridgeMessage().
    if (task.agentProcess?.pid) {
      try {
        process.kill(-task.agentProcess.pid, 'SIGCONT');
        logger.info(`TaskManager: SIGCONT sent to CLI process group (PGID ${task.agentProcess.pid}) — user responded`);
      } catch (e) {
        logger.warn(`TaskManager: failed to SIGCONT CLI for task ${taskId}`);
      }
    }

    task.bridgeWs.send(JSON.stringify({
      type: 'bridge_input_response',
      taskId,
      stepId,
      value,
    }));
  }

  /** Route a payment response from Cloud Run to the appropriate Bridge MCP */
  handlePaymentResponse(taskId: string, stepId: string, confirmed: boolean, paymentId?: string): void {
    const task = this.tasks.get(taskId);
    if (!task?.bridgeWs || task.bridgeWs.readyState !== WebSocket.OPEN) {
      logger.warn(`TaskManager: no bridge connection for task ${taskId}`);
      return;
    }

    // Resume CLI (see SIGSTOP in handleBridgeMessage for isBridgeRequestPayment)
    if (task.agentProcess?.pid) {
      try {
        process.kill(-task.agentProcess.pid, 'SIGCONT');
        logger.info(`TaskManager: SIGCONT sent to CLI process group (PGID ${task.agentProcess.pid}) — payment responded`);
      } catch (e) {
        logger.warn(`TaskManager: failed to SIGCONT CLI for task ${taskId}`);
      }
    }

    task.bridgeWs.send(JSON.stringify({
      type: 'bridge_payment_response',
      taskId,
      stepId,
      confirmed,
      paymentId,
    }));
  }

  /** Cancel a running task */
  cancelTask(taskId: string, reason?: string): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    // Resume CLI first in case it's SIGSTOP'd (waiting for user input/payment).
    // A stopped process can't receive SIGTERM cleanly.
    if (task.agentProcess?.pid) {
      try { process.kill(-task.agentProcess.pid, 'SIGCONT'); } catch { /* */ }
    }

    // Notify Bridge MCP
    if (task.bridgeWs && task.bridgeWs.readyState === WebSocket.OPEN) {
      task.bridgeWs.send(JSON.stringify({
        type: 'bridge_cancel',
        taskId,
        reason,
      }));
    }

    // Kill the process
    this.cleanupTask(taskId);
  }

  getStatus(): { running: number; maxConcurrent: number; bridgePort: number } {
    return {
      running: this.tasks.size,
      maxConcurrent: this.options.maxConcurrent,
      bridgePort: this.bridgePort,
    };
  }

  /** Get detailed status for relay_status messages */
  getDetailedStatus(): {
    tasks: Array<{
      taskId: string;
      userId: string;
      status: 'starting' | 'running' | 'complete' | 'error';
      startedAt: number;
      skill?: string;
      description?: string;
    }>;
  } {
    const tasks: Array<{
      taskId: string;
      userId: string;
      status: 'starting' | 'running' | 'complete' | 'error';
      startedAt: number;
      skill?: string;
      description?: string;
    }> = [];
    for (const [, task] of this.tasks) {
      tasks.push({
        taskId: task.taskId,
        userId: task.userId,
        status: task.status,
        startedAt: task.startedAt,
        skill: task.skill,
        description: task.description.slice(0, 200),
      });
    }
    return { tasks };
  }

  async shutdown(): Promise<void> {
    // Cancel all tasks
    for (const taskId of this.tasks.keys()) {
      this.cleanupTask(taskId);
    }

    // Close Bridge WS server
    if (this.bridgeWss) {
      this.bridgeWss.close();
      this.bridgeWss = null;
    }
    if (this.bridgeHttpServer) {
      this.bridgeHttpServer.close();
      this.bridgeHttpServer = null;
    }
    logger.info('TaskManager: shut down');
  }

  // ─── Private: Prompt Building ─────────────────────────────────────────

  private buildPrompt(
    description: string,
    skill: TaskHandoffMessage['skill'],
    extractedParams: Record<string, string>,
    conversationContext?: string,
  ): string {
    const parts: string[] = [];

    parts.push(`TASK: ${description}`);

    if (Object.keys(extractedParams).length > 0) {
      parts.push('\nEXTRACTED PARAMETERS:');
      for (const [key, value] of Object.entries(extractedParams)) {
        parts.push(`- ${key}: ${value}`);
      }
    }

    if (skill) {
      parts.push(`\nSKILL: ${skill.name}`);
      parts.push(`WEBSITE: ${skill.siteUrl}`);
      if (skill.requiresAuth) {
        parts.push('NOTE: This site requires authentication. Login first if not already signed in.');
      }
      parts.push(`\nINSTRUCTIONS:\n${skill.instructions}`);
    }

    if (conversationContext) {
      parts.push(`\nCONVERSATION CONTEXT:\n${conversationContext}`);
    }

    return parts.join('\n');
  }

  private buildMcpConfig(taskId: string): string {
    const bridgeScript = existsSync(BRIDGE_MCP_SCRIPT_JS)
      ? BRIDGE_MCP_SCRIPT_JS
      : BRIDGE_MCP_SCRIPT;

    // Determine the runner: .ts files need tsx, .js files use node
    const isTsFile = bridgeScript.endsWith('.ts');
    const command = isTsFile ? 'npx' : 'node';
    const args = isTsFile ? ['tsx', bridgeScript] : [bridgeScript];

    // Use playwright-mcp-with-chrome.sh which launches its own Chrome
    // with a dynamic port — no hardcoded CDP port needed
    return JSON.stringify({
      mcpServers: {
        playwright: {
          type: 'stdio',
          command: 'bash',
          args: [PLAYWRIGHT_CHROME_SCRIPT],
        },
        bridge: {
          type: 'stdio',
          command,
          args,
          env: {
            BRIDGE_WS_PORT: String(this.bridgePort),
            BRIDGE_TASK_ID: taskId,
          },
        },
      },
    });
  }

  /**
   * Resolve GitHub token from cache, env, or `gh auth token`.
   * Caches for 30 min to avoid repeated keyring lookups.
   * Passing GH_TOKEN to the subprocess avoids keyring issues in detached processes.
   */
  private resolveGhToken(): string | null {
    // Prefer explicit env var (already works without keyring)
    if (process.env.GH_TOKEN) return process.env.GH_TOKEN;
    if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
    if (process.env.COPILOT_GITHUB_TOKEN) return process.env.COPILOT_GITHUB_TOKEN;

    // Return cached token if fresh (30 min TTL)
    const TTL_MS = 30 * 60_000;
    if (this.ghTokenCache && Date.now() - this.ghTokenCache.fetchedAt < TTL_MS) {
      return this.ghTokenCache.token;
    }

    // Fetch from gh CLI (reads keyring in parent process — works reliably)
    try {
      const token = execSync(`${this.options.copilotBin} auth token 2>/dev/null`, {
        timeout: 5_000,
        encoding: 'utf-8',
      }).trim();
      if (token) {
        this.ghTokenCache = { token, fetchedAt: Date.now() };
        logger.info('TaskManager: cached GitHub token from gh auth');
        return token;
      }
    } catch {
      logger.warn('TaskManager: failed to get GitHub token from gh auth');
    }
    return null;
  }

  private spawnCopilotCLI(prompt: string, mcpConfig: string, taskId: string, ghToken: string | null): ChildProcess {
    // Embed system instructions into the prompt (no --system-prompt flag in gh copilot)
    const fullPrompt = `${SYSTEM_PROMPT}\n\n---\n\nTASK:\n${prompt}`;

    const args = [
      'copilot', '--',
      '-p', fullPrompt,
      '--model', this.options.model,
      '--allow-all',
      '--output-format', 'json',
      '--additional-mcp-config', mcpConfig,
    ];

    logger.info(`TaskManager: spawning Copilot CLI for task ${taskId}`, {
      model: this.options.model,
      promptLength: prompt.length,
      hasGhToken: !!ghToken,
    });

    const env: Record<string, string | undefined> = {
      ...process.env,
      BRIDGE_WS_PORT: String(this.bridgePort),
      BRIDGE_TASK_ID: taskId,
    };
    // Inject token so detached child doesn't need keyring access
    if (ghToken) {
      env.GH_TOKEN = ghToken;
    }

    const proc = spawn(this.options.copilotBin, args, {
      detached: true,  // Own process group — allows SIGSTOP/SIGCONT on entire tree
      stdio: ['pipe', 'pipe', 'pipe'],
      env,
    });

    // Don't let the detached child keep the parent alive
    proc.unref();

    return proc;
  }

  // ─── Private: Process Monitoring ──────────────────────────────────────

  private monitorProcess(taskId: string, proc: ChildProcess): void {
    let stderrOutput = '';
    proc.stderr?.on('data', (chunk: Buffer) => {
      stderrOutput += chunk.toString();
      if (stderrOutput.length > 8192) stderrOutput = stderrOutput.slice(-8192);
    });

    const rl = createInterface({ input: proc.stdout! });
    let resultYielded = false;
    let lastMessage = '';

    rl.on('line', (line) => {
      if (!line.trim()) return;
      try {
        const event = JSON.parse(line);
        this.handleCopilotEvent(taskId, event, { resultYielded, lastMessage });
        if (event.type === 'result') resultYielded = true;
        if (event.type === 'assistant.message' && event.data?.content) {
          lastMessage = event.data.content;
        }
      } catch { /* skip non-JSON lines */ }
    });

    proc.on('close', (code) => {
      logger.info(`TaskManager: Copilot CLI exited for task ${taskId}`, { code });

      const task = this.tasks.get(taskId);
      if (task && task.status !== 'complete' && task.status !== 'error') {
        if (!resultYielded) {
          const errMsg = stderrOutput.trim()
            || (code ? `Agent exited with code ${code}` : 'Agent produced no response');
          this.sendToRelay({
            id: randomUUID(),
            type: 'task_error',
            taskId,
            error: errMsg,
            recoverable: false,
          });
        }
        this.cleanupTask(taskId);
      }
    });

    proc.on('error', (error) => {
      logger.error(`TaskManager: process error for task ${taskId}`, { error: error.message });
      this.sendToRelay({
        id: randomUUID(),
        type: 'task_error',
        taskId,
        error: `Process error: ${error.message}`,
        recoverable: false,
      });
      this.cleanupTask(taskId);
    });
  }

  private handleCopilotEvent(
    taskId: string,
    event: { type: string; data?: Record<string, unknown>; exitCode?: number },
    state: { resultYielded: boolean; lastMessage: string },
  ): void {
    const type = event.type;
    const data = event.data || {};

    // Log ALL events for debugging MCP visibility
    logger.info(`[copilot-event] task=${taskId.slice(0,8)} type=${type}`, {
      dataKeys: Object.keys(data),
    });

    if (type === 'assistant.message') {
      const content = data.content as string;
      if (content && content !== state.lastMessage) {
        // Skip internal tool-call labels — the user should only see natural language.
        if (shouldSuppressMessage(content)) {
          logger.info(`[copilot-msg] suppressed internal message: ${content.slice(0, 80)}`);
        } else {
          this.sendToRelay({
            id: randomUUID(),
            type: 'task_progress',
            taskId,
            message: content,
          });
        }
      }
    } else if (type === 'assistant.tool_call' || type === 'tool.execution_start') {
      const toolName = (data.toolName || data.name || 'tool') as string;
      const toolArgs = (data.input || data.arguments || {}) as Record<string, unknown>;

      // Emit to MCP log stream for real-time visibility
      const cleanName = toolName.replace('mcp__playwright__', '').replace('playwright__', '');
      mcpToolEvents.emit('mcp_tool', {
        type: 'tool_start',
        timestamp: new Date().toISOString(),
        sessionId: taskId.slice(0, 12),
        toolName: cleanName,
        args: truncateToolArgs(toolArgs),
      });

      // Tool calls are NOT forwarded to the user chat — they go only to the
      // MCP log stream above (mcpToolEvents.emit). The user should see only
      // LLM text messages, ask_user prompts, and confirm_action prompts.
      // See REPEATING-MISTAKES.md #14.
    } else if (type === 'tool.execution_complete') {
      const toolCallId = data.toolCallId as string || '';
      const success = data.success as boolean;
      const resultStr = typeof data.result === 'string' ? data.result : JSON.stringify(data.result ?? '');

      mcpToolEvents.emit('mcp_tool', {
        type: success ? 'tool_end' : 'tool_error',
        timestamp: new Date().toISOString(),
        sessionId: taskId.slice(0, 12),
        toolName: toolCallId,
        resultSummary: resultStr.slice(0, 300),
        error: success ? undefined : resultStr.slice(0, 300),
      });
    } else if (type === 'result') {
      const task = this.tasks.get(taskId);
      const code = data.exitCode ?? event.exitCode;
      if (code && code !== 0) {
        if (task) task.status = 'error';
        this.sendToRelay({
          id: randomUUID(),
          type: 'task_error',
          taskId,
          error: `Agent exited with code ${code}`,
          recoverable: false,
        });
      } else {
        if (task) task.status = 'complete';
        this.sendToRelay({
          id: randomUUID(),
          type: 'task_complete',
          taskId,
          summary: state.lastMessage || 'Task completed',
        });
      }
      this.cleanupTask(taskId);
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

  // ─── Private: Bridge MCP WebSocket ────────────────────────────────────

  private handleBridgeConnection(ws: WebSocket): void {
    logger.debug('TaskManager: Bridge MCP connection received');

    // CRITICAL: must handle 'error' or Node.js crashes the process
    ws.on('error', (err) => {
      logger.warn('TaskManager: bridge WS error (non-fatal)', { error: err.message });
    });

    ws.on('message', (data) => {
      let msg: BridgeOutgoingMessage;
      try {
        msg = JSON.parse(data.toString());
      } catch {
        logger.error('TaskManager: invalid JSON from bridge');
        return;
      }

      this.handleBridgeMessage(ws, msg);
    });

    ws.on('close', () => {
      // Find and clean up the task associated with this bridge
      for (const [, task] of this.tasks) {
        if (task.bridgeWs === ws) {
          task.bridgeWs = null;
          logger.debug(`TaskManager: bridge disconnected for task ${task.taskId}`);
          break;
        }
      }
    });
  }

  private handleBridgeMessage(ws: WebSocket, msg: BridgeOutgoingMessage): void {
    if (isBridgeRegister(msg)) {
      const task = this.tasks.get(msg.taskId);
      if (task) {
        task.bridgeWs = ws;
        task.status = 'running';
        task.sessionId = msg.taskId; // taskId IS the sessionId used by ChromePool
        ws.send(JSON.stringify({ type: 'bridge_registered', taskId: msg.taskId }));
        logger.info(`TaskManager: bridge registered for task ${msg.taskId}`);
      } else {
        logger.warn(`TaskManager: bridge registered for unknown task ${msg.taskId}`);
        ws.close();
      }
      return;
    }

    if (isBridgeAskUser(msg)) {
      // Freeze the Copilot CLI process while waiting for user input.
      // Without this, the CLI's internal tool timeout (~3 min) fires and
      // the agent continues browsing autonomously while the user is still
      // being asked a question. SIGSTOP pauses the process; SIGCONT in
      // handleInputResponse() resumes it when the user responds.
      const task = this.tasks.get(msg.taskId);
      if (task?.agentProcess?.pid) {
        try {
          process.kill(-task.agentProcess.pid, 'SIGSTOP');
          logger.info(`TaskManager: SIGSTOP sent to CLI process group (PGID ${task.agentProcess.pid}) — waiting for user input`);
        } catch (e) {
          logger.warn(`TaskManager: failed to SIGSTOP CLI for task ${msg.taskId}`);
        }
      }

      this.sendToRelay({
        id: randomUUID(),
        type: 'task_input_required',
        taskId: msg.taskId,
        stepId: msg.stepId,
        question: msg.question,
        inputType: msg.inputType,
        options: msg.options,
        cards: msg.cards,
        show_quantity: msg.show_quantity,
        allow_custom: msg.allow_custom,
        multi_select: msg.multi_select,
        saved: msg.saved,
        mode: msg.mode,
        shortcuts: msg.shortcuts,
        counters: msg.counters,
        min: msg.min,
        max: msg.max,
        step: msg.step,
        presets: msg.presets,
        placeholder: msg.placeholder,
        format_hint: msg.format_hint,
        sections: msg.sections,
        product: msg.product,
      });
      return;
    }

    if (isBridgeRequestPayment(msg)) {
      // Freeze CLI while waiting for payment confirmation (same as ask_user)
      const task = this.tasks.get(msg.taskId);
      if (task?.agentProcess?.pid) {
        try {
          process.kill(-task.agentProcess.pid, 'SIGSTOP');
          logger.info(`TaskManager: SIGSTOP sent to CLI process group (PGID ${task.agentProcess.pid}) — waiting for payment`);
        } catch (e) {
          logger.warn(`TaskManager: failed to SIGSTOP CLI for task ${msg.taskId}`);
        }
      }

      this.sendToRelay({
        id: randomUUID(),
        type: 'task_payment_required',
        taskId: msg.taskId,
        stepId: msg.stepId,
        amount: msg.amount,
        description: msg.description,
        bookingSummary: msg.bookingSummary,
      });
      return;
    }

    if (isBridgeProgress(msg)) {
      this.sendToRelay({
        id: randomUUID(),
        type: 'task_progress',
        taskId: msg.taskId,
        message: msg.message,
        step: msg.step,
      });
      return;
    }

    if (isBridgeComplete(msg)) {
      const task = this.tasks.get(msg.taskId);
      if (task) task.status = 'complete';
      this.sendToRelay({
        id: randomUUID(),
        type: 'task_complete',
        taskId: msg.taskId,
        summary: msg.summary,
        result: msg.result,
      });
      this.cleanupTask(msg.taskId);
      return;
    }

    if (isBridgeError(msg)) {
      const task = this.tasks.get(msg.taskId);
      if (task) task.status = 'error';
      this.sendToRelay({
        id: randomUUID(),
        type: 'task_error',
        taskId: msg.taskId,
        error: msg.error,
        recoverable: msg.recoverable,
      });
      if (!msg.recoverable) {
        this.cleanupTask(msg.taskId);
      }
      return;
    }
  }

  // ─── Private: Utilities ───────────────────────────────────────────────

  private sendToRelay(msg: TaskRelayMessage): void {
    if (!this.relaySend) {
      logger.warn('TaskManager: no relay send function set, dropping message', { type: msg.type });
      return;
    }
    this.relaySend(msg);
  }

  private handleTaskTimeout(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (!task || task.status === 'complete' || task.status === 'error') return;

    logger.warn(`TaskManager: task ${taskId} timed out after ${this.options.taskTimeoutMs / 60_000} min`);
    this.sendToRelay({
      id: randomUUID(),
      type: 'task_error',
      taskId,
      error: 'This task has been running for a while without completing, so I\'ve ended it. Feel free to start a new chat whenever you\'re ready!',
      recoverable: false,
    });
    this.cancelTask(taskId, 'timeout');
  }

  private cleanupTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    // Clear timeout
    const timeoutId = this.taskTimeouts.get(taskId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.taskTimeouts.delete(taskId);
    }

    // Kill agent process group (detached: true makes PID = PGID).
    // SIGCONT first — a SIGSTOP'd process silently ignores SIGTERM.
    // This also kills the per-task Chrome launched by playwright-mcp-with-chrome.sh
    // since Chrome shares the same process group as the Copilot CLI.
    try {
      if (!task.agentProcess.killed && task.agentProcess.pid) {
        process.kill(-task.agentProcess.pid, 'SIGCONT');
        process.kill(-task.agentProcess.pid, 'SIGTERM');
        setTimeout(() => {
          try {
            if (!task.agentProcess.killed && task.agentProcess.pid) {
              process.kill(-task.agentProcess.pid, 'SIGKILL');
            }
          } catch { /* already dead */ }
        }, 3000);
      }
    } catch { /* already dead */ }

    // Close bridge WS
    if (task.bridgeWs && task.bridgeWs.readyState === WebSocket.OPEN) {
      task.bridgeWs.close();
    }

    this.tasks.delete(taskId);
    logger.info(`TaskManager: cleaned up task ${taskId}`);
  }

  private async waitForCDP(port: number, maxRetries = 5): Promise<boolean> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const res = await fetch(`http://127.0.0.1:${port}/json/version`, {
          signal: AbortSignal.timeout(2000),
        });
        if (res.ok) return true;
      } catch { /* not ready */ }
      if (i < maxRetries - 1) await new Promise(r => setTimeout(r, 1000));
    }
    return false;
  }

  private async findFreePort(): Promise<number> {
    const [min, max] = this.options.bridgePortRange;
    const net = await import('net');
    for (let port = min; port <= max; port++) {
      const free = await new Promise<boolean>((resolve) => {
        const server = net.createServer();
        server.once('error', () => resolve(false));
        server.once('listening', () => { server.close(); resolve(true); });
        server.listen(port, '127.0.0.1');
      });
      if (free) return port;
    }
    return 0;
  }
}

function truncateToolArgs(args: Record<string, unknown>): Record<string, unknown> {
  const t: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(args)) {
    t[k] = typeof v === 'string' && v.length > 200 ? v.slice(0, 200) + '…' : v;
  }
  return t;
}
