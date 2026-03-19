---
name: tunnel
description: Start Cloudflare Tunnel and connect laptop relay to prod Cloud Run. Use this when asked to set up a tunnel, expose the relay, or connect laptop to production.
---

Connect the local Chrome Pool relay to production Cloud Run.

> **Note:** With the newer `RelayOutbound` mode, Cloudflare Tunnel is **no longer required** for production. The laptop connects directly to Cloud Run via `RELAY_CLOUD_URL`. This skill is now primarily for **dev/testing** when you need to expose a local relay to the internet.

## Preferred: Direct Outbound Connection (no tunnel)

If `RELAY_CLOUD_URL` is set when running `npm run laptop`, the laptop connects directly to Cloud Run via WSS — no tunnel needed. See `/start-laptop` (Option A).

```bash
RELAY_CLOUD_URL=wss://shofferai-27188185100.asia-south1.run.app/api/relay/ws \
RELAY_AUTH_TOKEN=<token> \
npm run laptop
```

## Fallback: Cloudflare Tunnel (dev/testing only)

Use this when Cloud Run needs to connect OUT to your laptop (old `RELAY_MODE=local` pattern, or for testing).

### Prerequisites
- Relay must be running in server mode (no `RELAY_CLOUD_URL`): `curl localhost:8765` should return pool status
- If not, run `/start-laptop` (Option B) first

### Step 1: Start Cloudflare Tunnel

```bash
cloudflared tunnel --url http://localhost:8765
```

This outputs a URL like `https://xxx-yyy-zzz.trycloudflare.com`. Grab the URL.

### Step 2: Update Cloud Run with tunnel URL

```bash
gcloud run services update shofferai --region=asia-south1 \
  --update-env-vars="RELAY_LAPTOP_URL=wss://<TUNNEL_URL>"
```

Replace `<TUNNEL_URL>` with the trycloudflare.com hostname (without https://).

### Step 3: Verify connection

Check relay logs — should see: `Relay client connected from <cloud-run-ip>`

Or check prod health:
```bash
curl -s https://shofferai-27188185100.asia-south1.run.app/api/relay/health
```

### Step 4: Report

```
Tunnel active:
  Local:  http://localhost:8765
  Tunnel: wss://<TUNNEL_URL>
  Prod:   Updated RELAY_LAPTOP_URL on Cloud Run
  Status: Connected
```

### Notes
- Tunnel URL changes every time cloudflared restarts — you must update Cloud Run each time
- For persistent tunnels, create a named tunnel: `cloudflared tunnel create shofferai`
- **Consider switching to direct outbound mode** (`RELAY_CLOUD_URL`) to eliminate the tunnel dependency entirely
