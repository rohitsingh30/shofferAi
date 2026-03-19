---
name: burgerking-order
description: Order food from Burger King India — browse menu, combos, customize burgers, add sides, checkout, pay.
triggers:
  - burger king
  - burgerking
  - order from burger king
  - burger king delivery
  - bk order
  - whopper
  - burger king combo
  - order burger
  - burger delivery
  - bk chicken
siteUrl: https://www.burgerking.in
requiresAuth: true
params:
  - name: food
    required: true
    hint: What to order (e.g. "whopper", "chicken combo", "veg burger") or just "burger"
  - name: address
    required: false
    hint: Delivery address or area name
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# Burger King India Ordering

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Get Delivery Address
- BEFORE opening the browser, check if user provided an address.
- If not, use `ask_user` (input_type "freetext"): "What's your delivery address or area name for Burger King delivery?"
- Burger King delivers only from nearby outlets — address determines the store.

### 2. Open Burger King & Set Location
- Open a NEW tab and navigate to `https://www.burgerking.in`.
- Take snapshot. Verify logged in (account/profile icon in header).
- Select "Delivery" mode if prompted (vs Dine-in or Takeaway).
- If location popup appears, type the user's address, wait for suggestions, click best match.
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Confirm nearest outlet assigned and menu visible.

### 3. Browse Menu & Select Items
- If user named specific items (Whopper, Chicken Royale, BK Veggie), navigate to find them.
- If generic request, present menu categories: Whoppers, Burgers, Combos & Meals, Chicken, Sides, Beverages, Desserts.
- Use `ask_user` (input_type "choice") to let user pick items.
- For combo meals, present options:
  - Meal (burger + fries + drink) vs standalone burger — use `ask_user` with prices.
  - Upgrade options (large fries, large drink) — present with prices.
- For burgers, handle customization:
  - Single vs Double patty — use `ask_user` (input_type "choice") with prices.
  - Add-ons (extra cheese, bacon, jalapeños) — use `ask_user`.
- Click "Add to Cart" after each item.
- Ask if user wants to add more items (Chicken Nuggets, Onion Rings, Sundae, BK King Shots).

### 4. Apply Offers
- Check for available coupons/offers on the cart or homepage banner.
- BK often runs combos at discounted prices and "King Deals" — apply if beneficial.
- Take snapshot if discount applied.

### 5. Review Cart
- Open cart, take snapshot.
- Use `confirm_action` to present order summary:
  - Each item with size/variant and price
  - Coupons/discounts applied
  - Subtotal, delivery fee, taxes, total
  - Estimated delivery time (usually 30-45 minutes)
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify delivery address is correct.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with items, prices, discount, delivery fee, total, estimated time
  - amount_inr: total amount (number)
  - description: "Burger King order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Place Order & Confirm
- Click "Place Order" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order number, items ordered, total paid, estimated delivery time.

## Site Notes

- Burger King India delivery usually takes 30-45 minutes.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- BK Crown loyalty points may be available — mention if applicable.
- Whopper is the signature item — suggest it if user is unsure what to order.
- "King Deals" section has the best value combos starting from ₹99 — mention for budget orders.
- Minimum order value for delivery is usually ₹149-199.
- Veg and non-veg items are clearly marked with green/red icons.
- Some outlets may not serve the full menu — check availability after outlet assignment.
- BK India uses a React-based SPA — always use Playwright fill/type methods.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
