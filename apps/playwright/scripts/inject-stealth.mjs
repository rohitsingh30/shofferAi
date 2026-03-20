#!/usr/bin/env node
/**
 * inject-stealth.mjs — Standalone CDP stealth injector for shell scripts.
 *
 * Usage:  node inject-stealth.mjs <CDP_URL>
 * Example: node inject-stealth.mjs http://127.0.0.1:63148
 *
 * Connects to Chrome via CDP WebSocket and injects anti-bot-detection scripts
 * using Page.addScriptToEvaluateOnNewDocument (runs before any page JS).
 *
 * Fails gracefully with exit code 0 — stealth is nice-to-have, not critical.
 */

const CDP_URL = process.argv[2];
if (!CDP_URL) {
  process.stderr.write('Usage: node inject-stealth.mjs <CDP_URL>\n');
  process.exit(1);
}

// ── The stealth init script (same as stealth.ts STEALTH_INIT_SCRIPT) ────
const STEALTH_INIT_SCRIPT = `
(() => {
  // 1. navigator.webdriver = undefined
  Object.defineProperty(navigator, 'webdriver', {
    get: () => undefined,
    configurable: true,
  });

  // 2. Fix window.chrome object
  if (!window.chrome) window.chrome = {};
  if (!window.chrome.runtime) {
    window.chrome.runtime = {
      OnInstalledReason: {
        CHROME_UPDATE: 'chrome_update', INSTALL: 'install',
        SHARED_MODULE_UPDATE: 'shared_module_update', UPDATE: 'update',
      },
      OnRestartRequiredReason: {
        APP_UPDATE: 'app_update', OS_UPDATE: 'os_update', PERIODIC: 'periodic',
      },
      PlatformArch: {
        ARM: 'arm', ARM64: 'arm64', MIPS: 'mips', MIPS64: 'mips64',
        X86_32: 'x86-32', X86_64: 'x86-64',
      },
      PlatformNaclArch: {
        ARM: 'arm', MIPS: 'mips', MIPS64: 'mips64',
        X86_32: 'x86-32', X86_64: 'x86-64',
      },
      PlatformOs: {
        ANDROID: 'android', CROS: 'cros', LINUX: 'linux',
        MAC: 'mac', OPENBSD: 'openbsd', WIN: 'win',
      },
      RequestUpdateCheckStatus: {
        NO_UPDATE: 'no_update', THROTTLED: 'throttled',
        UPDATE_AVAILABLE: 'update_available',
      },
      connect: function() {},
      sendMessage: function() {},
    };
  }

  // 3. Fix navigator.plugins
  Object.defineProperty(navigator, 'plugins', {
    get: () => {
      const plugins = {
        0: { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
        1: { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai', description: '' },
        2: { name: 'Native Client', filename: 'internal-nacl-plugin', description: '' },
        length: 3,
        item(i) { return this[i] || null; },
        namedItem(name) { for (let i = 0; i < this.length; i++) { if (this[i].name === name) return this[i]; } return null; },
        refresh() {},
      };
      plugins[Symbol.iterator] = function*() { for (let i = 0; i < this.length; i++) yield this[i]; };
      return plugins;
    },
    configurable: true,
  });

  // 4. Fix navigator.mimeTypes
  Object.defineProperty(navigator, 'mimeTypes', {
    get: () => {
      const mimeTypes = {
        0: { type: 'application/pdf', suffixes: 'pdf', description: 'Portable Document Format' },
        1: { type: 'application/x-google-chrome-pdf', suffixes: 'pdf', description: 'Portable Document Format' },
        length: 2,
        item(i) { return this[i] || null; },
        namedItem(name) { for (let i = 0; i < this.length; i++) { if (this[i].type === name) return this[i]; } return null; },
      };
      mimeTypes[Symbol.iterator] = function*() { for (let i = 0; i < this.length; i++) yield this[i]; };
      return mimeTypes;
    },
    configurable: true,
  });

  // 5. Fix navigator.languages
  Object.defineProperty(navigator, 'languages', {
    get: () => ['en-US', 'en'],
    configurable: true,
  });

  // 6. Fix permissions API
  if (navigator.permissions && navigator.permissions.query) {
    const originalQuery = navigator.permissions.query.bind(navigator.permissions);
    navigator.permissions.query = (parameters) =>
      parameters.name === 'notifications'
        ? Promise.resolve({ state: Notification.permission })
        : originalQuery(parameters);
  }

  // 7. Fix WebGL vendor/renderer
  try {
    const getParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(parameter) {
      if (parameter === 37445) return 'Intel Inc.';
      if (parameter === 37446) return 'Intel Iris OpenGL Engine';
      return getParameter.call(this, parameter);
    };
    if (typeof WebGL2RenderingContext !== 'undefined') {
      const getParameter2 = WebGL2RenderingContext.prototype.getParameter;
      WebGL2RenderingContext.prototype.getParameter = function(parameter) {
        if (parameter === 37445) return 'Intel Inc.';
        if (parameter === 37446) return 'Intel Iris OpenGL Engine';
        return getParameter2.call(this, parameter);
      };
    }
  } catch (_) {}

  // 8. Fix connection.rtt
  if (navigator.connection) {
    try {
      Object.defineProperty(navigator.connection, 'rtt', {
        get: () => 50,
        configurable: true,
      });
    } catch (_) {}
  }

  // 9. Remove cdc_ artifacts
  const removeCdcArtifacts = () => {
    for (const prop of Object.getOwnPropertyNames(window)) {
      if (prop.match(/^\\$?cdc_/)) {
        try { delete window[prop]; } catch (_) {}
      }
    }
  };
  removeCdcArtifacts();
  setInterval(removeCdcArtifacts, 2000);

  // 10. Patch Function.prototype.toString
  const nativeToString = Function.prototype.toString;
  const patchedFunctions = new WeakSet();
  const customToString = function() {
    if (patchedFunctions.has(this)) {
      return 'function ' + (this.name || '') + '() { [native code] }';
    }
    return nativeToString.call(this);
  };
  patchedFunctions.add(customToString);
  if (navigator.permissions && navigator.permissions.query) patchedFunctions.add(navigator.permissions.query);
  try {
    patchedFunctions.add(WebGLRenderingContext.prototype.getParameter);
    if (typeof WebGL2RenderingContext !== 'undefined') patchedFunctions.add(WebGL2RenderingContext.prototype.getParameter);
  } catch (_) {}
  Function.prototype.toString = customToString;

  // 11. Fix iframes
  try {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeName === 'IFRAME' && node.contentWindow) {
            try {
              Object.defineProperty(node.contentWindow.navigator, 'webdriver', {
                get: () => undefined, configurable: true,
              });
            } catch (_) {}
          }
        }
      }
    });
    if (document.documentElement) {
      observer.observe(document.documentElement, { childList: true, subtree: true });
    }
  } catch (_) {}

  // 12. Fix hardwareConcurrency
  if (navigator.hardwareConcurrency === 0 || navigator.hardwareConcurrency === 1) {
    Object.defineProperty(navigator, 'hardwareConcurrency', {
      get: () => 8, configurable: true,
    });
  }

  // 13. Fix screen dimensions
  if (screen.width === 0 || screen.height === 0) {
    Object.defineProperty(screen, 'width', { get: () => 1920, configurable: true });
    Object.defineProperty(screen, 'height', { get: () => 1080, configurable: true });
    Object.defineProperty(screen, 'availWidth', { get: () => 1920, configurable: true });
    Object.defineProperty(screen, 'availHeight', { get: () => 1040, configurable: true });
    Object.defineProperty(screen, 'colorDepth', { get: () => 24, configurable: true });
    Object.defineProperty(screen, 'pixelDepth', { get: () => 24, configurable: true });
  }
})();
`;

