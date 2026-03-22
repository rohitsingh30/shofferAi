---
name: task-analyser
description: Analyse a task by ID — fetch full logs (messages, steps, events, payments) and diagnose what went wrong. Use this when asked to debug a task, analyse a failure, or understand what happened.
---

Analyse a ShofferAI task end-to-end. Fetches all data for a given taskId and produces a structured diagnosis.

## Instructions

### Step 1: Get the Task ID

If the user provided a taskId, use it directly. If not, ask them:

```
Which task do you want to analyse? Provide the task ID (you can copy it from the Telemetry Dashboard → Chrome Sessions tab).
```

The taskId is a CUID string like `cm5abc123def456`.

### Step 2: Authenticate & Fetch Task Data

#### 2a. Ensure prod auth cookie exists

Run the auth helper script. It handles CSRF + NextAuth sign-in and saves a cookie jar.

```bash
bash /Users/rohit/shofferAi/.github/skills/task-analyser/fetch-prod-cookie.sh
```

This creates `/tmp/shofferai-cookies.txt` (curl `-b` compatible). Valid for 24h; auto-skips if still fresh.

#### 2b. Fetch task data from prod API

```bash
TASK_ID="<the task id>"
curl -s -b /tmp/shofferai-cookies.txt \
  "https://shofferai-27188185100.asia-south1.run.app/api/admin/telemetry?view=task-detail&taskId=${TASK_ID}" \
  | python3 -m json.tool > /tmp/task-analysis-${TASK_ID}.json
```

If this returns `{"error":"Forbidden"}`, re-run the auth script with `--force`:

```bash
bash /Users/rohit/shofferAi/.github/skills/task-analyser/fetch-prod-cookie.sh --force
```

#### 2c. Fallback: query prod DB directly via Prisma Client

Only use this if the API is down. It queries the **local** database (Docker Compose PostgreSQL), not prod.

```bash
cd /Users/rohit/shofferAi
TASK_ID="<the task id>"
node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const id = '${TASK_ID}';
  const [task, msgs, steps, events, payments] = await Promise.all([
    p.task.findUnique({ where: { id }, include: { user: { select: { email: true, name: true } } } }),
    p.message.findMany({ where: { taskId: id }, orderBy: { createdAt: 'asc' } }),
    p.taskStep.findMany({ where: { taskId: id }, orderBy: { stepNumber: 'asc' } }),
    p.telemetryEvent.findMany({ where: { taskId: id }, orderBy: { timestamp: 'asc' } }),
    p.payment.findMany({ where: { taskId: id }, orderBy: { createdAt: 'asc' } }),
  ]);
  console.log(JSON.stringify({ task, steps, messages: msgs, telemetry: events, payments }, null, 2));
  await p.\\\$disconnect();
})();
" > /tmp/task-analysis-${TASK_ID}.json
```

**Note**: Local DB only has data if you're running Docker Compose locally. For prod tasks, always prefer the API (Step 2b).

### Step 3: Analyse the Data

Read through all the data and produce a structured analysis. Check for these common failure patterns:

#### 3a. Timeline Analysis
- How long did the task take? (createdAt → completedAt)
- Was it abnormally slow? (> 5 minutes for simple tasks, > 15 minutes for complex)
- Were there long gaps between steps?

#### 3b. Conversation Flow
- What did the user ask for?
- Did the agent understand the request correctly?
- Were there unnecessary back-and-forth exchanges?
- Did the agent ask for user input when it shouldn't have (or vice versa)?

#### 3c. Tool Call Analysis
- Which MCP tools were called and in what order?
- Did any tool calls fail? What was the error?
- Were there redundant or repeated tool calls (sign of retry loops)?
- Did the agent navigate to the correct website?

#### 3d. Error Detection
- Check `TaskStep.error` for any non-null values
- Check `TelemetryEvent.success = false` for failures
- Check `Task.status = 'failed'` and `Task.result` for the final error
- Look for common errors:
  - "Cannot reach browser agent" → relay was disconnected
  - "Navigation timeout" → website was slow or selector wrong
  - "Element not found" → wrong selector or page structure changed
  - "Login required" → session expired, need to re-auth Chrome profile
  - "Rate limited" → too many requests to the target site

#### 3e. Skill Match Analysis
- Was the correct skill matched? (check `workflowType`)
- Did the agent follow the skill's expected step sequence?
- Were there deviations from the happy path?

#### 3f. Payment Flow (if applicable)
- Was payment requested at the right time?
- Did the user confirm payment?
- Was the payment verified before proceeding?

### Step 4: Report

Present the analysis in this format:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK ANALYSIS: <taskId>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Summary
  Task:     <description>
  User:     <email>
  Skill:    <workflowType>
  Status:   <status>  
  Duration: <time>
  Time:     <createdAt> → <completedAt>

🔍 Root Cause
  <1-2 sentence diagnosis of what went wrong, or "Task completed successfully" if no issues>

📊 Timeline
  <step-by-step timeline with timestamps and durations>

⚠️  Issues Found
  1. <issue description>
     Evidence: <specific log line or data point>
     Impact: <what this caused>
  
  2. <issue description>
     ...

💡 Recommendations
  1. <specific fix or improvement>
  2. ...

📝 Raw Data
  Messages: <count>
  Steps: <count>  
  Events: <count>
  Payments: <count>
```

### Step 5: Suggest Fixes

If you identified specific issues, suggest concrete fixes:
- For selector issues: search the skill definition file and suggest updated selectors
- For auth issues: suggest re-authenticating Chrome Profile 3
- For relay issues: check if the relay was running during the task
- For skill logic issues: suggest edits to the skill SKILL.md
- For LLM issues: suggest prompt improvements in the system prompt

If the user wants you to implement fixes, proceed to make the code changes.
