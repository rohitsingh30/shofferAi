---
name: salad-days
description: Order healthy salads and bowls from SaladDays — salads, wraps, smoothie bowls, checkout, pay.
triggers:
  - salad days
  - order from salad days
  - saladdays delivery
  - salad delivery
  - healthy food delivery
  - salad days order
  - order salad
  - healthy bowl
  - salad wrap
siteUrl: https://www.saladdays.co
requiresAuth: true
params:
  - name: food
    required: true
    hint: What to order (e.g. "caesar salad", "protein bowl", "chicken wrap") or just "salad"
  - name: address
    required: false
    hint: Delivery address or area name
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# SaladDays Ordering

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Get Delivery Address
- BEFORE opening the browser, check if user provided an address.
- If not, use `ask_user` (input_type "freetext"): "What's your delivery address or area for SaladDays delivery?"
- SaladDays operates primarily in Delhi NCR, Bangalore, Mumbai — verify city coverage.

### 2. Open SaladDays & Set Location
- Open a NEW tab and navigate to `https://www.saladdays.co`.
- Take snapshot. Verify logged in (account icon or name in header).
- If location popup appears, enter user's address/area and select best match from suggestions.
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Confirm SaladDays delivers to the user's location.
- If not available on own site, try Swiggy or Zomato: search for "SaladDays" or "Salad Days".

### 3. Browse Menu & Select Items
- If user named specific items (Caesar Salad, Protein Power Bowl, Chicken Tikka Wrap), navigate to find them.
- If generic request, present menu categories: Signature Salads, Power Bowls, Wraps, Smoothie Bowls, Soups, Juices & Smoothies, Desserts.
- Use `ask_user` (input_type "choice") to let user pick items.
- For salads and bowls, present customization options:
  - Base: Lettuce / Quinoa / Brown Rice / Pasta — use `ask_user` (input_type "choice").
  - Protein: Grilled Chicken / Paneer / Tofu / Chickpeas / Egg — present with prices.
  - Dressing: Caesar / Honey Mustard / Balsamic / Peri Peri / Yogurt — use `ask_user`.
  - Extras: Avocado, Seeds, Nuts, Extra Protein — present add-on prices.
- For wraps, present filling options:
  - Chicken / Paneer / Falafel / Mixed Veg — use `ask_user` with prices.
- Click "Add to Cart" after each item.
- Ask if user wants to add smoothies, cold-pressed juices, or energy bites.

### 4. Apply Offers
- Check for available coupons/offers on the page.
- SaladDays often has subscription plans and combo discounts — apply if beneficial.
- Take snapshot if discount applied.

### 5. Review Cart
- Open cart, take snapshot.
- Use `confirm_action` to present order summary:
  - Each item with customizations and price
  - Calorie count if displayed (SaladDays shows nutrition info)
  - Coupons/discounts applied
  - Subtotal, delivery fee, taxes, total
  - Estimated delivery time (usually 30-45 minutes)
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify delivery address is correct.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with items, customizations, prices, discount, delivery fee, total, estimated time
  - amount_inr: total amount (number)
  - description: "SaladDays order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Place Order & Confirm
- Click "Place Order" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order number, items ordered, total paid, estimated delivery time.

## Site Notes

- SaladDays is a health-focused brand — primarily available in Delhi NCR, Bangalore, and Mumbai.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- SaladDays displays calorie counts and macros for all items — share this info with health-conscious users.
- Subscription plans (weekly/monthly) offer 15-20% savings — mention for regular users.
- SaladDays wraps are lower-calorie alternatives to typical wraps — good for diet-conscious users.
- If SaladDays website is unavailable, fall back to Swiggy/Zomato search for "SaladDays".
- Delivery is usually within 30-45 minutes; salads are packed fresh so timing matters.
- SaladDays site may use Shopify or a custom platform — handle accordingly with Playwright.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
