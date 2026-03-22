# ShofferAI — E2E Latency Optimization

> **Last Updated**: March 22, 2026
> **Status**: Phase 1 shipped to prod, Phase 2 (compiled scripts) in progress

---

## 1. Real Numbers (Before Optimization)

Data from prod telemetry dashboard (`/dashboard/admin` → ⏱ Latency tab), 118 tasks:

| Metric | P50 | Average | P95 | Max |
|--------|-----|---------|-----|-----|
| **TTFM** (time to first message) | 27.5s | 1.3m | 3.9m | 6.7m |
| **browser_execution** | 6.1m | 6.0m | — | — |
| **llm_chat** (Cloud Run) | 16s | 1.1m | — | — |
| **handoff_setup** (warm) | 1ms | — | — | — |
| **handoff_setup** (cold) | — | 23.6s | 1min | — |

**LLM call stats** (200 calls total):
- Average input tokens: **22,189** per call
- Average duration: **3.4s** per call
- 99.5% of tokens were INPUT (prompt bloat)
- Root cause: 501 skill summaries injected into every prompt (~20k tokens wasted)

**Task waterfall example (Flipkart, warm relay, TTFM=11.2s):**
```
auth:            31ms
task_setup:      38ms
skill_match:      4ms
llm_chat:     5,773ms  (LLM call 1: 3.2s 21k tok + LLM call 2: 2.3s 21k tok)
handoff_setup:    0ms  (warm relay)
browser_exec: 138,000ms
TTFM:        11,200ms
```

**Cold relay waterfall (TTFM=28.7s):**
- Same as above but `handoff_setup: 14,500ms`

---

## 2. Root Cause Analysis

### Why TTFM was 27.5 seconds (not 1s as theorized)

```
┌──────────────────────────────────────────────────────┐
│  PHASE             │ BEFORE    │ ROOT CAUSE           │
├────────────────────┼───────────┼──────────────────────┤
│ LLM call 1         │ 3.4s     │ 22k input tokens     │
│   ↳ 501 skill      │          │ (86% was skill       │
│     summaries      │          │  summaries)           │
│ LLM call 2         │ 2.3s     │ Unnecessary call     │
│   ↳ after handoff  │          │ (just says "I'll     │
│                    │          │  help you!")           │
│ Param extraction   │ 0.3s     │ Sequential with      │
│ + lesson loading   │ 0.15s    │ lesson loading        │
│ Handoff setup      │ 0-14.5s  │ Cold relay = WS +    │
│                    │          │ ChromePool + tools     │
│ Dead zone after    │ 5-6s     │ No SSE until browser  │
│ handoff            │          │ agent first message    │
└────────────────────┴───────────┴──────────────────────┘
```

### Why browser_execution was 6 minutes

The laptop browser agent uses **Copilot CLI + Claude model** (not Azure OpenAI):
- 15-30 LLM → tool call cycles per task
- Each cycle: LLM thinking (~1-3s) + tool execution (~0.5-2s)
- `browser_snapshot` on heavy pages (Flipkart, BigBasket): 500-2000ms each
- Only **2 of 501 skills** had compiled scripts (which bypass LLM entirely)

---

## 3. Phase 1: Quick Wins (SHIPPED ✅)

Deployed to prod on March 22, 2026. Commit: `43fe6e7`.

### 3.1 Prune skill summaries from system prompt

**File**: `packages/agent-core/src/prompts/system.ts`

Removed lines 182-188 that injected ALL 501 skill summaries into every prompt.

**Why it's safe**: `matchSkill()` in `agent.ts` already picks the right skill BEFORE the LLM sees anything. The LLM only needs the matched skill's instructions (injected separately), not a catalog of all 501.

**Impact**: 22,189 → ~3,000 input tokens per call. Each call: 3.4s → ~0.5s.

### 3.2 Skip 2nd LLM call after handoff

**File**: `packages/agent-core/src/agent.ts`

Old flow:
```
LLM call 1 → tool_use: handoff_to_browser_agent → LLM call 2 → "I'll help you!" → end
```

New flow:
```
LLM call 1 → tool_use: handoff_to_browser_agent → canned message → break
```

After handoff succeeds, sends "On it! Searching {site}..." and breaks out of the agent loop. The 2nd LLM call was always just a polite acknowledgment — wasting 2-3s + 22k tokens.

**Impact**: Saves 2-3s + 22k tokens per browser task.

### 3.3 Parallelize param extraction + lesson loading

**File**: `packages/agent-core/src/agent.ts`

