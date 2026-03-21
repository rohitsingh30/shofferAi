---
name: eatsure-food
description: Order food from EatSure multi-brand kitchen — Behrouz Biryani, Faasos, Oven Story Pizza, and more.
triggers:
  - eatsure
  - eatsure order
  - behrouz biryani
  - faasos order
  - oven story pizza
  - eatsure food
  - order from eatsure
  - rebel foods
  - mandarin oak
  - lunchbox order
siteUrl: https://www.eatsure.com
requiresAuth: true
params:
  - name: food
    required: false
    hint: What to order (e.g. "biryani", "pizza", "wraps", "Chinese")
  - name: brand
    required: false
    hint: Specific brand (e.g. "Behrouz", "Faasos", "Oven Story")
  - name: address
    required: false
    hint: Delivery address
---

# EatSure Multi-Brand Food Ordering

Chrome profile: rsinghtomar3011@gmail.com. Operator EatSure account logged in.

## Steps

### Step 0: Confirm delivery address & order preferences
**ALWAYS show the address picker** — even if the user mentioned a location like "Tellapur" or "Koramangala". An area name is NOT a complete delivery address (missing flat/building, street, pincode, phone). The user must pick a saved address or enter a full one. The address widget collects flat/building, street, city, pincode, AND contact phone — all critical for delivery.

Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **address** (type: "address", required): Confirm delivery address. Show saved addresses. If the user mentioned an area, pre-fill it:
   ```json
   {"saved": [{"label": "Home", "value": "C-502, Honer Aquantis, Tellapur"}, {"label": "Office", "value": "T-Hub, Raidurg, Hyderabad"}]}
   ```
2. **cuisine** (type: "carousel", required): Show cuisine options as scrollable cards (🥘 Biryani, 🍕 Pizza, 🍔 Burger, 🍱 Thali, 🥡 Chinese, 🥞 South Indian, 🌯 Rolls, 🍰 Dessert). Allow typing specific restaurant/dish.
3. **dietary** (type: "chip_bar", collapsed): Dietary preferences — 🟢 Veg only, 🔴 Non-veg OK, Jain, No onion, No garlic.

- **Only skip the address picker** if the user provided a FULL address with building/flat, street, city, pincode, AND phone number (e.g. "E111, Ridgewood Estate, DLF Garden City, Pune 411032").

**CRITICAL**: Do NOT open the browser until you have a complete delivery address with phone. Without it, EatSure cannot show relevant restaurants.

### 1. Gather Requirements
- Check if user specified food type, brand, or cuisine.
- If not specified, use `ask_user` (input_type "freetext"): "What would you like to eat? EatSure has Behrouz Biryani, Faasos (wraps), Oven Story (pizza), Mandarin Oak (Chinese), LunchBox (meals), and more."
- If address not provided, use `ask_user` (input_type "freetext"): "What's your delivery address?"
- Note dietary preferences: veg/non-veg, spice level.

### 2. Open EatSure
- Open a NEW tab and navigate to `https://www.eatsure.com`.
- Take a snapshot to verify page loaded.
- Check if logged in (profile/account icon visible).
- **If NOT logged in or session expired, STOP and tell user: "EatSure session expired, please re-login in Chrome Debug."**
- Do NOT ask user for credentials.
- Set delivery location if prompted.

### 3. Verify Login & Set Location
- Take snapshot confirming EatSure with correct delivery address.
- If area not serviceable, inform user and STOP.
- Check available brands for the delivery location.
- Take snapshot showing available brands and delivery time.

### 4. Browse & Select Brand/Items
- If user specified a brand (Behrouz, Faasos, etc.), navigate to that brand's menu.
- If user specified food type, search across brands.
- Take snapshot of menu options.
- EatSure allows ordering from multiple brands in ONE order — mention this to user.
- For each item to order:
  - Present options using `ask_user` (input_type "choice"):
    - Item name, brand, price, rating, veg/non-veg indicator
  - Handle customizations (size, add-ons, spice level).
  - Click "Add" to add to cart.
- Repeat for all items.

### 5. Review Cart
- Click cart to review order.
- Take snapshot of cart.
- Use `confirm_action` to present order summary:
  - Each item: brand, name, customizations, price
  - Subtotal, delivery fee, taxes, total
  - Estimated delivery time
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Checkout" or "Place Order".
- Verify delivery address.
- Apply any available coupons/offers.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with brands, items, subtotal, delivery fee, taxes, coupon discount, total
  - amount_inr: total amount (number)
  - description: "EatSure food order"
- STOP and WAIT for payment confirmation.
- Only proceed if payment confirmed.

### 7. Place Order & Confirm
- Complete order on EatSure.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of order confirmation.
- Report: order ID, items from each brand, total paid, estimated delivery time.

## Site Notes

- EatSure is by Rebel Foods — houses 10+ brands under one kitchen.
- Key brands: Behrouz Biryani, Faasos (wraps/rolls), Oven Story (pizza), Mandarin Oak (Chinese), LunchBox (Indian meals), Sweet Truth (desserts).
- Unique selling point: order from multiple brands in a single order, single delivery.
- Operator Chrome Profile 3 is logged in. Do NOT ask user for phone or credentials.
- Session managed by cookies. If expired, operator re-logins in Chrome Debug.
- EatSure uses React SPA — wait for menu items to load dynamically.
- Free delivery on orders above certain amount (usually Rs 149-199).
- Combo deals across brands often available — suggest to save money.
- EatSure operates in major Indian metros only — check availability.
- Use `confirm_action` for cart review (no money), `collect_payment` for actual payment.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
