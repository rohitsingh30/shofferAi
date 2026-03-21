# Playwright MCP — Chrome Instance Management

> **TL;DR:** Every Playwright MCP invocation gets its OWN Chrome. Never share.

## The Problem

ShofferAI uses Playwright MCP in multiple contexts simultaneously:

| Context | Who | Purpose |
|---------|-----|---------|
| **QA Session** | Copilot CLI (you, the developer) | Browse ShofferAI chat UI, visual QA |
| **Relay Task** | TaskManager-spawned Copilot CLI | Execute agent browser actions (Blinkit, Swiggy, etc.) |
| **Dev Loop** | Copilot CLI skill | Test skills E2E through prod chat |

Previously, `playwright-mcp-with-chrome.sh` used a **singleton Chrome** — one Chrome instance in `/tmp/shofferai-chrome-singleton/` shared by ALL Copilot CLI processes via reference counting.

### What went wrong

When a QA session and a relay task ran simultaneously:

```
QA Session (Copilot CLI)       Relay Task (spawned CLI)
         │                              │
         └──────────┬───────────────────┘
                    │
          SINGLETON CHROME (one window)
          CDP port shared by both
                    │
    ┌───────────────┼───────────────────┐
    │               │                   │
  Tab 1           Tab 2              Tab 3
  ShofferAI       Blinkit.com        about:blank
  (QA viewing)    (agent navigated)
```

The relay task navigated to Blinkit in the **same Chrome** the QA session was viewing. The QA browser got hijacked.

## The Solution: Per-Instance Chrome

Each `playwright-mcp-with-chrome.sh` invocation now creates a **dedicated Chrome** in `/tmp/shofferai-chrome-<PID>/`:

```
QA Session (PID 1234)          Relay Task (PID 5678)
         │                              │
  /tmp/shofferai-chrome-1234/   /tmp/shofferai-chrome-5678/
         │                              │
    Chrome A                       Chrome B
    CDP port 59001                 CDP port 59002
         │                              │
    ShofferAI UI                   Blinkit.com
    (QA, undisturbed)              (agent task)
```

### How it works

1. **Launch**: Each invocation copies `Chrome-Debug/Profile 3` → `/tmp/shofferai-chrome-$$/profile/`
2. **Chrome**: Launches with `--remote-debugging-port=0` (OS picks port), parses port from stderr
3. **Connect**: Playwright MCP connects via CDP to THIS Chrome only
4. **Cleanup**: On exit (EXIT/INT/TERM trap), kills Chrome + removes temp dir
5. **Stale cleanup**: Finds `/tmp/shofferai-chrome-*` dirs older than 2 hours with dead PIDs

### Why per-instance (not singleton)

| | Singleton (OLD) | Per-Instance (NEW) |
|---|---|---|
| **Isolation** | ❌ All sessions share one Chrome | ✅ Each session has its own |
| **Navigation conflicts** | ❌ Agent task hijacks QA browser | ✅ Impossible — different processes |
| **Cleanup** | Complex reference counting | Simple: kill own Chrome on exit |
| **Memory** | ~500MB shared | ~500MB per instance |
| **Profile** | One copy, shared | One copy per instance (~26MB, <1s) |
| **Failure blast radius** | Chrome crash kills ALL sessions | Chrome crash only affects one |

### Memory consideration

Each Chrome instance uses ~300-500MB RAM. With 3 concurrent sessions, that's ~1.5GB. On a modern 16GB+ machine, this is acceptable for the isolation benefit.

## Key Files

| File | Role |
|------|------|
| `apps/playwright/scripts/playwright-mcp-with-chrome.sh` | Per-instance Chrome launcher (used by `.mcp.json`) |
| `apps/playwright/src/chrome-pool.ts` | ChromePool for relay (separate per-slot Chrome instances) |
| `apps/playwright/src/mcp-host.ts` | Connects Playwright MCP to a Chrome CDP endpoint |
| `.mcp.json` | Copilot CLI MCP server config → points to `playwright-mcp-with-chrome.sh` |

## Rules

1. **NEVER revert to singleton** — the sharing bug will return
2. **NEVER hardcode CDP ports** — always `--remote-debugging-port=0`, parse from stderr
3. **NEVER let Playwright launch Chrome** — always launch manually to avoid `--use-mock-keychain`
4. **ALWAYS use Profile 3** — `rsinghtomar3011@gmail.com`, pre-authenticated on all sites
5. **ALWAYS include `--output-dir /tmp/playwright-mcp-output`** in Playwright MCP launch
6. **NEVER put `playwright` in `~/.copilot/mcp-config.json`** — project `.mcp.json` is the only source; duplicates cause 2 Chrome windows

## Gotcha: Duplicate MCP Configs = Multiple Chrome Windows

If you see **2 empty Chrome windows** when Copilot starts, check for duplicate MCP configs:

```bash
# Project config (correct — should be the ONLY source of playwright MCP)
cat .mcp.json

# Global config (should NOT contain "playwright")
cat ~/.copilot/mcp-config.json
```

The project `.mcp.json` is the single source of truth. If `~/.copilot/mcp-config.json` also defines `"playwright"`, both run and you get two Chrome instances. The global config may also use the anti-pattern `npx @playwright/mcp@latest` which lets Playwright auto-launch Chrome with `--use-mock-keychain` (breaks cookie sessions).

**Fix:** Remove `"playwright"` from `~/.copilot/mcp-config.json`.

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
