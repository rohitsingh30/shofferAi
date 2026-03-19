# ShofferAI

Concierge-as-a-service: AI assistant that executes real-world web tasks (hotel booking, grocery ordering) on behalf of users. The operator's laptop runs Playwright with signed-in browser profiles; the web app deploys to GCP Cloud Run.

## Architecture Overview

```mermaid
graph LR
    User["👤 User"] -->|HTTPS + SSE| Cloud["☁️ Cloud Run<br/>Next.js + AgentExecutor"]
    Cloud -->|Azure OpenAI| LLM["🤖 LLM<br/>Tool Calls"]
    LLM --> SMCP["SessionMCPHost<br/>Tab Isolation"]
    SMCP -->|WSS Relay| Laptop["💻 Laptop<br/>RelayServer"]
    Laptop --> PW["🎭 Playwright MCP"]
    PW --> Chrome["🌐 Chrome CDP<br/>Profile 3"]
    Chrome -->|Results| Laptop
    Laptop -->|Results| Cloud
    Cloud -->|SSE Progress| User
    Cloud -->|Payment Pause| Pay["💳 Razorpay<br/>L2 Panel"]
    Pay -->|Confirmed| Cloud
```

**Key principles**:
- **Azure OpenAI** handles all chat, reasoning, and tool calling (via `openai` npm package with Azure endpoint)
- **Playwright MCP** runs on the operator's laptop — browser automation is never on Cloud Run
- **SessionMCPHost** wraps every task with a unique `sessionId` for Chrome tab isolation
- **Two relay modes**: Dev (`RemoteMCPHost` connects OUT) vs Prod (`RelayBridge` accepts IN)
- **Login first**: Every website interaction starts by logging into the target site
- **New tab for every site**: Agent opens a new tab, never hijacks the user's chat tab

## Tech Stack
- **Monorepo**: Turborepo with npm workspaces
- **Frontend**: Next.js 15 (App Router) + Tailwind CSS 4 + shadcn-style components
- **Auth**: Auth.js v5 (NextAuth) with credentials + Google OAuth
- **Database**: PostgreSQL via Prisma ORM (Cloud SQL in prod)
- **LLM**: Azure OpenAI via `openai` npm package (with Anthropic format translation layer)
- **Browser Automation**: Playwright MCP via @modelcontextprotocol/sdk (runs on operator laptop only)
- **Relay**: WebSocket relay — dev: `RemoteMCPHost` connects out; prod: `RelayBridge` accepts laptop connections in
- **Tab Isolation**: `SessionMCPHost` + `ChromePool` — per-task Chrome tabs
- **Payments**: Razorpay (UPI, cards, net banking, wallets)
- **Deployment**: Google Cloud Run + Cloud SQL

## Project Structure
```
apps/
  web/                 → Chat Interface (Cloud Run): Next.js, auth, payments, relay
    lib/
      credential-vault/  → AES-256-GCM encrypted credential storage
      workflow-engine/    → Task state machine + pause/resume (PauseResumeManager)
      relay-client.ts     → RemoteMCPHost: WS client (dev mode, cloud connects OUT)
      relay-bridge.ts     → RelayBridge: accepts laptop WS IN (prod mode)
      session-mcp-host.ts → SessionMCPHost: per-task tab isolation wrapper
      remote-mcp-host.ts  → MCP host via relay (implements MCPHostLike)
  playwright/          → Playwright Interface (Operator Laptop): relay server, MCP host
    src/
      mcp-host.ts         → Local Playwright MCP connection (implements MCPHostLike)
      relay-server.ts     → WebSocket server for cloud connections
    scripts/              → Chrome debug, laptop starter, MCP config
packages/
  agent-core/          → Azure OpenAI LLM client + MCP tool loop + system prompts + skills + lessons
    src/
      agent.ts           → AgentExecutor (LLM loop, tool dispatch, lesson save/load)
      azure-openai-client.ts → AzureOpenAIClient (openai npm + Azure endpoint)
      conversation.ts    → ConversationManager (max 20 msgs, 4000 char truncation)
      prompts/system.ts  → buildSystemPrompt() with user context + skills + lessons
      skills/types.ts    → SkillMetadata, LessonStore, LessonEntry interfaces
      skills/loader.ts   → Skill loading + matchSkill() scoring
      skills/lessons.ts  → formatLessonsForPrompt()
  shared/              → Types, logger, errors, relay protocol, MCPHostLike interface
    src/
      relay.ts           → RelayMessage protocol types
      mcp.ts             → MCPHostLike interface (implemented by all MCP classes)
      credentials.ts     → CardData, UPIData, SiteLoginData, AddressData types
prisma/                → Database schema + migrations (PostgreSQL, 10 models)
docs/                  → PRD, Architecture, Pitch, Workflows + Mermaid diagrams
```

