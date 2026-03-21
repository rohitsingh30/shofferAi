---
name: error-analyser
description: Diagnose ShofferAI error codes (BROWSER_ERROR, AGENT_ERROR, etc.) — trace root cause, fetch task logs, and suggest fixes. Use this when a task fails, an error code is shown, or asked to debug an error.
---

Diagnose ShofferAI error codes shown to users in the format `(CODE:taskIdSuffix)`.

## Error Code Reference

| Code | Source File | Meaning |
|------|-------------|---------|
| `BROWSER_ERROR` | `apps/web/app/api/agent/execute/route.ts:428` | Browser/relay task failed — relay sent `task_error` |
| `AGENT_ERROR` | `apps/web/app/api/agent/execute/route.ts:582` | Chat-mode LLM agent error (no browser involved) |
| `FATAL_ERROR` | `apps/web/app/api/agent/execute/route.ts:644` | Uncaught exception during task execution |
| `WORKFLOW_ERROR` | `packages/shared/src/utils/errors.ts:36` | Workflow engine state machine error |
| `CREDENTIAL_ERROR` | `packages/shared/src/utils/errors.ts:29` | Credential decrypt/inject failure |
| `INPUT_TIMEOUT` | `packages/shared/src/utils/errors.ts:43` | User didn't respond to `ask_user` in time (408) |

### Error Display Format

Constructed in `apps/web/components/chat/ChatInterface.tsx:285`:
```
Something went wrong: {errorText} ({errorCode}:{taskId.slice(-8)})
```
- `errorCode` = one of the codes above (or `ERR` if missing)
- `taskId.slice(-8)` = last 8 chars of the full CUID task ID

## Instructions

### Step 1: Parse the Error

Extract from the user's message:
- **Error code** (e.g. `BROWSER_ERROR`)
- **Task ID suffix** (e.g. `b3ip0q56` — the 8-char string after the colon)
- **Error text** (the human-readable message before the parenthetical)

If the user only gives the suffix, you can find the full task ID in Step 2.

### Step 2: Identify Root Cause by Error Code

#### BROWSER_ERROR

This means the laptop relay's TaskManager sent a `task_error` event. Common sub-causes:

| Error Text | Root Cause | Fix |
|------------|------------|-----|
| `Task timed out` | Task exceeded 10-minute wall-clock timeout (`apps/playwright/src/task-manager.ts:103,781-794`). Timer starts at task handoff. | Check if the skill is too complex, browser was stuck, or Chrome was unresponsive. Consider increasing `taskTimeoutMs` or breaking the skill into smaller steps. |
| `Cannot reach browser agent` | Relay WebSocket disconnected between Cloud Run and laptop. | Run `/status` to check relay health. Restart with `/start-laptop`. |
| `Navigation timeout` | Playwright couldn't load a page within timeout. | Target site may be slow/down. Check if URL is correct in skill definition. |
| `Element not found` / `Locator timeout` | Selector didn't match any element on page. | Site redesigned. Update selectors in the skill's SKILL.md. |
| `Login required` / `Session expired` | Chrome Profile 3 cookies expired. | Open base Chrome-Debug manually, sign in to the site, future copies inherit sessions. |
| `net::ERR_*` | Chrome network error (DNS, connection refused, SSL). | Check if the target site is accessible. May be geo-blocked or rate-limited. |

#### AGENT_ERROR

Chat-mode agent (no browser) hit an error. Common sub-causes:

| Error Text | Root Cause | Fix |
|------------|------------|-----|
| `Task exceeded maximum number of steps` | LLM loop hit 25-iteration limit (`packages/agent-core/src/agent.ts:372,721-728`). | Agent is stuck in a loop. Check conversation for repeated patterns. Simplify the request or fix the skill logic. |
| `Azure OpenAI API error` | LLM provider returned an error (rate limit, content filter, etc.). | Check `AZURE_OPENAI_ENDPOINT` and API key. May need to wait and retry. |
| `Tool call failed` | An internal tool (not MCP) threw an error. | Check which tool failed in the task steps. |

#### FATAL_ERROR

Uncaught exception in the execute route. This is a **bug** — should never happen in production.

- Check Cloud Run logs: `gcloud logging read "resource.type=cloud_run_revision AND textPayload:FATAL" --limit=20 --format="value(textPayload)"`
- Or check Next.js console output if running locally.

#### CREDENTIAL_ERROR

