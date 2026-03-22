---
name: relay-doctor
description: Diagnose relay connection drops, chat↔relay failures, and WebSocket flapping. Deep investigation with enhanced logs and root cause analysis.
---

Investigate WHY the relay connection dropped or why the chat interface can't reach the running relay. This is a **deep diagnostic** skill — not just "is it up?" but "what happened and why?"

## Common Symptoms This Skill Diagnoses

| Symptom | Likely Root Cause |
|---------|------------------|
| "Cannot reach browser agent" in chat | Relay WS disconnected between Cloud Run ↔ Laptop |
| Task works sometimes, fails other times | Connection flapping — multiple relay instances OR phantom connections |
| Relay running but chat says "not connected" | Singletons not initialized, OR bridge has stale socket reference |
| Relay reconnects every 30s in a loop | Auth token mismatch OR Cloud Run instance cycling |
| Chat hangs after handoff, no progress | WS open but backend dead (phantom LB connection) |
| "Laptop disconnected (grace period expired)" | Laptop relay crashed or network drop, didn't reconnect within 30s |

## Instructions

### Step 1: Capture Current State Snapshot

Run ALL of these in parallel to get a full picture:

```bash
echo "=== RELAY PROCESS ==="
ps aux | grep -E 'tsx.*src/index|relay-server|relay-outbound|node.*custom-server' | grep -v grep

echo ""
echo "=== WEBSOCKET CONNECTIONS (relay ports) ==="
# Check for active WebSocket connections on common relay ports
lsof -iTCP -sTCP:ESTABLISHED -P 2>/dev/null | grep -E ":(8765|3000|443)" | head -20

echo ""
echo "=== CHROME POOL ==="
for port in 9222 9223 9224 9225; do
  echo -n "  Chrome :$port — "
  curl -s --max-time 2 "http://127.0.0.1:$port/json/version" 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('Browser','?'))" 2>/dev/null || echo "DOWN"
done

echo ""
echo "=== DEV SERVER ==="
curl -s --max-time 3 -o /dev/null -w 'HTTP %{http_code} (%{time_total}s)' http://localhost:3000 2>/dev/null || echo "DOWN"

echo ""
echo "=== PROD RELAY HEALTH ==="
curl -s --max-time 5 https://shofferai-27188185100.asia-south1.run.app/api/relay/health 2>/dev/null | python3 -m json.tool 2>/dev/null || echo "No relay health endpoint or unreachable"

echo ""
echo "=== ENVIRONMENT ==="
echo "RELAY_MODE=${RELAY_MODE:-<not set>}"
echo "RELAY_CLOUD_URL=${RELAY_CLOUD_URL:-<not set>}"
echo "NODE_ENV=${NODE_ENV:-<not set>}"
```

### Step 2: Check for Duplicate Relay Instances (Critical!)

Only ONE relay instance may run at a time. Duplicates cause WebSocket flapping on Cloud Run — both instances fight over the single WS slot, and the bridge keeps getting its socket replaced.

```bash
echo "=== DUPLICATE RELAY CHECK ==="
RELAY_PIDS=$(ps aux | grep -E 'tsx.*src/index' | grep -v grep | awk '{print $2}')
COUNT=$(echo "$RELAY_PIDS" | grep -c .)
if [ "$COUNT" -gt 1 ]; then
  echo "⚠️  CRITICAL: $COUNT relay instances running! This causes WS flapping."
  echo "PIDs: $RELAY_PIDS"
  echo "Kill extras with: kill <PID>"
  ps aux | grep -E 'tsx.*src/index' | grep -v grep
else
  echo "✓ Single relay instance (or none): $RELAY_PIDS"
fi

echo ""
echo "=== DUPLICATE CHROME CHECK ==="
CHROME_COUNT=$(ps aux | grep -E 'Google Chrome.*remote-debugging' | grep -v grep | wc -l | tr -d ' ')
echo "Chrome instances: $CHROME_COUNT"
if [ "$CHROME_COUNT" -gt 4 ]; then
  echo "⚠️  Too many Chrome instances — possible leak from crashed relay"
  ps aux | grep -E 'Google Chrome.*remote-debugging' | grep -v grep | awk '{print $2, $NF}' | head -10
fi
```

### Step 3: Check Relay Logs for Connection Events

Look for the actual disconnect/reconnect events in relay output. The relay runs in a foreground terminal, but background task logs may also capture output:

