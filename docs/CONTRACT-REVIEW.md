# Review of `BROWSER-SERVICE-CONTRACT.md` — round 2 (DRAFT v4)

> Round-1 review on DRAFT v3 is archived as `CONTRACT-REVIEW.v3.md` for diff
> reference.

## TL;DR

**v4 addresses essentially every priority item from round 1.** The contract
is materially closer to vendor-signable. Of 16 numbered findings (B1–B6,
S1–S10) plus 5 observations (N1–N5), **16 are fully resolved and tagged in
the spec, 1 is partially resolved, 4 were observations rather than action
items**. The remaining work is a handful of minor follow-ups (mostly fence
posts the vendor will inevitably trip on) and ratifying the open §19
questions with the actual vendor.

The biggest unlock is the explicit **strong** product_id stability and
**warm-session reuse < 200 ms**, which together change the cost & UX math
for every chat-second-message dramatically.

---

## Round-1 findings — resolution status

| # | Finding | Status | Where addressed | Notes |
|---|---|---|---|---|
| **B1** | Sessions across tasks | ✅ resolved | §2.1 | MUST support warm reuse per `(workspace, operator, site)`. Cold p95 < 5 s, warm p95 < 200 ms (§13). `force_fresh: true` opt-out for repro. |
| **B2** | Anti-bot is invisible | ✅ resolved | §10.2 + §11 + §14 | Added `503 site_blocked_by_bot_protection` with `retry_hint.suggest ∈ {switch_to_headed, rotate_egress_ip, escalate_to_operator, wait_and_retry}`. Added `Bot challenges / hour / site = 10` budget with 30-min auto-circuit-break. Added `Bot-protection retry` as cost line item. |
| **B3** | Concurrent ops on session | ✅ resolved | §5.3.1 + §10.2 | Hard MUST: serialise per session. Returns `409 session_busy` with `Retry-After`. Concurrency comes from multiple sessions, not multiple ops. |
| **B4** | `product_id` stability | ✅ resolved (strong) | §5.4.1 | Stable across sessions and across time. Cloud MAY persist on `Order` rows / favourites / reorder flows. 90-day deprecation window + `warnings: [{code: "product_id_remapped", new_id: ...}]` if a SKU is consolidated. |
| **B5** | Site-account contention | ✅ resolved | §2.2 + §5.2 + §5.4.7 | Vendor MUST provide per-session cart namespace OR per-session cart sandbox. Documented contention is explicitly **rejected** for v1 ("If neither (1) nor (2) is achievable on a given site, that site is unsupported until it is."). `session.open` response now includes `cart_namespace`; `get_cart` returns ONLY lines for the calling session. |
| **B6** | `get_cart` after `add_to_cart` race | ✅ resolved | §2.3 | Strict happens-before guarantee on `add_to_cart → get_cart`, `set_delivery_address → list_delivery_slots`, `select_delivery_slot → checkout_summary`. Vendor implementation MUST wait for observable commit before returning the mutation op. |
| **S1** | `add_to_cart` idempotency operational note | ✅ resolved | §8 | "`idempotency_key` MUST be a fresh ULID per intent, **never** a hash of the args." |
| **S2** | `op_timeout = typical × 5` too tight | ✅ resolved | §11.1 | Explicit per-op cap table; reads 5 s, mutations 10 s, sets 15 s, `place_order` 90 s, `inspect` 5 s. **Pause TTL stops the op-timeout clock.** |
| **S3** | 256 KiB body cap will bite `search` | ✅ resolved | §5.4.1 | Added `compact: true` flag (default `true` when `limit > 10`); drops `description`, `nutrition_info`, extra images, fields > 200 chars. |
| **S4** | Captcha hand-waved | ✅ resolved | §6.2.1 | Full per-type table: reCAPTCHA v2/v3, hCaptcha, Cloudflare Turnstile, image puzzle — all auto-solved with explicit latency budgets. Audio captcha and behavioural/PoW are explicitly NOT auto-solved → escalate. Per-attempt cost line. |
| **S5** | Recording retention privacy | ✅ resolved | §9.5 | Per-artifact TTL table (video 24 h default / 7 d max; screenshots 7 d / 30 d; DOM dumps 24 h hard cap; events 30 d / 90 d). `DELETE /v1/sessions/{id}/artifacts` endpoint. Workspace settings `record_video: "never"` and `redact_pii_in_recording: true` (mandatory `true` for `sk_live_*`). |
| **S6** | `MCPHostLike` meta carrying | ✅ resolved (with caveat) | §16.2 | Explicit "verify SessionMCPHost can carry `_meta.shoffer.{idempotency_key, task_id, user_ref, cart_namespace}` cleanly; introduce `MetaInjector` if not". Tracked as hard requirement on `browser-ops-host` todo. **Caveat**: §22.4's example only shows `idempotency_key`/`task_id`/`user_ref` — should add `cart_namespace` to the canonical example so vendors don't miss it. |
| **S7** | `inspect` rate-limit too tight for onboarding | ✅ resolved | §5.6 | `sk_live_*`: 6/min/session; `sk_test_*`: 60/min/session. |
| **S8** | Contract-test drift | ✅ resolved | §16.6 | Added quarterly recertification: vendor submits fresh `tools/list` + recorded fixture per site + diff vs prior quarter. "Cloud reviews; any breaking schema change without prior notice → contract violation." |
| **S9** | Session-state observability | ✅ resolved | §22.10.1 | `session.state_changed` MCP `notifications/message` for every transition. Cloud renders on session timeline UI without polling. |
| **S10** | Stable operator identity | ✅ resolved | §5.2 | `logged_in_as` now contains `operator_id` (stable, opaque, persistable) + `operator_label` + `masked_email`. |
| **N1** | Internal-spec-as-RFP | observation | — | Not actionable; just a posture note. v4 doesn't change this and doesn't need to. |
| **N2** | Grocery-anchored scope | ✅ resolved | §17 Phase 0 | "v1 sign-off requires the grocery op catalogue to be fully schema'd. Category extensions (food/hotels/flights/recharge/bill-pay/tracking) don't block v1." Phase 0 also requires `playwrightRunner/` reference impl reaches feature parity for grocery — clean forcing function. |
| **N3** | MCP elicitation bleeding-edge → REST first-class | 🟡 partial | §19 Q4 | Added Q4 explicitly asking the vendor "Is your REST fallback semantically identical to MCP, or stripped-down second-class?" — but the contract body doesn't ratchet REST up to first-class. **Risk**: vendors hear "MCP-preferred" as "REST-acceptable-half-baked"; cloud loses the boundary check. See follow-up F1 below. |
| **N4** | `inspect` will get abused | ✅ resolved | §5.6 | Narrowed to **only** `{ what: "screenshot" }`. `page_text`/`current_url`/`cart_dom_summary` removed. Forcing function: if you want them, add a real op. |
| **N5** | Cost worked example | ✅ resolved | §14.1 | Detailed table for typical BigBasket order: 12 ops, 25 browser-s, ₹2.35 total. Cold-start (+₹0.50), captcha (+50 paise/attempt), bot-retry (+200–500 paise) all shown. Sets up cloud finance to back-solve the per-task service fee. |

