# Playwright MCP — Chrome Instance Management

> **TL;DR:** `.mcp.json` uses a **lazy proxy** (`lazy-playwright-proxy.mjs`) that defers Chrome launch until the first browser tool call. Chrome instances are keyed by parent PID for isolation between sessions.

## Architecture

```
gh copilot starts
  → .mcp.json spawns lazy-playwright-proxy.mjs (Node.js)
  → Proxy responds to initialize + tools/list INSTANTLY (static tool defs)
  → NO Chrome launched yet

First browser tool call (e.g. browser_navigate)
  → Proxy spawns playwright-mcp-with-chrome.sh (child)
  → Child copies Profile 3, launches Chrome, starts playwright-mcp
  → Proxy forwards tool call to child, returns result
  → All subsequent calls proxied to child
```

**Transport:** Both Copilot CLI and playwright-mcp use **NDJSON** (newline-delimited JSON) over stdio.

## The Problem (History)

ShofferAI uses Playwright MCP in multiple contexts simultaneously:

| Context | Who | Purpose |
|---------|-----|---------|
| **QA Session** | Copilot CLI (you, the developer) | Browse ShofferAI chat UI, visual QA |
| **Relay Task** | TaskManager-spawned Copilot CLI | Execute agent browser actions (Blinkit, Swiggy, etc.) |
| **Dev Loop** | Copilot CLI skill | Test skills E2E through prod chat |

### Problem 1: Chrome on every session (fixed 2026-03-21)

`.mcp.json` pointed directly to `playwright-mcp-with-chrome.sh`, which launched Chrome immediately on every `gh copilot` session — even when no browser tools were needed. Fix: lazy proxy defers Chrome until first `tools/call`.

### Problem 2: Singleton sharing (fixed 2026-03-20)

Previously, `playwright-mcp-with-chrome.sh` used a **singleton Chrome** shared by ALL Copilot CLI processes. A relay task would hijack the QA browser.

### Problem 3: Copilot double-spawn (fixed 2026-03-21)

After switching to per-PID Chrome, Copilot CLI was spawning `playwright-mcp-with-chrome.sh` **twice** from the same process (tool discovery + active use). With per-`$$` keying, this created 2 Chrome windows per session. Combined with a stale global `~/.copilot/mcp-config.json` that also defined `playwright`, users saw up to 4 Chrome windows.

## The Solution: Lazy Proxy + Parent-PID Keyed Chrome

When Chrome IS launched (on first tool call), each `playwright-mcp-with-chrome.sh` invocation keys on `$PPID` (parent process), not `$$` (script PID):

```
Copilot Session A (PID 1000)       Copilot Session B (PID 2000)
  ├─ script (PID 1001) ─┐           ├─ script (PID 2001) ─┐
  └─ script (PID 1002) ─┤           └─ script (PID 2002) ─┤
                         │                                  │
              /tmp/shofferai-chrome-1000/       /tmp/shofferai-chrome-2000/
                         │                                  │
                    Chrome A                           Chrome B
                    CDP port 59001                     CDP port 59002
```

- Both scripts from Session A share **one Chrome** (keyed on parent PID 1000)
- Session B gets its **own Chrome** (keyed on parent PID 2000)
- First invocation: copies profile, launches Chrome, writes lockfile
- Second invocation: reads lockfile, reuses existing Chrome

### Why parent-PID keyed (not per-PID or singleton)

| | Singleton (v1) | Per-PID (v2) | Parent-PID (v3, current) |
|---|---|---|---|
| **Cross-session isolation** | ❌ All share | ✅ Fully isolated | ✅ Fully isolated |
| **Same-session dedup** | ✅ One Chrome | ❌ 2 Chrome windows | ✅ One Chrome |
| **Navigation conflicts** | ❌ QA hijacked | ✅ Impossible | ✅ Impossible |
| **Memory** | ~500MB | ~1GB (2×500MB) | ~500MB |
| **Cleanup** | Complex refcount | Simple per-PID | Lockfile-based |

### Memory consideration

Each Chrome instance uses ~300-500MB RAM. With 3 concurrent sessions, that's ~1.5GB. On a modern 16GB+ machine, this is acceptable for the isolation benefit.

## Key Files

| File | Role |
|------|------|
| `apps/playwright/scripts/lazy-playwright-proxy.mjs` | **MCP proxy** — defers Chrome until first tool call (`.mcp.json` entry) |
| `apps/playwright/scripts/playwright-mcp-with-chrome.sh` | Per-instance Chrome launcher (spawned by proxy on demand) |
| `apps/playwright/src/chrome-pool.ts` | ChromePool for relay (separate per-slot Chrome instances) |
| `apps/playwright/src/mcp-host.ts` | Connects Playwright MCP to a Chrome CDP endpoint |
| `.mcp.json` | Copilot CLI MCP server config → points to `lazy-playwright-proxy.mjs` |

