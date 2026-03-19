---
name: chai-point
description: Order chai and snacks from Chai Point — masala chai, iced tea, snacks, combos, delivery to office/home, checkout, pay.
triggers:
  - chai point
  - order from chai point
  - chai point delivery
  - chai delivery
  - order chai
  - chai point order
  - masala chai delivery
  - office chai
  - tea delivery
siteUrl: https://www.chaipoint.com
requiresAuth: true
params:
  - name: drink
    required: true
    hint: What to order (e.g. "masala chai", "iced tea", "chai + samosa combo") or just "chai"
  - name: address
    required: false
    hint: Delivery address or office/home area name
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# Chai Point Ordering

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
- If not, use `ask_user` (input_type "freetext"): "What's your delivery address — home or office — for Chai Point delivery?"
- Chai Point operates in Bangalore, Delhi NCR, Mumbai, Hyderabad, Pune — verify city coverage.

### 2. Open Chai Point & Set Location
- Open a NEW tab and navigate to `https://www.chaipoint.com`.
- Take snapshot. Verify logged in (account icon or name in header).
- If location popup appears, enter user's address/area and select best match from suggestions.
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Confirm Chai Point delivers to the user's location.
- If not available on own site, try Swiggy or Zomato: search for "Chai Point".

### 3. Browse Menu & Select Items
- If user named specific items (Masala Chai, Ginger Chai, Iced Chai Latte), navigate to find them.
- If generic request, present menu categories: Hot Chai, Iced Chai, Specialty Teas, Coffee, Snacks (Samosa, Maggi, Sandwich), Combos.
- Use `ask_user` (input_type "choice") to let user pick items.
- For chai, present options:
  - Type: Masala Chai / Ginger Chai / Elaichi Chai / Adrak Chai / Kulhad Chai — use `ask_user` (input_type "choice") with prices.
  - Size: Regular / Large / Flask (for groups) — present with prices.
  - Sugar: Regular / Less Sugar / No Sugar — use `ask_user`.
- For combos:
  - Chai + Samosa / Chai + Maggi / Chai + Sandwich — present with savings.
  - Office Party Pack (Flask + Snacks for 4-6 people) — present for group orders.
- Click "Add to Cart" after each item.
- Ask if user wants to add snacks: Butter Croissant, Veg Puff, Paneer Tikka Sandwich, Cookies.

### 4. Apply Offers
- Check for available coupons/offers on the page.
- Chai Point has loyalty rewards (ChaiCoins) and bulk discounts — apply if beneficial.
- Take snapshot if discount applied.

### 5. Review Cart
- Open cart, take snapshot.
- Use `confirm_action` to present order summary:
  - Each item with size, variant, and price
  - Coupons/discounts or ChaiCoins applied
  - Subtotal, delivery fee, taxes, total
  - Estimated delivery time (usually 15-30 minutes)
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify delivery address is correct.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with items, sizes, prices, discount, delivery fee, total, estimated time
  - amount_inr: total amount (number)
  - description: "Chai Point order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Place Order & Confirm
- Click "Place Order" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order number, items ordered, total paid, estimated delivery time.

## Site Notes

- Chai Point is India's largest organized chai delivery chain — operates in 6+ major cities.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- Chai Point's Flask option (serves 4-6 cups) is ideal for office group orders — always suggest for 3+ people.
- Delivery is fast — usually 15-30 minutes for chai (they optimize for hot beverage delivery).
- Chai Point uses IoT-enabled brewing (they are serious about consistency) — quality is reliable.
- ChaiCoins loyalty program gives cashback — operator account may have balance.
- If Chai Point website redirects to an app-only experience, fall back to Swiggy/Zomato.
- Minimum order value for free delivery varies by city — usually around 99-149.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
