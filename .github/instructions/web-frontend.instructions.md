---
applyTo: "apps/web/**"
---

# Web Frontend — Chat UI, Auth, Payments, Relay (apps/web/)

## SSE Event Types (execute/route.ts → frontend)

| Event Type | Payload | When |
|------------|---------|------|
| `message` | `{content: string}` | LLM natural-language text for user |
| `step_update` | `{action, status}` | Milestone step completed |
| `input_required` | `{taskId, stepId, question, inputType, options?}` | Agent needs user input |
| `payment_required` | `{taskId, bookingSummary, amountCents}` | Collect payment |
| `error` | `{error: string}` | Something went wrong |
| `complete` | `{summary: string}` | Task finished |

### What the user does NOT see
Internal tool calls and status labels are filtered before reaching chat UI:
- `Browser: <toolname>`, raw tool names, status labels → filtered by `isInternalToolLabel()`
- Tool execution events → `mcpToolEvents` log stream, not SSE

## AgentCallbacks (execute route → SSE stream)

```typescript
interface AgentCallbacks {
  onMessage: (content: string) => void;
  onStepUpdate: (step: { action: string; status: string }) => void;
  onInputRequired: (request: UserInputRequest) => Promise<UserInputResponse>;
  onConfirmRequired: (details: { action: string; description: string }) => Promise<boolean>;
  onPaymentRequired?: (details: { bookingSummary: string; amountInr: number }) => Promise<boolean>;
  onComplete: (summary: string) => void;
  onError: (error: string) => void;
  onTaskHandoff?: (handoff: TaskHandoff) => Promise<void>;
}
```

## Auth (Auth.js v5 / NextAuth)

- Credentials provider + Google OAuth
- Dev login: `demo@shofferai.com` / `demo1234`
- Dev login route: `app/api/auth/dev-login/route.ts` — upserts demo user
- Login page: `app/(auth)/login/page.tsx` — has "Dev Login" button
- On prod: click "Dev Login (demo@shofferai.com)" or POST `/api/auth/dev-login` first
- NEVER ask the user for login credentials — they are in the codebase

## Payments (Razorpay)

- `PauseResumeManager` in `lib/workflow-engine/` — pauses agent, collects payment, resumes
- Payment BEFORE irreversible actions — always pause for confirmation
- L2 panel collects Razorpay payment (UPI, cards, net banking, wallets)
- Payment events: `payment_required` SSE → frontend shows payment UI → user pays → agent resumes

## Credential Vault

- AES-256-GCM encrypted at rest
- `CredentialVault.store()` encrypts → PostgreSQL `{encryptedData, iv, tag}`
- `CredentialVault.retrieve()` decrypts → `CredentialInjector.fill()` types into browser form
- LLM NEVER sees raw credentials
- Types: `SiteLoginData`, `CardData`, `UPIData`, `AddressData` (in `packages/shared/src/credentials.ts`)

## Relay (Cloud Run side)

- **Dev** (`RELAY_MODE=local`): `RemoteMCPHost` connects OUT to laptop `ws://localhost:8765`
- **Prod** (`RELAY_MODE=cloud`): `RelayBridge` accepts laptop WS IN via `custom-server.js`
- Both implement `MCPHostLike` interface — zero agent-core changes between modes
- `SessionMCPHost` wraps relay with per-task `sessionId` for tab isolation
- Relay connection is LAZY — only connect when `handoff_to_browser_agent` is called
- Never block chat if relay is down — chat must work without laptop

### Relay message flow
```
Laptop TaskManager → sendToRelay(TaskRelayMessage) → Cloud Run RemoteMCPHost
  → handleTaskEvent() → SSE send() → Frontend handleSSEEvent()
```
Message types: `task_progress`, `task_input_required`, `task_payment_required`, `task_complete`, `task_error`

## Chat UI Components

- `ChatInterface.tsx` — main chat, handles SSE events, filters `step_update` with `status: 'running'`
- `MessageBubble.tsx` — renders user/assistant messages
- `TaskProgress.tsx` — non-interactive progress display
- `InputPrompt.tsx` — interactive user input (address, choices, OTP)
- `ask_user` → ONLY renders `InputPrompt`, NEVER `TaskProgress`

## Workflow Engine

- Task state machine in `lib/workflow-engine/`
- States: created → running → paused_for_input → paused_for_payment → completed/failed
- `PauseResumeManager` handles pause/resume lifecycle

## Key Rules

- Never use singleton `taskEventHandler` — use `Map<taskId, handler>` for concurrent tasks
- `custom-server.js` handles WebSocket upgrade for relay connections
- Docker: `FROM node:20-alpine` (no Chrome, no Playwright)
- Docker: `ENV RELAY_MODE=cloud` — uses RelayBridge