```bash
echo "=== RECENT RELAY LOG EVENTS ==="

# Check background task logs (Copilot CLI sessions)
for f in /private/tmp/claude-*/tasks/*.output; do
  [ -f "$f" ] || continue
  HITS=$(grep -c -E 'RelayOutbound|RelayBridge|RelayClient|Disconnected|reconnect|phantom|dead connection|grace period|SIGTERM' "$f" 2>/dev/null)
  if [ "$HITS" -gt 0 ]; then
    echo ""
    echo "--- $f ($HITS relay events) ---"
    grep -E 'RelayOutbound|RelayBridge|RelayClient|Disconnected|reconnect|phantom|dead connection|grace period|SIGTERM|laptop connected|laptop disconnected|pong|stale|auth failed' "$f" | tail -40
  fi
done

echo ""
echo "=== RECENT ERROR EVENTS ==="
grep -rh -E 'ECONNREFUSED|ECONNRESET|EPIPE|ETIMEDOUT|EHOSTUNREACH|socket hang up|relay.*error|connection.*failed|token mismatch' /private/tmp/claude-*/tasks/*.output 2>/dev/null | tail -20
```

### Step 4: Trace the Connection Path (Cloud Side)

If the user is running the dev server locally, check the Next.js output:

```bash
echo "=== SINGLETONS INIT ==="
# Check if singletons were initialized (look in dev server output)
grep -rh '\[singletons\]' /private/tmp/claude-*/tasks/*.output 2>/dev/null | tail -5

echo ""
echo "=== EXECUTE ROUTE RELAY EVENTS ==="
grep -rh '\[execute\].*[Rr]elay\|ensureRelayConnected\|handoff.*failed\|Cannot reach browser' /private/tmp/claude-*/tasks/*.output 2>/dev/null | tail -20

echo ""
echo "=== CUSTOM SERVER EVENTS ==="
grep -rh '\[relay\]\|\[server\]' /private/tmp/claude-*/tasks/*.output 2>/dev/null | tail -20
```

### Step 5: Network-Level Diagnostics

```bash
echo "=== DNS RESOLUTION ==="
dig +short shofferai-27188185100.asia-south1.run.app 2>/dev/null || nslookup shofferai-27188185100.asia-south1.run.app 2>/dev/null | tail -3

echo ""
echo "=== TCP CONNECTIVITY TO CLOUD RUN ==="
curl -s --max-time 5 -o /dev/null -w 'HTTP %{http_code} (connect: %{time_connect}s, total: %{time_total}s)\n' https://shofferai-27188185100.asia-south1.run.app 2>/dev/null

echo ""
echo "=== WEBSOCKET UPGRADE TEST ==="
# Try a WS upgrade to the relay endpoint (should get 401 without token, which proves the path works)
curl -s --max-time 5 -o /dev/null -w 'HTTP %{http_code}\n' \
  -H "Upgrade: websocket" \
  -H "Connection: Upgrade" \
  -H "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==" \
  -H "Sec-WebSocket-Version: 13" \
  https://shofferai-27188185100.asia-south1.run.app/api/relay/ws 2>/dev/null
echo "(401 = auth working, path reachable. 502/503 = Cloud Run instance down)"
```

### Step 6: Database — Recent Task Failures Related to Relay

```bash
cd /Users/rohit/shofferAi

# Recent tasks that failed with relay/browser errors
npx prisma db execute --stdin 2>/dev/null <<'SQL'
SELECT id, status, substr(description, 1, 60) as description,
       substr(result, 1, 120) as result,
       "createdAt", "completedAt"
FROM "Task"
WHERE status = 'failed'
  AND (result LIKE '%relay%' OR result LIKE '%Laptop%' OR result LIKE '%browser agent%' OR result LIKE '%not connected%' OR result LIKE '%grace period%')
ORDER BY "createdAt" DESC
LIMIT 10;
SQL
```

```bash
cd /Users/rohit/shofferAi

# Relay telemetry — disconnects and errors
npx prisma db execute --stdin 2>/dev/null <<'SQL'
SELECT event, success, "durationMs", substr(cast(metadata as text), 1, 150) as metadata, timestamp
FROM "TelemetryEvent"
WHERE category = 'relay'
  AND (event LIKE '%disconnect%' OR event LIKE '%error%' OR success = false)
ORDER BY timestamp DESC
LIMIT 15;
SQL
```

### Step 7: Diagnose & Report

Based on ALL the data collected above, produce this diagnosis:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RELAY CONNECTION DIAGNOSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔌 Connection State
  Laptop relay process:  ✓ Running (PID xxx) | ✗ Not running
  Chrome pool:           3/3 slots alive | 0/3 DOWN
  Cloud Run reachable:   ✓ HTTP 200 (0.3s) | ✗ Timeout/5xx
  WS path (/api/relay/ws): ✓ Reachable (401 = auth works) | ✗ 502/503
  Duplicate instances:   ✗ None | ⚠️ N instances (FLAPPING!)

🔍 Root Cause
  <One of the patterns below, with specific evidence>

