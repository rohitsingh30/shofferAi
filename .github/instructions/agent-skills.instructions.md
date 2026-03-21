---
applyTo: "packages/agent-core/**"
---

# Agent Core — LLM, Skills & Script Pipeline (packages/agent-core/)

## AgentExecutor (agent.ts)

- LLM loop: Azure OpenAI → tool calls → MCP dispatch → results → LLM → repeat
- Max 50 iterations per task
- Tool dispatch: MCP tools relayed to laptop, internal tools (ask_user, confirm_action, collect_payment) handled locally
- Auto-ask_user: if LLM outputs a question as text instead of calling `ask_user`, auto-converts to interactive prompt

## Skill System

- 500 skill definitions in `src/skills/` as `SKILL.md` files
- `matchSkill(skills, userMessage)` scores against skill triggers (+1 trigger match, +3 domain)
- Matched skills inject site-specific instructions + params into system prompt
- `buildSystemPrompt()` in `src/prompts/system.ts` combines: user context + matched skill + lessons
- Skill params: system prompt OVERRIDE directive forces extraction from user's original message before asking

### Skill Rules
- ALWAYS extract parameters from the user's message FIRST
- Only call `ask_user` for values genuinely missing (not dates/items/location already stated)
- Every site interaction: login FIRST, set location SECOND, then proceed
- New tab for every site — never hijack user's chat tab

## Conversation Management (conversation.ts)

- `ConversationManager` maintains sliding window of max 20 messages
- Tool results truncated to 4000 characters
- Old messages pruned to stay within token limits

## Script Pipeline (Record → Compile → Replay)

First run: LLM drives browser → `ScriptRecorder` captures MCP tool calls → `ScriptCompiler` generates native Playwright JS

Next run: `ScriptPlayer` replays compiled script (~10s, no LLM needed). Falls back to LLM if script fails.

| Component | File | Role |
|-----------|------|------|
| ScriptRecorder | `src/scripts/recorder.ts` | Captures MCP tool calls, extracts selectors |
| ScriptCompiler | `src/scripts/compiler.ts` | RecordedAction[] → Playwright JS with `.or()` selectors |
| ScriptPlayer | `src/scripts/player.ts` | Executes compiled scripts, handles interactive flows via stdin/stdout JSON |
| ScriptStore | `src/scripts/store.ts` | Persists to `compiled/` as `{skillId}.generated.js` |

### Interactive Flow (compiled scripts)
```
ScriptPlayer → node compiled-script.js '{"destination":"Mumbai"}'
Script needs OTP → stdout: {"type":"need_input","prompt":"Enter OTP"}
ScriptPlayer → ask_user → user responds → stdin: {"type":"input","value":"123456"}
```

## Message Filtering (3 layers)

Only natural language messages reach the chat UI. Internal tool labels are filtered:
1. **task-manager.ts**: `isInternalToolLabel()` filters `assistant.message` events
2. **execute/route.ts**: defense-in-depth filter on `task_progress` before SSE
3. **ChatInterface.tsx**: frontend hides `step_update` with `status: 'running'`

Tool execution events → `mcpToolEvents` → MCP log stream (dynamic port), NOT user chat.

Suppressed patterns: `"Browser: report_intent"`, `"browser_snapshot"`, `"mcp__playwright__browser_click"`, `"Agent starting..."`, all raw tool names.

Shared filter: `packages/shared/src/internal-message-filter.ts`

## Key Interfaces

```typescript
interface MCPHostLike {
  connect(): Promise<void>;
  getTools(): Promise<MCPTool[]>;
  callTool(name: string, args: Record<string, unknown>): Promise<unknown>;
  isConnected(): boolean;
  isMCPTool(name: string): boolean;
}
```

## Critical Rules

- `ask_user` fires ONLY `onInputRequired()` — NEVER `onStepUpdate()` (breaks UI rendering)
- Never use singleton patterns for per-task state — key by taskId
- Plain SKILL.md files are NOT bundled by Next.js — must be COPY'd in Dockerfile
- Skills in Docker: `ENV SKILLS_DIR=/app/skills` + `COPY` in Dockerfile
- Lessons system: `formatLessonsForPrompt()` injects top 10 lessons (confidence ≥ 0.3) into system prompt
