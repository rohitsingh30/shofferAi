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
  - blinkit.add_to_cart
  - blinkit.get_cart
  - swiggy_instamart.search
  - swiggy_instamart.add_to_cart
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

**Step 1 — Search ALL chosen stores in PARALLEL.** Default stores: BigBasket + Zepto (operator is signed in to both). Issue all `<store>.search` tool calls **in the same response** so they execute concurrently:

- `bigbasket.search({ query: "<item>", topN: 6 })`
- `zepto.search({ query: "<item>", topN: 6 })`

Anthropic Claude / GPT-5 will execute these in parallel since they're in one tool_use response. The runner's slot pool handles the parallelism (RUNNER_SLOT_COUNT=3 supports up to 3 concurrent sites).

**Step 2 — Render results in a STACKED carousel layout.** For each store, emit a separate `ask_user(carousel, instant_add: true)` widget with that store's products. The user sees one carousel per store, stacked vertically. Each section's question text MUST include the store name + cheapest price + delivery time as a glance summary.

The order of sections should be: cheapest store first → most expensive last. Add a `🥇 Cheapest` badge to the first section's question.

Example: if user says "compare milk options across bigbasket and zepto", issue 2 successive `ask_user` calls (NOT in one layout — keep them as separate carousels):

First carousel (cheapest store):
- input_type: carousel
- question: "🥇 Zepto · 8 min · cheapest at ₹29"
- instant_add: true
- cards: top zepto products

Second carousel (other store):
- input_type: carousel
- question: "🛒 BigBasket · scheduled · from ₹36"
- instant_add: true
- cards: top bigbasket products

**Step 3 — Each ADD goes to that store's cart section.** The cart UI groups items by `store` field, so when user taps ADD on a Zepto card → call `zepto.add_to_cart`; on BigBasket card → call `bigbasket.add_to_cart`. Acknowledge with "Added <product> to your <store> cart".

**Step 4 — Per-store checkout.** When user says "checkout" or "show my totals", call `bigbasket.checkout_summary` and `zepto.checkout_summary` in parallel and report each total separately. Tell the user: "You'll need to pay each store separately — that's how the comparison shopping works in v1."

## When to use which store

| Cue | Default stores |
|---|---|
| User says "compare" / "cheapest" / "best deal" | bigbasket + zepto |
| User explicitly names stores ("bigbasket vs zepto") | exactly those |
| User says "all stores" or "everywhere" | bigbasket + zepto + blinkit + swiggy_instamart |
| User says "10-min delivery" / "quick" | zepto + blinkit + swiggy_instamart (skip bigbasket scheduled) |

## Sequencing rules

1. **Address first**, exactly once. Don't re-ask if user already confirmed during this task.
2. **Parallel search**, NOT sequential. Issuing `<a>.search` then awaiting then `<b>.search` doubles latency. Issue both in one tool_use response.
3. **Sort sections by price**, cheapest first. Add `🥇 Cheapest` badge.
4. **Use `instant_add: true`** on every store's carousel — one-tap to add to that store's cart.
5. **Don't try to merge identical SKUs across stores** — there's no canonical product ID. Show what each store has matching the query.
6. **Failed store = inline notice** — if `zepto.search` errors, render `⚠️ Couldn't reach Zepto — showing only BigBasket` instead of dropping the whole flow.
7. **`place_order` is a STUB** on all sites — never call.

## Domain knowledge

- **Default delivery times:** Zepto/Blinkit/SwiggyInstamart = 8-15 min (quick commerce). BigBasket = scheduled (next 2 hr or next day).
- **Per-pincode variation:** A query that returns 5 milk options in metros may return 0 in Tier-2 cities. Don't assume coverage.
- **Common matches across stores:** Amul Gold, Heritage, Mother Dairy, Nandini, Aavin — major brands appear on all platforms.
- **Niche brands:** A2 organic brands (Akshayakalpa, Pride of Cows) are usually on Zepto/Blinkit only, not BigBasket.

## Suggestion chips after results

After showing comparison results, ALWAYS call `suggest_replies` with action chips:
- `["Show only Zepto", "Sort by delivery time", "Show my BigBasket cart", "Add another item"]`
- After adding to cart: `["Compare another item", "Show all carts", "Pay BigBasket now"]`

## Hard rules

- **NEVER skip the address ask** — prices change per pincode.
- **ALWAYS call site searches in PARALLEL** — concurrent tool_use blocks in one response. Sequential = slow.
- **NEVER mix products across stores in the same carousel** — each store gets its own carousel section so the user knows which store each card belongs to.
- **NEVER** invent product IDs.
- **NEVER** call `place_order`, `submit_otp`, or `confirm_payment` — they are stubs.
- **ALWAYS** show real prices and product images from each store's search result — do not paraphrase or fabricate.
