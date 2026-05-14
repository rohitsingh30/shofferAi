// Custom Next.js server.
//
// After the migration to the Browser Operations Service, the cloud no longer
// hosts a WebSocket relay or laptop bridge. This server only:
//   - Serves Next.js routes
//   - Serves _next/static/* and public/* (NextServer in standalone+customServer
//     mode does not handle these)
//   - Disconnects Prisma cleanly on SIGTERM (free Cloud SQL slots)

const { createServer } = require('http');
const { parse } = require('url');
const path = require('path');
const fs = require('fs');

// ─── Next.js Setup ──────────────────────────────────────────────
const NextServer = require('next/dist/server/next-server').default;

const dir = path.join(__dirname);
const conf = require(path.join(dir, '.next', 'required-server-files.json')).config;

const port = parseInt(process.env.PORT || '3000', 10);
const hostname = '0.0.0.0';

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

// ─── Security headers (formerly in middleware.ts — but Next.js middleware
//     is BYPASSED when `customServer: true`, so we apply them here). ───
const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(self)',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Content-Security-Policy': [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'self'",
    "form-action 'self'",
    "img-src 'self' data: blob: https://*.bbassets.com https://cdn.zeptonow.com https://blinkit.com https://*.blinkit.com https://*.swiggy.com https://*.googleusercontent.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://*.razorpay.com",
    "connect-src 'self' https://api.razorpay.com https://*.razorpay.com https://api.openai.com https://*.openai.com https://*.googleapis.com https://accounts.google.com",
    "frame-src 'self' https://api.razorpay.com https://*.razorpay.com https://accounts.google.com",
  ].join('; '),
};

function applySecurityHeaders(res, pathname) {
  for (const k of Object.keys(SECURITY_HEADERS)) {
    res.setHeader(k, SECURITY_HEADERS[k]);
  }
  // /api/* should not be search-indexed.
  if (pathname && pathname.startsWith('/api/')) {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  }
}

const httpServer = createServer((req, res) => {
  const parsedUrl = parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // ─── Security headers (set on every response — middleware.ts is bypassed
  //     when customServer: true, so we set them here directly). ────────
  applySecurityHeaders(res, pathname);

  if (pathname.startsWith('/_next/static/')) {
    const relPath = decodeURIComponent(pathname.slice('/_next/static/'.length));
    const filePath = path.join(STATIC_DIR, relPath);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return serveStaticFile(filePath, res);
    }
  }

  if (!pathname.startsWith('/_next/') && !pathname.startsWith('/api/')) {
    const filePath = path.join(PUBLIC_DIR, pathname);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return serveStaticFile(filePath, res);
    }
  }

  nextHandler(req, res, parsedUrl);
});

// ─── Graceful Shutdown ───────────────────────────────────────────
process.on('SIGTERM', () => {
  console.log('[server] SIGTERM received');
  import('./lib/prisma.js')
    .then(({ prisma }) => prisma.$disconnect())
    .then(() => console.log('[server] Prisma disconnected'))
    .catch((err) => console.error('[server] Prisma disconnect failed:', err));

  httpServer.close(() => {
    console.log('[server] HTTP server closed');
    process.exit(0);
  });
  setTimeout(() => process.exit(0), 8000);
});

// ─── Start ──────────────────────────────────────────────────────
nextApp.prepare().then(() => {
  httpServer.listen(port, hostname, () => {
    httpServer.keepAliveTimeout = 620000;
    httpServer.headersTimeout = 625000;
    console.log(`> ShofferAI ready on http://${hostname}:${port}`);
  });
});
