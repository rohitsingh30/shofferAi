---
name: relay-doctor
description: Diagnose relay connection drops, chat↔relay failures, and WebSocket flapping. Deep investigation with enhanced logs and root cause analysis.
---

Investigate WHY the relay connection dropped or why the chat interface can't reach the running relay. This is a **deep diagnostic** skill — not just "is it up?" but "what happened and why?"

**IMPORTANT**: Never start, stop, or restart the relay — the operator manages it manually. This skill diagnoses only.

## Architecture Summary (read this first)

```
Laptop (relay-outbound.ts)                    Cloud Run (custom-server.js + relay-bridge.ts)
┌──────────────────────┐    WSS outbound     ┌──────────────────────────────────────┐
│ RelayOutbound        │ ──────────────────→ │ custom-server.js (WS upgrade handler)│
│  ├─ ChromePool       │                     │  └→ wireLaptopSocket(ws)             │
│  ├─ TaskManager      │                     │       └→ globalThis.__relayBridge    │
│  └─ sendStatus()     │                     │            .setLaptopSocket(ws)      │
│     every 10s        │                     │                                      │
│                      │  ← { type: 'ping' } │ RelayBridge (singleton on globalThis)│
│ lastAppMessageAt     │     every 15s       │  ├─ heartbeat → laptop               │
│   updated on every   │                     │  ├─ sendRequest() → laptop           │
│   incoming WS msg    │                     │  └─ isConnected() flag               │
└──────────────────────┘                     │                                      │
                                             │ singletons.ts (LAZY — runs on first  │
                                             │   route import, NOT on server start) │
                                             │  └→ creates RelayBridge              │
                                             │     sets globalThis.__relayBridge    │
                                             └──────────────────────────────────────┘
```

**Cloud Run config**: `min-instances: 1`, `max-instances: 1`, `timeout: 3600s` (1hr WS max).

## Common Symptoms This Skill Diagnoses

| Symptom | Likely Root Cause |
|---------|------------------|
| "Cannot reach browser agent" in chat | Relay WS disconnected between Cloud Run ↔ Laptop |
| Task works sometimes, fails other times | Connection flapping — multiple relay instances OR phantom connections |
| Relay running but chat says "not connected" | Phantom LB connection, OR singletons not initialized, OR bridge has stale socket |
| Relay reconnects every 30s in a loop | Auth token mismatch OR Cloud Run instance cycling OR earlySocket timeout loop |
| Chat hangs after handoff, no progress | WS open but backend dead (phantom LB connection) |
| "Laptop disconnected (grace period expired)" | Laptop relay crashed or network drop, didn't reconnect within 30s |
| Relay connected per `lsof` but prod says "not connected" | **PHANTOM CONNECTION** — TCP alive at LB but no real backend |

## Known Failure Modes (from real incidents)

### FM1: Phantom Load Balancer Connection (MOST COMMON)
**What**: Laptop shows ESTABLISHED TCP to Cloud Run, but Cloud Run instance has no relay registered.
**Why**: Cloud Run's LB keeps TCP alive even after the backend instance dies/replaces. The LB responds to native WS pings (pong frames) so `lastDataAt` stays fresh. But no application-level JSON messages flow, so `lastAppMessageAt` goes stale.
**Detection**: The 25s stale-connection check in `relay-outbound.ts` should catch this. If it doesn't, check if the instance is alive-but-draining (see FM2).
**Evidence**: `lsof` shows ESTABLISHED to Cloud Run `:443`, BUT `/api/admin/release-relay` returns `"wasConnected": false`.

### FM2: Draining Instance Still Sending Heartbeats (THE SNEAKY ONE)
**What**: After a deploy, the OLD instance is draining but still alive. It keeps sending `{ type: 'ping' }` every 15s. The laptop receives these as WS messages → `lastAppMessageAt` keeps updating → stale check NEVER fires. Meanwhile, ALL new HTTP requests route to the NEW instance which has no relay.
**Why**: Cloud Run keeps the old instance alive for active connections (up to `--timeout: 3600s`). The relay WS IS an active connection. The old instance's heartbeat keeps the laptop from detecting the problem.
**Detection**: Call `/api/admin/release-relay` — if it says "not connected" but laptop's WS is ESTABLISHED, the laptop is connected to a draining OLD instance while HTTP hits the NEW one.
**The pre-deploy `release-relay` step in `cloudbuild.yaml` is meant to prevent this, but if it fails or the laptop reconnects to the old instance during the deploy window, this occurs.**

