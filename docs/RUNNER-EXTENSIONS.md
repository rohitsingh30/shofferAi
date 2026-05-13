# Runner Extensions — What the Cloud Needs

> Companion to `playwrightRunner/BROWSER-SERVICE-CONTRACT.md`. This doc lists what
> the cloud (shofferAi) needs from the runner over the next set of features.
> Last updated: 2026-05-13.

## TL;DR — what's needed when

| Cloud feature | Runner change required? | Effort |
|---|---|---|
| **Per-card ADD button** (instant_add carousel) | None — pure cloud/UI | n/a |
| **Suggestion chips** after each agent reply | None — pure cloud | n/a |
| **Carousel auto-collapse on next user message** | None — pure cloud/UI | n/a |
| **Per-store cart sections** in cart panel | None — `store` field already in CartContext | n/a |
| **Cross-store search & comparison** (north star) | **Yes** — new scripts: `zepto.*`, `blinkit.*`, `swiggy_instamart.*` | ~2-3 hrs/site for read-only ops |
| Per-store cart write ops (multi-cart checkout) | **Yes** — `<site>.add_to_cart`, `.get_cart`, `.checkout_summary` for each store | ~2 hrs/site |

The first 4 items in this list ship **without any runner change**. Item 5 (cross-store comparison) requires new runner scripts following the same template as `bigbasket.search`.

---

## 1. Current runner surface (as of 2026-05-13)

Runner exposes 16 MCP tools, all `bigbasket.*` prefixed. Source: `/Users/rohit/playwrightRunner/scripts/bigbasket/`.

**Read-only ops** (used by the cloud LLM today):
- `bigbasket.search` — query → top N products with price/image/stock
- `bigbasket.get_product` — full PDP details
- `bigbasket.get_cart` — current cart state
- `bigbasket.checkout_summary` — pre-payment subtotal/discount/total
- `bigbasket.list_delivery_slots` — available delivery slots
- `bigbasket.whoami` — verify signed-in
- `bigbasket.get_order` — fetch order by id

**Write ops** (used today):
- `bigbasket.add_to_cart`
- `bigbasket.update_cart_qty`
- `bigbasket.remove_from_cart`
- `bigbasket.clear_cart`
- `bigbasket.set_delivery_address` (limited — only same-current label works in v0)
- `bigbasket.select_delivery_slot`

**Stubs** (do NOT call):
- `bigbasket.place_order`, `submit_otp`, `confirm_payment`

All tools follow the schema `{ session_id: string, input: { ... } }`. The cloud's `BrowserOpsHost` flattens this to `{ ... }` for the LLM and re-envelops on the way out (see `apps/web/lib/browser-ops/browser-ops-host.ts`).

Runner concurrency: `RUNNER_SLOT_COUNT=3` parallel Chrome UDDs. Each session runs in its own slot. ~5 max on M-series Mac before CPU oscillation.

---

## 2. Multi-store search — the contract

To enable "show me milk options across BigBasket, Zepto, Blinkit", we need at minimum these scripts on each new site:

### Required new tools per site (read-only, ~2-3 hrs/site)

For each new site `S` (e.g. `zepto`, `blinkit`, `swiggy_instamart`):

| Tool | Required | Purpose |
|---|---|---|
| `S.whoami` | yes | Verify signed-in. Needed before any other op. |
| `S.search` | yes | Search catalog → unified product list |
| `S.get_product` | nice-to-have | PDP details for product_card widget |
| `S.get_cart` | yes (later, for multi-cart) | Read cart state |
| `S.add_to_cart` | yes (later) | Write |
| `S.update_cart_qty` | yes (later) | Write |
| `S.remove_from_cart` | yes (later) | Write |
| `S.clear_cart` | yes (later) | Write |
| `S.checkout_summary` | yes (later) | Pre-payment summary |

**For phase 1 of cross-store comparison**, only `S.whoami` + `S.search` are strictly needed per site — the user can browse comparisons, but adds-to-cart and checkout still go through `bigbasket.*` exclusively. Cart-write ops can be added incrementally per site.

### Output schema for `S.search` — MUST be unified

To render a unified carousel comparing products across stores, all `S.search` tools MUST return the same product shape. The cloud's `BrowserOpsHost.callTool` does NOT translate per-site schemas; the LLM consumes them directly.

