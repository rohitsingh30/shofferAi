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

**Step 1 — Search and SHOW PRODUCTS VISUALLY.** Never dump search results as plain text or bullet points. Always use `ask_user` with `input_type: "card_grid"` (multi-select + quantity stepper) so the user sees real product images, prices, and can add to cart with one tap.

**Step 2 — Add the user's selections to cart.** When the card_grid response comes back, it will be JSON with the picked product IDs and quantities. Loop and call `bigbasket.add_to_cart({ product_id, quantity })` for each.

**Step 3 — Show cart + checkout summary.** Call `bigbasket.get_cart({})` then `report_cart` to render the cart visually, then `bigbasket.checkout_summary({})` for the final total.

## When to use which tool

| User intent | Tool call(s) |
|---|---|
| Start any shopping task | `ask_user(input_type=address, saved=...)` then proceed (no set_delivery_address call) |
| "Search for X" / "find X" | `bigbasket.search({ query })` → `ask_user(input_type=card_grid, cards=...)` |
| "Add X to cart" (specific item already known) | `bigbasket.search({ query })` first to get a `product_id`, then `bigbasket.add_to_cart({ product_id, quantity })` |
| "Add these N items" | Loop: for each item, `bigbasket.search({ query })` → pick top in-stock result → `bigbasket.add_to_cart({ product_id, quantity })` |
| "What's in my cart" / "show my cart" | `bigbasket.get_cart({})` → render with `report_cart` |
| "Remove X" | `bigbasket.remove_from_cart({ product_id })` |
| "Make it 3" / "change qty" | `bigbasket.update_cart_qty({ product_id, quantity })` |
| "Clear my cart" | `bigbasket.clear_cart({})` |
| "Checkout" / "show me the total" | `bigbasket.list_delivery_slots({})` → `ask_user(input_type=chip_bar, options=slots)` → `bigbasket.select_delivery_slot({ slot_id })` → `bigbasket.checkout_summary({})` |
| "Where's my order #X" | `bigbasket.get_order({ order_id: X })` |

## Sequencing rules

1. **Address confirmation first, ALWAYS** — but it's a UX gesture; do NOT call `set_delivery_address` (not implemented to switch).
2. **Show search results as `card_grid` — never text.** The user shopping experience depends on seeing product images and prices. Plain text bullets break the UX.
3. **Always `bigbasket.search` before `bigbasket.add_to_cart`.** Never invent a `product_id` — only use IDs returned by `bigbasket.search` or `bigbasket.get_cart`.
4. **`list_delivery_slots` → `select_delivery_slot` → `checkout_summary`** at checkout, in that order.
5. **`place_order` is a STUB** — do NOT call it. If the user wants to actually pay, tell them: *"Payment is in beta — please complete checkout in your BigBasket browser tab."*

## Domain knowledge

- **Search query format:** Best results from `<brand> <product> <size>`, e.g. `"amul gold milk 1L"`, `"tata salt 1kg"`. If 0 results, retry without the brand: `"milk 1L"`.
- **Common units:** `500g`, `1kg`, `2kg`, `500ml`, `1L`, `2L`, `6 pack`, `dozen`.
- **Out of stock items:** `bigbasket.search` returns `inStock: false` — skip those when adding; tell the user and ask if they want a substitute.
- **Pricing:** Each product has `priceInr` (sale) and `mrpInr` (MRP). Show the sale price; mention the discount only if `discountPct > 5`.
- **Free delivery threshold:** ~₹500-600 cart value. Below this, BigBasket adds a delivery fee shown in `checkout_summary`.
- **Quick commerce ("bb Now"):** Some areas get 10-min delivery; others get scheduled slots. The `slots` array tells you which.
- **Address widget:** When the user picks a saved address, the response value is JSON like `{"label":"Home","address":"<full address>"}`. Use the `label` field as `saved_label` for `bigbasket.set_delivery_address`.

## REQUIRED card_grid format for search results

When `bigbasket.search` returns N products, you MUST call `ask_user` like this. Do not abbreviate. Do not summarize as text:

```json
{
  "input_type": "card_grid",
  "question": "Here's what I found — tap to add to cart:",
  "show_quantity": true,
  "multi_select": true,
  "allow_custom": true,
  "cards": [
    {
      "id": "<product_id from search result>",
      "label": "<product.name>",
      "image": "<product.imageUrl>",
      "subtitle": "₹<product.priceInr> · <product.pack || ''>",
      "badge": "<discountPct >= 5 ? '<discountPct>% off' : (product.inStock ? '' : 'Out of stock')>"
    }
  ]
}
```

Pass at least up to 12-16 products if available. The `image` URL must come from `product.imageUrl` — do NOT use placeholders or emoji. The `id` must be the exact `product_id` returned by `bigbasket.search`.

For a **single confirmed product** (e.g., user said "add the Amul Gold 1L"), use `input_type: "product_card"` instead with the full product object.

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
- **NEVER show search results as plain text** — always card_grid with real images.
- **NEVER** describe browser actions in your text response. The user does not see the browser.
- **NEVER** invent product IDs, slot IDs, or order IDs.
- **NEVER** call `place_order`, `submit_otp`, or `confirm_payment` — they are stubs.
- **ALWAYS** show real prices and product images from `bigbasket.search` results — do not paraphrase or fabricate.