### FM3: Lazy Singleton Race Condition
**What**: Laptop connects via WS before any HTTP route imports `singletons.ts`. `globalThis.__relayBridge` is NULL. Socket is queued in `earlyLaptopSocket` for 30s. If no HTTP request triggers singletons within 30s, socket is dropped (code 1011). Laptop reconnects with growing backoff.
**Why**: `singletons.ts` runs on first route import, NOT on server startup. `custom-server.js` starts WS handler immediately, but the bridge doesn't exist until a route handler runs.
**Detection**: Look for `"[relay] RelayBridge not initialized after 30s"` in Cloud Run logs.

### FM4: Cloud Run WS Timeout (3600s)
**What**: WS connection terminated after 1 hour by Cloud Run. Laptop reconnects — usually works fine, but during reconnection there's a brief window where relay is unavailable.
**Detection**: Regular disconnects at ~1hr intervals in relay logs. Close code from Cloud Run varies.

### FM5: Reconnect Backoff Spiral
**What**: After repeated failed connections (e.g., from FM3), backoff grows to 30s. Combined with 30s earlySocket timeout, the timing window for successful connection narrows drastically.
**Why**: Close code 1011 (from earlySocket drop) doesn't reset backoff. Only code 1001 (server going away) resets to 1s.
**Detection**: Look for increasing reconnect delays in relay logs: `"Scheduling reconnect" { delay: 16000 }`, `{ delay: 30000 }`.

## Instructions

### Step 1: Capture Current State Snapshot

Run ALL of these in parallel to get a full picture:

```bash
echo "=== RELAY PROCESS ==="
ps aux | grep -E 'tsx.*src/index|relay-server|relay-outbound|node.*custom-server' | grep -v grep

echo ""
echo "=== RELAY PROCESS UPTIME ==="
RELAY_PID=$(ps aux | grep -E 'node.*tsx.*src/index' | grep -v grep | head -1 | awk '{print $2}')
if [ -n "$RELAY_PID" ]; then
  ps -o pid,etime,command -p "$RELAY_PID"
fi

echo ""
echo "=== RELAY WS CONNECTION (to Cloud Run) ==="
if [ -n "$RELAY_PID" ]; then
  lsof -p "$RELAY_PID" -iTCP:443 -sTCP:ESTABLISHED -P 2>/dev/null | grep -v txt
  echo ""
  echo "Listening ports:"
  lsof -p "$RELAY_PID" -iTCP -sTCP:LISTEN -P 2>/dev/null | grep -E 'TCP'
fi

echo ""
echo "=== RELAY PROCESS ENV ==="
if [ -n "$RELAY_PID" ]; then
  ps -E -p "$RELAY_PID" 2>/dev/null | grep -oE 'RELAY_[A-Z_]+=[^ ]+' || echo "Can't read env"
fi

echo ""
echo "=== CHROME INSTANCES ==="
CHROME_COUNT=$(ps aux | grep -E 'remote-debugging' | grep -v grep | wc -l | tr -d ' ')
echo "Chrome debug instances: $CHROME_COUNT"

echo ""
echo "=== PROD STATUS ==="
echo -n "HTTP: "
curl -s --max-time 5 -o /dev/null -w '%{http_code} (%{time_total}s)' https://shofferai-27188185100.asia-south1.run.app 2>/dev/null
echo ""
```

### Step 2: Phantom Connection Test (MOST IMPORTANT)

This is the key diagnostic — does Cloud Run actually have the relay, or is the laptop connected to a phantom?

