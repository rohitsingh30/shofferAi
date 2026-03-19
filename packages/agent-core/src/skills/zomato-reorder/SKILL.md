---
name: zomato-reorder
description: Reorder last food order from Zomato — view order history, repeat a previous order, checkout, pay.
triggers:
  - reorder zomato
  - zomato reorder
  - repeat zomato order
  - zomato last order
  - order again zomato
  - zomato order history
  - same order zomato
  - reorder from zomato
  - zomato previous order
  - repeat last zomato
siteUrl: https://www.zomato.com
requiresAuth: true
params:
  - name: order_hint
    required: false
    hint: Which order to repeat (e.g. "last order", "biryani from yesterday", "the pizza order")
  - name: address
    required: false
    hint: Delivery address or area name
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# Zomato Reorder — Repeat Previous Order

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
- If not, use `ask_user` (input_type "freetext"): "What's your delivery address or area name?"
- Note: The reorder may default to the original delivery address — we'll verify.

### 2. Open Zomato & Verify Login
- **CRITICAL**: Zomato homepage (`zomato.com`) is app-only — it shows NO restaurants, only "Download the app" prompts. You MUST bypass it.
- Open a NEW tab and navigate directly to the **city delivery page**: `https://www.zomato.com/{city}/restaurants?category=1`
  - Use `ncr` for Delhi/NCR, `bangalore` for Bangalore, `mumbai` for Mumbai, etc.
- Take snapshot. Verify logged in (profile icon in header).
- If location popup appears, type the user's address, wait for suggestions, click best match.
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Confirm location set and restaurants visible. Then navigate to order history.

### 3. Navigate to Order History
- Click on profile/account icon, then navigate to "Order History" or "My Orders".
- If there's a direct "Reorder" section on homepage, use that instead.
- Take snapshot of order history page.
- Present the last 3-5 orders to user with:
  - Restaurant name
  - Items ordered
  - Date of order
  - Total amount
- If user specified which order (e.g. "the biryani one"), identify the matching order.
- Use `ask_user` (input_type "choice") to let user pick which order to repeat.

### 4. Initiate Reorder
- Click "Reorder" or "Order Again" on the selected order.
- If restaurant is currently closed, inform user and suggest alternatives or ask to try later.
- If some items are unavailable, inform user and suggest replacements.
- Take snapshot of the cart after reorder is initiated.
- Verify all items from the original order are added to cart.

### 5. Modify If Needed
- Ask user if they want to modify anything: "Want to add, remove, or change anything from this order?"
- Use `ask_user` (input_type "choice") with options: "No, keep as is", "Add more items", "Remove something", "Change quantities".
- If modifications requested, handle them accordingly.

### 6. Review Cart
- Open cart, take snapshot.
- Use `confirm_action` to present order summary:
  - Restaurant name
  - Each item with quantity and price
  - Note any price changes since last order
  - Subtotal, delivery fee, taxes, platform fee, total
  - Estimated delivery time
  - Any Zomato Gold/Pro discounts applied
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 7. Checkout & Payment
- Proceed to checkout.
- Verify delivery address is correct (may differ from original order).
- Apply coupons if visible and beneficial — inform user.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with restaurant, items, prices, fees, total, estimated time
  - amount_inr: total amount (number)
  - description: "Zomato reorder"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 8. Place Order & Confirm
- Click "Place Order" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation/tracking page.
- Report: order ID, restaurant, items, total paid, estimated delivery time, comparison with original order price if different.

## Site Notes

- **BYPASS HOMEPAGE**: `zomato.com` is app-only (shows "Download the app"). Always navigate to `zomato.com/{city}/restaurants?category=1` to access the full web delivery experience.
- Zomato keeps order history indefinitely — even old orders can be reordered.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- Prices may have changed since the original order — always inform user of the current total.
- Some items from the original order may have been discontinued — suggest alternatives.
- Restaurant may have different operating hours — check if currently open before reordering.
- Zomato Gold/Pro membership may offer free delivery and discounts.
- "Reorder" button on Zomato adds all items at once — faster than manual re-selection.
- Platform fee (₹3-7) is standard — do not confuse with delivery fee.
- Zomato uses React — always use Playwright fill/type methods.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
