---
name: amazon-pantry
description: Buy pantry and household items on Amazon Pantry — search, add to cart, checkout with scheduled delivery.
triggers:
  - amazon pantry
  - buy pantry items
  - amazon grocery
  - household items amazon
  - amazon fresh pantry
  - amazon daily essentials
  - pantry order
  - amazon staples
siteUrl: https://www.amazon.in/pantry
requiresAuth: true
params:
  - name: items
    required: true
    hint: List of pantry items (e.g. "atta 5kg, sugar 1kg, cooking oil 1L, soap")
  - name: address
    required: false
    hint: Delivery address or use default
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, Amazon Pay)
---

# Amazon Pantry Ordering

Chrome profile: rsinghtomar3011@gmail.com. Operator Amazon account logged in.

## Steps

### Step 0: Confirm delivery address & phone
**ALWAYS show the address picker** — even if the user mentioned a location like "Tellapur" or "Koramangala". An area name is NOT a complete delivery address (missing flat/building, street, pincode, phone). The user must pick a saved address or enter a full one. The address widget collects flat/building, street, city, pincode, AND contact phone — all critical for delivery.

- If address is missing → call `ask_user` with `input_type: "address"`, question: "What's your delivery address or area name?". Show saved addresses if available.
- **Only skip** if the user provided a FULL address with building/flat, street, city, pincode, AND phone number.
- **Do NOT ask for items** — extract them from the user's message. If truly missing, handoff anyway and let the browser agent figure it out.
- **Do NOT show product cards, prices, or images** — the cloud LLM has no access to the site's catalog. Only the browser agent can fetch real product data.

**CRITICAL**: Do NOT open the browser until you have a complete delivery address with phone. Without a delivery location, Amazon Pantry shows ZERO products.

### 1. Gather Requirements
- Check if user provided items list.
- If not specified, use `ask_user` (input_type "freetext"): "What pantry/household items do you need? List items with quantities."
- Note any brand preferences or dietary requirements (organic, sugar-free, etc.).

### 2. Open Amazon Pantry
- Open a NEW tab and navigate to `https://www.amazon.in/pantry`.
- Take a snapshot to verify page loaded.
- Check if logged in (account name visible in top nav "Hello, [Name]").
- **If NOT logged in or session expired, STOP and tell user: "Amazon session expired, please re-login in Chrome Debug."**
- Do NOT ask user for credentials.
- Check delivery availability for user's pincode.

### 3. Verify Login & Check Pincode
- Take snapshot confirming logged-in pantry page.
- If pincode selector shown, enter user's pincode to check availability.
- If pantry not available in area, inform user and suggest Amazon Fresh or regular Amazon.
- Take snapshot confirming pantry is serviceable.

### 4. Search & Add Items
- For each pantry item:
  - Use search bar with "Pantry" category filter if available.
  - Type item name and search.
  - Take snapshot of results.
  - If multiple brands/sizes, use `ask_user` (input_type "choice") showing top 3-5 options with brand, size, price, rating.
  - Click on selected product, verify it's a Pantry item.
  - Click "Add to Pantry Cart" or "Add to Cart".
  - Take snapshot confirming addition.
- Repeat for all items. Note out-of-stock items and suggest alternatives.

### 5. Review Cart
- Navigate to cart and take snapshot.
- Use `confirm_action` to present order summary:
  - Each item: name, quantity, price, savings
  - Pantry box fill percentage (if applicable)
  - Subtotal, delivery fee, total savings, grand total
  - Estimated delivery date
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Proceed to Checkout".
- Verify delivery address. If multiple addresses, use `ask_user` (input_type "choice").
- Select delivery slot if available.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with items, prices, delivery fee, total, delivery date
  - amount_inr: total amount (number)
  - description: "Amazon Pantry order"
- STOP and WAIT for payment confirmation.
- Only proceed if payment confirmed. If cancelled, ask what to change.

### 7. Place Order & Confirm
- Click "Place Order" on Amazon.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, items ordered, total paid, estimated delivery date.

## Site Notes

- Amazon Pantry has minimum order value (usually Rs 199) for free delivery.
- Pantry items ship in a single box — there's a box fill limit, plan accordingly.
- Operator Chrome Profile 3 is logged in. Do NOT ask user for phone or credentials.
- Amazon sessions last long but can expire. If expired, operator re-logins in Chrome Debug.
- Amazon uses dynamic rendering — wait for product cards to fully load before interacting.
- Some items may redirect to Amazon Fresh instead of Pantry — verify the section.
- Subscribe & Save gives 5-10% extra discount — mention to user if available.
- Amazon Pay balance can be used for payment if available on operator account.
- Prime members get free delivery on many pantry orders.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
- Check "Pantry" filter in search to avoid non-pantry results mixing in.
