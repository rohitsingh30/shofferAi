---
name: eatfit-healthy
description: Order healthy meals from EatFit — browse by calories, diet type, customize meals, checkout, pay.
triggers:
  - eatfit
  - eat fit
  - order from eatfit
  - healthy food
  - healthy meal
  - diet food
  - low calorie food
  - eatfit order
  - order healthy
  - calorie counted meal
siteUrl: https://www.eatfit.in
requiresAuth: true
params:
  - name: food
    required: true
    hint: What to order (e.g. "low calorie thali", "keto meal", "protein bowl") or dietary preference
  - name: address
    required: false
    hint: Delivery address or area name
  - name: diet_preference
    required: false
    hint: Diet type (e.g. "keto", "low carb", "high protein", "vegan", "gluten free")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# EatFit Healthy Meal Ordering

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### Step 0: Collect order preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **address** (type: "address", required): Ask for delivery address. Show saved addresses.
2. **cuisine** (type: "carousel", required): Show cuisine options as scrollable cards (🥘 Biryani, 🍕 Pizza, 🍔 Burger, 🍱 Thali, 🥡 Chinese, 🥞 South Indian, 🌯 Rolls, 🍰 Dessert). Allow typing specific restaurant/dish.
3. **dietary** (type: "chip_bar", collapsed): Dietary preferences — 🟢 Veg only, 🔴 Non-veg OK, Jain, No onion, No garlic.

**CRITICAL**: Do NOT open the browser until you have the delivery address. Without it, the site cannot show relevant restaurants.

### 1. Gather Requirements
- BEFORE opening the browser, check what info user provided (food, address, diet preference).
- If address not provided, use `ask_user` (input_type "freetext"): "What's your delivery address or area name for EatFit delivery?"
- If diet preference not clear, use `ask_user` (input_type "choice"): "Any dietary preference?" with options: No preference, Low Calorie, High Protein, Keto, Low Carb, Vegan, Gluten Free.

### 2. Open EatFit & Set Location
- Open a NEW tab and navigate to `https://www.eatfit.in`.
- Take snapshot. Verify logged in (account/profile icon in header).
- If location popup appears, type the user's address, wait for suggestions, click best match.
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Confirm delivery location set and menu visible.

### 3. Browse Menu by Diet / Calories
- If user specified a diet type, navigate to the corresponding filter or category.
- If user named specific items, search for them in the menu.
- Browse available categories: Thalis, Bowls, Wraps, Salads, Snacks, Smoothies, Desserts.
- For each item, note calorie count and macros (protein, carbs, fat) displayed on the menu.
- Present top 3-5 options to user with:
  - Meal name
  - Calorie count and key macros
  - Price
  - Rating/reviews if visible
  - Diet tags (keto, high protein, etc.)
- Use `ask_user` (input_type "choice") to let user pick meals.

### 4. Customize & Add to Cart
- For each selected meal, handle customization:
  - Portion size if available (regular vs large) — use `ask_user` with prices.
  - Add-ons (extra protein, salad, raita, roti) — use `ask_user`.
  - Spice level if applicable — use `ask_user`.
- Click "Add to Cart" after each item.
- Ask if user wants to add more items: smoothies, snacks, desserts, or beverages.
- Suggest complementary healthy sides based on calorie budget.

### 5. Review Cart
- Open cart, take snapshot.
- Use `confirm_action` to present order summary:
  - Each meal with customizations, calorie count, and price
  - Total calorie count for the entire order
  - Subtotal, delivery fee, taxes, total
  - Estimated delivery time (usually 30-45 minutes)
  - Any offers or discounts applied
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify delivery address is correct.
- Apply coupons if visible and beneficial — inform user.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with meals, calories, prices, delivery fee, total, estimated time
  - amount_inr: total amount (number)
  - description: "EatFit healthy meal order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Place Order & Confirm
- Click "Place Order" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order number, meals ordered with calorie counts, total calories, total paid, estimated delivery time.

## Site Notes

- EatFit specializes in calorie-counted healthy meals — every item shows exact calories and macros.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- EatFit thalis are popular and offer complete balanced meals — suggest for users without specific preference.
- High protein options are great for fitness-focused users — highlight protein content.
- EatFit may not be available in all cities — check delivery availability for user's location.
- Menu changes frequently with seasonal specials — always browse current offerings.
- Minimum order value may apply for free delivery.
- EatFit uses a web-based ordering system — always use Playwright fill/type methods.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