## Rules

1. **NEVER revert to singleton** — the sharing bug will return
2. **NEVER hardcode CDP ports** — always `--remote-debugging-port=0`, parse from stderr
3. **NEVER let Playwright launch Chrome** — always launch manually to avoid `--use-mock-keychain`
4. **ALWAYS use Profile 3** — `rsinghtomar3011@gmail.com`, pre-authenticated on all sites
5. **ALWAYS include `--output-dir /tmp/playwright-mcp-output`** in Playwright MCP launch
6. **NEVER put `playwright` in `~/.copilot/mcp-config.json`** — project `.mcp.json` is the only source; duplicates cause 2 Chrome windows
7. **NEVER point `.mcp.json` directly to `playwright-mcp-with-chrome.sh`** — always use `lazy-playwright-proxy.mjs` to avoid Chrome on every session

## Gotcha: Duplicate MCP Configs = Multiple Chrome Windows

If you see **2 empty Chrome windows** when Copilot starts, check for duplicate MCP configs:

```bash
# Project config (correct — should use the lazy proxy)
cat .mcp.json
# Expected: "command": "node", "args": ["apps/playwright/scripts/lazy-playwright-proxy.mjs"]

# Global config (should NOT contain "playwright")
cat ~/.copilot/mcp-config.json
```

The project `.mcp.json` is the single source of truth. If `~/.copilot/mcp-config.json` also defines `"playwright"`, both run and you get two Chrome instances.

## Debugging

```bash
# List all per-instance Chrome dirs
ls -la /tmp/shofferai-chrome-*/

# Check which PIDs are alive
for d in /tmp/shofferai-chrome-*/; do
  pid=$(basename "$d" | sed 's/shofferai-chrome-//')
  kill -0 "$pid" 2>/dev/null && echo "ALIVE: $d (PID $pid)" || echo "STALE: $d (PID $pid)"
done

# Find Chrome processes by instance
ps aux | grep "shofferai-chrome-" | grep -v grep

# Clean up ALL instances (nuclear option)
rm -rf /tmp/shofferai-chrome-*
```

## CDP Fiber Traversal — Testing React State Without `page.evaluate()`

Playwright MCP doesn't expose `page.evaluate()` and Chrome blocks `javascript:` URLs. To inject or inspect React state from outside the page, connect directly to Chrome's CDP endpoint.

### When to Use
- Testing UI state transitions (L2 panel open/close, cart state) when relay is unavailable
- Injecting mock data (cart items, payment state) for visual QA
- Verifying React context values after user interactions

### Steps

```bash
# 1. Find Chrome's CDP port from mcp-config.json
cat /tmp/shofferai-chrome-*/mcp-config.json
# → {"browser":{"cdpEndpoint":"http://127.0.0.1:<PORT>"}}

# 2. List pages via CDP HTTP API
curl http://127.0.0.1:<PORT>/json

# 3. Connect via WebSocket and evaluate JS
node -e "
const WebSocket = require('ws');
const ws = new WebSocket('ws://127.0.0.1:<PORT>/devtools/page/<PAGE_ID>');
ws.on('open', () => {
  ws.send(JSON.stringify({
    id: 1,
    method: 'Runtime.evaluate',
    params: { expression: 'document.title', returnByValue: true }
  }));
});
ws.on('message', (data) => {
  const msg = JSON.parse(data.toString());
  if (msg.id === 1) { console.log(msg.result); ws.close(); process.exit(0); }
});
"
```

### React Fiber Traversal Pattern

To access React context values (CartContext, L2CartContext, etc.), walk the fiber tree from the root:

```javascript
// Find React fiber root on <html> element
const html = document.documentElement;
const fiberKey = Object.keys(html).find(k => k.startsWith('__reactFiber'));
let fiber = html[fiberKey];

// Walk tree to find context providers
function walk(f, depth) {
  if (!f || depth > 100) return;
  if (f.memoizedProps?.value) {
    const v = f.memoizedProps.value;
    // CartContext: has addItem, clearCart, items
    // L2CartContext: has openCart, closeCart, l2CartState
    // L2PaymentContext: has openL2, closeL2, l2State
  }
  walk(f.child, depth + 1);
  walk(f.sibling, depth + 1);
}
walk(fiber, 0);
```

**Typical depths:** CartContext ~48, L2CartContext ~52 (may vary with component tree changes).
