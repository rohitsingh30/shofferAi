import { randomUUID } from 'crypto';
import WebSocket from 'ws';
import {
  logger,
  BrowserError,
  type MCPTool,
  type AnthropicTool,
  type MCPHostLike,
  type MCPToolInfo,
  type RelayMessage,
  type TaskRelayMessage,
  type RelayStatusMessage,
  isToolCallResponse,
  isToolListResponse,
  isHeartbeatPong,
  isTaskMessage,
  isRelayStatus,
} from '@shofferai/shared';

interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
  timeoutId: ReturnType<typeof setTimeout>;
}

/**
 * Server-side relay bridge that accepts incoming WebSocket connections from the laptop.
 * Replaces the old pattern where Cloud Run connected OUT to the laptop via Cloudflare Tunnel.
 *
 * Now: Laptop connects IN to Cloud Run → no tunnel needed.
 */
export class RelayBridge implements MCPHostLike {
  private laptopSocket: WebSocket | null = null;
  private pending = new Map<string, PendingRequest>();
  private tools: MCPTool[] = [];
  private connected = false;
  private toolCallTimeoutMs = 60000;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private lastPongAt = Date.now();
  private taskEventHandler: ((msg: TaskRelayMessage) => void) | null = null;
  private latestStatus: RelayStatusMessage | null = null;

  /**
   * Called by the custom server when a laptop WebSocket connects.
   */
  setLaptopSocket(ws: WebSocket): void {
    // Close previous connection if any
    if (this.laptopSocket) {
      this.laptopSocket.close();
    }

    this.laptopSocket = ws;
    this.connected = true;

    ws.on('message', (data: Buffer) => {
      try {
        const msg: RelayMessage = JSON.parse(data.toString());
        this.handleMessage(msg);
      } catch (error) {
        logger.error('RelayBridge: failed to parse message', {
          error: error instanceof Error ? error.message : 'Unknown',
        });
      }
    });

    ws.on('close', () => {
      logger.info('RelayBridge: laptop disconnected — waiting 30s grace period before rejecting pending requests');
      this.laptopSocket = null;
      this.connected = false;
      this.stopHeartbeat();

      // Grace period: give the laptop 30s to reconnect before rejecting pending requests.
      // RelayOutbound on the laptop auto-reconnects with exponential backoff.
      setTimeout(() => {
        if (!this.connected) {
          logger.warn('RelayBridge: laptop did not reconnect within 30s grace period, rejecting pending requests', { pendingCount: this.pending.size });
          this.rejectAllPending('Laptop disconnected (grace period expired)');
        } else {
          logger.info('RelayBridge: laptop reconnected within grace period', { pendingCount: this.pending.size });
        }
      }, 30_000);
    });

    ws.on('error', (error) => {
      logger.error('RelayBridge: WebSocket error', { error: error.message });
    });

    this.startHeartbeat();

    // Fetch tool list from laptop
    this.fetchTools().catch((err) => {
      logger.error('RelayBridge: failed to fetch tools', {
        error: err instanceof Error ? err.message : 'Unknown',
      });
    });
  }

