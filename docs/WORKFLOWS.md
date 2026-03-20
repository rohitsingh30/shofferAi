# ShofferAI — E2E Workflows

> **Version**: 1.1
> **Last Updated**: March 19, 2026

---

## Agent Execution Pipeline

Every user request follows this pipeline:

```mermaid
graph LR
    MSG["User Message"] --> MATCH["Match Skill<br/>+1 trigger, +3 domain"]
    MATCH --> LESSONS["Load Lessons<br/>top 10, confidence ≥ 0.3"]
    LESSONS --> PROMPT["Build System Prompt<br/>user context + skill + lessons"]
    PROMPT --> CHECK{"Compiled<br/>script?"}
    CHECK -->|"Yes"| INSTANT["⚡ Instant Mode<br/>ScriptPlayer"]
    CHECK -->|"No"| AI["🤖 AI Mode<br/>LLM Tool Loop"]
    INSTANT -->|"Script fails"| AI
    AI --> RECORD["ScriptRecorder<br/>saves new script"]
    INSTANT --> DONE["✅ Complete"]
    RECORD --> DONE
    AI --> DONE
```

### Execution Modes

| Mode | When | How | Speed |
|------|------|-----|-------|
| **Instant** | Compiled script exists for skill | `ScriptPlayer` replays pre-recorded Playwright steps | ~10s |
| **AI** | No script, or script failed | LLM reasons + calls MCP tools (max 50 iterations) | 1-5 min |
| **Hybrid** | Script fails mid-execution | Falls back to AI mode + `ScriptRecorder` captures new script | Variable |

---

## Workflow 1: Hotel Booking (Booking.com)

**Skill**: `booking-com-hotel`
**Triggers**: "book hotel", "find hotel", "booking.com", "accommodation"

```mermaid
sequenceDiagram
    actor User
    participant Agent
    participant Browser as Chrome (booking.com)
    participant Pay as Razorpay

    User->>Agent: "Book hotel in Mumbai, March 25-27, under ₹8000"
    
    Agent->>Browser: Open new tab → booking.com
    Agent->>Browser: Enter destination: Mumbai
    Agent->>Browser: Set dates: March 25-27
    Agent->>Browser: Click Search
    
    Agent-->>User: "Searching hotels..."
    
    Agent->>Browser: Filter by price (under ₹8000)
    Agent->>Browser: Read property cards
    Agent-->>User: "Found 12 options. Top pick: Hotel Marine Plaza, ₹6,500/night"
    
    Agent->>User: ask_user("Which hotel would you like?")
    User->>Agent: "Marine Plaza looks good"
    
    Agent->>Browser: Click hotel → Room selection page
    Agent->>Browser: Select room type
    Agent->>Browser: Fill guest details (from operator profile)
    
    Agent->>User: collect_payment({amount: 13000, summary: "Hotel Marine Plaza..."})
    
    Note over Agent: ⏸️ PAUSED — waiting for payment
    
    User->>Pay: Pay ₹13,200 (₹13,000 + ₹200 tip)
    Pay-->>Agent: Payment confirmed
    
    Note over Agent: ▶️ RESUMED
    
    Agent->>Browser: Click "Confirm Booking"
    Agent->>Browser: Read confirmation number
    Agent-->>User: "✅ Booked! Confirmation #HMP-2026-1234"
    
    Agent->>Browser: Close tab
```

**Booking.com Key Selectors:**
```
[data-testid="property-card"]              → hotel search result card
[data-testid="title"]                      → hotel name
[data-testid="price-and-discounted-price"] → price
[data-testid="review-score"]               → review score
[data-testid="title-link"]                 → hotel detail link
[data-testid="user-details-firstname"]     → first name field
[data-testid="user-details-lastname"]      → last name field
[data-testid="user-details-email"]         → email field
[data-testid="phone-number-input"]         → phone field
```

