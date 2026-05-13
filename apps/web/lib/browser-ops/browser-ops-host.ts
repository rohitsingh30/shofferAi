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
  /** Sessions keyed by site (e.g. 'bigbasket' → snapshot). One BrowserOpsHost
   *  per task may open MANY sessions when the LLM is calling tools across
   *  multiple sites in parallel (cross-store comparison). */
  private sessions: Map<string, SessionSnapshot> = new Map();
  /** Set of sites currently being opened (so concurrent callTool for the same
   *  site coalesce instead of double-opening). */
  private opening: Map<string, Promise<SessionSnapshot>> = new Map();
  private idempotencyCounter = 0;
  private toolsCache: MCPTool[] | null = null;

  constructor(private readonly config: BrowserOpsHostConfig) {}

  /** Open a browser session for `(operator, site)`. Idempotent — returns the
   *  existing session if one is already open for this site. */
  async openSession(input: OpenSessionInput): Promise<SessionSnapshot> {
    return this.openSessionForSite(input.site, input);
  }

  /** Internal: open or return an existing session for a specific site. */
  private async openSessionForSite(
    site: string,
    input?: Partial<OpenSessionInput>,
  ): Promise<SessionSnapshot> {
    const existing = this.sessions.get(site);
    if (existing) return existing;
    const inFlight = this.opening.get(site);
    if (inFlight) return inFlight;

    const promise = (async () => {
      const result = await this.config.client.callTool(
        'session.open',
        {
          site,
          user_ref: input?.user_ref ?? this.config.userRef,
          operator_id: input?.operator_id,
          region: input?.region,
          device: input?.device,
          force_fresh: input?.force_fresh,
          options: input?.options,
          limits: input?.limits,
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
      this.sessions.set(site, snap);
      return snap;
    })();

    this.opening.set(site, promise);
    try {
      return await promise;
    } finally {
      this.opening.delete(site);
    }
  }

  /** Backward-compat: returns the most-recently-opened session_id, or the
   *  bigbasket session if any exist. Multi-session callers should use the
   *  per-site lookup in callTool() instead. */
  get sessionId(): SessionId | null {
    if (this.sessions.size === 0) return null;
    // Prefer bigbasket if present (most common single-site flow), else first.
    const bb = this.sessions.get('bigbasket');
    if (bb) return bb.session_id;
    const first = this.sessions.values().next().value;
    return first?.session_id ?? null;
  }

  get cartNamespace(): CartNamespace | null {
    if (this.sessions.size === 0) return null;
    const bb = this.sessions.get('bigbasket');
    if (bb) return bb.cart_namespace ?? null;
    const first = this.sessions.values().next().value;
    return first?.cart_namespace ?? null;
  }

  /** Get the open session_id for a specific site, if one exists. */
  sessionIdForSite(site: string): SessionId | null {
    const snap = this.sessions.get(site);
    return snap ? snap.session_id : null;
  }

  async closeSession(): Promise<void> {
    // Close ALL open sessions (tasks may have multiple in cross-store flow).
    const allSites = Array.from(this.sessions.keys());
    for (const site of allSites) {
      const snap = this.sessions.get(site);
      if (!snap) continue;
      this.sessions.delete(site);
      try {
        await this.config.client.callTool(
          'session.close',
          { session_id: snap.session_id },
          { meta: this.buildMeta('session.close'), timeoutMs: 10_000 },
        );
      } catch { /* best-effort */ }
    }
  }

  async getSnapshot(): Promise<SessionSnapshot | null> {
    // Backward-compat: returns the snapshot of the first/bigbasket session
    // if any exist. For multi-session flows, callers should track their own
    // sessions of interest.
    const bb = this.sessions.get('bigbasket');
    const target = bb ?? this.sessions.values().next().value ?? null;
    if (!target) return null;
    const r = await this.config.client.callTool(
      'session.snapshot',
      { session_id: target.session_id },
      { meta: this.buildMeta('session.snapshot'), timeoutMs: 10_000 },
    );
    if (r.isError) return target;
    const fresh = (r.structuredContent ?? {}) as SessionSnapshot;
    const merged = { ...target, ...fresh };
    // Update the cached entry so subsequent reads see the fresh data.
    for (const [site, snap] of this.sessions.entries()) {
      if (snap.session_id === target.session_id) this.sessions.set(site, merged);
    }
    return merged;
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

  /**
   * Convert MCP tools into Anthropic-style Tool definitions for the LLM.
   *
   * **Schema flattening (per Anthropic / MCP spec 2025 best practices):**
   * Runner tools today use `{ session_id, input: { ... } }` envelope. LLMs
   * are trained on flat schemas and consistently hallucinate or drop the
   * `input` wrapper. We expose flat schemas to the LLM (just the inner
   * `input.properties`) and re-envelope server-side in callTool().
   *
   * Also drops `session_id` entirely from the LLM-visible schema — the
   * active session is injected automatically and has no business in the
   * LLM's reasoning surface.
   *
   * Reference: https://anthropic.com/engineering/writing-tools-for-agents
   * Reference: https://modelcontextprotocol.io/specification/2025-06-18/server/tools
   */
  getToolsAsAnthropicFormat(): AnthropicTool[] {
    return (this.toolsCache ?? []).map(t => ({
      name: t.name,
      description: t.description,
      input_schema: this.flattenSchemaForLLM(t.inputSchema),
    }));
  }

  /**
   * Flatten the server's `{ session_id, input: { properties... } }` schema
   * into a flat `{ properties... }` schema. Drops `session_id` (auto-injected)
   * and unwraps `input` (auto-wrapped) so the LLM sees the natural arg shape.
   *
   * If the source schema doesn't match the expected envelope, returns it
   * as-is — graceful degradation for non-conforming tools (e.g. session.open).
   */
  private flattenSchemaForLLM(rawSchema: unknown): AnthropicTool['input_schema'] {
    const fallback: AnthropicTool['input_schema'] = { type: 'object' as const, properties: {} };
    if (!rawSchema || typeof rawSchema !== 'object') return fallback;
    const s = rawSchema as Record<string, unknown>;
    const props = s.properties as Record<string, unknown> | undefined;
    if (!props) return fallback;

    // If schema has `input` wrapper, hoist its properties to the top level
    // and drop the `session_id` field (auto-injected server-side).
    const inputSchema = props.input as Record<string, unknown> | undefined;
    if (inputSchema && typeof inputSchema === 'object') {
      const innerProps = (inputSchema.properties as Record<string, unknown>) ?? {};
      const innerRequired = (inputSchema.required as string[]) ?? [];
      return {
        type: 'object' as const,
        properties: innerProps,
        required: innerRequired,
        additionalProperties: false,
      } as AnthropicTool['input_schema'];
    }

    // No `input` wrapper — just strip `session_id` if present and pass through.
    const cleanedProps = { ...props };
    delete cleanedProps.session_id;
    const cleanedRequired = ((s.required as string[]) ?? []).filter(r => r !== 'session_id');
    return {
      type: 'object' as const,
      properties: cleanedProps,
      required: cleanedRequired,
      additionalProperties: false,
    } as AnthropicTool['input_schema'];
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    const start = Date.now();
    mcpEventBus.emitToolStart(this.config.taskId, name, args);

    // Identify which site this tool belongs to (e.g. "bigbasket.search" → "bigbasket"),
    // open a session for that site if one isn't already open, and inject its session_id.
    // This is what enables cross-store flows: each tool call routes to (or lazily
    // opens) its own per-site session.
    const site = this.siteForTool(name);
    let sessionForCall: SessionSnapshot | null = null;
    if (site) {
      try {
        sessionForCall = await this.openSessionForSite(site);
      } catch (err) {
        const duration = Date.now() - start;
        mcpEventBus.emitToolError(this.config.taskId, name, duration, err);
        throw err;
      }
    } else {
      // Tools without a site prefix (e.g. pageInfo) — fall back to any active
      // session, otherwise the runner will reject without a session_id.
      sessionForCall = this.sessions.values().next().value ?? null;
    }

    // Re-envelope flat LLM args back into the runner's expected shape.
    const wrappedArgs: Record<string, unknown> = {};
    if (sessionForCall) {
      wrappedArgs.session_id = sessionForCall.session_id;
    }
    // Pull session_id out of args if the LLM somehow set it (we ignore it
    // and use the routed session instead). Everything else goes under `input`.
    const { session_id: _ignoredSessionId, input: existingInput, ...rest } = args;
    if (existingInput && typeof existingInput === 'object' && !Array.isArray(existingInput)) {
      wrappedArgs.input = { ...(existingInput as object), ...rest };
    } else if (Object.keys(rest).length > 0) {
      wrappedArgs.input = rest;
    }

    let result: MCPCallResult;
    try {
      result = await this.config.client.callTool(name, wrappedArgs, {
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

  /** Map a tool name to the site it operates on. Tool names follow
   *  `<site>.<verb>` (e.g. "bigbasket.search" → "bigbasket"). For tools
   *  without a site prefix (e.g. "pageInfo"), returns null. */
  private siteForTool(toolName: string): string | null {
    const dot = toolName.indexOf('.');
    if (dot < 0) return null;
    const prefix = toolName.slice(0, dot);
    // Skip lifecycle tools (session.*) — they shouldn't reach callTool anyway.
    if (prefix === 'session') return null;
    return prefix;
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
