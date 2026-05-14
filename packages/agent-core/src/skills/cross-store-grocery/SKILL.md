---
name: cross-store-grocery
description: Compare grocery products across multiple stores in parallel (BigBasket + Zepto + Blinkit + Swiggy Instamart). Use when the user wants to find the cheapest option, compare prices/delivery times across stores, or shop without committing to a single store.
triggers:
  - compare
  - cheapest
  - cheaper
  - which is better
  - vs
  - versus
  - across
  - all stores
  - everywhere
  - best price
  - best deal
  - shop around
  - which has
  - bigbasket vs zepto
  - bigbasket and zepto
  - bigbasket or zepto
  - zepto vs bigbasket
  - zepto and bigbasket
  - compare prices
  - find cheapest
  - lowest price
  - shop multiple
allowed-tools:
  - bigbasket.search
  - bigbasket.add_to_cart
  - bigbasket.get_cart
  - bigbasket.checkout_summary
  - zepto.search
  - zepto.add_to_cart
  - zepto.get_cart
  - blinkit.search
  - blinkit.get_cart
  - swiggy_instamart.search
  - swiggy_instamart.get_cart
requiresAuth: true
params:
  - name: items
    required: false
    hint: List of items the user wants to compare (e.g. "amul gold milk")
  - name: stores
    required: false
    hint: Specific stores to compare (defaults to BigBasket + Zepto if not specified)
  - name: address
    required: true
    hint: Delivery address — required since prices and availability vary by pincode
---

# Cross-Store Grocery Comparison

For any "compare X across stores" or "find cheapest X" intent. The cloud LLM calls multiple `<store>.search` tools **in parallel** (Anthropic supports multiple tool_use blocks in one response) and renders results grouped by store so the user can compare prices side-by-side.

## MANDATORY FLOW

**Step 0 — Confirm delivery address.** Required (prices vary per pincode):

```json
{
  "input_type": "address",
  "question": "Which address should I use to compare prices?",
  "saved": "<pass the user's savedAddresses array from USER CONTEXT verbatim>"
}
```

Do NOT call `set_delivery_address` on any site (not yet implemented to switch). Trust each operator's pre-set address.

**Step 1 — Search ALL chosen stores in PARALLEL.** Default stores: BigBasket + Zepto (operator is signed in to both AND both support add-to-cart). Issue all `<store>.search` tool calls **in the same response** so they execute concurrently:

- `bigbasket.search({ query: "<item>", topN: 6 })`
- `zepto.search({ query: "<item>", topN: 6 })`

Optionally include `blinkit.search` / `swiggy_instamart.search` for price visibility — but those stores DON'T have an `add_to_cart` tool yet (v1 limitation). If the user explicitly asks "all stores" or names blinkit/instamart, include them in the comparison so the user can SEE prices, but warn them ADD will only work on BigBasket and Zepto.

Anthropic Claude / GPT-5 will execute these in parallel since they're in one tool_use response. The runner's slot pool handles the parallelism (RUNNER_SLOT_COUNT=5 supports up to 5 concurrent sites).

**Step 2 — Render results in a SINGLE multi_store_carousel widget.** Use ONE `ask_user` call with `input_type: "multi_store_carousel"`, passing all stores' results in the `stores` array. Each store gets its own collapsible carousel section in the rendered UI.

```json
{
  "input_type": "multi_store_carousel",
  "question": "Comparing amul gold milk across stores",
  "summary": "Cheapest at Zepto · ₹29 · 8 min delivery",
  "stores": [
    {
      "store": "Zepto",
      "icon": "⚡",
      "delivery": "8 min",
      "badge": "🥇 Cheapest",
      "cards": [
        {
          "id": "<zepto product_id>",
          "label": "<product.name>",
          "image": "<product.imageUrl>",
          "url": "<product.url>",
          "subtitle": "₹<product.priceInr> · <product.pack>",
          "badge": "<discountPct >= 5 ? '<discountPct>% off' : ''>"
        }
      ]
    },
    {
      "store": "BigBasket",
      "icon": "🛒",
      "delivery": "scheduled",
      "cards": [
        { "id": "...", "label": "...", "image": "...", "url": "<product.url>", "subtitle": "₹83 · 1 L" }
      ]
    }
  ]
}
```

