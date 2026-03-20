import WebSocket from 'ws';
import {
  logger,
  type RelayMessage,
  type TaskRelayMessage,
  type ToolCallResponse,
  type ToolListResponse,
  type SessionEndResponse,
  isToolCallRequest,
  isToolListRequest,
  isSessionEndRequest,
  isHeartbeatPing,
  isTaskHandoff,
  isTaskInputResponse,
  isTaskPaymentResponse,
  isTaskCancel,
  isTaskMessage,
} from '@shofferai/shared';
import type { ChromePool } from './chrome-pool';
import type { TaskManager } from './task-manager';

export interface RelayOutboundOptions {
  authToken?: string;
  maxReconnectDelayMs?: number;
}

/**
 * Laptop connects OUT to Cloud Run WebSocket endpoint.
 *
 * Flow:
 *   Laptop → WSS → Cloud Run /api/relay/ws
 *   Cloud Run sends tool_call/tool_list/session_end → Laptop executes → sends result back
 */
export class RelayOutbound {
  private ws: WebSocket | null = null;
  private chromePool: ChromePool;
  private taskManager: TaskManager | null = null;
  private cloudUrl: string;
  private authToken: string;
  private shouldReconnect = true;
  private reconnectDelay = 1000;
  private maxReconnectDelay: number;
  private healthCheckInterval: ReturnType<typeof setInterval> | null = null;
  private lastDataAt = Date.now();

  /** Ping every 20s to keep connection alive and detect dead sockets */
  private static readonly HEALTH_CHECK_INTERVAL_MS = 20000;
  /** If no data received for 45s, consider the connection dead */
  private static readonly DEAD_CONNECTION_TIMEOUT_MS = 45000;

  constructor(chromePool: ChromePool, cloudUrl: string, options: RelayOutboundOptions = {}) {
    this.chromePool = chromePool;
    this.cloudUrl = cloudUrl;
    this.authToken = options.authToken || process.env.RELAY_AUTH_TOKEN || '';
    this.maxReconnectDelay = options.maxReconnectDelayMs || 30000;
  }

  /** Attach a TaskManager for Copilot CLI task routing */
  setTaskManager(taskManager: TaskManager): void {
    this.taskManager = taskManager;
    // Wire TaskManager's outgoing messages through this relay
    taskManager.setRelaySend((msg: TaskRelayMessage) => {
      this.send(msg);
    });
  }

  async connect(): Promise<void> {
    this.shouldReconnect = true;
    return this.doConnect();
  }

  private doConnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = this.authToken
        ? `${this.cloudUrl}?token=${encodeURIComponent(this.authToken)}`
        : this.cloudUrl;

      this.ws = new WebSocket(url, {
        headers: this.authToken ? { 'x-relay-token': this.authToken } : undefined,
      });

      let resolved = false;

      this.ws.on('open', () => {
        this.reconnectDelay = 1000;
        this.lastDataAt = Date.now();
        logger.info('Connected to Cloud Run relay', { url: this.cloudUrl });
        this.startHealthCheck();
        resolved = true;
        resolve();
      });

      this.ws.on('message', async (data: Buffer) => {
        this.lastDataAt = Date.now();
        try {
          const msg: RelayMessage = JSON.parse(data.toString());
          await this.handleMessage(msg);
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : 'Unknown';
          logger.error('Failed to handle relay message', { error: errMsg });
        }
      });

      // Native WebSocket pong frames (response to our ws.ping()) also count as activity
      this.ws.on('pong', () => {
        this.lastDataAt = Date.now();
      });

      this.ws.on('close', () => {
        logger.info('Disconnected from Cloud Run relay');
        this.stopHealthCheck();
        if (this.shouldReconnect) {
          this.scheduleReconnect();
        }
      });

