# Playwright MCP — Chrome Instance Management

> **TL;DR:** Chrome instances are keyed by PARENT PID. Copilot's two MCP spawns share one Chrome; different Copilot sessions get isolated Chrome instances.

## The Problem

ShofferAI uses Playwright MCP in multiple contexts simultaneously:

| Context | Who | Purpose |
|---------|-----|---------|
| **QA Session** | Copilot CLI (you, the developer) | Browse ShofferAI chat UI, visual QA |
| **Relay Task** | TaskManager-spawned Copilot CLI | Execute agent browser actions (Blinkit, Swiggy, etc.) |
| **Dev Loop** | Copilot CLI skill | Test skills E2E through prod chat |

### Problem 1: Singleton sharing (fixed 2026-03-20)

Previously, `playwright-mcp-with-chrome.sh` used a **singleton Chrome** shared by ALL Copilot CLI processes. A relay task would hijack the QA browser.

### Problem 2: Copilot double-spawn (fixed 2026-03-21)

After switching to per-PID Chrome, Copilot CLI was spawning `playwright-mcp-with-chrome.sh` **twice** from the same process (tool discovery + active use). With per-`$$` keying, this created 2 Chrome windows per session. Combined with a stale global `~/.copilot/mcp-config.json` that also defined `playwright`, users saw up to 4 Chrome windows.

## The Solution: Parent-PID Keyed Chrome

Each `playwright-mcp-with-chrome.sh` invocation keys on `$PPID` (parent Copilot process), not `$$` (script PID):

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

### How it works

1. **Key**: Instance dir keyed on `$PPID` (parent Copilot binary PID)
2. **First invocation**: Copies `Chrome-Debug/Profile 3` → `/tmp/shofferai-chrome-$PPID/profile/`, launches Chrome, writes CDP port to lockfile
3. **Second invocation**: Reads lockfile, verifies Chrome is alive, reuses CDP port (no new Chrome)
4. **Connect**: Both Playwright MCP instances connect via CDP to the same Chrome
5. **Cleanup**: Only the invocation that launched Chrome kills it on exit

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
