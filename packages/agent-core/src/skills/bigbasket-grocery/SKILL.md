---
name: bigbasket-grocery
description: Order groceries from BigBasket — search the catalog at the user's pincode, show products visually, add to cart, and review the checkout total. Use this when the user wants to shop on BigBasket (grocery / household / fresh produce).
triggers:
  - bigbasket
  - big basket
  - bb grocery
  - order from bigbasket
  - bigbasket order
  - buy groceries from bigbasket
  - get groceries on bigbasket
  - bigbasket delivery
  - order vegetables from bigbasket
  - bigbasket fruits and veggies
  - grocery delivery bigbasket
  - need things from bigbasket
allowed-tools:
  - bigbasket.search
  - bigbasket.get_product
  - bigbasket.add_to_cart
  - bigbasket.update_cart_qty
  - bigbasket.remove_from_cart
  - bigbasket.clear_cart
  - bigbasket.get_cart
  - bigbasket.list_delivery_slots
  - bigbasket.select_delivery_slot
  - bigbasket.checkout_summary
  - bigbasket.set_delivery_address
  - bigbasket.whoami
  - bigbasket.get_order
siteUrl: https://www.bigbasket.com
requiresAuth: true
params:
  - name: items
    required: false
    hint: List of items the user wants (e.g. "amul gold milk 1L, tata salt 1kg") — optional, you can search interactively if vague
  - name: address
    required: true
    hint: Delivery address — prices and availability vary by pincode, so always confirm with the user before searching
---

# BigBasket Grocery — Tool Map

Drive BigBasket directly via the MCP tools listed above. **Do NOT describe browser actions ("click button", "take snapshot") — the tools handle all UI interaction.** A signed-in browser session is opened for you automatically; you only call the verbs.

## MANDATORY FLOW (every shopping task starts here)

**Step 0 — Always confirm delivery address FIRST.** Prices, availability, and delivery options (10-min "bb Now" vs scheduled) all depend on the pincode. Even if the user mentioned a city, you still need to confirm exact saved address.

```json
{
  "input_type": "address",
  "question": "Which address should I deliver to?",
  "saved": "<pass the user's savedAddresses array from USER CONTEXT verbatim>"
}
```

Wait for the user's response. **Do NOT call `bigbasket.set_delivery_address`** — it's not yet implemented to switch addresses; it would fail. The operator's BigBasket session already has a default address set, and search/checkout will use that. Just acknowledge the user's selection in your next response (e.g. *"Got it — delivering to Home. Finding milk..."*) and go straight to Step 1.

**Skip Step 0 ONLY if** the user has **zero** saved addresses — then proceed without asking.

**Step 1 — Search and SHOW PRODUCTS VISUALLY in a CAROUSEL.** Never dump search results as plain text or bullet points. Always use `ask_user` with `input_type: "carousel"` so the user sees real product images, prices, and can swipe through results. Pull at least **12 results** (`topN: 12`) so the carousel feels rich — even if the user said "top 3", give them more to pick from.

**Step 2 — When the user picks one or more from the carousel,** call `bigbasket.add_to_cart({ product_id, quantity })` for each selection. (For multi-item grocery shopping where the user wants to bulk-pick with quantity steppers, use `card_grid` instead — see below.)

**Step 3 — Show cart + checkout summary.** Call `bigbasket.get_cart({})` then `report_cart` to render the cart visually, then `bigbasket.checkout_summary({})` for the final total.

## When to use which tool

| User intent | Tool call(s) |
|---|---|
| Start any shopping task | `ask_user(input_type=address, saved=...)` then proceed (no set_delivery_address call) |
| "Search for X" / "find X" / "show me X options" | `bigbasket.search({ query, topN: 12 })` → `ask_user(input_type=carousel, cards=...)` |
| "Add these N grocery items" (bulk shopping) | For each item: `bigbasket.search({ query, topN: 6 })` → `ask_user(input_type=card_grid, cards=..., show_quantity=true, multi_select=true)` |
| "Add the 1L Amul Gold to my cart" (specific) | `bigbasket.search({ query: "amul gold 1L" })` → `bigbasket.add_to_cart({ product_id, quantity })` |
| "What's in my cart" | `bigbasket.get_cart({})` → render with `report_cart` |
| "Remove X" | `bigbasket.remove_from_cart({ product_id })` |
| "Make it 3" / "change qty" | `bigbasket.update_cart_qty({ product_id, quantity })` |
| "Clear my cart" | `bigbasket.clear_cart({})` |
| "Checkout" | `bigbasket.list_delivery_slots({})` → `ask_user(input_type=chip_bar, options=slots)` → `bigbasket.select_delivery_slot({ slot_id })` → `bigbasket.checkout_summary({})` |
| "Where's my order #X" | `bigbasket.get_order({ order_id: X })` |

## Sequencing rules

