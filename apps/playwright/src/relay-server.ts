import { WebSocketServer, WebSocket } from 'ws';
import { createServer, IncomingMessage, ServerResponse } from 'http';
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

export interface RelayServerOptions {
  port: number;
  authToken?: string;
}

export class RelayServer {
  private wss: WebSocketServer | null = null;
  private chromePool: ChromePool;
  private options: RelayServerOptions;

  constructor(chromePool: ChromePool, options: Partial<RelayServerOptions> = {}) {
    this.chromePool = chromePool;
    this.options = {
      port: options.port || 8765,
      authToken: options.authToken || process.env.RELAY_AUTH_TOKEN,
    };
  }

  async start(): Promise<void> {
    // HTTP server handles health checks + WebSocket upgrade (required for Cloudflare Tunnel)
    const httpServer = createServer((req: IncomingMessage, res: ServerResponse) => {
      const status = {
        status: 'ok',
        service: 'shofferai-relay',
        pool: this.chromePool.getStatus(),
      };
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(status));
    });
    httpServer.listen(this.options.port);

    this.wss = new WebSocketServer({
      server: httpServer,
      verifyClient: (info, callback) => {
        if (!this.options.authToken) {
          callback(true);
          return;
        }
        const url = new URL(info.req.url || '/', `http://${info.req.headers.host}`);
        const token = url.searchParams.get('token') || info.req.headers['x-relay-token'];
        if (token === this.options.authToken) {
          callback(true);
        } else {
          logger.warn('Relay connection rejected: invalid auth token');
          callback(false, 401, 'Unauthorized');
        }
      },
    });

    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
      const clientIp = req.socket.remoteAddress;
      logger.info(`Relay client connected from ${clientIp}`);

      ws.on('message', async (data: Buffer) => {
        try {
          const msg: RelayMessage = JSON.parse(data.toString());
          await this.handleMessage(ws, msg);
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : 'Unknown error';
          logger.error('Failed to handle relay message', { error: errMsg });
        }
      });

      ws.on('close', () => {
        logger.info('Relay client disconnected');
      });

      ws.on('error', (error) => {
        logger.error('Relay WebSocket error', { error: error.message });
      });
    });

    this.wss.on('error', (error) => {
      logger.error('Relay server error', { error: error.message });
    });

    const poolStatus = this.chromePool.getStatus();
    logger.info(`Relay server ready on port ${this.options.port} (Chrome Pool: ${poolStatus.ready} slots ready)`);
  }

  private async handleMessage(ws: WebSocket, msg: RelayMessage): Promise<void> {
    if (isHeartbeatPing(msg)) {
      ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
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
      ws.send(JSON.stringify(response));
      return;
    }

    if (isSessionEndRequest(msg)) {
      try {
        await this.chromePool.releaseSlot(msg.sessionId);
        const response: SessionEndResponse = {
          id: msg.id,
          type: 'session_end_ack',
        };
        ws.send(JSON.stringify(response));
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
        logger.debug(`Relay executing tool: ${msg.name}`, {
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
        ws.send(JSON.stringify(response));
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Relay tool call failed: ${msg.name}`, { id: msg.id, error: errMsg });
        const response: ToolCallResponse = {
          id: msg.id,
          type: 'tool_result',
          result: null,
          error: errMsg,
        };
        ws.send(JSON.stringify(response));
      }
      return;
    }
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.wss) {
        // Close all client connections
        this.wss.clients.forEach((client) => {
          client.close();
        });
        this.wss.close(() => {
          logger.info('Relay server stopped');
          this.wss = null;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}
