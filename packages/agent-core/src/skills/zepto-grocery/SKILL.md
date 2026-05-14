---
name: zepto-grocery
description: Order groceries from Zepto with 10-15 minute quick-commerce delivery — search the catalog at the user's pincode, show products visually, add to cart, view cart. Use this when the user wants to shop on Zepto for fast delivery.
triggers:
  - zepto
  - zeptonow
  - order from zepto
  - zepto grocery
  - order on zepto
  - zepto delivery
  - quick grocery zepto
  - groceries from zepto
  - buy from zepto
  - zepto order
  - 10 minute grocery
  - 10 min delivery grocery
  - instant grocery delivery
  - order vegetables on zepto
  - zepto fruits
  - zepto snacks
  - milk on zepto
  - bread on zepto
allowed-tools:
  - zepto.search
  - zepto.add_to_cart
  - zepto.get_cart
  - zepto.whoami
siteUrl: https://www.zeptonow.com
requiresAuth: true
params:
  - name: items
    required: false
    hint: List of items the user wants (e.g. "amul milk 500ml, brown bread, eggs")
  - name: address
    required: true
    hint: Delivery address — Zepto's prices and serviceability vary heavily by pincode (10-min coverage is metro-only)
---

# Zepto Grocery — Tool Map

Drive Zepto directly via the MCP tools listed above. **Do NOT describe browser actions ("click search bar", "take snapshot") — the tools handle all UI interaction.** A signed-in browser session is opened for you automatically; you only call the verbs.

## MANDATORY FLOW (every shopping task starts here)

**Step 0 — Always confirm delivery address FIRST.** Zepto only operates in metros and select Tier-2 cities; even within a covered city, prices and product availability change per pincode. ALWAYS ask before searching:

```json
{
  "input_type": "address",
  "question": "Which address should I use for Zepto delivery?",
  "saved": "<pass the user's savedAddresses array from USER CONTEXT verbatim>"
}
```

Wait for the user's response. The operator's Zepto session already has a default address — just acknowledge the user's pick (e.g. *"Got it — delivering to Home. Finding milk on Zepto..."*) and proceed.

**Skip Step 0 ONLY if** the user has **zero** saved addresses — then proceed without asking.

**Step 1 — Search and SHOW PRODUCTS VISUALLY in a CAROUSEL.** Never dump search results as plain text or bullet points. Use `ask_user` with `input_type: "carousel"` and `instant_add: true`. Pull at least **12 results** (`topN: 12`) so the carousel feels rich.

**Step 2 — On per-card ADD, call `zepto.add_to_cart({ product_id, product_url, quantity })`.** The carousel response will be a JSON array `[{"id": "<uuid>", "qty": 1}]` per ADD tap. **`product_url` is REQUIRED** — pass `product.url` from the search result verbatim, otherwise add_to_cart will fail.

**Step 3 — Show cart on demand.** When user asks "what's in my cart" / "show cart", call `zepto.get_cart({})` and render with `report_cart`.

## When to use which tool

| User intent | Tool call(s) |
|---|---|
| Start any Zepto shopping | `ask_user(input_type=address, saved=...)` |
| "Search for X on Zepto" | `zepto.search({ query, topN: 12 })` → `ask_user(input_type=carousel, instant_add=true, cards=...)` |
| "Add the Amul Gold to Zepto cart" (specific) | `zepto.search({ query: "amul gold milk" })` → pick id+url → `zepto.add_to_cart({ product_id, product_url, quantity })` |
| "What's in my Zepto cart" | `zepto.get_cart({})` → `report_cart` |
| "Am I signed in to Zepto?" | `zepto.whoami({})` |
| "Checkout my Zepto cart" | `zepto.get_cart({})` then tell the user to complete payment in their Zepto browser tab — there's no `place_order` tool. |

## Sequencing rules

