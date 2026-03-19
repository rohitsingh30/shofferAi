---
name: swiggy-genie
description: Send packages via Swiggy Genie — pick up and drop anything, hyperlocal delivery within the city.
triggers:
  - swiggy genie
  - send package
  - pick and drop
  - pick & drop
  - swiggy pickup
  - send parcel
  - swiggy genie delivery
  - courier within city
  - send something via swiggy
  - genie delivery
siteUrl: https://www.swiggy.com/genie
requiresAuth: true
params:
  - name: item
    required: true
    hint: What to pick up and drop (e.g. "a document", "house keys", "a lunch box", "a gift package")
  - name: pickup_address
    required: true
    hint: Pickup address (where the item currently is)
  - name: drop_address
    required: true
    hint: Drop address (where to deliver the item)
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, wallet)
---

# Swiggy Genie — Pick Up & Drop Anything

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- BEFORE opening the browser, check if user provided item description, pickup address, and drop address.
- If item not described, use `ask_user` (input_type "freetext"): "What do you want to send via Swiggy Genie? Please describe the item."
- If pickup address not provided, use `ask_user` (input_type "freetext"): "What's the pickup address? (Where the item currently is)"
- If drop address not provided, use `ask_user` (input_type "freetext"): "What's the drop address? (Where to deliver the item)"
- If any special instructions needed (fragile, time-sensitive, contact person), use `ask_user` (input_type "freetext"): "Any special instructions for the delivery partner? (e.g., fragile, call before pickup, ask for a specific person)"

### 2. Open Swiggy Genie & Verify Login
- Open a NEW tab and navigate to `https://www.swiggy.com/genie`.
- Take snapshot. Verify logged in (account icon in header).
- If redirected to main Swiggy page, look for "Genie" option in the services bar and click it.
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Take snapshot to confirm Genie page is loaded.

### 3. Enter Pickup & Drop Details
- Enter the pickup address in the "Pick up from" field. Wait for address suggestions and click the best match.
- If pickup address not found, try entering landmark or nearby location.
- Enter the drop address in the "Drop at" field. Wait for address suggestions and click the best match.
- If drop address not found, try entering landmark or nearby location.
- Take snapshot to verify both addresses are set correctly on the map.
- Enter item description or select package type if prompted (e.g., "Documents", "Food", "Clothes", "Others").
- Add special instructions if user provided any.

### 4. Review Delivery Details
- Take snapshot of the order summary showing pickup, drop, distance, and estimated fee.
- Use `confirm_action` to present delivery summary:
  - Item being sent
  - Pickup address and contact
  - Drop address and contact
  - Estimated distance
  - Delivery fee (including surge if any)
  - Estimated pickup and delivery time
  - Special instructions (if any)
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 5. Checkout & Payment
- Proceed to payment/checkout.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with item, pickup address, drop address, distance, delivery fee, estimated time
  - amount_inr: delivery fee amount (number)
  - description: "Swiggy Genie pick & drop delivery"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 6. Confirm & Track
- Click "Confirm" or "Place Order" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation/tracking page.
- Report: order/task ID, item description, pickup and drop addresses, delivery fee paid, estimated time, delivery partner name and phone (if visible), tracking link if available.

## Site Notes

- Swiggy Genie is a pick-and-drop service — it picks up items from one location and delivers to another within the same city.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- Genie operates within city limits only — inter-city deliveries are NOT supported.
- Typical delivery time is 30-60 minutes depending on distance and traffic.
- Surge pricing may apply during peak hours or rain — inform user of actual fee.
- Weight limit is typically 10-15 kg per delivery. Oversized items may be rejected by the partner.
- Genie partners do NOT enter buildings or offices — pickup/drop is at the gate/entrance.
- Items like alcohol, illegal substances, and perishables without packaging are NOT allowed.
- Swiggy Genie is available in major Indian cities: Bangalore, Delhi NCR, Mumbai, Hyderabad, Chennai, Pune, Kolkata, Ahmedabad.
- The delivery partner may call the pickup/drop contact — ensure correct phone numbers are provided.
- Use `confirm_action` for delivery review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
