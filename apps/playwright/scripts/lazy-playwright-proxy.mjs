#!/usr/bin/env node
/**
 * lazy-playwright-proxy.mjs — MCP proxy that defers Chrome launch.
 *
 * Responds to initialize + tools/list instantly with static tool definitions.
 * On first tools/call, spawns playwright-mcp-with-chrome.sh, initializes the
 * real MCP server, and proxies the call through. Zero Chrome overhead for
 * sessions that never touch browser tools.
 */

import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REAL_SCRIPT = join(__dirname, 'playwright-mcp-with-chrome.sh');

// ─── Static tool definitions (playwright-mcp snapshot mode) ──────────
const TOOLS = [
  {
    name: 'browser_navigate',
    description: 'Navigate to a URL',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'The URL to navigate to' }
      },
      required: ['url']
    }
  },
  {
    name: 'browser_navigate_back',
    description: 'Go back to the previous page',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'browser_navigate_forward',
    description: 'Go forward to the next page',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'browser_snapshot',
    description: 'Capture accessibility snapshot of the current page for use with other tools',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'browser_click',
    description: 'Click an element on the page using a ref from browser_snapshot',
    inputSchema: {
      type: 'object',
      properties: {
        element: { type: 'string', description: 'Human-readable element description' },
        ref: { type: 'string', description: 'Exact target element reference from snapshot' }
      },
      required: ['element', 'ref']
    }
  },
  {
    name: 'browser_hover',
    description: 'Hover over an element on the page',
    inputSchema: {
      type: 'object',
      properties: {
        element: { type: 'string', description: 'Human-readable element description' },
        ref: { type: 'string', description: 'Exact target element reference from snapshot' }
      },
      required: ['element', 'ref']
    }
  },
  {
    name: 'browser_type',
    description: 'Type text into an editable element',
    inputSchema: {
      type: 'object',
      properties: {
        element: { type: 'string', description: 'Human-readable element description' },
        ref: { type: 'string', description: 'Exact target element reference from snapshot' },
        text: { type: 'string', description: 'Text to type' },
        submit: { type: 'boolean', description: 'Press Enter after typing' },
        slowly: { type: 'boolean', description: 'Type one character at a time' }
      },
      required: ['element', 'ref', 'text']
    }
  },
  {
    name: 'browser_select_option',
    description: 'Select an option in a dropdown',
    inputSchema: {
      type: 'object',
      properties: {
        element: { type: 'string', description: 'Human-readable element description' },
        ref: { type: 'string', description: 'Exact target element reference from snapshot' },
        values: { type: 'array', items: { type: 'string' }, description: 'Values to select' }
      },
      required: ['element', 'ref', 'values']
    }
  },
  {
    name: 'browser_drag',
    description: 'Drag an element to another element',
    inputSchema: {
      type: 'object',
      properties: {
        startElement: { type: 'string', description: 'Source element description' },
        startRef: { type: 'string', description: 'Source element reference' },
        endElement: { type: 'string', description: 'Target element description' },
        endRef: { type: 'string', description: 'Target element reference' }
      },
      required: ['startElement', 'startRef', 'endElement', 'endRef']
    }
  },
  {
    name: 'browser_press_key',
    description: 'Press a keyboard key or key combination',
    inputSchema: {
      type: 'object',
      properties: {
        key: { type: 'string', description: 'Key name (e.g. "ArrowLeft", "Enter", "Control+c")' }
      },
      required: ['key']
    }
  },
  {
    name: 'browser_take_screenshot',
    description: 'Take a screenshot of the current page or a specific element',
    inputSchema: {
      type: 'object',
      properties: {
        raw: { type: 'boolean', description: 'Return PNG without compression' },
        element: { type: 'string', description: 'Element description to screenshot' },
        ref: { type: 'string', description: 'Element reference to screenshot' }
      }
    }
  },
  {
    name: 'browser_tabs',
    description: 'List all browser tabs',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'browser_tab_new',
    description: 'Open a new browser tab',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL to navigate to in the new tab' }
      }
    }
  },
  {
    name: 'browser_tab_select',
    description: 'Select a browser tab by index',
    inputSchema: {
      type: 'object',
      properties: {
        index: { type: 'number', description: 'Tab index to select' }
      },
      required: ['index']
    }
  },
  {
    name: 'browser_tab_close',
    description: 'Close a browser tab',
    inputSchema: {
      type: 'object',
      properties: {
        index: { type: 'number', description: 'Tab index to close (current tab if omitted)' }
      }
    }
  },
  {
    name: 'browser_file_upload',
    description: 'Upload files to a file input element',
    inputSchema: {
      type: 'object',
      properties: {
        paths: { type: 'array', items: { type: 'string' }, description: 'Absolute file paths to upload' }
      },
      required: ['paths']
    }
  },
  {
    name: 'browser_handle_dialog',
    description: 'Handle a JavaScript dialog (alert, confirm, prompt)',
    inputSchema: {
      type: 'object',
      properties: {
        accept: { type: 'boolean', description: 'Accept or dismiss the dialog' },
        promptText: { type: 'string', description: 'Text for prompt dialogs' }
      },
      required: ['accept']
    }
  },
  {
    name: 'browser_console_messages',
    description: 'Get all browser console messages',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'browser_close',
    description: 'Close the current page',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'browser_wait',
    description: 'Wait for a specified number of seconds',
    inputSchema: {
      type: 'object',
      properties: {
        time: { type: 'number', description: 'Seconds to wait (capped at 10)' }
      },
      required: ['time']
    }
  },
  {
    name: 'browser_resize',
    description: 'Resize the browser window',
    inputSchema: {
      type: 'object',
      properties: {
        width: { type: 'number', description: 'Window width in pixels' },
        height: { type: 'number', description: 'Window height in pixels' }
      },
      required: ['width', 'height']
    }
  },
  {
    name: 'browser_pdf_save',
    description: 'Save the current page as PDF',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'browser_network_requests',
    description: 'Get all network requests from the page',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'browser_install',
    description: 'Install the required browser',
    inputSchema: { type: 'object', properties: {} }
  }
];

