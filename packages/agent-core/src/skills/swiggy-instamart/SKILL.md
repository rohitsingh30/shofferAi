---
name: swiggy-instamart
description: Browse Swiggy Instamart's catalog with 15-30 minute delivery — search products, view prices, view cart. Note: add-to-cart on Instamart is not yet wired (search & cart-view only); use cross-store-grocery if the user wants to add items.
triggers:
  - swiggy instamart
  - instamart
  - swiggy grocery
  - order from instamart
  - order from swiggy instamart
  - instamart delivery
  - quick grocery instamart
  - groceries from instamart
  - 15 minute grocery
  - milk on instamart
  - bread on instamart
  - swiggy mart
allowed-tools:
  - swiggy_instamart.search
  - swiggy_instamart.get_cart
  - swiggy_instamart.whoami
siteUrl: https://www.swiggy.com/instamart
requiresAuth: true
params:
  - name: items
    required: false
    hint: List of items to look up on Instamart (e.g. "amul milk, eggs, dal")
  - name: address
    required: true
    hint: Delivery address — Instamart's prices and serviceability vary by pincode (metro-only)
---

# Swiggy Instamart — Tool Map

Drive Instamart directly via the MCP tools listed above. **Do NOT describe browser actions ("click search", "take snapshot") — the tools handle all UI interaction.** A signed-in browser session is opened for you automatically.

**IMPORTANT v1 LIMITATION:** Instamart's `add_to_cart` is NOT yet implemented. You can `search`, you can `get_cart`, but you cannot add items via this skill. If the user wants to actually add items in v1, redirect them to the Swiggy app, OR use `cross-store-grocery` to compare on stores that DO support add (BigBasket, Zepto).

## MANDATORY FLOW

**Step 0 — Always confirm delivery address FIRST.** Instamart only operates in metros and select Tier-2 cities; prices change per pincode:

```json
{
  "input_type": "address",
  "question": "Which address should I use to check Instamart prices?",
  "saved": "<pass the user's savedAddresses array from USER CONTEXT verbatim>"
}
```

**Step 1 — Search and SHOW PRODUCTS VISUALLY in a CAROUSEL.** Pull at least **12 results** (`topN: 12`).

**Step 2 — For ADD requests, gracefully decline.** When the user taps a card or asks to add, respond: *"Instamart add-to-cart isn't wired up yet — but I can compare the same items on Zepto / BigBasket where ADD does work. Want me to compare?"* Offer `suggest_replies` like `["Compare on Zepto", "Compare on BigBasket", "Show me more options"]`.

**Step 3 — `get_cart` for visibility only.** If the user has items in their Instamart cart from prior browsing, `swiggy_instamart.get_cart({})` returns them. Render with `report_cart`.

> NOTE: Instamart's cart is partly client-side; the operator's mobile-app cart and the runner-Chrome cart may diverge. Trust `swiggy_instamart.get_cart`'s view, not what the user describes from their phone.

## When to use which tool

| User intent | Tool call(s) |
|---|---|
| "Search for X on Instamart" | `swiggy_instamart.search({ query, topN: 12 })` → `ask_user(input_type=carousel, instant_add=false, cards=...)` |
| "What's in my Instamart cart" | `swiggy_instamart.get_cart({})` → `report_cart` |
| "Add X to Instamart cart" | Decline, suggest cross-store. (No add_to_cart tool yet.) |
| "Am I signed in to Instamart?" | `swiggy_instamart.whoami({})` |

## Sequencing rules

1. **Address first**, exactly once.
2. **Search responses MUST go in a carousel** with real images.
3. **Pull at least 12 results** (`topN: 12`).
4. **DO NOT use `instant_add: true`** — there's no add_to_cart to call.
5. **Express delivery indicator:** Each result has `deliveryEta` (e.g. `"15 mins"`).

## Domain knowledge

- **Search query format:** `<brand> <product> <size>`. If 0 results, retry without the brand.
- **Product IDs are 10-character SKU strings** (e.g. `C7KIUHOLTU`).
- **Pricing fields:** `priceInr`, `mrpInr?`, `discountPct?`. Show sale price; mention discount if `>=5`.
- **Delivery time:** Express ~10-30 min in metros; longer outside. `deliveryEta` in each card has the value.

## REQUIRED carousel format for search results

```json
{
  "input_type": "carousel",
  "question": "Here are the top Instamart results (view-only — Instamart ADD is not wired in v1):",
  "cards": [
    {
      "id": "<product.product_id>",
      "label": "<product.name>",
      "image": "<product.imageUrl>",
      "url": "<product.url>",
      "subtitle": "₹<product.priceInr> · <product.pack || ''>",
      "badge": "<discountPct >= 5 ? '<discountPct>% off' : ''>"
    }
  ]
}
```

## Hard rules

- **NEVER skip the address ask** — Instamart coverage varies sharply.
- **NEVER claim ADD works on Instamart** — it doesn't yet. Always redirect to cross-store or another supported store.
- **NEVER show search results as plain text** — always carousel.
- **ALWAYS call `suggest_replies`** after meaningful responses, biased toward "compare on X" since the user can actually transact there.
- **NEVER** describe browser actions in your text response.
- **NEVER** invent product_ids.
- **ALWAYS** show real prices and product images from `swiggy_instamart.search` results.
