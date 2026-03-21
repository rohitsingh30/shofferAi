# Message Rewrite Layer — Architecture & Design

> How ShofferAI prevents internal browser agent messages from reaching users.

## The Problem

The browser automation agent (Copilot CLI + Playwright MCP) generates dozens of internal messages per task — observations ("I can see the page loaded"), action narration ("Let me click the search button"), reasoning ("Step 0 asks for product, but it's already provided"), and browser mechanics ("The modal has opened"). These are Claude's "thinking out loud" and must **never** reach the user's chat UI.

Previous approach: regex-based blocklist (`shouldSuppressMessage()`). This was whack-a-mole — every new LLM phrasing required adding more regex patterns. Multi-sentence messages bypassed `^`-anchored patterns entirely.

## Solution: Two-Tier Filtering

```
Browser Agent message
        │
        ▼
┌──────────────────────────────┐
│  Tier 1: Regex Fast Path     │  shouldSuppressMessage()
│  ~90% caught instantly       │  Free, <1ms
│  packages/shared/src/        │
│  internal-message-filter.ts  │
└──────────┬───────────────────┘
           │ passes regex
           ▼
┌──────────────────────────────┐
│  Tier 2: AI Rewrite Layer    │  MessageRewriter.rewrite()
│  LLM classify + rewrite     │  ~200ms via gpt-4o-mini
│  packages/agent-core/src/    │
│  message-rewriter.ts         │
└──────────┬───────────────────┘
           │ SUPPRESS or rewritten text
           ▼
┌──────────────────────────────┐
│  SSE → User's Chat UI        │
│  Only clean, user-facing     │
│  messages reach here          │
└──────────────────────────────┘
```

## Tier 1: Regex Fast Path

**File:** `packages/shared/src/internal-message-filter.ts`

Three exported functions:
- `isInternalToolLabel(message)` — tool names, `Browser: X` labels, status labels
- `isAgentNarration(message)` — 100+ patterns across 7 categories
- `shouldSuppressMessage(message)` — combined gate (calls both above)

**Key design decisions:**
- **Sentence splitting**: Messages are split on `.!?` boundaries. Each sentence is tested independently. If ANY sentence is narration → whole message suppressed. This prevents "Good, the page loaded. Let me click..." from slipping through.
- **Filler prefix stripping**: Common LLM filler phrases ("Good,", "Great,", "Got it,", "OK so", "Alright,", "Done,") are stripped before testing patterns.
- **7 pattern categories**: observational, action, status, third-person, browser internals, reasoning, chain-of-thought

**Applied at 5 gates (defense-in-depth):**
1. `apps/playwright/src/task-manager.ts` — filters `assistant.message` from Copilot CLI
2. `apps/playwright/src/bridge-mcp-server.ts` — filters `send_progress` tool calls
3. `packages/agent-core/src/agent.ts` — filters LLM text blocks
4. `apps/web/app/api/agent/execute/route.ts` — filters relay messages + callbacks
5. `apps/web/components/chat/ChatInterface.tsx` — client-side last defense

## Tier 2: AI Rewrite Layer

**File:** `packages/agent-core/src/message-rewriter.ts`

Messages that pass the regex (~10%) go through a lightweight LLM call:

```typescript
const rewriter = getMessageRewriter(); // lazy singleton
const result = await rewriter.rewrite(message);
// result is null (suppress) or a clean string (rewritten text)
```

**LLM prompt** classifies each message as either:
- `SUPPRESS` — internal narration, reasoning, browser mechanics
- A clean 1-2 sentence rewrite — if the message has genuinely useful info

**Safety nets:**
- Post-rewrite regex check: if the LLM's rewrite is itself narration, it's suppressed
- Fallback on error: if the LLM call fails, the original message passes through (it already cleared the regex)

**Configuration:**
```env
REWRITER_MODEL=gpt-4o-mini   # Fast/cheap model for rewriting (defaults to LLM_MODEL)
```

## Integration Points

**In `apps/web/app/api/agent/execute/route.ts`:**

```typescript
// Relay messages (browser agent → cloud)
case 'task_progress':
  if (!msg.step) {
    getMessageRewriter().rewrite(msg.message).then(rewritten => {
      if (rewritten) send('message', { content: rewritten });
    });
  }
  break;

// Chat-only mode (cloud LLM → frontend)
onMessage(content) {
  getMessageRewriter().rewrite(content).then(rewritten => {
    if (rewritten) send('message', { content: rewritten });
  });
}
```

Both paths use `.then()` to stay non-blocking in the SSE stream.

## What the User Sees vs What's Internal

| User sees | Internal (suppressed) |
|-----------|----------------------|
| "Here are 3 hotels under ₹4000" | "I can see the search results show 3 hotels" |
| "Which variant would you like?" | "Let me click on the product card" |
| "Your order is confirmed! ID: #12345" | "The page shows order confirmation" |
| "₹1,299 for boAt Airdopes 161" | "The price is within budget. Proceed to checkout." |
| *(nothing — suppressed)* | "Good, Blinkit is loaded. Let me set the delivery location." |
| *(nothing — suppressed)* | "Step 0 asks for product. But product is known. Skip." |

## Testing

**Regex filter tests:** `packages/shared/src/internal-message-filter.test.ts` (31 tests)
- Multi-sentence message splitting
- Filler prefix stripping
- False positive checks (legitimate messages must pass through)

**AI rewriter tests:** `packages/agent-core/src/message-rewriter.test.ts` (8 tests)
- Mock LLM client — no real API calls
- Tests: SUPPRESS, rewrite, empty response, fallback on error, narration-in-rewrite

## Cost & Performance

| Metric | Tier 1 (Regex) | Tier 2 (AI) |
|--------|---------------|-------------|
| Latency | <1ms | ~200ms |
| Cost | Free | ~$0.001/message |
| Hit rate | ~90% of messages | ~10% of messages |
| Messages per task | ~50-100 caught | ~5-10 processed |
| Estimated cost/task | $0 | ~$0.005-0.01 |

## Files

| File | Purpose |
|------|---------|
| `packages/shared/src/internal-message-filter.ts` | Regex fast path (Tier 1) |
| `packages/shared/src/internal-message-filter.test.ts` | 31 tests for regex filter |
| `packages/agent-core/src/message-rewriter.ts` | AI rewrite layer (Tier 2) |
| `packages/agent-core/src/message-rewriter.test.ts` | 8 tests for AI rewriter |
| `apps/web/app/api/agent/execute/route.ts` | Integration point (both tiers) |
