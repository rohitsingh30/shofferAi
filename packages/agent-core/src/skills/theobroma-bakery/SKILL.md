---
name: theobroma-bakery
description: Order cakes, pastries, and brownies from Theobroma — brownies, cakes, cookies, sandwiches, delivery, pay.
triggers:
  - theobroma
  - theobroma order
  - order from theobroma
  - theobroma delivery
  - theobroma cake
  - theobroma brownies
  - brownie delivery
  - order brownies
  - pastry delivery
  - theobroma pastries
siteUrl: https://www.theobroma.in
requiresAuth: true
params:
  - name: items
    required: true
    hint: What to order (e.g. "brownies", "red velvet cake", "chocolate pastry") or just "cakes"
  - name: address
    required: false
    hint: Delivery address or area name
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, wallet)
---

# Theobroma India Ordering

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
- If not, use `ask_user` (input_type "freetext"): "What's your delivery address or area name for Theobroma delivery?"
- Theobroma delivers from nearby outlets — address determines the store. Currently available mainly in Mumbai, Pune, Delhi NCR, and Bengaluru.

### 2. Open Theobroma & Set Location
- Open a NEW tab and navigate to `https://www.theobroma.in`.
- Take snapshot. Verify logged in (account/profile icon in header).
- If location/city selector appears, select the correct city and enter the user's delivery address.
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Confirm nearest store assigned and product catalog visible.

### 3. Browse Menu & Select Items
- If user named specific items (Overloaded Brownie, Red Velvet Cake, Chocolate Truffle), navigate to find them.
- If generic request, present menu categories: Brownies, Cakes, Pastries, Cookies & Biscuits, Breads, Sandwiches & Savories, Beverages.
- Use `ask_user` (input_type "choice") to let user pick items.
- For brownies:
  - Flavor: Dark Chocolate, Walnut, Overloaded, Salted Caramel — use `ask_user` (input_type "choice") with prices.
  - Quantity: single piece or box of 4/6/12 — use `ask_user` with prices.
- For cakes:
  - Flavor: Chocolate Truffle, Red Velvet, Blueberry Cheesecake, Tiramisu — use `ask_user` with prices.
  - Size: 500g, 1kg, 2kg — use `ask_user` (input_type "choice") with prices.
  - Eggless option if available — ask user preference.
- For pastries:
  - Present available options with prices — use `ask_user` (input_type "choice").
- Click "Add to Cart" after each item.
- Ask if user wants to add more items (cookies, breads, savories, beverages).

### 4. Apply Offers
- Check for available coupons/offers on the cart page.
- Theobroma occasionally runs festive offers and combo deals — apply if beneficial.
- Take snapshot if discount applied.

### 5. Review Cart
- Open cart, take snapshot.
- Use `confirm_action` to present order summary:
  - Each item with variant/size and price
  - Discounts applied (if any)
  - Subtotal, delivery fee, taxes, total
  - Estimated delivery time (usually 45-60 minutes)
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify delivery address is correct.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with items, variants, sizes, prices, discount, delivery fee, total, estimated time
  - amount_inr: total amount (number)
  - description: "Theobroma bakery order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Place Order & Confirm
- Click "Place Order" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order number, items ordered, total paid, estimated delivery time.

## Site Notes

- Theobroma delivery typically takes 45-60 minutes depending on distance and time of day.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- Theobroma is famous for brownies — the Overloaded Brownie and Dark Chocolate Brownie are signature items.
- Cakes above 1kg may require 2-4 hours advance ordering — inform user if selecting large cakes.
- Theobroma currently operates in Mumbai, Pune, Delhi NCR, and Bengaluru only — check delivery availability.
- Eggless options are available for most cakes and brownies — always ask user preference.
- Theobroma products are premium-priced — brownies start at ~₹100, cakes at ~₹500.
- Theobroma uses a modern web stack — always use Playwright fill/type methods.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