AES-256-GCM decrypt failed or credential injection couldn't type into form.

- Check if `CREDENTIAL_ENCRYPTION_KEY` env var is set and matches what was used to encrypt.
- Check if the target site's login form selectors have changed.

#### INPUT_TIMEOUT

User was prompted for input (via `ask_user`) but didn't respond within the timeout window.

- Not a system error — just inform the user they can retry.

#### WORKFLOW_ERROR

Task state machine transition failed (e.g., tried to resume a task that wasn't paused).

- Check `PauseResumeManager` state in `apps/web/lib/workflow-engine/`.

### Step 3: Fetch Task Logs (if task ID is available)

If you have the task ID suffix, find the full task and fetch data:

```bash
cd /Users/rohit/shofferAi

# Find full task ID from suffix
SUFFIX="<8-char suffix>"
npx prisma db execute --stdin <<SQL
SELECT id, description, status, "workflowType", result, "createdAt", "completedAt"
FROM "Task" WHERE id LIKE '%${SUFFIX}' ORDER BY "createdAt" DESC LIMIT 1;
SQL
```

Then fetch full details (use the task-analyser approach):

```bash
TASK_ID="<full task id>"

# Messages
npx prisma db execute --stdin <<SQL
SELECT role, substr(content, 1, 200) as content_preview, "createdAt"
FROM "Message" WHERE "taskId" = '${TASK_ID}' ORDER BY "createdAt";
SQL

# Steps with errors
npx prisma db execute --stdin <<SQL
SELECT "stepNumber", action, status, error, "startedAt", "completedAt"
FROM "TaskStep" WHERE "taskId" = '${TASK_ID}' ORDER BY "stepNumber";
SQL

# Telemetry (failures only)
npx prisma db execute --stdin <<SQL
SELECT event, category, success, "durationMs", metadata, timestamp
FROM "TelemetryEvent" WHERE "taskId" = '${TASK_ID}' AND success = false
ORDER BY timestamp;
SQL
```

### Step 4: Check System State (if BROWSER_ERROR)

For browser errors, also check current system health:

```bash
# Is relay running?
ps aux | grep -E 'tsx.*src/index|relay-server|relay-outbound' | grep -v grep | head -3

# Any Chrome instances?
ps aux | grep -E 'Google Chrome.*remote-debugging' | grep -v grep | head -3

# Recent relay logs (if available)
tail -20 /tmp/shofferai-relay.log 2>/dev/null || echo "No relay log file"
```

### Step 5: Report

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ERROR DIAGNOSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 Error:    <error code> — <error text>
📋 Task:     <task description> (<full task ID>)
⏱  Duration: <how long before it failed>
🎯 Skill:    <matched skill/workflow>

🔍 Root Cause
  <1-2 sentence explanation of exactly what went wrong>

📍 Where it Failed
  File: <source file and line>
  Step: <which task step failed, if applicable>
  Tool: <which MCP tool call failed, if applicable>

🔧 Fix
  <specific actionable fix — command to run, file to edit, or config to change>

💡 Prevention
  <how to prevent this from happening again>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Timeout-Specific Deep Dive

For "Task timed out" errors specifically, investigate:

1. **Was the task actually making progress?** Check TaskStep timestamps — if there are steps but big gaps, the browser agent was stuck.
2. **Did the skill require too many steps?** Count TaskSteps. If > 30, the skill may need optimization or script caching.
3. **Was Chrome responsive?** If no steps after the first few, Chrome may have crashed or hung.
4. **Was the relay connected?** Check telemetry for `relay_disconnected` events near the task time.
5. **Was the site slow?** Navigation and element wait times in step metadata indicate slow pages.

### Common Timeout Patterns

| Pattern | Evidence | Fix |
|---------|----------|-----|
| Stuck on login | Steps show repeated login attempts | Re-auth Chrome Profile 3 manually |
| Infinite retry loop | Same tool call repeated 3+ times | Add max retry guard in skill or agent |
| Slow site | Long gaps between steps, navigation timeouts | Add explicit waits, increase page timeout |
| Chrome crash | Steps stop suddenly, no error in individual steps | Check Chrome stderr logs, may need `--disable-gpu` |
| Relay flap | `relay_disconnected` telemetry near failure | Check laptop network, only ONE relay instance allowed |
| Popup/modal blocking | Steps show unexpected page state | Add popup dismissal to skill steps |