```bash
echo "=== PHANTOM CONNECTION TEST ==="
echo "Asking Cloud Run if relay is connected..."
RESULT=$(curl -s -X POST \
  -H "Authorization: Bearer shofferai-relay-2026" \
  https://shofferai-27188185100.asia-south1.run.app/api/admin/release-relay 2>/dev/null)
echo "$RESULT" | python3 -m json.tool 2>/dev/null

WAS_CONNECTED=$(echo "$RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('wasConnected','?'))" 2>/dev/null)

RELAY_PID=$(ps aux | grep -E 'node.*tsx.*src/index' | grep -v grep | head -1 | awk '{print $2}')
HAS_TCP=$(lsof -p "$RELAY_PID" -iTCP:443 -sTCP:ESTABLISHED -P 2>/dev/null | grep -c '443' 2>/dev/null || echo 0)

echo ""
if [ "$WAS_CONNECTED" = "False" ] && [ "$HAS_TCP" -gt 0 ]; then
  echo "⚠️  PHANTOM CONNECTION DETECTED!"
  echo "   Laptop has ESTABLISHED TCP but Cloud Run says NOT connected."
  echo "   Root cause: FM1 (phantom LB) or FM2 (draining instance)."
  echo "   The laptop relay needs to be restarted by the operator."
elif [ "$WAS_CONNECTED" = "False" ] && [ "$HAS_TCP" -eq 0 ]; then
  echo "✗ Relay genuinely disconnected (no TCP, no bridge)."
  echo "   Check if relay process is running. Operator should restart."
elif [ "$WAS_CONNECTED" = "True" ]; then
  echo "✓ Cloud Run HAD relay connected (just released it for diagnosis)."
  echo "   Laptop will auto-reconnect within 1-4s."
  echo "   If this was called during a live issue, the release-reconnect may fix it."
fi
```

**WARNING**: This step calls `release-relay` which disconnects the laptop! Only use during active diagnosis. The laptop will auto-reconnect within 1-4s.

### Step 3: Check for Duplicate Relay Instances

Only ONE relay instance may run at a time. Duplicates cause WebSocket flapping on Cloud Run — both instances fight over the single WS slot.

NOTE: A single relay shows as 3 PIDs (npm → tsx wrapper → node worker). This is ONE instance, not three. Only flag if you see multiple independent process chains.

```bash
echo "=== DUPLICATE RELAY CHECK ==="
RELAY_CHAINS=$(ps aux | grep -E 'tsx.*src/index' | grep -v grep | grep -v 'npm exec' | grep -c 'node')
if [ "$RELAY_CHAINS" -gt 1 ]; then
  echo "⚠️  CRITICAL: $RELAY_CHAINS relay worker processes! This causes WS flapping."
  ps aux | grep -E 'tsx.*src/index' | grep -v grep
else
  echo "✓ Single relay instance (or none)"
fi

echo ""
echo "=== CHROME LEAK CHECK ==="
CHROME_COUNT=$(ps aux | grep -E 'remote-debugging' | grep -v grep | wc -l | tr -d ' ')
echo "Chrome instances: $CHROME_COUNT"
if [ "$CHROME_COUNT" -gt 6 ]; then
  echo "⚠️  Possible Chrome leak — more than 6 instances (pool max is 3 + helpers)"
fi
```

### Step 4: Check Relay Logs for Connection Events

```bash
echo "=== RECENT RELAY LOG EVENTS ==="
for f in /private/tmp/claude-*/tasks/*.output; do
  [ -f "$f" ] || continue
  HITS=$(grep -c -E 'RelayOutbound|RelayBridge|Disconnected|reconnect|phantom|dead connection|grace period|SIGTERM|stale' "$f" 2>/dev/null)
  if [ "$HITS" -gt 0 ]; then
    echo ""
    echo "--- $f ($HITS relay events) ---"
    grep -E 'RelayOutbound|RelayBridge|Disconnected|reconnect|phantom|dead connection|grace period|SIGTERM|laptop connected|laptop disconnected|stale|auth failed|no app-level|no data for|no heartbeat' "$f" | tail -40
  fi
done

echo ""
echo "=== RECENT ERRORS ==="
grep -rh -E 'ECONNREFUSED|ECONNRESET|EPIPE|ETIMEDOUT|socket hang up|relay.*error|connection.*failed|token mismatch|BrowserError' /private/tmp/claude-*/tasks/*.output 2>/dev/null | tail -20
```

