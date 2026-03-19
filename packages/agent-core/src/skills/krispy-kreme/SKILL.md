---
name: krispy-kreme
description: Order donuts from Krispy Kreme India — dozen boxes, individual donuts, beverages, delivery, pay.
triggers:
  - krispy kreme
  - krispy kreme order
  - order donuts
  - donut delivery
  - doughnut delivery
  - order from krispy kreme
  - dozen donuts
  - krispy kreme donuts
  - glazed donuts
  - donut box
siteUrl: https://www.krispykreme.in
requiresAuth: true
params:
  - name: items
    required: true
    hint: What to order (e.g. "dozen glazed", "assorted box", "chocolate donut") or just "donuts"
  - name: address
    required: false
    hint: Delivery address or area name
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, wallet)
---

# Krispy Kreme India Ordering

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Get Delivery Address
- BEFORE opening the browser, check if user provided an address.
- If not, use `ask_user` (input_type "freetext"): "What's your delivery address or area name for Krispy Kreme delivery?"
- Krispy Kreme delivers only from nearby stores — address determines the outlet.

### 2. Open Krispy Kreme & Set Location
- Open a NEW tab and navigate to `https://www.krispykreme.in`.
- Take snapshot. Verify logged in (account/profile icon in header).
- If location popup or delivery address selector appears, type the user's address, wait for suggestions, click best match.
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Confirm nearest store assigned and menu visible.

### 3. Browse Menu & Select Donuts
- If user named specific items (Original Glazed, Chocolate Dreamcake, Lotus Biscoff), navigate to find them.
- If generic request, present menu categories: Signature Donuts, Dozen Boxes, Half Dozen Boxes, Beverages, Combos.
- Use `ask_user` (input_type "choice") to let user pick items.
- For dozen/half-dozen boxes:
  - Pre-assorted vs Pick Your Own — use `ask_user` (input_type "choice").
  - If Pick Your Own, present available donut flavors and let user choose each slot.
  - Original Glazed Dozen, Assorted Dozen, Premium Dozen — use `ask_user` with prices.
- For individual donuts:
  - Present available flavors with prices — use `ask_user` (input_type "choice").
  - Allow adding multiple individual donuts.
- Click "Add to Cart" after each item.
- Ask if user wants to add beverages (coffee, hot chocolate, milkshakes) or combos.

### 4. Apply Offers
- Check for available coupons/offers on the cart page.
- Krispy Kreme runs frequent combo deals (dozen + beverages) — apply if beneficial.
- Take snapshot if discount applied.

### 5. Review Cart
- Open cart, take snapshot.
- Use `confirm_action` to present order summary:
  - Each item with variant/flavor and price
  - Box contents (if dozen/half-dozen selected)
  - Discounts applied (if any)
  - Subtotal, delivery fee, taxes, total
  - Estimated delivery time (usually 30-50 minutes)
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify delivery address is correct.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with items, flavors, box contents, prices, discount, delivery fee, total, estimated time
  - amount_inr: total amount (number)
  - description: "Krispy Kreme donut order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Place Order & Confirm
- Click "Place Order" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order number, items ordered, total paid, estimated delivery time.

## Site Notes

- Krispy Kreme India delivery typically takes 30-50 minutes depending on distance.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- Original Glazed is the signature item and always available — other flavors rotate periodically.
- Dozen boxes are significantly cheaper per donut than buying individually — suggest for groups.
- Krispy Kreme has limited store presence in India (mainly metro cities) — delivery area may be restricted.
- Some seasonal/limited-edition flavors sell out fast — check availability at the selected store.
- Krispy Kreme uses a modern web stack — always use Playwright fill/type methods.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
