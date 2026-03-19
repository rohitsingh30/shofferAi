---
name: zepto-grocery
description: Order groceries from Zepto with 10-15 minute delivery.
triggers:
  - zepto
  - order from zepto
  - zepto grocery
  - zeptonow
  - order on zepto
siteUrl: https://www.zeptonow.com
requiresAuth: true
params:
  - name: items
    required: true
    hint: List of items to order
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# Zepto Grocery Ordering

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### Step 0: Collect delivery address and shopping list
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **address** (type: "address", required): Ask for delivery address. Show saved addresses if available.
2. **items** (type: "card_grid", required): Ask what items to buy. Show common grocery items as cards with emoji (🥛 Milk, 🍞 Bread, 🥚 Eggs, 🍚 Rice, 🌾 Atta, 🫒 Oil, 🍬 Sugar, 🫘 Dal, 🧈 Butter, 🍌 Banana, 🧅 Onion, 🥔 Potato). Enable quantity steppers and custom item input.

**CRITICAL**: Do NOT open the browser until you have both the delivery address and at least one item. Without a delivery location, these sites show ZERO products.

### 1. Open Zepto & Set Location
- Open a NEW tab and navigate to `https://www.zeptonow.com`.
- Take snapshot. Verify logged in (account icon in header).
- If location popup appears, search for user's delivery address and select it.
- If NOT logged in, login transparently using operator credentials via `fill_saved_credential`. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Confirm location set and products visible.

### 2. Find & Add Items
For each requested item:
- Search in search bar.
- Take snapshot of results.
- Identify correct product (brand, size, quantity).
- If multiple variants, use `ask_user` (input_type "choice").
- Click "Add" to cart.
- Repeat for all items.

### 3. Cart & Checkout
- Open cart, take snapshot.
- Use `confirm_action` to present order summary with total.
- Select payment method and fill details via `fill_saved_credential`.
- Place order after user confirmation.

### 4. Order Confirmation
- Take snapshot of confirmation page.
- Report: order number, items, total, estimated delivery time.

## Site Notes

- Zepto delivers in 10-15 minutes.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- Product availability varies by area and time.
- Minimum order value may apply.
- Some items may be substituted — ask user about preferences.