```typescript
// Required output shape for any <site>.search
{
  query: string;          // echo of input
  count: number;          // length of products array
  products: Array<{
    product_id: string;   // site-internal product id (e.g. "BB-104707", "ZP-83451")
    name: string;
    brand?: string;
    pack?: string;        // weight/size, e.g. "1 L", "500 g"
    priceInr: number;     // sale price (lower of sale/MRP), in rupees, no symbol
    mrpInr?: number;      // MRP if different from sale
    discountPct?: number;
    rating?: string | number;
    ratingCount?: number;
    url: string;          // product detail URL
    imageUrl: string;     // direct CDN URL — must be reachable from the cloud, not a CDN that requires cookies
    inStock: boolean;
    deliveryEta?: string; // optional, e.g. "10 mins", "in 2 hours", "by tomorrow 8 AM"
  }>;
  signedIn: boolean | null;
  signedInIndicator?: string; // e.g. "cookie:ZP_AUTH"
  pageUrl: string;        // listing URL the runner used (for debugging)
  source: 'json-api' | 'dom-scrape';
  durationBreakdownMs?: { api?: number; dom?: number };
}
```

**Critical:** `product_id` MUST be stable across calls — the cloud passes it back to `S.add_to_cart` later. Don't return ephemeral session-bound IDs.

**Critical:** `imageUrl` MUST be a public CDN URL the cloud can render (no cookie-protected URLs). Most grocery sites use a public CDN for product images — verify this before merging.

### Tool description format

Match the Anthropic-grade descriptions already used in `playwrightRunner/src/mcp.ts` `scriptDescription()` map. Each description: 3-4 sentences covering what it does, when to use it, when NOT to, params, return shape, caveats. Example:

```
'zepto.search':
  'Search the Zepto catalog and return ranked product results. Use this whenever \
   the user mentions a product to find on Zepto, or in cross-store comparison flows. \
   Returns { count, products: [{ product_id, name, priceInr, imageUrl, inStock, deliveryEta, ... }] }. \
   Zepto product_ids are 8-digit strings (e.g. "12345678") — do not modify them. \
   Best query format: "<brand> <product> <size>". If 0 results, retry without the brand.',
```

### Concurrency model

Cloud-side, `bigbasket.search`, `zepto.search`, `blinkit.search` will be invoked **in parallel** for the same user query. The runner's slot pool handles this:

- 3 sessions opened (one per site) → 3 slots assigned (slot-0, slot-1, slot-2)
- 3 Chrome instances run in parallel (each in its own UDD)
- Slot pool already validated end-to-end with 3 concurrent BigBasket sessions

If `RUNNER_SLOT_COUNT < N_sites_being_compared`, the cloud will queue. Recommend bumping to `RUNNER_SLOT_COUNT=5` once we add 4 stores (1 buffer for retries).

### Operator UDD per site

Each site needs its own bridged UDD with the operator's signed-in profile. The current bridge tool (`npm run bridge -- <email>`) bridges from the user's REAL Chrome profile. For multi-site:

1. Operator signs into each target site (zepto.com, blinkit.com, swiggy.com) in their real Chrome
2. `npm run bridge -- <email>` copies cookies + Local State to the dedicated UDD
3. Runner uses that bridged UDD across all sites (cookies for all sites travel together)

**No per-site UDD is needed** — one `Chrome-PlaywrightRunner` UDD with all signed-in cookies works. The slot pool's sibling UDDs each get their own bridge from the primary on first use (already implemented).

---

## 3. Skill files for new sites (cloud-side)

Once `S.search` is live, write a `<site>-grocery/SKILL.md` in `packages/agent-core/src/skills/` mirroring `bigbasket-grocery/SKILL.md`. The structure:

```yaml
---
name: zepto-grocery
description: Order groceries from Zepto — 10-minute delivery in metros.
triggers:
  - zepto
  - zepto order
  - zepto grocery
  - 10 min delivery zepto
allowed-tools:
  - zepto.search
  - zepto.add_to_cart
  - ...
siteUrl: https://www.zeptonow.com
requiresAuth: true
params:
  - name: items
    required: false
  - name: address
    required: true
---

# Zepto Grocery — Tool Map

[Same structure as bigbasket-grocery: mandatory flow, tool map, sequencing
 rules, domain knowledge, error recovery, hard rules]
```

Skill files follow the **declarative format** from the recent refactor (commit `4359ced`). Do NOT write imperative "click X / take snapshot" instructions — those were for the old browser-driving agent and don't match the MCP tool surface.

---

## 4. Cross-store comparison skill (cloud-side)

A new skill `cross-store-grocery/SKILL.md` to handle prompts like *"compare milk prices across BigBasket and Zepto"*:

```yaml
---
name: cross-store-grocery
description: Compare grocery products across multiple stores side-by-side.
triggers:
  - compare X across
  - which is cheaper for X
  - X on bigbasket vs zepto
  - find cheapest X
allowed-tools:
  - bigbasket.search
  - zepto.search
  - blinkit.search
  - swiggy_instamart.search
  - bigbasket.add_to_cart
  - zepto.add_to_cart
  - ...
---

# Cross-Store Comparison

For any "compare X" or "find cheapest X" intent:

1. Confirm address (one ask_user, address widget)
2. Call <bigbasket|zepto|blinkit|swiggy>.search in PARALLEL with the same query
3. Merge results into a single carousel grouped by store; each card shows
   { store, productName, price, deliveryEta }
4. User taps ADD on any card → call that store's <S>.add_to_cart
5. Items go into per-store cart sections in the cart panel

The LLM is responsible for parallel tool calls (Anthropic supports this
natively via multiple tool_use blocks in one response).
```

