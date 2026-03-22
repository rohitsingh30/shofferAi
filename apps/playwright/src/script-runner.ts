/**
 * ScriptRunner — executes compiled Playwright scripts directly, bypassing LLM.
 *
 * Instead of spawning Copilot CLI (30+ LLM calls, ~1-6 min),
 * runs a pre-written script as a Node.js child process (~10-30s).
 *
 * Protocol: scripts communicate via stdin/stdout JSON (same as ScriptPlayer
 * in agent-core, but this runs on the LAPTOP side with ChromePool).
 *
 * See docs/COMPILED-SCRIPTS.md for architecture details.
 */
import { spawn, type ChildProcess } from 'child_process';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { tmpdir } from 'os';
import { createInterface } from 'readline';
import { randomUUID } from 'crypto';
import { logger, type TaskRelayMessage } from '@shofferai/shared';
import type { ChromePool } from './chrome-pool';

// ─── Compiled Script Registry ──────────────────────────────────────────
// Only import scripts that are fully tested and ready for production.
// Each exports: SCRIPT_CODE (JS string), SKILL_ID, REQUIRED_PARAMS

import {
  SCRIPT_CODE as BIGBASKET_CODE,
  SKILL_ID as BIGBASKET_ID,
  REQUIRED_PARAMS as BIGBASKET_PARAMS,
} from '../../../packages/agent-core/src/scripts/compiled/bigbasket-grocery';
import {
  SCRIPT_CODE as BLINKIT_CODE,
  SKILL_ID as BLINKIT_ID,
  REQUIRED_PARAMS as BLINKIT_PARAMS,
} from '../../../packages/agent-core/src/scripts/compiled/blinkit-grocery';

interface CompiledScript {
  code: string;
  requiredParams: string[];
}

const SCRIPT_REGISTRY: Record<string, CompiledScript> = {
  [BIGBASKET_ID]: { code: BIGBASKET_CODE, requiredParams: BIGBASKET_PARAMS },
  [BLINKIT_ID]: { code: BLINKIT_CODE, requiredParams: BLINKIT_PARAMS },
};

// ─── Types ─────────────────────────────────────────────────────────────

type RelaySendFn = (msg: TaskRelayMessage) => void;

interface ScriptRunnerOptions {
  taskId: string;
  skillId: string;
  params: Record<string, string>;
  userContext: Record<string, unknown>;
  chromePool: ChromePool;
  sendToRelay: RelaySendFn;
  timeoutMs?: number;
}

export interface RunningScript {
  child: ChildProcess;
  tmpFile: string;
  /** Pending input_required step IDs waiting for user response */
  pendingInputs: Map<string, (value: string) => void>;
}

// ─── Public API ────────────────────────────────────────────────────────

/** Check if a compiled script exists for the given skillId */
export function hasCompiledScript(skillId: string): boolean {
  return skillId in SCRIPT_REGISTRY;
}

/** Get list of all registered script skill IDs */
export function getRegisteredScripts(): string[] {
  return Object.keys(SCRIPT_REGISTRY);
}

/**
 * Run a compiled script for a task.
 * Returns the RunningScript handle for input routing.
 */
