---
name: freshmenu-meals
description: Order chef-cooked meals from FreshMenu — browse daily menu, bowls, wraps, desserts, delivery, pay.
triggers:
  - freshmenu
  - fresh menu
  - freshmenu order
  - order from freshmenu
  - freshmenu delivery
  - chef cooked meals
  - fresh menu meals
  - daily menu order
  - healthy meals delivery
  - fresh food delivery
siteUrl: https://www.freshmenu.com
requiresAuth: true
params:
  - name: items
    required: true
    hint: What to order (e.g. "butter chicken bowl", "caesar salad", "pasta") or just "lunch" or "dinner"
  - name: address
    required: false
    hint: Delivery address or area name
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, wallet)
---

# FreshMenu Ordering

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Get Delivery Address
- BEFORE opening the browser, check if user provided an address.
- If not, use `ask_user` (input_type "freetext"): "What's your delivery address or area name for FreshMenu delivery?"
- FreshMenu operates in select cities (Bengaluru, Mumbai, Delhi NCR) — check availability.

### 2. Open FreshMenu & Set Location
- Open a NEW tab and navigate to `https://www.freshmenu.com`.
- Take snapshot. Verify logged in (account/profile icon in header).
- If location popup or address selector appears, type the user's address, wait for suggestions, click best match.
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Confirm delivery available to user's area and daily menu visible.

### 3. Browse Daily Menu & Select Items
- FreshMenu has a rotating daily menu — items change every day.
- If user named specific cuisine or dish type, filter or search for it.
- If generic request ("lunch", "dinner"), present today's menu categories: Bowls, Wraps, Biryanis, Pastas, Salads, Sandwiches, Desserts, Beverages.
- Use `ask_user` (input_type "choice") to let user pick items.
- For each item:
  - Present dish name, description, calorie count (if shown), and price.
  - Size/portion options if available — use `ask_user` (input_type "choice") with prices.
  - Add-ons (extra protein, sides, drinks) — present options with prices.
- Click "Add to Cart" after each item.
- Ask if user wants to add desserts, beverages, or more meals.

### 4. Apply Offers
- Check for available coupons/offers on the cart page.
- FreshMenu runs regular discounts on combos and new customer offers — apply if beneficial.
- Take snapshot if discount applied.

### 5. Review Cart
- Open cart, take snapshot.
- Use `confirm_action` to present order summary:
  - Each item with variant and price
  - Add-ons with prices
  - Discounts applied (if any)
  - Subtotal, delivery fee, taxes, total
  - Estimated delivery time (usually 30-45 minutes)
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify delivery address is correct.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with items, variants, add-ons, prices, discount, delivery fee, total, estimated time
  - amount_inr: total amount (number)
  - description: "FreshMenu meal order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Place Order & Confirm
- Click "Place Order" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order number, items ordered, total paid, estimated delivery time.

## Site Notes

- FreshMenu delivery typically takes 30-45 minutes, with pre-cooked meals ready for dispatch.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- FreshMenu menu rotates daily — items available today may not be available tomorrow.
- FreshMenu operates primarily in Bengaluru, Mumbai, and Delhi NCR — check if user's city is served.
- Meals come in sealed containers, chef-prepared — quality is consistent unlike aggregator delivery.
- Calorie counts are displayed for most items — useful for health-conscious users.
- FreshMenu often has good lunch combos (meal + drink) at discounted prices — suggest during lunch hours.
- FreshMenu uses a modern React-based web app — always use Playwright fill/type methods.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
