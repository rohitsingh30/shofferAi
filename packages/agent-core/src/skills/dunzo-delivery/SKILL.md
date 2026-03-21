---
name: dunzo-delivery
description: Order anything via Dunzo — groceries, food, packages, pick & drop, essentials delivery.
triggers:
  - dunzo
  - order from dunzo
  - dunzo delivery
  - dunzo grocery
  - pick and drop
  - pick & drop
  - send package
  - dunzo order
  - anything delivery
  - dunzo essentials
siteUrl: https://www.dunzo.com
requiresAuth: true
params:
  - name: item
    required: true
    hint: What to order or deliver (e.g. "groceries", "medicine", "pick and drop a package", "food from a specific shop")
  - name: address
    required: false
    hint: Delivery address or area name
  - name: pickup_address
    required: false
    hint: Pickup address (for pick & drop tasks)
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, wallet)
---

# Dunzo Delivery — Order Anything

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### Step 0: Confirm delivery address & phone
**ALWAYS show the address picker** — even if the user mentioned a location like "Tellapur" or "Koramangala". An area name is NOT a complete delivery address (missing flat/building, street, pincode, phone). The user must pick a saved address or enter a full one. The address widget collects flat/building, street, city, pincode, AND contact phone — all critical for delivery.

- Call `ask_user` with `input_type: "address"`. Show saved addresses. If the user mentioned an area, pre-fill it in the question:
  ```json
  {"input_type": "address", "question": "Confirm your delivery address for Dunzo:", "saved": [{"label": "Home", "value": "C-502, Honer Aquantis, Tellapur"}, {"label": "Office", "value": "T-Hub, Raidurg, Hyderabad"}]}
  ```
- **Only skip** if the user provided a FULL address with building/flat, street, city, pincode, AND phone number (e.g. "E111, Ridgewood Estate, DLF Garden City, Pune 411032").
- **Do NOT ask for items** — extract them from the user's message. If truly missing, handoff anyway and let the browser agent figure it out.
- **Do NOT show product cards, prices, or images** — the cloud LLM has no access to the site's catalog. Only the browser agent can fetch real product data.

**CRITICAL**: Do NOT open the browser until you have a complete delivery address with phone. Without a delivery location, Dunzo shows ZERO products.

### 1. Gather Requirements
- BEFORE opening the browser, determine the type of Dunzo task:
  - **Grocery/Essentials**: User wants items delivered from a store.
  - **Food**: User wants food from a specific restaurant/shop.
  - **Pick & Drop**: User wants a package picked up and delivered.
  - **Custom**: User wants something specific purchased and delivered.
- If delivery address not provided, use `ask_user` (input_type "freetext"): "What's your delivery address or area name?"
- For pick & drop, if pickup address not provided, use `ask_user` (input_type "freetext"): "What's the pickup address?"
- Clarify items if vague: use `ask_user` (input_type "freetext"): "Can you list the specific items you need?"

### 2. Open Dunzo & Set Location
- Open a NEW tab and navigate to `https://www.dunzo.com`.
- Take snapshot. Verify logged in (account/profile icon in header).
- If location popup appears, type the user's delivery address, wait for suggestions, click best match.
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Confirm location set and services visible.

### 3. Select Service & Browse
- **For Grocery/Essentials**:
  - Navigate to the grocery or essentials section.
  - Search for each item user requested.
  - Present available options (brands, sizes, prices) for each item.
  - Use `ask_user` (input_type "choice") to let user pick brand/variant for each item.
  - Add each item to cart.
- **For Food**:
  - Navigate to the food/restaurants section.
  - Search for the specific restaurant or cuisine.
  - Present options, use `ask_user` to confirm restaurant.
  - Browse menu, select items as per user's request.
  - Add to cart.
- **For Pick & Drop**:
  - Navigate to the "Pick & Drop" or "Send Package" section.
  - Enter pickup address and delivery address.
  - Select package size/type if prompted.
  - Add special instructions if user provided any.
- **For Custom**:
  - Use the "Anything" or custom delivery option.
  - Enter item description and store/location details.
  - Let Dunzo assign a delivery partner.

### 4. Review Order
- Open cart or order summary, take snapshot.
- Use `confirm_action` to present order summary:
  - Task type (Grocery, Food, Pick & Drop, Custom)
  - Items with quantities and prices (for grocery/food)
  - Pickup and delivery addresses (for pick & drop)
  - Delivery fee and surge pricing if any
  - Subtotal, total
  - Estimated delivery time
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 5. Checkout & Payment
- Proceed to checkout.
- Verify delivery address is correct.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with task type, items/details, prices, delivery fee, total, estimated time
  - amount_inr: total amount (number)
  - description: "Dunzo delivery order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 6. Place Order & Confirm
- Click "Place Order" or "Confirm" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation/tracking page.
- Report: order/task ID, task type, items or package details, total paid, estimated delivery time, delivery partner info if available, tracking link if visible.

## Site Notes

- Dunzo operates in select Indian cities (Bangalore, Delhi NCR, Mumbai, Pune, Chennai, Hyderabad, Jaipur, Kolkata).
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- Dunzo delivery times vary: groceries 20-40 min, pick & drop 30-60 min, custom tasks 45-90 min.
- Surge pricing may apply during peak hours or rain — inform user.
- Dunzo Daily (subscription) may offer free delivery — check if applicable.
- For pick & drop, package weight limits may apply (usually 10-15 kg).
- Item availability depends on partner stores in the area — some items may not be found.
- Dunzo partners with local stores (Kirana, pharmacies, bakeries) — prices may differ from MRP.
- Use `confirm_action` for order review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
