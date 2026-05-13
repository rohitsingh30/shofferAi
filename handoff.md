# HANDOFF — playwright-runner v0 vendor service

> The on-laptop reference implementation of `BROWSER-SERVICE-CONTRACT.md`.
> What you need to integrate, run, and operate it. Last updated 2026-05-13.

---

## 1. What this is

A local HTTP service that exposes signed-in browser ops as **typed atomic
tools**, both as **REST** and as **MCP (Streamable HTTP)**. Each op runs in
a real, persistent Chrome browser that's already signed in to the target
sites (currently bigbasket; Gmail / LinkedIn etc. are one `npm run bridge`
away).

- **REST** at `POST /v1/sessions/...` for direct callers (curl, ops
  dashboards, batch jobs).
- **MCP** at `POST /mcp` for AI orchestrators (ShofferAI cloud /
  GPT-5.3 / any MCP client). Same handlers, same idempotency, same sessions.

This is **v0 of the contract's vendor service**. Cloud's existing MCP plumbing
plugs in with a single URL change.

---

## 2. Quickstart (5 min)

```bash
cd ~/playwrightRunner

# 1. Install deps (once)
npm install

# 2. Make sure .env exists with a strong token
[ -f .env ] || cat > .env <<EOF
RUNNER_TOKEN=$(openssl rand -base64 48 | tr -d '\n=')
RUNNER_HOST=127.0.0.1
RUNNER_PORT=8787
EOF
chmod 600 .env

# 3. Bridge cookies from your real Chrome (one-time per operator).
#    Quit Chrome FIRST (Cmd+Q) — bridging while it's open is unsafe.
npm run bridge -- rsinghtomar54@gmail.com

# 4. Start the service (HEADED is required today — see §10 anti-bot).
export RUNNER_PROFILE="Profile 1" \
       RUNNER_OPERATOR_ID="op_rsinghtomar54" \
       RUNNER_OPERATOR_LABEL="Rohit (rsinghtomar54)" \
       RUNNER_OPERATOR_EMAIL_MASKED="rs***@gmail.com"
npm run server
```

Service comes up on `http://127.0.0.1:8787`. Verify:

```bash
TOK=$(grep ^RUNNER_TOKEN .env | cut -d= -f2-)
curl -sS http://127.0.0.1:8787/healthz                       # {"ok":true,...}
curl -sS -H "Authorization: Bearer $TOK" http://127.0.0.1:8787/scripts | jq .scripts[].name
```

---

## 3. Environment / configuration

| Var | Default | Notes |
|---|---|---|
| `RUNNER_TOKEN` | (required, ≥ 32 chars) | Bearer token. Generate: `openssl rand -base64 48`. |
| `RUNNER_HOST` | `127.0.0.1` | Bind address. Loopback only by default. |
| `RUNNER_PORT` | `8787` | |
| `RUNNER_ALLOW_REMOTE` | unset | Set to `1` to allow non-loopback bind. **DO NOT** without TLS termination in front. |
| `RUNNER_HEADLESS` | unset (= headed) | Set to `1` for `--headless=new`. **Today: keep headed.** Akamai blocks bigbasket `/ps/` in headless. |
| `RUNNER_OPERATOR_ID` | `op_default` | The operator id used when `session.open` doesn't specify one. |
| `RUNNER_OPERATOR_LABEL` | `Operator (concierge)` | Display label in `logged_in_as.operator_label`. |
| `RUNNER_OPERATOR_EMAIL_MASKED` | (none) | Display masked email. |
| `RUNNER_PROFILE` | `Default` | Chrome `--profile-directory` inside the dedicated UDD. After `npm run bridge -- <email>` it's typically `"Profile N"`. |
| `RUNNER_UDD` | `~/Library/Application Support/Google/Chrome-PlaywrightRunner` | Dedicated UDD path. Sibling of your real Chrome UDD. |
| `CHROME_BIN` | `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` | Must be the real Chrome.app binary, not Playwright's bundled Chromium (Keychain ACL). |
| `RUNNER_MAX_CONCURRENCY` | `1` | Global cap on simultaneous in-flight ops. **Per-session is always serial** (B3) regardless of this. |
| `RUNNER_MAX_TIMEOUT_MS` | `300000` | Hard cap on per-op timeout. |
| `RUNNER_IDEMPOTENCY_TTL_MS` | `86400000` (24 h) | Per spec §8. |

