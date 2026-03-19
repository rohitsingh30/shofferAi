---
name: shadowfax-delivery
description: Ship packages via Shadowfax — hyperlocal and intracity delivery, same-day and next-day shipping, track consignments.
triggers:
  - shadowfax
  - shadowfax delivery
  - ship via shadowfax
  - shadowfax courier
  - hyperlocal delivery
  - intracity delivery
  - shadowfax ship
  - shadowfax package
siteUrl: https://www.shadowfax.in
requiresAuth: true
params:
  - name: item
    required: true
    hint: What to ship (e.g. "a parcel", "documents", "electronics", "food package")
  - name: pickup_address
    required: true
    hint: Pickup address with pincode
  - name: delivery_address
    required: true
    hint: Delivery address with pincode
  - name: weight
    required: false
    hint: Approximate weight of the package (e.g. "2 kg", "500 grams")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, net banking)
---

# Shadowfax Delivery — Hyperlocal & Intracity Shipping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- BEFORE opening the browser, check if user provided item description, pickup address, and delivery address.
- If item not described, use `ask_user` (input_type "freetext"): "What do you want to ship via Shadowfax? Please describe the package."
- If pickup address not provided, use `ask_user` (input_type "freetext"): "What's the pickup address with pincode?"
- If delivery address not provided, use `ask_user` (input_type "freetext"): "What's the delivery address with pincode?"
- If weight not provided, use `ask_user` (input_type "freetext"): "What's the approximate weight of the package?"
- Ask for sender and receiver contact details: use `ask_user` (input_type "freetext"): "Please provide sender name & phone, and receiver name & phone."

### 2. Open Shadowfax & Verify Login
- Open a NEW tab and navigate to `https://www.shadowfax.in`.
- Take snapshot. Verify logged in (dashboard or account icon visible).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Take snapshot to confirm logged in and dashboard is accessible.

### 3. Create Shipment
- Navigate to "Create Shipment" or "Book Delivery" or equivalent option.
- Select delivery type based on user's needs:
  - **Same-day delivery**: If urgency indicated
  - **Next-day delivery**: Default option
  - **Hyperlocal (2-4 hours)**: If within same city and user wants fastest option
- Use `ask_user` (input_type "choice") if multiple service types available: "Which delivery speed do you prefer?" with available options and prices.
- Enter pickup address details: full address, pincode, contact name, phone number.
- Enter delivery address details: full address, pincode, contact name, phone number.
- Enter package details: description, weight, dimensions if required.
- Take snapshot after filling all details.

### 4. Review Shipment Details
- Take snapshot of the shipment summary page.
- Use `confirm_action` to present shipment summary:
  - Package description and weight
  - Pickup address and contact
  - Delivery address and contact
  - Service type (hyperlocal/same-day/next-day)
  - Shipping fee and any surcharges
  - Estimated delivery time
  - Insurance or COD options if applicable
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 5. Checkout & Payment
- Proceed to payment/checkout.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with package details, pickup/delivery addresses, service type, shipping fee, estimated delivery time
  - amount_inr: shipping fee (number)
  - description: "Shadowfax delivery shipment"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 6. Confirm & Get Tracking
- Click "Confirm Shipment" or "Place Order" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: shipment/AWB number, package details, pickup and delivery addresses, shipping fee paid, estimated delivery time, tracking link/URL.

## Site Notes

- Shadowfax specializes in hyperlocal and intracity deliveries — faster than traditional couriers for short distances.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- Shadowfax operates primarily in Tier 1 and Tier 2 Indian cities — check serviceability first.
- Hyperlocal delivery (2-4 hours) is available only within the same city and for lighter packages.
- Weight limits vary by service type: hyperlocal up to 10 kg, intracity up to 25 kg.
- Shadowfax may require business registration for bulk shipments — individual shipments should work directly.
- COD (Cash on Delivery) option may be available for certain routes and amounts.
- Fragile and perishable items may require special packaging — Shadowfax does NOT provide packaging.
- Tracking is available via AWB number on the Shadowfax website or app.
- Use `confirm_action` for shipment review (no money), `collect_payment` for payment (actual charges).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
