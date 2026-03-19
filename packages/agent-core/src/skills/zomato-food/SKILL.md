---
name: zomato-food
description: Order food delivery from Zomato — browse restaurants, select dishes, checkout, pay.
triggers:
  - zomato
  - order from zomato
  - zomato food
  - zomato delivery
  - order food from zomato
siteUrl: https://www.zomato.com
requiresAuth: true
params:
  - name: food
    required: true
    hint: What to order (e.g. "biryani", "pizza", "Chinese food") or restaurant name
  - name: address
    required: false
    hint: Delivery address or area name
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# Zomato Food Ordering

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### Step 0: Collect order preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **address** (type: "address", required): Ask for delivery address. Show saved addresses.
2. **cuisine** (type: "carousel", required): Show cuisine options as scrollable cards (🥘 Biryani, 🍕 Pizza, 🍔 Burger, 🍱 Thali, 🥡 Chinese, 🥞 South Indian, 🌯 Rolls, 🍰 Dessert). Allow typing specific restaurant/dish.
3. **dietary** (type: "chip_bar", collapsed): Dietary preferences — 🟢 Veg only, 🔴 Non-veg OK, Jain, No onion, No garlic.

**CRITICAL**: Do NOT open the browser until you have the delivery address. Without it, the site cannot show relevant restaurants.

### 1. Gather ALL Requirements Upfront
- BEFORE opening the browser, check what the user already provided: food/dish, delivery address, payment preference.
- If ANY info is missing, use ONE SINGLE `ask_user` call to collect ALL missing info at once.
  Example: "I need a couple of details to order from Zomato:\n• Delivery address or area name\n• Any payment preference? (UPI, card, COD — default: UPI)"
- Do NOT ask questions one at a time. Batch everything into a single prompt.
- If user provided both food and address already, skip straight to Step 2.

### 2. Open Zomato & Set Location
- Open a NEW tab and navigate to `https://www.zomato.com`.
- Take snapshot. Verify logged in (profile icon in header).
- If location popup appears, type the user's address, wait for suggestions, click best match.
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Confirm location set and restaurants visible.

### 3. Find Restaurant & Dishes
- If user named a specific restaurant, search for it in the search bar at the top.
- If user named a dish/cuisine, search for it and present top 3-5 restaurant options.
- Use `ask_user` (input_type "choice") to let user pick a restaurant.
- Open the restaurant page ("Order Online" section), take snapshot.
- Browse the menu. Scroll through categories to find requested dish(es).
- If multiple variants/sizes, use `ask_user` (input_type "choice").
- Click "Add" for each item. Handle customization popups by asking user preferences.
- If item is "Bestseller" tagged, mention it to user.

### 4. Review Cart
- Open cart (bottom bar or cart icon), take snapshot.
- Use `confirm_action` to present order summary:
  - Restaurant name
  - Each item with quantity and price
  - Subtotal, delivery fee, taxes, platform fee, total
  - Estimated delivery time
  - Any Zomato Gold/Pro discounts applied
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 5. Checkout & Payment
- Proceed to checkout.
- Verify delivery address is correct. Add delivery instructions if user mentioned any.
- Apply coupons if visible and beneficial — inform user.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with restaurant, items, prices, fees, total, estimated time
  - amount_inr: total amount (number)
  - description: "Zomato food order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 6. Place Order & Confirm
- Click "Place Order" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation/tracking page.
- Report: order ID, restaurant, items, total paid, estimated delivery time, delivery partner info if available.

## Site Notes

- Zomato food delivery: 25-45 minutes typically.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- Zomato Gold/Pro membership may offer free delivery and discounts.
- Restaurants may be closed outside operating hours — check availability.
- Surge pricing ("Surge fee") may apply during peak hours — inform user.
- Platform fee (₹3-7) is standard — do not confuse with delivery fee.
- Minimum order value may apply per restaurant.
- Zomato shows "Order Online" vs "Dine-in" — always use "Order Online" for delivery.
- Some items marked "Bestseller" — prioritize these if user is unsure.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
