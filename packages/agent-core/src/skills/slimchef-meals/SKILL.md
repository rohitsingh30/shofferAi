---
name: slimchef-meals
description: Order calorie-counted, macro-balanced meals from SlimChef or fitness meal delivery services — diet plans, single meals, or subscriptions.
triggers:
  - slimchef
  - slim chef
  - calorie counted meals
  - fitness meals delivery
  - diet food delivery
  - order healthy meals
  - macro balanced meals
  - weight loss meal plan
  - gym diet delivery
siteUrl: https://www.slimchef.in
requiresAuth: true
params:
  - name: meal_type
    required: true
    hint: Meal type or plan (e.g. "weight loss plan", "high protein lunch", "keto meals", "full day meal plan")
  - name: diet_preference
    required: false
    hint: Dietary preference (veg, non-veg, eggetarian, vegan, keto, low-carb)
  - name: duration
    required: false
    hint: Plan duration (single meal, 1 week, 2 weeks, 1 month subscription)
---

# SlimChef Fitness Meal Order

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### Step 0: Collect order preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **address** (type: "address", required): Ask for delivery address. Show saved addresses.
2. **cuisine** (type: "carousel", required): Show cuisine options as scrollable cards (🥘 Biryani, 🍕 Pizza, 🍔 Burger, 🍱 Thali, 🥡 Chinese, 🥞 South Indian, 🌯 Rolls, 🍰 Dessert). Allow typing specific restaurant/dish.
3. **dietary** (type: "chip_bar", collapsed): Dietary preferences — 🟢 Veg only, 🔴 Non-veg OK, Jain, No onion, No garlic.

**CRITICAL**: Do NOT open the browser until you have the delivery address. Without it, the site cannot show relevant restaurants.

### 1. Gather Requirements
- Identify what the user wants: single meal order, daily plan, or subscription.
- If the user is vague (e.g. "want healthy meals delivered"), use `ask_user` (input_type "freetext"):
  "What are you looking for? Options: Single Meals (lunch/dinner), Full Day Plan (breakfast + lunch + snack + dinner), Weekly Subscription, or Monthly Subscription. What's your goal — weight loss, muscle gain, maintenance, or general healthy eating?"
- Ask about key preferences:
  - Diet: veg, non-veg, eggetarian, vegan, keto, low-carb.
  - Calorie target: 1200/1500/1800/2000+ kcal per day.
  - Allergies: nuts, dairy, gluten, soy.
  - Delivery time: lunch, dinner, or both.
- Use `ask_user` for any missing critical info.

### 2. Open SlimChef & Verify Login
- Open a NEW tab and navigate to `https://www.slimchef.in` (or the relevant fitness meal provider).
- Take snapshot. Verify logged in (check for account/profile section).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Check if delivery is available at user's location. Use `ask_user` for address if not on file.

### 3. Browse Meal Plans & Menu
- Navigate to meal plans or today's menu. Take snapshot.
- Filter by: diet type (veg/non-veg), calorie range, goal (weight loss/muscle gain), plan duration.
- For meal plans, extract: plan name, meals per day, calorie range, duration, price per day, total price.
- For individual meals, extract: meal name, calories, protein/carbs/fat macro split, price, ingredients.
- Present options using `ask_user` (input_type "choice"):
  "Plan Name — X meals/day — XXXX kcal — ₹XXX/day (₹YYYY total for X days) — Veg/Non-veg"
  OR for single meals:
  "Meal Name — XXX kcal — Protein Xg, Carbs Xg, Fat Xg — ₹XXX — [ingredients summary]"
- Show sample menu for the week if available.

### 4. Customize & Select
- Once plan or meals are selected, check customization options:
  - Swap meals (e.g. replace paneer with chicken).
  - Add/remove meals from a plan.
  - Adjust portion sizes.
  - Select start date for subscription.
  - Choose delivery time slots (morning for breakfast, noon for lunch, evening for dinner).
- Use `ask_user` (input_type "choice") for any customization choices.
- Confirm the final meal selection and schedule.

### 5. Review Order
- Navigate to cart or order summary. Take snapshot.
- Use `confirm_action` to present order summary:
  - Plan name or individual meals selected
  - Calorie and macro breakdown per day
  - Diet type and customizations
  - Duration (days/weeks)
  - Price per day and total price
  - Delivery schedule and time slots
  - Delivery address
  - Start date
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout. Verify delivery address and schedule.
- Apply any available coupon codes (first-order, referral, seasonal).
- Use `collect_payment`:
  - summary: JSON with plan details, meals, duration, daily calories, macros, price breakdown, total
  - amount_inr: total payable amount
  - description: "SlimChef meal plan order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Place Order & Confirm
- Complete the order on SlimChef.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order/subscription ID, plan details, start date, delivery schedule, total paid.
- Nutrition tip: "Your plan provides ~XXXX kcal/day with Xg protein. Stay hydrated and complement with 2-3L water daily."
- Mention: "You can modify tomorrow's meals or pause your subscription from your account dashboard."

## Site Notes

- SlimChef and similar fitness meal providers deliver calorie-counted, macro-balanced meals — ideal for weight loss, muscle gain, or busy professionals.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Session may expire after extended inactivity — if login wall appears, ask user to re-login manually in Chrome Debug.
- Delivery is typically available only in select cities (metro areas) — always check serviceability first.
- Meal plans range from ₹150-400 per meal depending on plan type and city.
- Subscriptions (weekly/monthly) are 15-25% cheaper than single-meal orders.
- Meals are prepared fresh daily and delivered in insulated packaging — consume within 2-3 hours of delivery for best quality.
- Calorie counts are approximate (±10%) — professional kitchen prep, not home-cooked precision.
- Most providers allow same-day cancellation/modification before a cutoff time (usually 8-10 PM previous night).
- Popular plans: 1200 kcal weight loss, 1800 kcal balanced, 2200 kcal muscle gain, Keto, High-Protein.
- Use `confirm_action` for order review, `collect_payment` for checkout. WAIT for user response.