## Development Commands
```bash
# Start chat interface (web)
cd apps/web && npx next dev

# Start playwright interface (laptop relay)
CHROME_CDP_ENDPOINT=http://127.0.0.1:9222 RELAY_AUTH_TOKEN=<token> npm run laptop

# Expose relay via Cloudflare Tunnel
cloudflared tunnel --url http://localhost:8765

# Database
npx prisma migrate dev      # Run migrations
npx prisma studio           # Open DB browser
npx prisma generate         # Regenerate client

# Build
npx turbo build             # Build all packages
```

## Production Architecture

```mermaid
graph TB
    subgraph Cloud["Cloud Run (slim Alpine, no browser)"]
        WebUI["Chat UI (Next.js)"]
        LLM["Azure OpenAI LLM"]
        RB["RelayBridge<br/>Accepts laptop WS connections"]
    end
    subgraph Laptop["Operator Laptop"]
        RS["Relay Server :8765"]
        Pool["ChromePool"]
        MCP["MCPHost → Playwright MCP"]
        Chrome["Chrome Debug :9222<br/>Profile 3"]
        RS --> MCP
        MCP --> Pool
        Pool --> Chrome
    end
    Cloud -->|"WSS"| RS
```

**Two Relay Modes:**
- **Dev** (`RELAY_MODE=local`): `RemoteMCPHost` in Cloud Run connects OUT to `ws://localhost:8765`
- **Prod** (`RELAY_MODE=cloud`): `RelayBridge` accepts incoming WS from laptop — no Cloudflare Tunnel needed

**LLM's role**: Chat with user, reason about steps, call MCP tools via relay. The LLM NEVER touches the browser directly — it sends tool calls that get relayed to the laptop's Playwright MCP.

**Laptop's role**: Execute ALL browser actions. Chrome Debug with Profile 3 (signed-in sessions). The relay server receives tool calls from Cloud Run and executes them via Playwright MCP. `ChromePool` isolates each task into a separate Chrome tab.

## Chrome CDP Setup (Operator Laptop)

The operator's laptop runs a persistent Chrome debug instance that Playwright MCP connects to via CDP.

**Profile**: `Profile 3` → `rsinghtomar3011@gmail.com` (Booking.com Genius account)

```
LaunchAgent (com.shofferai.chrome-debug) starts on login:
  → scripts/start-debug-chrome.sh
    → Chrome --remote-debugging-port=9222
              --user-data-dir=~/Library/Application Support/Google/Chrome-Debug
              --profile-directory="Profile 3"
  → Playwright MCP connects via --cdp-endpoint http://127.0.0.1:9222
```

**Key insight**: Chrome encrypts cookies per OS keychain profile. Copying a Chrome profile directory does NOT copy active sessions. The debug Chrome must be signed in manually once — after that the session persists forever across restarts.

