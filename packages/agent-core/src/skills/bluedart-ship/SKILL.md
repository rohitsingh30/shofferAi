---
name: bluedart-ship
description: Ship packages via BlueDart — premium express courier, domestic and international, priority delivery, track shipments.
triggers:
  - bluedart
  - blue dart
  - bluedart ship
  - ship via bluedart
  - bluedart courier
  - bluedart express
  - bluedart delivery
  - send package bluedart
  - bluedart track
siteUrl: https://www.bluedart.com
requiresAuth: true
params:
  - name: item
    required: true
    hint: What to ship (e.g. "documents", "electronics", "parcel", "gift box")
  - name: pickup_address
    required: true
    hint: Pickup address with pincode
  - name: delivery_address
    required: true
    hint: Delivery address with pincode
  - name: weight
    required: false
    hint: Approximate weight of the package (e.g. "1 kg", "3 kg")
  - name: service_type
    required: false
    hint: Domestic Priority, Domestic Express, Dart Apex, or international
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, net banking)
---

# BlueDart — Premium Express Courier & Shipping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- BEFORE opening the browser, check if user provided item description, pickup address, and delivery address.
- If item not described, use `ask_user` (input_type "freetext"): "What do you want to ship via BlueDart? Please describe the package."
- If pickup address not provided, use `ask_user` (input_type "freetext"): "What's the pickup address with pincode?"
- If delivery address not provided, use `ask_user` (input_type "freetext"): "What's the delivery address with pincode?"
- If weight not provided, use `ask_user` (input_type "freetext"): "What's the approximate weight of the package?"
- Ask for sender and receiver details: use `ask_user` (input_type "freetext"): "Please provide sender name & phone, and receiver name & phone."
- If user just wants to track a shipment, use `ask_user` (input_type "freetext"): "Please provide the BlueDart AWB/waybill number." and skip to tracking.

### 2. Open BlueDart & Verify Login
- Open a NEW tab and navigate to `https://www.bluedart.com`.
- Take snapshot. Verify logged in (My Account or dashboard visible).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Take snapshot to confirm logged in and portal is accessible.

### 3. Check Serviceability & Create Shipment
- Use BlueDart's pincode serviceability checker to verify both pincodes are served.
- If not serviceable, inform user and suggest alternative.
- Navigate to "Ship Now" or "Schedule a Pickup" or "Send a Shipment" option.
- Select service type based on user's needs:
  - **Domestic Priority (DPD)**: Next-day delivery for documents and parcels
  - **Domestic Express (DEX)**: Economy option, 2-5 days
  - **Dart Apex**: Same-day delivery (select cities)
  - **International**: For overseas destinations
- If user didn't specify, use `ask_user` (input_type "choice"): "Which BlueDart service?" with available options and estimated costs/timelines.
- Enter pickup details: full address, pincode, contact name, phone, email.
- Enter delivery details: full address, pincode, contact name, phone, email.
- Enter package details: content description, weight, dimensions, declared value.
- Take snapshot after filling all details.

### 4. Review Shipment Details
- Take snapshot of the rate estimate and shipment summary.
- Use `confirm_action` to present shipment summary:
  - Package description, weight, and dimensions
  - Pickup address and contact
  - Delivery address and contact
  - Service type (DPD/DEX/Dart Apex/International)
  - Shipping charges breakdown (base + fuel surcharge + GST)
  - Estimated delivery date
  - Insurance/declared value
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 5. Checkout & Payment
- Proceed to payment/checkout.
- If insurance is recommended for high-value items, ask user via `ask_user` (input_type "choice").
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with package details, addresses, service type, charges breakdown, insurance, estimated delivery date
  - amount_inr: total shipping cost (number)
  - description: "BlueDart express courier shipment"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 6. Confirm & Get Tracking
- Click "Confirm" or "Book Pickup" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: AWB/waybill number, package details, pickup and delivery addresses, shipping cost paid, estimated delivery date, tracking URL (https://www.bluedart.com/tracking/<AWB>).

## Site Notes

- BlueDart is India's premier express courier — part of DHL network, reliable for urgent and high-value shipments.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- Domestic Priority (DPD) guarantees next-business-day delivery in 500+ cities.
- Dart Apex offers same-day delivery in select metros (Mumbai, Delhi, Bangalore, Chennai, Hyderabad).
- BlueDart charges fuel surcharge on top of base rate — this changes monthly.
- Weight limit: up to 50 kg per shipment. Volumetric weight formula: (L x B x H) / 5000.
- BlueDart provides SMS and email tracking updates automatically.
- Tracking URL: https://www.bluedart.com/tracking/<AWB_NUMBER> — share with user.
- Pickup scheduling: BlueDart rider comes to pickup address within selected time window (morning/afternoon).
- Restricted items: hazardous materials, perishables, currency, jewelry above declared limits.
- BlueDart has Saturday delivery in most locations. Sunday delivery limited.
- Use `confirm_action` for shipment review (no money), `collect_payment` for payment (actual charges).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
