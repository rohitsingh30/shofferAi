---
name: zepto-grocery
description: Order groceries from Zepto with 10-15 minute delivery — search items, add to cart, checkout, pay.
triggers:
  - zepto
  - order from zepto
  - zepto grocery
  - zeptonow
  - order on zepto
  - zepto delivery
  - quick grocery zepto
  - groceries from zepto
  - buy from zepto
  - zepto order
  - 10 minute grocery
  - instant grocery delivery
  - order vegetables on zepto
  - zepto fruits
  - zepto snacks
siteUrl: https://www.zeptonow.com
requiresAuth: true
params:
  - name: items
    required: true
    hint: List of items to order (e.g. "milk, bread, eggs, tomatoes")
  - name: address
    required: false
    hint: Delivery address or area name
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# Zepto Grocery Ordering

Chrome profile: rsinghtomar3011@gmail.com. Operator phone: 8109137158.

## Steps

### Step 0: Collect delivery address and shopping list
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **address** (type: "address", required): Ask for delivery address. Show saved addresses if available.
2. **items** (type: "card_grid", required): Ask what items to buy. Show common grocery items as cards with emoji (🥛 Milk, 🍞 Bread, 🥚 Eggs, 🍚 Rice, 🌾 Atta, 🫒 Oil, 🍬 Sugar, 🫘 Dal, 🧈 Butter, 🍌 Banana, 🧅 Onion, 🥔 Potato). Enable quantity steppers and custom item input.

**CRITICAL**: Do NOT open the browser until you have both the delivery address and at least one item. Without a delivery location, Zepto shows ZERO products.

### 1. Gather ALL Requirements Upfront
- BEFORE opening the browser, check what the user already provided: items to order, delivery address.
- If ANY info is missing, use ONE SINGLE `ask_user` call to collect ALL missing info at once.
  Example: "I need a couple of details to order from Zepto:\n• Delivery address or area name\n• Anything else to add to the order?"
- Do NOT ask questions one at a time. Batch everything into a single prompt.
- If user has saved addresses in profile, present them as choices.
- If user provided both items and address already, skip straight to Step 2.

### 2. Open Zepto & Verify Login
- Open a NEW tab and navigate to `https://www.zeptonow.com`.
- Take a snapshot. Check if logged in — look for a profile/account icon in the header area.
- If Zepto shows a location/address popup or banner, type the user's address in the location search input, wait for autocomplete suggestions, click the best match.
- If area is not serviceable, tell user and stop.
- The header shows delivery time (e.g., "10 min delivery") and current address — verify both are correct.
- If NOT logged in: click the Login/Sign-in button, enter operator phone 8109137158, handle OTP transparently (do NOT ask user for credentials).
- **If you see a login page or wrong account, STOP and tell the user: "Session expired, please re-login in Chrome Debug."**
- Take snapshot to confirm location set and products visible on homepage.

### 3. Search & Add Items
For each item the user requested:
- Click the search bar/icon in the header area.
- Type the item name and press Enter or wait for search results to appear.
- Take snapshot of results. Each product card typically shows:
  - Product name and brand
  - Weight/size (e.g., "500 ml", "1 kg")
  - Price (with ₹ symbol)
  - "Add" or "ADD" button
  - Optional discount badge
  - Delivery time
- Find the closest match. If multiple variants (different brands, sizes), use `ask_user` (input_type "choice") presenting name, size, and price for each option.
- Click the "Add" button on the chosen product. After adding, it typically transforms into a quantity counter with `-`/count/`+` buttons.
- To add more of the same item, click `+`. To remove, click `-`.
- If out of stock (not in results or greyed out), inform user and suggest alternatives from results.
- Clear the search input and type the next item name.
- Repeat for all items. Cart count/total should update in the header.

### 4. Review Cart
- Click the cart button/icon in the header (usually shows item count and total).
- Cart may open as a sidebar panel or navigate to a cart page.
- Take snapshot. The cart should show:
  - Each item: name, quantity, price
  - Bill details: Items total, Delivery charge, Handling charge, Grand total
  - Delivery address
  - Estimated delivery time
- Use `confirm_action` to present cart summary to user:
  - Each item with quantity and price
  - Full bill breakdown (items total, delivery charge, handling charge, grand total)
  - Delivery address
  - Estimated delivery time
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 5. Checkout & Payment
- Click "Proceed to Pay" or "Checkout" button.
- Verify delivery address is correct on payment page.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with items, prices, delivery charge, handling charge, grand total, delivery address, estimated time
  - amount_inr: grand total amount (number)
  - description: "Zepto grocery order"
- STOP and WAIT — payment panel opens for user.
- Only proceed if payment confirmed. If cancelled, ask what to change.

### 6. Place Order & Confirm
- After payment is confirmed, handle any payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order number/ID, items ordered, total paid, estimated delivery time, delivery address.

## Site Notes

- **Delivery**: Zepto delivers in 10-15 minutes depending on area — time-sensitive, don't waste time.
- **Operator Chrome Profile 3** should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login with operator phone 8109137158. OTP goes to operator.
- **Location**: First-time visitors see a location popup. If already set, header shows address + delivery time.
- **Product availability** varies by area and time of day. Some items may be out of stock.
- **Minimum order**: Below minimum may incur a small cart/delivery surcharge. Minimum varies by area.
- Some areas don't have Zepto coverage — site shows "not serviceable" or similar message.
- **Quantity controls**: After clicking Add, the button becomes `-`/count/`+`. Click `+` to increase, `-` to decrease.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
- **Cancellation**: Orders may not be cancellable once packed for delivery.
- **Note**: Selectors in this skill have NOT been verified against the live site. The agent should use `browser_snapshot` to inspect actual page structure and adapt selectors dynamically.