Was sequential:
```typescript
const params = await extractParams(skill, message);  // ~300ms
const lessons = await loadLessons(skillId);           // ~150ms
```

Now parallel:
```typescript
const [params, lessons] = await Promise.all([
  extractParams(skill, message),
  loadLessons(skillId),
]);
```

**Impact**: ~150ms saved.

### 3.4 Switch browser model from Opus to Sonnet

**File**: `apps/playwright/src/task-manager.ts`

Changed default from `claude-opus-4.6` to `claude-sonnet-4`. Routine browser navigation (click, type, navigate) doesn't need Opus-level reasoning.

**Impact**: Each of 15-30 LLM calls per task: ~2s → ~0.5s. Total browser execution: 6min → ~2-3min.

### 3.5 Instant SSE feedback after handoff

**File**: `apps/web/app/api/agent/execute/route.ts`

Added immediate `step_update` SSE event right after handoff_setup completes. User sees "Browsing {site}..." instead of 5-6s silence.

**Impact**: Perceived latency drops significantly.

### Expected Results (Phase 1)

| Metric | Before | After (estimated) |
|--------|--------|-------------------|
| TTFM (warm relay) | 11-28s | ~1-2s |
| TTFM (cold relay) | 28-60s | ~15-16s |
| Input tokens/call | 22,189 | ~3,000 |
| LLM call duration | 3.4s | ~0.5s |
| browser_execution | 6min | ~2-3min |
| Wasted LLM calls | 2 per task | 1 per task |

---

## 4. Phase 2: Compiled Scripts (IN PROGRESS)

The single biggest win: **6 minutes → 10-60 seconds** for browser execution.

See [COMPILED-SCRIPTS.md](./COMPILED-SCRIPTS.md) for full architecture.

### The Three-Tier Model

```
Tier 1: FULLY COMPILABLE — deterministic, params-only
  Hotels, flights, recharge, profile save
  Record once → replay with different params
  6min → 10-30s

Tier 2: LOOP SCRIPTS — hand-written templates with interactive pauses
  Grocery (BigBasket, Blinkit, Zepto), food delivery, shopping
  Scripted navigation + ask_user at decision points
  6min → 30-60s

Tier 3: ORCHESTRATION — compose Tier 1/2 scripts
  Multi-site comparison, complex research
  Thin LLM layer decides which scripts to run
  Eliminates LLM touching browser entirely
```

### Current progress

| Skill | Tier | Status |
|-------|------|--------|
| booking-com-hotel | 1 | ✅ Compiled (existed before) |
| save-profile-address | 1 | ✅ Compiled (existed before) |
| bigbasket-grocery | 2 | 🔨 In progress |
| blinkit-grocery | 2 | 🔨 In progress |
| Other 497 skills | 1-3 | ❌ Not yet |

---

## 5. Phase 3: Remaining Optimizations (PLANNED)

### 5.1 Fix cold handoff (14.5s → 3-5s)

Cold relay handoff breakdown (estimated):
- WebSocket connection: ~2s
- ChromePool slot acquisition: ~5s (Chrome launch + profile copy)
- MCP tool discovery: ~3s
- Unknown overhead: ~4.5s

Needs investigation with granular timing in `relay-outbound.ts` and `chrome-pool.ts`.

### 5.2 LLM streaming

Add `stream: true` to Azure OpenAI calls in `openai-base-client.ts`. With pruned prompts (3k tokens), first token arrives in ~200ms instead of waiting 500ms for full response.

Lower priority now that LLM calls are already fast (0.5s).

### 5.3 Compile top 80 Tier 1 skills

Use dev-loop mode B to record and compile deterministic skills (hotel bookings, flight searches, recharges). Each compiled skill eliminates 100% of browser LLM calls.

---

## 6. Telemetry Dashboard

Monitor before/after at:
- **Prod**: `https://shofferai-zii4qrnsyq-el.a.run.app/dashboard/admin` → ⏱ Latency tab
- **API**: `/api/admin/telemetry?view=latency` (JSON), `?view=llm` (LLM stats)
- **Auth**: Session-based (NextAuth). Login as `demo@shofferai.com` or `rsinghtomar3011@gmail.com`

Key metrics to track post-deploy:
1. **TTFM P50** — should drop from 27.5s to ~1-2s
2. **Input tokens per LLM call** — should drop from 22k to ~3k
3. **LLM calls per task** — should drop from 2 to 1 (for browser tasks)
4. **browser_execution avg** — should drop from 6min to 2-3min (Sonnet), then 30-60s (compiled)
