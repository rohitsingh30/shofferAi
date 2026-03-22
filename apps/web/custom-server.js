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

// Set on SIGTERM — prevents the draining instance from accepting new laptop
// WS connections. Without this, the laptop reconnects to the dying instance
// instead of the new one, causing relay failures on all subsequent tasks.
let draining = false;

// RelayBridge is created by the Next.js app (singletons.ts) and stored on globalThis.
// The custom server wires up the WebSocket to it.
//
// Race condition fix: the laptop may reconnect (after a deploy) before any
// Next.js route has been hit, which means singletons.ts hasn't run yet and
// globalThis.__relayBridge is null. We queue the socket and wire it up
// once the bridge becomes available.
let earlyLaptopSocket = null;
let earlySocketPoll = null;

function wireLaptopSocket(ws) {
  const bridge = globalThis.__relayBridge;
  if (bridge && typeof bridge.setLaptopSocket === 'function') {
    bridge.setLaptopSocket(ws);
    return true;
  }
  return false;
}

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
    // DRAINING GUARD: After SIGTERM, reject new WS connections so the laptop
    // is forced to connect to the NEW Cloud Run instance, not this dying one.
    if (draining) {
      console.warn('[relay] Rejecting laptop WS — instance is draining after SIGTERM');
      socket.write('HTTP/1.1 503 Service Unavailable\r\nRetry-After: 2\r\n\r\n');
      socket.destroy();
      return;
    }

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
      console.log('[relay] Laptop WebSocket connected (remoteAddr=%s)', request.socket.remoteAddress);

      if (wireLaptopSocket(ws)) {
        console.log('[relay] Wired laptop socket to bridge immediately');
        return; // Wired successfully
      }

      // Bridge not ready yet — queue and poll until it is
      console.log('[relay] RelayBridge not ready yet, queuing laptop socket (will poll every 500ms for up to 30s)');
      if (earlyLaptopSocket) {
        earlyLaptopSocket.close(1000, 'Replaced by newer connection');
      }
      if (earlySocketPoll) clearInterval(earlySocketPoll);
      earlyLaptopSocket = ws;

      let attempts = 0;
      earlySocketPoll = setInterval(() => {
        attempts++;
        if (wireLaptopSocket(earlyLaptopSocket)) {
          console.log('[relay] Wired queued laptop socket to bridge (after %dms)', attempts * 500);
          clearInterval(earlySocketPoll);
          earlySocketPoll = null;
          earlyLaptopSocket = null;
        } else if (attempts >= 60) {
          // 30s without bridge — give up
          console.error('[relay] RelayBridge not initialized after 30s — dropping queued laptop socket');
          clearInterval(earlySocketPoll);
          earlySocketPoll = null;
          earlyLaptopSocket.close(1011, 'RelayBridge not initialized');
          earlyLaptopSocket = null;
        }
      }, 500);

      // If the queued socket closes before we wire it, clean up
      ws.on('close', () => {
        if (earlyLaptopSocket === ws) {
          console.log('[relay] Queued laptop socket closed before bridge was ready');
          if (earlySocketPoll) clearInterval(earlySocketPoll);
          earlySocketPoll = null;
          earlyLaptopSocket = null;
        }
      });
    });
  } else {
    // Not a relay upgrade — destroy (Next.js standalone doesn't use WS for HMR)
    socket.destroy();
  }
});

// ─── Graceful Shutdown (SIGTERM) ────────────────────────────────
// Cloud Run sends SIGTERM when deploying a new revision or scaling down.
// We MUST close the laptop WebSocket so the laptop detects the disconnect
// and reconnects to the NEW instance. Without this, the laptop stays
// connected to the draining old instance while new HTTP requests go to
// the new instance (which has no laptop WS) → relay always fails.
process.on('SIGTERM', () => {
  console.log('[server] SIGTERM received — closing relay WS to force laptop reconnect');

  // Set draining flag FIRST so the upgrade handler rejects new connections
  // before we close the existing one. This prevents the laptop from
  // reconnecting to this dying instance during the 1-4s reconnect window.
  draining = true;

  const bridge = globalThis.__relayBridge;
  if (bridge && typeof bridge.gracefulClose === 'function') {
    bridge.gracefulClose('Cloud Run deploying new revision');
    // Hard-terminate after 2s if graceful close didn't complete —
    // ensures the WS is fully severed before the instance dies.
    if (bridge.laptopSocket || bridge._laptopSocket) {
      setTimeout(() => {
        try {
          const sock = bridge.laptopSocket || bridge._laptopSocket;
          if (sock && sock.readyState <= 1) {
            console.log('[server] Force-terminating laptop WS after 2s grace');
            sock.terminate();
          }
        } catch { /* best-effort */ }
      }, 2000);
    }
  }
  httpServer.close(() => {
    console.log('[server] HTTP server closed');
    process.exit(0);
  });
  // Force exit after 8s if server.close hangs (Cloud Run gives 10s)
  setTimeout(() => process.exit(0), 8000);
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