**Multi-operator** (future): add entries to `src/operators.ts` mapping
`operatorId → {userDataDir, profileDirectory, label, maskedEmail}`. Each
operator gets its own bridged UDD.

---

## 4. Authentication

Bearer token, Bearer token, Bearer token. Send on every request except
`/healthz` and `/v1/health`:

```
Authorization: Bearer <RUNNER_TOKEN>
```

Compared with `crypto.timingSafeEqual`. ≥ 32 char minimum enforced at
startup. The token is stored in `.env` with `chmod 600` so other UNIX
users on the laptop can't read it.

---

## 5. Two transports

### 5.1 REST — `POST /v1/sessions/...`

Use this for direct human-driven calls, ops dashboards, cron, batch jobs.

```bash
TOK=$(grep ^RUNNER_TOKEN .env | cut -d= -f2-)

# Open a session
SES=$(curl -sS -X POST http://127.0.0.1:8787/v1/sessions \
  -H "Authorization: Bearer $TOK" -H "Content-Type: application/json" \
  -d '{"site":"bigbasket","operator_id":"op_rsinghtomar54"}')
SES_ID=$(echo "$SES" | jq -r .session_id)

# Run an op
curl -sS -X POST "http://127.0.0.1:8787/v1/sessions/$SES_ID/op/bigbasket.search" \
  -H "Authorization: Bearer $TOK" -H "Content-Type: application/json" \
  -H "X-Idempotency-Key: $(openssl rand -hex 16)" \
  -d '{"input":{"query":"basmati rice","topN":3}}' | jq .

# Snapshot / close
curl -sS -H "Authorization: Bearer $TOK" "http://127.0.0.1:8787/v1/sessions/$SES_ID" | jq .
curl -sS -X DELETE -H "Authorization: Bearer $TOK" "http://127.0.0.1:8787/v1/sessions/$SES_ID" | jq .
```

Endpoints:
| Method | Path | Auth |
|---|---|---|
| `GET` | `/healthz` | no |
| `GET` | `/v1/health` | no |
| `GET` | `/scripts` | yes — list available ops + metadata |
| `GET` | `/status` | yes — pool state, session list, stats |
| `POST` | `/v1/sessions` | yes — open |
| `GET` | `/v1/sessions/:id` | yes — snapshot |
| `DELETE` | `/v1/sessions/:id` | yes — close |
| `POST` | `/v1/sessions/:id/op/:opName` | yes — run an op |
| `POST` | `/run/:name` | yes — legacy / sessionless |
| `POST` | `/mcp` | yes — MCP transport (see §5.2) |

Headers:
- `Authorization: Bearer <token>` — required.
- `Content-Type: application/json` — required on all `POST`s with bodies (Fastify rejects 415 otherwise).
- `X-Idempotency-Key: <8-128 chars [A-Za-z0-9_-]>` — optional. Replays return cached response with `X-Idempotent-Replay: true`. Same key + different body → `409 idempotency_replay_mismatch`.

### 5.2 MCP — `POST /mcp` (Streamable HTTP)

Use this from ShofferAI cloud, GPT-5.3, or any MCP client. Same auth.

Required headers:
```
Authorization: Bearer <RUNNER_TOKEN>
Content-Type: application/json
Accept: application/json, text/event-stream
```

Standard MCP wire (JSON-RPC over HTTP, server replies with SSE `event: message`):

```bash
# 1. initialize
curl -sS -X POST http://127.0.0.1:8787/mcp \
  -H "Authorization: Bearer $TOK" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize",
       "params":{"protocolVersion":"2025-06-18","capabilities":{},
                 "clientInfo":{"name":"my-client","version":"0.1"}}}'

# 2. tools/list — returns the catalogue with full inputSchemas
curl -sS -X POST http://127.0.0.1:8787/mcp \
  -H "Authorization: Bearer $TOK" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'

# 3. tools/call session.open
curl -sS -X POST http://127.0.0.1:8787/mcp \
  -H "Authorization: Bearer $TOK" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call",
       "params":{"name":"session.open",
                 "arguments":{"site":"bigbasket","operator_id":"op_rsinghtomar54"}}}'
# → SSE response with structuredContent containing the SessionSnapshot

# 4. tools/call <site>.<op> with idempotency
curl -sS -X POST http://127.0.0.1:8787/mcp \
  -H "Authorization: Bearer $TOK" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":4,"method":"tools/call",
       "params":{"name":"bigbasket.search",
                 "arguments":{"session_id":"ses_...","input":{"query":"milk","topN":3}},
                 "_meta":{"shoffer.idempotency_key":"01J7Z5K3F8H2RSX9M1Q3W4V5N6",
                          "shoffer.task_id":"task_abc",
                          "shoffer.user_ref":"sha256:0d4a..."}}}'
# Replay (same key, same args) returns cached result with
#   _meta.shoffer.idempotent_replay: true
```

