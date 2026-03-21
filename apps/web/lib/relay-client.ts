import WebSocket from 'ws';
import { randomUUID } from 'crypto';
import {
  logger,
  BrowserError,
  type MCPToolInfo,
  type RelayMessage,
  type TaskRelayMessage,
  type ToolCallRequest,
  type ToolListRequest,
  type SessionEndRequest,
  isToolCallResponse,
  isToolListResponse,
  isHeartbeatPong,
  isTaskMessage,
} from '@shofferai/shared';
import { track } from './telemetry';

interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
  timeoutId: ReturnType<typeof setTimeout>;
}

export interface RelayClientOptions {
  authToken?: string;
  toolCallTimeoutMs?: number;
  heartbeatIntervalMs?: number;
  reconnect?: boolean;
  maxReconnectDelayMs?: number;
}

export class RelayClient {
  private ws: WebSocket | null = null;
  private url: string = '';
  private pending = new Map<string, PendingRequest>();
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectDelay = 1000;
  private connected = false;
  private shouldReconnect = true;
  private lastPongAt = Date.now();
  private options: Required<RelayClientOptions>;
  private taskEventHandlers: Map<string, (msg: TaskRelayMessage) => void> = new Map();
  private pendingCancels: Set<string> = new Set();

  constructor(options: RelayClientOptions = {}) {
    this.options = {
      authToken: options.authToken || process.env.RELAY_AUTH_TOKEN || '',
      toolCallTimeoutMs: options.toolCallTimeoutMs || 60000,
      heartbeatIntervalMs: options.heartbeatIntervalMs || 15000,
      reconnect: options.reconnect !== false,
      maxReconnectDelayMs: options.maxReconnectDelayMs || 30000,
    };
  }

  async connect(url: string): Promise<void> {
    this.url = url;
    this.shouldReconnect = true;
    return this.doConnect();
  }

  private doConnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const connectUrl = this.options.authToken
        ? `${this.url}?token=${encodeURIComponent(this.options.authToken)}`
        : this.url;

      this.ws = new WebSocket(connectUrl, {
        headers: this.options.authToken
          ? { 'x-relay-token': this.options.authToken }
          : undefined,
      });

      this.ws.on('open', () => {
        this.connected = true;
        this.reconnectDelay = 1000;
        logger.info('Relay client connected', { url: this.url });
        track({ event: 'relay_connected', category: 'relay', metadata: { url: this.url } });
        this.startHeartbeat();

        // Flush any cancel messages queued while disconnected
        if (this.pendingCancels.size > 0) {
          const taskIds = [...this.pendingCancels];
          this.pendingCancels.clear();
          logger.info('RelayClient: flushing pending cancels on reconnect', { count: taskIds.length });
          for (const taskId of taskIds) {
            try {
              this.ws!.send(JSON.stringify({
                id: randomUUID(),
                type: 'task_cancel',
                taskId,
                reason: 'user_cancelled',
              }));
            } catch (e) {
              logger.warn('RelayClient: failed to flush cancel', { taskId });
            }
          }
        }

        resolve();
      });

      this.ws.on('message', (data: Buffer) => {
        try {
          const msg: RelayMessage = JSON.parse(data.toString());
          this.handleMessage(msg);
        } catch (error) {
          logger.error('Failed to parse relay message', {
            error: error instanceof Error ? error.message : 'Unknown',
          });
        }
      });

      this.ws.on('close', () => {
        this.connected = false;
        this.stopHeartbeat();
        this.rejectAllPending('Relay connection closed');
        logger.info('Relay client disconnected');
        track({ event: 'relay_disconnected', category: 'relay' });

        if (this.shouldReconnect && this.options.reconnect) {
          this.scheduleReconnect();
        }
      });

