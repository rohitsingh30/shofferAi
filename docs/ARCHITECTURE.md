# ShofferAI — System Architecture

> **Version**: 3.0 — Full Architecture with Diagrams
> **Last Updated**: March 19, 2026

---

## 1. High-Level System Architecture

The system spans two environments connected by a WebSocket relay:

![System Overview](diagrams/system-overview.png)

```mermaid
graph TB
    subgraph CLOUD["☁️ GCP Cloud Run"]
        direction TB
        UI["🖥️ Next.js 15<br/>Chat UI + Auth + L2 Payment"]
        API["📡 API Routes<br/>/api/agent/execute<br/>/api/payments/*<br/>/api/auth/*"]
        AGENT["🤖 AgentExecutor<br/>Azure OpenAI LLM Loop<br/>Skill Matching + Lessons"]
        DB["🗄️ Cloud SQL<br/>PostgreSQL"]
        PAY["💳 Razorpay<br/>UPI / Card / Wallet"]
        
        subgraph RELAY_CLOUD["Relay Layer"]
            SMCP["SessionMCPHost<br/>Per-task tab isolation"]
            RMCP["RemoteMCPHost<br/>WS Client (dev)"]
            RB["RelayBridge<br/>Accepts WS IN (prod)"]
        end
        
        UI --> API
        API --> AGENT
        AGENT --> SMCP
        SMCP --> RMCP
        SMCP --> RB
        API --> DB
        API --> PAY
    end

    subgraph TUNNEL["🔒 WebSocket Tunnel"]
        CF["Cloudflare Tunnel<br/>Encrypted WSS"]
    end

    subgraph LAPTOP["💻 Operator Laptop"]
        direction TB
        RS["📡 RelayServer / RelayOutbound<br/>Port 8765 (dev) or outbound WSS (prod)"]
        TM["📋 TaskManager<br/>Bridge WS (dynamic port)"]
        MCP["🎭 MCPHost<br/>Playwright MCP (stdio)"]
        POOL["🏊 ChromePool<br/>Tab Management"]
        CHROME["🌐 Chrome Debug<br/>CDP Port 9222<br/>Profile 3 (signed-in)"]
        
        RS --> MCP
        MCP --> POOL
        POOL --> CHROME
    end

    USER["👤 User<br/>Browser"] -->|"HTTPS + SSE"| UI
    RMCP -->|"WSS (dev mode)"| CF
    CF -->|"WS"| RS
    RB <-->|"WS (prod mode)"| RS
```

### Key Principles
- **Azure OpenAI** handles all chat, reasoning, and tool calling (via `openai` npm package with Azure endpoint)
- **Playwright MCP** runs exclusively on the operator's laptop — browser automation never runs on Cloud Run
- **Login first**: Every website interaction starts by logging into the target site
- **New tab for every site**: Agent opens a new tab per task, never hijacks the user's chat tab
- **SessionMCPHost**: Each task gets an isolated Chrome tab via ChromePool

---

## 2. Relay Architecture — Dev vs Prod

The relay supports two modes depending on `RELAY_MODE` environment variable:

![Relay Modes](diagrams/relay-modes.png)

```mermaid
graph TB
    subgraph DEV["🔧 Dev Mode (no RELAY_CLOUD_URL)"]
        direction LR
        C1["Cloud Run<br/>RemoteMCPHost"] -->|"1. Connects OUT<br/>ws://localhost:8765"| L1["Laptop<br/>RelayServer"]
        L1 -->|"2. Accepts connection"| M1["MCPHost<br/>Playwright"]
    end
    
    subgraph PROD["🚀 Prod Mode (RELAY_CLOUD_URL set)"]
        direction LR
        L2["Laptop<br/>RelayOutbound"] -->|"1. Connects OUT<br/>wss://cloud-run-url"| C2["Cloud Run<br/>RelayBridge"]
        C2 -->|"2. setLaptopSocket()"| A2["AgentExecutor<br/>callToolWithSession()"]
    end
    
    subgraph ALWAYS["📋 Always Running"]
        direction TB
        TM["TaskManager bridge<br/>WS on dynamic port (9400-9499)"]
    end
    
    subgraph PROTO["📋 Shared Relay Protocol"]
        direction TB
        REQ1["ToolCallRequest<br/>{id, type, name, args, sessionId}"]
        RES1["ToolCallResponse<br/>{id, type, result, error}"]
        HB["Heartbeat<br/>{type: ping|pong, timestamp}"]
        SE["SessionEndRequest<br/>{sessionId} → release Chrome slot"]
    end
```