1. **Address confirmation first, ALWAYS** — but it's a UX gesture; do NOT call `set_delivery_address` (not implemented to switch).
2. **Search responses MUST go in a carousel** — never text bullets. The user shopping experience depends on seeing product images, prices, and swiping through options.
3. **Pull at least 12 results** (`bigbasket.search({ query, topN: 12 })`). If the user asked for "top 3", show 12 in the carousel and let THEM pick the top 3 — they need options to compare. If `bigbasket.search` returns fewer than 3 in-stock results, retry once with a broader query (drop the brand).
4. **Use `carousel` for "show me options to pick from"; use `card_grid` only for bulk multi-item grocery shopping** with quantity steppers (e.g. "add milk, butter, dal, oil to my cart").
5. **Always `bigbasket.search` before `bigbasket.add_to_cart`.** Never invent a `product_id` — only use IDs returned by `bigbasket.search` or `bigbasket.get_cart`.
6. **`list_delivery_slots` → `select_delivery_slot` → `checkout_summary`** at checkout, in that order.
7. **`place_order` is a STUB** — do NOT call it. If the user wants to actually pay, tell them: *"Payment is in beta — please complete checkout in your BigBasket browser tab."*

## Domain knowledge

- **Search query format:** Best results from `<brand> <product> <size>`, e.g. `"amul gold milk 1L"`, `"tata salt 1kg"`. If 0 results, retry without the brand: `"milk 1L"`.
- **Common units:** `500g`, `1kg`, `2kg`, `500ml`, `1L`, `2L`, `6 pack`, `dozen`.
- **Out of stock items:** `bigbasket.search` returns `inStock: false` — skip those when adding; tell the user and ask if they want a substitute.
- **Pricing:** Each product has `priceInr` (sale) and `mrpInr` (MRP). Show the sale price; mention the discount only if `discountPct > 5`.
- **Free delivery threshold:** ~₹500-600 cart value. Below this, BigBasket adds a delivery fee shown in `checkout_summary`.
- **Quick commerce ("bb Now"):** Some areas get 10-min delivery; others get scheduled slots. The `slots` array tells you which.
- **Address widget:** When the user picks a saved address, the response value is JSON like `{"label":"Home","address":"<full address>"}`. Use the `label` field as `saved_label` for `bigbasket.set_delivery_address`.

## REQUIRED carousel format for search results (single-pick from many)

When the user is browsing options (e.g. "show me milk"), use `ask_user` with `input_type: "carousel"`. Always pass at least 12 cards so the carousel feels full and the user has real options:

```json
{
  "input_type": "carousel",
  "question": "Here are the top BigBasket results — swipe to browse, tap to add:",
  "cards": [
    {
      "id": "<product_id from search result>",
      "label": "<product.name>",
      "image": "<product.imageUrl>",
      "subtitle": "₹<product.priceInr> · <product.pack || ''>",
      "badge": "<discountPct >= 5 ? '<discountPct>% off' : (product.inStock === false ? 'Out of stock' : '⭐ <product.rating>')>"
    }
  ]
}
```

## REQUIRED card_grid format for bulk grocery shopping (multi-pick with qty steppers)

Only use this when the user is bulk-shopping for multiple items at once (e.g. "add milk, eggs, bread, butter to my cart"). For a single search query like "show me milk options", use carousel above instead.

```json
{
  "input_type": "card_grid",
  "question": "Tap items to add — adjust quantity with +/-:",
  "show_quantity": true,
  "multi_select": true,
  "allow_custom": true,
  "cards": [
    {
      "id": "<product_id>",
      "label": "<product.name>",
      "image": "<product.imageUrl>",
      "subtitle": "₹<product.priceInr> · <product.pack>",
      "badge": "<discountPct>% off"
    }
  ]
}
```

In both cases: the `image` URL must come from `product.imageUrl` — do NOT use placeholders or emoji. The `id` must be the exact `product_id` returned by `bigbasket.search`.

For a **single confirmed product** (user already picked one), use `input_type: "product_card"` with the full product object.

## Error recovery

| Error returned by a tool | What to do |
|---|---|
| `signedIn: false` from any tool | Tell user: "Your BigBasket session expired — please refresh your Chrome tab and re-login." Do NOT loop trying. |
| `product not found` from add_to_cart | Re-search with a broader query, or tell the user "couldn't find that on BigBasket" and ask for an alternative. |
| `out of stock` | Tell the user the item is unavailable and suggest a substitute (search again with brand stripped). |
| `address not set` from any tool | Go back to Step 0 — ask the user for address with the address widget. |
| Tool times out (>30s) | Tell user "BigBasket is slow right now" and offer to retry once. Don't auto-retry more than once. |

## Hard rules

- **NEVER skip the address ask** — even if the operator's account has a default. Prices change per pincode.
- **NEVER show search results as plain text** — always carousel (or card_grid for bulk shopping) with real images.
- **ALWAYS pass `topN: 12`** to `bigbasket.search` (or higher) so the carousel has enough options. If <3 in-stock results, retry once with a broader query.
- **NEVER** describe browser actions in your text response. The user does not see the browser.
- **NEVER** invent product IDs, slot IDs, or order IDs.
- **NEVER** call `place_order`, `submit_otp`, or `confirm_payment` — they are stubs.
- **ALWAYS** show real prices and product images from `bigbasket.search` results — do not paraphrase or fabricate.

