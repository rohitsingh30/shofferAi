#!/usr/bin/env node
/**
 * lazy-playwright-proxy.mjs — MCP proxy that defers Chrome launch.
 *
 * TRANSPORT BRIDGE:
 *   Copilot CLI  ←→  proxy  ←→  playwright-mcp
 *   (NDJSON)          ↕         (Content-Length framed)
 *
 * Responds to initialize + tools/list instantly with static tool definitions.
 * On first tools/call, spawns playwright-mcp-with-chrome.sh, initializes the
 * real MCP server, and proxies the call through. Zero Chrome overhead for
 * sessions that never touch browser tools.
 */

import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REAL_SCRIPT = join(__dirname, 'playwright-mcp-with-chrome.sh');
const log = (msg) => process.stderr.write(msg + '\n');

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

// ─── Transport: playwright-mcp uses Content-Length framing (LSP-style) ─

/** Send Content-Length framed message to child (playwright-mcp) */
function sendToChild(msg) {
  if (!child) return;
  const json = JSON.stringify(msg);
  child.stdin.write(`Content-Length: ${Buffer.byteLength(json)}\r\n\r\n${json}`);
}

/** Read Content-Length framed messages from a stream */
class ContentLengthReader {
  constructor(stream, onMessage) {
    this._buf = Buffer.alloc(0);
    this._onMessage = onMessage;
    stream.on('data', (chunk) => {
      this._buf = Buffer.concat([this._buf, chunk]);
      this._drain();
    });
  }
  _drain() {
    while (true) {
      const idx = this._buf.indexOf('\r\n\r\n');
      if (idx === -1) return;
      const header = this._buf.subarray(0, idx).toString();
      const m = header.match(/Content-Length:\s*(\d+)/i);
      if (!m) { this._buf = this._buf.subarray(idx + 4); continue; }
      const len = parseInt(m[1], 10);
      const bodyStart = idx + 4;
      if (this._buf.length < bodyStart + len) return;
      const body = this._buf.subarray(bodyStart, bodyStart + len).toString();
      this._buf = this._buf.subarray(bodyStart + len);
      try { this._onMessage(JSON.parse(body)); } catch {}
    }
  }
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
        forward(msg);
      } else {
        sendToParent({ jsonrpc: '2.0', id: msg.id, result: { tools: TOOLS } });
      }
      break;

    case 'ping':
      sendToParent({ jsonrpc: '2.0', id: msg.id, result: {} });
      break;

    default:
      forward(msg);
      break;
  }
}

// ─── Handle messages from child (playwright-mcp) ─────────────────────

function handleChild(msg) {
  if (msg.id !== undefined && (msg.result !== undefined || msg.error !== undefined)) {
    const p = pending.get(msg.id);
    if (p) { pending.delete(msg.id); p.resolve(msg); }
    return;
  }
  // Notification → parent
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
      log('⚠️  Child exited (code ' + code + ')');
      for (const [, p] of pending) p.reject(new Error('Child exited'));
      pending.clear();
      child = null; childReady = false; childInitPromise = null;
    });

    // Child speaks Content-Length framing
    new ContentLengthReader(child.stdout, handleChild);

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

async function forward(parentMsg) {
  try {
    await ensureChild();
    const cid = nextId++;
    const pid = parentMsg.id;

    pending.set(cid, {
      resolve: (r) => {
        const resp = { jsonrpc: '2.0', id: pid };
        if (r.result !== undefined) resp.result = r.result;
        if (r.error !== undefined) resp.error = r.error;
        sendToParent(resp);
      },
      reject: (err) => {
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
