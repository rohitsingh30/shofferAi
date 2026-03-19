---
name: dominos-pizza
description: Order pizza from Domino's India — customize size, crust, toppings, add sides, checkout, pay.
triggers:
  - dominos
  - domino's
  - order pizza
  - pizza delivery
  - dominos pizza
  - order from dominos
  - dominos order
  - pizza from dominos
  - cheese pizza
  - pepperoni pizza
siteUrl: https://www.dominos.co.in
requiresAuth: true
params:
  - name: pizza
    required: true
    hint: What to order (e.g. "margherita", "peppy paneer", "farmhouse") or just "pizza"
  - name: address
    required: false
    hint: Delivery address or area name
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, wallet)
---

# Domino's Pizza Ordering

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
- If not, use `ask_user` (input_type "freetext"): "What's your delivery address or area name for Domino's delivery?"
- Note: Domino's delivers only from nearby outlets — address determines the store.

### 2. Open Domino's & Set Location
- Open a NEW tab and navigate to `https://www.dominos.co.in`.
- Take snapshot. Verify logged in (profile/account icon in header).
- If location popup appears, type the user's address, wait for suggestions, click best match.
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Confirm nearest store assigned and menu visible.

### 3. Browse Menu & Customize Pizza
- If user named a specific pizza, search or navigate to find it in the menu.
- If user said something generic like "pizza", present popular categories: Veg Pizza, Non-Veg Pizza, Sides, Beverages.
- Use `ask_user` (input_type "choice") to let user pick a pizza.
- For each pizza, handle customization:
  - Size: Regular, Medium, Large — use `ask_user` (input_type "choice") with prices.
  - Crust: Classic Hand Tossed, Wheat Thin Crust, New Hand Tossed, Cheese Burst — use `ask_user`.
  - Extra toppings: present available toppings, use `ask_user` (input_type "choice") for each.
- Click "Add to Cart" after each customization.
- Ask if user wants to add sides (garlic bread, chicken wings, pasta, desserts) or beverages.

### 4. Apply Offers
- Check for available coupons/offers on the cart page.
- If beneficial offers exist, inform user and apply the best one.
- Take snapshot showing applied discount.

### 5. Review Cart
- Open cart, take snapshot.
- Use `confirm_action` to present order summary:
  - Each pizza with size, crust, toppings, and price
  - Sides and beverages with prices
  - Discount applied (if any)
  - Subtotal, delivery fee, taxes, total
  - Estimated delivery time (usually 30 minutes)
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify delivery address is correct.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with pizzas, sides, prices, discount, delivery fee, total, estimated time
  - amount_inr: total amount (number)
  - description: "Domino's pizza order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Place Order & Confirm
- Click "Place Order" or "Pay Now".
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order number, items ordered, total paid, estimated delivery time, Domino's tracker link if visible.

## Site Notes

- Domino's India guarantees 30-minute delivery in most areas.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- Domino's frequently runs offers (Buy 1 Get 1, 50% off on ₹600+) — always check and apply best coupon.
- Cheese Burst crust costs extra (₹100-150 depending on size) — inform user before selecting.
- Minimum order value may apply for delivery.
- Some items may be unavailable at the assigned outlet — suggest alternatives.
- Domino's uses a React-based SPA — always use Playwright fill/type methods.
- Veg and non-veg pizzas are clearly marked with green/red icons.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
