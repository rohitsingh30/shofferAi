---
name: starbucks-order
description: Order from Starbucks India for delivery — select store, customize drinks, add food, checkout, pay.
triggers:
  - starbucks
  - order from starbucks
  - starbucks delivery
  - starbucks coffee
  - coffee delivery
  - starbucks order
  - latte
  - frappuccino
  - cappuccino delivery
siteUrl: https://www.starbucks.in
requiresAuth: true
params:
  - name: drink
    required: true
    hint: What to order (e.g. "caramel frappuccino", "latte", "iced americano") or just "coffee"
  - name: address
    required: false
    hint: Delivery address or area name
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, wallet)
---

# Starbucks India Ordering

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Get Delivery Address
- BEFORE opening the browser, check if user provided an address.
- If not, use `ask_user` (input_type "freetext"): "What's your delivery address or area for Starbucks delivery?"
- Starbucks delivers via partners (Swiggy/Zomato) or its own app — check availability.

### 2. Open Starbucks & Set Location
- Open a NEW tab and navigate to `https://www.starbucks.in/order`.
- Take snapshot. Verify logged in (account icon or name in header).
- If location popup or store selector appears, enter user's address/area to find nearby stores.
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Select the nearest store that offers delivery.
- If no delivery-enabled store nearby, inform user and suggest pickup or alternative.
- Confirm store selected and menu visible.

### 3. Browse Menu & Customize Drinks
- If user named a specific drink, search or navigate to find it.
- If generic request, present menu categories: Hot Coffees, Cold Coffees, Frappuccinos, Teas, Refreshers, Food.
- Use `ask_user` (input_type "choice") to let user pick drinks.
- For each drink, handle customization:
  - Size: Tall (Small), Grande (Medium), Venti (Large) — use `ask_user` (input_type "choice") with prices.
  - Milk preference: Regular, Oat, Almond, Soy — use `ask_user` if applicable.
  - Extras: extra shot, syrup flavors (vanilla, caramel, hazelnut), whipped cream — present options.
  - Temperature: Hot vs Iced (for applicable drinks) — use `ask_user`.
- Click "Add to Cart" after each customization.
- Ask if user wants to add food items (sandwiches, pastries, cookies, cake slices).

### 4. Review Cart
- Open cart, take snapshot.
- Use `confirm_action` to present order summary:
  - Each drink with size, customizations, and price
  - Food items with prices
  - Subtotal, delivery fee, taxes, total
  - Estimated preparation + delivery time
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 5. Checkout & Payment
- Proceed to checkout.
- Verify delivery address and store are correct.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with drinks, sizes, customizations, food, prices, delivery fee, total
  - amount_inr: total amount (number)
  - description: "Starbucks order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 6. Place Order & Confirm
- Click "Place Order" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order number, store name, items ordered, total paid, estimated delivery time.

## Site Notes

- Starbucks India delivery typically takes 30-50 minutes depending on distance.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- Starbucks sizing: Tall (240ml), Grande (350ml), Venti (470ml) — always clarify with prices.
- Starbucks Rewards members earn stars on every order — operator account may have rewards.
- Customizations (extra shots, syrups, milk alternatives) cost ₹50-100 extra — inform user.
- Not all stores offer delivery — some are dine-in/takeaway only.
- Starbucks menu changes seasonally — limited-time drinks may not always be available.
- Starbucks India uses a modern React-based site — always use Playwright fill/type methods.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