**Files:**
- `packages/agent-core/src/scripts/compiled/booking-com-hotel.v2.json` — 13-step declarative skill
- `packages/agent-core/src/scripts/compiled/booking-com-hotel.ts` — Compiled Playwright script

---

## Workflow 2: Grocery Ordering (Blinkit)

**Skill**: `blinkit-grocery`
**Triggers**: "order groceries", "blinkit", "quick delivery", "10 minutes"

```mermaid
sequenceDiagram
    actor User
    participant Agent
    participant Browser as Chrome (blinkit.com)

    User->>Agent: "Order milk and bread from Blinkit"
    
    Agent->>User: ask_user("What's your delivery address?")
    User->>Agent: "HSR Layout, Bangalore"
    
    Agent->>Browser: Open new tab → blinkit.com
    Agent->>Browser: Set delivery location: HSR Layout
    
    Note over Agent,Browser: Login MUST happen before searching
    
    Agent->>Browser: Login with operator phone (8109137158)
    Agent->>Browser: Enter OTP (operator provides)
    
    loop For each item
        Agent->>Browser: Search "milk"
        Agent->>Browser: Read product variants
        Agent->>User: ask_user("Which milk? Amul Taaza 500ml ₹27 or Mother Dairy 1L ₹62?")
        User->>Agent: "Amul 500ml"
        Agent->>Browser: Add to cart
    end
    
    Agent->>Browser: Go to cart
    Agent->>User: confirm_action("Cart: Amul Milk ₹27 + Bread ₹40 = ₹67. Proceed?")
    User->>Agent: "Yes"
    
    Agent->>User: confirm_action("Checkout total ₹67. Place order?")
    User->>Agent: "Yes"
    
    Agent->>Browser: Place order
    Agent->>Browser: Read order confirmation
    Agent-->>User: "✅ Order placed! Delivery in 10 mins. Order #BLK-12345"
    
    Agent->>Browser: Close tab
```

**Critical Notes:**
- **Login FIRST** — Blinkit blocks checkout without login
- **Location popup** — First thing Blinkit shows; set address before anything else
- **OTP goes to operator** — Phone 8109137158, not user's phone
- **Min order** — Usually ₹99-149; warn user if below minimum
- Use `confirm_action` for cart review (no money), then again at checkout

**File:** `packages/agent-core/src/skills/blinkit-grocery/SKILL.md`

---

## Workflow 3: Restaurant Browsing (Zomato)

**Skill**: `zomato-restaurant`
**Triggers**: "zomato", "restaurant", "food delivery", "order food"

```mermaid
sequenceDiagram
    actor User
    participant Agent
    participant Browser as Chrome (zomato.com)

    User->>Agent: "Find good biryani places near Koramangala"
    
    Agent->>Browser: Open new tab → zomato.com
    Agent->>Browser: Set location: Koramangala, Bangalore
    Agent->>Browser: Search "biryani"
    
    Agent->>Browser: Read restaurant list
    Agent-->>User: "Found top options:<br/>1. Meghana Foods ⭐4.3 - ₹350 for 2<br/>2. Paradise Biryani ⭐4.1 - ₹400 for 2<br/>3. Behrouz ⭐4.0 - ₹500 for 2"
    
    Agent->>User: ask_user("Which restaurant interests you?")
    User->>Agent: "Meghana Foods"
    
    Agent->>Browser: Open Meghana Foods page
    Agent->>Browser: Read menu items
    Agent-->>User: "Menu highlights:<br/>- Chicken Dum Biryani ₹299<br/>- Mutton Biryani ₹399<br/>- Veg Biryani ₹199"
    
    Agent->>User: ask_user("Want to add items to cart?")
    User->>Agent: "Yes, 1 chicken biryani"
    
    Agent->>Browser: Add Chicken Dum Biryani to cart
    Agent->>Browser: Go to checkout
    Agent-->>User: "Cart: 1x Chicken Dum Biryani = ₹299 + delivery"
```

