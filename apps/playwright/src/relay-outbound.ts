import WebSocket from 'ws';
import {
  logger,
  type RelayMessage,
  type TaskRelayMessage,
  type RelayStatusMessage,
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
  private reconnectScheduled = false;
  private reconnectDelay = 1000;
  private maxReconnectDelay: number;
  private healthCheckInterval: ReturnType<typeof setInterval> | null = null;
  private statusInterval: ReturnType<typeof setInterval> | null = null;
  private lastDataAt = Date.now();
  /** Last time we received an APPLICATION-LEVEL message (not just WS pong).
   *  Cloud Run's load balancer responds to WS pings even when the backend
   *  instance is dead, so WS pongs alone can't detect stale connections. */
  private lastAppMessageAt = Date.now();

  /** Ping every 10s to keep connection alive and detect dead sockets */
  private static readonly HEALTH_CHECK_INTERVAL_MS = 10_000;
  /** If no data received for 20s, consider the connection dead (must be < Cloud Run's connect wait) */
  private static readonly DEAD_CONNECTION_TIMEOUT_MS = 20_000;
  /** If no application-level message for 45s, backend is dead.
   *  Server sends heartbeat pings every 15s, so 3 missed = dead. */
  private static readonly STALE_CONNECTION_TIMEOUT_MS = 25_000;

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
    this.reconnectScheduled = false;
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
        this.lastAppMessageAt = Date.now();
        logger.info('Connected to Cloud Run relay', {
          url: this.cloudUrl,
          reconnectDelay: this.reconnectDelay,
          hadPreviousConnection: !!this.healthCheckInterval,
        });

        // Verify the connection reaches the actual backend (not just the LB).
        // Send an app-level ping and expect an app-level message back within 10s.
        // Cloud Run's load balancer can hold phantom WS connections that never
        // reach the container after a deploy.
        const verifyTimeout = setTimeout(() => {
          // If lastAppMessageAt hasn't been updated since open, no real server behind this WS
          if (Date.now() - this.lastAppMessageAt >= 9000) {
            logger.warn('RelayOutbound: no app-level response within 10s of connect — phantom connection, terminating');
            this.ws?.terminate();
          }
        }, 10_000);

        // Send status so server has something to respond to (heartbeat ping from server comes every 15s)
        this.sendStatus();

        // Clean up verify timer if we get a real message (handled by the message listener)
        const origLastApp = this.lastAppMessageAt;
        const earlyCheck = setInterval(() => {
          if (this.lastAppMessageAt > origLastApp) {
            clearTimeout(verifyTimeout);
            clearInterval(earlyCheck);
          }
        }, 1000);
        // Also clear on timeout fire
        setTimeout(() => clearInterval(earlyCheck), 11_000);

        this.startHealthCheck();
        this.startStatusBroadcast();
        resolved = true;
        resolve();
      });

      this.ws.on('message', async (data: Buffer) => {
        this.lastDataAt = Date.now();
        this.lastAppMessageAt = Date.now(); // Application-level message from real backend
        try {
          const msg: RelayMessage = JSON.parse(data.toString());
          if (msg.type !== 'ping') {
            logger.info('RelayOutbound: received message', { type: msg.type, taskId: (msg as { taskId?: string }).taskId });
          }
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

      this.ws.on('close', (code: number, reason: Buffer) => {
        const uptimeMs = Date.now() - this.lastDataAt;
        logger.warn('Disconnected from Cloud Run relay', {
          code, reason: reason?.toString() || '', shouldReconnect: this.shouldReconnect,
          reconnectScheduled: this.reconnectScheduled,
          uptimeMs,
          lastDataAgoMs: Date.now() - this.lastDataAt,
          lastAppMessageAgoMs: Date.now() - this.lastAppMessageAt,
        });
        this.stopHealthCheck();
        this.stopStatusBroadcast();
        // Server sent 1001 ("Going Away") — deploy or intentional shutdown.
        // Force reconnect regardless of shouldReconnect (deploy ≠ local disconnect).
        if (code === 1001) {
          this.reconnectDelay = 1000;
          this.shouldReconnect = true;
        }
        // Server sent 1011 ("Internal Error") or earlySocket timeout —
        // the bridge wasn't ready. Reset backoff so we retry quickly
        // instead of spiraling into 30s delays.
        if (code === 1011) {
          this.reconnectDelay = 1000;
          this.shouldReconnect = true;
        }
        // Only schedule reconnect if one isn't already pending (prevents
        // exponential chain duplication when doConnect() fails — both the
        // 'close' handler and the catch block would call scheduleReconnect).
        if (this.shouldReconnect && !this.reconnectScheduled) {
          logger.info('Scheduling reconnect to Cloud Run relay', { delay: this.reconnectDelay });
          this.scheduleReconnect();
        } else if (!this.shouldReconnect) {
          logger.info('Not reconnecting (shouldReconnect=false, local disconnect)');
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
    if (this.reconnectScheduled) {
      logger.debug('Reconnect already scheduled, skipping duplicate');
      return;
    }
    this.reconnectScheduled = true;
    logger.info(`Reconnecting to Cloud Run in ${this.reconnectDelay}ms...`);
    setTimeout(async () => {
      this.reconnectScheduled = false;
      try {
        await this.doConnect();
        logger.info('Reconnected to Cloud Run relay successfully');
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        logger.warn('Reconnect attempt failed', { error: errMsg, nextDelay: Math.min(this.reconnectDelay * 2, this.maxReconnectDelay) });
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
      logger.warn('RelayOutbound: cannot send, WebSocket not open', {
        type: (msg as { type: string }).type,
        readyState: this.ws?.readyState,
        taskId: (msg as { taskId?: string }).taskId,
        wsExists: !!this.ws,
      });
    }
  }

  async disconnect(): Promise<void> {
    this.shouldReconnect = false;
    this.reconnectScheduled = false;
    this.stopHealthCheck();
    this.stopStatusBroadcast();
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
    this.lastAppMessageAt = Date.now();
    this.healthCheckInterval = setInterval(() => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

      const silentMs = Date.now() - this.lastDataAt;
      const staleMs = Date.now() - this.lastAppMessageAt;
      if (silentMs > RelayOutbound.DEAD_CONNECTION_TIMEOUT_MS) {
        logger.warn('RelayOutbound: no data for 20s, closing dead connection', {
          silentMs,
          staleMs,
          wsReadyState: this.ws.readyState,
        });
        this.ws.terminate(); // Hard close — faster than ws.close() which waits for handshake
        return;
      }

      // Stale connection detection: Cloud Run's load balancer responds to WS
      // pings even when the backend instance is dead (e.g., after deploy).
      // Only application-level messages prove the backend is alive.
      const staleSinceMs = Date.now() - this.lastAppMessageAt;
      if (staleSinceMs > RelayOutbound.STALE_CONNECTION_TIMEOUT_MS) {
        logger.warn('RelayOutbound: no app-level message for 25s — backend likely dead after deploy, reconnecting', {
          staleSinceMs,
          lastDataAgoMs: Date.now() - this.lastDataAt,
          wsReadyState: this.ws.readyState,
        });
        this.ws.terminate();
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

  /** Broadcast relay status every 10s so Cloud Run knows what's running */
  private startStatusBroadcast(): void {
    this.stopStatusBroadcast();
    this.sendStatus();
    this.statusInterval = setInterval(() => this.sendStatus(), 10_000);
  }

  private stopStatusBroadcast(): void {
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
      this.statusInterval = null;
    }
  }

  private sendStatus(): void {
    if (!this.taskManager) return;
    const { tasks } = this.taskManager.getDetailedStatus();
    const chromePool = this.chromePool.getStatus();
    const msg: RelayStatusMessage = {
      type: 'relay_status',
      timestamp: new Date().toISOString(),
      tasks,
      chromePool,
    };
    this.send(msg);
  }
}
