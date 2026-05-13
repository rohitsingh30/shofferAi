/**
 * BrowserOpsHost — implements MCPHostLike against the Browser Operations Service.
 *
 * Replaces the old RemoteMCPHost / RelayBridge / SessionMCPHost stack.
 * Cloud's AgentExecutor sees a normal MCPHostLike; this class:
 *
 *   - Exposes the runner's tools/list as MCPHostLike.getTools()
 *   - Routes callTool() through MCP, injecting per-task _meta.shoffer.*
 *   - Auto-injects session_id arg into every call (atomically, per-task)
 *   - Owns the per-(operator, site, task) browser session lifecycle
 *
 * One BrowserOpsHost is created per task (since session_id is task-scoped).
 * Underlying MCP client is shared across tasks via the singleton in singletons.ts.
 */

import type { MCPTool, AnthropicTool, MCPHostLike } from '@shofferai/shared';
import { mcpEventBus } from '../mcp-event-bus';
import type {
  BrowserOpsMcpClient,
  MCPCallResult,
} from './mcp-client';
import type {
  OpenSessionInput,
  SessionSnapshot,
  ShofferMeta,
  CartNamespace,
  SessionId,
  BrowserOpTool,
} from './types';

const SESSION_OPEN_TIMEOUT_MS = 30_000;
const DEFAULT_OP_TIMEOUT_MS  = 90_000; // covers place_order p95 per spec §11.1

export interface BrowserOpsHostConfig {
  client: BrowserOpsMcpClient;
  taskId: string;
  userRef?: string;
}

export class BrowserOpsHost implements MCPHostLike {
  private session: SessionSnapshot | null = null;
  private idempotencyCounter = 0;
  private toolsCache: MCPTool[] | null = null;

  constructor(private readonly config: BrowserOpsHostConfig) {}

  /** Open a browser session for `(operator, site)`. Idempotent — call once per task per site. */
  async openSession(input: OpenSessionInput): Promise<SessionSnapshot> {
    if (this.session) return this.session;

    const result = await this.config.client.callTool(
      'session.open',
      {
        site: input.site,
        user_ref: input.user_ref ?? this.config.userRef,
        operator_id: input.operator_id,
        region: input.region,
        device: input.device,
        force_fresh: input.force_fresh,
        options: input.options,
        limits: input.limits,
      },
      {
        meta: this.buildMeta('session.open'),
        timeoutMs: SESSION_OPEN_TIMEOUT_MS,
      },
    );

    if (result.isError) {
      throw this.errorFrom(result);
    }
    const snap = (result.structuredContent ?? {}) as SessionSnapshot;
    if (!snap.session_id) {
      throw new Error('session.open: no session_id in response');
    }
    this.session = snap;
    return snap;
  }

  get sessionId(): SessionId | null {
    return this.session?.session_id ?? null;
  }

  get cartNamespace(): CartNamespace | null {
    return this.session?.cart_namespace ?? null;
  }

  async closeSession(): Promise<void> {
    if (!this.session) return;
    const sessionId = this.session.session_id;
    this.session = null;
    try {
      await this.config.client.callTool(
        'session.close',
        { session_id: sessionId },
        { meta: this.buildMeta('session.close'), timeoutMs: 10_000 },
      );
    } catch { /* best-effort — session may have already TTL'd out */ }
  }

  async getSnapshot(): Promise<SessionSnapshot | null> {
    if (!this.session) return null;
    const r = await this.config.client.callTool(
      'session.snapshot',
      { session_id: this.session.session_id },
      { meta: this.buildMeta('session.snapshot'), timeoutMs: 10_000 },
    );
    if (r.isError) return this.session;
    const fresh = (r.structuredContent ?? {}) as SessionSnapshot;
    this.session = { ...this.session, ...fresh };
    return this.session;
  }

  // ──────────────────────────────────────────────────────────────────
  // MCPHostLike surface — what AgentExecutor sees
  // ──────────────────────────────────────────────────────────────────

  isConnected(): boolean {
    return this.config.client.isConnected();
  }

  async connect(): Promise<void> {
    await this.config.client.connect();
  }

