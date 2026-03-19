---
name: subway-order
description: Order from Subway India — customize subs with bread, protein, veggies, sauce, add sides, checkout, pay.
triggers:
  - subway
  - order from subway
  - subway delivery
  - subway order
  - sub sandwich
  - subway sandwich
  - footlong
  - subway sub
  - order sub
  - veggie delight
siteUrl: https://www.subway.com/en-IN
requiresAuth: true
params:
  - name: food
    required: true
    hint: What to order (e.g. "chicken teriyaki sub", "veggie delight", "paneer tikka") or just "sub"
  - name: address
    required: false
    hint: Delivery address or area name
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# Subway India Ordering

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
- If not, use `ask_user` (input_type "freetext"): "What's your delivery address or area name for Subway delivery?"
- Subway delivers only from nearby outlets — address determines the store.

### 2. Open Subway & Set Location
- Open a NEW tab and navigate to `https://www.subway.com/en-IN` or the Subway India ordering portal.
- Take snapshot. Verify logged in (account/profile icon in header).
- If location popup appears, type the user's address, wait for suggestions, click best match.
- Select "Delivery" mode if prompted (vs Pickup).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Confirm nearest outlet assigned and menu visible.

### 3. Browse Menu & Customize Sub
- If user named a specific sub (Chicken Teriyaki, Veggie Delight, Paneer Tikka), navigate to find it.
- If generic request, present sub categories: Veg Subs, Non-Veg Subs, Wraps, Salads, Sides, Beverages.
- Use `ask_user` (input_type "choice") to let user pick a sub.
- For each sub, handle full customization chain:
  - **Bread**: Italian, Wheat, Multigrain, Parmesan Oregano, Flatbread — use `ask_user` (input_type "choice").
  - **Size**: 6-inch (Sub) vs Footlong — use `ask_user` with prices.
  - **Protein**: If applicable, choose protein variant — use `ask_user`.
  - **Cheese**: American, Cheddar, Mozzarella, None — use `ask_user`.
  - **Toast**: Toasted or Not — use `ask_user`.
  - **Veggies**: Lettuce, Tomato, Onion, Capsicum, Jalapeño, Olives, Pickle, Corn — use `ask_user` (input_type "choice", multi-select).
  - **Sauce**: Mayonnaise, Southwest Chipotle, Honey Mustard, BBQ, Tandoori, Mint Mayo, None — use `ask_user`.
- Click "Add to Cart" after customization.
- Ask if user wants to add more subs, sides (cookies, chips), or beverages.

### 4. Make It a Meal
- If user ordered standalone subs, suggest upgrading to a meal (sub + drink + cookie/chips).
- Use `ask_user` (input_type "choice") with meal pricing.
- Apply meal upgrade if selected.

### 5. Review Cart
- Open cart, take snapshot.
- Use `confirm_action` to present order summary:
  - Each sub with bread, size, protein, toppings, sauce, and price
  - Sides and beverages with prices
  - Meal upgrades applied
  - Subtotal, delivery fee, taxes, total
  - Estimated delivery time (usually 30-40 minutes)
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify delivery address is correct.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with subs (incl. customizations), sides, prices, delivery fee, total, estimated time
  - amount_inr: total amount (number)
  - description: "Subway order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Place Order & Confirm
- Click "Place Order" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order number, items ordered with customizations, total paid, estimated delivery time.

## Site Notes

- Subway India delivery usually takes 30-40 minutes.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- Subway SubClub loyalty points may be available — mention if applicable.
- Subway's customization flow is sequential (bread → size → protein → cheese → toast → veggies → sauce) — follow this exact order.
- "Sub of the Day" offers a discounted sub each day of the week — mention if it matches user's request.
- Footlong is usually better value than two 6-inch subs — suggest it for hungry users.
- Minimum order value for delivery is usually ₹149-199.
- Veg and non-veg subs are clearly separated in the menu.
- Subway India may use Swiggy/Zomato for delivery in some cities — if direct ordering is unavailable, inform user and offer to order via aggregator.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
