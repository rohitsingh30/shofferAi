#!/usr/bin/env node
/**
 * lazy-playwright-proxy.mjs — MCP proxy that defers Chrome launch.
 *
 * TRANSPORT: Both Copilot CLI and playwright-mcp use NDJSON (newline-
 * delimited JSON) over stdio. The proxy simply bridges them.
 *
 * Responds to initialize + tools/list instantly with static tool definitions.
 * On first tools/call, spawns playwright-mcp-with-chrome.sh, initializes the
 * real MCP server, and proxies the call through. Zero Chrome overhead for
 * sessions that never touch browser tools.
 *
 * WORKAROUNDS for Copilot CLI MCP timeout bugs:
 *  - Suppresses notifications/tools/list_changed from child to prevent
 *    CLI timeout reset (github/copilot-cli#1378)
 *  - Auto-reconnects child on crash (next tool call spawns fresh Chrome)
 *  - Catches unhandled rejections to prevent silent proxy death
 */

import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REAL_SCRIPT = join(__dirname, 'playwright-mcp-with-chrome.sh');
const log = (msg) => process.stderr.write(msg + '\n');

// Prevent silent crashes from killing the proxy
process.on('uncaughtException', (err) => {
  log('⚠️  Uncaught exception (proxy stays alive): ' + err.message);
});
process.on('unhandledRejection', (err) => {
  log('⚠️  Unhandled rejection (proxy stays alive): ' + (err?.message || err));
});

// ─── Static tool definitions (playwright-mcp snapshot mode) ──────────
const TOOLS = [
  { name: 'browser_navigate', description: 'Navigate to a URL', inputSchema: { type: 'object', properties: { url: { type: 'string', description: 'The URL to navigate to' } }, required: ['url'] } },
  { name: 'browser_navigate_back', description: 'Go back to the previous page', inputSchema: { type: 'object', properties: {} } },
  { name: 'browser_navigate_forward', description: 'Go forward to the next page', inputSchema: { type: 'object', properties: {} } },
  { name: 'browser_snapshot', description: 'Capture accessibility snapshot of the current page', inputSchema: { type: 'object', properties: {} } },
  { name: 'browser_click', description: 'Click an element on the page', inputSchema: { type: 'object', properties: { element: { type: 'string' }, ref: { type: 'string' } }, required: ['element', 'ref'] } },
  { name: 'browser_hover', description: 'Hover over an element', inputSchema: { type: 'object', properties: { element: { type: 'string' }, ref: { type: 'string' } }, required: ['element', 'ref'] } },
  { name: 'browser_type', description: 'Type text into an editable element', inputSchema: { type: 'object', properties: { element: { type: 'string' }, ref: { type: 'string' }, text: { type: 'string' }, submit: { type: 'boolean' }, slowly: { type: 'boolean' } }, required: ['element', 'ref', 'text'] } },
  { name: 'browser_select_option', description: 'Select dropdown option', inputSchema: { type: 'object', properties: { element: { type: 'string' }, ref: { type: 'string' }, values: { type: 'array', items: { type: 'string' } } }, required: ['element', 'ref', 'values'] } },
  { name: 'browser_drag', description: 'Drag element to another element', inputSchema: { type: 'object', properties: { startElement: { type: 'string' }, startRef: { type: 'string' }, endElement: { type: 'string' }, endRef: { type: 'string' } }, required: ['startElement', 'startRef', 'endElement', 'endRef'] } },
  { name: 'browser_press_key', description: 'Press a keyboard key', inputSchema: { type: 'object', properties: { key: { type: 'string' } }, required: ['key'] } },
  { name: 'browser_take_screenshot', description: 'Take a screenshot', inputSchema: { type: 'object', properties: { raw: { type: 'boolean' }, element: { type: 'string' }, ref: { type: 'string' } } } },
  { name: 'browser_tabs', description: 'List browser tabs', inputSchema: { type: 'object', properties: {} } },
  { name: 'browser_tab_new', description: 'Open a new tab', inputSchema: { type: 'object', properties: { url: { type: 'string' } } } },
  { name: 'browser_tab_select', description: 'Select tab by index', inputSchema: { type: 'object', properties: { index: { type: 'number' } }, required: ['index'] } },
  { name: 'browser_tab_close', description: 'Close a tab', inputSchema: { type: 'object', properties: { index: { type: 'number' } } } },
  { name: 'browser_file_upload', description: 'Upload files', inputSchema: { type: 'object', properties: { paths: { type: 'array', items: { type: 'string' } } }, required: ['paths'] } },
  { name: 'browser_handle_dialog', description: 'Handle JS dialog', inputSchema: { type: 'object', properties: { accept: { type: 'boolean' }, promptText: { type: 'string' } }, required: ['accept'] } },
  { name: 'browser_console_messages', description: 'Get console messages', inputSchema: { type: 'object', properties: {} } },
  { name: 'browser_close', description: 'Close the page', inputSchema: { type: 'object', properties: {} } },
  { name: 'browser_wait', description: 'Wait for seconds', inputSchema: { type: 'object', properties: { time: { type: 'number' } }, required: ['time'] } },
  { name: 'browser_resize', description: 'Resize browser window', inputSchema: { type: 'object', properties: { width: { type: 'number' }, height: { type: 'number' } }, required: ['width', 'height'] } },
  { name: 'browser_pdf_save', description: 'Save page as PDF', inputSchema: { type: 'object', properties: {} } },
  { name: 'browser_network_requests', description: 'Get network requests', inputSchema: { type: 'object', properties: {} } },
  { name: 'browser_install', description: 'Install browser', inputSchema: { type: 'object', properties: {} } },
];

