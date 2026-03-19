---
name: uber-eats
description: Order food on Uber Eats — browse restaurants, select dishes, add to cart, checkout, pay.
triggers:
  - uber eats
  - order uber eats
  - food on uber eats
  - uber eats delivery
  - uber eats order
  - uber eats restaurant
  - order food uber
  - uber eats meal
siteUrl: https://www.ubereats.com
requiresAuth: true
params:
  - name: food
    required: false
    hint: What food to order (e.g. "pizza", "biryani", "healthy salad")
  - name: restaurant
    required: false
    hint: Specific restaurant name if any
  - name: address
    required: false
    hint: Delivery address
  - name: budget
    required: false
    hint: Budget for the order
---

# Uber Eats Food Ordering

Chrome profile: rsinghtomar3011@gmail.com. Operator Uber account logged in.

## Steps

### Step 0: Collect order preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **address** (type: "address", required): Ask for delivery address. Show saved addresses.
2. **cuisine** (type: "carousel", required): Show cuisine options as scrollable cards (🥘 Biryani, 🍕 Pizza, 🍔 Burger, 🍱 Thali, 🥡 Chinese, 🥞 South Indian, 🌯 Rolls, 🍰 Dessert). Allow typing specific restaurant/dish.
3. **dietary** (type: "chip_bar", collapsed): Dietary preferences — 🟢 Veg only, 🔴 Non-veg OK, Jain, No onion, No garlic.

**CRITICAL**: Do NOT open the browser until you have the delivery address. Without it, the site cannot show relevant restaurants.

### 1. Gather Requirements
- Check if user specified food items, restaurant, or cuisine preference.
- If no specifics, use `ask_user` (input_type "freetext"): "What would you like to eat? Any cuisine or restaurant preference?"
- If address not set, use `ask_user` (input_type "freetext"): "What's your delivery address?"
- Note dietary preferences or restrictions if mentioned.

### 2. Open Uber Eats
- Open a NEW tab and navigate to `https://www.ubereats.com`.
- Take a snapshot to verify page loaded.
- Check if logged in (profile icon / account name visible).
- **If NOT logged in or session expired, STOP and tell user: "Uber Eats session expired, please re-login in Chrome Debug."**
- Do NOT ask user for credentials.
- Set delivery address if prompted or if wrong address shown.

### 3. Verify Login & Set Location
- Take snapshot confirming Uber Eats page with correct delivery location.
- If location not serviceable, inform user and STOP.
- Check estimated delivery time shown for the area.
- Take snapshot showing available restaurants.

### 4. Browse & Select Restaurant
- If user specified a restaurant, search for it directly.
- If user specified food/cuisine, search or browse relevant categories.
- Take snapshot of restaurant options.
- Present top 5 restaurants using `ask_user` (input_type "choice"):
  - Restaurant name, cuisine, rating, delivery time, delivery fee, minimum order
- User selects restaurant.
- Click on restaurant to view menu.
- Take snapshot of menu.

### 5. Select Items
- Browse menu and take snapshot.
- For each item user wants:
  - If user specified items, find them on menu.
  - If browsing, present popular items using `ask_user` (input_type "choice").
  - Click on item, handle customization options (size, toppings, spice level).
  - Use `ask_user` (input_type "choice") for customizations if needed.
  - Click "Add to Cart".
- Repeat for all items.
- Take snapshot of cart.

### 6. Review Cart
- Click cart icon to review order.
- Take snapshot of full cart.
- Use `confirm_action` to present order summary:
  - Each item: name, customizations, price
  - Subtotal, delivery fee, taxes, tip suggestion, grand total
  - Estimated delivery time
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 7. Checkout & Payment
- Click "Place Order" / "Checkout".
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with restaurant, items, subtotal, delivery fee, taxes, total, ETA
  - amount_inr: total amount (number)
  - description: "Uber Eats food order"
- STOP and WAIT for payment confirmation.
- Only proceed if payment confirmed.

### 8. Place Order & Confirm
- Complete the order on Uber Eats.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of order confirmation.
- Report: order number, restaurant, items, total paid, estimated delivery time.

## Site Notes

- Uber Eats availability varies by city in India — limited to select metros.
- If Uber Eats is not available, suggest Swiggy or Zomato as alternatives.
- Delivery fees vary by distance and demand (surge pricing during peak hours).
- Operator Chrome Profile 3 is logged in. Do NOT ask user for phone or credentials.
- Uber Eats uses React — wait for restaurant listings and menus to render.
- Session managed by cookies. If expired, operator re-logins in Chrome Debug.
- Tip is optional but encouraged — ask user about tip preference.
- Promo codes may be available — check promos section before checkout.
- Minimum order amounts vary by restaurant.
- Use `confirm_action` for cart review (no money), `collect_payment` for actual payment.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
