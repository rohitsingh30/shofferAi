/**
 * CDP Stealth Module — Bypasses bot detection (Akamai, Cloudflare, PerimeterX, etc.)
 *
 * Injection points:
 *   1. ChromePool.initSlot()  — between waitForCDP() and new MCPHost()
 *   2. playwright-mcp-with-chrome.sh — via inject-stealth.mjs helper
 *
 * Architecture:
 *   Chrome launched → CDP port parsed → Stealth injected via CDP → Playwright MCP connects
 *
 * Uses Page.addScriptToEvaluateOnNewDocument via the browser-level CDP WebSocket
 * to ensure the stealth script runs BEFORE any page JavaScript on every navigation.
 */

import WebSocket from 'ws';
import { logger } from '@shofferai/shared';

// ---------------------------------------------------------------------------
// A. Additional Chrome launch arguments for stealth
// ---------------------------------------------------------------------------
export const STEALTH_CHROME_ARGS: string[] = [
  '--disable-blink-features=AutomationControlled',
  '--disable-infobars',
  // Suppress Google identity "Verify it's you" prompts on cloned profiles
  '--disable-features=AutomationControlled,SigninInterceptBubble,IdentityStatusConsistency,OptimizationGuideModelDownloading,OptimizationHintsFetching',
  '--disable-ipc-flooding-protection',
  '--disable-popup-blocking',
  '--noerrdialogs',
  '--disable-gaia-services',
];

