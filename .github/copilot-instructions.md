# ShofferAI — GitHub Copilot Instructions

Concierge-as-a-service: AI assistant that executes real-world web tasks (hotel booking, grocery ordering) on behalf of users. The operator's laptop runs Playwright with signed-in browser profiles; the web app deploys to GCP Cloud Run.

## Architecture

```
User → HTTPS + SSE → Cloud Run (Next.js + AgentExecutor) → Azure OpenAI (LLM tool calls)
                                                          → WSS Relay → Laptop (Playwright MCP → Chrome CDP)
```

- **Cloud Run**: Chat UI, auth, payments, LLM orchestration. No browser here.
- **Operator Laptop**: All browser automation via Playwright MCP + ChromePool. Chrome Profile 3 is pre-authenticated.
- **Relay**: WebSocket bridge between cloud and laptop. Dev: cloud connects OUT. Prod: laptop connects IN via WSS.

## Tech Stack

- **Monorepo**: Turborepo + npm workspaces
- **Frontend**: Next.js 15 (App Router) + Tailwind CSS 4 + shadcn-style components
- **Auth**: Auth.js v5 (NextAuth) — credentials + Google OAuth
- **Database**: PostgreSQL via Prisma ORM
- **LLM**: Azure OpenAI via `openai` npm package (with Anthropic format translation)
- **Browser Automation**: Playwright MCP via `@modelcontextprotocol/sdk`
- **Payments**: Razorpay (UPI, cards, net banking, wallets)
- **Testing**: Vitest

## Package Structure

```
apps/web/                    → Chat UI (Cloud Run): Next.js, auth, payments, SSE streaming
  app/api/agent/execute/     → SSE endpoint — streams events to frontend
  components/chat/           → ChatInterface, MessageBubble, TaskProgress, InputPrompt
  lib/relay-client.ts        → RemoteMCPHost (dev WS client)
  lib/relay-bridge.ts        → RelayBridge (prod WS server)
  lib/session-mcp-host.ts    → Per-task tab isolation wrapper
  lib/credential-vault/      → AES-256-GCM encrypted credential storage
  lib/workflow-engine/       → Task state machine + PauseResumeManager

apps/playwright/             → Browser automation (Operator Laptop)
  src/task-manager.ts        → Spawns Copilot CLI per task, filters messages
  src/chrome-pool.ts         → ChromePool + mcpToolEvents (MCP log stream)
  src/mcp-host.ts            → Local Playwright MCP connection
  src/relay-server.ts        → WS server (dev mode)
  src/relay-outbound.ts      → WS client to Cloud Run (prod mode)

packages/agent-core/         → LLM agent logic (cloud only)
  src/agent.ts               → AgentExecutor — LLM loop, tool dispatch, skill matching
  src/azure-openai-client.ts → Azure OpenAI wrapper
  src/conversation.ts        → ConversationManager (max 20 msgs, 4000 char truncation)
  src/skills/                → Skill definitions, loader, matchSkill(), lessons

packages/shared/             → Shared types & utilities
  src/relay.ts               → RelayMessage protocol types
  src/mcp.ts                 → MCPHostLike interface
  src/internal-message-filter.ts → isInternalToolLabel() — filters tool labels from chat UI
```

## Key Interfaces

### MCPHostLike (all MCP classes implement this)
```typescript
interface MCPHostLike {
  connect(): Promise<void>;
  getTools(): Promise<MCPTool[]>;
  callTool(name: string, args: Record<string, unknown>): Promise<unknown>;
  isConnected(): boolean;
  isMCPTool(name: string): boolean;
}
```

### AgentCallbacks (execute route → SSE stream)
```typescript
interface AgentCallbacks {
  onMessage: (content: string) => void;           // Chat bubble for user
  onStepUpdate: (step: { action: string; status: string }) => void;
  onInputRequired: (request: UserInputRequest) => Promise<UserInputResponse>;
  onConfirmRequired: (details: { action: string; description: string }) => Promise<boolean>;
  onPaymentRequired?: (details: { bookingSummary: string; amountInr: number }) => Promise<boolean>;
  onComplete: (summary: string) => void;
  onError: (error: string) => void;
  onTaskHandoff?: (handoff: TaskHandoff) => Promise<void>;
}
```