---

## v4 follow-ups (minor, not blocking)

### F1. REST fallback semantic parity — lift from open question to spec body

§19 Q4 now asks the vendor whether REST is identical to MCP. That's the wrong
forcing function: vendors will say "yes" and ship a half-baked REST. Move the
guarantee into the contract body alongside §22's MCP binding:

> The REST fallback MUST express every semantic guaranteed by the MCP
> binding: idempotency dedupe (§8), pause/resume single-use, idempotency
> key spanning pause/resume lifecycle, every error code in §10.2,
> happens-before guarantees in §2.3, per-session serialisation in §5.3.1.
> The contract test suite (§16.6) MUST run identically against both
> transports. A vendor failing parity tests on REST is in violation
> regardless of MCP support.

This makes "REST as fallback" a property of the *implementation*, not a
license to cut corners.

### F2. `cart_namespace` in the §22.4 canonical `_meta` example

§5.2 returns `cart_namespace`; §16.2 says SessionMCPHost MUST inject it on
every call. But §22.4's `tools/call` example only shows
`shoffer.idempotency_key / task_id / user_ref`. Add `cart_namespace` to the
canonical example so vendors don't miss it during implementation:

```jsonc
"_meta": {
  "shoffer.idempotency_key": "01J7Z5K3F8H2RSX9M1Q3W4V5N6",
  "shoffer.task_id":         "task_abc",
  "shoffer.user_ref":        "sha256:0d4a...",
  "shoffer.cart_namespace":  "ns_ses_01J7..."
}
```

