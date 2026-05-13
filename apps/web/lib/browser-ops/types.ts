/**
 * Browser Operations Service — types
 *
 * The cloud agent talks to the external Browser Operations Service
 * (today: `playwrightRunner/` on the laptop) over MCP Streamable HTTP.
 *
 * The service exposes typed atomic ops per site (bigbasket.search,
 * bigbasket.add_to_cart, ...) plus session lifecycle ops (session.open,
 * session.snapshot, session.close).
 *
 * See docs/BROWSER-SERVICE-CONTRACT.md for the full contract.
 */

/** ULID-shaped session id. */
export type SessionId = string;

/** Opaque cart-namespace tag for per-session cart isolation (§2.2). */
export type CartNamespace = string;

/** Identifier of an operator (concierge) account in the runner. */
export type OperatorId = string;

/** Site id supported by the runner (matches the prefix in <site>.<op> tool names). */
export type SiteId = 'bigbasket' | (string & {});

/** Session metadata returned by session.open / session.snapshot. */
export interface SessionSnapshot {
  session_id: SessionId;
  status: 'ready' | 'running' | 'paused' | 'idle' | 'closed' | 'failed';
  warm?: boolean;
  site: SiteId;
  cart_namespace?: CartNamespace;
  logged_in_as?: {
    operator_id?: OperatorId;
    operator_label?: string;
    masked_email?: string;
    verified_signed_in?: boolean | null;
  };
  current_address?: unknown;
  opened_at?: string;
  expires_at?: string;
  ops_count?: number;
}

/** Op result envelope per spec §22.5. */
export interface OpResult<T = unknown> {
  ok: true;
  output: T;
  telemetry?: {
    duration_ms?: number;
    cost_inr_paise?: number;
    op_version?: number;
    idempotent_replay?: boolean;
  };
}

/** Op error envelope per spec §22.6 + RFC 7807. */
export interface OpError {
  ok: false;
  error: {
    type?: string;
    title?: string;
    status?: number;
    code: string;
    detail?: string;
    session_id?: string;
    call_id?: string;
    request_id?: string;
    recoverable?: boolean;
    retry_hint?: { suggest_op?: string; with?: Record<string, unknown>; suggest?: string };
    user_message?: string;
  };
}

export type OpOutcome<T = unknown> = OpResult<T> | OpError;

/** Inputs to session.open. */
export interface OpenSessionInput {
  site: SiteId;
  user_ref?: string;
  operator_id?: OperatorId;
  region?: string;
  device?: 'desktop' | 'mobile';
  force_fresh?: boolean;
  options?: {
    record_video?: boolean;
    return_screenshots_on_error?: boolean;
    headless?: boolean;
    user_agent_tag?: string;
  };
  limits?: {
    max_lifetime_s?: number;
    idle_timeout_s?: number;
    max_ops?: number;
  };
}

/** Cloud-side context attached to every tool call as `_meta.shoffer.*`. */
export interface ShofferMeta {
  idempotency_key?: string;
  task_id?: string;
  user_ref?: string;
  cart_namespace?: CartNamespace;
}

/** A single tool advertised by the runner via tools/list. */
export interface BrowserOpTool {
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
  annotations?: {
    readOnlyHint?: boolean;
    idempotentHint?: boolean;
    destructiveHint?: boolean;
    openWorldHint?: boolean;
  };
}