export async function runCompiledScript(opts: ScriptRunnerOptions): Promise<RunningScript> {
  const { taskId, skillId, params, userContext, chromePool, sendToRelay, timeoutMs = 10 * 60_000 } = opts;

  const entry = SCRIPT_REGISTRY[skillId];
  if (!entry) {
    throw new Error(`No compiled script for skill: ${skillId}`);
  }

  // Acquire Chrome slot from pool
  logger.info(`ScriptRunner: acquiring Chrome for ${skillId} (task ${taskId.slice(0, 8)})`);
  const cdpEndpoint = await chromePool.acquireCdpEndpoint(taskId);
  logger.info(`ScriptRunner: Chrome ready at ${cdpEndpoint}`);

  sendToRelay({
    id: randomUUID(),
    type: 'task_progress',
    taskId,
    message: `Running optimized workflow for ${skillId}...`,
    step: 'script_start',
  });

  // Write script to temp file
  const tmpFile = join(tmpdir(), `shofferai-script-${taskId.slice(-8)}-${Date.now()}.js`);
  writeFileSync(tmpFile, entry.code);

  // Find node_modules with playwright
  let nodeModules = resolve(process.cwd(), 'node_modules');
  if (!existsSync(join(nodeModules, 'playwright'))) {
    nodeModules = resolve(process.cwd(), '../../node_modules');
  }

  // Spawn the script
  const child = spawn('node', [tmpFile, JSON.stringify(params), JSON.stringify(userContext)], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: {
      ...process.env,
      NODE_PATH: nodeModules,
      CHROME_CDP_ENDPOINT: cdpEndpoint,
    },
  });

  const pendingInputs = new Map<string, (value: string) => void>();
  const handle: RunningScript = { child, tmpFile, pendingInputs };

  logger.info(`ScriptRunner: spawned script PID=${child.pid} for task ${taskId.slice(0, 8)}`);

  // Set up timeout
  const timeoutId = setTimeout(() => {
    logger.warn(`ScriptRunner: task ${taskId.slice(0, 8)} timed out after ${timeoutMs / 1000}s`);
    child.kill('SIGTERM');
    setTimeout(() => child.kill('SIGKILL'), 5000);
  }, timeoutMs);

  // ─── stdout: parse script messages ────────────────────────────────
  const rl = createInterface({ input: child.stdout! });

  rl.on('line', (line) => {
    if (!line.trim()) return;
    try {
      const msg = JSON.parse(line);
      handleScriptMessage(msg, child, taskId, sendToRelay, pendingInputs);
    } catch {
      // Non-JSON output, ignore
    }
  });

  // ─── stderr: capture errors ───────────────────────────────────────
  let stderrBuf = '';
  child.stderr!.on('data', (chunk: Buffer) => {
    stderrBuf += chunk.toString();
    if (stderrBuf.length > 8192) stderrBuf = stderrBuf.slice(-8192);
  });

  // ─── Process exit ─────────────────────────────────────────────────
  child.on('close', (code) => {
    clearTimeout(timeoutId);
    rl.close();

    // Cleanup temp file
    try { unlinkSync(tmpFile); } catch { /* ignore */ }

    // Release Chrome slot
    chromePool.releaseSlot(taskId).catch((err) => {
      logger.warn(`ScriptRunner: failed to release Chrome slot for ${taskId.slice(0, 8)}`, { error: String(err) });
    });

    if (code === 0) {
      logger.info(`ScriptRunner: task ${taskId.slice(0, 8)} completed successfully`);
      // Don't send task_complete here — the script itself emits {done: true}
      // which triggers it in handleScriptMessage. But just in case it didn't:
      // (we check in task-manager's cleanup)
    } else {
      logger.warn(`ScriptRunner: task ${taskId.slice(0, 8)} exited with code ${code}`);
      sendToRelay({
        id: randomUUID(),
        type: 'task_error',
        taskId,
        error: stderrBuf.slice(-500) || `Script exited with code ${code}`,
        recoverable: false,
      });
    }
  });

  child.on('error', (err) => {
    clearTimeout(timeoutId);
    rl.close();
    try { unlinkSync(tmpFile); } catch { /* ignore */ }
    chromePool.releaseSlot(taskId).catch(() => {});

    sendToRelay({
      id: randomUUID(),
      type: 'task_error',
      taskId,
      error: err.message,
      recoverable: false,
    });
  });

  return handle;
}

/**
 * Send a user's input response to a running script's stdin.
 */
export function sendInputToScript(handle: RunningScript, stepId: string, value: string): boolean {
  const resolver = handle.pendingInputs.get(stepId);
  if (resolver) {
    handle.pendingInputs.delete(stepId);
    resolver(value);
    return true;
  }

  // Direct write to stdin as fallback
  if (handle.child.stdin && !handle.child.stdin.destroyed) {
    handle.child.stdin.write(JSON.stringify({ value }) + '\n');
    return true;
  }
  return false;
}