// ─── Transport: Copilot CLI uses newline-delimited JSON (NDJSON) ─────

/** Send NDJSON to parent (Copilot CLI) */
function sendToParent(msg) {
  process.stdout.write(JSON.stringify(msg) + '\n');
}

// ─── Transport: playwright-mcp ALSO uses NDJSON ─────────────────────

/** Send NDJSON to child (playwright-mcp) */
function sendToChild(msg) {
  if (!child) return;
  child.stdin.write(JSON.stringify(msg) + '\n');
}

// ─── Proxy state ─────────────────────────────────────────────────────
let child = null;
let childReady = false;
let childInitPromise = null;
const pending = new Map(); // childId → { resolve, reject }
let nextId = 1;

// ─── Handle messages from Copilot CLI ────────────────────────────────

function handleParent(msg) {
  // Notification (no id)
  if (msg.id === undefined) {
    if (child && childReady) sendToChild(msg);
    return;
  }

  switch (msg.method) {
    case 'initialize':
      sendToParent({
        jsonrpc: '2.0', id: msg.id,
        result: {
          protocolVersion: msg.params?.protocolVersion || '2025-03-26',
          capabilities: { tools: {} },
          serverInfo: { name: 'lazy-playwright-proxy', version: '1.0.0' }
        }
      });
      break;

    case 'tools/list':
      if (childReady) {
        forward(msg).catch((err) => {
          log('⚠️  Forward error (tools/list): ' + err.message);
        });
      } else {
        sendToParent({ jsonrpc: '2.0', id: msg.id, result: { tools: TOOLS } });
      }
      break;

    case 'ping':
      sendToParent({ jsonrpc: '2.0', id: msg.id, result: {} });
      break;

    default:
      forward(msg).catch((err) => {
        log('⚠️  Forward error: ' + err.message);
      });
      break;
  }
}

// ─── Handle messages from child (playwright-mcp) ─────────────────────

// Notifications that trigger Copilot CLI timeout reset bug (copilot-cli#1378).
// Suppress these to prevent the CLI from silently dropping its timeout config.
const SUPPRESSED_NOTIFICATIONS = new Set([
  'notifications/tools/list_changed',
]);

// Error patterns that indicate Chrome/CDP is dead — child is alive but useless.
const CDP_DEAD_PATTERNS = [
  'ECONNREFUSED',
  'ECONNRESET',
  'connectOverCDP',
  'Target closed',
  'Session closed',
  'Browser has been closed',
  'browser has disconnected',
];

function isCdpDead(msg) {
  if (!msg.error) return false;
  const text = JSON.stringify(msg.error);
  return CDP_DEAD_PATTERNS.some(p => text.includes(p));
}

function killChild() {
  if (!child) return;
  log('🔄 Killing dead child — fresh Chrome on next call');
  try { child.kill(); } catch {}
  child = null; childReady = false; childInitPromise = null;
  for (const [, p] of pending) p.reject(new Error('Child recycled'));
  pending.clear();
}

