// Custom Next.js server with WebSocket relay endpoint.
// Replaces the default standalone server.js to add relay support.
//
// Architecture:
//   Laptop → WSS → Cloud Run /api/relay/ws → RelayBridge → Agent API
//   (no Cloudflare Tunnel needed)

const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const { parse } = require('url');
const path = require('path');

// ─── Next.js Setup ──────────────────────────────────────────────
const NextServer = require('next/dist/server/next-server').default;

const dir = path.join(__dirname);
const conf = require(path.join(dir, '.next', 'required-server-files.json')).config;

const port = parseInt(process.env.PORT || '3000', 10);
const hostname = '0.0.0.0';
const authToken = process.env.RELAY_AUTH_TOKEN || '';

const nextApp = new NextServer({
  hostname,
  port,
  dir,
  dev: false,
  customServer: true,
  conf,
});

const nextHandler = nextApp.getRequestHandler();

// ─── HTTP Server ────────────────────────────────────────────────
const httpServer = createServer((req, res) => {
  nextHandler(req, res);
});

// ─── WebSocket Relay ────────────────────────────────────────────
const wss = new WebSocketServer({ noServer: true });

// RelayBridge is created by the Next.js app (singletons.ts) and stored on globalThis.
// The custom server just wires up the WebSocket to it.

httpServer.on('upgrade', (request, socket, head) => {
  let parsedUrl;
  try {
    parsedUrl = new URL(request.url || '/', `http://${request.headers.host}`);
  } catch {
    socket.destroy();
    return;
  }

  if (parsedUrl.pathname === '/api/relay/ws') {
    // Auth check
    if (authToken) {
      const token =
        parsedUrl.searchParams.get('token') || request.headers['x-relay-token'];
      if (token !== authToken) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      console.log('[relay] Laptop WebSocket connected');

      // Wire to the RelayBridge singleton
      const bridge = globalThis.__relayBridge;
      if (bridge && typeof bridge.setLaptopSocket === 'function') {
        bridge.setLaptopSocket(ws);
      } else {
        console.error('[relay] RelayBridge not found on globalThis — laptop connection dropped');
        ws.close(1011, 'RelayBridge not initialized');
      }
    });
  } else {
    // Not a relay upgrade — destroy (Next.js standalone doesn't use WS for HMR)
    socket.destroy();
  }
});

// ─── Start ──────────────────────────────────────────────────────
nextApp.prepare().then(() => {
  httpServer.listen(port, hostname, () => {
    console.log(`> ShofferAI ready on http://${hostname}:${port}`);
    console.log(`> Relay WebSocket endpoint: ws://${hostname}:${port}/api/relay/ws`);
  });
});
