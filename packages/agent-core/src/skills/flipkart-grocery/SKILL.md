---
name: flipkart-grocery
description: Buy groceries on Flipkart Minutes/Grocery — search items, add to cart, checkout with quick delivery.
triggers:
  - flipkart grocery
  - flipkart minutes
  - buy groceries flipkart
  - flipkart supermart
  - order grocery flipkart
  - flipkart quick delivery
  - flipkart fresh
  - groceries on flipkart
siteUrl: https://www.flipkart.com/grocery-supermart-store
requiresAuth: true
params:
  - name: items
    required: true
    hint: List of grocery items to order (e.g. "rice 5kg, dal 1kg, milk 1L")
  - name: address
    required: false
    hint: Delivery address or pincode
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, Flipkart Pay Later)
---

# Flipkart Grocery Ordering

Chrome profile: rsinghtomar3011@gmail.com. Operator account logged in.

## Steps

### Step 0: Collect delivery address
**EXTRACT FIRST**: Parse the user's message for items AND address. Use whatever they already provided — do NOT re-ask.

- If address is missing → call `ask_user` with `input_type: "address"`, question: "What's your delivery address or area name?". Show saved addresses if available.
- If address is already provided → skip directly to `handoff_to_browser_agent`.
- **Do NOT ask for items** — extract them from the user's message. If truly missing, handoff anyway and let the browser agent figure it out.
- **Do NOT show product cards, prices, or images** — the cloud LLM has no access to the site's catalog. Only the browser agent can fetch real product data.

**CRITICAL**: Do NOT open the browser until you have the delivery address. Without a delivery location, Flipkart shows ZERO products.

### 1. Gather Requirements
- Check if user provided items list and delivery address.
- If items not specified, use `ask_user` (input_type "freetext"): "What groceries do you need? Please list all items with quantities."
- If address not provided and not saved, use `ask_user` (input_type "freetext"): "What's your delivery address or pincode?"

### 2. Open Flipkart Grocery
- Open a NEW tab and navigate to `https://www.flipkart.com/grocery-supermart-store`.
- Take a snapshot to verify page loaded.
- Check if logged in (profile name visible in top-right header).
- **If NOT logged in or session expired, STOP and tell user: "Flipkart session expired, please re-login in Chrome Debug."**
- Do NOT ask user for credentials.
- If location/pincode popup appears, enter the user's pincode and confirm.

### 3. Verify Login & Set Location
- Take snapshot to confirm grocery section loaded.
- If Flipkart Minutes (quick delivery) is available in user's area, prefer that.
- Otherwise use Flipkart Supermart for standard grocery delivery.
- Take snapshot showing available delivery options.

### 4. Search & Add Items
- For each grocery item the user requested:
  - Use the search bar to search for the item.
  - Take snapshot of search results.
  - If multiple variants (brands, pack sizes, organic vs regular), use `ask_user` with `input_type: "carousel"` and a `cards` array with product image, name, price as subtitle. Extract the real image URL from the `<img>` tag in each product card.
  - Click "ADD TO CART" on the selected item.
  - Adjust quantity if user specified more than 1.
  - Take snapshot confirming item added.
- Repeat for all items. Note any out-of-stock items and suggest alternatives.

### 5. Review Cart
- Click cart icon to view cart.
- Take snapshot of full cart.
- Use `confirm_action` to present order summary:
  - Each item: name, quantity, price
  - Subtotal, delivery fee (if any), total savings, grand total
  - Estimated delivery time
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Place Order" to proceed to checkout.
- Verify delivery address is correct. Change if needed.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with items, quantities, prices, delivery fee, total
  - amount_inr: total amount (number)
  - description: "Flipkart Grocery order"
- STOP and WAIT for payment confirmation.
- Only proceed if payment confirmed. If cancelled, ask what to change.

### 7. Place Order & Confirm
- Complete the order on Flipkart.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, items ordered, total paid, estimated delivery date/time.

## Site Notes

- Flipkart Minutes offers 10-15 min delivery in select cities — check availability first.
- Flipkart Supermart is standard grocery with 1-2 day delivery, wider selection.
- Operator Chrome Profile 3 is logged in. Do NOT ask user for phone or credentials.
- Session cookies persist. If expired, operator must re-login in Chrome Debug manually.
- Flipkart often shows login popup on first visit — close it if already logged in.
- Minimum order for free delivery varies by area (usually Rs 99-199 for Minutes).
- Flipkart uses React — elements load dynamically, wait for renders after navigation.
- Search bar is at top — click, type, press Enter. Results may take 1-2 seconds.
- Some items have "Subscribe & Save" option — skip unless user asks for subscription.
- Flipkart Pay Later can be used if enabled on operator account.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