function handleChild(msg) {
  if (msg.id !== undefined && (msg.result !== undefined || msg.error !== undefined)) {
    // Detect dead Chrome: child alive but CDP gone → auto-recycle
    if (isCdpDead(msg)) {
      log('💀 CDP connection dead (Chrome crashed?) — recycling child');
      const p = pending.get(msg.id);
      if (p) { pending.delete(msg.id); p.resolve(msg); }
      killChild();
      return;
    }
    const p = pending.get(msg.id);
    if (p) { pending.delete(msg.id); p.resolve(msg); }
    return;
  }
  // Suppress notifications known to trigger CLI bugs
  if (msg.method && SUPPRESSED_NOTIFICATIONS.has(msg.method)) {
    log('🛡️  Suppressed ' + msg.method + ' (copilot-cli#1378 workaround)');
    return;
  }
  // Other notifications → parent
  sendToParent(msg);
}

// ─── Lazy child spawn ────────────────────────────────────────────────

function ensureChild() {
  if (childReady) return Promise.resolve();
  if (childInitPromise) return childInitPromise;

  childInitPromise = new Promise((ok, fail) => {
    log('🚀 First browser tool — launching Chrome + Playwright MCP...');

    child = spawn('bash', [REAL_SCRIPT], {
      stdio: ['pipe', 'pipe', 'inherit'],
      env: process.env, cwd: process.cwd()
    });

    child.on('error', (err) => {
      log('❌ Child error: ' + err.message);
      child = null; childInitPromise = null; fail(err);
    });

    child.on('exit', (code) => {
      log('⚠️  Child exited (code ' + code + ') — will auto-reconnect on next tool call');
      for (const [, p] of pending) p.reject(new Error('Child exited'));
      pending.clear();
      child = null; childReady = false; childInitPromise = null;
      if (childRl) try { childRl.close(); } catch {}
    });

    // Child also speaks NDJSON
    const childRl = createInterface({ input: child.stdout, terminal: false });
    childRl.on('line', (line) => {
      const t = line.trim();
      if (!t) return;
      try { handleChild(JSON.parse(t)); } catch {}
    });

    const initId = '__init__';
    pending.set(initId, {
      resolve: () => {
        sendToChild({ jsonrpc: '2.0', method: 'notifications/initialized' });
        childReady = true;
        log('✅ Playwright MCP ready');
        ok();
      },
      reject: (err) => { log('❌ Init failed: ' + err.message); fail(err); }
    });

    sendToChild({
      jsonrpc: '2.0', id: initId, method: 'initialize',
      params: {
        protocolVersion: '2025-03-26', capabilities: {},
        clientInfo: { name: 'lazy-playwright-proxy', version: '1.0.0' }
      }
    });

    setTimeout(() => {
      if (!childReady) { fail(new Error('Timeout')); if (child) child.kill(); }
    }, 45000);
  });

  return childInitPromise;
}

// ─── Forward request to child ────────────────────────────────────────

async function forward(parentMsg, _retry = false) {
  try {
    await ensureChild();
    const cid = nextId++;
    const pid = parentMsg.id;

    pending.set(cid, {
      resolve: (r) => {
        // If CDP is dead and this is the first attempt, auto-retry with fresh Chrome
        if (isCdpDead(r) && !_retry) {
          log('🔁 Auto-retrying with fresh Chrome...');
          forward(parentMsg, true).catch(() => {});
          return;
        }
        const resp = { jsonrpc: '2.0', id: pid };
        if (r.result !== undefined) resp.result = r.result;
        if (r.error !== undefined) resp.error = r.error;
        sendToParent(resp);
      },
      reject: (err) => {
        // Child died mid-request — retry once with fresh spawn
        if (!_retry) {
          log('🔁 Child died mid-request — retrying with fresh Chrome...');
          forward(parentMsg, true).catch(() => {});
          return;
        }
        sendToParent({ jsonrpc: '2.0', id: pid, error: { code: -32603, message: err.message } });
      }
    });

    sendToChild({ ...parentMsg, id: cid });
  } catch (err) {
    sendToParent({ jsonrpc: '2.0', id: parentMsg.id, error: { code: -32603, message: 'Browser launch failed: ' + err.message } });
  }
}

// ─── Cleanup ─────────────────────────────────────────────────────────

function cleanup() {
  if (child) try { child.kill(); } catch {}
  process.exit(0);
}
process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);
process.stdout.on('error', () => {});
process.stdin.on('error', () => {});

// ─── Start: read NDJSON from Copilot CLI on stdin ────────────────────
log('🦥 Lazy Playwright proxy — Chrome deferred until first tool call');
const rl = createInterface({ input: process.stdin, terminal: false });
rl.on('line', (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  try { handleParent(JSON.parse(trimmed)); }
  catch (e) { log('⚠️  Bad JSON from parent: ' + e.message); }
});
rl.on('close', cleanup);