### SSE Event Types (sent to frontend)
```typescript
type SSEEvent = {
  type: 'message' | 'step_update' | 'input_required' | 'payment_required' | 'complete' | 'error';
  payload: Record<string, unknown>;
};
```

## Coding Patterns

### Message filtering — what the user sees
Only natural language messages reach the chat UI. Internal tool labels are filtered:
- **Layer 1** (`task-manager.ts`): `isInternalToolLabel()` filters `assistant.message` events
- **Layer 2** (`execute/route.ts`): Defense-in-depth filter on `task_progress` before SSE
- **Layer 3** (`ChatInterface.tsx`): Frontend hides `step_update` with `status: 'running'`

Tool execution events go to `mcpToolEvents` → MCP log stream (dynamic port, printed in relay logs), not user chat.

### Relay message flow
```
Laptop TaskManager → sendToRelay(TaskRelayMessage) → Cloud Run RemoteMCPHost
  → handleTaskEvent() → SSE send() → Frontend handleSSEEvent()
```

Message types: `task_progress`, `task_input_required`, `task_payment_required`, `task_complete`, `task_error`.

### Tab isolation
Every task gets a unique `sessionId`. `SessionMCPHost` injects it into every MCP tool call. `ChromePool` maps sessions to separate Chrome tabs/instances.

### Credential handling
User credentials are AES-256-GCM encrypted at rest. `CredentialInjector` decrypts and fills them into forms — the LLM never sees raw credentials.

### Skill matching
`matchSkill(skills, userMessage)` scores user messages against skill triggers. Matched skills inject site-specific instructions and parameters into the system prompt.

### Conversation management
`ConversationManager` maintains a sliding window of max 20 messages. Tool results are truncated to 4000 characters. Old messages are pruned to stay within token limits.

## Conventions

- **TypeScript strict mode** — no `any` unless unavoidable (cast with comment)
- **Imports**: Use `@shofferai/shared` for shared types, `@shofferai/agent-core` for agent logic
- **Path aliases**: `@/` maps to `apps/web/` in the web app
- **Error handling**: Use custom error classes from `packages/shared/src/utils/errors.ts`
- **Logging**: Use `logger` from `@shofferai/shared` (levels: debug, info, warn, error). Default level is `info`.
- **Prisma**: Always run `npx prisma generate` after schema changes. Migrations via `npx prisma migrate dev`.
- **Tests**: Vitest. Run with `npx vitest run`. Test files colocated as `*.test.ts`.
- **No hardcoded ports** for Chrome — always `--remote-debugging-port=0` (OS-assigned).
- **IPv4 only** — always `127.0.0.1`, never `localhost` (macOS resolves to IPv6).

## Common Pitfalls (from docs/REPEATING-MISTAKES.md)

1. **Never open target websites directly** — always go through the chat UI for E2E testing
2. **Login first** — every site interaction must start with authentication
3. **New tab per site** — never navigate the user's chat tab to an external site
4. **Don't show tool calls to users** — internal browser actions are filtered from chat
5. **Don't hardcode Chrome ports** — use `port=0` and parse from stderr
6. **Don't retry navigation endlessly** — max 2 retries, then report error
7. **Payment before irreversible actions** — always pause for payment confirmation
8. **Credential safety** — never log or expose raw credentials; use CredentialInjector

## Environment

- `.env` at root — see `.env.example` for all variables
- `AZURE_OPENAI_ENDPOINT` / `AZURE_OPENAI_API_KEY` — LLM access
- `LLM_MODEL` — Azure deployment name (default `gpt-5.1-chat`)
- `RELAY_MODE=local` for dev, `RELAY_MODE=cloud` for production
- Ports: dev server 3000, relay 8765 (dev). TaskManager bridge and MCP logs use dynamic ports (9400-9499 range, printed in relay startup logs).

## Reference Docs

- `docs/REPEATING-MISTAKES.md` — **Read first** — known anti-patterns
- `docs/ARCHITECTURE.md` — Full system architecture with diagrams
- `docs/WORKFLOWS.md` — E2E workflow docs per skill
- `docs/PRD.md` — Product requirements
- `docs/DEPLOYMENT.md` — Cloud Run vs laptop, startup guide
