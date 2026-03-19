---
name: delhivery-ship
description: Ship packages via Delhivery — pan-India courier service, book shipments, track consignments, express and standard delivery.
triggers:
  - delhivery
  - delhivery ship
  - ship via delhivery
  - delhivery courier
  - delhivery delivery
  - send package delhivery
  - delhivery parcel
  - delhivery track
  - track delhivery
siteUrl: https://www.delhivery.com
requiresAuth: true
params:
  - name: item
    required: true
    hint: What to ship (e.g. "a parcel", "documents", "electronics", "clothes")
  - name: pickup_address
    required: true
    hint: Pickup address with pincode
  - name: delivery_address
    required: true
    hint: Delivery address with pincode
  - name: weight
    required: false
    hint: Approximate weight of the package (e.g. "2 kg", "500 grams")
  - name: service_type
    required: false
    hint: Express or standard delivery
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, net banking)
---

# Delhivery — Pan-India Courier & Shipping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- BEFORE opening the browser, check if user provided item description, pickup address, and delivery address.
- If item not described, use `ask_user` (input_type "freetext"): "What do you want to ship via Delhivery? Please describe the package."
- If pickup address not provided, use `ask_user` (input_type "freetext"): "What's the pickup address with pincode?"
- If delivery address not provided, use `ask_user` (input_type "freetext"): "What's the delivery address with pincode?"
- If weight not provided, use `ask_user` (input_type "freetext"): "What's the approximate weight of the package?"
- Ask for sender and receiver details: use `ask_user` (input_type "freetext"): "Please provide sender name & phone, and receiver name & phone."
- If user just wants to track a shipment, use `ask_user` (input_type "freetext"): "Please provide the Delhivery AWB/tracking number." and skip to tracking.

### 2. Open Delhivery & Verify Login
- Open a NEW tab and navigate to `https://www.delhivery.com`.
- Take snapshot. Verify logged in (dashboard or account icon visible).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Take snapshot to confirm logged in and portal is accessible.

### 3. Check Serviceability & Create Shipment
- First, check if the pickup and delivery pincodes are serviceable using the pincode checker.
- If not serviceable, inform user and stop.
- Navigate to "Ship Now" or "Create Shipment" or "Book a Pickup" option.
- Select service type:
  - **Express**: 1-3 days, priority handling
  - **Standard**: 3-7 days, economical
- If user didn't specify, use `ask_user` (input_type "choice"): "Which delivery speed?" with options and estimated costs.
- Enter pickup address: full address, pincode, contact name, phone.
- Enter delivery address: full address, pincode, contact name, phone.
- Enter package details: description, weight, dimensions (length x breadth x height).
- Select package type: Document, Parcel, Heavy.
- Take snapshot after filling all details.

### 4. Review Shipment Details
- Take snapshot of the rate/shipment summary.
- Use `confirm_action` to present shipment summary:
  - Package description, weight, and dimensions
  - Pickup address and contact
  - Delivery address and contact
  - Service type (Express/Standard)
  - Shipping charges (base + surcharges)
  - Estimated delivery date
  - Insurance option and cost (if applicable)
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 5. Checkout & Payment
- Proceed to payment/checkout.
- If insurance is offered, ask user if they want it via `ask_user` (input_type "choice").
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with package details, addresses, service type, shipping charges, insurance, estimated delivery date
  - amount_inr: total shipping cost (number)
  - description: "Delhivery courier shipment"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 6. Confirm & Get Tracking
- Click "Confirm" or "Book Shipment" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: AWB/tracking number, package details, pickup and delivery addresses, shipping cost paid, estimated delivery date, tracking URL (https://www.delhivery.com/track/package/<AWB>).

## Site Notes

- Delhivery covers 18,000+ pincodes across India — one of the widest courier networks.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- Express delivery: 1-3 days for metro cities, 2-5 days for Tier 2/3 cities.
- Standard delivery: 3-7 days depending on origin-destination pair.
- Weight limit: up to 70 kg per shipment. Volumetric weight may apply for large packages.
- Delhivery offers COD (Cash on Delivery) option for e-commerce shipments.
- Tracking URL: https://www.delhivery.com/track/package/<AWB_NUMBER> — share with user.
- Pickup is scheduled — Delhivery rider will come to pickup address within the selected window.
- Restricted items: flammable goods, liquids, batteries (lithium), perishable food, hazardous materials.
- Sunday and public holiday pickups may not be available in all locations.
- Use `confirm_action` for shipment review (no money), `collect_payment` for payment (actual charges).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
