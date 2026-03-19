---
name: mojo-pizza
description: Order pizza from Mojo Pizza (via EatSure) — unique flavors, combos, sides, checkout, pay.
triggers:
  - mojo pizza
  - order from mojo pizza
  - mojo pizza delivery
  - mojo pizza order
  - pizza from mojo
  - eatsure pizza
  - mojo combo
  - cheesy pizza
  - mojo
siteUrl: https://www.eatsure.com/mojo-pizza
requiresAuth: true
params:
  - name: food
    required: true
    hint: What to order (e.g. "farmhouse pizza", "peppy paneer", "pizza combo") or just "pizza"
  - name: address
    required: false
    hint: Delivery address or area name
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# Mojo Pizza Ordering

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
- If not, use `ask_user` (input_type "freetext"): "What's your delivery address or area for Mojo Pizza delivery?"
- Mojo Pizza is a cloud kitchen brand available via EatSure — address determines outlet availability.

### 2. Open EatSure & Set Location
- Open a NEW tab and navigate to `https://www.eatsure.com/mojo-pizza`.
- Take snapshot. Verify logged in (account icon or name in header).
- If location popup appears, enter user's address/area and select best match from suggestions.
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Confirm Mojo Pizza outlet is available at the delivery location.
- If not available, inform user and suggest alternatives like Domino's or Pizza Hut.

### 3. Browse Menu & Select Items
- If user named specific items (Farmhouse, Peppy Paneer, Chicken Tikka Pizza), navigate to find them.
- If generic request, present menu categories: Bestsellers, Veg Pizzas, Non-Veg Pizzas, Combos, Sides, Desserts, Beverages.
- Use `ask_user` (input_type "choice") to let user pick items.
- For pizzas, present size options:
  - Regular (7") / Medium (10") / Large (12") — use `ask_user` (input_type "choice") with prices.
  - Crust options: Classic, Thin Crust, Cheese Burst (where available) — present with prices.
- For combos, highlight value deals:
  - 2 Pizzas + Sides + Drink combos — present with savings vs individual prices.
  - Mojo's "Buy 1 Get 1" offers — mention if available.
- Click "Add to Cart" after each item.
- Ask if user wants to add garlic bread, chicken wings, potato wedges, or desserts.

### 4. Apply Offers
- Check for available coupons/offers on the page.
- EatSure often has Mojo-specific deals and first-order discounts — apply if beneficial.
- Take snapshot if discount applied.

### 5. Review Cart
- Open cart, take snapshot.
- Use `confirm_action` to present order summary:
  - Each pizza with size, crust, toppings and price
  - Sides and beverages with prices
  - Coupons/discounts applied
  - Subtotal, delivery fee, taxes, total
  - Estimated delivery time (usually 25-40 minutes)
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify delivery address is correct.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with items, sizes, prices, discount, delivery fee, total, estimated time
  - amount_inr: total amount (number)
  - description: "Mojo Pizza order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Place Order & Confirm
- Click "Place Order" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order number, items ordered, total paid, estimated delivery time.

## Site Notes

- Mojo Pizza is a cloud kitchen brand by Rebel Foods — delivery only, no dine-in.
- Operator Chrome Profile 3 should be logged in to EatSure. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- Mojo Pizza is known for unique Indian-fusion flavors (Tandoori Paneer, Keema Do Pyaza) — highlight these.
- EatSure bundles Mojo with other Rebel Foods brands (Behrouz, Faasos, Oven Story) — user can mix brands in same cart.
- Mojo often runs "Buy 1 Get 1" deals on medium and large pizzas — always check before ordering.
- Minimum order value for free delivery is usually around 149-199.
- Pizza preparation takes 15-20 minutes plus delivery time — total usually 25-40 minutes.
- EatSure uses a modern React-based site — always use Playwright fill/type methods.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
