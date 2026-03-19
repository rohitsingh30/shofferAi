---
name: bigbasket-grocery
description: Order groceries from BigBasket — search products, add to cart, schedule delivery, pay.
triggers:
  - bigbasket
  - big basket
  - order from bigbasket
  - bigbasket grocery
  - bb grocery
  - bigbasket order
siteUrl: https://www.bigbasket.com
requiresAuth: true
params:
  - name: items
    required: true
    hint: List of items to order (e.g. "rice 5kg, dal, cooking oil")
  - name: address
    required: false
    hint: Delivery address or area name
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, wallet)
---

# BigBasket Grocery Ordering

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### Step 0: Collect delivery address and shopping list
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **address** (type: "address", required): Ask for delivery address. Show saved addresses if available.
2. **items** (type: "card_grid", required): Ask what items to buy. Show common grocery items as cards with emoji (🥛 Milk, 🍞 Bread, 🥚 Eggs, 🍚 Rice, 🌾 Atta, 🫒 Oil, 🍬 Sugar, 🫘 Dal, 🧈 Butter, 🍌 Banana, 🧅 Onion, 🥔 Potato). Enable quantity steppers and custom item input.

**CRITICAL**: Do NOT open the browser until you have both the delivery address and at least one item. Without a delivery location, these sites show ZERO products.

### 1. Get Delivery Address
- BEFORE opening the browser, check if user provided an address.
- If not, use `ask_user` (input_type "freetext"): "What's your delivery address or area name?"

### 2. Open BigBasket & Set Location
- Open a NEW tab and navigate to `https://www.bigbasket.com`.
- Take snapshot. Verify logged in (account/profile icon in header).
- If location/pincode popup appears, enter the user's area or pincode, select from suggestions.
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Confirm location set and products visible.

### 3. Search & Add Items
For each item the user requested:
- Use the search bar at top to search for the item.
- Take snapshot of results.
- Find the closest match. Check brand, size/weight, price.
- If multiple variants (brands, sizes), use `ask_user` (input_type "choice") with price info.
- Click "Add" or "+" to add to cart. Adjust quantity if user specified.
- If out of stock, inform user and suggest alternatives.
- Repeat for all items.

### 4. Review Cart
- Click basket/cart icon, take snapshot.
- Use `confirm_action` to present order summary:
  - Each item with quantity, size, and price
  - Subtotal, delivery charges, total
  - Available delivery slots
- Ask user to pick a delivery slot if multiple available.
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 5. Checkout & Payment
- Proceed to checkout.
- Verify delivery address and slot.
- Apply coupons if visible and beneficial.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with items, prices, delivery charge, total, delivery slot
  - amount_inr: total amount (number)
  - description: "BigBasket grocery order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 6. Place Order & Confirm
- Click "Place Order" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order number, items, total paid, delivery slot/date.

## Site Notes

- BigBasket is scheduled delivery (not instant) — delivery slots are usually same-day or next-day.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- BigBasket has a wide catalog (15K+ products) — search is reliable.
- Free delivery above a certain order value (usually ₹500-600).
- bb Daily/Express may offer faster delivery for some areas.
- Products may show MRP vs sale price — always show the effective price.
- Some items are sold by weight (e.g. fruits/veggies) — confirm quantity.
- BigBasket membership (bb Star) may offer extra discounts.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
