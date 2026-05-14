---
name: blinkit-grocery
description: Browse Blinkit's catalog with 10-minute quick-commerce delivery — search products, view prices, view cart. Note: add-to-cart on Blinkit is not yet wired (search & cart-view only); use cross-store-grocery if the user wants to add items.
triggers:
  - blinkit
  - grofers
  - order from blinkit
  - blinkit order
  - blinkit delivery
  - blinkit grocery
  - quick grocery blinkit
  - groceries from blinkit
  - 10 minute grocery
  - blinkit fruits
  - blinkit snacks
  - milk on blinkit
  - bread on blinkit
allowed-tools:
  - blinkit.search
  - blinkit.get_cart
  - blinkit.whoami
siteUrl: https://www.blinkit.com
requiresAuth: true
params:
  - name: items
    required: false
    hint: List of items to look up on Blinkit (e.g. "amul milk, bread, eggs")
  - name: address
    required: true
    hint: Delivery address — Blinkit's prices and serviceability vary heavily by pincode
---

# Blinkit Grocery — Tool Map

Drive Blinkit directly via the MCP tools listed above. **Do NOT describe browser actions ("click search", "take snapshot") — the tools handle all UI interaction.** A signed-in browser session is opened for you automatically.

**IMPORTANT v1 LIMITATION:** Blinkit's `add_to_cart` is NOT yet implemented. You can `search`, you can `get_cart`, but you cannot add items via this skill. If the user wants to actually add items to a Blinkit cart in v1, tell them to do it in the Blinkit app, OR use `cross-store-grocery` which surfaces Blinkit alongside other stores (Blinkit cards in that flow show prices but the ADD button will route to a store that supports add-to-cart).

## MANDATORY FLOW

**Step 0 — Always confirm delivery address FIRST.** Blinkit only operates in metros and select Tier-2 cities; even within a covered area, prices change per pincode:

```json
{
  "input_type": "address",
  "question": "Which address should I use to check Blinkit prices?",
  "saved": "<pass the user's savedAddresses array from USER CONTEXT verbatim>"
}
```

**Step 1 — Search and SHOW PRODUCTS VISUALLY in a CAROUSEL.** Pull at least **12 results** (`topN: 12`).

**Step 2 — For ADD requests, gracefully decline.** When the user taps a card or asks to add, respond: *"Blinkit add-to-cart isn't wired up yet — but I can show you the same items on Zepto / BigBasket where ADD does work. Want me to compare?"* Then offer `suggest_replies` like `["Compare on Zepto", "Compare on BigBasket", "Show me more options"]`.

**Step 3 — `get_cart` for visibility only.** If the user already has items in their Blinkit app cart from prior browsing, `blinkit.get_cart({})` will return them. Render with `report_cart` so they can see the existing state.

## When to use which tool

| User intent | Tool call(s) |
|---|---|
| "Search for X on Blinkit" | `blinkit.search({ query, topN: 12 })` → `ask_user(input_type=carousel, instant_add=false, cards=...)` |
| "What's in my Blinkit cart" | `blinkit.get_cart({})` → `report_cart` |
| "Add X to Blinkit cart" | Decline, suggest cross-store. (No add_to_cart tool yet.) |
| "Am I signed in to Blinkit?" | `blinkit.whoami({})` |

## Sequencing rules

1. **Address first**, exactly once.
2. **Search responses MUST go in a carousel** with real images.
3. **Pull at least 12 results** (`topN: 12`).
4. **DO NOT use `instant_add: true`** on Blinkit carousels — there's no add_to_cart tool to call. Use plain carousel selection (or just informational display).
5. **Express delivery indicator:** Search results include `merchant_type` — `"express"` means ~10 min delivery; otherwise scheduled.

## Domain knowledge

- **Search query format:** `<brand> <product> <size>`. If 0 results, retry without the brand.
- **Product IDs are numeric strings** (e.g. `572383`).
- **Pricing fields:** `priceInr`, `mrpInr?`, `discountPct?`. Show sale price; mention discount if `>=5`.
- **Delivery time:** Express stores deliver in ~10 min; scheduled in 15-45 min depending on slot.

## REQUIRED carousel format for search results

```json
{
  "input_type": "carousel",
  "question": "Here are the top Blinkit results (view-only — Blinkit ADD is not wired in v1):",
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

- **NEVER skip the address ask** — Blinkit's coverage varies sharply.
- **NEVER claim ADD works on Blinkit** — it doesn't yet. Always redirect to cross-store or another supported store.
- **NEVER show search results as plain text** — always carousel.
- **ALWAYS call `suggest_replies`** after meaningful responses, biased toward "compare on X" since that's where the user can actually transact.
- **NEVER** describe browser actions in your text response.
- **NEVER** invent product_ids.
- **ALWAYS** show real prices and product images from `blinkit.search` results.