### Step 5: Network-Level Diagnostics

```bash
echo "=== DNS RESOLUTION ==="
dig +short shofferai-27188185100.asia-south1.run.app 2>/dev/null | head -4

echo ""
echo "=== TCP CONNECTIVITY ==="
curl -s --max-time 5 -o /dev/null -w 'HTTP %{http_code} (connect: %{time_connect}s, total: %{time_total}s)\n' https://shofferai-27188185100.asia-south1.run.app 2>/dev/null

echo ""
echo "=== WS UPGRADE TEST ==="
curl -s --max-time 5 -o /dev/null -w 'HTTP %{http_code}\n' \
  -H "Upgrade: websocket" -H "Connection: Upgrade" \
  -H "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==" \
  -H "Sec-WebSocket-Version: 13" \
  https://shofferai-27188185100.asia-south1.run.app/api/relay/ws 2>/dev/null
echo "(401 = auth works. 404 = path issue. 502/503 = instance down)"
```

### Step 6: E2E Relay Test (Send Real Request)

To verify the relay is truly working end-to-end, send a real task via the API:

```bash
# Login and get session
CSRF=$(curl -s -c /tmp/rd-cookies.txt https://shofferai-27188185100.asia-south1.run.app/api/auth/csrf | python3 -c "import sys,json; print(json.load(sys.stdin)['csrfToken'])")
curl -s -b /tmp/rd-cookies.txt -c /tmp/rd-cookies.txt -X POST https://shofferai-27188185100.asia-south1.run.app/api/auth/dev-login > /dev/null
curl -s -b /tmp/rd-cookies.txt -c /tmp/rd-cookies.txt -L -X POST \
  "https://shofferai-27188185100.asia-south1.run.app/api/auth/callback/credentials" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "csrfToken=${CSRF}&email=demo%40shofferai.com&password=demo1234" -o /dev/null

# Send a test task and capture first SSE events (5s timeout)
echo "=== E2E TEST: Sending task ==="
timeout 15 curl -s -N -b /tmp/rd-cookies.txt \
  -X POST "https://shofferai-27188185100.asia-south1.run.app/api/agent/execute" \
  -H "Content-Type: application/json" \
  -d '{"message":"hello"}' 2>/dev/null | head -10

rm -f /tmp/rd-cookies.txt
```

Expected output: `task_started` event followed by a `message` or `input_required` event. If you see `task_started` but then an `error` about "browser agent", the relay is disconnected on the Cloud Run side.

### Step 7: Database — Recent Task Failures

```bash
cd /Users/rohit/shofferAi
npx prisma db execute --stdin 2>/dev/null <<'SQL'
SELECT id, status, substr(description, 1, 60) as description,
       substr(result, 1, 120) as result,
       "createdAt", "completedAt"
FROM "Task"
WHERE status = 'failed'
  AND (result LIKE '%relay%' OR result LIKE '%Laptop%' OR result LIKE '%browser agent%' OR result LIKE '%not connected%' OR result LIKE '%grace period%' OR result LIKE '%connect to the browser%')
ORDER BY "createdAt" DESC
LIMIT 10;
SQL
```

### Step 8: Diagnose & Report

Based on ALL the data collected above, produce this diagnosis:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RELAY CONNECTION DIAGNOSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔌 Connection State
  Laptop relay process:     ✓ Running (PID xxx, uptime Xh) | ✗ Not running
  Relay mode:               Outbound (RELAY_CLOUD_URL set) | Server (local)
  WS to Cloud Run:          ✓ ESTABLISHED (FD xx → addr:443) | ✗ No connection
  TaskManager bridges:      ✓ Listening on :9400, :9401 | ✗ Not listening
  Chrome instances:         N running (pool max 3)
  Cloud Run HTTP:           ✓ 200 (Xs) | ✗ Down
  Phantom connection test:  ✓ Cloud Run has relay | ⚠️ PHANTOM — TCP up, bridge empty
  Duplicate relays:         ✗ None | ⚠️ N instances (FLAPPING!)

