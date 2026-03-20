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

### Step 2: Fetch Task Data from Prod API

```bash
TASK_ID="<the task id>"
curl -s "https://shofferai-27188185100.asia-south1.run.app/api/admin/telemetry?view=task-detail&taskId=${TASK_ID}" \
  -H "Cookie: $(cat /tmp/shofferai-admin-cookie 2>/dev/null || echo '')" \
  | python3 -m json.tool > /tmp/task-analysis-${TASK_ID}.json
```

If the curl fails (no auth cookie), fetch from the local database instead:

```bash
cd /Users/rohit/shofferAi

# Task details
echo "=== TASK ===" 
npx prisma db execute --stdin <<SQL
SELECT t.id, t.description, t.status, t."workflowType", t.result, t."createdAt", t."completedAt",
       u.email, u.name
FROM "Task" t JOIN "User" u ON t."userId" = u.id
WHERE t.id = '${TASK_ID}';
SQL

# Messages (conversation)
echo "=== MESSAGES ==="
npx prisma db execute --stdin <<SQL
SELECT role, content, "createdAt" FROM "Message"
WHERE "taskId" = '${TASK_ID}' ORDER BY "createdAt";
SQL

# Steps (agent actions)
echo "=== STEPS ==="
npx prisma db execute --stdin <<SQL
SELECT "stepNumber", action, status, error, "toolCalls", result,
       "startedAt", "completedAt", "inputNeeded", "userInput"
FROM "TaskStep"
WHERE "taskId" = '${TASK_ID}' ORDER BY "stepNumber";
SQL

# Telemetry events
echo "=== TELEMETRY ==="
npx prisma db execute --stdin <<SQL
SELECT event, category, success, "durationMs", metadata, timestamp
FROM "TelemetryEvent"
WHERE "taskId" = '${TASK_ID}' ORDER BY timestamp;
SQL

# Payments
echo "=== PAYMENTS ==="
npx prisma db execute --stdin <<SQL
SELECT status, "amountCents", currency, "bookingSummary", "createdAt", "paidAt"
FROM "Payment"
WHERE "taskId" = '${TASK_ID}' ORDER BY "createdAt";
SQL
```

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