🕐 Timeline
  <When it happened, how long the outage lasted, when it recovered>

🔧 Fix
  <Specific command or action to resolve>

💡 Prevention
  <What to change so this doesn't recur>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Root Cause Decision Tree

Use this to map evidence → diagnosis:

```
Is laptop relay process running?
├── NO → "Relay not started or crashed"
│   Fix: ./apps/playwright/scripts/start-laptop.sh
│
├── YES → Are there multiple relay PIDs?
│   ├── YES → "WS flapping — duplicate relay instances"
│   │   Fix: kill all but one PID, then restart
│   │
│   └── NO → Can laptop reach Cloud Run?
│       ├── NO (DNS/TCP fail) → "Network issue — laptop can't reach Cloud Run"
│       │   Fix: Check internet, VPN, firewall
│       │
│       └── YES → Is WS path returning 401 or upgrade?
│           ├── 502/503 → "Cloud Run instance down or cold start"
│           │   Fix: Wait 30s for cold start, or check Cloud Run logs
│           │
│           └── 401/upgrade works → Check relay logs for specific pattern:
│               ├── "phantom connection" → "LB holding stale WS after deploy"
│               │   Evidence: lastAppMessageAt not updating despite WS open
│               │   Fix: Automatic (25s stale timeout), or manual: kill relay, restart
│               │
│               ├── "token mismatch" → "Auth token different on laptop vs Cloud Run"
│               │   Fix: Check RELAY_AUTH_TOKEN in start-laptop.sh matches Cloud Run env
│               │
│               ├── "grace period expired" → "Laptop disconnected > 30s"
│               │   Evidence: RelayBridge log shows grace period start, then expiry
│               │   Fix: Check laptop network, restart relay
│               │
│               ├── "no heartbeat pong for 20s" → "Laptop stopped responding to pings"
│               │   Evidence: RelayBridge closed connection after 20s no pong
│               │   Fix: Check laptop CPU/memory, Chrome pool load
│               │
│               ├── "no data for 20s" → "TCP connection silently dropped"
│               │   Evidence: RelayOutbound health check detected silence
│               │   Fix: Network issue — check WiFi/ethernet stability
│               │
│               ├── Reconnect loop (1s, 2s, 4s, 8s...) → "Persistent connection failure"
│               │   Fix: Check Cloud Run instance health, recent deploys
│               │
│               └── "RelayBridge not ready yet" → "Singleton init race condition"
│                   Evidence: custom-server.js queuing socket, 30s timeout
│                   Fix: First request to Next.js triggers init. Hit any page/API route.
```

## Key Timeouts Reference

When analyzing logs, these timeouts explain the timing of events:

| Component | Timeout | Meaning |
|-----------|---------|---------|
| RelayBridge heartbeat | 15s ping, 20s no-pong = close | Cloud closes laptop if laptop stops responding |
| RelayBridge grace period | 30s after disconnect | Cloud waits this long before failing pending requests |
| RelayOutbound dead connection | 20s no data = terminate | Laptop kills connection if total WS silence |
| RelayOutbound stale connection | 25s no app message = terminate | Laptop kills if only LB pongs but no real messages |
| RelayOutbound phantom check | 10s after connect | Laptop verifies real backend within 10s of WS open |
| RelayClient heartbeat | 15s ping, 45s no-pong = close | Dev-mode cloud kills if laptop stops responding |
| custom-server socket queue | 30s poll timeout | Laptop socket dropped if RelayBridge never initializes |
| Tool call RPC | 60s timeout | Individual tool call fails after 60s |
| keepAliveTimeout | 620s (10m 20s) | HTTP/SSE connections max idle time |
| Reconnect backoff | 1s → 2s → 4s → ... → 30s max | Exponential backoff for all reconnect paths |

## Files to Check When Adding More Logs

| File | What to log | Why |
|------|------------|-----|
| `apps/web/lib/relay-bridge.ts` | Every `setLaptopSocket()` call with old socket state | Detect socket replacement races |
| `apps/web/lib/relay-bridge.ts` | `sendRequest()` when `!connected` with stack trace | Find who's calling relay when it's down |
| `apps/web/lib/relay-client.ts` | WS `readyState` on every `sendRequest()` | Catch CLOSING/CLOSED state mismatches |
| `apps/web/custom-server.js` | Every upgrade attempt (success AND failure) | Track connection frequency |
| `apps/playwright/src/relay-outbound.ts` | `lastDataAt` and `lastAppMessageAt` on every health check | Understand silence patterns |
| `apps/web/app/api/agent/execute/route.ts` | `remoteMcpHost.isConnected()` state at handoff time | Catch false-positive "connected" states |
| `apps/web/lib/singletons.ts` | When `__relayBridge` is first set on globalThis | Detect init timing issues |
