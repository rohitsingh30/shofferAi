# ShofferAI

Concierge-as-a-service: AI assistant that executes real-world web tasks (hotel booking, grocery ordering) on behalf of users via browser automation.

## Architecture

```
User → HTTPS + SSE → Cloud Run (Next.js + AgentExecutor) → Azure OpenAI (LLM tool calls)
                                                          → WSS Relay → Laptop (Playwright MCP → Chrome CDP)
```

- **Cloud Run**: Chat UI, auth, payments, LLM orchestration. No browser here.
- **Operator Laptop**: All browser automation via Playwright MCP + ChromePool. Chrome Profile 3 is pre-authenticated.
- **Relay**: WebSocket bridge. Dev: cloud connects OUT to laptop :8765. Prod: laptop connects IN to Cloud Run via WSS.

## Tech Stack

- **Monorepo**: Turborepo + npm workspaces
- **Frontend**: Next.js 15 (App Router) + Tailwind CSS 4 + shadcn-style components
- **Auth**: Auth.js v5 (NextAuth) — credentials + Google OAuth
- **Database**: PostgreSQL via Prisma ORM (Cloud SQL in prod)
- **LLM**: Azure OpenAI via `openai` npm package (with Anthropic format translation)
- **Browser**: Playwright MCP via `@modelcontextprotocol/sdk` (laptop only)
- **Payments**: Razorpay (UPI, cards, net banking, wallets)
- **Testing**: Vitest — `npx vitest run`, colocated `*.test.ts`

## Package Structure

```
apps/web/                    → Chat UI (Cloud Run)
  app/api/agent/execute/     → SSE endpoint — streams events to frontend
  lib/relay-bridge.ts        → RelayBridge: accepts laptop WS (prod)
  lib/relay-client.ts        → RemoteMCPHost: WS client to laptop (dev)
  lib/session-mcp-host.ts    → Per-task tab isolation wrapper
  lib/credential-vault/      → AES-256-GCM encrypted credential storage
  lib/workflow-engine/       → Task state machine + PauseResumeManager

apps/playwright/             → Browser automation (Operator Laptop)
  src/chrome-pool.ts         → ChromePool: lazy Chrome instances, OS-assigned ports
  src/task-manager.ts        → Spawns Copilot CLI per task, filters messages
  src/mcp-host.ts            → Local Playwright MCP connection
  src/relay-outbound.ts      → WS client to Cloud Run (prod)
  src/relay-server.ts        → WS server (dev)

packages/agent-core/         → LLM agent logic (cloud only)
  src/agent.ts               → AgentExecutor — LLM loop, tool dispatch
  src/message-rewriter.ts    → MessageRewriter — AI rewrite layer for browser agent messages
  src/conversation.ts        → ConversationManager (max 20 msgs, 4000 char truncation)
  src/skills/                → 500 skill definitions (SKILL.md), loader, matchSkill()
  src/scripts/               → ScriptRecorder/Compiler/Player — cached execution

packages/shared/             → Types, logger, errors, relay protocol, MCPHostLike
```

## Commands

```bash
npx turbo build              # Build all packages
npx vitest run               # Run tests
cd apps/web && npx next dev  # Dev server (:3000)
npx prisma migrate dev       # Run DB migrations
npx prisma generate          # Regenerate Prisma client
gcloud builds submit --config cloudbuild.yaml  # Deploy to Cloud Run
```

## Conventions

- TypeScript strict mode — no `any` unless unavoidable (cast with comment)
- Imports: `@shofferai/shared` for shared types, `@shofferai/agent-core` for agent logic
- Path aliases: `@/` maps to `apps/web/`
- Error handling: custom classes from `packages/shared/src/utils/errors.ts`
- Logging: `logger` from `@shofferai/shared` (levels: debug, info, warn, error)
- IPv4 only — always `127.0.0.1`, never `localhost` (macOS resolves to IPv6)

## Environment

- `.env` at root — see `.env.example`
- `AZURE_OPENAI_ENDPOINT` / `AZURE_OPENAI_API_KEY` — LLM access
- `LLM_MODEL` — Azure deployment name (default `gpt-5.1-chat`)
- `REWRITER_MODEL` — Optional fast/cheap model for message rewriting (default: `LLM_MODEL`). Set to `gpt-4o-mini` for cost savings.
- `RELAY_MODE=local` for dev, `RELAY_MODE=cloud` for production
- Dev server :3000, relay :8765 (dev). TaskManager bridge: dynamic port 9400-9499 (printed in logs).

## Mandatory Skills

- Always activate `/cofounder` mode at the start of every conversation before doing any work
- After ANY UI change, run `/dev-loop` to self-test with Playwright MCP
- When creating a new E2E workflow/skill, use `/dev-loop` mode B

## Testing — ALWAYS on Production

- **Prod URL**: `https://shofferai-27188185100.asia-south1.run.app`
- Deploy first (`/deploy`), then test on prod. NEVER test on localhost for functional flows.
- localhost is ONLY for rapid CSS/layout iteration — no message sending, no agent flows.
- After deploy, wait 30 seconds before E2E testing (relay reconnect delay).
- Dev login: `demo@shofferai.com` / `demo1234` — see `apps/web/app/api/auth/dev-login/route.ts`

