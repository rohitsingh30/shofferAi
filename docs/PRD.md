# ShofferAI — Product Requirements Document

> **Version**: 2.0 — Concierge Architecture
> **Last Updated**: March 15, 2026
> **Author**: Rohit (Founder) + Claude (CTO)

---

## 1. Product Vision

ShofferAI is a **concierge-as-a-service** that executes real-world web tasks on behalf of users. Users chat with the AI, which books hotels, orders groceries, and handles online tasks — all using the operator's own signed-in browser profiles and payment methods.

**One-liner**: "Tell me what you need. I'll handle the clicking."

---

## 2. Business Model — Concierge Model

Unlike traditional SaaS where each user brings their own credentials, ShofferAI operates as a **human-backed concierge**:

- The **operator** (Rohit) maintains signed-in accounts on Booking.com, Blinkit, Zepto, etc.
- Users request tasks via the chat interface
- The AI agent plans and executes using the operator's browser on the operator's machine
- Users pay the **actual booking cost + a service fee/tip** before each transaction

### Revenue Streams

| Stream | Description |
|--------|-------------|
| **Service Fee** | Per-transaction fee (user-selected: Rs 0 / 100 / 200 / 500) |
| **Tips** | Optional gratuity from users |
| **Affiliate** | Commissions from booking platforms (future) |
| **Subscription** | Premium tier with priority execution (future) |

### Why This Model?

1. **Zero credential complexity** — Users don't store passwords/cards. The operator handles all of it.
2. **Instant trust** — "I book it for you" is simpler than "give me your card number."
3. **Works today** — No need for OAuth integrations with every platform.
4. **Scalable path** — Start with 1 operator, grow to many.

---

## 3. System Architecture

```
 USER (Browser)                    GCP CLOUD RUN                         OPERATOR LAPTOP
┌──────────┐    HTTPS    ┌──────────────────────────┐    WSS Tunnel    ┌──────────────────────┐
│  Next.js  │◄──────────►│  Next.js App (SSR+API)   │◄────────────────►│  Laptop Agent Runner │
│  Chat UI  │            │  ├─ Azure OpenAI Agent    │  (Cloudflare)   │  ├─ Relay Server (WS) │
│  L2 Pay   │            │  ├─ RemoteMCPHost ────────┼─────────────────┤  ├─ MCPHost (local)   │
│           │            │  ├─ Razorpay Payments     │                 │  └─ Playwright MCP    │
│           │            │  └─ PostgreSQL (Cloud SQL)│                 │     (headed, signed in)│
└──────────┘             └──────────────────────────┘                 └──────────────────────┘
```

### Four Layers

| Layer | Location | Responsibility |
|-------|----------|----------------|
| **Chat Interface** | GCP Cloud Run | User-facing web app. Auth, chat, task history, L2 payment window |
| **Backend Relay** | GCP → Laptop | Routes Playwright tool calls from cloud to operator's laptop via WebSocket over Cloudflare Tunnel |
| **Playwright Layer** | Operator Laptop | Runs headed browser with signed-in profiles. Executes all browsing actions |
| **Payment Layer** | Chat UI (L2 window) | Split-view payment panel. Collects booking cost + service fee via Razorpay before booking is finalized |

---

## 4. User Flows

### 4.1 Core Flow — Hotel Booking

```
User: "Book a hotel in Mumbai for March 25-27, under Rs 8000/night"
  │
  ▼
Agent (Cloud): Understands intent, selects BookingComHotelSkill
  │
  ▼
Agent → Relay → Laptop: Opens booking.com, searches Mumbai hotels
  │
  ▼
Agent streams progress to user: "Searching for hotels..."
  │                              "Found 12 options under Rs 8000"
  │                              "Top pick: Hotel Marine Plaza, Rs 6,500/night"
  │
  ▼
Agent calls `request_payment` tool
  │
  ▼
L2 Payment Panel slides in (right side of chat):
  ┌─────────────────────────────────────────────────┐
  │  Chat (60%)          │  Payment (40%)           │
  │                      │  ┌─────────────────────┐ │
  │  "Found your hotel!" │  │ Hotel Marine Plaza  │ │
  │  "Ready to book"     │  │ Mar 25-27, 2 nights │ │
  │                      │  │ Cost: Rs 13,000     │ │
  │                      │  │ Service: Rs 200     │ │
  │                      │  │ Total: Rs 13,200    │ │
  │                      │  │                     │ │
  │                      │  │ [Pay with Razorpay] │ │
  │                      │  │ UPI / Card / Wallet │ │
  │                      │  └─────────────────────┘ │
  └─────────────────────────────────────────────────┘
  │
  ▼ (User pays)
  │
Razorpay verifies → Agent resumes → Clicks "Confirm Booking" on booking.com
  │
  ▼
User sees: "Booking confirmed! Confirmation #HMP-2026-1234"
```

