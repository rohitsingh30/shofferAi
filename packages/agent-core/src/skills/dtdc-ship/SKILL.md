---
name: dtdc-ship
description: Ship packages via DTDC — domestic and international courier, book shipments, track consignments, economy and express options.
triggers:
  - dtdc
  - dtdc ship
  - ship via dtdc
  - dtdc courier
  - dtdc delivery
  - send package dtdc
  - dtdc parcel
  - dtdc track
  - dtdc international
siteUrl: https://www.dtdc.in
requiresAuth: true
params:
  - name: item
    required: true
    hint: What to ship (e.g. "documents", "parcel", "clothes", "electronics")
  - name: pickup_address
    required: true
    hint: Pickup address with pincode
  - name: delivery_address
    required: true
    hint: Delivery address with pincode (domestic or international)
  - name: weight
    required: false
    hint: Approximate weight of the package (e.g. "1 kg", "5 kg")
  - name: service_type
    required: false
    hint: Priority, Express, Economy, or International
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, net banking)
---

# DTDC — Domestic & International Courier

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- BEFORE opening the browser, check if user provided item description, pickup address, and delivery address.
- If item not described, use `ask_user` (input_type "freetext"): "What do you want to ship via DTDC? Please describe the package."
- If pickup address not provided, use `ask_user` (input_type "freetext"): "What's the pickup address with pincode?"
- If delivery address not provided, use `ask_user` (input_type "freetext"): "What's the delivery address with pincode? (For international, include country)"
- If weight not provided, use `ask_user` (input_type "freetext"): "What's the approximate weight of the package?"
- Ask for sender and receiver details: use `ask_user` (input_type "freetext"): "Please provide sender name & phone, and receiver name & phone."
- If user just wants to track, use `ask_user` (input_type "freetext"): "Please provide the DTDC tracking/consignment number." and skip to tracking.

### 2. Open DTDC & Verify Login
- Open a NEW tab and navigate to `https://www.dtdc.in`.
- Take snapshot. Verify logged in (account or dashboard link visible).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Take snapshot to confirm logged in and portal is accessible.

### 3. Check Serviceability & Create Shipment
- Use DTDC's pincode checker to verify both origin and destination pincodes are serviceable.
- For international shipments, check country serviceability.
- If not serviceable, inform user and suggest alternatives.
- Navigate to "Book a Courier" or "Ship Now" or "Schedule Pickup" option.
- Select service type:
  - **DTDC Priority**: Fastest domestic, 1-3 days
  - **DTDC Express**: Standard, 3-5 days
  - **DTDC Economy/Lite**: Cheapest, 5-10 days
  - **DTDC International**: For overseas shipments
- If user didn't specify, use `ask_user` (input_type "choice"): "Which DTDC service?" with available options, costs, and timelines.
- Enter pickup details: full address, pincode, contact name, phone.
- Enter delivery details: full address, pincode/zip, contact name, phone.
- Enter package details: content description, weight, dimensions, declared value.
- For international: select content type (Documents, Gift, Commercial Sample, etc.) and declare customs value.
- Take snapshot after filling all details.

### 4. Review Shipment Details
- Take snapshot of the rate and shipment summary.
- Use `confirm_action` to present shipment summary:
  - Package description, weight, and dimensions
  - Pickup address and contact
  - Delivery address and contact
  - Service type (Priority/Express/Economy/International)
  - Shipping charges breakdown (base + surcharges + GST)
  - Estimated delivery date
  - Insurance option and declared value
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 5. Checkout & Payment
- Proceed to payment/checkout.
- If insurance is offered for high-value shipments, ask user via `ask_user` (input_type "choice").
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with package details, addresses, service type, charges breakdown, insurance, estimated delivery
  - amount_inr: total shipping cost (number)
  - description: "DTDC courier shipment"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 6. Confirm & Get Tracking
- Click "Confirm" or "Book Shipment" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: consignment/tracking number, package details, pickup and delivery addresses, shipping cost paid, estimated delivery date, tracking URL (https://www.dtdc.in/tracking.asp).

## Site Notes

- DTDC covers 17,500+ pincodes in India and ships to 240+ countries internationally.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- DTDC Priority is fastest for metro-to-metro routes (1-2 days); Tier 2/3 cities take 2-4 days.
- Economy/Lite service is significantly cheaper but slower — good for non-urgent parcels.
- International shipments require customs declaration — user must specify content type and value accurately.
- Weight limit: domestic up to 50 kg per shipment; international varies by country.
- Volumetric weight formula: (L x B x H in cm) / 5000 — charged at higher of actual vs volumetric weight.
- DTDC has 10,000+ franchise partners — extensive reach in rural India.
- Tracking: https://www.dtdc.in/tracking.asp — enter consignment number to track.
- COD (Cash on Delivery) available for domestic shipments up to certain value limits.
- Restricted items: flammable goods, explosives, narcotics, live animals, perishables without special packaging.
- Use `confirm_action` for shipment review (no money), `collect_payment` for payment (actual charges).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