| Mode | Who Initiates | Class | Use Case |
|------|--------------|-------|----------|
| **Dev** (no `RELAY_CLOUD_URL`) | Cloud connects OUT | `RemoteMCPHost` (`apps/web/lib/relay-client.ts`) | Local development, ws://localhost:8765 |
| **Prod** (`RELAY_CLOUD_URL` set) | Laptop connects OUT | `RelayOutbound` (`apps/playwright/src/relay-outbound.ts`) | Production, no Cloudflare Tunnel needed |
| **Both modes** | TaskManager bridge | `TaskManager` (`apps/playwright/src/task-manager.ts`) | Dynamic port (first available in 9400-9499 range, printed in logs) |

**Shared Protocol** (defined in `packages/shared/src/relay.ts`):
- `ToolCallRequest` / `ToolCallResponse` — UUID-correlated tool execution
- `ToolListRequest` / `ToolListResponse` — Discover available MCP tools
- `SessionEndRequest` — Release Chrome tab slot
- `Heartbeat` — 15s ping, 45s dead connection timeout

**MCPHostLike Interface** — Both `MCPHost`, `RemoteMCPHost`, `RelayBridge`, and `SessionMCPHost` implement the same interface. `AgentExecutor` accepts any — zero changes to agent-core when switching modes.

```typescript
interface MCPHostLike {
  callTool(name: string, args: Record<string, unknown>): Promise<unknown>;
  getTools(): Promise<MCPTool[]>;
  isMCPTool(name: string): boolean;
  disconnect?(): Promise<void>;
}
```

---

## 3. Request Lifecycle — End-to-End

What happens when a user sends "Book hotel in Mumbai":

![Request Lifecycle](diagrams/request-lifecycle.png)

```mermaid
sequenceDiagram
    actor User
    participant UI as Next.js Chat UI
    participant API as POST /api/agent/execute
    participant Agent as AgentExecutor
    participant LLM as Azure OpenAI
    participant SMCP as SessionMCPHost
    participant Relay as RemoteMCPHost / RelayBridge
    participant Laptop as RelayServer + MCPHost
    participant Chrome as Chrome Debug (CDP)

    User->>UI: "Book hotel in Mumbai"
    UI->>API: POST {message, taskId}
    API->>API: Create Task + SessionMCPHost(mcpHost, taskId)
    API-->>UI: SSE stream opens

    API->>Agent: execute(message, callbacks)
    Agent->>Agent: matchSkill() → BookingComHotel
    Agent->>Agent: loadLessons(skillId, top 10)
    Agent->>Agent: buildSystemPrompt(user, skills, lessons)

    loop LLM Tool Loop (max 50 iterations)
        Agent->>LLM: chat.completions.create(messages)
        LLM-->>Agent: tool_call: browse_website(url, instruction)
        Agent-->>UI: SSE: {type: "step", content: "Searching hotels..."}
        Note over Agent,UI: Internal tool calls (browser_navigate, browser_snapshot) are<br/>filtered by isInternalToolLabel() — only natural language reaches the user
        Agent->>SMCP: callTool("browser_snapshot", {sessionId})
        SMCP->>SMCP: Inject sessionId into args
        SMCP->>Relay: callTool(name, args + sessionId)
        Relay->>Laptop: ToolCallRequest {id, name, args}
        Laptop->>Chrome: Playwright MCP action
        Chrome-->>Laptop: DOM snapshot / result
        Laptop-->>Relay: ToolCallResponse {id, result}
        Relay-->>SMCP: result
        SMCP-->>Agent: result (truncated to 4000 chars)
        Agent->>Agent: addToolResult → ConversationManager
    end

    Agent-->>UI: SSE: {type: "complete", summary: "Booking confirmed!"}
    Agent->>SMCP: releaseSession(taskId)
    SMCP->>Relay: SessionEndRequest → release Chrome slot
```

### Key Classes in the Flow

