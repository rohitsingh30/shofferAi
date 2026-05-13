# ShofferAI ↔ Browser Operations Service — Contract & Requirements

> **Status**: DRAFT v5 — vendor-signable, post-round-2 review
> **Owner**: ShofferAI Cloud (orchestrator side)
> **Counterparty**: External Browser Operations Service ("the service") — initial reference implementation: `playwrightRunner/`
> **Last Updated**: 2026-05-13
> **Supersedes**: `apps/playwright/*`, `apps/web/lib/relay-*.ts`, `packages/agent-core/src/scripts/compiled/*`
> **Preferred transport**: **Model Context Protocol (MCP)** over HTTP+SSE. HTTPS REST exposed as a fallback for non-MCP consumers, **with full semantic parity (§2.6)**. See §22.
> **Changes from v4** (round-2 review polish): REST fallback parity moved from open-Q to spec body MUST (F1, §2.6). `cart_namespace` added to canonical `_meta` example (F2, §22.4). New error code `operator_account_flagged` (F3, §10.2). Cost numbers reframed as illustrative ceilings (F4, §14.1). `pause.kind = "operator_review"` for behavioural/PoW escalation (F5, §6.2 + §6.2.1). Cart-namespace bookkeeping flagged as Phase 0 capability gate (F6, §17). Optional `operator_id` selector on `session.open` (F7, §5.2).

---

## 1. Philosophy

The service is **not an agent**. It does not reason about user intent, compose recipes, or decide what to buy. It exposes a small set of **typed, atomic browser operations** per supported site (search, add to cart, get cart, place order, …). Each operation is a single short-lived HTTP call that returns a structured result.

The cloud orchestrator (**ShofferAI / GPT‑5.3**) decomposes user intent into a sequence of these operations, holds the state of the conversation, and decides what to call next based on the previous result.

> Bad: `POST /v1/tasks { "intent": "order milk and bread from BigBasket" }`
> Good: `search → user picks → add_to_cart → search → user picks → add_to_cart → get_cart → set_address → place_order → confirm_payment`

### 1.1 Mental model — the service is "Stripe for browsers"

| Stripe                                         | This service                                       |
|------------------------------------------------|----------------------------------------------------|
| `POST /v1/payment_intents`                     | `POST /v1/sessions/{id}/op/add_to_cart`            |
| Stateless API, idempotency keys, JSON in/out   | Same                                               |
| You build the checkout flow on top             | GPT-5.3 builds the shopping flow on top            |
| Stripe doesn't know your business             | Service doesn't know "shopping" — only ops          |

### 1.2 Why granular and not "execute skill"

- **Composable** — same primitives compose into "buy 1 thing", "buy 5 things", "compare prices on 3 sites", "reorder my last cart".
- **Debuggable** — every failure points at a specific op call with full request/response logged.
- **Cheap** — each op is ~1–10 s of browser time, billable individually. No silent 6-minute black box.
- **Cloud retains intelligence** — GPT-5.3 sees every op result and can recover (retry, ask user, swap product). The service never has to "decide".
- **Vendor-portable** — any vendor implementing the op catalogue is a drop-in replacement.

### 1.3 Division of responsibilities

| Concern                                                        | Cloud (GPT-5.3) | Service |
|----------------------------------------------------------------|:---:|:---:|
| Chat, intent, conversation memory                              | ✅ | ❌ |
| Decide which ops to run, in what order                         | ✅ | ❌ |
| User input collection (OTP, choices, payment)                  | ✅ | ❌ |
| Holding session/cart state across ops                          | partial — knows session_id | ✅ — owns the live browser |
| Browser launch, sign-in, cookies, profile                      | ❌ | ✅ |
| Selectors, retries, anti-bot, captcha                          | ❌ | ✅ |
| Site-specific scraping (turn DOM into structured JSON)         | ❌ | ✅ |
| Storing user PII (addresses, cards)                            | ✅ | ❌ |
| Razorpay payment auth                                          | ✅ | ❌ |
| Persistence of orders                                          | ✅ | ❌ |

### 1.4 What stays in this repo

- Cloud orchestrator (Next.js + GPT‑5.3): chat, skill matching, op planning, conversation memory.
- `MCPHostLike` abstraction + `SessionMCPHost` — **kept and retargeted**. They already do exactly what we need (per-task `sessionId` injection on every tool call). We just point them at the vendor's MCP server instead of the laptop's Playwright MCP.
- `playwright-mcp` retained **only** as a developer QA tool in `apps/playwright-dev-mcp/`, behind env flag `SHOFFER_DEV_MCP=1`. Never imported by production code (enforced by `eslint-plugin-boundaries`).

---

## 2. Resource Model

```
Workspace
  └── ApiKey
  └── Site         (catalog of supported sites)
        └── Op     (catalog of operations per site, versioned, JSON-Schema'd)
  └── Session      (a live browser tab on one site, owned by the cloud for the duration of a chat task)
        ├── State  (current cart, current address, current page kind)
        ├── Pauses (open prompts awaiting cloud input)
        └── Events (append-only audit log)
```

**Key: a session is a long-lived browser tab.** The cloud opens one per `(workspace, operator, site, chat_task)`, runs many ops against it, then closes it. Sessions persist cookies/cart across ops within their lifetime. Sessions are NOT shared between end users.

### 2.1 Session reuse across chat tasks (addresses B1)

A cold `session.open` includes browser launch + Cloudflare warmup + sign-in detection — measured at **5–12 s on real BigBasket today**. To avoid eating that on every chat turn, the vendor MUST support **warm session reuse**:

- Sessions MAY be reused across chat tasks within the same `(workspace, operator_id, site)` tuple. A cloud `session.open` with a previously-seen tuple SHOULD return an existing warm session in `< 200 ms` if one is available.
- Cold-open p95 < 5 s; warm-open p95 < 200 ms (§13).
- Reuse is opt-out via `session.open` arg `force_fresh: true` (used for repro / debugging).

### 2.2 Cart isolation across concurrent chat tasks (addresses B5)

The underlying operator's site account (e.g. the operator's BigBasket account) is shared across all chat tasks. Two cloud sessions both adding to the same operator's cart will interleave items unless the vendor isolates explicitly.

The vendor MUST provide one of:

1. **Per-session cart namespace** (preferred): every cart-mutation op (`add_to_cart`, `update_cart_qty`, `remove_from_cart`, `clear_cart`, `place_order`) tags lines with the calling `session_id`. `get_cart` returns ONLY lines for the calling session. The site-side cart is a union, but the API view is per-session.
2. **Cart sandbox per session**: vendor uses a fresh ephemeral cart context per session (e.g. site sub-account, isolated browser context with the cookies but a separate cart cookie/storage namespace). Some sites support this; most don't.
3. **Documented contention** (last resort, NOT acceptable for v1): contract spells out that sibling sessions see each other's items and cloud must filter. Reject this — the bug surface is too large.

If neither (1) nor (2) is achievable on a given site, that site is unsupported until it is.

### 2.3 Read-your-write within a session (addresses B6)

Within a single session, ops MUST observe a strict happens-before order at the API surface:

- `add_to_cart` → `get_cart`: the get reflects the add.
- `set_delivery_address` → `list_delivery_slots`: the list reflects the new address.
- `select_delivery_slot` → `checkout_summary`: the summary reflects the new slot.

The vendor implementation MUST wait for the mutation to be observably committed (DOM or API state) before returning the mutation op. Cloud relies on this guarantee to avoid `after_call_id` cursors and polling.

---

## 2.5 Transport Choice — MCP first

The contract defines **operations** (semantics, schemas, lifecycle). It does **not** mandate one wire format. The vendor MUST support **at least one** of the following two transports; ShofferAI strongly prefers MCP and will use it whenever offered.