Sort the `stores` array by cheapest first (lowest priceInr in any of that store's cards). Add `🥇 Cheapest` badge to the first store. Other badge ideas: `⚡ Fastest` (shortest delivery), `🆕 New` if 0% discount, etc.

**Failed store?** If `zepto.search` errored or returned 0 results, INCLUDE its section with `error: "<reason>"` instead of cards. The widget renders an inline notice — better than silently dropping the store.

**Step 3 — User adds items via instant ADD (no agent involvement).** Each tap on a card's ADD button hits a side-channel endpoint (`/api/cart/instant-add`) that calls `<store>.add_to_cart` directly through the task's existing browser session. This means:

- The widget stays visible — the user keeps comparing/adding across stores.
- The agent does NOT see per-add events (no LLM round-trip per click = fast + cheap).
- The user dismisses the widget by typing a follow-up message in the chat textbox (which submits the ask_user with that text as the value).

Your `ask_user(multi_store_carousel)` call will block until the user types something. When you receive a response, treat it as a normal user follow-up — they may ask to compare more items, view a cart, or start checkout.

**Step 4 — On follow-up, react to the user's intent.** Common follow-ups after an `ask_user(multi_store_carousel)` returns:

- `"checkout"` / `"pay"` / `"show my totals"` → call `bigbasket.checkout_summary` and `zepto.checkout_summary` in parallel and report each total separately. Tell the user: "You'll need to pay each store separately — that's how cross-store shopping works in v1."
- `"compare X"` (different item) → re-run Step 1 with the new item.
- `"show my zepto cart"` → call `zepto.get_cart`.
- Anything else → handle as plain conversation.

## When to use which store

| Cue | Default stores |
|---|---|
| User says "compare" / "cheapest" / "best deal" | bigbasket + zepto (both support ADD) |
| User explicitly names stores ("bigbasket vs zepto") | exactly those |
| User says "all stores" or "everywhere" | bigbasket + zepto (ADD-capable) + blinkit + swiggy_instamart (price-only) — warn user ADD works on BB/Zepto only |
| User says "10-min delivery" / "quick" | zepto + blinkit + swiggy_instamart (skip bigbasket scheduled). ADD works on Zepto only — for blinkit/instamart, suggest the user add via that store's app. |

## Sequencing rules

1. **Address first**, exactly once. Don't re-ask if user already confirmed during this task.
2. **Parallel search**, NOT sequential. Issuing `<a>.search` then awaiting then `<b>.search` doubles latency. Issue both in one tool_use response.
3. **Use `multi_store_carousel`** for the results — ONE `ask_user` call with `stores` array. Do NOT issue multiple separate `carousel` calls (they break the comparison UX).
4. **Sort stores in the `stores` array by price**, cheapest first. Add `🥇 Cheapest` badge to the first store.
5. **Don't try to merge identical SKUs across stores** — there's no canonical product ID. Each store's `cards` array shows what THAT store has matching the query.
6. **Failed store = inline section** — if `zepto.search` errors, include `{ store: "Zepto", error: "Couldn't reach Zepto right now", cards: [] }` instead of dropping it.
7. **`place_order` is a STUB** on all sites — never call.

## Domain knowledge

- **Default delivery times:** Zepto/Blinkit/SwiggyInstamart = 8-15 min (quick commerce). BigBasket = scheduled (next 2 hr or next day).
- **Per-pincode variation:** A query that returns 5 milk options in metros may return 0 in Tier-2 cities. Don't assume coverage.
- **Common matches across stores:** Amul Gold, Heritage, Mother Dairy, Nandini, Aavin — major brands appear on all platforms.
- **Niche brands:** A2 organic brands (Akshayakalpa, Pride of Cows) are usually on Zepto/Blinkit only, not BigBasket.

## Suggestion chips after results

After showing comparison results, ALWAYS call `suggest_replies` with action chips:
- `["Show only Zepto", "Sort by delivery time", "Add another item"]`
- After the user taps Done shopping (batch arrives): `["Compare another item", "Show all carts", "Pay BigBasket now", "Pay Zepto now"]`

## Hard rules

- **NEVER skip the address ask** — prices change per pincode.
- **ALWAYS use `multi_store_carousel`** for cross-store results. Never use multiple separate `carousel` calls — that breaks the comparison UX.
- **ALWAYS call site searches in PARALLEL** — concurrent tool_use blocks in one response. Sequential = slow.
- **ALWAYS include `url` on every card** — pass `product.url` from each `<store>.search` result verbatim. Zepto's `add_to_cart` requires it; without it the side-channel ADD will fail.
- **NEVER mix products across stores in the same store section** — each store's products go in its own `stores[].cards` array.
- **NEVER** invent product IDs.
- **NEVER** call `place_order`, `submit_otp`, or `confirm_payment` — they are stubs.
- **ALWAYS** show real prices and product images from each store's search result — do not paraphrase or fabricate.