  private async fetchTools(): Promise<void> {
    const remoteTools = await this.listToolsRemote();
    this.tools = remoteTools.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
    }));
    logger.info(`RelayBridge: laptop connected, ${this.tools.length} tools available`);
  }

  private handleMessage(msg: RelayMessage): void {
    if (isHeartbeatPong(msg)) {
      this.lastPongAt = Date.now();
      return;
    }

    if (isRelayStatus(msg)) {
      this.latestStatus = msg;
      return;
    }

    // Route task-level messages (from laptop) to the task event handler
    if (isTaskMessage(msg)) {
      if (this.taskEventHandler) {
        this.taskEventHandler(msg as TaskRelayMessage);
      } else {
        logger.warn('RelayBridge: received task message but no handler set', { type: msg.type });
      }
      return;
    }

    if (isToolCallResponse(msg) || isToolListResponse(msg)) {
      const pending = this.pending.get(msg.id);
      if (pending) {
        clearTimeout(pending.timeoutId);
        this.pending.delete(msg.id);

        if (isToolCallResponse(msg) && msg.error) {
          pending.reject(new BrowserError(`Remote tool failed: ${msg.error}`));
        } else {
          const result = isToolCallResponse(msg) ? msg.result : msg.tools;
          pending.resolve(result);
        }
      }
    }
  }

  private sendRequest(msg: Record<string, unknown>): Promise<unknown> {
    if (!this.laptopSocket || !this.connected) {
      return Promise.reject(new BrowserError('Laptop not connected'));
    }

    const id = msg.id as string;

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.pending.delete(id);
        reject(new BrowserError(`Relay request timed out after ${this.toolCallTimeoutMs}ms`));
      }, this.toolCallTimeoutMs);

      this.pending.set(id, { resolve, reject, timeoutId });
      this.laptopSocket!.send(JSON.stringify(msg));
    });
  }

  private async listToolsRemote(): Promise<MCPToolInfo[]> {
    return this.sendRequest({
      id: randomUUID(),
      type: 'tool_list',
    }) as Promise<MCPToolInfo[]>;
  }

  // ─── MCPHostLike implementation ───────────────────────────────

  async connect(): Promise<void> {
    // In bridge mode, the laptop connects to us.
    // Wait for laptop to connect (up to 30s).
    if (this.connected && this.tools.length > 0) return;

    const start = Date.now();
    while ((!this.connected || this.tools.length === 0) && Date.now() - start < 30000) {
      await new Promise((r) => setTimeout(r, 500));
    }

    if (!this.connected) {
      throw new BrowserError('Laptop not connected to relay bridge (waited 30s)');
    }
  }

  getTools(): MCPTool[] {
    return this.tools;
  }

  getToolsAsAnthropicFormat(): AnthropicTool[] {
    return this.tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.inputSchema,
    }));
  }

  isMCPTool(toolName: string): boolean {
    return this.tools.some((t) => t.name === toolName);
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    return this.callToolWithSession(name, args);
  }

  async callToolWithSession(
    name: string,
    args: Record<string, unknown>,
    sessionId?: string,
  ): Promise<unknown> {
    if (!this.connected) {
      throw new BrowserError('RelayBridge: laptop not connected');
    }

    logger.debug(`RelayBridge calling tool: ${name}`, { toolArgs: args, sessionId });

    try {
      return await this.sendRequest({
        id: randomUUID(),
        type: 'tool_call',
        name,
        args,
        sessionId,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown relay error';
      throw new BrowserError(`Remote MCP tool ${name} failed: ${message}`, { tool: name, args });
    }
  }

  async releaseSession(sessionId: string): Promise<void> {
    if (!this.laptopSocket || !this.connected) return; // Best effort
    this.laptopSocket.send(JSON.stringify({
      id: randomUUID(),
      type: 'session_end',
      sessionId,
    }));
    logger.debug('RelayBridge sent session_end', { sessionId });
  }

  /** Send a task-level message to the laptop (task_handoff, task_input_response, etc.) */
  sendTaskMessage(msg: TaskRelayMessage): void {
    if (!this.laptopSocket || !this.connected) {
      throw new BrowserError('RelayBridge: laptop not connected');
    }
    this.laptopSocket.send(JSON.stringify(msg));
    logger.debug('RelayBridge sent task message', { type: msg.type, taskId: (msg as { taskId?: string }).taskId });
  }

  /** Register a handler for incoming task events from the laptop */
  onTaskEvent(handler: (msg: TaskRelayMessage) => void): void {
    this.taskEventHandler = handler;
  }

  /** Get the latest relay status snapshot (tasks + Chrome pool) */
  getRelayStatus(): RelayStatusMessage | null {
    return this.latestStatus;
  }

  async disconnect(): Promise<void> {
    this.stopHeartbeat();
    this.rejectAllPending('Bridge disconnecting');
    if (this.laptopSocket) {
      this.laptopSocket.close();
      this.laptopSocket = null;
    }
    this.connected = false;
    this.tools = [];
  }

  isConnected(): boolean {
    return this.connected;
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.lastPongAt = Date.now();
    this.heartbeatInterval = setInterval(() => {
      if (this.laptopSocket && this.connected) {
        // Check if laptop is still alive (no pong for 45s → consider dead)
        if (Date.now() - this.lastPongAt > 45000) {
          logger.warn('RelayBridge: no heartbeat pong for 45s, closing dead connection');
          this.laptopSocket.close();
          return;
        }
        this.laptopSocket.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      }
    }, 15000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private rejectAllPending(reason: string): void {
    for (const [, pending] of this.pending) {
      clearTimeout(pending.timeoutId);
      pending.reject(new BrowserError(reason));
    }
    this.pending.clear();
  }
}
