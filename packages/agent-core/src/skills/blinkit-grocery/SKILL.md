---
name: blinkit-grocery
description: Order groceries from Blinkit with 10-minute delivery — search items, add to cart, checkout, pay.
triggers:
  - blinkit
  - order from blinkit
  - grocery
  - order milk
  - order bread
  - quick delivery
  - groceries from blinkit
siteUrl: https://blinkit.com
requiresAuth: true
params:
  - name: items
    required: true
    hint: List of items to order (e.g. "milk, bread, eggs")
  - name: address
    required: false
    hint: Delivery address or area name
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# Blinkit Grocery Ordering

Chrome profile: rsinghtomar3011@gmail.com. Operator phone: 8109137158.

## Steps

### 1. Get Delivery Address
- BEFORE opening the browser, check if user provided an address.
- If user has saved addresses in profile, present them and ask to confirm.
- Otherwise, use `ask_user` (input_type "freetext"): "What's your delivery address or area name?"

### 2. Open Blinkit & Set Location
- Open a NEW tab and navigate to `https://blinkit.com`.
- Take a snapshot. Check if logged in (account icon visible in header).
- If Blinkit shows a location popup, type the user's address in the search box, wait for suggestions, click best match.
- If area is not serviceable, tell user and stop.
- If NOT logged in: click Login, enter 8109137158, handle OTP transparently (do NOT ask user for credentials).
- **If you see a login page or wrong account, STOP and tell the user: "Session expired, please re-login in Chrome Debug."**
- Take snapshot to confirm location set and products visible.

### 3. Search & Add Items
For each item the user requested:
- Click the search bar (link with "!" icon at top).
- Type item name and press Enter.
- Take snapshot of results.
- Find closest match. If multiple variants (500ml vs 1L, different brands), use `ask_user` (input_type "choice").
- Click "Add" or "+" to add to cart.
- If out of stock, inform user and suggest alternatives.
- Repeat for all items. Dismiss any popups.

### 4. Review Cart
- Click cart icon and take snapshot.
- Use `confirm_action` to present cart summary:
  - Each item with quantity and price
  - Subtotal, delivery fee, total
  - Estimated delivery time
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 5. Checkout & Payment
- Click "Proceed to Checkout".
- Verify delivery address is correct.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with items, prices, delivery fee, total, estimated time
  - amount_inr: total amount (number)
  - description: "Blinkit grocery order"
- STOP and WAIT — payment panel opens for user.
- Only proceed if payment confirmed. If cancelled, ask what to change.

### 6. Place Order & Confirm
- Click "Place Order".
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order number, items, total paid, estimated delivery time.

## Site Notes

- Blinkit delivers in 10-15 minutes — time-sensitive, don't waste time.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login with operator phone 8109137158. OTP goes to operator.
- FIRST thing Blinkit shows is location popup — set address first.
- Products may be out of stock — suggest alternatives.
- Minimum order usually ₹99-149.
- Some areas don't have Blinkit coverage — check first.
- Blinkit uses React — always use Playwright fill/type methods.
- Search bar is often a link to /s/ — click it first, then type.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
