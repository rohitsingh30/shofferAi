---
name: reliance-fresh
description: Order groceries from Reliance Fresh/Smart online via JioMart — browse, add to cart, schedule delivery, checkout, pay.
triggers:
  - reliance fresh
  - reliance smart
  - order from reliance fresh
  - reliance grocery
  - grocery from reliance
  - reliance fresh delivery
  - reliance smart online
  - jiomart reliance fresh
siteUrl: https://www.jiomart.com
requiresAuth: true
params:
  - name: items
    required: true
    hint: List of items to order (e.g. "atta, rice, oil, pulses, spices")
  - name: address
    required: false
    hint: Delivery address or pincode
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, JioMoney)
---

# Reliance Fresh/Smart Grocery Ordering

Chrome profile: rsinghtomar3011@gmail.com. Reliance Fresh and Smart are powered by JioMart online.

## Steps

### 1. Gather Requirements
- BEFORE opening the browser, check if user provided items and address.
- If items not provided, use `ask_user` (input_type "freetext"): "What groceries do you want to order from Reliance Fresh?"
- If address not provided, use `ask_user` (input_type "freetext"): "What's your delivery address or pincode?"

### 2. Open JioMart & Set Location
- Open a NEW tab and navigate to `https://www.jiomart.com`.
- Take snapshot. Verify logged in (account icon visible in header).
- If location/pincode popup appears, type the user's pincode or address, wait for suggestions, click best match.
- If area is not serviceable by Reliance Fresh, tell user and stop.
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Take snapshot to confirm location set and products visible. Verify "Reliance Fresh" or "Reliance Smart" store is available.

### 3. Search & Add Items
For each item the user requested:
- Click the search bar at the top.
- Type item name and press Enter.
- Take snapshot of results.
- Filter results by "Reliance Fresh" or "Reliance Smart" fulfillment if available.
- Find closest match. If multiple variants (brands, sizes, organic vs regular), use `ask_user` (input_type "choice").
- Click "Add to Cart" or "+" to add item.
- If out of stock, inform user and suggest alternatives.
- Repeat for all items. Dismiss popups or promotional overlays.

### 4. Review Cart
- Click cart icon and take snapshot.
- Use `confirm_action` to present cart summary:
  - Each item with quantity, weight/size, and price
  - Any JioMart offers, Smart Bazaar deals, or coupons applied
  - Subtotal, delivery fee, total
  - Estimated delivery date/slot
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 5. Checkout & Payment
- Click "Proceed to Checkout" or "Place Order".
- Verify delivery address is correct. Select delivery time slot if available.
- Apply any visible coupons or JioMart promotional codes.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with items, prices, discounts, delivery fee, total, delivery slot
  - amount_inr: total amount (number)
  - description: "Reliance Fresh grocery order via JioMart"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 6. Place Order & Confirm
- Click "Place Order" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order number, items ordered, total paid, estimated delivery date/slot, fulfillment store.

## Site Notes

- Reliance Fresh/Smart orders are fulfilled via JioMart — the online ordering platform for Reliance Retail.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- JioMart supports JioMoney wallet — may offer extra cashback for wallet payments.
- Minimum order for free delivery typically around 199-499 INR depending on area.
- Reliance Fresh focuses on fresh produce; Reliance Smart has a wider grocery range.
- Delivery is usually same-day or next-day — check available slots in checkout.
- JioMart often runs heavy discounts on staples (rice, atta, oil) — highlight savings.
- Product availability depends on nearest Reliance Fresh/Smart store inventory.
- JioMart site uses React — always use Playwright fill/type methods.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