---

## Credential Vault Flow

How site credentials are stored and injected:

```mermaid
graph TD
    subgraph STORE["💾 Storing Credentials"]
        USER["Operator enters creds<br/>via /api/credentials"] --> ENCRYPT["CredentialVault.store()<br/>AES-256-GCM encrypt"]
        ENCRYPT --> DB["PostgreSQL<br/>Credential table<br/>{encryptedData, iv, tag}"]
    end
    
    subgraph INJECT["🔐 Injecting at Runtime"]
        AGENT["Agent needs to login"] --> VAULT["CredentialVault.retrieve()<br/>AES-256-GCM decrypt"]
        VAULT --> DB
        DB --> CREDS["Plaintext credentials"]
        CREDS --> INJECTOR["CredentialInjector.fill()<br/>Types into browser form"]
        INJECTOR --> BROWSER["Chrome form filled<br/>via Playwright MCP"]
    end
    
    style STORE fill:#e3f2fd,stroke:#1565c0
    style INJECT fill:#e8f5e9,stroke:#2e7d32
```

**Credential Types** (defined in `packages/shared/src/credentials.ts`):
- `SiteLoginData` — email/phone + password
- `CardData` — card number, expiry, CVV, cardholder
- `UPIData` — UPI ID
- `AddressData` — street, city, state, pincode, phone

---

## Chrome Pool & Tab Management

```mermaid
graph TD
    subgraph POOL["🏊 ChromePool (Laptop)"]
        direction TB
        SLOTS["Pool Slots<br/>Max concurrent tabs"]
        
        SLOT0["Slot 0: task-abc<br/>booking.com"]
        SLOT1["Slot 1: task-def<br/>blinkit.com"]
        SLOT2["Slot 2: (available)"]
        
        SLOTS --> SLOT0
        SLOTS --> SLOT1
        SLOTS --> SLOT2
    end
    
    REQ1["SessionMCPHost<br/>sessionId: task-abc"] -->|"getOrCreateTab"| SLOT0
    REQ2["SessionMCPHost<br/>sessionId: task-def"] -->|"getOrCreateTab"| SLOT1
    REQ3["SessionMCPHost<br/>sessionId: task-ghi"] -->|"getOrCreateTab"| SLOT2
    
    DONE["SessionEndRequest<br/>sessionId: task-abc"] -->|"releaseTab"| SLOT0
    SLOT0 -.->|"Tab closed<br/>slot available"| SLOTS
    
    style POOL fill:#fff3e0,stroke:#e65100,stroke-width:2px
```

Each `sessionId` maps to exactly one Chrome tab. Tabs are created on demand and released when the task completes (via `SessionEndRequest`). This enables concurrent task execution without tab conflicts.

---

## Record → Compile → Replay Pipeline (Caching)

The core optimization that makes second-and-beyond executions **10x faster**. On first run, the LLM drives browser actions while `ScriptRecorder` captures every MCP tool call. On success, the recording is compiled to native Playwright code. Next time the same skill runs, `ScriptPlayer` replays the compiled script in ~10 seconds — no LLM needed.

```mermaid
graph LR
    subgraph FIRST["🤖 First Execution (1-5 min)"]
        LLM["LLM Tool Loop"] --> MCP["MCP Tool Calls"]
        MCP --> REC["ScriptRecorder<br/>captures every action"]
        REC --> COMP["ScriptCompiler<br/>→ native Playwright JS"]
        COMP --> STORE["ScriptStore<br/>saves to compiled/"]
    end

    subgraph NEXT["⚡ Next Execution (~10s)"]
        CHECK["ScriptPlayer.hasScript()"] --> PLAY["ScriptPlayer.play()<br/>runs compiled .js"]
        PLAY --> DONE["✅ Complete"]
        PLAY -->|"Script fails"| FALLBACK["Fall back to LLM<br/>+ re-record"]
    end

    STORE -.->|"Cached"| CHECK
```