| | **MCP (preferred)** | **HTTPS REST (fallback)** |
|---|---|---|
| Transport spec | [Model Context Protocol](https://modelcontextprotocol.io) over HTTP+SSE (`Streamable HTTP transport`) | Plain JSON over HTTPS |
| Tool surface | Each op is one MCP `tool` (`bigbasket.search`, `bigbasket.add_to_cart`, …) | One REST endpoint per op (`POST /v1/sessions/{id}/op/<name>`) |
| Catalogue | `tools/list` (built into MCP) | `GET /v1/sites/{site}/ops` |
| Schemas | `inputSchema` + `outputSchema` on each MCP tool | JSON Schema files served from catalogue |
| Sessions | `session_id` arg on every tool call (same convention as today's `SessionMCPHost`) | URL path `/sessions/{id}/op/...` |
| Pauses (OTP, payment) | MCP **elicitation** request from server → cloud responds inline | Op returns `status: "needs_input"` + `pause`; cloud `POST /resume` |
| Idempotency | `_meta.idempotency_key` on every `tools/call` | `X-Idempotency-Key` header |
| Errors | MCP tool result with `isError: true` + structured `content` | RFC 7807 `application/problem+json` |
| Streaming progress | MCP `notifications/progress` | (none — ops are sync) |
| Auth | `Authorization: Bearer <api_key>` on the MCP HTTP transport handshake | Same |

**Why MCP is preferred:**

1. **Cloud already speaks MCP everywhere.** `MCPHostLike`, `SessionMCPHost`, and the agent's tool-dispatch loop in `agent.ts` are all MCP-shaped today. Swapping the underlying server (laptop Playwright MCP → vendor MCP) is a small change.
2. **Tool discovery is built-in.** `tools/list` returns the per-site op catalogue with full JSON Schemas. We don't need a separate `GET /sites/{site}/ops`. Cloud caches the response and uses it to build the LLM tool list.
3. **Schemas drive LLM tool generation for free.** GPT-5.3's tool array is generated directly from each MCP tool's `inputSchema` — no manual TS type extraction step.
4. **Pause/resume is native.** MCP elicitation lets the server pause mid-tool-call and ask the client (cloud) for input, then continue. Maps perfectly onto our OTP/payment flow without inventing a custom `needs_input → POST /resume` dance.
5. **Vendor portability.** The MCP spec is open; multiple vendors will be MCP-compliant. If a vendor goes away, swap the URL.
6. **Future-proof.** MCP is becoming the standard for AI agent tool access. Building on it costs nothing extra and aligns with where the ecosystem is going.

**REST fallback exists because:**

- Some vendors won't have a production-grade MCP HTTP transport yet.
- HTTP REST is easier for non-AI consumers (e.g., a future ops dashboard, batch reconciliation jobs).
- It's a useful boundary check on the contract: if both transports cleanly express the same semantics, the design is healthy.

The vendor MAY ship MCP as a thin wrapper over their REST implementation, or vice versa. Cloud doesn't care which is the source of truth as long as the semantics in this document are honored on both.

The rest of this document defines operations transport-agnostically. §22 specifies the MCP-specific wire format (tool names, elicitation schema, idempotency `_meta`, error result shape). REST examples shown inline in §5 stand as the canonical wire format for the REST fallback.

---

## 2.6 REST Fallback Semantic Parity (MUST) — addresses F1

The REST fallback is **not a stripped-down second-class transport**. If the vendor offers REST, it MUST express **every** semantic guaranteed by the MCP binding:

- **Idempotency**: `X-Idempotency-Key` header behaves identically to MCP `_meta.shoffer.idempotency_key` (§8). Same 24-hour TTL. Same `(workspace_id, key) → response` cache. Same `X-Idempotent-Replay: true` (mirror of `_meta.shoffer.idempotent_replay`).
- **Idempotency lifecycle**: an idempotency key for `place_order` spans the entire pause/resume lifecycle, not just the initial `POST` call. Replay after resume returns the same `order_id`.
- **Pause/resume**: every `pause.kind` in §6.2 is reachable via REST `POST /resume`. Single-use `pause_id`. Same TTL semantics. Same `pause.kind = "operator_review"` escalation path (§6.2 + §6.2.1).
- **Errors**: every code in §10.2 is returnable on REST. Same RFC 7807 shape. Same `recoverable` / `retry_hint` / `user_message` fields.
- **Happens-before**: §2.3 read-your-write guarantees apply identically (sequential REST calls within a session).
- **Per-session serialisation**: §5.3.1 `409 session_busy` MUST be returned for concurrent REST ops against the same session.
- **Session reuse**: §2.1 warm reuse semantics (cold p95 < 5 s, warm p95 < 200 ms) apply to REST `POST /v1/sessions` identically.
- **Cart isolation**: §2.2 per-session cart namespace applies to REST `get_cart` reads identically.
- **Per-op timeouts**: §11.1 caps apply to REST. `504 op_timeout` returned identically.
- **Telemetry shape**: response `telemetry: {...}` mirrors MCP `_meta.shoffer.*`.

**Enforcement**: the contract test suite (§16.6) MUST run identically against both transports. A vendor failing parity tests on REST is in violation regardless of MCP support. Cloud's `apps/web/lib/browser-ops/contract.test.ts` runs the same fixture set through `mcp-client.ts` and `rest-fallback.ts` and asserts byte-equivalent semantic outcomes (modulo wire format).

The intent: "REST as fallback" is a property of the transport choice, **never** a license to cut corners.

---

## 3. Authentication

```
Authorization: Bearer <api_key>
X-Workspace-Id: <workspace_uuid>
X-Idempotency-Key: <ulid>           # required on every POST that mutates
X-API-Version: 2026-05-13
```

| Key prefix    | Purpose                              |
|---------------|--------------------------------------|
| `sk_live_*`   | Production                           |
| `sk_test_*`   | Sandbox (no real orders, no real money) |

Credential injection (passwords, card CVV) — see §9. Plaintext secrets never travel in op bodies.

---

## 4. Versioning

- URL: `https://api.<vendor>.com/v1/...`
- Per-op semantic version: `op_version` returned in every response. Cloud pins.
- Catalogue endpoint reports current versions of every op for every site.
- Breaking changes ship as a new op version (`add_to_cart@2`); old version supported for ≥ 6 months.

---

## 5. Endpoints

> **Transport note**: examples below are the REST wire format. For MCP, replace `POST /v1/sessions/{id}/op/{op_name}` with an MCP `tools/call` to tool name `<site>.<op_name>` (e.g. `bigbasket.search`); arguments are the same JSON; results are returned in MCP's structured tool result content. See §22 for the full MCP binding.

All requests/responses are `application/json; charset=utf-8`. All money in **paise** (integer, INR). All timestamps ISO-8601 UTC ms.

### 5.1 Catalogue

> **MCP**: this entire section is replaced by `tools/list` and `resources/list`. The REST endpoints below exist for non-MCP consumers.

#### `GET /v1/sites`

```json
{
  "sites": [
    { "id": "bigbasket",        "domain": "bigbasket.com",        "categories": ["grocery"],   "status": "stable" },
    { "id": "blinkit",          "domain": "blinkit.com",          "categories": ["grocery"],   "status": "stable" },
    { "id": "swiggy_instamart", "domain": "swiggy.com/instamart", "categories": ["grocery"],   "status": "beta" },
    { "id": "zomato",           "domain": "zomato.com",           "categories": ["food"],      "status": "stable" }
  ]
}
```

#### `GET /v1/sites/{site}/ops`

Returns the full op catalogue for a site, with JSON Schemas for input and output. Cloud caches for 5 min.

```json
{
  "site": "bigbasket",
  "session_kinds": ["grocery"],
  "ops": [
    {
      "name": "search",
      "version": 3,
      "summary": "Search for products. Returns top N results, ranked.",
      "idempotent": true,
      "typical_duration_ms": 1500,
      "input_schema":  { "$ref": "#/schemas/search.input"  },
      "output_schema": { "$ref": "#/schemas/search.output" }
    },
    { "name": "get_product",       "version": 1, "idempotent": true,  "typical_duration_ms": 1200, "...": "..." },
    { "name": "add_to_cart",       "version": 2, "idempotent": true,  "typical_duration_ms": 1800, "...": "..." },
    { "name": "update_cart_qty",   "version": 1, "idempotent": true,  "typical_duration_ms": 900,  "...": "..." },
    { "name": "remove_from_cart",  "version": 1, "idempotent": true,  "typical_duration_ms": 900,  "...": "..." },
    { "name": "clear_cart",        "version": 1, "idempotent": true,  "typical_duration_ms": 1500, "...": "..." },
    { "name": "get_cart",          "version": 1, "idempotent": true,  "typical_duration_ms": 600,  "...": "..." },
    { "name": "set_delivery_address","version":1,"idempotent": true,  "typical_duration_ms": 2000, "...": "..." },
    { "name": "list_delivery_slots","version": 1,"idempotent": true,  "typical_duration_ms": 1500, "...": "..." },
    { "name": "select_delivery_slot","version":1,"idempotent": true,  "typical_duration_ms": 800,  "...": "..." },
    { "name": "checkout_summary",  "version": 1, "idempotent": true,  "typical_duration_ms": 1500, "...": "..." },
    { "name": "place_order",       "version": 1, "idempotent": false, "typical_duration_ms": 6000, "may_pause": ["otp","payment"] },
    { "name": "submit_otp",        "version": 1, "idempotent": false, "typical_duration_ms": 2500 },
    { "name": "confirm_payment",   "version": 1, "idempotent": false, "typical_duration_ms": 4000 },
    { "name": "get_order",         "version": 1, "idempotent": true,  "typical_duration_ms": 1200, "...": "..." }
  ],
  "schemas": { "...": "...full JSON Schemas inline..." }
}
```

### 5.2 Sessions

#### `POST /v1/sessions` — open a browser session

```json
{
  "session_id": "ses_01J7Z5K3F8H2RSX9M1Q3W4V5N6",
  "site": "bigbasket",
  "user_ref": "sha256:0d4a...",
  "session_kind": "grocery",
  "operator_id": "op_01J7...",
  "region": "in-mumbai",
  "device": "desktop",
  "force_fresh": false,
  "options": {
    "record_video": true,
    "return_screenshots_on_error": true,
    "headless": false,
    "user_agent_tag": "ShofferAI/1.0"
  },
  "limits": {
    "max_lifetime_s": 1800,
    "idle_timeout_s": 300,
    "max_ops": 50
  }
}
```

`session_id` is cloud-generated (ULID). Idempotent: re-POST returns same session.

`operator_id` (optional, addresses F7) — pin which concierge account to use. Useful for multi-operator deployments (regional concierges, ops shifts). When omitted, the vendor picks based on availability and per-(site, operator) load.

`force_fresh: true` (optional) — bypass warm session reuse (§2.1) and always launch a fresh browser context. For repro / debugging.

**Response 201**
```json
{
  "session_id": "ses_...",
  "status": "ready",
  "warm": true,
  "site": "bigbasket",
  "logged_in_as": {
    "operator_id": "op_01J7...",
    "operator_label": "Operator (concierge)",
    "masked_email": "ro***@shoffer.ai"
  },
  "cart_namespace": "ns_ses_01J7Z5K3F8H2RSX9M1Q3W4V5N6",
  "current_address": null,
  "opened_at": "2026-05-13T07:00:00.000Z",
  "expires_at": "2026-05-13T07:30:00.000Z"
}
```

If sign-in fails or the site is unreachable, returns `503 site_unavailable` and emits no session.

#### `GET /v1/sessions/{id}` — snapshot

Returns current state including cart, address, page kind, last screenshot URL, open pauses.

#### `DELETE /v1/sessions/{id}` — close

Closes browser tab, frees slot. Idempotent.

#### `POST /v1/sessions/{id}/resume` — answer a pause from a previous op

Used when an op returned `status: "needs_input"`. See §6.4.

### 5.3 Operations — common envelope

Every op runs at:

```
POST /v1/sessions/{session_id}/op/{op_name}
Content-Type: application/json
X-Idempotency-Key: <ulid>
X-Op-Version: <int>            # optional; defaults to latest

{ ...op-specific input... }
```

**Response on success — 200**
```json
{
  "session_id": "ses_...",
  "op": "add_to_cart",
  "op_version": 2,
  "call_id": "call_01J7...",
  "status": "ok",
  "duration_ms": 1842,
  "cost_inr_paise": 4,
  "warnings": [],
  "output": { "...": "...op-specific..." }
}
```

**Response on pause — 200 with `status: "needs_input"`**
```json
{
  "session_id": "ses_...",
  "op": "place_order",
  "call_id": "call_...",
  "status": "needs_input",
  "pause": {
    "pause_id": "pa_01J8...",
    "kind": "otp",
    "prompt": { "question":"Enter OTP sent to +91-***-**-9137", "length":6, "channel":"sms", "resend_in_s":30 },
    "expires_at": "2026-05-13T07:05:00.000Z"
  }
}
```

Cloud collects the input from the user, then submits via `/sessions/{id}/resume` (§6.4). Once resumed, the **same op** continues and ultimately returns `status: "ok"` (or another pause, or an error).

**Response on failure — 4xx/5xx — RFC 7807 problem+json** (see §10).

### 5.3.1 Serial execution per session (addresses B3)

The vendor MUST serialise tool calls per session. Concurrent op invocations against the same `session_id` MAY return `409 session_busy` (with `Retry-After`) — they MUST NOT execute interleaved. The browser is single-tab-stateful; allowing parallel calls per session opens a giant race surface (cart mutations, navigation collisions, popup races, click-vs-render timing).

Cloud's loop is naturally serial. This guarantee is for safety, not throughput — concurrency comes from running multiple sessions in parallel, not multiple ops in one session.

### 5.4 Op catalogue v1 — common to grocery sites

Each op below is the canonical contract for grocery sites (`bigbasket`, `blinkit`, `swiggy_instamart`, `zepto`, `jiomart`). Same names, same schemas, same semantics across vendors. Site-specific extensions are namespaced (e.g. `bigbasket.express_checkout`).

#### 5.4.1 `search`

**Input**
```json
{
  "query": "milk",
  "limit": 5,
  "compact": false,
  "filters": {
    "veg_only": true,
    "max_price_paise": 20000,
    "brand": null
  },
  "sort": "relevance"
}
```

`compact: true` (default `true` when `limit > 10`) drops `description`, `nutrition_info`, extra `images[1..]`, and any field > 200 chars. Required to keep response under the 256 KiB cap (§11) at high limits. (Addresses S3.)

**Output**
```json
{
  "results": [
    {
      "product_id": "bb_PD123456",
      "name": "Amul Taaza Toned Milk",
      "brand": "Amul",
      "variant": "1 L",
      "image_url": "https://www.bigbasket.com/media/uploads/p/l/40000091_19-amul-taaza-toned-milk.jpg",
      "price_paise": 7500,
      "mrp_paise": 8000,
      "discount_percent": 6,
      "in_stock": true,
      "rating": 4.4,
      "rating_count": 18432,
      "tags": ["bestseller", "veg"],
      "url": "https://www.bigbasket.com/pd/40000091/amul-taaza-toned-milk-1-l/"
    }
  ],
  "total_results_estimate": 312,
  "search_id": "srch_01J8..."
}
```

**`product_id` stability — strong (addresses B4).** `product_id` is opaque, vendor-issued, and **stable across sessions and across time for the same site**. Cloud MAY persist `product_id` on `Order` rows, in user favourites, and in reorder flows. The vendor MUST publish a deprecation policy if a `product_id` ever changes (e.g. SKU consolidation): old id resolves to the new one for ≥ 90 days, with `warnings: [{code: "product_id_remapped", new_id: "..."}]` on every op that touched it.

#### 5.4.2 `get_product`

**Input**
```json
{ "product_id": "bb_PD123456" }
```

**Output** — full product page details
```json
{
  "product_id": "bb_PD123456",
  "name": "Amul Taaza Toned Milk",
  "variants": [
    { "variant_id": "bb_VR1L",   "label": "1 L",   "price_paise": 7500, "mrp_paise": 8000, "in_stock": true },
    { "variant_id": "bb_VR500",  "label": "500 ml","price_paise": 4000, "mrp_paise": 4200, "in_stock": true }
  ],
  "description": "Standardised toned milk...",
  "nutrition_info": { "energy_kcal_per_100g": 58 },
  "images": ["https://...", "https://..."],
  "delivery_estimate_minutes": 90
}
```

#### 5.4.3 `add_to_cart`

**Input**
```json
{
  "product_id": "bb_PD123456",
  "variant_id": "bb_VR1L",
  "quantity": 1
}
```

**Output**
```json
{
  "added": { "product_id": "bb_PD123456", "variant_id": "bb_VR1L", "quantity": 1, "line_total_paise": 7500 },
  "cart_summary": {
    "item_count": 1,
    "subtotal_paise": 7500
  }
}
```

Errors: `out_of_stock`, `invalid_variant`, `min_order_not_met` (see §10.2).

#### 5.4.4 `update_cart_qty`

**Input** `{ "line_id": "ln_...", "quantity": 3 }` → updated cart_summary.

#### 5.4.5 `remove_from_cart`

**Input** `{ "line_id": "ln_..." }` → updated cart_summary.

#### 5.4.6 `clear_cart`

**Input** `{}` → `{ "cleared": true, "removed_count": 7 }`.

#### 5.4.7 `get_cart`

Returns ONLY lines belonging to the calling `session_id` (per the per-session cart namespace, §2.2). Reflects all prior mutations from the same session per the read-your-write guarantee (§2.3).

**Output**
```json
{
  "lines": [
    {
      "line_id": "ln_01",
      "product_id": "bb_PD123456",
      "variant_id": "bb_VR1L",
      "name": "Amul Taaza Toned Milk 1 L",
      "image_url": "https://...",
      "qty": 1,
      "unit_price_paise": 7500,
      "line_total_paise": 7500
    }
  ],
  "subtotal_paise": 7500,
  "delivery_paise": 2000,
  "tax_paise": 0,
  "discount_paise": 0,
  "total_paise": 9500,
  "min_order_paise": 19900,
  "min_order_satisfied": false
}
```

#### 5.4.8 `set_delivery_address`

**Input** — either reference a saved address or supply new:
```json
{ "saved_label": "Home" }
```
or
```json
{
  "address": {
    "line1": "C-502 Honer Aqua",
    "line2": "Road no. 12",
    "city": "Pune",
    "state": "Maharashtra",
    "pincode": "411028",
    "phone": "+919812345678",
    "name": "Rohit",
    "type": "home"
  }
}
```

**Output**
```json
{
  "address_id": "addr_01J8...",
  "delivery_available": true,
  "estimated_delivery_minutes": 90,
  "warnings": []
}
```

If delivery is not available → `delivery_available: false` with `reason`. Cloud asks user for a different address.

#### 5.4.9 `list_delivery_slots`

**Output**
```json
{
  "slots": [
    { "slot_id": "slot_07_09", "label": "Today, 7–9 PM",  "price_paise": 2000, "available": true },
    { "slot_id": "slot_09_11", "label": "Today, 9–11 PM", "price_paise": 2000, "available": true },
    { "slot_id": "slot_06_08", "label": "Tomorrow, 6–8 AM","price_paise": 0,    "available": true }
  ]
}
```

#### 5.4.10 `select_delivery_slot`

`{ "slot_id": "slot_07_09" }` → updated cart_summary with new delivery_paise.

#### 5.4.11 `checkout_summary`

Final pre-payment computation. Output is a frozen quote with `quote_id` valid for 5 min.

```json
{
  "quote_id": "q_01J8...",
  "expires_at": "2026-05-13T07:08:00.000Z",
  "lines": [
    { "label": "Items (2)",     "amount_paise": 9500 },
    { "label": "Delivery slot", "amount_paise": 2000 },
    { "label": "Discount",      "amount_paise": -500, "code": "WELCOME50" }
  ],
  "total_paise": 11000,
  "currency": "INR",
  "payment_methods_accepted": ["cod", "online"]
}
```

#### 5.4.12 `place_order` ⚠️ may pause

**Input**
```json
{
  "quote_id": "q_01J8...",
  "payment_method": "online",
  "notes": null
}
```

**Possible outcomes**

| `status`        | Meaning                                                                                  |
|-----------------|------------------------------------------------------------------------------------------|
| `ok`            | Order placed (rare for online — usually pauses for payment first)                        |
| `needs_input`   | Pause: `kind: "otp"` (rare), `kind: "payment"`, `kind: "address_confirm"`, `kind: "captcha"` |
| `failed`        | `payment_declined`, `out_of_stock_changed`, `slot_expired`, `quote_expired`, `site_error` |

**On `needs_input` with `kind: "payment"`**
```json
{
  "status": "needs_input",
  "pause": {
    "pause_id": "pa_pay_...",
    "kind": "payment",
    "prompt": {
      "amount_paise": 11000,
      "currency": "INR",
      "merchant_label": "BigBasket India",
      "site_payment_intent": { "vendor": "razorpay", "order_id": "site_rzp_xyz" }
    },
    "expires_at": "..."
  }
}
```

Cloud opens its Razorpay panel using ShofferAI's own key (not the site's), collects payment from the user, and resumes with payment proof (see §9.2 — note the model: ShofferAI charges the user, then settles with the operator's stored card on the site).

#### 5.4.13 `submit_otp`

If a `needs_input.kind = "otp"` was returned by any op, cloud calls:

```
POST /v1/sessions/{id}/resume
{ "pause_id": "pa_otp_...", "value": { "otp": "123456" } }
```

Returns the original op's continuation (typically an `ok` or another pause).

#### 5.4.14 `confirm_payment`

Same pattern via `/resume`:
```
{ "pause_id": "pa_pay_...", "value": { "status": "paid", "razorpay_payment_id": "pay_...", "signature": "..." } }
```

#### 5.4.15 `get_order`

After `place_order` returned `ok`:
```json
{ "order_id": "ord_..." }
```
→
```json
{
  "order_id_external": "BB-91827364",
  "status": "placed",
  "tracking_url": "https://www.bigbasket.com/order-tracking/91827364/",
  "placed_at": "2026-05-13T07:09:11.000Z",
  "estimated_delivery": "2026-05-13T09:00:00.000Z",
  "items": [
    { "name": "Amul Taaza Toned Milk 1 L", "qty": 1, "price_paise": 7500 }
  ],
  "amounts": { "subtotal_paise": 9500, "delivery_paise": 2000, "discount_paise": -500, "total_paise": 11000 }
}
```

### 5.5 Op catalogue v1 — extensions per category

| Category    | Additional ops                                                              |
|-------------|------------------------------------------------------------------------------|
| **Food delivery** (zomato, swiggy, eatsure)         | `list_restaurants`, `get_menu`, `select_variant_options`, `apply_coupon`, `track_order` |
| **Hotels** (booking.com, makemytrip)                | `search_hotels`, `get_hotel_detail`, `list_rooms`, `select_room`, `fill_guest_details`, `place_booking`, `get_booking` |
| **Flights**                                          | `search_flights`, `get_fare_breakdown`, `select_flight`, `fill_passengers`, `place_booking` |
| **Recharge** (airtel, jio, paytm)                    | `select_operator`, `select_plan`, `recharge` |
| **Bill pay**                                         | `fetch_bill`, `pay_bill` |
| **Tracking** (any e-commerce)                        | `get_order_status`, `list_recent_orders` |

Each named op has a JSON-Schema'd input/output and is documented identically to §5.4. Vendor publishes the per-category schemas in `GET /v1/sites/{site}/ops`.

### 5.6 Generic escape hatch — `inspect` (narrowed)

For development and edge-case recovery only. **Narrowed in v4** (addresses N4) — only `screenshot` is supported. If you find yourself wanting `page_text` / `current_url` / `cart_dom_summary`, the right answer is to add a real op to the catalogue.

```
POST /v1/sessions/{id}/op/inspect
{ "what": "screenshot" }
```

**Quotas (S7)**:
- `sk_live_*` keys: 6/min/session, capped.
- `sk_test_*` keys: 60/min/session — for vendor onboarding and selector debugging.

Not for production loops.

### 5.7 Health

`GET /v1/health` → `{ "status":"ok", "region":"in-mumbai", "queue_depth": 12, "build":"2026.05.13-7e3a" }`

---

## 6. Pause / Resume Protocol

### 6.1 Why pauses exist

Most ops complete synchronously (`status:"ok"`). A few cannot — they need user input (OTP, payment, address picker, captcha). For these, the op call returns `status:"needs_input"` with a `pause` object. The browser tab stays open, waiting.

### 6.2 Pause kinds

| `pause.kind`      | Triggered by                  | Cloud renders to user                                  | `value` shape on resume                              |
|-------------------|-------------------------------|--------------------------------------------------------|------------------------------------------------------|
| `otp`             | `place_order`, `submit_otp`   | OTP input box                                          | `{ "otp": "123456" }` or `{ "action": "resend" }`    |
| `payment`         | `place_order`                 | Razorpay panel                                         | `{ "status": "paid", "razorpay_payment_id":"...", "signature":"..." }` |
| `address_confirm` | `place_order`                 | "Confirm delivery to: …"                               | `{ "confirmed": true }`                               |
| `captcha`         | any                           | (vendor solves; cloud only sees on escalation — see §6.2.1) | `{ "solved": true }` (cloud passes through)           |
| `card_cvv`        | `place_order` (if site asks for CVV) | CVV input                                       | `{ "cvv": "123" }` (via mTLS vault, see §9)          |
| `operator_review` (F5) | `add_to_cart`/`place_order` after repeated behavioural-bot failures | NOT rendered to end-user — surfaced to operator dashboard with screenshot | `{ "operator_action": "unblocked" \| "abandoned", "operator_note": "..." }` |

### 6.2.1 Captcha specifics (addresses S4 + F5)

The vendor MUST commit to auto-solving the following categories:

| Captcha type        | Auto-solve | Latency budget | On failure |
|---------------------|:---:|:---:|---|
| reCAPTCHA v2 (image) | ✅ | < 30 s | escalate as `pause.kind = "captcha"` with screenshot, OR return `503 captcha_unsolvable` |
| reCAPTCHA v3 (score) | ✅ | < 5 s  | same                                                                                     |
| hCaptcha             | ✅ | < 30 s | same                                                                                     |
| Cloudflare Turnstile | ✅ | < 10 s | same                                                                                     |
| Image puzzle         | ✅ | < 45 s | same                                                                                     |
| Audio captcha        | ❌ | —      | always escalates                                                                         |
| Behavioural / proof-of-work (e.g. Akamai sensor data) | ⚠️ best-effort | — | see escalation ladder below (F5)                       |

**Behavioural / PoW escalation ladder (F5)**:

1. **Vendor first attempts**: session warming, mouse-movement / scroll simulation, longer idle pauses, viewport randomisation.
2. **If still blocked**: vendor escalates to **headed-mode** retry on a clean browser context.
3. **If still blocked after N consecutive failures across `(operator, site)` within 1 hour** (default N=3): vendor MUST raise `pause.kind = "operator_review"` with a full-page screenshot and a `reason: "behavioural_bot_block"` payload. This surfaces to the **human operator** (not the chat user) via the operator dashboard — they manually verify the account is healthy, optionally re-bridge cookies, and resume the pause.
4. **If operator_review TTL elapses** (default 30 min, vendor-configurable): the originating op fails with `503 site_blocked_by_bot_protection` and the operator-site pair enters the §11 30-minute auto-circuit-break.

This makes the "Akamai is mad at us" path explicit instead of leaving cloud in a silent retry loop.

Cloud SHOULD treat repeated `captcha_unsolvable` from the same site within an hour as a circuit-breaker signal and surface `"This site is being defensive right now — try again in a few minutes"` to the user.

Each captcha solve attempt MUST be billed as a discrete `captcha_solve` line item in `_meta.shoffer.cost_inr_paise` (per §14). Each `operator_review` escalation MUST be billed as a `bot_protection_retry` line item.

### 6.3 Pause TTL

Default **5 minutes**. Configurable per session via `limits.idle_timeout_s`. If TTL elapses with no resume:
- Op response that triggered the pause is closed with status `failed.user_input_timeout`.
- Session moves to `idle` and may be closed.
- Cloud must `DELETE /v1/sessions/{id}` and start over.

### 6.4 `POST /v1/sessions/{id}/resume`

```json
{
  "pause_id": "pa_pay_01J8...",
  "value": { "status": "paid", "razorpay_payment_id": "pay_...", "signature": "..." }
}
```

**Response** — the *original* op call's continuation. Same envelope as §5.3:
- `status: "ok"` with `output` of the originating op, OR
- `status: "needs_input"` with another `pause` (e.g., OTP after payment), OR
- `status: "failed"` with an error.

`pause_id` is single-use. Re-resume with same `pause_id` → `409 pause_already_resumed`.

---

## 7. Session State Machine

```
             POST /sessions
                   │
                   ▼
              ┌─────────┐
              │  ready  │◄───────────┐
              └────┬────┘            │
                   │ POST /op/X      │
                   ▼                 │ (op returns ok)
              ┌─────────┐            │
              │ running │────────────┘
              └────┬────┘
                   │ op returns needs_input
                   ▼
              ┌─────────┐
   resume────►│ paused  │◄─── (multiple pauses possible serially)
              └────┬────┘
                   │ TTL elapsed
                   ▼
              ┌─────────┐
              │  idle   │
              └────┬────┘
                   │ DELETE /sessions or auto-close
                   ▼
              ┌─────────┐
              │ closed  │
              └─────────┘

Failure can transition any state → failed → closed.
```

Cloud queries `GET /v1/sessions/{id}` to read the current state at any time.

---

## 8. Idempotency

Every `POST` carries `X-Idempotency-Key: <ulid>` (REST) or `_meta.shoffer.idempotency_key` (MCP). The service stores `(workspace_id, idempotency_key) → response` for **24 hours**. Replays return the cached response with `X-Idempotent-Replay: true` (REST) or `_meta.shoffer.idempotent_replay: true` (MCP).

**Cloud-side rule (S1)**: `idempotency_key` MUST be a fresh ULID per intent, **never** a hash of the args. Adding the same product twice is two separate intents → two distinct keys. Using `hash(args)` would silently dedupe a legitimate "add 2 of these" into "add 1".

Idempotency rules per op:

| Op               | Idempotent? | Notes                                                                 |
|------------------|:-----------:|------------------------------------------------------------------------|
| `search`         | ✅ | Pure read.                                                            |
| `get_product`    | ✅ | Pure read.                                                            |
| `get_cart`       | ✅ | Pure read.                                                            |
| `add_to_cart`    | ✅ | If same key: returns cached `added` line, does not double-add. Use a fresh key per intent. |
| `update_cart_qty`| ✅ | Sets to absolute qty.                                                  |
| `remove_from_cart`| ✅ | No-op if line already gone.                                           |
| `clear_cart`     | ✅ | No-op if cart already empty.                                          |
| `set_delivery_address` | ✅ | Sets address; replay safe.                                       |
| `select_delivery_slot` | ✅ | Sets slot; replay safe.                                          |
| `place_order`    | ⚠️ Conditional | Idempotent within key TTL; service MUST NOT double-place. Replay returns the same `order_id` **even if the original returned `needs_input` and was resumed** — the key spans the entire pause/resume lifecycle, not just the initial call. |
| `submit_otp`     | ❌ | OTP is single-use; replay returns `409 otp_consumed`.                 |
| `confirm_payment`| ❌ | Replay returns `409 payment_already_confirmed`.                       |

---

## 9. Sensitive Data

### 9.1 What we send to the service

- ✅ Search queries, product_ids, addresses (already user-disclosed), quantities
- ❌ Never: card PAN, CVV, OTP, account passwords

### 9.2 The "concierge model" assumption

The service's browser is **already signed in to the target site as the operator** (concierge). It uses the operator's stored payment method on the site itself for the actual purchase. ShofferAI charges the user separately via Razorpay (`pause.kind = "payment"`) and reconciles offline with the operator.

In short:
- User pays ShofferAI via Razorpay (`payment` pause)
- Service places order on the site using the operator's site-side wallet/card (no card data ever flows through this API)

If a site requires a CVV step (some banks require per-txn 3DS), the service raises `pause.kind = "card_cvv"` and cloud retrieves the CVV from its vault using the mTLS pull below.

### 9.3 Credential pull (rare path)

For passwords (initial sign-in to a site), the operator sets up the session out-of-band. For per-txn CVV:

1. Service emits `pause.kind = "card_cvv"` with `credential_ref`.
2. Cloud generates a one-time `release_token` (JWT, 60 s TTL, scoped to that session_id and pause_id).
3. Cloud `POST /sessions/{id}/resume { pause_id, value: { credential_ref, release_token } }`.
4. Service makes a server-to-server **mTLS** call: `POST https://api.shoffer.ai/v1/vault/release` with the token.
5. Vault verifies, returns plaintext, audits.
6. Service injects, never logs, never persists.

### 9.4 Logging & redaction

- Service MUST mask form-input values where `type ∈ {password, tel, cc-number, cvv, otp}` in logs and recordings.
- Service MUST NOT log Authorization headers or vault responses.
- Recordings of payment iframes — drop entirely.

### 9.5 Recording retention & control (addresses S5)

Recordings still contain delivery addresses, partial phone numbers (last-4 in OTP screens), and cart contents. Therefore:

| Artifact      | Default TTL | Configurable max | Notes |
|---------------|-------------|-------------------|-------|
| Video         | 24 hours    | 7 days            | Always redacted per §9.4 |
| Screenshots   | 7 days      | 30 days           | Same redaction |
| DOM dumps     | 24 hours    | 24 hours (hard cap) | Cannot be extended |
| Event log     | 30 days     | 90 days           | No raw inputs |

- `DELETE /v1/sessions/{id}/artifacts` purges all artifacts for a session immediately. Cloud calls this on user data-deletion requests.
- Workspace setting `record_video: "never"` disables video for the entire workspace, overriding per-session `options.record_video: true`.
- Workspace setting `redact_pii_in_recording: true` (default `true`) is enforceable; the vendor MUST refuse `false` for `sk_live_*` keys.

---

## 10. Errors

### 10.1 Wire format — RFC 7807

```json
{
  "type": "https://docs.<vendor>.com/errors/out_of_stock",
  "title": "Out of stock",
  "status": 409,
  "code": "out_of_stock",
  "detail": "Variant bb_VR1L of bb_PD123456 is out of stock as of 07:01:42 IST.",
  "session_id": "ses_...",
  "call_id": "call_...",
  "request_id": "req_..."
}
```

### 10.2 Standard codes

| HTTP | `code`                       | Where it comes from                              |
|------|------------------------------|--------------------------------------------------|
| 400  | `validation_error`           | Body shape wrong — includes `errors:[{path,msg}]`|
| 401  | `unauthenticated`            | Bad/missing API key                              |
| 403  | `forbidden`                  | Scope/workspace mismatch                         |
| 404  | `session_not_found`          | Unknown session_id                               |
| 404  | `op_not_supported`           | Op not in catalogue for this site                |
| 404  | `pause_not_found`            | Unknown pause_id                                 |
| 409  | `idempotency_replay_mismatch`| Same key, different body                         |
| 409  | `pause_already_resumed`      | Resume after first resume                        |
| 409  | `quote_expired`              | `place_order` after quote TTL                    |
| 409  | `out_of_stock`               | `add_to_cart` / `place_order`                    |
| 409  | `min_order_not_met`          | `place_order` when cart < min                    |
| 409  | `invalid_variant`            | `add_to_cart`                                    |
| 409  | `session_busy`               | Concurrent op against same session (§5.3.1)      |
| 410  | `session_closed`             | Op against a closed session                      |
| 422  | `unsupported_param`          | Site rejects an option                            |
| 422  | `address_undeliverable`      | `set_delivery_address`                           |
| 429  | `rate_limited`               | Includes `Retry-After`                           |
| 451  | `site_blocked`               | Geofence / legal                                 |
| 500  | `internal_error`             | Service bug                                      |
| 502  | `browser_crashed`            | Tab crashed; safe to retry op                    |
| 503  | `site_unavailable`           | Site down or login expired — workspace-wide                         |
| 503  | `site_blocked_by_bot_protection` | Site WAF refusing automation across the workspace. `retry_hint.suggest ∈ {"switch_to_headed", "rotate_egress_ip", "escalate_to_operator", "wait_and_retry"}`. (B2.) |
| 503  | `operator_account_flagged`   | Site has flagged THIS operator account specifically (account-level, not workspace-wide). `retry_hint.suggest ∈ {"escalate_to_operator", "rebridge_cookies"}`. Distinct from `site_blocked_by_bot_protection` — fix is at the account level, not the egress level. (Addresses F3.) |
| 503  | `captcha_unsolvable`         | Auto-solve attempts exhausted; see §6.2.1        |
| 504  | `op_timeout`                 | Op exceeded its per-op cap (§11)                 |

### 10.3 Recovery hints

Errors include `recoverable: bool` and `retry_hint` where applicable:

```json
{
  "code": "out_of_stock",
  "recoverable": true,
  "retry_hint": { "suggest_op": "search", "with": { "query": "Amul Taaza milk 500ml" } },
  "user_message": "That milk variant just sold out. Want a different size?"
}
```

`user_message` is pre-baked safe text the cloud can show directly. Cloud is free to override with GPT-5.3-generated prose.

---

## 11. Limits, Quotas, Backpressure

| Limit                              | Default | Override |
|------------------------------------|---------|----------|
| Concurrent open sessions           | 25      | contract |
| New sessions / minute              | 30      | contract |
| Ops / minute / session             | 60      | hard     |
| Ops / minute / workspace           | 600     | contract |
| Op input body                      | 32 KiB  | hard     |
| Op output body                     | 256 KiB | hard     |
| Session lifetime                   | 30 min  | per-session `limits.max_lifetime_s` ≤ 3600 |
| Pause TTL                          | 5 min   | ≤ 15 min  |
| Bot challenges / hour / site       | 10      | hard — beyond this, vendor circuit-breaks the site for the workspace and emits `site_blocked_by_bot_protection` for 30 min (addresses B2) |

### 11.1 Per-op timeout caps (addresses S2)

Replaces the v3 "`typical_duration_ms × 5`" rule. Each op has an explicit hard cap. **Pause TTL stops the op-timeout clock** — the clock starts when the user input is submitted and resumes when the op continues.

| Op                                 | Hard timeout |
|------------------------------------|-------------:|
| `search`, `get_product`, `get_cart`, `get_order`, `list_delivery_slots`, `checkout_summary` | 5 s  |
| `add_to_cart`, `update_cart_qty`, `remove_from_cart`, `clear_cart` | 10 s |
| `set_delivery_address`, `select_delivery_slot`, `session.open`, `session.snapshot` | 15 s |
| `place_order` (excluding pause TTL) | 90 s |
| `inspect`                           | 5 s  |

Exceeding the cap → `504 op_timeout`. Cloud SHOULD retry once for read ops; for mutation ops, cloud SHOULD `session.snapshot` first to determine actual state before retrying.

### 11.2 Rate-limit headers

Every response carries:
```
X-RateLimit-Limit: 600
X-RateLimit-Remaining: 412
X-RateLimit-Reset: 1715588531
X-Concurrent-Sessions: 8
X-Concurrent-Limit: 25
X-Bot-Challenges-Site-1h: 3
```

`429` includes `Retry-After: <seconds>`. Cloud opens a circuit breaker after 5 consecutive `5xx` from `POST /sessions` within 30 s, OR `/v1/health` non-200 twice.

---

## 12. Observability

### 12.1 Per-op telemetry (returned in response)

```json
"telemetry": {
  "duration_ms": 1842,
  "browser_ms": 1700,
  "scrape_ms":  120,
  "internal_llm_tokens": 0,
  "screenshot_url": null,
  "trace_id": "trace_..."
}
```

### 12.2 Per-session summary (on DELETE or auto-close)

```json
{
  "session_id": "ses_...",
  "closed_at": "...",
  "lifetime_s": 184,
  "ops_count": 11,
  "ops_breakdown": { "search": 3, "add_to_cart": 2, "get_cart": 4, "set_delivery_address": 1, "place_order": 1 },
  "cost_inr_paise": 145,
  "video_url": "https://artifacts.<vendor>.com/.../video.mp4"
}
```

### 12.3 Trace propagation

Cloud sets `traceparent` on every request. Service propagates. Per-op spans roll up under cloud's chat trace.

---

## 13. SLAs

| Metric                                            | Target |
|---------------------------------------------------|--------|
| Uptime (rolling 30 days)                          | 99.9%  |
| Read ops (`search`, `get_*`) p95 latency          | < 2 s  |
| Mutation ops (`add_to_cart`, `update_*`) p95      | < 3 s  |
| `place_order` p95 (excluding pauses)              | < 8 s  |
| **Cold** `session.open` p95                        | < 5 s  |
| **Warm** `session.open` p95 (reused per §2.1)      | < 200 ms |
| Catalogue (`/v1/sites/*/ops`) p99                 | < 200 ms |
| Per-site op success rate (rolling 7d)             | > 95%  |

Vendor publishes per-site, per-op success rate dashboards.

---

## 14. Cost Model (shape)

| Line item            | Unit          | Notes                                          |
|----------------------|---------------|------------------------------------------------|
| Op call              | per call      | Tier by op kind (read/mutation/place_order)    |
| Browser-second       | per second    | While a session is open                        |
| Captcha solve        | per solve     | Per attempt, regardless of success (§6.2.1)    |
| Bot-protection retry | per retry     | When `site_blocked_by_bot_protection` triggers fallback (headed, IP rotate) |
| Storage (video)      | per GB-month  |                                                |
| Per-session floor    | flat          |                                                |

Returned per-op in `_meta.shoffer.cost_inr_paise` (MCP) / `telemetry.cost_inr_paise` (REST), and per-session in close summary.

### 14.1 Worked example — typical BigBasket order (addresses N5)

> **Caveat (F4)**: the absolute paise figures below are **illustrative ceilings for cloud-side budgeting only**, NOT a vendor pricing proposal. Actual vendor pricing is TBD in commercial negotiation and will likely be 5–20× higher per call given what the contract requires (Playwright fleet, anti-bot infrastructure, captcha solving, per-session cart-namespace bookkeeping, MCP server, support SLA, quarterly recertification). What matters for vendor portability is the **shape** of the cost model — the line items and how they're attributed per op — not the numbers. Cloud computes margins against the negotiated rate, not these illustrations.

User orders 2 items, picks one variant via chat, pays online, no captcha. Twelve op calls + one payment pause.

| Step                          | Op                           | Calls | Browser-s | Cost (illustrative paise) |
|-------------------------------|------------------------------|------:|---------:|-------------:|
| Warm session reuse            | `session.open`               |     1 |        0 |            5 |
| Search 2 items                | `bigbasket.search` × 2       |     2 |        4 |            8 |
| Add 2 items to cart           | `bigbasket.add_to_cart` × 2  |     2 |        4 |           20 |
| Set address                   | `bigbasket.set_delivery_address` | 1 |        2 |           10 |
| Pick slot                     | `bigbasket.list_delivery_slots` + `select_delivery_slot` | 2 | 3 |           15 |
| Quote                         | `bigbasket.checkout_summary` |     1 |        2 |           10 |
| Place order (incl. payment pause = 0 browser-s during pause) | `bigbasket.place_order` | 1 | 8 | 80 |
| Confirm                       | `bigbasket.get_order`        |     1 |        2 |           10 |
| Close                         | `session.close`              |     1 |        0 |            2 |
| **Subtotals**                 | —                            |  **12** | **25 s** | **160 paise** |
| Browser-seconds @ ₹0.001/s    | —                            |       |          |           25 |
| Per-session floor             | —                            |       |          |           50 |
| **Total (illustrative ceiling)** | —                         |       |          | **₹2.35** |

Cold-start penalty (no warm session): +5 s browser, +50 paise ≈ ₹2.85 total.
Add a captcha solve: +50 paise per attempt.
Add a bot-protection retry / `operator_review` escalation: +200 paise (rotate-egress) or +500 paise (headed-mode escalation).

What this is for: cloud's finance team uses the **shape** to back-solve the per-task service fee at the negotiated vendor rate. Once the vendor's actual pricing lands, replace the illustrative paise figures with the real ones; the line-item structure stays.

---

## 15. Sandbox & Testing

### 15.1 Sandbox keys (`sk_test_*`)

- All sessions run against the vendor's mocked sites (or read-only against real sites if available).
- `place_order` returns `simulated` order_ids; no real money.

### 15.2 Replay fixtures

`GET /v1/fixtures/{site}/{scenario}` returns canonical op call sequences for a scenario (e.g. `bigbasket/grocery_happy_path`, `bigbasket/out_of_stock_mid_cart`). Cloud snapshot-tests against these.

### 15.3 Local dev shim

`apps/web/lib/browser-ops/mock.ts` implements the entire API in-process from JSON fixtures. Used when `BROWSER_OPS_URL` is unset (local dev / CI). No network.

### 15.4 Manual QA

`apps/playwright-dev-mcp/` retains a single-tab Playwright MCP for human operators to verify selectors and debug site changes. Production code cannot import from it (lint rule).

---

## 16. Cloud-Side Adapter (informational)

> **Big change vs v2**: with MCP transport, most of cloud's existing tool-dispatch code is reused. The "adapter" is a thin MCP client + a per-site `MCPHostLike` shim, NOT a hand-rolled REST client per op. `SessionMCPHost` already injects `sessionId` on every tool call — exactly what we need.

### 16.1 Modules

```
apps/web/lib/browser-ops/
  ├── mcp-client.ts          # Thin wrapper over @modelcontextprotocol/sdk client (Streamable HTTP transport)
  ├── browser-ops-host.ts    # Implements MCPHostLike; injects session_id + idempotency_key into every tools/call
  ├── elicitation-bridge.ts  # MCP elicitation → chat ask_user widget → response back to server
  ├── session-registry.ts    # Tracks open browser sessions per (user, chat task)
  ├── circuit-breaker.ts     # Open after 5xx burst or health failure
  ├── catalogue-cache.ts     # 5 min TTL on tools/list per site
  ├── rest-fallback.ts       # Used only when vendor doesn't offer MCP
  ├── mock.ts                # In-process mock MCP server for local dev / CI
  └── contract.test.ts
```

`apps/web/lib/browser-ops/schemas/` is **not needed** for MCP transport — `tools/list` is the source of truth. We keep generated TS types (codegen from the live `tools/list` response, run nightly + on demand).

### 16.2 Public TS surface

```ts
// Reuses existing MCPHostLike — no new interface invented
import type { MCPHostLike, MCPTool } from '@shofferai/shared';

export interface BrowserOpsHost extends MCPHostLike {
  // MCPHostLike already provides:
  //   getTools(): MCPTool[]
  //   isMCPTool(name: string): boolean
  //   callTool(name: string, args: Record<string, unknown>): Promise<unknown>
  //   disconnect(): Promise<void>

  // Browser-ops-specific extensions:
  openSession(input: OpenSessionInput): Promise<SessionHandle>;
  closeSession(sessionId: string): Promise<void>;
  getSessionState(sessionId: string): Promise<SessionSnapshot>;
}

// One BrowserOpsHost per site, multiplexed by AgentExecutor based on intent.
// AgentExecutor's tool loop is unchanged — it just sees more granular tools
// (bigbasket.search, bigbasket.add_to_cart, ...) instead of browse_website.
```

**Verify SessionMCPHost meta carrying (S6).** The existing `SessionMCPHost` injects `sessionId` into args today. v4 needs it to also inject `_meta.shoffer.idempotency_key`, `_meta.shoffer.task_id`, `_meta.shoffer.user_ref`, and (when set) `_meta.shoffer.cart_namespace` on every `tools/call`. If the wrapper can't carry `_meta` cleanly, introduce a thin `MetaInjector` interface alongside `SessionMCPHost`. Track this as a hard requirement on the `browser-ops-host` todo.

### 16.3 GPT-5.3 op-planning loop

`AgentExecutor.run()` becomes:

```
1. classify intent → site, category
2. host = browserOpsRegistry.for(site)
3. session = await host.openSession({ user_ref, ... })
4. inject session_id into MCPHostLike wrapper (existing SessionMCPHost pattern)
5. tools = host.getTools()        // bigbasket.search, bigbasket.add_to_cart, ...
6. while not done:
     a. GPT-5.3 picks next tool + args from { conversation, last_tool_result }
     b. result = await host.callTool(tool, args)        // session_id auto-injected
     c. if elicitation request arrives during call → render ask_user widget,
        collect, respond inline (handled by elicitation-bridge.ts)
     d. if tool errored with recoverable → apply retry_hint or ask user
     e. update conversation with result
7. await host.closeSession(session.id)
```

The agent loop changes minimally — the LLM just sees a different tool list. **All the MCP plumbing already exists.**

### 16.4 What gets deleted

| Path | Lines | Action |
|---|---:|---|
| `apps/playwright/` (relay, pool, task-manager, bridge) | ~3,500 | **Delete** (split out dev MCP first) |
| `apps/web/lib/relay-bridge.ts`, `relay-client.ts`, `remote-mcp-host.ts` | ~780 | **Delete** — replaced by `mcp-client.ts` over HTTP transport |
| `apps/web/lib/composite-mcp-host.ts`, `zomato-mcp-host.ts` | ~400 | **Delete** |
| `apps/web/lib/session-mcp-host.ts` | 79 | **KEEP, retarget** — same `sessionId`-injection pattern works against vendor MCP |
| `apps/web/lib/mcp-event-bus.ts` | ~80 | **KEEP** — still useful for telemetry |
| `apps/web/custom-server.js` (WS upgrade + draining) | ~150 of 400 | **Trim** |
| `apps/web/app/api/admin/release-relay/` | ~80 | **Delete** |
| `cloudbuild.yaml` (release-relay step, max-instances=1 pin) | ~20 | **Trim** |
| `packages/agent-core/src/scripts/` (504 files; 10 real, 494 stubs) | ~111,000 | **Delete entirely** |
| `packages/agent-core/src/agent.ts` browser path (handoff_to_browser_agent, recorder/player wiring, message-rewriter for browser msgs) | ~800 of 1651 | **Trim to ~600 lines** |
| `packages/agent-core/src/message-rewriter.ts` | ~400 | **Delete** — no more LLM narration to rewrite |
| `packages/shared/src/internal-message-filter.{ts,fixtures.ts}` | ~1,800 | **Delete** — same reason |
| Docs: `PLAYWRIGHT-MCP-CHROME.md`, `COMPILED-SCRIPTS.md`, `500-WORKFLOWS.md`, relay sections of `LATENCY.md` / `ARCHITECTURE.md` | varies | **Archive** |

**Net deletion: ~119,000 lines / ~520 files.** (Slightly less than v2 because `SessionMCPHost`, `MCPHostLike`, `mcp-event-bus.ts` are kept and retargeted.)

### 16.5 What gets added

| Path | Est. lines |
|---|---:|
| `apps/web/lib/browser-ops/mcp-client.ts` (wraps `@modelcontextprotocol/sdk`) | ~150 |
| `apps/web/lib/browser-ops/browser-ops-host.ts` (implements MCPHostLike) | ~180 |
| `apps/web/lib/browser-ops/elicitation-bridge.ts` | ~140 |
| `apps/web/lib/browser-ops/session-registry.ts` | ~100 |
| `apps/web/lib/browser-ops/catalogue-cache.ts` | ~60 |
| `apps/web/lib/browser-ops/circuit-breaker.ts` | ~80 |
| `apps/web/lib/browser-ops/rest-fallback.ts` (used only if vendor lacks MCP) | ~250 |
| `apps/web/lib/browser-ops/mock.ts` (in-process mock MCP server) | ~400 |
| `apps/web/lib/browser-ops/contract.test.ts` | ~400 |
| Op-planning loop trim in `packages/agent-core/src/agent.ts` | net ~−800 |

**Net add: ~1,800 lines.** (Less than v2 because we reuse existing MCP plumbing.)

### 16.6 Contract test suite + quarterly recertification (addresses S8)

`apps/web/lib/browser-ops/contract.test.ts` runs against:
1. The mock MCP server (always, in CI).
2. Vendor MCP sandbox (nightly, gated by `RUN_VENDOR_CONTRACT=1`).
3. Vendor REST sandbox (same gate, only if vendor offers REST) — proves both transports honor the same contract.

Asserts: `tools/list` returns the catalogue, every tool's input matches schema, every error result, idempotency `_meta.idempotency_key` replay, elicitation round-trip, session lifetime/idle close, rate-limit headers, mTLS vault pull mock, anti-bot escalation hints, per-op timeout caps.

**Quarterly recertification (NEW, replaces v3 nightly-as-only-mechanism):**
Every quarter, the vendor MUST submit:
1. A fresh `tools/list` snapshot per supported site.
2. A recorded canonical fixture per site (e.g. `bigbasket/grocery_happy_path`) replayed end-to-end.
3. A diff against the previous quarter's snapshots.

Cloud reviews; any breaking schema change without prior notice → contract violation. This forcing function is what prevents nightly tests from drifting silently.

---

## 17. Migration Plan

### Phase 0 — Spec sign-off
- Vendor reviews this doc, answers remaining §19 open questions, agrees pricing.
- **Scope (addresses N2)**: v1 sign-off requires the **grocery** op catalogue to be fully schema'd (`bigbasket`, `blinkit`, `swiggy_instamart`, `zepto`, `jiomart`). The category extensions in §5.5 (food / hotels / flights / recharge / bill-pay / tracking) are placeholders; their schemas land before each per-category cutover (Phase 2.x) and don't block v1.
- JSON Schemas for grocery extracted to `apps/web/lib/browser-ops/schemas/`.
- Mock MCP server implemented; contract tests green for both transports (§2.6 parity).
- **Capability gate (F6)**: per-session cart-namespace bookkeeping (§2.2) is the single largest engineering item per site. Vendor must demonstrate working cart isolation on at least one grocery site before Phase 0 closes — site-side line tagging table, filtered `get_cart` reads, scoped `place_order` reconciliation, survival of out-of-band operator cart edits. Budget ~2 weeks per site. **This is a non-trivial gate, not a checkbox.** If the vendor cannot demonstrate cart isolation on BigBasket within Phase 0, that site is unsupported until they can — per §2.2 "If neither (1) nor (2) is achievable on a given site, that site is unsupported until it is."
- Reference implementation (`playwrightRunner/`) reaches feature parity for grocery (15 ops + MCP skin + elicitation + per-session ChromeManager + idempotency dedupe + anti-bot recovery + cart-namespace bookkeeping — see Track 2 todos).

### Phase 1 — Adapter behind a flag
- `BROWSER_OPS_URL` env var.
- `BrowserOpsClient` lives next to `RemoteMCPHost`.
- New code path used only when flag set on a per-skill basis.

### Phase 2 — Per-site cutover
- Start with **`bigbasket-grocery`** (most-used, has hand-written reference script we can validate parity against).
- Implement op-planning loop in cloud for grocery sites.
- Run shadow mode for 24 h: send the same task to both relay and service, compare outcomes.
- Promote to live for bigbasket only.
- Repeat per site: blinkit → zepto → swiggy_instamart → zomato → swiggy_food → mcdonalds → kfc → dominos → booking-com-hotel.

### Phase 3 — Default to service
- All routed sites stable for 7 days → flip default.
- Relay path becomes opt-in for unsupported sites only.

### Phase 4 — Delete legacy
- Once 100% of live traffic is on the service, execute the deletion checklist in §16.4.
- Move `apps/playwright/` (stripped of relay/pool) to `apps/playwright-dev-mcp/`, behind `SHOFFER_DEV_MCP=1`.
- Add `eslint-plugin-boundaries` rule preventing prod imports from `apps/playwright-dev-mcp/`.
- Final commit: `refactor: remove laptop runtime; browser ops via service`.

---

## 18. Worked Example: BigBasket Order

User: *"order 1L Amul milk and a loaf of Britannia bread from BigBasket"*

```
1.  GPT-5.3 → site=bigbasket, items=[{q:"1L Amul milk"},{q:"Britannia bread"}]
2.  cloud → POST /sessions  { site:"bigbasket", session_kind:"grocery" }
                            ← { session_id:"ses_A", status:"ready" }

3.  cloud → POST /sessions/ses_A/op/search  { query:"1L Amul milk", limit:5 }
                            ← { results:[{product_id:"bb_PD11"},{...},...] }
4.  GPT-5.3 sees only 1 plausible match → cloud → POST /op/add_to_cart { product_id:"bb_PD11", qty:1 }
                            ← { added:{...}, cart_summary:{item_count:1, subtotal_paise:7500} }

5.  cloud → POST /sessions/ses_A/op/search  { query:"Britannia bread", limit:5 }
                            ← { results:[ Britannia Brown, Modern White, Britannia Whole Wheat, ... ] }
6.  GPT-5.3 sees ≥ 2 plausible matches → emits ask_user(card_grid) to chat
                            User picks "Britannia Brown 400g".
7.  cloud → POST /op/add_to_cart  { product_id:"bb_PD42" }
                            ← cart_summary {item_count:2, subtotal_paise:9500}
                            (also emits cart_update SSE → UI cart bar)

8.  cloud → POST /op/set_delivery_address  { saved_label:"Home" }
                            ← { delivery_available:true, eta:90 }

9.  cloud → POST /op/list_delivery_slots
                            ← { slots:[ ... ] }
    GPT-5.3 picks the cheapest free slot or asks user — let's say auto-picks 6-8 AM.
10. cloud → POST /op/select_delivery_slot { slot_id:"slot_06_08" }

11. cloud → POST /op/checkout_summary
                            ← { quote_id:"q_X", total_paise:11000, expires_at:... }

12. cloud → POST /op/place_order  { quote_id:"q_X", payment_method:"online" }
                            ← { status:"needs_input", pause:{kind:"payment", amount_paise:11000, ...} }
13. cloud opens Razorpay panel → user pays → cloud verifies signature
14. cloud → POST /sessions/ses_A/resume  { pause_id, value:{status:"paid", razorpay_payment_id, signature} }
                            ← { status:"ok", output:{ order_id:"ord_..." } }

15. cloud → POST /op/get_order  { order_id:"ord_..." }
                            ← { order_id_external:"BB-91827364", tracking_url:"...", ... }

16. cloud → DELETE /sessions/ses_A
17. cloud writes Order row, charges service fee, renders confirmation card.
```

**~12 op calls + 1 pause/resume.** Each is short, typed, and individually retryable. No 6-minute black box.

---

## 19. Open Questions for Vendor

Items resolved into the spec by v4: ~~B1 sessions across tasks~~ (§2.1), ~~B3 concurrent ops~~ (§5.3.1), ~~B4 product_id stability~~ (§5.4.1), ~~B5 cart isolation~~ (§2.2), ~~B6 read-your-write~~ (§2.3), ~~S2 timeout caps~~ (§11.1), ~~S4 captcha specifics~~ (§6.2.1), ~~S5 retention~~ (§9.5), ~~S7 inspect quota~~ (§5.6), ~~S8 recertification~~ (§16.6), ~~N2 grocery scope~~ (§17), ~~N4 narrow inspect~~ (§5.6), ~~N5 cost example~~ (§14.1), ~~B2 anti-bot~~ (§10.2 + §11). Remaining open questions:

### Transport
1. **Do you offer an MCP HTTP transport?** Production-grade Streamable HTTP, supports `tools/list`, `tools/call` with `_meta`, `notifications/progress`, and **elicitation**? If not, when?
2. If MCP only — is each site one MCP server (separate URL per site), one server with all tools, or one server with per-session tool filtering?
3. **Elicitation support** — does your MCP server support `elicitation/create` requests so OTP/payment pauses are inline rather than out-of-band?
4. Is your REST fallback semantically identical to MCP (idempotency, error shapes, pause TTL, idempotent-replay rules)? Or is REST a stripped-down second-class transport?

### Operational
5. **Per-site adapter ownership** — do you maintain all site adapters, or do we contribute? If we contribute, what's the SDK and per-adapter onboarding time?
6. **Catalogue freshness** — when a site changes selectors and `add_to_cart` starts failing, what's your typical fix SLA? Hours, days, weeks?
7. **Site-side payment methods** — does the operator-stored card on, say, BigBasket count as auto-pay, or does each `place_order` raise CVV (forcing `pause.kind = "card_cvv"`)?
8. **OTP retrieval for the operator's phone** — does the service read OTPs from a shared inbox (Twilio/IMAP), or always pause and ask cloud?
9. **Vendor lock-in** — JSON-Schema source files licensed for us to use against any future vendor?
10. **Anti-bot fallbacks** — confirm you actually implement the `retry_hint.suggest` modes (`switch_to_headed`, `rotate_egress_ip`, `escalate_to_operator`) or is this aspirational?

---

## 20. Appendix — Sample TS types

```ts
type SessionId = string & { __brand: 'SessionId' };

interface OpEnvelope<I, O> {
  input: I;
  result:
    | { status: 'ok';          output: O;  telemetry: Telemetry; warnings?: Warning[] }
    | { status: 'needs_input'; pause: Pause; telemetry: Telemetry }
    | { status: 'failed';      error: ApiError; telemetry: Telemetry };
}

type SearchInput   = { query: string; limit?: number; filters?: SearchFilters; sort?: 'relevance'|'price_asc'|'price_desc' };
type SearchOutput  = { results: ProductSummary[]; total_results_estimate: number; search_id: string };

type AddToCartInput  = { product_id: string; variant_id?: string; quantity?: number };
type AddToCartOutput = { added: CartLine; cart_summary: CartSummary };

type Pause =
  | { pause_id: string; kind: 'otp';      prompt: { question: string; length: number; channel: 'sms'|'email'|'totp'; resend_in_s?: number }; expires_at: string }
  | { pause_id: string; kind: 'payment';  prompt: { amount_paise: number; currency: 'INR'; merchant_label: string; site_payment_intent?: unknown }; expires_at: string }
  | { pause_id: string; kind: 'address_confirm'; prompt: { address: AddressLines }; expires_at: string }
  | { pause_id: string; kind: 'card_cvv'; prompt: { credential_ref: string }; expires_at: string }
  | { pause_id: string; kind: 'captcha';  prompt: { hint?: string }; expires_at: string };

type ResumeInput =
  | { pause_id: string; value: { otp: string } | { action: 'resend' } }
  | { pause_id: string; value: { status: 'paid'; razorpay_payment_id: string; signature: string } | { status: 'declined'; reason?: string } }
  | { pause_id: string; value: { confirmed: boolean } }
  | { pause_id: string; value: { credential_ref: string; release_token: string } }
  | { pause_id: string; value: { solved: boolean } };
```

Full schemas live in `apps/web/lib/browser-ops/schemas/*.json`.

---

## 21. Sign-Off

| Role               | Name | Signature | Date |
|--------------------|------|-----------|------|
| ShofferAI Founder  | Rohit Singh |     |      |
| Vendor Account Lead| —    |           |      |
| ShofferAI Eng Lead | —    |           |      |

---

## 22. MCP Transport Binding (preferred)

This appendix specifies how every concept in §1–§18 maps to the **Model Context Protocol**. When the vendor offers MCP, the cloud uses MCP and the REST endpoints in §5 are unused.

### 22.1 Server, transport, handshake

- **Transport**: MCP Streamable HTTP (single endpoint, supports SSE for server-initiated messages).
- **Endpoint**: `https://mcp.<vendor>.com/v1` (one server per workspace; per-site routing via tool name prefix).
- **Initialize handshake**:
  ```jsonc
  // client → server
  {
    "jsonrpc": "2.0", "id": 1, "method": "initialize",
    "params": {
      "protocolVersion": "2025-06-18",
      "capabilities": {
        "elicitation": {},
        "sampling": {},
        "roots": { "listChanged": false }
      },
      "clientInfo": { "name": "shofferai-cloud", "version": "1.0.0" }
    }
  }
  ```
- **Auth header on every HTTP request**: `Authorization: Bearer <api_key>`. `X-Workspace-Id` and `X-API-Version` headers as in §3.
- **Server capabilities required**: `tools.listChanged`, `elicitation`, optionally `logging`.

### 22.2 Tool naming convention

```
<site>.<op>     e.g. bigbasket.search, blinkit.add_to_cart, zomato.list_restaurants
session.open    Site-agnostic ops live under "session.*" or "ops.*"
session.close
session.snapshot
ops.inspect     The escape hatch from §5.6
```

`tools/list` returns every supported `<site>.<op>` for the workspace's enabled sites. Cloud caches for 5 min and uses `notifications/tools/list_changed` to invalidate.

### 22.3 Tool definition example — `bigbasket.search`

```jsonc
{
  "name": "bigbasket.search",
  "title": "Search BigBasket products",
  "description": "Search the BigBasket catalogue. Returns top N ranked results. Idempotent (same args → cached result for 60s).",
  "inputSchema": {
    "type": "object",
    "required": ["session_id", "query"],
    "properties": {
      "session_id": { "type": "string", "description": "Open BigBasket session id from session.open" },
      "query":      { "type": "string", "minLength": 1 },
      "limit":      { "type": "integer", "minimum": 1, "maximum": 20, "default": 5 },
      "filters":    {
        "type": "object",
        "properties": {
          "veg_only":        { "type": "boolean" },
          "max_price_paise": { "type": "integer", "minimum": 0 },
          "brand":           { "type": "string" }
        }
      },
      "sort": { "type": "string", "enum": ["relevance","price_asc","price_desc"] }
    }
  },
  "outputSchema": {
    "type": "object",
    "required": ["results","search_id"],
    "properties": {
      "results": {
        "type": "array",
        "items": { "$ref": "#/$defs/ProductSummary" }
      },
      "total_results_estimate": { "type": "integer" },
      "search_id": { "type": "string" }
    },
    "$defs": { "ProductSummary": { "...": "..." } }
  },
  "annotations": {
    "readOnlyHint": true,
    "idempotentHint": true,
    "destructiveHint": false
  }
}
```

`annotations.readOnlyHint` and `annotations.idempotentHint` MUST reflect §8's idempotency table. Cloud uses these hints for retry logic.

### 22.4 Tool call — `tools/call`

```jsonc
// client → server
{
  "jsonrpc": "2.0", "id": 42, "method": "tools/call",
  "params": {
    "name": "bigbasket.search",
    "arguments": {
      "session_id": "ses_01J7...",
      "query": "1L Amul milk",
      "limit": 5
    },
    "_meta": {
      "shoffer.idempotency_key": "01J7Z5K3F8H2RSX9M1Q3W4V5N6",
      "shoffer.task_id":         "task_abc",
      "shoffer.user_ref":        "sha256:0d4a...",
      "shoffer.cart_namespace":  "ns_ses_01J7Z5K3F8H2RSX9M1Q3W4V5N6"
    }
  }
}
```

All four `_meta.shoffer.*` keys MUST be present on every `tools/call` (addresses F2). `cart_namespace` is the value cloud received from `session.open` (§5.2) and is used by the vendor to scope cart mutations and reads per §2.2.

**Concurrency (B3)**: the server MUST serialise `tools/call`s with the same `arguments.session_id`. Concurrent calls MAY be rejected with an `isError: true` result carrying `code: "session_busy"` and a recommended `Retry-After`.

### 22.5 Successful tool result

```jsonc
// server → client
{
  "jsonrpc": "2.0", "id": 42,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Found 5 products"
      }
    ],
    "structuredContent": {
      "results": [ /* ...ProductSummary[]... */ ],
      "total_results_estimate": 312,
      "search_id": "srch_01J8..."
    },
    "isError": false,
    "_meta": {
      "shoffer.duration_ms": 1842,
      "shoffer.cost_inr_paise": 4,
      "shoffer.op_version": 3,
      "shoffer.warnings": []
    }
  }
}
```

`structuredContent` MUST conform to the tool's `outputSchema`. `content[0].text` is a one-line human-readable summary (used by the cloud for logs, not parsed). Cloud reads `structuredContent` as the canonical result.

### 22.6 Error tool result

MCP errors come back as a tool result with `isError: true` and the RFC 7807 error in `structuredContent`:

```jsonc
{
  "jsonrpc": "2.0", "id": 42,
  "result": {
    "content": [{ "type": "text", "text": "Out of stock" }],
    "structuredContent": {
      "type":   "https://docs.<vendor>.com/errors/out_of_stock",
      "title":  "Out of stock",
      "status": 409,
      "code":   "out_of_stock",
      "detail": "Variant bb_VR1L of bb_PD123456 is out of stock as of 07:01:42 IST.",
      "session_id": "ses_...",
      "call_id": "call_...",
      "request_id": "req_...",
      "recoverable": true,
      "retry_hint": { "suggest_op": "bigbasket.search", "with": { "query": "Amul Taaza milk 500ml" } },
      "user_message": "That milk variant just sold out. Want a different size?"
    },
    "isError": true
  }
}
```

JSON-RPC level errors (`error: { code, message }`) are reserved for **transport-level** failures (malformed request, unknown tool, unauthenticated). Anything that's a "the op ran but had a problem" is an `isError: true` tool result. This matches MCP convention.

### 22.7 Pauses via MCP elicitation

When an op needs user input mid-call (OTP, payment, address confirm), the server sends an `elicitation/create` request to the client **before** completing the `tools/call`:

```jsonc
// server → client (during tools/call id=43)
{
  "jsonrpc": "2.0", "id": 100, "method": "elicitation/create",
  "params": {
    "message": "Enter the 6-digit OTP sent to +91-***-**-9137",
    "requestedSchema": {
      "type": "object",
      "required": ["otp"],
      "properties": {
        "otp": { "type": "string", "pattern": "^\\d{6}$", "description": "6-digit code" }
      }
    },
    "_meta": {
      "shoffer.kind": "otp",
      "shoffer.pause_id": "pa_otp_01J8...",
      "shoffer.expires_at": "2026-05-13T07:05:00.000Z",
      "shoffer.channel": "sms",
      "shoffer.resend_in_s": 30
    }
  }
}
```

Cloud's `elicitation-bridge.ts`:
1. Reads `_meta.shoffer.kind` → renders the appropriate chat widget (OTP input, Razorpay panel, address picker).
2. Awaits the user's reply.
3. Responds:
   ```jsonc
   {
     "jsonrpc": "2.0", "id": 100,
     "result": {
       "action": "accept",
       "content": { "otp": "123456" }
     }
   }
   ```
   Or, if the user cancels:
   ```jsonc
   { "jsonrpc": "2.0", "id": 100, "result": { "action": "cancel" } }
   ```
4. Server resumes the original `tools/call id=43` and ultimately returns its tool result.

**Mapping `shoffer.kind` → cloud widget**

| `_meta.shoffer.kind` | Cloud widget                       | `requestedSchema` shape                                                 |
|----------------------|------------------------------------|-------------------------------------------------------------------------|
| `otp`                | OTP input box                      | `{ otp: string }` or `{ action: "resend" }`                             |
| `payment`            | Razorpay panel                     | `{ status: "paid", razorpay_payment_id, signature }` / `{ status: "declined" }` |
| `address_confirm`    | "Confirm delivery to: …" Yes/No    | `{ confirmed: boolean }`                                                |
| `card_cvv`           | CVV input (mTLS-pulled credential) | `{ credential_ref, release_token }`                                     |
| `captcha`            | usually solved server-side         | `{ solved: boolean }`                                                   |

Pause TTL is enforced by the server; if the elicitation isn't answered in time the server cancels the elicitation and the originating `tools/call` returns an `isError` with `code: "user_input_timeout"`.

### 22.8 Sessions

Sessions are NOT MCP transport sessions — those are about transport multiplexing. Browser sessions are first-class resources accessed via dedicated tools:

```
session.open      → returns { session_id, ... }
session.snapshot  → returns current state
session.close     → idempotent
```

All other ops require `session_id` as an input arg (see §22.3). Cloud reuses today's `SessionMCPHost` pattern: per-task wrapper that auto-injects `session_id` into every `arguments` object.

### 22.9 Idempotency

`tools/call.params._meta.shoffer.idempotency_key`. Server stores `(workspace_id, key) → result` for 24 h. Replays return the same tool result with `_meta.shoffer.idempotent_replay: true`.

### 22.10 Telemetry & progress

Long-running ops MAY emit MCP `notifications/progress` referencing the tool call id:

```jsonc
{
  "jsonrpc": "2.0", "method": "notifications/progress",
  "params": {
    "progressToken": "42",          // matches tools/call id
    "progress": 60, "total": 100,
    "message": "Selecting delivery slot…"
  }
}
```

Cloud ignores these for the LLM loop but logs them for the latency dashboard.

### 22.10.1 Session state-change notifications (addresses S9)

The server SHOULD emit a `notifications/message` entry for every session state transition:

```jsonc
{
  "jsonrpc": "2.0", "method": "notifications/message",
  "params": {
    "level": "info",
    "logger": "browser_ops.session",
    "data": {
      "event": "session.state_changed",
      "session_id": "ses_01J7...",
      "from": "running",
      "to":   "paused",
      "reason": "elicitation/payment",
      "ts": "2026-05-13T07:04:55.000Z"
    }
  }
}
```

Cloud renders these on its session timeline UI for debugging without needing to poll `session.snapshot`. State enum: `ready | running | paused | idle | closed | failed`.

### 22.11 Catalogue change notifications

```jsonc
{ "jsonrpc": "2.0", "method": "notifications/tools/list_changed" }
```

Cloud invalidates its 5-min `tools/list` cache and refetches. If a tool's schema changed in a breaking way, cloud opens its circuit breaker for that site until ops reconfirm via the contract test suite.

### 22.12 Logging

If the server advertises the `logging` capability, cloud subscribes (`logging/setLevel: "info"`) and forwards `notifications/message` entries to its own structured log under `browser_ops.<site>.<op>`.

### 22.13 Resources (optional)

The server MAY expose:
- `session://{id}/cart` — current cart JSON (read with `resources/read`)
- `session://{id}/screenshot` — latest screenshot
- `session://{id}/state` — full state snapshot

Cloud uses these for UI hydration after restart instead of calling `session.snapshot` with body cost.

### 22.14 Sampling — explicitly NOT used

The server MUST NOT request `sampling/createMessage`. Cloud's GPT-5.3 is the only model. If the server needs intelligence, it uses its own internal LLM and bills per `_meta.shoffer.cost_inr_paise`.

### 22.15 Wire-format checklist (for vendor implementer)

- [ ] Streamable HTTP transport at `https://mcp.<vendor>.com/v1`
- [ ] `protocolVersion: "2025-06-18"` or later
- [ ] `tools/list` returns one tool per (site, op) with `inputSchema`, `outputSchema`, `annotations`
- [ ] `tools/call` accepts `_meta.shoffer.idempotency_key` and dedupes on it
- [ ] Successful results carry `structuredContent` matching `outputSchema`
- [ ] Error results carry `isError: true` and RFC 7807 `structuredContent`
- [ ] `elicitation/create` raised for every pause kind in §22.7 with `_meta.shoffer.kind`
- [ ] `notifications/tools/list_changed` on catalogue change
- [ ] Bearer auth, `X-Workspace-Id`, `X-API-Version` honored on every HTTP request

End of contract.