// ─── Internal: message handling ────────────────────────────────────────

function handleScriptMessage(
  msg: Record<string, unknown>,
  child: ChildProcess,
  taskId: string,
  sendToRelay: RelaySendFn,
  pendingInputs: Map<string, (value: string) => void>
): void {
  // ── Interactive: input_required ──────────────────────────────────
  if (msg.type === 'input_required') {
    const stepId = `script-${taskId.slice(-8)}-${Date.now()}`;

    // Store a promise resolver — when user responds, we write to stdin
    const writeResponse = (value: string) => {
      if (child.stdin && !child.stdin.destroyed) {
        child.stdin.write(JSON.stringify({ value }) + '\n');
      }
    };
    pendingInputs.set(stepId, writeResponse);

    sendToRelay({
      id: randomUUID(),
      type: 'task_input_required',
      taskId,
      stepId,
      question: msg.question as string,
      inputType: (msg.inputType as string) || 'freetext',
      options: msg.options as string[] | undefined,
      // Pass through product card fields for rich UI
      ...(msg.product ? { product: msg.product } : {}),
      ...(msg.sections ? { sections: msg.sections } : {}),
    });
    return;
  }

  // ── Interactive: confirm_action ─────────────────────────────────
  if (msg.type === 'confirm_action') {
    const stepId = `script-confirm-${taskId.slice(-8)}-${Date.now()}`;

    const writeResponse = (value: string) => {
      const confirmed = value === 'true' || value === 'yes' || value === 'confirm';
      if (child.stdin && !child.stdin.destroyed) {
        child.stdin.write(JSON.stringify({ confirmed }) + '\n');
      }
    };
    pendingInputs.set(stepId, writeResponse);

    sendToRelay({
      id: randomUUID(),
      type: 'task_input_required',
      taskId,
      stepId,
      question: `${msg.action}: ${msg.details || 'Proceed?'}`,
      inputType: 'confirmation',
    });
    return;
  }

  // ── Interactive: payment_required ───────────────────────────────
  if (msg.type === 'payment_required') {
    const stepId = `script-pay-${taskId.slice(-8)}-${Date.now()}`;

    const writeResponse = (value: string) => {
      const confirmed = value === 'true' || value === 'yes' || value === 'confirm';
      if (child.stdin && !child.stdin.destroyed) {
        child.stdin.write(JSON.stringify({ confirmed }) + '\n');
      }
    };
    pendingInputs.set(stepId, writeResponse);

    sendToRelay({
      id: randomUUID(),
      type: 'task_payment_required',
      taskId,
      stepId,
      amount: (msg.amountInr as number) || 0,
      description: (msg.description as string) || '',
      bookingSummary: (msg.bookingSummary as string) || '',
    });
    return;
  }

  // ── Progress: step update ───────────────────────────────────────
  if (msg.step) {
    sendToRelay({
      id: randomUUID(),
      type: 'task_progress',
      taskId,
      message: msg.step as string,
      step: (msg.status as string) || 'running',
    });
    return;
  }

  // ── Progress: message ───────────────────────────────────────────
  if (msg.message && !msg.done) {
    sendToRelay({
      id: randomUUID(),
      type: 'task_progress',
      taskId,
      message: msg.message as string,
    });
    return;
  }

  // ── Completion ──────────────────────────────────────────────────
  if (msg.done) {
    sendToRelay({
      id: randomUUID(),
      type: 'task_complete',
      taskId,
      summary: (msg.message as string) || 'Task completed via optimized workflow.',
    });
    return;
  }

  // ── Error ───────────────────────────────────────────────────────
  if (msg.error) {
    sendToRelay({
      id: randomUUID(),
      type: 'task_error',
      taskId,
      error: msg.error as string,
      recoverable: false,
    });
    return;
  }
}
