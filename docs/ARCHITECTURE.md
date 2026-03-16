# ShofferAI — System Architecture

> **Version**: 2.0 — Concierge Architecture
> **Last Updated**: March 15, 2026

---

## High-Level Architecture

```
                          CLOUD (GCP Cloud Run)
 ┌─────────────────────────────────────────────────────────────────┐
 │                                                                 │
 │  ┌────────────┐   ┌──────────────────┐   ┌──────────────────┐  │
 │  │  Next.js   │   │  API Routes      │   │  Claude Agent    │  │
 │  │  Frontend  │   │  /api/agent/*    │   │  Core            │  │
 │  │  ├─ Chat   │──►│  /api/payments/* │──►│  ├─ Executor     │  │
 │  │  ├─ L2 Pay │   │  /api/auth/*    │   │  ├─ Skills       │  │
 │  │  └─ Auth   │   │  /api/profile/* │   │  └─ Conversation │  │
 │  └────────────┘   └──────────────────┘   └────────┬─────────┘  │
 │                                                    │            │
 │  ┌────────────┐   ┌──────────────────┐   ┌────────▼─────────┐  │
 │  │  Razorpay  │   │  Cloud SQL       │   │  RemoteMCPHost   │  │
 │  │  Gateway   │   │  PostgreSQL      │   │  (WS Client)     │  │
 │  └────────────┘   └──────────────────┘   └────────┬─────────┘  │
 │                                                    │            │
 └────────────────────────────────────────────────────┼────────────┘
                                                      │
                                            WSS (Cloudflare Tunnel)
                                                      │
                          OPERATOR LAPTOP              │
 ┌────────────────────────────────────────────────────┼────────────┐
 │                                                    │            │
 │  ┌──────────────┐   ┌──────────────────┐   ┌──────▼───────┐   │
 │  │  Cloudflare  │   │  Relay Server    │   │  MCPHost     │   │
 │  │  Tunnel      │──►│  (WS Server)     │──►│  (Playwright │   │
 │  │  (cloudflared│   │  Port 8765       │   │   MCP stdio) │   │
 │  │   daemon)    │   │                  │   │              │   │
 │  └──────────────┘   └──────────────────┘   └──────┬───────┘   │
 │                                                    │           │
 │                                            ┌───────▼────────┐  │
 │                                            │  Chrome Browser │  │
 │                                            │  (Headed)       │  │
 │                                            │  ├─ booking.com │  │
 │                                            │  ├─ blinkit.com │  │
 │                                            │  └─ (signed in) │  │
 │                                            └────────────────┘  │
 └────────────────────────────────────────────────────────────────┘
```

---

## Layer Details

### Layer 1: Chat Interface (Next.js on Cloud Run)

The user-facing web application deployed to Google Cloud Run.

**Components:**
- `ChatInterface.tsx` — Main chat with SSE streaming for agent progress
- `L2SplitView.tsx` — Split-view container for payment panel
- `PaymentPanel.tsx` — Razorpay checkout with booking summary and tip selection
- `InputPrompt.tsx` — OTP and confirmation prompts
- Auth pages (login, register, onboarding)
- Profile management (addresses, preferences)

**Key behavior:**
- SSE streaming from `/api/agent/execute` for real-time progress
- On `payment_required` SSE event → opens L2 payment panel (slides in from right)
- L2 is a 60/40 split on desktop, full-screen overlay on mobile
- On payment success → L2 closes, agent resumes

### Layer 2: Backend Relay

Routes Playwright tool calls from Cloud Run to the operator's laptop.

**Cloud side — RelayClient:**
- Connects to laptop's WebSocket endpoint (via Cloudflare Tunnel URL)
- Implements request/response matching using unique message IDs (UUID)
- Methods: `callTool(name, args)`, `listTools()`, `isConnected()`
- Auto-reconnects on disconnect (exponential backoff: 1s, 2s, 4s, max 30s)
- Heartbeat ping every 15s, disconnect if no pong within 5s

**Laptop side — RelayServer:**
- WebSocket server on port 8765
- Holds a local `MCPHost` instance (real Playwright)
- On `ToolCallRequest` → calls `mcpHost.callTool()` → sends `ToolCallResponse`
- On `ToolListRequest` → calls `mcpHost.getTools()` → sends `ToolListResponse`
- Supports concurrent tool calls (each tracked by unique ID)

**Protocol:**
```typescript
// Cloud → Laptop
type ToolCallRequest = {
  id: string;          // UUID for matching response
  type: 'tool_call';
  name: string;        // e.g., "browser_click"
  args: Record<string, unknown>;
}

type ToolListRequest = {
  id: string;
  type: 'tool_list';
}

// Laptop → Cloud
type ToolCallResponse = {
  id: string;          // matches request ID
  type: 'tool_result';
  result: unknown;
  error?: string;
}

type ToolListResponse = {
  id: string;
  type: 'tool_list_result';
  tools: MCPTool[];
}

// Bidirectional
type Heartbeat = {
  type: 'ping' | 'pong';
  timestamp: number;
}
```

