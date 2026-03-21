---
name: dmart-grocery
description: Order groceries from DMart Ready — browse products, add to cart, schedule pickup or delivery, checkout, pay.
triggers:
  - dmart
  - dmart ready
  - order from dmart
  - dmart grocery
  - grocery from dmart
  - dmart pickup
  - dmart delivery
  - dmart ready order
siteUrl: https://www.dmart.in
requiresAuth: true
params:
  - name: items
    required: true
    hint: List of items to order (e.g. "rice, dal, cooking oil, sugar")
  - name: address
    required: false
    hint: Delivery/pickup address or area name
  - name: fulfillment
    required: false
    hint: Pickup from store or home delivery
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, net banking)
---

# DMart Ready Grocery Ordering

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### Step 0: Confirm delivery address & phone
**ALWAYS show the address picker** — even if the user mentioned a location like "Tellapur" or "Koramangala". An area name is NOT a complete delivery address (missing flat/building, street, pincode, phone). The user must pick a saved address or enter a full one. The address widget collects flat/building, street, city, pincode, AND contact phone — all critical for delivery.

- Call `ask_user` with `input_type: "address"`. Show saved addresses. If the user mentioned an area, pre-fill it in the question:
  ```json
  {"input_type": "address", "question": "Confirm your delivery address and phone:", "saved": <use the saved addresses from the system prompt>}
  ```
- **Only skip** if the user provided a FULL address with building/flat, street, city, pincode, AND phone number (e.g. "E111, Ridgewood Estate, DLF Garden City, Pune 411032").
- **Do NOT ask for items** — extract them from the user's message. If truly missing, handoff anyway and let the browser agent figure it out.
- **Do NOT show product cards, prices, or images** — the cloud LLM has no access to the site's catalog. Only the browser agent can fetch real product data.

**CRITICAL**: Do NOT open the browser until you have a complete delivery address with phone. Without a delivery location, DMart Ready shows ZERO products.

### 1. Gather Requirements
- BEFORE opening the browser, check if user provided items and address.
- If items not provided, use `ask_user` (input_type "freetext"): "What groceries do you want to order from DMart?"
- If address not provided, use `ask_user` (input_type "freetext"): "What's your delivery/pickup address or area name?"
- If fulfillment preference not specified, use `ask_user` (input_type "choice"): "Do you want DMart store pickup or home delivery?" with options ["Store Pickup", "Home Delivery"].

### 2. Open DMart Ready & Set Location
- Open a NEW tab and navigate to `https://www.dmart.in`.
- Take snapshot. Verify logged in (account icon visible in header).
- If location/pincode popup appears, type the user's address or pincode, wait for suggestions, click best match.
- If area is not serviceable, tell user and stop.
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Take snapshot to confirm location set and products visible.

### 3. Search & Add Items
For each item the user requested:
- Click the search bar at the top.
- Type item name and press Enter.
- Take snapshot of results.
- Find closest match. If multiple variants (brands, sizes, quantities), use `ask_user` (input_type "choice") to let user pick.
- Click "Add to Cart" or "+" button to add item.
- If out of stock, inform user and suggest alternatives from results.
- Repeat for all items. Dismiss any popups or upsell banners.

### 4. Review Cart
- Click cart icon and take snapshot.
- Use `confirm_action` to present cart summary:
  - Each item with quantity, weight/size, and price
  - Any discounts or DMart offers applied
  - Subtotal, delivery/pickup fee, total
  - Fulfillment method (pickup or delivery)
  - Estimated availability/delivery time
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 5. Checkout & Payment
- Click "Proceed to Checkout" or equivalent.
- Select fulfillment method (store pickup or home delivery) as per user preference.
- If pickup: select nearest DMart store and preferred time slot.
- If delivery: verify delivery address is correct, select delivery slot.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with items, prices, discounts, delivery fee, total, fulfillment method, time slot
  - amount_inr: total amount (number)
  - description: "DMart Ready grocery order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 6. Place Order & Confirm
- Click "Place Order" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order number, items ordered, total paid, fulfillment method, pickup/delivery time slot, store address (if pickup).

## Site Notes

- DMart Ready offers store pickup (free) and home delivery (charges may apply) — clarify with user.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- DMart prices are typically lower than other platforms — highlight savings if visible.
- Minimum order value may apply for home delivery (usually around 1000-2000 INR).
- DMart Ready may not be available in all cities — check serviceability by pincode first.
- Pickup orders require user to collect from the selected DMart store within the time window.
- Products are packed at the nearest DMart warehouse — some items may be unavailable in certain areas.
- DMart uses slot-based fulfillment — preferred time slots fill up fast, especially weekends.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