## Critical Rules (NEVER violate these)

These are the top mistakes from `docs/REPEATING-MISTAKES.md`. Breaking any of these wastes hours.

### Ports & Infrastructure
1. **NEVER hardcode Chrome ports** — always `--remote-debugging-port=0`, parse port from stderr
2. **NEVER curl localhost ports** to check service health — operator manages services manually
3. **NEVER use `open` command** to launch browsers — you can't interact with them
4. **NEVER use `npx @playwright/mcp@latest`** — use the globally-installed `playwright-mcp` binary
5. **NEVER trust `/tmp/shofferai-relay.log`** for relay status — check `lsof` for ports 9400-9499 instead
6. **NEVER start, stop, or restart the laptop relay** — the operator manages the relay lifecycle manually. If the relay is down, inform the operator and wait.

### Browser Automation
6. **Login FIRST** — every site interaction must start with authentication
7. **New tab per site** — never navigate the user's chat tab to an external site
8. **Max 2 retries** — if same action fails twice, STOP and report error to user
9. **Always use SessionMCPHost** with unique `sessionId` for tab isolation
10. **Every Playwright MCP launch MUST include `--output-dir /tmp/playwright-mcp-output`**
11. **Each Playwright MCP gets its OWN Chrome** — `playwright-mcp-with-chrome.sh` creates per-instance Chrome in `/tmp/shofferai-chrome-<PID>/`. Never share Chrome between sessions.
12. **Chrome is lazy** — `.mcp.json` uses `lazy-playwright-proxy.mjs` which defers Chrome launch until first browser tool call. Never point `.mcp.json` directly at `playwright-mcp-with-chrome.sh`.

### User Experience
11. **NEVER show tool calls to users** — only show: questions, choices, results, errors, confirmations
12. **Extract params from user's message FIRST** — only `ask_user` for genuinely missing info
13. **NEVER re-ask info already provided** — dates, location, preferences are in the conversation
14. **`ask_user` fires ONLY `onInputRequired()`** — never `onStepUpdate()` (breaks UI)
15. **Payment before irreversible actions** — always pause for payment confirmation

### Development Process
16. **Read docs before coding** — read relevant skill files and this instructions file first
17. **Trace FULL code path before fixing** — ONE comprehensive commit, not six incremental guesses
18. **Test E2E through chat interface** — build passing ≠ feature working
19. **Update instructions after architecture changes** — in the SAME commit
20. **NEVER open target websites directly** (booking.com, swiggy.com) — always go through chat UI
21. **Plain .md files are NOT bundled by Next.js** — COPY them explicitly in Dockerfile
22. **Never use singleton patterns for per-task state** — key handlers/callbacks by taskId
23. **Credential safety** — never log or expose raw credentials; use CredentialInjector
24. **Screenshots go to `/tmp/` or session folder** — NEVER save to repo root
25. **Relay connection must be LAZY** — only connect when `handoff_to_browser_agent` is called
26. **Retry/fallback logic must mutate state** — never retry with a `const` value; always increment counters, cap max attempts, and give up gracefully

## Documentation & Session Logging (MANDATORY)

Every Copilot CLI session MUST follow these rules:

### Always Update Documentation
- When changing architecture, update `docs/ARCHITECTURE.md` in the SAME commit
- When changing workflows or skills, update `docs/WORKFLOWS.md` or the relevant `SKILL.md`
- When changing deployment, update `docs/DEPLOYMENT.md`
- When adding new anti-patterns or lessons learned, update `docs/REPEATING-MISTAKES.md`
- When changing instructions files (`.github/copilot-instructions.md` or `.github/instructions/*.md`), ensure they match the actual code
- **Rule of thumb**: if a doc describes something you just changed, update the doc too

### Session Log (`docs/SESSION-LOG.md`)
- At the END of every session (before final commit), append an entry to `docs/SESSION-LOG.md`
- Each entry MUST include: date, goal, what was done, files changed, key decisions
- Leave a "What worked / what didn't" section for the developer to fill in later
- Newest sessions go at the TOP (right after the header)
- The developer will review these logs and add feedback — this is a critical learning loop
- When starting a new session, READ the latest 3-5 entries to learn from past feedback

### Session Log Entry Format
```markdown
## YYYY-MM-DD — Short title

**Goal**: What the session set out to accomplish.

**What was done**:
- Bullet list of changes made

**Files changed**:
- `path/to/file` (created/updated/deleted — brief note)

**Key decisions**:
- Any architectural or design choices worth remembering

**What worked / what didn't** *(fill in after review)*:
- 
```

## Reference Docs

- `docs/REPEATING-MISTAKES.md` — Full details on all anti-patterns above
- `docs/ARCHITECTURE.md` — System architecture with Mermaid diagrams
- `docs/WORKFLOWS.md` — E2E workflow docs per skill (Booking.com, Blinkit, Zomato)
- `docs/DEPLOYMENT.md` — Cloud Run vs laptop, startup guide, LaunchAgent setup
- `docs/MESSAGE-REWRITE-LAYER.md` — Two-tier message filtering architecture (regex + AI rewrite)
- `docs/PRD.md` — Product requirements
- `docs/SESSION-LOG.md` — Development session log (review & feedback loop)