  async disconnect(): Promise<void> {
    await this.closeSession();
  }

  /** Return the runner's tool catalogue, EXCLUDING session lifecycle tools (cloud manages those). */
  getTools(): MCPTool[] {
    return this.toolsCache ?? [];
  }

  /** Load the catalogue once, cache it, expose only the non-lifecycle tools to the LLM. */
  async loadTools(): Promise<MCPTool[]> {
    const all = await this.config.client.listTools();
    const filtered = all.filter(t => !this.isLifecycleTool(t.name));
    this.toolsCache = filtered.map(toMcpTool);
    return this.toolsCache;
  }

  isMCPTool(toolName: string): boolean {
    return this.toolsCache?.some(t => t.name === toolName) ?? false;
  }

  /** Convert MCP tools into Anthropic-style Tool definitions for the LLM. */
  getToolsAsAnthropicFormat(): AnthropicTool[] {
    return (this.toolsCache ?? []).map(t => ({
      name: t.name,
      description: t.description,
      input_schema: (t.inputSchema as AnthropicTool['input_schema']) ?? {
        type: 'object',
        properties: {},
      },
    }));
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    const start = Date.now();
    mcpEventBus.emitToolStart(this.config.taskId, name, args);

    // Auto-inject session_id (the SessionMCPHost pattern, but per-task here).
    const enrichedArgs: Record<string, unknown> = {
      ...args,
    };
    if (this.session && enrichedArgs.session_id == null) {
      enrichedArgs.session_id = this.session.session_id;
    }

    let result: MCPCallResult;
    try {
      result = await this.config.client.callTool(name, enrichedArgs, {
        meta: this.buildMeta(name),
        timeoutMs: DEFAULT_OP_TIMEOUT_MS,
      });
    } catch (err) {
      const duration = Date.now() - start;
      mcpEventBus.emitToolError(this.config.taskId, name, duration, err);
      throw err;
    }

    const duration = Date.now() - start;

    if (result.isError) {
      mcpEventBus.emitToolError(this.config.taskId, name, duration, result.structuredContent);
      throw this.errorFrom(result);
    }

    mcpEventBus.emitToolEnd(this.config.taskId, name, duration, result.structuredContent);
    return result.structuredContent ?? { ok: true };
  }

  // ──────────────────────────────────────────────────────────────────
  // Internals
  // ──────────────────────────────────────────────────────────────────

  /** Lifecycle tools the cloud manages directly, not exposed to the LLM. */
  private isLifecycleTool(name: string): boolean {
    return name === 'session.open' || name === 'session.close' || name === 'session.snapshot';
  }

  private buildMeta(opName: string): ShofferMeta {
    return {
      idempotency_key: this.makeIdempotencyKey(opName),
      task_id: this.config.taskId,
      user_ref: this.config.userRef,
      cart_namespace: this.cartNamespace ?? undefined,
    };
  }

  /** Cloud-side rule (S1): fresh ULID per intent, NEVER a hash of args.
   *  We don't have a real ULID lib here so we synthesise a monotonic-ish key. */
  private makeIdempotencyKey(opName: string): string {
    const ts = Date.now().toString(36).padStart(9, '0');
    const seq = (++this.idempotencyCounter).toString(36).padStart(4, '0');
    const rand = Math.floor(Math.random() * 0xffffff).toString(36).padStart(5, '0');
    return `cloud_${ts}_${seq}_${rand}_${opName.replace(/\W/g, '').slice(0, 12)}`;
  }

  private errorFrom(result: MCPCallResult): Error {
    const sc = (result.structuredContent ?? {}) as {
      code?: string;
      title?: string;
      detail?: string;
      user_message?: string;
    };
    const msg =
      sc.user_message ||
      sc.detail ||
      sc.title ||
      sc.code ||
      result.text ||
      'browser-ops error';
    const err = new Error(msg);
    Object.assign(err, { rfc7807: sc });
    return err;
  }
}

function toMcpTool(t: BrowserOpTool): MCPTool {
  return {
    name: t.name,
    description: t.description ?? '',
    inputSchema: t.inputSchema ?? { type: 'object', properties: {} },
  } as MCPTool;
}
