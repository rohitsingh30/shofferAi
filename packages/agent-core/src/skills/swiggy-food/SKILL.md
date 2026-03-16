---
name: swiggy-food
description: Order food delivery from Swiggy — browse restaurants, select dishes, checkout, pay.
triggers:
  - swiggy
  - order food
  - food delivery
  - order from swiggy
  - swiggy food
  - hungry
  - dinner from swiggy
  - lunch from swiggy
  - order dinner
  - order lunch
  - order breakfast
siteUrl: https://www.swiggy.com
requiresAuth: true
params:
  - name: food
    required: true
    hint: What to order (e.g. "biryani", "pizza", "butter chicken") or restaurant name
  - name: address
    required: false
    hint: Delivery address or area name
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# Swiggy Food Ordering

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Get Delivery Address
- BEFORE opening the browser, check if user provided an address.
- If not, use `ask_user` (input_type "freetext"): "What's your delivery address or area name?"

### 2. Open Swiggy & Set Location
- Open a NEW tab and navigate to `https://www.swiggy.com`.
- Take snapshot. Verify logged in (account icon in header).
- If location popup appears, type the user's address, wait for suggestions, click best match.
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Confirm location set and restaurants visible.

### 3. Find Restaurant & Dishes
- If user named a specific restaurant, search for it in the search bar.
- If user named a dish/cuisine, search for it and present top 3-5 restaurant options.
- Use `ask_user` (input_type "choice") to let user pick a restaurant.
- Open the restaurant page, take snapshot.
- Browse the menu. Find the requested dish(es).
- If multiple variants/sizes, use `ask_user` (input_type "choice").
- Click "Add" for each item. Handle customization popups (size, toppings, spice level) by asking user.

### 4. Review Cart
- Open cart, take snapshot.
- Use `confirm_action` to present order summary:
  - Restaurant name
  - Each item with quantity and price
  - Subtotal, delivery fee, taxes, total
  - Estimated delivery time
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 5. Checkout & Payment
- Proceed to checkout.
- Verify delivery address is correct.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with restaurant, items, prices, delivery fee, total, estimated time
  - amount_inr: total amount (number)
  - description: "Swiggy food order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 6. Place Order & Confirm
- Click "Place Order" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order number, restaurant, items, total paid, estimated delivery time.

## Site Notes

- Swiggy food delivery: 25-45 minutes typically.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- Swiggy One membership may offer free delivery and discounts.
- Restaurants may be closed outside operating hours — check availability.
- Surge pricing may apply during peak hours — inform user.
- Minimum order value may apply per restaurant.
- Some items may be unavailable — suggest alternatives.
- Swiggy uses React — always use Playwright fill/type methods.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