### F3. New error code: `operator_account_flagged`

§10.2 has `site_unavailable` for "site down or login expired" — that's two
distinct failure modes glued together. The "operator account got flagged
as automation by the site" case needs its own code so cloud can:

- page operator support / re-bridge cookies (account-level fix), vs
- back off and retry (site-level fix)

Add:

| HTTP | `code` | Notes |
|------|--------|-------|
| 503  | `operator_account_flagged` | Site appears to have auth-walled or rate-limited THIS operator account specifically (not the whole site). `retry_hint.suggest ∈ {"escalate_to_operator", "rebridge_cookies"}`. Distinct from `site_blocked_by_bot_protection` (which is workspace-wide). |

### F4. §14.1 cost example — ₹2.35/order is suspiciously low

The total for a typical BigBasket order works out to **₹2.35 ≈ $0.028 USD**.
That feels low for what the contract is asking the vendor to build (full
Playwright fleet, anti-bot infra, captcha solving, per-session cart namespace
bookkeeping, MCP server, support SLA, fix-by-quarter site-change handling,
quarterly recertification). The vendor will almost certainly come back with
a number 5–20× higher.

Two implications worth noting in the cost section:

- **Cloud needs a per-task service-fee buffer** that absorbs the spread
  between the contract's illustrative numbers and what a vendor actually
  bills. Worth saying in §14.1 explicitly: "These numbers are illustrative
  caps for budgeting; vendor pricing TBD; cloud margins are computed against
  the negotiated rate, not these illustrations."
- **The cost shape pieces** (op call, browser-second, captcha solve, retry,
  storage, floor) are right — that's what matters for vendor portability.
  Keep the shape, drop or hedge the absolute numbers.

### F5. §6.2.1 "behavioural / PoW (Akamai sensor data)" is the actual BigBasket reality

We literally hit Akamai's "Access Denied" in headless mode 90 minutes ago.
The contract correctly classifies this as `⚠️ best-effort`, but doesn't say
what happens when best-effort fails repeatedly. Recommend tightening:

> Behavioural / PoW: vendor SHOULD attempt session warming, mouse-movement
> simulation, and headed-mode escalation. After N consecutive failures
> across (operator, site), vendor MUST raise `pause.kind = "operator_review"`
> with a screenshot, surfacing to the human operator (not the cloud user)
> for manual unblock.

This makes the "what to do when Akamai is mad at us" path explicit instead of
the silent `site_blocked_by_bot_protection` loop.

### F6. §2.2 cart-namespace bookkeeping is the biggest single ask

Worth flagging to the vendor (and to ourselves) that "vendor MUST provide
per-session cart namespace" is the single largest piece of engineering work
in the contract for sites whose carts are user-scoped (BigBasket, Blinkit,
JioMart). The vendor has to:

- Tag every line item added in this session with the calling `session_id`.
- Filter `get_cart` reads to only this session's lines.
- Reconcile during `place_order`: place ONLY this session's lines, leave
  sibling-session lines untouched.
