---
name: bigbasket-grocery
description: Order groceries from BigBasket — search the catalog, add items to cart, and review the checkout total. Use this when the user wants to shop on BigBasket (grocery / household / fresh produce).
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
    required: false
    hint: Delivery address — usually pre-set on the operator's account; only ask if BigBasket complains
---

# BigBasket Grocery — Tool Map

Drive BigBasket directly via the MCP tools listed above. **Do NOT describe browser actions ("click button", "take snapshot") — the tools handle all UI interaction.** A signed-in browser session is opened for you automatically; you only call the verbs.

## When to use which tool

| User intent | Tool call(s) |
|---|---|
| "Search for X" / "find X on bigbasket" | `bigbasket.search({ query })` → render results to user with `ask_user(input_type=card_grid)` so they can pick + set quantity |
| "Add X to cart" (specific item already known) | `bigbasket.search({ query })` first to get a `product_id`, then `bigbasket.add_to_cart({ product_id, quantity })` |
| "Add these N items" | Loop: for each item, `bigbasket.search({ query })` → pick top in-stock result → `bigbasket.add_to_cart({ product_id, quantity })` |
| "What's in my cart" / "show my cart" | `bigbasket.get_cart({})` → render with `report_cart` |
| "Remove X" / "I don't want X" | `bigbasket.remove_from_cart({ product_id })` |
| "Make it 3" / "change qty" | `bigbasket.update_cart_qty({ product_id, quantity })` |
| "Clear my cart" / "start over" | `bigbasket.clear_cart({})` |
| "Show me the total" / "checkout" | `bigbasket.list_delivery_slots({})` → ask user to pick → `bigbasket.select_delivery_slot({ slot_id })` → `bigbasket.checkout_summary({})` |
| "Where's my order" | `bigbasket.get_order({ order_id })` |

## Sequencing rules

1. **Always `search` before `add_to_cart`.** Never invent a `product_id` — only use IDs returned by `bigbasket.search` or `bigbasket.get_cart`.
2. **Address is usually already set** on the operator's account. Skip `set_delivery_address` unless `checkout_summary` returns an error about missing address.
3. **`list_delivery_slots` → `select_delivery_slot` → `checkout_summary`** — call all three at checkout time, in that order.
4. **`place_order` is a STUB** — do NOT call it. If the user wants to actually pay, tell them: *"Payment is in beta — please complete checkout in your BigBasket browser tab."*

## Domain knowledge

- **Search query format:** Best results from `<brand> <product> <size>`, e.g. `"amul gold milk 1L"`, `"tata salt 1kg"`. If 0 results, retry without the brand: `"milk 1L"`.
- **Common units:** `500g`, `1kg`, `2kg`, `500ml`, `1L`, `2L`, `6 pack`, `dozen`.
- **Out of stock items:** `bigbasket.search` returns `inStock: false` — skip those when adding; tell the user and ask if they want a substitute.
- **Pricing:** Each product has `priceInr` (sale) and `mrpInr` (MRP). Show the sale price; mention the discount only if `discountPct > 5`.
- **Free delivery threshold:** ~₹500-600 cart value. Below this, BigBasket adds a delivery fee shown in `checkout_summary`.
- **Quick commerce ("bb Now"):** Some areas get 10-min delivery; others get scheduled slots. The `slots` array tells you which.

## Showing results to the user

When `bigbasket.search` returns products, use `ask_user` with `input_type: card_grid`:
```json
{
  "input_type": "card_grid",
  "question": "Here's what I found — tap to add to cart:",
  "show_quantity": true,
  "multi_select": true,
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

For a single confirmed product, use `input_type: product_card` instead.

## Error recovery

| Error returned by a tool | What to do |
|---|---|
| `signedIn: false` from any tool | Tell user: "Your BigBasket session expired — please refresh your Chrome tab and re-login." Do NOT loop trying. |
| `product not found` from add_to_cart | Re-search with a broader query, or tell the user "couldn't find that on BigBasket" and ask for an alternative. |
| `out of stock` | Tell the user the item is unavailable and suggest a substitute (search again with brand stripped). |
| `address not set` from checkout_summary | Call `set_delivery_address({ saved_label: "Home" })`. If that fails, ask the user to set their address in BigBasket directly. |
| Tool times out (>30s) | Tell user "BigBasket is slow right now" and offer to retry once. Don't auto-retry more than once. |

## Hard rules

- **Never** describe browser actions in your text response. The user does not see the browser.
- **Never** invent product IDs, slot IDs, or order IDs.
- **Never** call `place_order`, `submit_otp`, or `confirm_payment` — they are stubs.
- **Always** show real prices and product images from `bigbasket.search` results — do not paraphrase or fabricate.