Tool result shape (per spec §22.5):
```jsonc
{
  "content": [{"type": "text", "text": "<one-line summary>"}],
  "structuredContent": { /* the canonical op output */ },
  "isError": false,
  "_meta": { /* may include shoffer.idempotent_replay: true */ }
}
```

Errors: `isError: true` + RFC 7807 in `structuredContent` (per spec §22.6):
```jsonc
{
  "content": [{"type": "text", "text": "Out of stock: ..."}],
  "structuredContent": {
    "type": "https://docs.shoffer.ai/errors/out_of_stock",
    "title": "out_of_stock",
    "status": 409,
    "code": "out_of_stock",
    "detail": "...",
    "session_id": "ses_...",
    "run_id": "..."
  },
  "isError": true
}
```

### 5.3 Cloud integration (ShofferAI side)

```bash
BROWSER_OPS_URL=http://laptop.local:8787/mcp
BROWSER_OPS_TOKEN=<contents of .env RUNNER_TOKEN>
```

The contract's adapter modules (per §16.1):
- `apps/web/lib/browser-ops/mcp-client.ts` connects via `@modelcontextprotocol/sdk` Streamable HTTP transport at `BROWSER_OPS_URL`.
- `apps/web/lib/browser-ops/browser-ops-host.ts` implements `MCPHostLike`; injects `session_id` + `_meta.shoffer.{idempotency_key,task_id,user_ref,cart_namespace}` on every `tools/call`.
- `SessionMCPHost` (existing) carries `session_id` per call — works unchanged against this server.

Once connected, the cloud sees these as native MCP tools (verified surface):

```
session.open                — open a (operator, site) browser session
session.snapshot            — read current state
session.close               — close + free the warm-context refcount
bigbasket.whoami            — verify signed-in (cookies + page signals)
bigbasket.search            — search products, top N
bigbasket.get_cart          — current cart contents + totals
bigbasket.add_to_cart       — add a product to operator's cart
bigbasket.dom_dump          — diagnostic (rate-limited in prod; sandbox-only)
pageInfo                    — generic util (any URL → title)
```

Coming next (per `BROWSER-SERVICE-CONTRACT.md` §5.4): `get_product`,
`update_cart_qty`, `remove_from_cart`, `clear_cart`, `set_delivery_address`,
`list_delivery_slots`, `select_delivery_slot`, `checkout_summary`,
`place_order` (with elicitation pause for OTP/payment), `submit_otp`,
`confirm_payment`, `get_order`.

---

## 6. Sessions

A **session** is a logical handle bound to one `(operator, site)` tuple.
Open it once at the start of a chat task / batch job, run many ops against
it, close at the end.

| Concept | Behaviour |
|---|---|
| `session_id` | ULID-ish opaque string (`ses_...`). Generated by the server. |
| `cart_namespace` | `ns_<sessionId>`. Returned at open. Today informational; cart-bookkeeping (B5) is future work. |
| `verified_signed_in` | `null` initially. Becomes `true|false` after the first op runs a real probe (e.g. `bigbasket.whoami`). NEVER trust until verified. |
| Warm reuse (§2.1) | Same `(workspace, operator, site)` tuple → returns warm session in < 200ms. `force_fresh: true` to opt out. |
| Per-session serial (§5.3.1) | Two ops on the same session run one-at-a-time. Concurrency comes from multiple sessions, not multiple ops per session. |
| Lifetime | Default 30 min. Capped at 1 h. |
| Idle timeout | Default 5 min. Capped at 30 min. |
| Operator binding | Server enforces operator → bridged UDD via `OperatorRegistry`. Unknown operator → fail-fast with "run npm run bridge". |

---