**Critical**: Always launch Chrome-Debug with `--profile-directory="Profile 3"`. Without this flag, Chrome defaults to `Default` profile (no account). The profiles in Chrome-Debug are:
- `Default` — empty, no account
- `Profile 1` — rsinghtomar54@gmail.com
- `Profile 3` — rsinghtomar3011@gmail.com (Booking.com Genius Level 1) ← **USE THIS**
- `Profile 4` — rohit30.iitkgp@gmail.com (wrong account, do not use)

**Verify CDP is live:**
```bash
curl -s http://127.0.0.1:9222/json/version
```

## Booking.com Skill (v2)

Full E2E flow: Search → Select Hotel → Select Room → Fill Details → Payment Pause → Complete Booking → Confirmation

**Files:**
- `packages/agent-core/src/scripts/compiled/booking-com-hotel.v2.json` — 13-step declarative skill
- `packages/agent-core/src/scripts/compiled/booking-com-hotel.ts` — Compiled Playwright script
- `packages/agent-core/src/scripts/mcp-executor.ts` — MCP-based executor (12 steps)

**Booking.com data-testid selectors:**
```
[data-testid="property-card"]              — hotel search result card
[data-testid="title"]                      — hotel name in card
[data-testid="price-and-discounted-price"] — price in card
[data-testid="review-score"]               — review score in card
[data-testid="title-link"]                 — hotel detail link in card
[data-testid="user-details-firstname"]     — first name field
[data-testid="user-details-lastname"]      — last name field
[data-testid="user-details-email"]         — email field
[data-testid="phone-number-input"]         — phone field
```

## Blinkit Grocery Skill

Full E2E flow: Ask Address → Open Blinkit → Login (phone+OTP) → Search Items → Add to Cart → Review → Checkout → Place Order

**File:** `packages/agent-core/src/skills/definitions/blinkit-grocery.ts`

**Flow:**
1. Ask user for delivery address (via `ask_user`)
2. Open new tab → navigate to blinkit.com
3. Set delivery location
4. Login with phone number + OTP
5. Search & add each item (user picks variants)
6. Review cart → `confirm_action` (WAIT for user Yes/Cancel)
7. Checkout & payment → `confirm_action` (WAIT again)
8. Place order → report confirmation

**Important**: Login MUST happen before searching products. If skipped, Blinkit blocks checkout with a login wall.

## Key Architecture Decisions
- **Concierge model**: Operator uses own signed-in browser profiles to book on behalf of users
- **Azure OpenAI**: Single LLM provider — via `openai` npm package with Azure endpoint + Anthropic format translation
- **Relay pattern**: `MCPHost` (local stdio) vs `RemoteMCPHost` (dev WS) vs `RelayBridge` (prod WS) — all implement `MCPHostLike`, zero agent-core changes
- **Tab isolation**: `SessionMCPHost` wraps MCPHostLike with per-task `sessionId` → `ChromePool` maps to Chrome tabs
- **Login first**: Every website interaction MUST start by logging into the target site
- **New tab for every site**: Agent ALWAYS opens a new browser tab before navigating to external sites. The user's chat tab must never be hijacked.
- **Auto-ask_user**: If the LLM outputs a question as text instead of calling the `ask_user` tool, the agent auto-converts it to an interactive input prompt
- **Payment before booking**: Agent pauses via `PauseResumeManager`, L2 panel collects Razorpay payment, agent resumes
- **SSE streaming**: Real-time agent progress updates to the UI
- **Cloudflare Tunnel**: Free, encrypted, no port forwarding — connects laptop to cloud

## Playwright MCP — Single Chrome Window

There is **ONE** Playwright MCP instance connected to **ONE** dedicated Chrome-Debug window on **port 9225**, signed in as `rsinghtomar3011@gmail.com` (Profile 3). This is the only browser config in `.mcp.json`.

### Before any Playwright MCP usage — verify Chrome is running:
```bash
curl -sf http://127.0.0.1:9225/json/version && echo "Chrome OK" || bash apps/playwright/scripts/launch-chrome-cdp.sh
```