- Survive site-side cart edits the operator does manually (out-of-band).

This works on most grocery sites via a server-side line-tagging table, but
the vendor needs ~2 weeks per site to implement reliably. Worth saying in
§17 Phase 0 that this is a non-trivial capability gate, not a checkbox.

### F7. `session.open` should accept an `operator_id` selector

§5.2 today implies the service picks which operator. For multi-operator
deployments (different concierges per region or per ops-shift), cloud may
need to pin: `{ "operator_id": "op_01J7..." }` on `session.open`. Add as an
optional input field; default = vendor's choice.

---

## What we have already vs what the v4 contract needs

(Same shape as round-1, refreshed for v4 deltas.)

| v4 contract concept | What we have today in `playwrightRunner/` |
|---|---|
| Per-(operator, site) signed-in browser | `ChromeManager` + cookie-bridge from real Chrome `Profile 1` ✅ — verified working today against real BigBasket (signed in as Rohit, Tellapur address, My Smart Basket) |
| Op handler shape `(args, ctx) → output` | `default async (page, input, ctx) => output` in `scripts/<name>.ts` ✅ |
| Per-call audit trail | `runs/<runId>/{screenshot.png, page.html}` ✅ |
| Bearer auth | `Authorization: Bearer <RUNNER_TOKEN>` (≥ 32 chars) ✅ |
| HTTP envelope per op | `POST /run/:name` Fastify route ✅ (renames cleanly to `/v1/sessions/:id/op/:name`) |
| `tools/list`-equivalent catalogue | `GET /scripts` ✅ (needs JSON-Schema enrichment) |
| Per-op telemetry | `durationMs` ✅; need `cost_inr_paise`, `op_version`, `warnings`, `browser_ms`, `scrape_ms` |
| `/healthz` + `/status` | ✅ both |
| Concurrency cap, serial by default | `Semaphore + KeyedMutex` ✅ (cap=1 default, per-script override) |
| UDD ownership lock | `playwright-runner.lock` with pid + clear ownership error ✅ |
| **B1 warm session reuse** | partial — single warm Chrome alive between requests, but only one "session" exists today. Need per-`(operator, site)` warm contexts indexed by tuple. |
| **B2 anti-bot recovery** | ❌ today fails open with "Access Denied". Need headed-fallback retry path, IP-rotation hook, operator-escalation pause. |
| **B3 serial per session** | ✅ already serial via `Semaphore(1)` (just need to scope per session_id once we have multiple sessions) |
| **B4 stable product_id** | N/A yet (no `add_to_cart` etc.) — when implemented, must mint stable opaque ids |
| **B5 cart namespace** | ❌ entirely future work; this is the biggest single eng item if we go vendor-direction |
| **B6 read-your-write** | ✅ today via Playwright's natural action-completion semantics; need to verify on real BB cart ops |
| Idempotency-key dedupe | ❌ not yet — `(workspace_id, key) → cached response`, 24 h TTL, with the §8 cloud-side rule |
| MCP server skin | ❌ not yet — but `@playwright/mcp` already configured against same UDD; we'd ship our own MCP server with `bigbasket.<op>` tools |
| Multi-session ChromeManager | ❌ singleton today — needs per-(operator_id, site) instances + lifecycle |
| `session.open` / `session.close` / `session.snapshot` ops | ❌ not yet |
| Site-namespaced op naming (`bigbasket.search`) | ❌ today scripts are flat-namespaced (`bigbasketSearch`) |
| Pause/resume via elicitation | ❌ no payment / OTP flow exercised yet |
| Op catalogue for BigBasket | 🟡 `search` half-built and currently failing on `__name is not defined` inside `page.evaluate()` (esbuild helper not in page context). Need 14 more ops. |
| Per-op timeout caps (§11.1) | partial — global timeout exists; need per-op caps and pause-TTL pause |
| `inspect` (`screenshot` only) | ❌ not yet; add as a generic op |
| Captcha (§6.2.1) | ❌ no integration today |
| Recording retention (§9.5) | partial — `runs/` is on disk forever; need TTL cleaner + workspace overrides + `DELETE /artifacts` |
| Quarterly recertification (§16.6) | ❌ N/A until we have something to recertify |