## 7. Idempotency (spec §8 / §22.9)

- **REST**: `X-Idempotency-Key: <8-128 chars [A-Za-z0-9_-]>` header.
- **MCP**: `_meta.shoffer.idempotency_key` on `tools/call.params`.

Behaviour:
- Same key + same body within 24 h → cached response, `X-Idempotent-Replay: true` (REST) / `_meta.shoffer.idempotent_replay: true` (MCP). Verified replay: **56 ms** vs original 8.6 s.
- Same key + different body → `409 idempotency_replay_mismatch`.
- Bad key shape → `400 validation_error`.

**Cloud rule (S1)**: ALWAYS use a fresh ULID per intent, NEVER a hash of the
args. "Add 2 of these" = 1 intent = 1 key. "Add this same product again" = a
new intent = a new key.

Storage today: in-memory Map (10k entry cap, 24 h TTL). Single-laptop is
fine; multi-process / persistence is later.

---

## 8. Errors

| HTTP / MCP `code` | Meaning | Recoverable |
|---|---|---|
| `validation_error` (400) | Bad input shape | yes — fix the call |
| `unauthorized` (401) | Bad / missing Bearer | no |
| `session_not_found` (404) | Unknown `session_id` | no — open a new one |
| `op_not_supported` (404) | No script with that name | no |
| `op_site_mismatch` (400) | `bigbasket.*` op called from a non-bigbasket session | no |
| `idempotency_replay_mismatch` (409) | Same key, different body | no — use a new key |
| `pause_already_resumed` (409) | Resume after first resume | (when elicitation lands) |
| `session_closed` (410) | Op against a closed/failed session | no — reopen |
| `site_unavailable` (503) | Site down / sign-in expired | maybe — re-bridge |
| `op_failed` (500) | Script threw | check `screenshot` + `html` paths in the response |

REST failure responses include `screenshot` and `html` paths (in `runs/<runId>/`)
when the page-level error happened mid-script.

MCP failure responses follow RFC 7807 inside `structuredContent` (per spec
§22.6). Same fields available.

---

## 9. The op authoring loop (adding a new op)

```bash
# 1. Stop the runner — single-UDD lock means you can't author while it's running.
#    (or use the dom_dump op to inspect a live page if the runner is up)

# 2. Drop a script at scripts/<site>/<op>.ts that default-exports:
#    async (page: Page, input, ctx: ScriptCtx) => output
#
#    See scripts/bigbasket/search.ts for a full example. Key idioms:
#      • In-page evaluators: pass JS body as STRING, IIFE-wrap with arg
#        interpolated. Avoids esbuild's __name helper crashing in the page.
#      • Anchor on STABLE structural selectors (button#decrement, qa= attrs,
#        view-model element names) over text labels (BB id strings are stable;
#        text strings are localised + redesigned).
#      • Always probe state with an explicit attribute (aria-pressed, etc.)
#        before any state-mutating click. Never assume "looks signed in" =
#        "is signed in".
#      • Use ctx.markSignedIn(true|false|null) to wire your probe result
#        through to session.snapshot.verified_signed_in.

# 3. Add the op's per-tool Zod schema in src/mcp.ts → scriptInputSchema().
#    Otherwise it falls back to z.unknown() (loose; works but no validation).

# 4. Restart the runner. New script gets discovered + exposed on both
#    transports. Cloud sees it via tools/list_changed (when implemented;
#    today via cache TTL refresh).
```

Hot reload **within** the runner: editing an existing script's body (no
schema change) takes effect on the next op call (mtime-cached). Adding a
new script requires a restart.

---

## 10. Operational notes

- **Headed Chrome required for unattended ops today**. Akamai serves
  "Access Denied" on bigbasket `/ps/` in headless mode. Headed works fine.
  Tracked as `v0-followup-anti-bot-headless`. Until then, the runner can't
  run on a headless server / behind launchd cleanly.
- **One UDD = one Chrome process**. Don't run two `npm run server` against
  the same UDD — the runner.lock file enforces this (fail-fast at startup).
  Stop the runner before running `npm run bridge` or `npm run signin`.
- **Bridged cookies survive headed Chrome boot + ops fine.** Earlier
  rumours of a "headless wipe" were abrupt-kill SQLite corruption —
  graceful shutdown via SIGINT (`Ctrl+C`) is the right way to stop.
  `kill -9` corrupts the cookie SQLite.