**Abstraction — RemoteMCPHost:**
```
MCPHost (local)          RemoteMCPHost (remote)
├─ connect()             ├─ connect()          → WS connect to tunnel URL
├─ getTools()            ├─ getTools()          → send ToolListRequest, await response
├─ callTool(n, a)        ├─ callTool(n, a)      → send ToolCallRequest, await response
├─ isMCPTool(n)          ├─ isMCPTool(n)        → check cached tool list
└─ disconnect()          └─ disconnect()        → close WS
```

`AgentExecutor` accepts either. Zero changes to agent-core.

### Layer 3: Playwright (Operator Laptop)

The browser automation layer runs on the operator's physical machine.

**Why on the laptop?**
- Operator's Chrome profile has signed-in sessions (booking.com, grocery apps)
- Saved payment methods in the browser
- Headed browser looks like real human usage (anti-detection)
- No need to manage credentials for every platform

**Chrome CDP Setup:**

Playwright MCP connects to a persistent debug Chrome instance via CDP (Chrome DevTools Protocol) on port 9222. This avoids launching a new browser each time and keeps signed-in sessions alive.

```
LaunchAgent (com.shofferai.chrome-debug)
  → start-debug-chrome.sh
    → Chrome --remote-debugging-port=9222
              --user-data-dir=Chrome-Debug
              --profile-directory="Profile 3"    ← rsinghtomar3011@gmail.com
  → Playwright MCP --cdp-endpoint http://localhost:9222
```

**Profile setup:**
- Chrome profiles encrypt cookies per OS keychain — copying a profile directory does NOT copy active sessions
- The debug Chrome must be signed in once manually (one-time), then keeps the session forever
- `scripts/start-debug-chrome.sh` launches Chrome with `Profile 3` (rsinghtomar3011@gmail.com)
- `scripts/setup-chrome-profile.sh` syncs session files from the real Chrome profile to the debug instance
- The LaunchAgent ensures the debug Chrome starts automatically on login

**Configuration (production relay mode):**
```typescript
new MCPHost({
  headless: false,                    // Headed browser
  userDataDir: '/path/to/chrome-profile',  // Operator's signed-in profile
  viewport: { width: 1280, height: 720 },
})
```

**Configuration (dev mode — CDP connection):**
```json
// playwright-mcp.config.json
{
  "browser": {
    "cdpEndpoint": "http://localhost:9222"
  }
}
```

### Layer 4: Payment (L2 Window)

Payment collection before booking finalization, using the L2 split-view pattern.

**L2 Window Lifecycle:**
```
CLOSED ──► OPENING ──► OPEN ──► CLOSING ──► CLOSED
           (300ms)     (user    (300ms)
                       pays)
```

**Integration with agent pause/resume:**
```
Agent calls request_payment tool
  → SSE sends "payment_required" to frontend
  → Frontend opens L2 panel
  → Agent blocks via PauseResumeManager.waitForInput(taskId, "payment")
  → User completes Razorpay payment
  → /api/payments/verify calls pauseManager.provideInput(taskId, "payment", "confirmed")
  → Agent resumes and completes the booking
```

**Razorpay integration:**
- Server creates order: `POST /api/payments/create-order`
- Frontend loads Razorpay Checkout: `checkout.razorpay.com/v1/checkout.js`
- User completes payment in Razorpay modal (UPI, card, net banking)
- Frontend sends verification: `POST /api/payments/verify`
- Server validates HMAC SHA256 signature

---

## Data Flow — Complete Booking Request

```
 1. User types: "Book hotel in Mumbai"
    │
 2. POST /api/agent/execute { message } ──► SSE stream opens
    │
 3. AgentExecutor created with RemoteMCPHost
    │
 4. Claude API: "I need to search booking.com"
    │
 5. Tool call: browser_navigate("booking.com")
    ├─► RemoteMCPHost.callTool() ──► WS ──► RelayServer ──► MCPHost ──► Playwright
    └─► Result flows back: MCPHost ──► RelayServer ──► WS ──► RemoteMCPHost
    │
 6. ~20 more tool calls: search, filter, compare...
    │ (SSE events stream progress to user)
    │
 7. Agent: "Found best option. Need payment."
    ├─► Tool call: request_payment({ summary: "Hotel Marine Plaza...", amount: 13000 })
    ├─► SSE: { type: "payment_required", payload: { ... } }
    ├─► Agent blocks on PauseResumeManager
    │
 8. Frontend opens L2 payment panel
    ├─► User reviews booking summary
    ├─► User selects tip (Rs 200)
    ├─► User clicks "Pay Now"
    │
 9. POST /api/payments/create-order ──► Razorpay order created
    │
10. Razorpay Checkout modal ──► User pays via UPI
    │
11. POST /api/payments/verify ──► Signature verified ──► pauseManager.provideInput()
    │
12. Agent resumes ──► clicks "Confirm Booking" on booking.com
    │
13. SSE: { type: "complete", payload: { summary: "Booking confirmed! #HMP-2026-1234" } }
    │
14. L2 panel closes, chat shows confirmation
```