### 4.2 Payment Flow Detail

```
Agent decides booking is ready
  │
  ├─► SSE event: { type: "payment_required", payload: { summary, amount, taskId } }
  │
  ├─► Frontend opens L2 split-view panel
  │
  ├─► Agent blocks (PauseResumeManager.waitForInput, 10 min timeout)
  │
  ├─► User sees booking summary + cost breakdown + tip options
  │
  ├─► User clicks "Pay Now" → Razorpay Checkout modal opens
  │       ├─► UPI (Google Pay, PhonePe, Paytm)
  │       ├─► Credit/Debit Card
  │       ├─► Net Banking
  │       └─► Wallets
  │
  ├─► On success: POST /api/payments/verify
  │       ├─► Verify Razorpay signature
  │       ├─► Update Payment record → "captured"
  │       └─► pauseManager.provideInput(taskId, "payment", "confirmed")
  │
  ├─► Agent resumes → completes the booking on the website
  │
  └─► L2 panel closes, chat shows confirmation
```

### 4.3 L2 Payment Window — States

```
CLOSED ──► OPENING (300ms slide-in) ──► OPEN (user interacts) ──► CLOSING (300ms slide-out) ──► CLOSED
                                              │
                                     Desktop: 60/40 split
                                     Mobile: full-screen overlay
```

---

## 5. Technical Requirements

### 5.1 Relay Layer (`apps/web/lib/relay-client.ts` + `relay-bridge.ts`, `packages/shared/src/relay.ts`)

| Requirement | Detail |
|-------------|--------|
| Protocol | WebSocket with JSON messages. Request/response matching via unique message IDs (UUID) |
| Message types | `ToolCallRequest`, `ToolCallResponse`, `ToolListRequest`, `ToolListResponse`, `SessionEndRequest`, `Heartbeat` |
| Dev mode | `RemoteMCPHost` (`relay-client.ts`) — cloud connects OUT to `ws://localhost:8765` |
| Prod mode | `RelayBridge` (`relay-bridge.ts`) — laptop connects IN, no Cloudflare Tunnel needed |
| Reconnection | Auto-reconnect with exponential backoff (1s, 2s, 4s, max 30s) |
| Timeout | Tool calls timeout after 60s. Heartbeat every 15s, dead at 45s |
| Concurrency | Support multiple concurrent tool calls (each tracked by UUID) |
| Tab isolation | `SessionMCPHost` (`session-mcp-host.ts`) injects `sessionId` per task |
| Auth | Shared secret token in WS handshake header (RELAY_AUTH_TOKEN) |

### 5.2 MCPHostLike Interface (`packages/shared/src/mcp.ts`)

| Requirement | Detail |
|-------------|--------|
| Interface | `MCPHostLike`: `callTool()`, `getTools()`, `isMCPTool()`, `disconnect()` |
| Implementations | `MCPHost` (local), `RemoteMCPHost` (dev relay), `RelayBridge` (prod relay), `SessionMCPHost` (per-task wrapper) |
| Drop-in | AgentExecutor accepts any MCPHostLike — zero changes when switching relay modes |
| Error handling | On WS disconnect: throw `BrowserError("Browser relay disconnected")` |
| Tool caching | Cache tool list after first `getTools()` call, refresh on reconnect |

### 5.3 Payment Integration

| Requirement | Detail |
|-------------|--------|
| Gateway | Razorpay (India: UPI, cards, net banking, wallets) |
| Mode | Start with Razorpay Test Mode, switch to Live for production |
| Verification | Server-side signature verification (HMAC SHA256) |
| DB | `Payment` model in Prisma (status, amounts, Razorpay IDs) |
| Agent integration | `request_payment` custom tool → SSE event → L2 panel → pause/resume |

### 5.4 L2 Payment Components

| Requirement | Detail |
|-------------|--------|
| Layout | Split-view: chat 60% left, payment 40% right. Mobile: full-screen bottom sheet |
| Animation | 300ms slide-in/out with CSS transitions |
| Tip options | Preset: Rs 0, Rs 100, Rs 200, Rs 500. Custom amount input |
| Trust signals | "Secured by Razorpay" badge, lock icon, payment method logos |
| Razorpay Checkout | Load checkout.js script, open modal on "Pay Now" click |

