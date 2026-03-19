import { logger } from '@shofferai/shared';
import { ChromePool } from './chrome-pool';
import { RelayServer } from './relay-server';
import { RelayOutbound } from './relay-outbound';
import { TaskManager } from './task-manager';

const RELAY_PORT = parseInt(process.env.RELAY_PORT || '8765', 10);
const RELAY_CLOUD_URL = process.env.RELAY_CLOUD_URL; // e.g. wss://shofferai-xxx.run.app/api/relay/ws

async function main() {
  logger.info('Starting ShofferAI Playwright Runner...');

  // Initialize Chrome Pool (lazy — only 1 bootstrap Chrome, rest launch on demand)
  const chromePool = new ChromePool();
  await chromePool.initialize();

  // Initialize TaskManager (for Copilot CLI task execution)
  const taskManager = new TaskManager();
  await taskManager.initialize();

  const poolStatus = chromePool.getStatus();
  const tools = chromePool.getTools();
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
    logger.info(`Chrome:  ${poolStatus.active} warm slot (up to ${poolStatus.maxSlots} on demand)`);
    logger.info(`Tools:   ${tools.length} Playwright MCP tools`);
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
    logger.info(`Chrome:  ${poolStatus.active} warm slot (up to ${poolStatus.maxSlots} on demand)`);
    logger.info(`Tools:   ${tools.length} Playwright MCP tools`);
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
}

main().catch((error) => {
  logger.error('Playwright runner failed', { error: error instanceof Error ? error.message : 'Unknown' });
  process.exit(1);
});
