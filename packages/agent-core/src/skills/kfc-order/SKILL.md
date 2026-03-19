---
name: kfc-order
description: Order food from KFC India — buckets, combos, chicken, sides, checkout, pay.
triggers:
  - kfc
  - order from kfc
  - kfc delivery
  - kfc order
  - chicken bucket
  - fried chicken
  - kfc chicken
  - order chicken
siteUrl: https://online.kfc.co.in
requiresAuth: true
params:
  - name: food
    required: true
    hint: What to order (e.g. "chicken bucket", "zinger burger", "popcorn chicken") or just "chicken"
  - name: address
    required: false
    hint: Delivery address or area name
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# KFC India Ordering

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Get Delivery Address
- BEFORE opening the browser, check if user provided an address.
- If not, use `ask_user` (input_type "freetext"): "What's your delivery address or area name for KFC delivery?"
- KFC delivers only from nearby outlets — address determines the store.

### 2. Open KFC & Set Location
- Open a NEW tab and navigate to `https://online.kfc.co.in`.
- Take snapshot. Verify logged in (account/profile icon in header).
- Select "Delivery" mode if prompted (vs Takeaway).
- If location popup appears, type the user's address, wait for suggestions, click best match.
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Confirm nearest outlet assigned and menu visible.

### 3. Browse Menu & Select Items
- If user named specific items (Zinger, Hot Wings, Bucket), navigate to find them.
- If generic request, present menu categories: Bucket Meals, Burgers, Snackers, Rice Bowlz, Sides, Beverages, Desserts.
- Use `ask_user` (input_type "choice") to let user pick items.
- For bucket meals, present options:
  - Bucket for 1 / Bucket for 2 / Bucket for 4 / Party Bucket — use `ask_user` with prices.
  - Combo upgrades (add fries + drink) — present with prices.
- For burgers (Zinger, Classic, Veg), handle customization:
  - Meal vs standalone — use `ask_user`.
  - Drink and side choice for meals.
- Click "Add to Cart" after each item.
- Ask if user wants to add more items (Hot Wings, Popcorn Chicken, Krushers).

### 4. Apply Offers
- Check for available coupons/offers on the page.
- KFC often has Wednesday offers and bucket deals — apply if beneficial.
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
  - description: "KFC order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Place Order & Confirm
- Click "Place Order" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order number, items ordered, total paid, estimated delivery time.

## Site Notes

- KFC India delivery usually takes 30-45 minutes.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- KFC's "Wednesday Offer" gives significant discounts on buckets — mention if it's Wednesday.
- Bucket meals are the best value for groups — suggest them for 2+ people.
- Minimum order value for delivery is usually ₹149-199.
- KFC India has both veg and non-veg options — veg items are clearly marked.
- Some outlets may not serve the full menu — check availability after outlet assignment.
- KFC uses a React-based SPA — always use Playwright fill/type methods.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