🔍 Root Cause: <FM1|FM2|FM3|FM4|FM5 or other>
  <Description with specific evidence from steps above>

🕐 Timeline
  <When relay started, when connection broke, how long the outage>

🔧 Immediate Fix
  <What the operator should do RIGHT NOW>

💡 Long-Term Fix (code changes needed)
  <What code changes would prevent this from recurring>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Root Cause Decision Tree

```
Is laptop relay process running?
├── NO → "Relay not started or crashed"
│   Operator: run start-laptop.sh
│
├── YES → Phantom connection test (Step 2)?
│   ├── PHANTOM (TCP up, Cloud Run says "not connected")
│   │   └── Was there a recent deploy?
│   │       ├── YES → FM2: Draining instance still alive, sending heartbeats
│   │       │   Operator: restart relay. Code fix: see Long-Term Fixes below.
│   │       └── NO → FM1: Cloud Run replaced instance silently (maintenance/OOM)
│   │           Stale check should have caught this in 25s. If it didn't,
│   │           the old instance was still alive and sending pings (FM2 variant).
│   │           Operator: restart relay.
│   │
│   ├── GENUINE DISCONNECT (no TCP, Cloud Run says "not connected")
│   │   └── Check relay logs for pattern:
│   │       ├── "auth failed / token mismatch" → RELAY_AUTH_TOKEN mismatch
│   │       ├── "RelayBridge not initialized after 30s" → FM3: Lazy singleton race
│   │       ├── Reconnect loop with growing delays → FM5: Backoff spiral
│   │       ├── "no data for 20s" → Network drop
│   │       └── "grace period expired" → Laptop was offline > 30s
│   │
│   └── CONNECTED (Cloud Run confirms relay present)
│       └── If tasks still fail:
│           ├── Check Chrome pool — are slots available?
│           ├── Check tool list — did fetchTools() succeed?
│           └── Check execute route — is handoff reaching the bridge?
│
└── MULTIPLE RELAY INSTANCES → "WS flapping"
    Operator: kill all, restart one.
```

## Key Timeouts Reference

| Component | Timeout | Meaning |
|-----------|---------|---------|
| **RelayOutbound phantom check** | 10s after connect | Laptop sends `sendStatus()`, expects app-level response within 10s. No response = phantom LB. |
| **RelayOutbound stale connection** | 25s no app message | Laptop kills WS if only LB pongs but no JSON messages from server. Server sends `{ type: 'ping' }` every 15s. |
| **RelayOutbound dead connection** | 20s no data at all | Laptop kills connection if total WS silence (no pongs, no messages). |
| **RelayOutbound status broadcast** | Every 10s | Laptop sends `relay_status` to server (proves laptop is alive to server). |
| **RelayBridge heartbeat** | 15s ping, 20s no-pong = close | Server sends `{ type: 'ping' }` JSON. If laptop doesn't respond (pong) for 20s, server closes WS. |
| **RelayBridge grace period** | 30s after disconnect | Server waits 30s for laptop to reconnect before failing pending requests. |
| **custom-server earlySocket** | 30s poll at 500ms | If laptop WS connects before singletons init, socket queued for 30s max. |
| **Cloud Run WS timeout** | 3600s (1 hour) | Max WebSocket connection lifetime. After this, Cloud Run terminates the WS. |
| **Reconnect backoff** | 1s → 2s → 4s → ... → 30s max | Exponential backoff. Reset to 1s only on close code 1001 (Going Away). |
| **Tool call timeout** | 60s | Individual relay tool call fails after 60s. |
| **connect() wait** | 60s | `RelayBridge.connect()` waits up to 60s for laptop to connect. |

## How Phantom Detection Works (and its gap)

### Two-layer detection on laptop (`relay-outbound.ts`):
1. **`lastDataAt`** — updated by ANY WS data (native pong frames + JSON messages)
2. **`lastAppMessageAt`** — updated by incoming JSON messages only (line 139)

The stale check (every 10s) compares `Date.now() - lastAppMessageAt > 25s`. If true → connection is phantom → terminate → reconnect.

