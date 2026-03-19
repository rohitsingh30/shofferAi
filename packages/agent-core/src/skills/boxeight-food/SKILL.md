---
name: boxeight-food
description: Order food from Box8 — wraps, meals, thalis, combos, sides, delivery, pay.
triggers:
  - box8
  - box 8
  - boxeight
  - box8 order
  - order from box8
  - box8 delivery
  - box8 wraps
  - box8 meals
  - box eight food
  - box8 thali
siteUrl: https://www.box8.in
requiresAuth: true
params:
  - name: items
    required: true
    hint: What to order (e.g. "paneer wrap", "chicken thali", "box8 combo") or just "food"
  - name: address
    required: false
    hint: Delivery address or area name
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, wallet)
---

# Box8 Ordering

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
- If not, use `ask_user` (input_type "freetext"): "What's your delivery address or area name for Box8 delivery?"
- Box8 operates in select cities — address determines outlet availability.

### 2. Open Box8 & Set Location
- Open a NEW tab and navigate to `https://www.box8.in`.
- Take snapshot. Verify logged in (account/profile icon in header).
- If location popup or address selector appears, type the user's address, wait for suggestions, click best match.
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Confirm delivery available to user's area and menu visible.

### 3. Browse Menu & Select Items
- If user named specific items (Paneer Wrap, Chicken Biryani, Dal Makhani Thali), search to find them.
- If generic request, present menu categories: Wraps, Meals & Thalis, Rice & Biryanis, Combos, Sides, Desserts, Beverages.
- Use `ask_user` (input_type "choice") to let user pick items.
- For wraps:
  - Type: Paneer Tikka, Chicken Tikka, Egg, Aloo — use `ask_user` (input_type "choice") with prices.
  - Size: Regular, Large — use `ask_user` with prices if available.
- For meals/thalis:
  - Type: Dal Makhani Thali, Butter Chicken Thali, Veg Thali, Non-Veg Thali — use `ask_user` with prices.
  - Thalis include roti/rice, dal, sabzi, salad — describe contents.
- For combos:
  - Present available combos (wrap + drink, meal + dessert) — use `ask_user` with prices.
  - Combos are typically 15-25% cheaper than ordering items separately.
- For biryanis/rice bowls:
  - Veg Biryani, Chicken Biryani, Egg Biryani — use `ask_user` (input_type "choice") with prices.
- Click "Add to Cart" after each item.
- Ask if user wants to add sides (fries, wedges), desserts, or beverages.

### 4. Apply Offers
- Check for available coupons/offers on the cart page.
- Box8 frequently runs combo deals and first-order discounts — apply if beneficial.
- Take snapshot if discount applied.

### 5. Review Cart
- Open cart, take snapshot.
- Use `confirm_action` to present order summary:
  - Each item with variant/size and price
  - Combo details (if applicable)
  - Discounts applied (if any)
  - Subtotal, delivery fee, taxes, total
  - Estimated delivery time (usually 25-40 minutes)
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify delivery address is correct.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with items, variants, sizes, prices, discount, delivery fee, total, estimated time
  - amount_inr: total amount (number)
  - description: "Box8 food order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Place Order & Confirm
- Click "Place Order" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order number, items ordered, total paid, estimated delivery time, tracking link if visible.

## Site Notes

- Box8 delivery typically takes 25-40 minutes with food prepared in their own kitchens.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- Box8 operates primarily in Mumbai, Pune, Bengaluru, and Gurgaon — check if user's city is served.
- Box8 runs its own cloud kitchens — food quality is consistent unlike marketplace aggregators.
- Wraps and combos are Box8 signature items — suggest them for first-time users.
- Box8 often has "Meal of the Day" or special lunch offers — check and inform user.
- Minimum order value for free delivery is usually around ₹149-199.
- Box8 uses a modern web stack — always use Playwright fill/type methods.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