| Class | File | Role |
|-------|------|------|
| **AgentExecutor** | `packages/agent-core/src/agent.ts` | LLM loop (max 50 iterations), skill matching, tool dispatch |
| **ConversationManager** | `packages/agent-core/src/conversation.ts` | Message history (max 20 messages, tool results truncated to 4000 chars) |
| **AzureOpenAIClient** | `packages/agent-core/src/azure-openai-client.ts` | Azure OpenAI via `openai` npm package, translates internal Anthropic format ↔ OpenAI API |
| **SessionMCPHost** | `apps/web/lib/session-mcp-host.ts` | Per-task wrapper, injects `sessionId` for tab isolation |
| **WorkflowEngine** | `apps/web/lib/workflow-engine/engine.ts` | Task state machine: `createTask()`, `updateTaskStatus()`, `addMessage()` |
| **PauseResumeManager** | `apps/web/lib/workflow-engine/pause-resume.ts` | Blocks agent for user input (5 min default timeout) |

### Execution Modes

| Mode | Trigger | How It Works |
|------|---------|-------------|
| **AI Mode** | No compiled script exists | LLM reasons through each step, calls MCP tools |
| **Instant Mode** | Compiled script found | `ScriptPlayer` replays pre-recorded Playwright steps |
| **Hybrid** | Script fails mid-execution | Falls back to AI mode, enables `ScriptRecorder` to save new script on success |

---

## 4. Tab Isolation — SessionMCPHost + ChromePool

Each concurrent task gets its own Chrome tab via `SessionMCPHost`:

![Tab Isolation](diagrams/tab-isolation.png)

```mermaid
sequenceDiagram
    participant API as Execute Route
    participant SMCP as SessionMCPHost
    participant MCP as RemoteMCPHost / RelayBridge
    participant RS as RelayServer (Laptop)
    participant Pool as ChromePool
    participant Tab1 as Chrome Tab 1 (Task A)
    participant Tab2 as Chrome Tab 2 (Task B)

    Note over API,Pool: Two concurrent tasks arrive

    API->>SMCP: new SessionMCPHost(mcpHost, "task-A")
    API->>SMCP: new SessionMCPHost(mcpHost, "task-B")

    Note over SMCP: Each wrapper injects unique sessionId

    SMCP->>MCP: callTool("browser_navigate", {url, sessionId: "task-A"})
    MCP->>RS: ToolCallRequest {args: {sessionId: "task-A"}}
    RS->>Pool: getOrCreateTab("task-A")
    Pool->>Tab1: Create new tab for task-A
    Tab1-->>RS: Navigate result
    RS-->>MCP: ToolCallResponse

    SMCP->>MCP: callTool("browser_click", {ref, sessionId: "task-B"})
    MCP->>RS: ToolCallRequest {args: {sessionId: "task-B"}}
    RS->>Pool: getOrCreateTab("task-B")
    Pool->>Tab2: Create new tab for task-B
    Tab2-->>RS: Click result
    RS-->>MCP: ToolCallResponse

    Note over Pool: Each sessionId maps to isolated Chrome tab
    Note over Pool: Tab released on SessionEndRequest

    SMCP->>MCP: SessionEndRequest {sessionId: "task-A"}
    MCP->>RS: Release session
    RS->>Pool: releaseTab("task-A")
    Pool->>Tab1: Close tab
```

**How it works:**
1. `POST /api/agent/execute` creates `new SessionMCPHost(remoteMcpHost, taskId)`
2. Every `callTool()` call atomically injects `sessionId` into tool arguments
3. On the laptop, `ChromePool` maps each `sessionId` to a unique Chrome tab
4. When task completes, `SessionEndRequest` releases the tab back to the pool

---

## 5. Payment Flow — L2 Split View + Razorpay

Agent pauses for payment collection, then resumes:

![Payment Flow](diagrams/payment-flow.png)

