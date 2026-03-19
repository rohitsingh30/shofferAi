---
name: mcdonalds-order
description: Order food from McDelivery India (McDonald's) — browse menu, combo meals, customize, checkout, pay.
triggers:
  - mcdonalds
  - mcdonald's
  - mcdelivery
  - order from mcdonalds
  - mcdonalds delivery
  - burger delivery
  - mcdonalds order
  - happy meal
  - mcflurry
  - big mac
siteUrl: https://www.mcdelivery.co.in
requiresAuth: true
params:
  - name: food
    required: true
    hint: What to order (e.g. "McSpicy", "Big Mac", "McNuggets", "Happy Meal") or just "burger"
  - name: address
    required: false
    hint: Delivery address or area name
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# McDonald's McDelivery Ordering

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### Step 0: Collect order preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **address** (type: "address", required): Ask for delivery address. Show saved addresses.
2. **cuisine** (type: "carousel", required): Show cuisine options as scrollable cards (🥘 Biryani, 🍕 Pizza, 🍔 Burger, 🍱 Thali, 🥡 Chinese, 🥞 South Indian, 🌯 Rolls, 🍰 Dessert). Allow typing specific restaurant/dish.
3. **dietary** (type: "chip_bar", collapsed): Dietary preferences — 🟢 Veg only, 🔴 Non-veg OK, Jain, No onion, No garlic.

**CRITICAL**: Do NOT open the browser until you have the delivery address. Without it, the site cannot show relevant restaurants.

### 1. Get Delivery Address
- BEFORE opening the browser, check if user provided an address.
- If not, use `ask_user` (input_type "freetext"): "What's your delivery address or area name for McDelivery?"
- McDelivery delivers only from nearby outlets — address determines the restaurant.

### 2. Open McDelivery & Set Location
- Open a NEW tab and navigate to `https://www.mcdelivery.co.in`.
- Take snapshot. Verify logged in (account icon visible).
- If location/address popup appears, type the user's address, wait for suggestions, click best match.
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Confirm location set, outlet assigned, and menu visible.

### 3. Browse Menu & Select Items
- If user named specific items (McSpicy, Big Mac, McNuggets), navigate to find them.
- If generic request, present menu categories: Burgers, Wraps, Combos, Sides, Beverages, Desserts, Happy Meal.
- Use `ask_user` (input_type "choice") to let user pick items.
- For combo meals, present what's included (burger + fries + drink) and upgrade options.
- Handle meal customization:
  - Size: Regular vs Medium vs Large meal — use `ask_user` with prices.
  - Drink choice — use `ask_user` (input_type "choice").
  - Add-ons (extra cheese, extra patty) — present with prices.
- Click "Add to Cart" after each item.
- Ask if user wants to add more items (desserts like McFlurry, Brownie; sides like Fries, Piri Piri).

### 4. Review Cart
- Open cart, take snapshot.
- Use `confirm_action` to present order summary:
  - Each item with meal size, customizations, and price
  - Subtotal, delivery fee, taxes, total
  - Estimated delivery time (usually 25-40 minutes)
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 5. Checkout & Payment
- Proceed to checkout.
- Verify delivery address is correct.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with items, sizes, prices, delivery fee, total, estimated time
  - amount_inr: total amount (number)
  - description: "McDelivery order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 6. Place Order & Confirm
- Click "Place Order" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order number, items ordered, total paid, estimated delivery time.

## Site Notes

- McDelivery India typically delivers in 25-40 minutes.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- McDonald's India has two operators: West & South (Hardcastle) and North & East (CPRL) — the website handles routing automatically.
- McDelivery minimum order is usually ₹149.
- Combo meals (EVM - Extra Value Meals) offer better value than ordering individually — suggest them.
- Happy Meal includes a toy — mention if ordering for kids.
- Some items are breakfast-only or dinner-only — check time-based availability.
- McDelivery uses a React-based SPA — always use Playwright fill/type methods.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