      this.ws.on('error', (error) => {
        if (!this.connected) {
          reject(new BrowserError(`Relay connection failed: ${error.message}`));
        }
        logger.error('Relay client error', { error: error.message });
        track({ event: 'relay_error', category: 'relay', success: false, metadata: { error: error.message } });
      });
    });
  }

  private handleMessage(msg: RelayMessage): void {
    if (isHeartbeatPong(msg)) {
      this.lastPongAt = Date.now();
      return;
    }

    // Route task-level messages to the task event handlers
    if (isTaskMessage(msg)) {
      if (this.taskEventHandlers.size > 0) {
        for (const handler of this.taskEventHandlers.values()) {
          handler(msg as TaskRelayMessage);
        }
      } else {
        logger.warn('RelayClient: received task message but no handler set', { type: msg.type });
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

  private sendRequest(msg: ToolCallRequest | ToolListRequest): Promise<unknown> {
    if (!this.ws || !this.connected) {
      return Promise.reject(new BrowserError('Relay not connected'));
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.pending.delete(msg.id);
        reject(new BrowserError(`Relay request timed out after ${this.options.toolCallTimeoutMs}ms`));
      }, this.options.toolCallTimeoutMs);

      this.pending.set(msg.id, { resolve, reject, timeoutId });
      this.ws!.send(JSON.stringify(msg));
    });
  }

  async callTool(name: string, args: Record<string, unknown>, sessionId?: string): Promise<unknown> {
    const request: ToolCallRequest = {
      id: randomUUID(),
      type: 'tool_call',
      name,
      args,
      sessionId,
    };
    const start = Date.now();
    try {
      const result = await this.sendRequest(request);
      track({ event: 'relay_tool_call', category: 'relay', durationMs: Date.now() - start, metadata: { tool: name, sessionId } });
      return result;
    } catch (error) {
      track({ event: 'relay_tool_call', category: 'relay', durationMs: Date.now() - start, success: false, metadata: { tool: name, sessionId, error: error instanceof Error ? error.message : 'unknown' } });
      throw error;
    }
  }

  async releaseSession(sessionId: string): Promise<void> {
    if (!this.ws || !this.connected) return; // Best effort
    const request: SessionEndRequest = {
      id: randomUUID(),
      type: 'session_end',
      sessionId,
    };
    // Fire and forget — don't wait for ack
    this.ws.send(JSON.stringify(request));
    logger.debug('Sent session_end', { sessionId });
  }

  /** Send a task-level message to the laptop */
  sendTaskMessage(msg: TaskRelayMessage): void {
    if (!this.ws || !this.connected) {
      // Queue cancel messages for delivery when relay reconnects
      if (msg.type === 'task_cancel' && 'taskId' in msg) {
        this.pendingCancels.add((msg as { taskId: string }).taskId);
        logger.info('RelayClient: queued cancel for offline delivery', { taskId: (msg as { taskId: string }).taskId });
        return;
      }
      throw new BrowserError('RelayClient: not connected');
    }
    this.ws.send(JSON.stringify(msg));
  }

  /** Register a handler for incoming task events from the laptop */
  onTaskEvent(handler: (msg: TaskRelayMessage) => void, taskId?: string): void {
    const key = taskId || '__default';
    this.taskEventHandlers.set(key, handler);
  }

  /** Remove a task event handler */
  removeTaskEventHandler(taskId?: string): void {
    const key = taskId || '__default';
    this.taskEventHandlers.delete(key);
  }

  async listTools(): Promise<MCPToolInfo[]> {
    const request: ToolListRequest = {
      id: randomUUID(),
      type: 'tool_list',
    };
    return this.sendRequest(request) as Promise<MCPToolInfo[]>;
  }

  isConnected(): boolean {
    return this.connected;
  }

  async disconnect(): Promise<void> {
    this.shouldReconnect = false;
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.rejectAllPending('Relay client disconnecting');
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
    logger.info('Relay client disconnected (manual)');
  }

  private startHeartbeat(): void {
    this.lastPongAt = Date.now();
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.connected) {
        if (Date.now() - this.lastPongAt > 45000) {
          logger.warn('Relay client: no heartbeat pong for 45s, closing dead connection');
          this.ws.close();
          return;
        }
        this.ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      }
    }, this.options.heartbeatIntervalMs);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private scheduleReconnect(): void {
    logger.info(`Relay reconnecting in ${this.reconnectDelay}ms...`);
    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.doConnect();
      } catch {
        this.reconnectDelay = Math.min(
          this.reconnectDelay * 2,
          this.options.maxReconnectDelayMs,
        );
        if (this.shouldReconnect) {
          this.scheduleReconnect();
        }
      }
    }, this.reconnectDelay);
  }

  private rejectAllPending(reason: string): void {
    for (const [id, pending] of this.pending) {
      clearTimeout(pending.timeoutId);
      pending.reject(new BrowserError(reason));
    }
    this.pending.clear();
  }
}
