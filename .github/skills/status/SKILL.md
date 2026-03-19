---
name: status
description: Check health of all ShofferAI services — relay, pool, Chrome, dev server, prod. Use this when something seems broken, at the start of a session, or to check system health.
---

Quick health check across the entire ShofferAI stack. Run this when something seems broken or at the start of a session.

See `docs/DEPLOYMENT.md` for what runs where (Cloud Run vs Laptop).

## Instructions

Run ALL of these checks and report a single status table:

### 1. Chrome Pool + Relay (server mode only)
```bash
curl -s http://localhost:8765 2>/dev/null | python3 -m json.tool || echo "RELAY: Not in server mode (may be in outbound mode, or down)"
```

### 2. Individual Chrome CDP instances
```bash
for port in 9222 9223 9224 9225; do
  echo -n "Chrome :$port — "
  curl -s "http://localhost:$port/json/version" 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin)['Browser'])" 2>/dev/null || echo "DOWN"
done
```

### 3. Check if laptop relay process is running
```bash
ps aux | grep -E 'tsx.*src/index|relay-server|relay-outbound' | grep -v grep | head -5 || echo "No relay process found"
```

### 4. Next.js dev server
```bash
curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 2>/dev/null || echo "DOWN"
```

### 5. Production
```bash
curl -s -o /dev/null -w '%{http_code}' https://shofferai-27188185100.asia-south1.run.app 2>/dev/null || echo "DOWN"
```

### 6. Production relay health
```bash
curl -s https://shofferai-27188185100.asia-south1.run.app/api/relay/health 2>/dev/null | python3 -m json.tool 2>/dev/null || echo "Relay health endpoint not available"
```

### 7. Database
```bash
cd /Users/rohit/shofferAi && npx prisma db execute --stdin <<< "SELECT 1" 2>/dev/null && echo "OK" || echo "DOWN or not configured"
```

### Report format

```
ShofferAI Status
──────────────────────────────────────────
Relay Mode:        Outbound (prod) | Server (dev) | DOWN
Chrome Pool:
  Slot 0 (9222):   ✓ Chrome XXX | ✗ DOWN
  Slot 1 (9223):   ✓ Chrome XXX | ✗ DOWN
  Slot 2 (9224):   ✓ Chrome XXX | ✗ DOWN
Dev server (3000): ✓ HTTP 200   | ✗ DOWN
Production:        ✓ HTTP 200   | ✗ DOWN
Prod Relay:        ✓ Laptop connected | ✗ Not connected
Database:          ✓ Connected  | ✗ DOWN
──────────────────────────────────────────
```

If anything is down, suggest the fix command:
- Chrome/Relay down → `/start-laptop`
- Prod relay not connected → `/start-laptop` (Option A: outbound mode)
- Dev server down → `cd apps/web && npx next dev`
- Database down → Check `.env` DATABASE_URL
