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

### Order-related step_update statuses
| Status | Trigger | DB Side-effect |
|--------|---------|----------------|
| `order_placed` | Agent completes checkout | `handleCheckoutSuccess()` → updates Order status, sets `placedAt` |
| `order_failed` | Checkout fails on target site | `handleCheckoutFailure()` → auto-refund, sets `cancelledAt` |
| `order_status` | Agent reports delivery update | `handleOrderStatusUpdate()` → transition validation, timestamp mapping, history recording |

The `execute/route.ts` `onStepUpdate` callback handles all three: finds Order by `taskId`, calls the appropriate handler from `lib/order-operations.ts`, fires SSE to frontend. Errors are logged but don't block SSE delivery.

### What the user does NOT see
Internal tool calls, status labels, and agent narration are filtered before reaching the chat UI via a two-tier architecture:
- **Tier 1 (Regex)**: `shouldSuppressMessage()` catches ~90% instantly — tool labels, narration (`"I can see..."`, `"Let me click..."`), reasoning (`"Step 0 asks..."`). Splits multi-sentence messages, strips filler prefixes.
- **Tier 2 (AI rewrite)**: `MessageRewriter` sends ambiguous messages through a lightweight LLM (`gpt-4o-mini`) that either SUPPRESSes or rewrites into clean user-facing text.
- Tool execution events → `mcpToolEvents` log stream, not SSE
- Regex filter: `packages/shared/src/internal-message-filter.ts`
- AI rewriter: `packages/agent-core/src/message-rewriter.ts`

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

## Cart & L2 Split View

- **CartContext** (`CartContext.tsx`) — client-side cart (items, store, add/remove/clear). Single-store enforcement — adding from different store clears previous items
- **L2CartContext** (`L2CartContext.tsx`) — cart panel state machine: `CLOSED → OPENING (300ms) → OPEN → CLOSING (300ms) → CLOSED`
- **L2PaymentContext** (`L2PaymentContext.tsx`) — payment panel state (same state machine)
- **L2SplitView** — 60% chat / 40% panel. Payment panel takes priority over cart panel
- **CartBar** — floating bar above input when cart is non-empty; click summary area to open L2CartPanel, click "Continue →" to submit to agent
- **ProductCardInput** — rich product card with "Add to Cart" → `CartContext.addItem()`
- **"New Chat" reset** — `resetChat()` calls `closeL2()` + `closeCart()` + `clearCart()` — always clears all L2 state

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

### Deploy auto-heal
- `cloudbuild.yaml` pre-deploy step curls `POST /api/admin/release-relay` → force-closes laptop WS → laptop reconnects to new instance in 1-4s
- `custom-server.js` sets `draining = true` on SIGTERM → rejects new WS upgrades with HTTP 503 → prevents laptop from reconnecting to dying instance
- `relay-bridge.ts` `gracefulClose()` sends `{ type: 'server_draining' }` message before close frame → laptop terminates immediately + 1s reconnect
- Stale detection: `relay-outbound.ts` detects no app-level messages for 25s → auto-terminates → reconnects
- **HTTP phantom detection**: `relay-outbound.ts` GETs `/api/admin/relay-status` every 30s via HTTP (always hits ACTIVE instance). If `connected: false` but WS is open → draining phantom → terminate → reconnect. Definitive fix for FM2.
- `custom-server.js` has early WS queue (handles laptop connecting before RelayBridge singleton initializes) + SIGTERM handler (sets draining flag, sends server_draining, graceful close + 2s hard terminate)

### Relay message flow
```
Laptop TaskManager → sendToRelay(TaskRelayMessage) → Cloud Run RemoteMCPHost
  → handleTaskEvent() → SSE send() → Frontend handleSSEEvent()
```
Message types: `task_progress`, `task_input_required`, `task_payment_required`, `task_complete`, `task_error`

## Chat UI Components

- `ChatInterface.tsx` — main chat, handles SSE events, filters `step_update` with `status: 'running'`
- `MessageBubble.tsx` — renders user/assistant messages + order cards (orderPlaced, orderFailed, orderStatus fields)
- `TaskProgress.tsx` — non-interactive progress display
- `InputPrompt.tsx` — interactive user input (address, choices, OTP)
- `ask_user` → ONLY renders `InputPrompt`, NEVER `TaskProgress`

### Order Chat Cards
- `OrderConfirmation.tsx` — shown after payment verified, before agent checks out
- `OrderPlaced.tsx` — shown when agent successfully places order on target site
- `OrderFailed.tsx` — shown when checkout fails (includes auto-refund notice)
- `OrderStatusUpdate.tsx` — shown for delivery updates (shipped, delivered, etc.) with status-coloured border and tracking link

## Orders Dashboard

- `/dashboard/orders` — list page with `OrderStatusBadge`, clickthrough to detail
- `/dashboard/orders/[id]` — detail page with:
  - Hero card with status-aware accent border/glow/ring (emerald for delivered, indigo for shipped, etc.)
  - Two-column grid: Items + Payment, Delivery Address + Site Details
  - `OrderTimeline` — vertical timeline with colour-coded dots, gradient connector, courier metadata chips
  - "Track Package" and "View on {site}" action links
  - `flex-1 overflow-y-auto` for scrolling, `max-w-5xl` for full width
- Shared components in `components/orders/`:
  - `OrderStatusBadge.tsx` — 14 status configs with labels, colours, icons + `formatCents()` utility
  - `OrderTimeline.tsx` — renders `OrderStatusHistory[]` entries

## Workflow Engine

- Task state machine in `lib/workflow-engine/`
- States: created → running → paused_for_input → paused_for_payment → completed/failed
- `PauseResumeManager` handles pause/resume lifecycle

## Key Rules

- Never use singleton `taskEventHandler` — use `Map<taskId, handler>` for concurrent tasks
- `custom-server.js` handles WebSocket upgrade for relay connections + draining guard (rejects WS after SIGTERM) + early WS queue + SIGTERM handler
- `/api/admin/release-relay` — admin endpoint to force-disconnect laptop WS (auth via Bearer RELAY_AUTH_TOKEN)
- Docker: `FROM node:20-alpine` (no Chrome, no Playwright)
- Docker: `ENV RELAY_MODE=cloud` — uses RelayBridge
