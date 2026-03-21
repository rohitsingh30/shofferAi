---
applyTo: "apps/playwright/scripts/playwright-mcp-with-chrome.sh,apps/playwright/scripts/lazy-playwright-proxy.mjs,.mcp.json,**/mcp-host*,**/chrome-pool*,**/task-manager*"
---

# Playwright MCP — Chrome Instance Rules

> Read `docs/PLAYWRIGHT-MCP-CHROME.md` for full architecture details.

## Lazy Proxy Architecture

`.mcp.json` points to `lazy-playwright-proxy.mjs` (NOT directly to `playwright-mcp-with-chrome.sh`):

```
gh copilot → .mcp.json → lazy-playwright-proxy.mjs
  → initialize/tools/list: instant response (static tool defs, no Chrome)
  → first tools/call: spawns playwright-mcp-with-chrome.sh → Chrome launches
  → subsequent calls: proxied to child via NDJSON
```

Transport: both Copilot CLI and playwright-mcp use **NDJSON** (newline-delimited JSON) over stdio.

## Critical Rule: Per-Instance Chrome

Every `playwright-mcp-with-chrome.sh` invocation MUST get its own **dedicated Chrome instance**.

```
Each invocation → /tmp/shofferai-chrome-<PID>/
  ├── profile/
  │   ├── Local State          (cookie encryption key ref)
  │   └── Profile 3/           (rsinghtomar3011@gmail.com sessions)
  │       ├── Cookies          (signed-in sessions for Blinkit, Swiggy, Booking, etc.)
  │       ├── Login Data
  │       └── Preferences
  └── mcp-config.json          (CDP endpoint for this instance)
```

**NEVER revert to a singleton/shared Chrome pattern.** The singleton pattern caused relay tasks and QA sessions to navigate the same browser window.

## Chrome Profile: rsinghtomar3011@gmail.com

- **Source**: `~/Library/Application Support/Google/Chrome-Debug`
- **Profile**: `Profile 3` — signed in as `rsinghtomar3011@gmail.com`
- **Copy method**: Selective rsync (~26MB, <1s) — excludes caches, includes Cookies + Login Data
- **Keychain**: Chrome MUST be launched manually (NOT by Playwright) to avoid `--use-mock-keychain`
- **If sessions expire**: Open base Chrome-Debug manually, sign in, future copies inherit new sessions

## Mandatory Launch Flags

```bash
--remote-debugging-port=0          # OS picks port, parse from stderr
--remote-debugging-address=127.0.0.1
--user-data-dir=/tmp/shofferai-chrome-$$/profile
--profile-directory="Profile 3"    # rsinghtomar3011@gmail.com
```

Plus all stealth/anti-detection flags (see script).

## Never Do

- ❌ Share a Chrome window between multiple Playwright MCP sessions
- ❌ Hardcode a CDP port (always port=0, parse from stderr)
- ❌ Use `npx @playwright/mcp@latest` (use globally-installed `playwright-mcp`)
- ❌ Let Playwright launch Chrome (adds `--use-mock-keychain` → cookies unreadable)
- ❌ Save screenshots to CWD/repo (always `--output-dir /tmp/playwright-mcp-output`)
- ❌ Use any profile other than Profile 3 for agent tasks
