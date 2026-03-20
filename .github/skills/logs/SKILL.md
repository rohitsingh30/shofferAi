---
name: logs
description: View and tail logs from relay, agent, Chrome Pool, or Next.js. Use this when asked to check logs, debug issues, or see what's happening in the system.
---

View real-time or recent logs from any ShofferAI service.

## Instructions

Ask what logs the user wants, or show all:

### Relay / Chrome Pool logs
The relay runs in the foreground terminal. If started via background task, check:
```bash
# Recent relay output (if running in background)
tail -50 /private/tmp/claude-*/tasks/*.output 2>/dev/null | grep -E "Session|slot|Slot|Pool|error|ERROR|connected"
```

### Pool status (live)
```bash
# TaskManager bridge (always active — works in both outbound and server modes)
curl -s http://localhost:9400 2>/dev/null | python3 -m json.tool || echo "Relay not running"

# Server mode only (dev without RELAY_CLOUD_URL): RelayServer on port 8765
curl -s http://localhost:8765 2>/dev/null | python3 -m json.tool || true
```

### Next.js dev server logs
```bash
tail -30 /private/tmp/claude-*/tasks/*.output 2>/dev/null | grep -E "Ready|error|ERROR|compiled|warning"
```

### Agent execution logs (from chat requests)
Check Next.js server output for agent activity:
```bash
# If dev server is in foreground, watch the terminal
# For API-level debugging:
curl -s http://localhost:3000/api/relay/health 2>/dev/null | python3 -m json.tool
```

### Chrome CDP info per slot
```bash
for port in 9222 9223 9224; do
  echo "=== Chrome :$port ==="
  curl -s "http://localhost:$port/json/list" | python3 -c "
import sys,json
tabs = json.load(sys.stdin)
for t in tabs[:5]:
    print(f'  {t[\"type\"]}: {t[\"title\"][:60]} — {t[\"url\"][:80]}')
" 2>/dev/null || echo "  DOWN"
done
```

This shows what each pool Chrome window is currently displaying — useful for debugging which slot is handling which task.

### Filter for errors only
```bash
grep -i "error\|fail\|crash\|ECONNREFUSED\|timeout" /private/tmp/claude-*/tasks/*.output 2>/dev/null | tail -20
```
