---
name: pizzahut-order
description: Order food from Pizza Hut India — browse menu, customize pizza, add sides, checkout, pay.
triggers:
  - pizza hut
  - pizzahut
  - order from pizza hut
  - pizza hut delivery
  - pizza hut order
  - hut pizza
  - pan pizza
  - stuffed crust pizza
siteUrl: https://www.pizzahut.co.in
requiresAuth: true
params:
  - name: food
    required: true
    hint: What to order (e.g. "margherita", "tandoori paneer", "meal for 2") or just "pizza"
  - name: address
    required: false
    hint: Delivery address or area name
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, wallet)
---

# Pizza Hut Ordering

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
- If not, use `ask_user` (input_type "freetext"): "What's your delivery address or area name for Pizza Hut delivery?"
- Pizza Hut assigns the nearest outlet based on the address.

### 2. Open Pizza Hut & Set Location
- Open a NEW tab and navigate to `https://www.pizzahut.co.in`.
- Take snapshot. Verify logged in (account/profile icon in header).
- If location popup or "Delivery/Takeaway" selector appears, choose Delivery and enter user's address.
- Wait for suggestions, click best match.
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Confirm nearest outlet assigned and menu visible.

### 3. Browse Menu & Customize
- If user named a specific item, search or navigate the menu to find it.
- If generic request, present menu categories: Pizzas, Sides, Pasta, Beverages, Combos/Meal Deals.
- Use `ask_user` (input_type "choice") to let user pick items.
- For each pizza, handle customization:
  - Size: Personal, Medium, Large, Family — use `ask_user` (input_type "choice") with prices.
  - Crust: Pan, Stuffed Crust, Thin 'N Crispy, Hand Stretched — use `ask_user`.
  - Extra toppings if available — present options with prices.
- Click "Add to Cart" after customization.
- Check if user wants to add sides (garlic bread, wedges, wings), pasta, desserts, or beverages.
- If meal deals/combos offer better value, suggest them to user.

### 4. Apply Offers
- Check for available coupons/offers.
- Pizza Hut often has combo deals — inform user if switching to a combo saves money.
- Apply the best coupon if beneficial.

### 5. Review Cart
- Open cart, take snapshot.
- Use `confirm_action` to present order summary:
  - Each item with size, crust, toppings, and price
  - Sides, beverages with prices
  - Discount applied (if any)
  - Subtotal, delivery charges, taxes, total
  - Estimated delivery time
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify delivery address is correct.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with items, sizes, prices, discount, delivery charge, total, estimated time
  - amount_inr: total amount (number)
  - description: "Pizza Hut order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Place Order & Confirm
- Click "Place Order" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order number, items ordered, total paid, estimated delivery time.

## Site Notes

- Pizza Hut India delivery usually takes 30-45 minutes.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- Pizza Hut's signature is Pan Pizza — it's the default crust if user doesn't specify.
- Stuffed Crust costs extra — inform user before selecting.
- Combo/meal deals often offer 30-50% savings vs ordering individually.
- Minimum order value may apply for free delivery.
- Some outlets have limited menus — check availability after outlet assignment.
- Pizza Hut uses a React SPA — always use Playwright fill/type methods.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