```mermaid
sequenceDiagram
    actor User
    participant UI as Chat UI + L2 Panel
    participant Agent as AgentExecutor
    participant PM as PauseResumeManager
    participant PayAPI as /api/payments/*
    participant RP as Razorpay

    Agent->>Agent: Hotel found, ready to book
    Agent->>PM: Tool: collect_payment({summary, amount})
    PM->>PM: waitForInput(taskId, "payment", 5min timeout)
    
    Note over Agent: ⏸️ Agent BLOCKED

    PM-->>UI: SSE: {type: "payment_required", payload: {summary, amount}}
    UI->>UI: Open L2 split-view panel (300ms slide-in)
    
    Note over UI: Desktop: 60% chat / 40% payment<br/>Mobile: full-screen overlay

    User->>UI: Select tip ₹200, click "Pay Now"
    UI->>PayAPI: POST /api/payments/create-order
    PayAPI->>RP: razorpay.orders.create()
    RP-->>PayAPI: {orderId, amount}
    PayAPI-->>UI: {orderId, keyId}

    UI->>RP: Open Razorpay Checkout Modal
    User->>RP: Pay via UPI / Card / Wallet
    RP-->>UI: {razorpay_payment_id, razorpay_signature}

    UI->>PayAPI: POST /api/payments/verify
    PayAPI->>PayAPI: Verify HMAC SHA256 signature
    PayAPI->>PM: provideInput(taskId, "payment", "confirmed")
    
    Note over Agent: ▶️ Agent RESUMES

    PM-->>Agent: Payment confirmed
    Agent->>Agent: Click "Confirm Booking" on website
    Agent-->>UI: SSE: {type: "complete", summary: "Booking confirmed!"}
    UI->>UI: Close L2 panel (300ms slide-out)
```

**L2 Window States:**
```
CLOSED → OPENING (300ms slide-in) → OPEN (user pays) → CLOSING (300ms slide-out) → CLOSED
                                         │
                                Desktop: 60/40 split
                                Mobile: full-screen overlay
```

**Components:**
- `L2SplitView.tsx` — Split-view container with animations
- `L2PaymentContext.tsx` — React context for L2 state management
- `PaymentPanel.tsx` — Razorpay checkout + booking summary + tip selector
- `BookingSummaryCard.tsx` — Hotel/booking details display
- `InputPrompt.tsx` — OTP and confirmation prompts

---

## 6. Skill Matching + Lesson Learning

The agent matches skills by triggers and learns from past errors:

![Skill & Lesson System](diagrams/skill-lessons.png)

```mermaid
graph TB
    subgraph MATCH["🎯 Skill Matching"]
        MSG["User Message"] --> SCORE["Score Skills<br/>+1 per trigger match<br/>+3 for domain mention"]
        SCORE --> BEST["Select Best Skill<br/>threshold ≥ 1"]
        BEST --> LOAD["Load Lessons<br/>from SkillLesson DB"]
    end

    subgraph LESSONS["📚 Lesson System"]
        LOAD --> FILTER["Filter: confidence ≥ 0.3<br/>Sort: confidence DESC<br/>Limit: top 10"]
        FILTER --> INJECT["Inject into System Prompt:<br/>LESSONS LEARNED<br/>1. When X → Y (confidence: 85%)<br/>2. When Z → W (confidence: 60%)"]
    end

    subgraph EXEC["⚡ Execution"]
        INJECT --> LLM["LLM reads lessons<br/>applies proactively"]
        LLM --> BROWSE["Execute browser actions"]
        BROWSE --> SUCCESS{"Success?"}
    end

    subgraph LEARN["🧠 Auto-Learn"]
        SUCCESS -->|"Yes after error"| SAVE["Auto-save Lesson<br/>errorPattern: first 200 chars<br/>resolution: what worked<br/>confidence: 0.5"]
        SUCCESS -->|"Yes lesson used"| BUMP["recordOutcome: true<br/>confidence += 0.05"]
        SUCCESS -->|"No"| RETRY["Retry with LLM<br/>Track lastBrowseError"]
        RETRY --> BROWSE
    end
```

**Lesson Lifecycle:**
1. **New lesson** auto-saved with `confidence: 0.5` on error recovery
2. **Growing** — repeated success bumps confidence by +0.05 per outcome
3. **Trusted** — confidence ≥ 0.8, prioritized in prompt
4. **Decaying** — failures decrease confidence by -0.05
5. **Hidden** — confidence < 0.3, excluded from prompt injection

**Key Files:**
- `packages/agent-core/src/skills/types.ts` — `SkillMetadata`, `LessonStore`, `LessonEntry` interfaces
- `packages/agent-core/src/skills/lessons.ts` — `formatLessonsForPrompt()` function
- `packages/agent-core/src/skills/loader.ts` — Skill loading and `matchSkill()` scoring
- `prisma/schema.prisma` → `SkillLesson` model

---

## 7. Authentication Flow

![Auth Flow](diagrams/auth-flow.png)