// ── CDP helper ──────────────────────────────────────────────────────────

/**
 * Send a CDP command over WebSocket and wait for the matching response.
 */
function sendCommand(ws, id, method, params = {}, sessionId) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`CDP ${method} timed out`)), 5000);

    const handler = (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.id === id) {
          clearTimeout(timeout);
          ws.off('message', handler);
          resolve(msg);
        }
      } catch { /* ignore */ }
    };

    ws.on('message', handler);
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    ws.send(JSON.stringify(payload));
  });
}

/**
 * Connect to a WebSocket URL with a timeout.
 */
function connectWS(url, timeoutMs = 5000) {
  // Use ws package (available in monorepo node_modules)
  return import('ws').then(({ default: WS }) => {
    return new Promise((resolve, reject) => {
      const socket = new WS(url);
      const timeout = setTimeout(() => {
        socket.close();
        reject(new Error('WS connect timed out'));
      }, timeoutMs);

      socket.on('open', () => { clearTimeout(timeout); resolve(socket); });
      socket.on('error', (err) => { clearTimeout(timeout); reject(err); });
    });
  });
}

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
  // 1. Get browser WebSocket URL
  const versionRes = await fetch(`${CDP_URL}/json/version`);
  const versionInfo = await versionRes.json();
  const wsUrl = versionInfo.webSocketDebuggerUrl;
  if (!wsUrl) throw new Error('No webSocketDebuggerUrl in /json/version');

  // 2. Connect to browser-level WebSocket
  const ws = await connectWS(wsUrl);

  try {
    let cmdId = 1;

    // 3. Try browser-level injection first
    const res = await sendCommand(ws, cmdId++, 'Page.addScriptToEvaluateOnNewDocument', {
      source: STEALTH_INIT_SCRIPT,
    });

    if (res.error) {
      // Fallback: inject per-target
      const targetsRes = await fetch(`${CDP_URL}/json/list`);
      const targets = await targetsRes.json();

      for (const target of targets.filter(t => t.type === 'page')) {
        if (!target.webSocketDebuggerUrl) continue;
        const pageWs = await connectWS(target.webSocketDebuggerUrl);
        try {
          await sendCommand(pageWs, 1, 'Page.enable');
          await sendCommand(pageWs, 2, 'Page.addScriptToEvaluateOnNewDocument', {
            source: STEALTH_INIT_SCRIPT,
          });
          await sendCommand(pageWs, 3, 'Runtime.evaluate', {
            expression: STEALTH_INIT_SCRIPT,
            returnByValue: true,
          });
        } finally {
          pageWs.close();
        }
      }

      // Auto-attach for future targets
      await sendCommand(ws, cmdId++, 'Target.setAutoAttach', {
        autoAttach: true,
        waitForDebuggerOnStart: false,
        flatten: true,
      });
    }

    // 4. Evaluate on existing pages
    const targetsRes = await fetch(`${CDP_URL}/json/list`);
    const targets = await targetsRes.json();

    for (const target of targets.filter(t => t.type === 'page')) {
      if (!target.webSocketDebuggerUrl) continue;
      const pageWs = await connectWS(target.webSocketDebuggerUrl);
      try {
        await sendCommand(pageWs, 10, 'Page.enable');
        await sendCommand(pageWs, 11, 'Page.addScriptToEvaluateOnNewDocument', {
          source: STEALTH_INIT_SCRIPT,
        });
        await sendCommand(pageWs, 12, 'Runtime.evaluate', {
          expression: STEALTH_INIT_SCRIPT,
          returnByValue: true,
        });
      } finally {
        pageWs.close();
      }
    }

    process.stderr.write('✅ Stealth scripts injected\n');
  } finally {
    ws.close();
  }
}

main().catch((err) => {
  process.stderr.write(`⚠️  Stealth injection failed (non-fatal): ${err.message}\n`);
  // Exit 0 — stealth failure is not critical
  process.exit(0);
});
