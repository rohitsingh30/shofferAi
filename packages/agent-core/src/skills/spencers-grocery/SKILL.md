---
name: spencers-grocery
description: Order groceries from Spencer's Retail online — browse products, add to cart, schedule delivery, checkout, pay.
triggers:
  - spencers
  - spencer's
  - order from spencers
  - spencers grocery
  - grocery from spencers
  - spencers retail
  - spencers online
  - spencers delivery
siteUrl: https://www.spencers.in
requiresAuth: true
params:
  - name: items
    required: true
    hint: List of items to order (e.g. "milk, bread, butter, fruits, vegetables")
  - name: address
    required: false
    hint: Delivery address or area name
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, net banking)
---

# Spencer's Retail Grocery Ordering

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### Step 0: Confirm delivery address & phone
**ALWAYS show the address picker** — even if the user mentioned a location like "Tellapur" or "Koramangala". An area name is NOT a complete delivery address (missing flat/building, street, pincode, phone). The user must pick a saved address or enter a full one. The address widget collects flat/building, street, city, pincode, AND contact phone — all critical for delivery.

- Call `ask_user` with `input_type: "address"`. Show saved addresses. If the user mentioned an area, pre-fill it in the question:
  ```json
  {"input_type": "address", "question": "Confirm your delivery address for Spencer's:", "saved": [{"label": "Home", "value": "C-502, Honer Aquantis, Tellapur"}, {"label": "Office", "value": "T-Hub, Raidurg, Hyderabad"}]}
  ```
- **Only skip** if the user provided a FULL address with building/flat, street, city, pincode, AND phone number (e.g. "E111, Ridgewood Estate, DLF Garden City, Pune 411032").
- **Do NOT ask for items** — extract them from the user's message. If truly missing, handoff anyway and let the browser agent figure it out.
- **Do NOT show product cards, prices, or images** — the cloud LLM has no access to the site's catalog. Only the browser agent can fetch real product data.

**CRITICAL**: Do NOT open the browser until you have a complete delivery address with phone. Without a delivery location, Spencer's shows ZERO products.

### 1. Gather Requirements
- BEFORE opening the browser, check if user provided items and address.
- If items not provided, use `ask_user` (input_type "freetext"): "What groceries do you want to order from Spencer's?"
- If address not provided, use `ask_user` (input_type "freetext"): "What's your delivery address or pincode?"

### 2. Open Spencer's & Set Location
- Open a NEW tab and navigate to `https://www.spencers.in`.
- Take snapshot. Verify logged in (account icon visible in header).
- If location/pincode popup appears, type the user's pincode or address, wait for suggestions, click best match.
- If area is not serviceable, tell user and stop.
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Take snapshot to confirm location set and products visible.

### 3. Search & Add Items
For each item the user requested:
- Click the search bar at the top of the page.
- Type item name and press Enter.
- Take snapshot of results.
- Find closest match. If multiple variants (brands, sizes, organic vs regular), use `ask_user` (input_type "choice") to let user pick.
- Click "Add to Cart" or "+" button to add item.
- If out of stock, inform user and suggest alternatives from results.
- Check for Spencer's own brand alternatives that may be cheaper.
- Repeat for all items. Dismiss any popups or promotional banners.

### 4. Review Cart
- Click cart icon and take snapshot.
- Use `confirm_action` to present cart summary:
  - Each item with quantity, weight/size, and price
  - Any Spencer's offers or combo deals applied
  - Subtotal, delivery fee, total
  - Estimated delivery time/slot
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 5. Checkout & Payment
- Click "Proceed to Checkout" or equivalent.
- Verify delivery address is correct. Select delivery time slot if options are available.
- Apply any visible coupons or promotional codes.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with items, prices, discounts, delivery fee, total, delivery slot
  - amount_inr: total amount (number)
  - description: "Spencer's grocery order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 6. Place Order & Confirm
- Click "Place Order" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order number, items ordered, total paid, estimated delivery time/slot.

## Site Notes

- Spencer's Retail operates in select Indian cities — check serviceability by pincode first.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- Spencer's offers fresh produce, dairy, bakery alongside packaged goods — good for perishables.
- Minimum order value may apply for free delivery (usually around 500-1000 INR).
- Spencer's has its own private label products — often cheaper than branded alternatives.
- Delivery slots may be limited — book early for preferred time windows.
- Spencer's may offer combo deals and bulk discounts — check product pages for offers.
- Fresh items (fruits, vegetables, dairy) may have variable weight — final price may differ slightly.
- Spencer's site uses standard e-commerce layout — always use Playwright fill/type methods.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
