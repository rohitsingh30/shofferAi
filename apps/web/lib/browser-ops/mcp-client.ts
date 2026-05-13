/**
 * Thin wrapper around `@modelcontextprotocol/sdk` Streamable HTTP transport.
 *
 * Talks to the Browser Operations Service (today: `playwrightRunner/` on
 * the laptop, tomorrow: an external vendor or hosted runner).
 *
 * Configured via env:
 *   - BROWSER_OPS_MCP_URL   default http://127.0.0.1:8787/mcp
 *   - BROWSER_OPS_TOKEN     bearer token (RUNNER_TOKEN on the runner side)
 *
 * Surface:
 *   - listTools()  — cached tools/list with TTL
 *   - callTool()   — one tools/call invocation, with _meta.shoffer.* injected
 *   - close()
 *
 * NOT responsible for session bookkeeping or sessionId injection — that lives
 * in browser-ops-host.ts. This file is just the wire layer.
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type { BrowserOpTool, ShofferMeta } from './types';

const CATALOGUE_TTL_MS = 5 * 60 * 1000; // 5 min, per spec §22.11

export interface CallToolOptions {
  meta?: ShofferMeta;
  /** Per-call timeout in ms. Defaults to 60s. */
  timeoutMs?: number;
}

export interface MCPCallResult {
  isError: boolean;
  /** Structured output per the tool's outputSchema (when isError=false), OR an RFC 7807 problem (when isError=true). */
  structuredContent?: unknown;
  /** Plain-text summary line. */
  text?: string;
  /** Service-side _meta passed back (idempotent_replay, duration_ms, cost_inr_paise, ...). */
  meta?: Record<string, unknown>;
}

export class BrowserOpsMcpClient {
  private client: Client | null = null;
  private connecting: Promise<void> | null = null;
  private cachedTools: { tools: BrowserOpTool[]; loadedAt: number } | null = null;

  constructor(
    private readonly url: string,
    private readonly token: string | undefined,
  ) {}

  isConnected(): boolean {
    return this.client !== null;
  }

  async connect(): Promise<void> {
    if (this.client) return;
    if (this.connecting) return this.connecting;

    this.connecting = (async () => {
      const headers: Record<string, string> = {};
      if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

      const transport = new StreamableHTTPClientTransport(new URL(this.url), {
        requestInit: { headers },
      });

      const client = new Client(
        { name: 'shofferai-cloud', version: '1.0.0' },
        { capabilities: {} },
      );

      await client.connect(transport);
      this.client = client;
    })();

    try {
      await this.connecting;
    } finally {
      this.connecting = null;
    }
  }

  async listTools(opts: { force?: boolean } = {}): Promise<BrowserOpTool[]> {
    if (
      !opts.force &&
      this.cachedTools &&
      Date.now() - this.cachedTools.loadedAt < CATALOGUE_TTL_MS
    ) {
      return this.cachedTools.tools;
    }
    await this.connect();
    const res = await this.client!.listTools();
    const tools: BrowserOpTool[] = (res.tools || []).map(t => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema as Record<string, unknown> | undefined,
      outputSchema: (t as { outputSchema?: Record<string, unknown> }).outputSchema,
      annotations: t.annotations as BrowserOpTool['annotations'],
    }));
    this.cachedTools = { tools, loadedAt: Date.now() };
    return tools;
  }

  invalidateCatalogue(): void {
    this.cachedTools = null;
  }

  async callTool(
    name: string,
    args: Record<string, unknown>,
    opts: CallToolOptions = {},
  ): Promise<MCPCallResult> {
    await this.connect();
    const meta: Record<string, unknown> = {};
    if (opts.meta?.idempotency_key) meta['shoffer.idempotency_key'] = opts.meta.idempotency_key;
    if (opts.meta?.task_id)         meta['shoffer.task_id']         = opts.meta.task_id;
    if (opts.meta?.user_ref)        meta['shoffer.user_ref']        = opts.meta.user_ref;
    if (opts.meta?.cart_namespace)  meta['shoffer.cart_namespace']  = opts.meta.cart_namespace;

    const params: Parameters<Client['callTool']>[0] = {
      name,
      arguments: args,
    };
    if (Object.keys(meta).length > 0) {
      (params as { _meta?: Record<string, unknown> })._meta = meta;
    }

    const result = await this.client!.callTool(
      params,
      undefined,
      opts.timeoutMs ? { timeout: opts.timeoutMs } : undefined,
    );

    // Extract first text content for the human-readable summary.
    let text: string | undefined;
    const content = (result as { content?: Array<{ type: string; text?: string }> }).content;
    if (Array.isArray(content)) {
      const first = content.find(c => c.type === 'text');
      text = first?.text;
    }

    return {
      isError: Boolean(result.isError),
      structuredContent: (result as { structuredContent?: unknown }).structuredContent,
      text,
      meta: (result as { _meta?: Record<string, unknown> })._meta,
    };
  }

  async close(): Promise<void> {
    if (this.client) {
      try { await this.client.close(); } catch { /* best-effort */ }
      this.client = null;
    }
  }
}