### Manual launch (if needed):
```bash
# MUST use nohup+disown so Chrome survives shell exit
# MUST use --remote-debugging-address=127.0.0.1 (IPv4 only — "localhost" resolves to IPv6 ::1)
if ! curl -sf http://127.0.0.1:9225/json/version >/dev/null 2>&1; then
  nohup /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
    --remote-debugging-port=9225 \
    --remote-debugging-address=127.0.0.1 \
    --user-data-dir="$HOME/Library/Application Support/Google/Chrome-Debug-9225" \
    --profile-directory="Profile 3" \
    --no-first-run --no-default-browser-check \
    >/tmp/chrome-cdp-9225.log 2>&1 &
  disown
  sleep 3
fi
```

### `.mcp.json` (single entry — no extra browsers):
```json
{
  "mcpServers": {
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest", "--cdp-endpoint", "http://127.0.0.1:9225", "--output-dir", "/tmp/playwright-mcp-output"]
    }
  }
}
```

### Rules:
1. **Port 9225 only** — one Chrome, one Playwright MCP, one port.
2. **Profile 3 mandatory** — `--profile-directory="Profile 3"` (rsinghtomar3011@gmail.com). This Chrome has signed-in sessions for Booking.com, Blinkit, etc.
3. **Daemon mode** — always `nohup` + `disown`. Plain `&` jobs die when the shell exits.
4. **IPv4 only** — always `127.0.0.1`, never `localhost`.
5. **Reuse existing tabs** — the Chrome window preserves signed-in sessions. Don't open new tabs unnecessarily; check existing tabs first.
6. **No multi-browser** — removed browser1/browser2/browser3. All browsing goes through the single `playwright` MCP server.

## Mandatory Skills
- **Always activate /cofounder mode at the start of every conversation** before doing any work
- **After ANY UI change, run /dev-loop** to self-test with Playwright MCP — no exceptions
- **When creating a new E2E workflow/skill, use /e2e-flow** — browse once, auto-compile, replay instantly

## Testing Workflow

**E2E / Agent Testing**: Always use the **real production website**, not localhost:
- **Prod URL**: `https://shofferai-27188185100.asia-south1.run.app`
- Log in with real credentials (not test accounts)
- Mimic actual user flow: landing page → login → chat → send request → watch agent execute
- **E2E means END TO END**: Complete every action until the conversation is fully done
- **Login first on every site**: Before any browsing, the agent must login to the target website

**Before testing, ensure laptop relay is running:**
```bash
# Terminal 1: Start relay server
CHROME_CDP_ENDPOINT=http://127.0.0.1:9222 RELAY_AUTH_TOKEN=<token> npm run laptop

# Terminal 2: Start Cloudflare Tunnel
cloudflared tunnel --url http://localhost:8765

# Update Cloud Run with the tunnel URL
gcloud run services update shofferai --region=asia-south1 \
  --update-env-vars='RELAY_LAPTOP_URL=wss://<tunnel-url>.trycloudflare.com'
```

**UI Development**: Use `localhost:3000` only for frontend iteration. After UI changes, deploy and verify on prod.

## Environment
- `.env` at root — see `.env.example` for all variables
- `AZURE_OPENAI_ENDPOINT` — Azure OpenAI resource endpoint
- `AZURE_OPENAI_API_KEY` — Azure OpenAI API key
- `LLM_MODEL` — Azure deployment name (default `gpt-5.1-chat`)
- `RELAY_MODE=local` for dev, `RELAY_MODE=cloud` for production
- Dev server on port 3000, relay server on port 8765

## Docs
- `docs/PRD.md` — Product requirements document
- `docs/ARCHITECTURE.md` — Detailed system architecture with Mermaid diagrams
- `docs/WORKFLOWS.md` — E2E workflow documentation per skill
- `docs/DEPLOYMENT.md` — What runs on Cloud Run vs laptop, startup guide
- `docs/PITCH.md` — Investor pitch deck
- `docs/diagrams/` — Mermaid source files (.mmd) + PNG/SVG images