// ─── MCP Content-Length framing (same as LSP) ────────────────────────

class MCPReader {
  constructor(stream, onMessage) {
    this._buffer = Buffer.alloc(0);
    this._onMessage = onMessage;
    stream.on('data', (chunk) => {
      this._buffer = Buffer.concat([this._buffer, chunk]);
      this._drain();
    });
    stream.on('end', () => {
      process.stderr.write('📭 stdin closed — exiting proxy\n');
      cleanup();
    });
  }

  _drain() {
    while (true) {
      const headerEnd = this._buffer.indexOf('\r\n\r\n');
      if (headerEnd === -1) return;
      const header = this._buffer.subarray(0, headerEnd).toString();
      const match = header.match(/Content-Length:\s*(\d+)/i);
      if (!match) {
        // Skip malformed header
        this._buffer = this._buffer.subarray(headerEnd + 4);
        continue;
      }
      const len = parseInt(match[1], 10);
      const bodyStart = headerEnd + 4;
      if (this._buffer.length < bodyStart + len) return; // wait for more data
      const json = this._buffer.subarray(bodyStart, bodyStart + len).toString();
      this._buffer = this._buffer.subarray(bodyStart + len);
      try {
        this._onMessage(JSON.parse(json));
      } catch (e) {
        process.stderr.write(`⚠️  Failed to parse MCP message: ${e.message}\n`);
      }
    }
  }
}

function send(stream, msg) {
  const json = JSON.stringify(msg);
  const frame = `Content-Length: ${Buffer.byteLength(json)}\r\n\r\n${json}`;
  stream.write(frame);
}

// ─── Proxy state ─────────────────────────────────────────────────────
let child = null;
let childInitialized = false;
let childInitPromise = null;
let pendingFromChild = new Map();   // childId → { resolve, reject }
let parentIdToChildId = new Map();  // parentId → childId
let childIdToParentId = new Map();  // childId → parentId
let nextChildId = 1;

// ─── Handle messages from Copilot CLI (parent) ──────────────────────

function handleParentMessage(msg) {
  // Notification (no id) — forward to child if alive
  if (msg.id === undefined) {
    if (child && childInitialized) {
      send(child.stdin, msg);
    }
    return;
  }

  // Request (has id)
  switch (msg.method) {
    case 'initialize':
      send(process.stdout, {
        jsonrpc: '2.0',
        id: msg.id,
        result: {
          protocolVersion: msg.params?.protocolVersion || '2025-03-26',
          capabilities: { tools: {} },
          serverInfo: { name: 'lazy-playwright-proxy', version: '1.0.0' }
        }
      });
      break;

    case 'tools/list':
      // If child is alive, forward for accurate list; otherwise return static
      if (childInitialized) {
        forwardToChild(msg);
      } else {
        send(process.stdout, {
          jsonrpc: '2.0',
          id: msg.id,
          result: { tools: TOOLS }
        });
      }
      break;

    case 'ping':
      send(process.stdout, { jsonrpc: '2.0', id: msg.id, result: {} });
      break;

    default:
      // tools/call and anything else → forward to child (lazy spawn)
      forwardToChild(msg);
      break;
  }
}