```mermaid
sequenceDiagram
    actor User
    participant UI as Login / Register Page
    participant Auth as NextAuth v5
    participant DB as PostgreSQL
    participant Session as JWT Session

    alt Credentials Login
        User->>UI: Enter email + password
        UI->>Auth: signIn("credentials", {email, password})
        Auth->>DB: Find user by email
        DB-->>Auth: User record
        Auth->>Auth: bcrypt.compare(password, hash)
        Auth-->>Session: Create JWT {userId, email, name}
        Session-->>UI: Set cookie + redirect to /dashboard
    end

    alt Google OAuth
        User->>UI: Click "Sign in with Google"
        UI->>Auth: signIn("google")
        Auth->>Auth: Redirect to Google OAuth
        User->>Auth: Authorize on Google
        Auth->>DB: Find or create User + Account
        DB-->>Auth: User record
        Auth-->>Session: Create JWT {userId, email, name}
        Session-->>UI: Set cookie + redirect to /dashboard
    end

    alt New User Registration
        User->>UI: Enter name + email + password
        UI->>Auth: POST /api/auth/register
        Auth->>Auth: bcrypt.hash(password, 12)
        Auth->>DB: Create User
        DB-->>Auth: New user created
        Auth-->>Session: Auto sign-in → JWT
        Session-->>UI: Redirect to /onboarding
    end

    Note over Session: JWT contains: userId, email, name<br/>Used by API routes via getServerSession()
```

**Auth Stack:**
- **Auth.js v5** (NextAuth) — Credentials + Google OAuth providers
- **JWT sessions** — Stateless, no server-side session storage needed
- **bcrypt** — Password hashing (12 salt rounds)
- **Middleware** — Protected routes redirect to `/login` if no session

---

## 8. Database Schema

![Database ERD](diagrams/db-erd.png)

```mermaid
erDiagram
    User {
        string id PK
        string name
        string email UK
        string hashedPassword
        string image
    }
    
    Credential {
        string id PK
        string userId FK
        string siteDomain
        string encryptedData
        string iv
        string tag
    }
    
    Task {
        string id PK
        string userId FK
        string status
        string skillName
        string summary
    }
    
    TaskStep {
        string id PK
        string taskId FK
        int stepNumber
        string status
        string description
    }
    
    Message {
        string id PK
        string taskId FK
        string role
        string content
    }
    
    Payment {
        string id PK
        string taskId FK
        string userId FK
        string status
        int amountCents
        int serviceFeeCents
        string razorpayOrderId UK
    }
    
    SkillLesson {
        string id PK
        string skillId
        string errorPattern
        string resolution
        float confidence
        int successCount
        int failureCount
    }
    
    TelemetryEvent {
        string id PK
        string userId FK
        string taskId FK
        string eventType
        json payload
    }

    User ||--o{ Credential : stores
    User ||--o{ Task : creates
    User ||--o{ Payment : makes
    Task ||--o{ TaskStep : contains
    Task ||--o{ Message : has
    Task ||--o| Payment : "paid via"
    Task ||--o{ TelemetryEvent : tracks
```

**10 Models** — See `prisma/schema.prisma` for full definitions.

**Credential Vault** (`apps/web/lib/credential-vault/`):
- `vault.ts` — `CredentialVault` class with AES-256-GCM encryption
- `injector.ts` — `CredentialInjector.fill()` securely types credentials into browser forms
- Encrypts site login data, card data, UPI data, and addresses per-user

---

## 9. Package Structure (Actual)