---

## Package Structure

```
shofferai/
├── apps/
│   ├── web/                        ← Chat Interface (deployed to Cloud Run)
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── agent/          ← SSE execution + input handling
│   │   │   │   ├── payments/       ← Razorpay create-order + verify
│   │   │   │   ├── auth/           ← NextAuth
│   │   │   │   ├── credentials/    ← Encrypted credential CRUD
│   │   │   │   └── profile/        ← User profile management
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── onboarding/
│   │   │   └── dashboard/
│   │   ├── components/
│   │   │   └── chat/
│   │   │       ├── ChatInterface.tsx
│   │   │       ├── L2SplitView.tsx
│   │   │       ├── L2PaymentContext.tsx
│   │   │       ├── PaymentPanel.tsx
│   │   │       ├── BookingSummaryCard.tsx
│   │   │       ├── MessageBubble.tsx
│   │   │       ├── TaskProgress.tsx
│   │   │       └── InputPrompt.tsx
│   │   └── lib/
│   │       ├── singletons.ts       ← Conditional local/remote MCP
│   │       ├── razorpay.ts         ← Razorpay SDK init
│   │       └── prisma.ts
│   └── playwright/                 ← Playwright Interface (runs on Operator Laptop)
│       └── src/
│           └── index.ts            ← Entry point: MCPHost + RelayServer
├── packages/
│   ├── agent-core/                 ← Azure OpenAI LLM + skills (cloud only)
│   ├── browser-engine/
│   │   └── src/
│   │       ├── mcp-host.ts        ← Local MCP host (used by apps/playwright)
│   │       ├── remote-mcp-host.ts ← Remote host via relay (used by apps/web)
│   │       └── session-pool.ts
│   ├── relay/
│   │   └── src/
│   │       ├── protocol.ts        ← Shared message types
│   │       ├── relay-client.ts    ← Cloud side (WS client)
│   │       ├── relay-server.ts    ← Laptop side (WS server)
│   │       └── index.ts
│   ├── credential-vault/           ← Encrypted credential storage
│   ├── workflow-engine/            ← Task state machine + pause/resume
│   └── shared/                     ← Types, logger, error classes
├── prisma/
│   └── schema.prisma              ← PostgreSQL + Payment model
├── Dockerfile
├── .dockerignore
├── docker-compose.yml             ← PostgreSQL
└── docs/
    ├── PRD.md
    ├── ARCHITECTURE.md            ← (this file)
    └── PITCH.md
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    GOOGLE CLOUD                          │
│                                                         │
│  ┌──────────────┐     ┌──────────────────────────────┐  │
│  │  Cloud Run   │     │  Cloud SQL                   │  │
│  │  (Next.js)   │────►│  PostgreSQL 16               │  │
│  │  512Mi / 1CPU│     │  db-f1-micro (MVP)           │  │
│  │  0-3 instances│    │                              │  │
│  └──────┬───────┘     └──────────────────────────────┘  │
│         │                                               │
│  ┌──────┴───────┐     ┌──────────────────────────────┐  │
│  │  Secret      │     │  Artifact Registry           │  │
│  │  Manager     │     │  Docker images               │  │
│  └──────────────┘     └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
         │
    HTTPS (users)
    WSS (to laptop via Cloudflare Tunnel)
         │
┌────────┴────────────────────────────────────────────────┐
│              OPERATOR LAPTOP (Rohit's Mac)               │
│                                                         │
│  Terminal 1:  npm run laptop     → Relay Server :8765   │
│  Terminal 2:  cloudflared tunnel → Exposes :8765 to web │
│                                                         │
│  Chrome CDP on :9222 (Profile 3: rsinghtomar3011)       │
└─────────────────────────────────────────────────────────┘
```

---

## Security Considerations

| Concern | Approach |
|---------|----------|
| Relay authentication | Shared secret token in WebSocket handshake. Cloud Run and laptop both have `RELAY_AUTH_TOKEN` |
| Payment security | Razorpay handles all card/UPI data. We never touch payment instruments |
| Cloudflare Tunnel | Encrypted end-to-end. No port forwarding needed on laptop |
| User data | Auth via Auth.js (JWT sessions). Passwords bcrypt hashed. User never provides booking credentials |
| Operator credentials | Browser profile on physical laptop. Never transmitted over network |