      this.ws.on('error', (error) => {
        if (!resolved) {
          resolved = true;
          reject(new Error(`Relay connection failed: ${error.message}`));
        }
        logger.error('Relay outbound error', { error: error.message });
      });
    });
  }

  private async handleMessage(msg: RelayMessage): Promise<void> {
    if (isHeartbeatPing(msg)) {
      this.ws?.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
      return;
    }

    // ─── Task-level messages → TaskManager ──────────────────────
    if (isTaskMessage(msg)) {
      if (!this.taskManager) {
        logger.warn('Received task message but no TaskManager attached', { type: msg.type });
        return;
      }

      if (isTaskHandoff(msg)) {
        await this.taskManager.handleTaskHandoff(msg);
      } else if (isTaskInputResponse(msg)) {
        this.taskManager.handleInputResponse(msg.taskId, msg.stepId, msg.value);
      } else if (isTaskPaymentResponse(msg)) {
        this.taskManager.handlePaymentResponse(msg.taskId, msg.stepId, msg.confirmed, msg.paymentId);
      } else if (isTaskCancel(msg)) {
        this.taskManager.cancelTask(msg.taskId, msg.reason);
      }
      return;
    }

    // ─── Legacy MCP tool relay → ChromePool ─────────────────────

    if (isToolListRequest(msg)) {
      const tools = await this.chromePool.getTools();
      const response: ToolListResponse = {
        id: msg.id,
        type: 'tool_list_result',
        tools: tools.map((t) => ({
          name: t.name,
          description: t.description,
          inputSchema: t.inputSchema,
        })),
      };
      this.ws?.send(JSON.stringify(response));
      return;
    }

    if (isSessionEndRequest(msg)) {
      try {
        await this.chromePool.releaseSlot(msg.sessionId);
        const response: SessionEndResponse = {
          id: msg.id,
          type: 'session_end_ack',
        };
        this.ws?.send(JSON.stringify(response));
      } catch (error) {
        logger.error('Failed to release session', {
          sessionId: msg.sessionId,
          error: String(error),
        });
      }
      return;
    }

    if (isToolCallRequest(msg)) {
      try {
        const poolStatus = this.chromePool.getStatus();
        logger.debug(`Executing tool: ${msg.name}`, {
          id: msg.id,
          sessionId: msg.sessionId,
          pool: `${poolStatus.busy}/${poolStatus.maxSlots} busy, ${poolStatus.queueLength} queued`,
        });

        const result = await this.chromePool.callTool(msg.sessionId, msg.name, msg.args);

        const response: ToolCallResponse = {
          id: msg.id,
          type: 'tool_result',
          result,
        };
        this.ws?.send(JSON.stringify(response));
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Tool call failed: ${msg.name}`, { id: msg.id, error: errMsg });
        const response: ToolCallResponse = {
          id: msg.id,
          type: 'tool_result',
          result: null,
          error: errMsg,
        };
        this.ws?.send(JSON.stringify(response));
      }
      return;
    }
  }

  private scheduleReconnect(): void {
    logger.info(`Reconnecting to Cloud Run in ${this.reconnectDelay}ms...`);
    setTimeout(async () => {
      try {
        await this.doConnect();
      } catch {
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
        if (this.shouldReconnect) {
          this.scheduleReconnect();
        }
      }
    }, this.reconnectDelay);
  }

  /** Send a message to Cloud Run via relay */
  send(msg: RelayMessage | TaskRelayMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    } else {
      logger.warn('RelayOutbound: cannot send, WebSocket not open', { type: (msg as { type: string }).type });
    }
  }

  async disconnect(): Promise<void> {
    this.shouldReconnect = false;
    this.stopHealthCheck();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    logger.info('Relay outbound disconnected');
  }

  /**
   * Periodically send native WS pings and check for dead connections.
   * This detects silent TCP drops (e.g., Cloud Run instance restarts)
   * faster than waiting for the OS TCP timeout.
   */
  private startHealthCheck(): void {
    this.stopHealthCheck();
    this.lastDataAt = Date.now();
    this.healthCheckInterval = setInterval(() => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

      const silentMs = Date.now() - this.lastDataAt;
      if (silentMs > RelayOutbound.DEAD_CONNECTION_TIMEOUT_MS) {
        logger.warn('RelayOutbound: no data for 45s, closing dead connection', {
          silentMs,
        });
        this.ws.terminate(); // Hard close — faster than ws.close() which waits for handshake
        return;
      }

      // Send native WS ping frame — the 'pong' listener updates lastDataAt
      this.ws.ping((err: Error | undefined) => {
        if (err) {
          logger.warn('RelayOutbound: ping failed, connection likely dead', {
            error: err.message,
          });
          this.ws?.terminate();
        }
      });
    }, RelayOutbound.HEALTH_CHECK_INTERVAL_MS);
  }

  private stopHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }
}