```
shofferai/
├── apps/
│   ├── web/                              ← Chat Interface (Cloud Run)
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── agent/
│   │   │   │   │   ├── execute/route.ts  ← SSE entry point + isInternalToolLabel() filter
│   │   │   │   │   └── input/route.ts    ← User input (OTP, confirmations)
│   │   │   │   ├── payments/             ← Razorpay create-order + verify
│   │   │   │   ├── auth/                 ← NextAuth
│   │   │   │   ├── credentials/          ← Encrypted credential CRUD
│   │   │   │   ├── profile/              ← User profile management
│   │   │   │   ├── tasks/                ← Task history + admin
│   │   │   │   └── telemetry/            ← Analytics events
│   │   │   ├── login/ register/ onboarding/ dashboard/ profile/ tasks/ admin/
│   │   ├── components/chat/
│   │   │   ├── ChatInterface.tsx          ← Main chat with SSE streaming
│   │   │   ├── L2SplitView.tsx            ← Payment split-view container
│   │   │   ├── L2PaymentContext.tsx        ← React context for L2 state
│   │   │   ├── PaymentPanel.tsx           ← Razorpay checkout UI
│   │   │   ├── BookingSummaryCard.tsx      ← Booking details display
│   │   │   ├── MessageBubble.tsx          ← Chat message rendering
│   │   │   ├── TaskProgress.tsx           ← Step progress indicator
│   │   │   └── InputPrompt.tsx            ← OTP & confirmation prompts
│   │   └── lib/
│   │       ├── relay-client.ts            ← RemoteMCPHost (dev: cloud connects OUT)
│   │       ├── relay-bridge.ts            ← RelayBridge (prod: laptop connects IN)
│   │       ├── session-mcp-host.ts        ← SessionMCPHost (per-task tab isolation)
│   │       ├── credential-vault/          ← AES-256-GCM encrypted storage
│   │       │   ├── vault.ts               ← CredentialVault class
│   │       │   └── injector.ts            ← CredentialInjector.fill()
│   │       ├── workflow-engine/           ← Task state machine
│   │       │   ├── engine.ts              ← WorkflowEngine class
│   │       │   └── pause-resume.ts        ← PauseResumeManager class
│   │       ├── singletons.ts              ← Conditional MCP mode selection
│   │       ├── razorpay.ts                ← Razorpay SDK init
│   │       └── prisma.ts                  ← Prisma client singleton
│   │
│   └── playwright/                        ← Playwright Interface (Operator Laptop)
│       ├── src/
│       │   ├── index.ts                   ← Entry: MCPHost + RelayServer + ChromePool
│       │   ├── mcp-host.ts                ← Local MCPHost (Playwright MCP stdio)
│       │   ├── relay-server.ts            ← RelayServer (WS server on port 8765, dev mode only)
│       │   ├── relay-outbound.ts         ← RelayOutbound (connects to Cloud Run, prod mode)
│       │   ├── task-manager.ts           ← TaskManager (bridge WS on dynamic port 9400-9499, isInternalToolLabel filter)
│       │   └── chrome-pool.ts            ← ChromePool + mcpToolEvents (tool log stream on dynamic port)
│       └── scripts/
│           ├── playwright-mcp-with-chrome.sh ← Lazy MCP launcher (.mcp.json entry)
│           ├── stealth-init.js              ← Anti-bot init script for --init-script
│           ├── start-laptop.sh              ← Primary relay launcher
│           ├── start-relay-daemon.sh        ← LaunchAgent daemon entry
│           ├── shofferai-agent.sh           ← CLI agent runner (dev/testing)
│           ├── shofferai-parallel.sh        ← Parallel task runner
│           └── update-playwright-mcp.sh     ← Maintenance utility
│
├── packages/
│   ├── agent-core/                        ← LLM Agent Logic (cloud only)
│   │   └── src/
│   │       ├── agent.ts                   ← AgentExecutor (LLM loop, tool dispatch)
│   │       ├── azure-openai-client.ts     ← AzureOpenAIClient (openai npm + Azure)
│   │       ├── conversation.ts            ← ConversationManager (max 20 msgs)
│   │       ├── prompts/system.ts          ← buildSystemPrompt() with lessons
│   │       ├── skills/
│   │       │   ├── types.ts               ← SkillMetadata, LessonStore, LessonEntry
│   │       │   ├── loader.ts              ← Skill loading + matchSkill()
│   │       │   └── lessons.ts             ← formatLessonsForPrompt()
│   │       └── scripts/
│   │           ├── compiled/              ← Pre-recorded Playwright scripts
│   │           └── mcp-executor.ts        ← MCP-based script executor
│   │
│   └── shared/                            ← Shared Types & Utilities
│       └── src/
│           ├── relay.ts                   ← RelayMessage protocol types
│           ├── mcp.ts                     ← MCPHostLike interface, MCPTool
│           ├── agent.ts                   ← TaskStatus, StepStatus enums
│           ├── credentials.ts             ← CardData, UPIData, SiteLoginData types
│           ├── internal-message-filter.ts ← isInternalToolLabel() — shared filter for chat UI
│           ├── logger.ts                  ← Structured logger
│           └── errors.ts                  ← Custom error classes
│
├── prisma/
│   └── schema.prisma                      ← PostgreSQL schema (10 models)
├── docs/
│   ├── ARCHITECTURE.md                    ← This file
│   ├── PRD.md                             ← Product requirements
│   ├── PITCH.md                           ← Investor pitch deck
│   ├── WORKFLOWS.md                       ← E2E workflow documentation
│   └── diagrams/                          ← Mermaid sources + PNG/SVG images
├── Dockerfile
├── docker-compose.yml                     ← PostgreSQL for local dev
├── turbo.json                             ← Turborepo config
└── CLAUDE.md                              ← AI assistant context
```