- **Cookie refresh.** Site-side sessions expire (BB's `BBAUTHTOKEN` is
  ~6 months). When ops start failing as signed-out, re-run `npm run bridge -- <email>`
  (Chrome must be closed first).
- **runs/** holds per-call screenshots + HTML dumps. Kept indefinitely
  today; clean periodically with `rm -rf runs/*`. (Retention TTL per spec
  §9.5 not yet implemented.)
- **Logs**: stdout/stderr from `npm run server` is `pino` JSON when piped,
  pretty when on a TTY. Includes per-op `runId`, `session_id`,
  `durationMs`, `signedIn`.
- **Concurrency**: default global cap = 1 (serial). Per-script `meta.concurrency: 'parallel'` opts in. Per-session is always serial regardless (spec §5.3.1).

---

## 11. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `401 unauthorized` | Bad/missing Bearer header | `Authorization: Bearer $(grep ^RUNNER_TOKEN .env | cut -d= -f2-)` |
| `415 Unsupported Media Type` | Missing `Content-Type: application/json` on a POST with body | add the header |
| `Refusing to start: another playwright-runner...` | A previous runner pid still in `runner.lock` | check `lsof -i :8787`; `kill <pid>`; if pid is dead, the lock will be detected as stale on next start |
| `Refusing to start: RUNNER_TOKEN ...` | Token < 32 chars | `openssl rand -base64 48` and update `.env` |
| `Chrome binary not found` | Chrome installed elsewhere | `export CHROME_BIN=/path/to/Chrome` |
| Session opens but ops show signed-out | Cookies stale OR bridged UDD wrong | `npm run bridge -- <email>` (close Chrome first); check `RUNNER_PROFILE` matches the bridged Profile N |
| `Access Denied` page title from bigbasket | Akamai bot-protection in headless | run headed (unset `RUNNER_HEADLESS`); or wait for §10's anti-bot fix |
| `UnknownOperatorError` | The operator id passed to `session.open` isn't in `src/operators.ts` | add an entry, OR pass an operator_id whose env vars are set (`RUNNER_OPERATOR_ID`) |
| `__name is not defined` inside `page.evaluate(...)` | tsx + esbuild's __name helper isn't in the browser context | rewrite the in-page body as a STRING with arg-interpolated IIFE, see `scripts/bigbasket/search.ts` |

---

## 12. Roadmap (what's NOT done)

Tracked in `~/.copilot/session-state/.../plan.md` + the SQL `todos` table.
Highest-leverage gaps:

| Item | Why it matters | Effort |
|---|---|---|
| Anti-bot recovery (B2) | Required before unattended/headless ops | medium |
| 11 more BigBasket grocery ops | Complete the §5.4 catalogue | ~3-4 weeks |
| MCP elicitation for OTP/payment (§22.7) | Required for `place_order` | small (after place_order exists) |
| Cart-namespace bookkeeping (B5) | Spec hard requirement before multi-tenant | ~2 weeks for BB alone |
| `tools/list_changed` notifications on script add/remove | Cloud cache invalidation | small |
| `notifications/progress` for long-running ops | UX | small |
| `runs/` retention TTL + `DELETE /v1/sessions/:id/artifacts` | Spec §9.5 | small |
| Cloud-published `tools/list` daily snapshot diff | Spec §16.6 quarterly recertification | small |
| Quote freshness (`checkout_summary` / `place_order` with quote_id) | Spec §5.4.11 | small once flows exist |

Polish items:
- `bigbasket.search` doesn't extract priceInr for some result cards (price-element class differs).
- `bigbasket.get_cart` per-line price reads the cart-wide subtotal panel because the BasketDescription card walk is too wide.
- Headed Chrome window steals focus on launch — known macOS Playwright behaviour, no workaround besides headless (which Akamai blocks).

---

## 13. Files (where to look)

```
playwrightRunner/
├── BROWSER-SERVICE-CONTRACT.md      # vendor contract (v4)
├── CONTRACT-REVIEW.md               # round-2 review for v4 (tracks open items)
├── chrome_signed_in_automation.md   # original engineering reference
├── HANDOFF.md                       # this file
├── README.md                        # local-dev quickstart (older — predates MCP/sessions)
├── src/
│   ├── chromeManager.ts             # one Chrome process per (operator,site)
│   ├── contextPool.ts               # registry of ChromeManagers
│   ├── operators.ts                 # operator_id -> bridged UDD + profile + label
│   ├── session.ts                   # SessionRegistry + Session
│   ├── scriptLoader.ts              # recursive site-namespaced loader
│   ├── runner.ts                    # one-shot: borrow page, run, screenshot on error
│   ├── concurrency.ts               # Semaphore + KeyedMutex
│   ├── idempotency.ts               # (workspace, key) → cached response, 24h
│   ├── bridge.ts                    # cookie bridge from real Chrome
│   ├── mcp.ts                       # MCP server skin (Streamable HTTP)
│   ├── server.ts                    # Fastify HTTP entrypoint (mounts both REST + MCP)
│   ├── logger.ts                    # pino + pino-pretty
│   └── cli/
│       ├── signin.ts                # one-time interactive sign-in
│       ├── bridge.ts                # npm run bridge -- <email>
│       ├── smoketest.ts             # npm run smoketest
│       └── runScript.ts             # npm run run-script -- <name>
├── scripts/
│   ├── pageInfo.ts                  # flat (legacy / generic util)
│   └── bigbasket/                   # site-namespaced ops
│       ├── search.ts
│       ├── whoami.ts
│       ├── get_cart.ts
│       ├── add_to_cart.ts
│       └── dom_dump.ts              # diagnostic; retains the live cart DOM probe
└── runs/                            # per-call screenshots + html dumps
```

---

## 14. Smoke test (5 calls, end-to-end)

```bash
TOK=$(grep ^RUNNER_TOKEN .env | cut -d= -f2-)
A="Authorization: Bearer $TOK"; J="Content-Type: application/json"

# Open
SES_ID=$(curl -sS -X POST http://127.0.0.1:8787/v1/sessions -H "$A" -H "$J" \
  -d '{"site":"bigbasket","operator_id":"op_rsinghtomar54"}' | jq -r .session_id)
echo "session: $SES_ID"

# Verify signed-in
curl -sS -X POST "http://127.0.0.1:8787/v1/sessions/$SES_ID/op/bigbasket.whoami" \
  -H "$A" -H "$J" -d '{}' | jq '.output | {signedIn, addressChip, cookies: (.authCookies | map(select(.present)) | length)}'

# Get cart
curl -sS -X POST "http://127.0.0.1:8787/v1/sessions/$SES_ID/op/bigbasket.get_cart" \
  -H "$A" -H "$J" -d '{}' | jq '.output | {item_count, subtotal_paise, lines: .lines | length}'

# Search
curl -sS -X POST "http://127.0.0.1:8787/v1/sessions/$SES_ID/op/bigbasket.search" \
  -H "$A" -H "$J" -d '{"input":{"query":"basmati rice","topN":3}}' | jq '.output | {count, products: .products | map({name, brand})}'

# Snapshot
curl -sS -H "$A" "http://127.0.0.1:8787/v1/sessions/$SES_ID" | jq '{ops_count, verified_signed_in: .logged_in_as.verified_signed_in, status}'

# Close
curl -sS -X DELETE -H "$A" "http://127.0.0.1:8787/v1/sessions/$SES_ID" | jq .
```

Expected: every call ok, `verified_signed_in: true` after `whoami`,
ops_count ≥ 4, clean close. If `whoami` shows signedIn=false, re-bridge cookies.

---

## 15. Contact / ownership

- Repo: `~/playwrightRunner` (on your laptop today).
- Contract: `BROWSER-SERVICE-CONTRACT.md` (Rohit Singh / ShofferAI).
- Reference impl owner: same (this is your laptop).
- For changes to the cloud-side adapter (`apps/web/lib/browser-ops/`):
  ShofferAI eng.

When something breaks:
1. Check `runs/<runId>/screenshot.png` + `page.html` for the failed call.
2. Check the runner's stdout (pino logs include `runId`, `session_id`, `signedIn`).
3. Re-bridge cookies if signed-in stops working: `npm run bridge -- <email>` (close Chrome first).
4. Check `lsof -i :8787` for stuck processes if the port won't bind.
5. Last resort: `kill -SIGINT <pid>` to gracefully stop. NEVER `kill -9` — it corrupts the cookie SQLite and forces a re-bridge.
