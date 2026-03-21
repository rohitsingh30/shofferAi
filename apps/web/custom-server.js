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
const fs = require('fs');

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

// ─── Static File Serving ────────────────────────────────────────
// NextServer in standalone+customServer mode does not serve _next/static/* or
// public/* files. We handle them here before falling through to the Next.js handler.
const STATIC_DIR = path.join(dir, '.next', 'static');
const PUBLIC_DIR = path.join(dir, 'public');

const MIME_TYPES = {
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.map': 'application/json',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
  '.webmanifest': 'application/manifest+json',
};

function serveStaticFile(filePath, res) {
  const ext = path.extname(filePath);
  const mime = MIME_TYPES[ext] || 'application/octet-stream';
  res.setHeader('Content-Type', mime);
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  fs.createReadStream(filePath).pipe(res);
}

// ─── HTTP Server ────────────────────────────────────────────────
const httpServer = createServer((req, res) => {
  const parsedUrl = parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Serve _next/static/* from .next/static/
  if (pathname.startsWith('/_next/static/')) {
    const relPath = pathname.slice('/_next/static/'.length);
    const filePath = path.join(STATIC_DIR, relPath);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return serveStaticFile(filePath, res);
    }
  }

  // Serve public/* files (favicon.ico, robots.txt, etc.)
  if (!pathname.startsWith('/_next/') && !pathname.startsWith('/api/')) {
    const filePath = path.join(PUBLIC_DIR, pathname);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return serveStaticFile(filePath, res);
    }
  }

  nextHandler(req, res, parsedUrl);
});

// ─── WebSocket Relay ────────────────────────────────────────────
const wss = new WebSocketServer({ noServer: true });

// RelayBridge is created by the Next.js app (singletons.ts) and stored on globalThis.
// The custom server just wires up the WebSocket to it.

httpServer.on('upgrade', (request, socket, head) => {
  let parsedUrl;
  try {
    parsedUrl = new URL(request.url || '/', `http://${request.headers.host}`);
  } catch (err) {
    console.error('[relay] Failed to parse upgrade URL:', err);
    socket.destroy();
    return;
  }

  if (parsedUrl.pathname === '/api/relay/ws') {
    // Auth check
    if (authToken) {
      const token =
        parsedUrl.searchParams.get('token') || request.headers['x-relay-token'];
      if (token !== authToken) {
        console.warn('[relay] Laptop auth failed — token mismatch');
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
    // Keep connections alive for long-running SSE streams (agent tasks can run 30+ minutes).
    // The SSE heartbeat (every 15s) keeps data flowing, but these timeouts
    // must be high enough to survive any gap. Cloud Run timeout is set separately.
    httpServer.keepAliveTimeout = 620000; // 620s (~10 min)
    httpServer.headersTimeout = 625000;   // must be > keepAliveTimeout

    console.log(`> ShofferAI ready on http://${hostname}:${port}`);
    console.log(`> Relay WebSocket endpoint: ws://${hostname}:${port}/api/relay/ws`);
  });
});

// ─── Graceful Shutdown ─────────────────────────────────────────
// Cloud Run sends SIGTERM on deploy/scale-down. Send a proper WebSocket
// close frame so the laptop relay detects the disconnect immediately
// instead of waiting for the 20s dead-connection timeout.
function gracefulShutdown(signal) {
  console.log(`[relay] ${signal} received — closing relay WebSocket`);
  const bridge = globalThis.__relayBridge;
  if (bridge && typeof bridge.gracefulClose === 'function') {
    bridge.gracefulClose('Server shutting down');
  }
  // Give 2s for the close frame to flush, then exit
  setTimeout(() => process.exit(0), 2000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