### Pipeline Components

| Component | File | Role |
|-----------|------|------|
| **ScriptRecorder** | `packages/agent-core/src/scripts/recorder.ts` | Captures MCP tool calls, extracts selector hints, templatizes args |
| **ScriptCompiler** | `packages/agent-core/src/scripts/compiler.ts` | Converts RecordedAction[] → native Playwright JS with resilient `.or()` selectors |
| **ScriptPlayer** | `packages/agent-core/src/scripts/player.ts` | Executes compiled scripts as child processes, handles interactive flows (OTP, confirmations) via stdin/stdout JSON messaging |
| **ScriptStore** | `packages/agent-core/src/scripts/store.ts` | Persists compiled scripts to `compiled/` as `{skillId}.generated.js` + `{skillId}.v{N}.json` |

### What Gets Cached

- **MCP tool call sequences** — every `browser_navigate`, `browser_click`, `browser_type`, etc.
- **Stable selectors** — extracted from element descriptions (data-testid, roles, text)
- **Template bindings** — user-specific values replaced with `{{param}}` placeholders
- **Interactive markers** — OTP entry, user confirmations, credential fills marked as `interactive` actions
- **Auto-compiled Playwright code** — standalone .js files that run without LLM or MCP

### Interactive Flow Handling

Compiled scripts communicate with the agent via **stdin/stdout JSON protocol** during replay:

```
ScriptPlayer spawns → node compiled-script.js '{"destination":"Mumbai"}'
                        ↓
Script encounters OTP step → stdout: {"type":"need_input","prompt":"Enter OTP"}
                        ↓
ScriptPlayer → ask_user("Enter OTP") → user responds "123456"
                        ↓
ScriptPlayer → stdin: {"type":"input","value":"123456"}
                        ↓
Script continues execution...
```

### Current State

- **500 skills** with SKILL.md definitions in `packages/agent-core/src/skills/`
- **500+ compiled scripts** in `packages/agent-core/src/scripts/compiled/`
- Scripts stored as both `.ts` (TypeScript with exported constants) and `.generated.js` (auto-compiled)
- Compilation happens **on the laptop** where Playwright runs

---

## SSE Event Types

The agent streams events to the frontend via Server-Sent Events:

| Event Type | Payload | When |
|------------|---------|------|
| `message` | `{content: string}` | LLM natural-language text for the user |
| `step_update` | `{action, status}` | Milestone step completed (e.g. skill activation) |
| `input_required` | `{taskId, stepId, question, inputType, options?, ...}` | Agent needs user input (OTP, choice, address) |
| `payment_required` | `{taskId, bookingSummary, amountCents, ...}` | Agent wants to collect payment |
| `error` | `{error: string}` | Something went wrong |
| `complete` | `{summary: string}` | Task finished successfully |

### What the User Does NOT See

Internal tool calls and status labels are **filtered out** before reaching the chat UI:

| Suppressed Pattern | Example | Where Logged Instead |
|---|---|---|
| `Browser: <toolname>` | `Browser: report_intent` | `logger.info` in relay terminal |
| Raw tool names | `browser_navigate`, `mcp__playwright__browser_click` | `logger.info` in relay terminal |
| Status labels | `Agent starting...`, `Thinking...` | `logger.info` in relay terminal |
| Tool execution events | `assistant.tool_call`, `tool.execution_start` | `mcpToolEvents` → MCP log stream (dynamic port, printed in relay logs) |

**Three-layer filtering** prevents internal details from reaching users:
1. **task-manager.ts**: `isInternalToolLabel()` filters `assistant.message` events at the source
2. **execute/route.ts**: Defense-in-depth filter on `task_progress` before sending SSE
3. **ChatInterface.tsx**: Frontend hides `step_update` events with `status: 'running'`

The shared filter lives in `packages/shared/src/internal-message-filter.ts`.
