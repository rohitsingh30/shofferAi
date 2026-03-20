import { logger } from '@shofferai/shared';
import { createServer, type IncomingMessage, type ServerResponse } from 'http';
import { ChromePool } from './chrome-pool';
import { mcpToolEvents, type McpToolEvent } from './chrome-pool';
import { RelayServer } from './relay-server';
import { RelayOutbound } from './relay-outbound';
import { TaskManager } from './task-manager';

const RELAY_PORT = parseInt(process.env.RELAY_PORT || '8765', 10);
const RELAY_CLOUD_URL = process.env.RELAY_CLOUD_URL; // e.g. wss://shofferai-xxx.run.app/api/relay/ws
const MCP_LOG_PORT = parseInt(process.env.MCP_LOG_PORT || '9401', 10);

async function main() {
  logger.info('Starting ShofferAI Playwright Runner...');

  // Initialize Chrome Pool (lazy — only 1 bootstrap Chrome, rest launch on demand)
  const chromePool = new ChromePool();
  await chromePool.initialize();

  // Initialize TaskManager (for Copilot CLI task execution)
  const taskManager = new TaskManager();
  await taskManager.initialize();

  const poolStatus = chromePool.getStatus();
  const toolCount = poolStatus.active > 0 ? '(discovering...)' : '(cached or lazy)';
  const taskStatus = taskManager.getStatus();

  let shutdownFn: () => Promise<void>;

  if (RELAY_CLOUD_URL) {
    // ─── Outbound mode: connect TO Cloud Run (production) ───────
    logger.info(`Mode: OUTBOUND → connecting to Cloud Run`);
    const outbound = new RelayOutbound(chromePool, RELAY_CLOUD_URL, {
      authToken: process.env.RELAY_AUTH_TOKEN,
    });
    outbound.setTaskManager(taskManager);

    await outbound.connect();

    logger.info('');
    logger.info('=== ShofferAI Laptop Relay ===');
    logger.info(`Cloud:   ${RELAY_CLOUD_URL}`);
    logger.info(`Chrome:  0 running (up to ${poolStatus.maxSlots} on demand)`);
    logger.info(`Tools:   ${toolCount}`);
    logger.info(`Tasks:   Bridge WS on port ${taskStatus.bridgePort} (max ${taskStatus.maxConcurrent} concurrent)`);
    logger.info('Press Ctrl+C to stop.');
    logger.info('');

    shutdownFn = async () => {
      await taskManager.shutdown();
      await outbound.disconnect();
      await chromePool.shutdown();
    };
  } else {
    // ─── Server mode: accept connections locally (dev) ──────────
    logger.info(`Mode: SERVER → listening on port ${RELAY_PORT}`);
    const relayServer = new RelayServer(chromePool, { port: RELAY_PORT });
    relayServer.setTaskManager(taskManager);
    await relayServer.start();

    logger.info('');
    logger.info('=== ShofferAI Laptop Relay (Dev) ===');
    logger.info(`Relay:   ws://localhost:${RELAY_PORT}`);
    logger.info(`Chrome:  0 running (up to ${poolStatus.maxSlots} on demand)`);
    logger.info(`Tools:   ${toolCount}`);
    logger.info(`Tasks:   Bridge WS on port ${taskStatus.bridgePort} (max ${taskStatus.maxConcurrent} concurrent)`);
    logger.info('Press Ctrl+C to stop.');
    logger.info('');

    shutdownFn = async () => {
      await taskManager.shutdown();
      await relayServer.stop();
      await chromePool.shutdown();
    };
  }

  // Graceful shutdown
  const shutdown = async () => {
    logger.info('\nShutting down...');
    await shutdownFn();
    logger.info('Goodbye.');
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // ─── MCP Tool Log SSE server ──────────────────────────────────
  const logServer = createServer((req: IncomingMessage, res: ServerResponse) => {
    if (req.url?.startsWith('/logs/mcp')) {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
        Connection: 'keep-alive',
      });
      res.write(`: 🔌 Connected to MCP log stream (laptop relay)\n\n`);
      res.write(`: Listening for Playwright MCP tool calls...\n\n`);

      const onEvent = (event: McpToolEvent) => {
        const ts = event.timestamp.slice(11, 23);
        let line: string;
        if (event.type === 'tool_start') {
          line = `${ts} ▶ ${event.toolName}  args=${JSON.stringify(event.args ?? {}).slice(0, 120)}`;
        } else if (event.type === 'tool_end') {
          line = `${ts} ✓ ${event.toolName}  ${event.durationMs}ms  result=${event.resultSummary?.slice(0, 100) ?? ''}`;
        } else {
          line = `${ts} ✗ ${event.toolName}  ${event.durationMs}ms  error=${event.error}`;
        }
        res.write(`data: ${JSON.stringify(event)}\n\n`);
        res.write(`: ${line}\n\n`);
      };

      mcpToolEvents.on('mcp_tool', onEvent);

      const heartbeat = setInterval(() => { res.write(`: heartbeat\n\n`); }, 10_000);

      req.on('close', () => {
        mcpToolEvents.off('mcp_tool', onEvent);
        clearInterval(heartbeat);
      });
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', endpoints: ['/logs/mcp'] }));
    }
  });

  logServer.listen(MCP_LOG_PORT, '127.0.0.1', () => {
    logger.info(`MCP Log stream: http://localhost:${MCP_LOG_PORT}/logs/mcp`);
  });
}

main().catch((error) => {
  logger.error('Playwright runner failed', { error: error instanceof Error ? error.message : 'Unknown' });
  process.exit(1);
});
