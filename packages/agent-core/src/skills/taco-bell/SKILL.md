---
name: taco-bell
description: Order from Taco Bell India — tacos, burritos, quesadillas, Mexican combos, checkout, pay.
triggers:
  - taco bell
  - order from taco bell
  - taco bell delivery
  - taco bell order
  - tacos delivery
  - burrito delivery
  - order tacos
  - mexican food delivery
  - quesadilla order
siteUrl: https://www.tacobell.co.in
requiresAuth: true
params:
  - name: food
    required: true
    hint: What to order (e.g. "crunchy taco", "burrito", "quesadilla", "mexican combo") or just "tacos"
  - name: address
    required: false
    hint: Delivery address or area name
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# Taco Bell India Ordering

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
- If not, use `ask_user` (input_type "freetext"): "What's your delivery address or area for Taco Bell delivery?"
- Taco Bell India has limited outlets — primarily in Delhi NCR, Mumbai, Bangalore, Hyderabad, Pune, Chennai.

### 2. Open Taco Bell & Set Location
- Open a NEW tab and navigate to `https://www.tacobell.co.in/order`.
- Take snapshot. Verify logged in (account icon or name in header).
- Select "Delivery" mode if prompted (vs Dine-in/Takeaway).
- If location popup appears, enter user's address/area and select best match from suggestions.
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Confirm nearest Taco Bell outlet can deliver to user's location.
- If no delivery outlet nearby, inform user and suggest Swiggy/Zomato as alternative: search "Taco Bell".

### 3. Browse Menu & Select Items
- If user named specific items (Crunchy Taco, Burrito Supreme, Mexican Pizza), navigate to find them.
- If generic request, present menu categories: Tacos, Burritos, Quesadillas, Nachos, Combos, Value Menu, Sides, Beverages, Desserts.
- Use `ask_user` (input_type "choice") to let user pick items.
- For tacos, present options:
  - Type: Crunchy Taco / Soft Taco / Chalupa — use `ask_user` (input_type "choice") with prices.
  - Filling: Veg / Chicken / Paneer — present with prices.
  - Make it a meal: Add Fries + Drink — present upgrade price.
- For combos:
  - Solo Combos (1 main + side + drink) — present options.
  - Party Packs (feeds 2-4 people) — present with savings.
  - Value Deals (affordable options under 200) — highlight for budget-conscious users.
- Click "Add to Cart" after each item.
- Ask if user wants to add Nachos, Churros, or Mexican Rice on the side.

### 4. Apply Offers
- Check for available coupons/offers on the page.
- Taco Bell often has Taco Tuesday deals and combo discounts — apply if beneficial.
- Take snapshot if discount applied.

### 5. Review Cart
- Open cart, take snapshot.
- Use `confirm_action` to present order summary:
  - Each item with variant, filling, and price
  - Combo details with individual items listed
  - Coupons/discounts applied
  - Subtotal, delivery fee, taxes, total
  - Estimated delivery time (usually 30-45 minutes)
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify delivery address is correct.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with items, variants, prices, discount, delivery fee, total, estimated time
  - amount_inr: total amount (number)
  - description: "Taco Bell order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Place Order & Confirm
- Click "Place Order" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order number, items ordered, total paid, estimated delivery time.

## Site Notes

- Taco Bell India has around 100 outlets — limited compared to other QSRs, so check delivery availability first.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- Taco Bell India menu is heavily Indianized — items like Paneer Tikka Burrito and Crispy Potato Taco are India-exclusive.
- Tuesday is "Taco Tuesday" with special deals — mention if ordering on a Tuesday.
- Value menu items start around 49-99 — great for budget orders.
- Taco Bell India site may redirect to Swiggy/Zomato for delivery — handle the redirect gracefully.
- Quesadillas and Nachos are shareable — suggest for group orders of 2+ people.
- Taco Bell site uses a standard ordering platform — use Playwright fill/type methods.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