// ---------------------------------------------------------------------------
// B. Comprehensive JavaScript init script — handles ALL known detection vectors
// ---------------------------------------------------------------------------
export const STEALTH_INIT_SCRIPT = `
(() => {
  // ── 1. navigator.webdriver = undefined (not just false) ──────────────
  Object.defineProperty(navigator, 'webdriver', {
    get: () => undefined,
    configurable: true,
  });

  // ── 2. Fix window.chrome object (incomplete in automated Chrome) ─────
  if (!window.chrome) window.chrome = {};
  if (!window.chrome.runtime) {
    window.chrome.runtime = {
      OnInstalledReason: {
        CHROME_UPDATE: 'chrome_update',
        INSTALL: 'install',
        SHARED_MODULE_UPDATE: 'shared_module_update',
        UPDATE: 'update',
      },
      OnRestartRequiredReason: {
        APP_UPDATE: 'app_update',
        OS_UPDATE: 'os_update',
        PERIODIC: 'periodic',
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

  // ── 3. Fix navigator.plugins (empty in automated Chrome) ─────────────
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

  // ── 4. Fix navigator.mimeTypes ───────────────────────────────────────
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

  // ── 5. Fix navigator.languages ───────────────────────────────────────
  Object.defineProperty(navigator, 'languages', {
    get: () => ['en-US', 'en'],
    configurable: true,
  });

  // ── 6. Fix permissions API (notifications query) ─────────────────────
  if (navigator.permissions && navigator.permissions.query) {
    const originalQuery = navigator.permissions.query.bind(navigator.permissions);
    navigator.permissions.query = (parameters) =>
      parameters.name === 'notifications'
        ? Promise.resolve({ state: Notification.permission })
        : originalQuery(parameters);
  }

  // ── 7. Fix WebGL vendor/renderer (SwiftShader = headless giveaway) ──
  try {
    const getParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(parameter) {
      if (parameter === 37445) return 'Intel Inc.';           // UNMASKED_VENDOR_WEBGL
      if (parameter === 37446) return 'Intel Iris OpenGL Engine'; // UNMASKED_RENDERER_WEBGL
      return getParameter.call(this, parameter);
    };
    // Also patch WebGL2
    if (typeof WebGL2RenderingContext !== 'undefined') {
      const getParameter2 = WebGL2RenderingContext.prototype.getParameter;
      WebGL2RenderingContext.prototype.getParameter = function(parameter) {
        if (parameter === 37445) return 'Intel Inc.';
        if (parameter === 37446) return 'Intel Iris OpenGL Engine';
        return getParameter2.call(this, parameter);
      };
    }
  } catch (_) { /* WebGL not available — ignore */ }

  // ── 8. Fix connection.rtt (rtt=0 in automated browsers) ──────────────
  if (navigator.connection) {
    try {
      Object.defineProperty(navigator.connection, 'rtt', {
        get: () => 50,
        configurable: true,
      });
    } catch (_) { /* read-only in some browsers */ }
  }

  // ── 9. Remove cdc_ artifacts (chromedriver global variables) ─────────
  const removeCdcArtifacts = () => {
    for (const prop of Object.getOwnPropertyNames(window)) {
      if (prop.match(/^\\$?cdc_/)) {
        try { delete window[prop]; } catch (_) {}
      }
    }
  };
  removeCdcArtifacts();
  setInterval(removeCdcArtifacts, 2000);

  // ── 10. Patch Function.prototype.toString for modified natives ────────
  // Bot detectors call fn.toString() and check for "[native code]"
  const nativeToString = Function.prototype.toString;
  const patchedFunctions = new WeakSet();

  const customToString = function() {
    if (patchedFunctions.has(this)) {
      return 'function ' + (this.name || '') + '() { [native code] }';
    }
    return nativeToString.call(this);
  };
  patchedFunctions.add(customToString);

  // Mark previously patched functions
  if (navigator.permissions && navigator.permissions.query) {
    patchedFunctions.add(navigator.permissions.query);
  }
  try {
    patchedFunctions.add(WebGLRenderingContext.prototype.getParameter);
    if (typeof WebGL2RenderingContext !== 'undefined') {
      patchedFunctions.add(WebGL2RenderingContext.prototype.getParameter);
    }
  } catch (_) {}

  Function.prototype.toString = customToString;

  // ── 11. Fix iframe contentWindow (some detectors create iframes) ─────
  try {
    const origCreateElement = document.createElement.bind(document);
    // Ensure new iframes also get webdriver=undefined
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeName === 'IFRAME' && node.contentWindow) {
            try {
              Object.defineProperty(node.contentWindow.navigator, 'webdriver', {
                get: () => undefined,
                configurable: true,
              });
            } catch (_) { /* cross-origin — ignore */ }
          }
        }
      }
    });
    if (document.documentElement) {
      observer.observe(document.documentElement, { childList: true, subtree: true });
    }
  } catch (_) {}

  // ── 12. Fix navigator.hardwareConcurrency (sometimes 0 in headless) ──
  if (navigator.hardwareConcurrency === 0 || navigator.hardwareConcurrency === 1) {
    Object.defineProperty(navigator, 'hardwareConcurrency', {
      get: () => 8,
      configurable: true,
    });
  }

  // ── 13. Fix screen dimensions (headless often has unusual values) ────
  // Only patch if obviously headless (0 or very small values)
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

// ---------------------------------------------------------------------------
// C. CDP injection function — connects to Chrome's browser-level WS endpoint
// ---------------------------------------------------------------------------

interface CDPResponse {
  id: number;
  result?: Record<string, unknown>;
  error?: { code: number; message: string };
}

/**
 * Send a single CDP command over a WebSocket connection and wait for the response.
 */
function sendCDPCommand(
  ws: WebSocket,
  id: number,
  method: string,
  params: Record<string, unknown> = {},
): Promise<CDPResponse> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`CDP command ${method} timed out`)), 5000);

    const handler = (data: WebSocket.Data) => {
      try {
        const msg = JSON.parse(data.toString()) as CDPResponse;
        if (msg.id === id) {
          clearTimeout(timeout);
          ws.off('message', handler);
          resolve(msg);
        }
      } catch {
        // Not our message — ignore
      }
    };

    ws.on('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

/**
 * Inject stealth scripts into Chrome via CDP before any page loads.
 *
 * Connects to the browser-level WebSocket endpoint and uses:
 *   - Page.addScriptToEvaluateOnNewDocument — runs on every new document
 *   - Runtime.evaluate — runs on the current page (for already-loaded about:blank)
 *
 * Fails gracefully — stealth is nice-to-have, not critical.
 */
export async function injectStealthViaCDP(cdpPort: number): Promise<void> {
  const label = `stealth:${cdpPort}`;

  try {
    // 1. Get the browser WebSocket URL
    const versionRes = await fetch(`http://127.0.0.1:${cdpPort}/json/version`, {
      signal: AbortSignal.timeout(3000),
    });
    const versionInfo = (await versionRes.json()) as { webSocketDebuggerUrl?: string };
    const wsUrl = versionInfo.webSocketDebuggerUrl;

    if (!wsUrl) {
      logger.warn(`[${label}] No webSocketDebuggerUrl in /json/version — skipping stealth`);
      return;
    }

    // 2. Connect via WebSocket to the BROWSER endpoint (not a page)
    const ws = await new Promise<WebSocket>((resolve, reject) => {
      const socket = new WebSocket(wsUrl);
      const timeout = setTimeout(() => {
        socket.close();
        reject(new Error('WebSocket connection timed out'));
      }, 5000);

      socket.on('open', () => {
        clearTimeout(timeout);
        resolve(socket);
      });
      socket.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });

    try {
      let cmdId = 1;

      // 3. Inject stealth script for ALL future documents
      const addScriptRes = await sendCDPCommand(ws, cmdId++, 'Page.addScriptToEvaluateOnNewDocument', {
        source: STEALTH_INIT_SCRIPT,
      });

      if (addScriptRes.error) {
        // Browser-level endpoint may not support Page domain directly.
        // Fall back to per-target injection via Target domain.
        logger.debug(`[${label}] Browser-level Page.addScript failed, using Target approach`);

        // Get all targets (pages)
        const targetsRes = await fetch(`http://127.0.0.1:${cdpPort}/json/list`, {
          signal: AbortSignal.timeout(3000),
        });
        const targets = (await targetsRes.json()) as Array<{
          id: string;
          type: string;
          webSocketDebuggerUrl?: string;
        }>;

        const pageTargets = targets.filter((t) => t.type === 'page');

        for (const target of pageTargets) {
          if (!target.webSocketDebuggerUrl) continue;
          await injectStealthIntoTarget(target.webSocketDebuggerUrl);
        }

        // Auto-attach to future targets so they also get stealth injection
        await sendCDPCommand(ws, cmdId++, 'Target.setAutoAttach', {
          autoAttach: true,
          waitForDebuggerOnStart: false,
          flatten: true,
        });

        // Listen for new targets and inject into them
        // (The auto-attach will send Target.attachedToTarget events)
        // We set up a short-lived listener that injects into any new pages
        const injectOnAttach = (data: WebSocket.Data) => {
          try {
            const msg = JSON.parse(data.toString());
            if (msg.method === 'Target.attachedToTarget') {
              const sessionId = msg.params?.sessionId;
              if (sessionId) {
                // Inject via the session
                ws.send(
                  JSON.stringify({
                    id: cmdId++,
                    method: 'Page.addScriptToEvaluateOnNewDocument',
                    params: { source: STEALTH_INIT_SCRIPT },
                    sessionId,
                  }),
                );
                ws.send(
                  JSON.stringify({
                    id: cmdId++,
                    method: 'Runtime.evaluate',
                    params: { expression: STEALTH_INIT_SCRIPT, returnByValue: true },
                    sessionId,
                  }),
                );
              }
            }
          } catch {
            // ignore parse errors
          }
        };

        ws.on('message', injectOnAttach);

        // Keep the WebSocket open for a short time to catch early target attachments
        await new Promise((r) => setTimeout(r, 500));
        ws.off('message', injectOnAttach);
      }

      // 4. Also evaluate on the current about:blank page (already loaded)
      // Get page targets and inject immediately
      const targetsRes = await fetch(`http://127.0.0.1:${cdpPort}/json/list`, {
        signal: AbortSignal.timeout(3000),
      });
      const targets = (await targetsRes.json()) as Array<{
        id: string;
        type: string;
        webSocketDebuggerUrl?: string;
      }>;

      for (const target of targets.filter((t) => t.type === 'page')) {
        if (!target.webSocketDebuggerUrl) continue;
        await injectStealthIntoTarget(target.webSocketDebuggerUrl);
      }

      logger.info(`[${label}] Stealth scripts injected successfully`);
    } finally {
      ws.close();
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.warn(`[${label}] Stealth injection failed (non-fatal): ${msg}`);
  }
}

/**
 * Inject stealth into a specific page target via its WebSocket URL.
 */
async function injectStealthIntoTarget(wsUrl: string): Promise<void> {
  const ws = await new Promise<WebSocket>((resolve, reject) => {
    const socket = new WebSocket(wsUrl);
    const timeout = setTimeout(() => {
      socket.close();
      reject(new Error('Target WS timed out'));
    }, 3000);

    socket.on('open', () => {
      clearTimeout(timeout);
      resolve(socket);
    });
    socket.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });

  try {
    // Enable Page domain, add script for future navigations, evaluate on current page
    await sendCDPCommand(ws, 1, 'Page.enable');
    await sendCDPCommand(ws, 2, 'Page.addScriptToEvaluateOnNewDocument', {
      source: STEALTH_INIT_SCRIPT,
    });
    await sendCDPCommand(ws, 3, 'Runtime.evaluate', {
      expression: STEALTH_INIT_SCRIPT,
      returnByValue: true,
    });
  } finally {
    ws.close();
  }
}
