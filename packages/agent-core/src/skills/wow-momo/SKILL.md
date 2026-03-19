---
name: wow-momo
description: Order momos from Wow! Momo — steamed, fried, baked momos, momo bowls, combos, checkout, pay.
triggers:
  - wow momo
  - order from wow momo
  - wow momo delivery
  - momo delivery
  - order momos
  - wow momo order
  - steamed momos
  - fried momos
  - baked momos
siteUrl: https://www.wowmomo.com
requiresAuth: true
params:
  - name: food
    required: true
    hint: What to order (e.g. "steamed momos", "fried momos", "momo bowl", "wow combo") or just "momos"
  - name: address
    required: false
    hint: Delivery address or area name
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# Wow! Momo Ordering

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
- If not, use `ask_user` (input_type "freetext"): "What's your delivery address or area for Wow! Momo delivery?"
- Wow! Momo delivers via Swiggy/Zomato or its own website — address determines outlet availability.

### 2. Open Wow! Momo & Set Location
- Open a NEW tab and navigate to `https://www.wowmomo.com/order-online`.
- Take snapshot. Verify logged in (account icon or name in header).
- If location popup appears, enter user's address/area and select best match from suggestions.
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Confirm a Wow! Momo outlet is available at the delivery location.
- If not available on own site, try Swiggy: navigate to `https://www.swiggy.com` and search "Wow Momo".

### 3. Browse Menu & Select Items
- If user named specific items (Steamed Chicken Momos, Darjeeling Momos, Momo Burger), navigate to find them.
- If generic request, present menu categories: Steamed Momos, Fried Momos, Baked Momos, Sizzler Momos, Momo Bowls, Wow Burgers, Dessert Momos, Beverages.
- Use `ask_user` (input_type "choice") to let user pick items.
- For momos, present variant options:
  - Filling: Chicken / Paneer / Veg / Corn & Cheese — use `ask_user` (input_type "choice") with prices.
  - Portion: 4pc / 6pc / 8pc where applicable — present with prices.
- For combos:
  - Wow Combos (momos + drink + side) — present with savings.
  - Family packs for parties — present with prices.
- Click "Add to Cart" after each item.
- Ask if user wants to add Momo Bowls (momos in gravy), Wow Burgers, or Choco Lava Momos for dessert.

### 4. Apply Offers
- Check for available coupons/offers on the page.
- Wow! Momo often has combo deals and first-order discounts — apply if beneficial.
- Take snapshot if discount applied.

### 5. Review Cart
- Open cart, take snapshot.
- Use `confirm_action` to present order summary:
  - Each item with variant, portion size, and price
  - Coupons/discounts applied
  - Subtotal, delivery fee, taxes, total
  - Estimated delivery time (usually 25-40 minutes)
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify delivery address is correct.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with items, variants, prices, discount, delivery fee, total, estimated time
  - amount_inr: total amount (number)
  - description: "Wow Momo order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Place Order & Confirm
- Click "Place Order" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order number, items ordered, total paid, estimated delivery time.

## Site Notes

- Wow! Momo has 500+ outlets across India — most cities have coverage.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- Wow! Momo's bestsellers are Darjeeling Steamed Momos and Baked Cheese Momos — suggest these for first-timers.
- Steamed momos are the healthiest option, fried are the most popular — mention this to help user decide.
- Sizzler Momos (served on a hot plate with gravy) are dine-in only — not available for delivery.
- Choco Lava Momos and Chocolate Momos are unique dessert items — worth mentioning.
- If the Wow! Momo website is down, fall back to Swiggy or Zomato search.
- Wow! Momo site may use a third-party ordering widget — handle iframes carefully with Playwright.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