### The gap (FM2):
When Cloud Run deploys a new revision:
1. Pre-deploy `release-relay` curl → old instance releases laptop → laptop reconnects
2. **But laptop may reconnect to the OLD draining instance** (still alive, still accepting WS)
3. Old instance keeps sending `{ type: 'ping' }` → `lastAppMessageAt` keeps updating → stale check never fires
4. New instance handles HTTP requests → no relay → tasks fail
5. Old instance stays alive for up to 3600s (Cloud Run keeps instances alive for active connections)

### Why the 25s stale check doesn't help here:
The server IS alive (just draining). It's sending real JSON heartbeat pings. These ARE application-level messages. The laptop correctly considers the connection healthy. **The problem is that HTTP requests go to a DIFFERENT instance.**

## Long-Term Code Fixes Needed

### Fix 1: Server-side "am I the active instance?" check
The RelayBridge should periodically verify it's the instance receiving HTTP traffic. If it detects it's draining (e.g., received SIGTERM or `process.exitCode` is set), it should immediately close the laptop WS.

**File**: `apps/web/lib/relay-bridge.ts`
**Change**: In `startHeartbeat()`, add a check for `process.exitCode !== undefined` or a `draining` flag set by SIGTERM. If draining, send close frame instead of ping.

### Fix 2: Reset backoff on earlySocket timeout (code 1011)
Currently only code 1001 resets backoff. Code 1011 (from earlySocket timeout) should also reset to prevent FM5 backoff spirals.

**File**: `apps/playwright/src/relay-outbound.ts`
**Change**: In the `close` handler, also reset backoff for code 1011.

### Fix 3: Pre-initialize RelayBridge in custom-server.js
Instead of lazy initialization in `singletons.ts`, create the RelayBridge in `custom-server.js` right after the HTTP server starts. This eliminates FM3 entirely.

**File**: `apps/web/custom-server.js`
**Change**: After `httpServer.listen()`, import and create `RelayBridge`, set on `globalThis.__relayBridge`.

### Fix 4: App-level ping-pong verification
The laptop should send a periodic "are you the active instance?" message that the server must respond to with its instance identity. If the response stops coming, the connection is phantom.

**File**: `apps/playwright/src/relay-outbound.ts` + `apps/web/lib/relay-bridge.ts`
**Change**: Add a `relay_verify` message type. Laptop sends every 30s. Server responds with Cloud Run instance ID (from `K_REVISION` env var). If laptop gets no response or gets a response from a different revision than expected, terminate.

### Fix 5: SIGTERM must aggressively close WS
The current SIGTERM handler calls `gracefulClose()` which does `ws.close(1001)`. This sends a close frame but waits for the client to acknowledge. In a deploy scenario, we should `ws.terminate()` (hard close) after a short timeout to ensure the connection drops.

**File**: `apps/web/lib/relay-bridge.ts`
**Change**: In `gracefulClose()`, after `ws.close(1001)`, set a 2s timeout to `ws.terminate()` if not already closed.

## Files Reference

| File | Role | Key things to check |
|------|------|---------------------|
| `apps/playwright/src/relay-outbound.ts` | Laptop → Cloud Run WS | `lastAppMessageAt`, stale check, phantom check, reconnect backoff |
| `apps/web/lib/relay-bridge.ts` | Cloud Run WS bridge | `setLaptopSocket()`, `isConnected()`, heartbeat, `gracefulClose()` |
| `apps/web/custom-server.js` | WS upgrade handler | `wireLaptopSocket()`, `earlyLaptopSocket` queue, SIGTERM handler |
| `apps/web/lib/singletons.ts` | Lazy singleton init | Creates `RelayBridge`, sets `globalThis.__relayBridge` on first import |
| `apps/web/app/api/agent/execute/route.ts` | Task execution | `ensureRelayConnected()`, `onTaskHandoff()`, SSE stream |
| `apps/web/app/api/admin/release-relay/route.ts` | Force disconnect | `remoteMcpHost.isConnected()`, `disconnect()` |
| `cloudbuild.yaml` | Deploy config | Pre-deploy `release-relay` step, `min/max-instances: 1` |