1. **Address first**, exactly once. Don't re-ask if the user already confirmed.
2. **Search responses MUST go in a carousel** — never text bullets. The shopping experience depends on real images.
3. **Pull at least 12 results** (`zepto.search({ query, topN: 12 })`). If <3 in-stock results, retry once with a broader query (drop the brand).
4. **`product_url` is REQUIRED on `zepto.add_to_cart`** — never call it with just `product_id`. Always pass both, taking values verbatim from the search result.
5. **NEVER invent product_ids or urls** — only use values returned by `zepto.search` or `zepto.get_cart`.
6. **Same item ADD again = increment qty** — `zepto.add_to_cart` is idempotent on retry; the runner detects an existing cart line and clicks the `+` stepper.

## Domain knowledge

- **Search query format:** Best results from `<brand> <product> <size>`, e.g. `"amul gold milk 500 ml"`, `"britannia bread"`. If 0 results, retry without the brand.
- **Out of stock items:** `zepto.search` returns `inStock: false` — skip those when adding; tell the user and ask if they want a substitute.
- **Pricing:** Each product has `priceInr` (sale) and optional `mrpInr` (MRP) and `discountPct`. Show sale price; mention discount only if `discountPct >= 5`.
- **Delivery:** Zepto delivers in 6-15 min in covered metros. Outside coverage, the search returns 0 products.
- **Common units:** `500g`, `1kg`, `500ml`, `1L`, `pack of N`.
- **Product IDs are UUIDs** (e.g. `f1b6a9b3-89d9-54e1-9d16-004ac839a8f7`) — pass them back unchanged to `add_to_cart`.

## REQUIRED carousel format for search results

```json
{
  "input_type": "carousel",
  "question": "Here are the top Zepto results — tap ADD on any card:",
  "instant_add": true,
  "cards": [
    {
      "id": "<product.product_id>",
      "label": "<product.name>",
      "image": "<product.imageUrl>",
      "url": "<product.url>",
      "subtitle": "₹<product.priceInr> · <product.pack || ''>",
      "badge": "<discountPct >= 5 ? '<discountPct>% off' : (product.inStock === false ? 'Out of stock' : (product.rating ? '⭐ <product.rating>' : ''))>"
    }
  ]
}
```

**When `instant_add: true` is set:** the response value is `[{"id": "<uuid>", "qty": 1}]`. For each entry, immediately call `zepto.add_to_cart({ product_id: id, product_url: <the url from your card>, quantity: qty })`. After adding, give a one-line acknowledgement and call `suggest_replies`.

## Error recovery

| Error | What to do |
|---|---|
| `signedIn: false` from any tool | Tell user: "Your Zepto session expired — please refresh your Chrome tab and re-login." Don't loop. |
| `product_not_in_search` from add_to_cart | Re-search with the EXACT query the user used; pass the new `product_id` + `product_url` from that search. |
| `add_button_not_found` | The product is out of stock OR Zepto isn't serviceable from the operator's address. Tell the user and suggest an alternative. |
| `Unsupported store` / 0 results | Zepto doesn't deliver to that pincode — tell the user and suggest `cross-store-grocery` to compare on stores that DO deliver. |
| Tool times out (>30s) | Tell user "Zepto is slow right now" and offer to retry once. Don't auto-retry more than once. |

## Hard rules

- **NEVER skip the address ask** — Zepto's coverage and prices depend on pincode.
- **NEVER show search results as plain text** — always carousel with real images.
- **ALWAYS pass `topN: 12`** to `zepto.search` (or higher) so the carousel has enough options.
- **ALWAYS pass `instant_add: true`** on search-result carousels.
- **ALWAYS pass `product_url`** on every `zepto.add_to_cart` call — it's required by Zepto's PDP-driven add flow.
- **ALWAYS call `suggest_replies`** after meaningful responses. Examples after ADD: `["Show my Zepto cart", "Add more items", "Compare prices on BigBasket"]`. After search results: `["Show only ₹50 and under", "Add brown bread too", "Show my cart"]`.
- **NEVER** describe browser actions in your text response. The user does not see the browser.
- **NEVER** invent product_ids or urls.
- **NEVER** call `place_order`, `submit_otp`, or `confirm_payment` — they don't exist on Zepto.
- **ALWAYS** show real prices and product images from `zepto.search` results — do not paraphrase or fabricate.