---

## 5. Cart UI implications (cloud-side)

The existing `apps/web/components/chat/CartContext.tsx` already has a `store` field on every cart item. Per-store cart sections are a UI render change in the cart panel — group items by `store`, show subtotals per group. Already-trivial change; not blocked on runner.

When writes are added per-site (`<S>.add_to_cart`), each store maintains its own backend cart. Cloud cart panel becomes a tabbed view: BigBasket cart, Zepto cart, etc. Checkout proceeds **per store** (you check out at BigBasket separately from Zepto — there is no unified payment in v1).

---

## 6. What NOT to do

- ❌ **Don't add a unified `grocery.search` tool** that calls all stores internally. Keep tools per-site so the LLM can decide which to call (latency, store-specific intent). Composite tools work for deterministic sequences (search → add → checkout) but NOT for routing decisions.
- ❌ **Don't change the `bigbasket.*` schemas** when adding new sites. Anything new site that adds extra return fields must use `?:` optionals so the bigbasket flow keeps working unchanged.
- ❌ **Don't bridge cookies separately per site** — one `Chrome-PlaywrightRunner` UDD with all the operator's signed-in sites is correct. Sites don't share cookies (different domains) so this is just a deployment convenience.
- ❌ **Don't expose `session_id` in any new tool's input_schema** — cloud auto-injects. Following the existing `{ session_id, input: { ... } }` envelope is fine; cloud's `BrowserOpsHost` strips both layers before showing to the LLM.

---

## 7. Open questions

1. **Zepto / Blinkit / Swiggy Instamart auth** — operator needs to manually sign in on real Chrome before bridging. Each site has its own login flow (phone+OTP for most). Document this in operator-onboarding.
2. **`pack` field across sites** — different sites use different naming. Normalize at runner output (e.g. always "1 L" not "1l" or "1000ml"). Specify in the search.ts script.
3. **Out-of-stock handling** — currently `bigbasket.search` returns `inStock: false` cards. UI should hide ADD button or grey them out.
4. **Same product across stores** — there's no canonical product ID across sites. Cross-store comparison shows products that *match the query*, not products that are exactly the same SKU. Don't over-promise.
5. **Per-site delivery ETA** — Zepto = "10 min", BigBasket = "tomorrow 8AM". Surface `deliveryEta` so user can compare on time, not just price.

---

## Appendix — Reference: how to add a new site

Concrete step-by-step for adding e.g. `zepto`:

1. **Bridge cookies** (one-time per operator):
   ```bash
   cd ~/playwrightRunner
   # Operator must have signed into zeptonow.com in real Chrome first.
   npm run bridge -- <operator-email>
   ```

2. **Write `scripts/zepto/search.ts`** — copy `scripts/bigbasket/search.ts` as template. Replace JSON-API endpoint and DOM selectors. Output must match the unified product schema (§2).

3. **Add description + schema** in `src/mcp.ts`:
   - `scriptDescription` map: add `'zepto.search': '...'`
   - `scriptInputSchema` switch: add a `case 'zepto.search'` returning `{ session_id: sessionField, input: z.object({ query: z.string().min(1), topN: z.number().int().min(1).max(50).optional() }) }`
   - `scriptAnnotations`: add `'zepto.search'` to the `reads` array

4. **Restart runner** (`launchctl kickstart -k gui/$U/co.docx.shofferai.runner`).

5. **Verify** via direct REST call:
   ```bash
   curl -H "Authorization: Bearer $RUNNER_TOKEN" -H 'Content-Type: application/json' \
     http://127.0.0.1:8787/v1/sessions \
     -X POST -d '{"site":"zepto","operator_id":"op_rsinghtomar54"}'
   # → returns session_id
   curl -H "Authorization: Bearer $RUNNER_TOKEN" -H 'Content-Type: application/json' \
     "http://127.0.0.1:8787/v1/sessions/$SESSION_ID/op/zepto.search" \
     -X POST -d '{"input":{"query":"amul gold milk"}}'
   # → returns unified product schema
   ```

6. **Cloud picks it up automatically** — `loadTools()` is called fresh on every task, so newly-registered MCP tools appear in the LLM's tool list on the next `/api/agent/execute` POST. No cloud redeploy needed.

7. **Write `packages/agent-core/src/skills/zepto-grocery/SKILL.md`** following the bigbasket template. Cloud rebuilds & redeploys.

8. **Test E2E**: send "search zepto for amul gold milk" → carousel renders with Zepto products.
