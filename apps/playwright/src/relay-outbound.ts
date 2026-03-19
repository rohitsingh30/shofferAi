import WebSocket from 'ws';
import {
  logger,
  type RelayMessage,
  type ToolCallResponse,
  type ToolListResponse,
  type SessionEndResponse,
  isToolCallRequest,
  isToolListRequest,
  isSessionEndRequest,
  isHeartbeatPing,
} from '@shofferai/shared';
import type { ChromePool } from './chrome-pool';

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
  private cloudUrl: string;
  private authToken: string;
  private shouldReconnect = true;
  private reconnectDelay = 1000;
  private maxReconnectDelay: number;

  constructor(chromePool: ChromePool, cloudUrl: string, options: RelayOutboundOptions = {}) {
    this.chromePool = chromePool;
    this.cloudUrl = cloudUrl;
    this.authToken = options.authToken || process.env.RELAY_AUTH_TOKEN || '';
    this.maxReconnectDelay = options.maxReconnectDelayMs || 30000;
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
        logger.info('Connected to Cloud Run relay', { url: this.cloudUrl });
        resolved = true;
        resolve();
      });

      this.ws.on('message', async (data: Buffer) => {
        try {
          const msg: RelayMessage = JSON.parse(data.toString());
          await this.handleMessage(msg);
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : 'Unknown';
          logger.error('Failed to handle relay message', { error: errMsg });
        }
      });

      this.ws.on('close', () => {
        logger.info('Disconnected from Cloud Run relay');
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

    if (isToolListRequest(msg)) {
      const tools = this.chromePool.getTools();
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

  async disconnect(): Promise<void> {
    this.shouldReconnect = false;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    logger.info('Relay outbound disconnected');
  }
}