---

## Recommended next move (unchanged from round-1)

You're at the same fork as before:

- **A. Iterate `playwrightRunner/` as ShofferAI's own internal vendor.**
  Implement the BigBasket op catalogue here, expose MCP, dogfood from
  ShofferAI's chat. By the time you talk to external vendors, you have a
  reference impl + a real conformance test suite to hold them to.

- **B. Keep `playwrightRunner/` only as a contract-testing target.** Mock
  vendor for §15.3 / §16.6.

I still lean **A** for the next 4–8 weeks. The v4 contract reads even more
like a spec we can implement than v3 did — most of the underspecified bits
got nailed down. The "bigbasket reference impl reaches grocery feature parity"
sentence in §17 Phase 0 is now an explicit Phase-0 dependency, which IMO
formalises that this repo is on the critical path regardless of which fork.

Concrete next milestones if pivoting to v0-vendor (in this repo):

1. Rename `bigbasketSearch` → `bigbasket.search`; flat-namespace → site-namespaced.
2. Per-session `ChromeManager` (multiple warm bridged contexts, one per
   `(operator_id, site)` tuple — implements B1 warm reuse).
3. `session.open` / `session.close` / `session.snapshot` as ops.
4. Idempotency-key middleware (§8 + §22.9): `(workspace_id, key) → response`,
   24 h TTL, mismatch-body → `409 idempotency_replay_mismatch`.
5. MCP server skin: each script becomes a `<site>.<op>` MCP tool with
   `inputSchema` / `outputSchema` derived from its TypeScript types.
   Implements `_meta.shoffer.{idempotency_key, task_id, user_ref,
   cart_namespace}` round-trip.
6. Fix `bigbasketSearch` `page.evaluate()` (rewrite to avoid esbuild's
   `__name` helper — pass JS as a string or use inline arrows that don't
   reference class names).
7. Implement remaining BigBasket grocery ops: `get_product`, `add_to_cart`,
   `update_cart_qty`, `remove_from_cart`, `clear_cart`, `get_cart`,
   `set_delivery_address`, `list_delivery_slots`, `select_delivery_slot`,
   `checkout_summary`, `place_order`, `submit_otp`, `confirm_payment`,
   `get_order`. (14 ops. Roughly 1–2 days each = 3–4 weeks of focused work.)
8. Wire MCP elicitation for OTP + payment pauses.
9. Anti-bot recovery: auto-retry on `Access Denied` with headed-mode escalation
   + the `site_blocked_by_bot_protection` error envelope.
10. Cart-namespace bookkeeping (B5) — track per-session lines, filter `get_cart`,
    reconcile on `place_order`. **The hardest item; budget 2 weeks just for
    BB.**

Then circulate this repo as the v0 vendor implementation alongside the
contract. External vendor RFPs become "implement this contract; we have a
reference; tell us where you do better."

---

## Suggested v5 changes (low-priority polish)

If/when you do another contract revision:

- **F1 (REST parity in body)** — single biggest reduction in vendor wiggle room.
- **F2 (`cart_namespace` in §22.4 example)** — 30-second fix that prevents a real bug.
- **F3 (`operator_account_flagged` error code)** — one row in §10.2.
- **F5 (Akamai/PoW behavioural escalation path)** — three sentences in §6.2.1.
- **F4 (cost-numbers caveat)** — one paragraph in §14.1.
- **F6 (cart-namespace as Phase-0 capability gate)** — one sentence in §17.
- **F7 (`operator_id` selector on `session.open`)** — one optional field in §5.2.

None block sign-off. They prevent paper cuts during vendor onboarding and
pricing negotiations.