---

## 10. Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GOOGLE CLOUD                              │
│                                                             │
│  ┌──────────────┐     ┌──────────────────────────────────┐  │
│  │  Cloud Run   │     │  Cloud SQL                       │  │
│  │  (Next.js)   │────►│  PostgreSQL 16                   │  │
│  │  512Mi / 1CPU│     │  db-f1-micro (MVP)               │  │
│  │  0-3 instances│    │                                  │  │
│  └──────┬───────┘     └──────────────────────────────────┘  │
│         │                                                   │
│  ┌──────┴───────┐     ┌──────────────────────────────────┐  │
│  │  Secret      │     │  Artifact Registry               │  │
│  │  Manager     │     │  Docker images                   │  │
│  └──────────────┘     └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
         │
    HTTPS (users) + WSS (relay)
         │
┌────────┴──────────────────────────────────────────────────┐
│              OPERATOR LAPTOP (Mac)                         │
│                                                           │
│  Outbound mode: RelayOutbound → wss://Cloud Run (prod)     │
│  Server mode:   RelayServer on :8765 (dev only)            │
│  TaskManager:   Bridge WS on dynamic port (9400-9499)       │
│  Chrome:        OS-assigned ephemeral port via ChromePool   │
│  ChromePool ← Per-task tab isolation                      │
│                                                           │
│  LaunchAgent (com.shofferai.chrome-debug) starts on login │
└───────────────────────────────────────────────────────────┘
```

### Chrome Launch (Lazy)

Chrome launched by the script uses real macOS Keychain (not Playwright's mock keychain). Playwright MCP connects via CDP.

**Copilot CLI / Claude Desktop path** (`.mcp.json` → `playwright-mcp-with-chrome.sh`):
```
.mcp.json invokes playwright-mcp-with-chrome.sh:
  1. Selective copy of Chrome-Debug/Profile 3 session data (~26MB)
  2. Remove singleton lock files from clone
  3. Launch Chrome ourselves with --remote-debugging-port=0 (NO Playwright launch)
  4. Parse CDP port from Chrome stderr (DevTools listening on ws://127.0.0.1:PORT)
  5. Generate config with cdpEndpoint → Playwright MCP CONNECTS to our Chrome
  6. Start Playwright MCP with --config + --init-script stealth-init.js
  7. Cleanup: kill Chrome + remove cloned dir on exit
```
WHY we launch Chrome ourselves: Playwright adds `--use-mock-keychain` and `--password-store=basic`
which blocks macOS Keychain access. Chrome cookies are Keychain-encrypted → mock keychain = logged out.

**Relay path** (`start-laptop.sh` → ChromePool):
```
ChromePool launches Chrome lazily per task:
  1. Clone session files from Chrome-Debug/Profile 3
  2. Launch Chrome with --remote-debugging-port=0 (OS-assigned port)
  3. Connect MCPHost via CDP (no mock keychain — ChromePool launches Chrome directly)
  4. Auto-release after 15 min idle
```

**Profile 3** = `rsinghtomar3011@gmail.com` (Booking.com Genius Level 1). Chrome encrypts cookies via macOS Keychain (per-user, not per-dir) — cloned dirs preserve all signed-in sessions AS LONG AS Chrome is launched without `--use-mock-keychain`.

---

## 11. Security

| Concern | Approach |
|---------|----------|
| **Relay auth** | Shared `RELAY_AUTH_TOKEN` in WebSocket handshake |
| **Payment** | Razorpay handles all card/UPI data — we never touch payment instruments |
| **Credentials** | AES-256-GCM encrypted per-user in PostgreSQL (`CredentialVault`) |
| **Tunnel** | Cloudflare Tunnel: encrypted end-to-end, no port forwarding |
| **User auth** | Auth.js v5 (JWT sessions), bcrypt password hashing |
| **Operator** | Browser profile on physical laptop, never transmitted over network |

---

## 12. Circuit Breakers & Limits

| Limit | Value | Purpose |
|-------|-------|---------|
| Max LLM iterations | 50 | Prevent infinite tool loops |
| Max conversation messages | 20 | Keep context window tight |
| Max tool result length | 4000 chars | Prevent token bloat from DOM snapshots |
| Consecutive browser failures | 3 | Fail fast on broken pages |
| User input timeout | 5 min | Don't block forever on OTP/payment |
| Heartbeat interval | 15s | Detect dead relay connections |
| Heartbeat timeout | 45s | Disconnect stale connections |
| Reconnect backoff | 1s → 30s max | Exponential backoff on relay disconnect |

---

## 13. Current Deployment State (as of March 2026)

### What's on Production (Cloud Run)

| Component | Status | Details |
|-----------|--------|---------|
| **Next.js Chat UI** | ✅ Deployed | `shofferai-27188185100.asia-south1.run.app` |
| **Auth (NextAuth v5)** | ✅ Live | Credentials + Google OAuth |
| **AgentExecutor** | ✅ Live | Azure OpenAI LLM loop with skill matching |
| **RelayBridge** | ✅ Live | Accepts laptop WS connections (`RELAY_MODE=cloud`) |
| **SessionMCPHost** | ✅ Live | Per-task Chrome tab isolation |
| **500 Skills** | ✅ Loaded | SKILL.md files in `packages/agent-core/src/skills/` |
| **500+ Compiled Scripts** | ✅ Bundled | In `packages/agent-core/src/scripts/compiled/` |
| **ScriptPlayer** | ✅ Live | Instant replay mode for cached skills |
| **Razorpay Payments** | ✅ Integrated | Test mode (switch to Live for production) |
| **PostgreSQL (Cloud SQL)** | ✅ Live | 10 Prisma models |
| **SSE Streaming** | ✅ Live | Real-time agent progress to frontend |
| **L2 Payment Panel** | ✅ Built | Split-view Razorpay checkout |
| **Credential Vault** | ✅ Built | AES-256-GCM encrypted storage |

### What's on Operator Laptop (Local Only)

| Component | Status | Details |
|-----------|--------|---------|
| **Chrome Debug** | ✅ Running | OS-assigned ephemeral CDP port, Profile 3 (signed-in accounts) |
| **RelayServer** | Conditional | Port 8765, only in dev/server mode (no `RELAY_CLOUD_URL`) |
| **RelayOutbound** | Conditional | Connects to Cloud Run WSS, only in prod/outbound mode (`RELAY_CLOUD_URL` set) |
| **TaskManager** | ✅ Running | Bridge WS on dynamic port (9400-9499, printed in relay startup logs) |
| **MCPHost** | ✅ Running | Playwright MCP via stdio, connects to Chrome CDP |
| **ChromePool** | ✅ Running | Per-task tab isolation |
| **Cloudflare Tunnel** | Manual | Must be started manually for prod connectivity |
| **ScriptRecorder** | ✅ Active | Records new skills during LLM execution |
| **ScriptCompiler** | ✅ Active | Compiles recordings to native Playwright JS |

### Record → Replay Pipeline State

| Phase | Location | Status |
|-------|----------|--------|
| **Record** (ScriptRecorder) | Runs on Cloud Run during LLM execution | ✅ Captures MCP tool calls |
| **Compile** (ScriptCompiler) | Runs on Cloud Run after successful task | ✅ Generates native Playwright JS |
| **Store** (ScriptStore) | Saves to `compiled/` directory | ✅ 500+ scripts persisted |
| **Replay** (ScriptPlayer) | Runs compiled scripts as child processes | ✅ ~10s execution vs 1-5min LLM |
| **Fallback** | Script fails → automatic LLM fallback | ✅ Re-records on success |

### Not Yet Implemented

| Feature | Status | Notes |
|---------|--------|-------|
| Razorpay Live mode | ❌ Test only | Switch keys for real payments |
| Voice interface | ❌ Not started | Web Speech API mentioned in PITCH.md |
| Mobile app | ❌ Not started | React Native mentioned in roadmap |
| Multi-laptop scaling | ❌ Not started | Currently single operator |
| Preference learning | ❌ Not started | User-specific workflow memory |