// ─── Handle messages from child (real playwright-mcp) ────────────────

function handleChildMessage(msg) {
  // Response (has id + result/error)
  if (msg.id !== undefined && (msg.result !== undefined || msg.error !== undefined)) {
    const pending = pendingFromChild.get(msg.id);
    if (pending) {
      pendingFromChild.delete(msg.id);
      pending.resolve(msg);
      return;
    }
    // Unknown response — ignore
    return;
  }

  // Notification from child — forward to parent
  send(process.stdout, msg);
}

// ─── Lazy child spawn ────────────────────────────────────────────────

function ensureChild() {
  if (childInitialized) return Promise.resolve();
  if (childInitPromise) return childInitPromise;

  childInitPromise = new Promise((resolveInit, rejectInit) => {
    process.stderr.write('🚀 First browser tool call — launching Chrome + Playwright MCP...\n');

    child = spawn('bash', [REAL_SCRIPT], {
      stdio: ['pipe', 'pipe', 'inherit'],
      env: process.env,
      cwd: process.cwd()
    });

    child.on('error', (err) => {
      process.stderr.write(`❌ Child error: ${err.message}\n`);
      child = null;
      childInitPromise = null;
      rejectInit(err);
    });

    child.on('exit', (code) => {
      process.stderr.write(`⚠️  Child exited (code ${code})\n`);
      // Fail all pending requests
      for (const [id, { reject }] of pendingFromChild) {
        reject(new Error(`Child exited with code ${code}`));
      }
      pendingFromChild.clear();
      child = null;
      childInitialized = false;
      childInitPromise = null;
    });

    // Read child's responses
    new MCPReader(child.stdout, handleChildMessage);

    // Send initialize to child
    const initId = `__proxy_init__`;
    pendingFromChild.set(initId, {
      resolve: (_response) => {
        // Send notifications/initialized
        send(child.stdin, { jsonrpc: '2.0', method: 'notifications/initialized' });
        childInitialized = true;
        process.stderr.write('✅ Playwright MCP ready — Chrome launched on demand\n');
        resolveInit();
      },
      reject: (err) => {
        process.stderr.write(`❌ Child init failed: ${err.message}\n`);
        rejectInit(err);
      }
    });

    send(child.stdin, {
      jsonrpc: '2.0',
      id: initId,
      method: 'initialize',
      params: {
        protocolVersion: '2025-03-26',
        capabilities: {},
        clientInfo: { name: 'lazy-playwright-proxy', version: '1.0.0' }
      }
    });

    // Timeout after 45s (Chrome launch + profile copy can take a while)
    setTimeout(() => {
      if (!childInitialized) {
        rejectInit(new Error('Timed out waiting for Playwright MCP to initialize'));
        if (child) child.kill();
      }
    }, 45000);
  });

  return childInitPromise;
}

// ─── Forward a request to the child ──────────────────────────────────

async function forwardToChild(parentMsg) {
  try {
    await ensureChild();

    const childId = nextChildId++;
    const parentId = parentMsg.id;

    pendingFromChild.set(childId, {
      resolve: (childResp) => {
        const resp = { jsonrpc: '2.0', id: parentId };
        if (childResp.result !== undefined) resp.result = childResp.result;
        if (childResp.error !== undefined) resp.error = childResp.error;
        send(process.stdout, resp);
      },
      reject: (err) => {
        send(process.stdout, {
          jsonrpc: '2.0',
          id: parentId,
          error: { code: -32603, message: err.message }
        });
      }
    });

    // Forward with remapped id
    send(child.stdin, { ...parentMsg, id: childId });
  } catch (err) {
    send(process.stdout, {
      jsonrpc: '2.0',
      id: parentMsg.id,
      error: { code: -32603, message: `Failed to start browser: ${err.message}` }
    });
  }
}

// ─── Cleanup ─────────────────────────────────────────────────────────

function cleanup() {
  if (child) {
    try { child.kill(); } catch (_) {}
  }
  process.exit(0);
}

process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);

// Don't crash on write-after-close
process.stdout.on('error', () => {});
process.stdin.on('error', () => {});

// ─── Start ───────────────────────────────────────────────────────────
process.stderr.write('🦥 Lazy Playwright proxy started — Chrome deferred until first tool call\n');
new MCPReader(process.stdin, handleParentMessage);