### 5.5 Deployment

| Requirement | Detail |
|-------------|--------|
| Cloud | Google Cloud Run (Next.js container, no Playwright) |
| Database | Cloud SQL PostgreSQL 16 |
| Tunnel | Cloudflare Tunnel (free tier) — laptop to cloud relay |
| Container | Multi-stage Docker build, Next.js standalone output |
| Secrets | GCP Secret Manager for API keys, DB credentials |

---

## 6. Database Changes

### New: Payment Model

```prisma
model Payment {
  id              String    @id @default(cuid())
  taskId          String
  userId          String
  status          String    @default("pending")   // pending | captured | failed | refunded
  amountCents     Int                              // booking cost in paise
  serviceFeeCents Int       @default(0)            // tip/service fee in paise
  totalCents      Int                              // amountCents + serviceFeeCents
  currency        String    @default("INR")
  razorpayOrderId   String? @unique
  razorpayPaymentId String?
  bookingSummary  String                           // JSON: name, dates, price breakdown
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  paidAt          DateTime?

  task Task @relation(fields: [taskId], references: [id])
  user User @relation(fields: [userId], references: [id])

  @@index([taskId])
  @@index([userId])
}
```

### Schema Change: SQLite → PostgreSQL

Switch `datasource.provider` from `sqlite` to `postgresql`. Use `DATABASE_URL` env var for connection string. Docker-compose already has PostgreSQL configured.

---

## 7. Environment Variables (New)

```env
# Relay
RELAY_MODE=local                          # 'local' (dev) or 'cloud' (production)
RELAY_LAPTOP_URL=ws://localhost:8765      # WSS URL in production (via Cloudflare Tunnel)
RELAY_AUTH_TOKEN=                          # Shared secret for relay authentication

# Razorpay
RAZORPAY_KEY_ID=                          # Server + client key
RAZORPAY_KEY_SECRET=                      # Server-only secret
RAZORPAY_WEBHOOK_SECRET=                  # Webhook verification
NEXT_PUBLIC_RAZORPAY_KEY_ID=              # Client-side key (same as RAZORPAY_KEY_ID)
```

---

## 8. Operator Setup (Laptop)

The operator (Rohit) runs two commands:

```bash
# Terminal 1: Start the relay server (Playwright + WebSocket)
npm run laptop
# → Starts MCPHost with headed Chrome (signed into booking.com, grocery apps)
# → Starts WebSocket server on port 8765

# Terminal 2: Expose to the internet via Cloudflare Tunnel
cloudflared tunnel --url http://localhost:8765
# → Outputs a stable URL like https://abc123.cfargotunnel.com
# → Set this as RELAY_LAPTOP_URL in Cloud Run env vars
```

### Browser Profile Requirements

The operator's Chrome profile must have:
- [x] Booking.com signed in (rsinghtomar3011@gmail.com)
- [x] Payment methods saved in booking.com
- [x] Blinkit/Zepto/Swiggy signed in with addresses configured
- [x] Browser data directory known (passed to Playwright MCP `--user-data-dir`)

---

## 9. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Laptop goes offline | Bookings fail | Show "Service temporarily unavailable" in chat. Relay auto-reconnects |
| Cloudflare Tunnel drops | Brief interruption | Auto-reconnect with backoff. Agent retries current step |
| Booking.com detects automation | Account suspension | Use headed browser with real profile, human-like delays, avoid detection patterns |
| Payment collected but booking fails | User charged without service | Immediate refund via Razorpay API. Log incident for operator review |
| Concurrent users overload laptop | Slow execution | Queue tasks on relay server, process sequentially (v1). Scale to multiple laptops later |

---

## 10. Success Metrics

| Metric | Target (Month 1) | Target (Month 3) |
|--------|-------------------|-------------------|
| Tasks completed | 50 | 500 |
| Payment success rate | > 95% | > 98% |
| Avg task completion time | < 5 min | < 3 min |
| User satisfaction (NPS) | > 40 | > 60 |
| Revenue (service fees) | Rs 5,000 | Rs 50,000 |
| Active users | 10 | 100 |

---

## 11. Implementation Priority

**Phase 0**: Documentation (this document + ARCHITECTURE.md + CLAUDE.md update)
**Phase 1**: Relay infrastructure (cloud ↔ laptop tunnel)
**Phase 2**: L2 payment window (Razorpay + split-view UI)
**Phase 3**: GCP deployment (Cloud Run + Cloud SQL)
**Phase 4**: End-to-end testing and launch

**Target**: Ship MVP within this sprint. We've wasted enough time.
