---
name: indiapost-ship
description: Book India Post services online — Speed Post, Registered Post, track consignments, book pickups, calculate postage rates.
triggers:
  - india post
  - indiapost
  - speed post
  - registered post
  - post office
  - send via india post
  - india post ship
  - india post track
  - book speed post
  - postal service
siteUrl: https://www.indiapost.gov.in
requiresAuth: true
params:
  - name: item
    required: true
    hint: What to send (e.g. "documents", "parcel", "letter", "legal papers")
  - name: pickup_address
    required: true
    hint: Sender address with pincode
  - name: delivery_address
    required: true
    hint: Receiver address with pincode (domestic or international)
  - name: weight
    required: false
    hint: Approximate weight (e.g. "500 grams", "2 kg")
  - name: service_type
    required: false
    hint: Speed Post, Registered Post, Parcel Post, EMS, or ePacket
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, net banking)
---

# India Post — Speed Post, Registered Post & Parcel Services

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- BEFORE opening the browser, check if user provided item description, sender address, and receiver address.
- If item not described, use `ask_user` (input_type "freetext"): "What do you want to send via India Post? Please describe the item/parcel."
- If sender address not provided, use `ask_user` (input_type "freetext"): "What's the sender address with pincode?"
- If receiver address not provided, use `ask_user` (input_type "freetext"): "What's the receiver address with pincode? (For international, include country)"
- If weight not provided, use `ask_user` (input_type "freetext"): "What's the approximate weight of the item?"
- Ask which service: use `ask_user` (input_type "choice"): "Which India Post service?" with options:
  - Speed Post (fastest, 2-4 days domestic)
  - Registered Post (tracked, 5-7 days)
  - Parcel Post (heavy items, 7-15 days)
  - EMS/International Speed Post (international)
- Ask for sender and receiver details: use `ask_user` (input_type "freetext"): "Please provide sender name & phone, and receiver name & phone."
- If user just wants to track, use `ask_user` (input_type "freetext"): "Please provide the India Post tracking number." and skip to tracking.

### 2. Open India Post & Verify Login
- Open a NEW tab and navigate to `https://www.indiapost.gov.in` or `https://booking.indiapost.gov.in` for online booking.
- Take snapshot. Verify logged in (account or user profile visible).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Take snapshot to confirm logged in and booking portal is accessible.

### 3. Calculate Postage & Create Booking
- Navigate to the postage calculator or rate finder to estimate cost.
- Enter origin pincode, destination pincode, weight, and service type.
- Take snapshot of rate estimate. Share estimated cost with user.
- Navigate to "Book Now" or "Schedule Pickup" or "Online Booking" section.
- Enter sender details: full name, address, pincode, phone, email.
- Enter receiver details: full name, address, pincode/zip, phone.
- Enter article details: content description, weight, declared value.
- For international: specify content type, customs declaration, HS code if applicable.
- Select additional services if needed: insurance, acknowledgment due, VPP (Value Payable Post).
- Take snapshot after filling all details.

### 4. Review Booking Details
- Take snapshot of the booking summary.
- Use `confirm_action` to present booking summary:
  - Article description and weight
  - Sender address and contact
  - Receiver address and contact
  - Service type (Speed Post/Registered/Parcel/EMS)
  - Postage charges breakdown
  - Additional services (insurance, acknowledgment)
  - Estimated delivery time
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 5. Checkout & Payment
- Proceed to payment.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with article details, addresses, service type, postage charges, additional services, estimated delivery
  - amount_inr: total postage cost (number)
  - description: "India Post booking"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 6. Confirm & Get Tracking
- Click "Confirm Booking" or "Pay & Book" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: booking ID/tracking number, article details, sender and receiver addresses, postage paid, estimated delivery date, tracking URL (https://www.indiapost.gov.in/VAS/Pages/trackconsignment.aspx).

## Site Notes

- India Post has the widest reach in India — delivers to every pincode including remote villages and military addresses.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- Speed Post: 2-4 days metro, 4-6 days non-metro. Guaranteed delivery with money-back for delays.
- Registered Post: 5-7 days domestic. Proof of delivery with signature.
- Parcel Post: cheapest for heavy items (up to 35 kg). Takes 7-15 days.
- EMS (Express Mail Service): international speed post to 200+ countries.
- India Post online booking portal (booking.indiapost.gov.in) may have separate login from main site.
- Pickup facility available in select cities — otherwise user must drop at nearest post office.
- Weight limits: Speed Post up to 35 kg, Registered Post up to 2 kg (letters), Parcel Post up to 35 kg.
- Insurance is available for valuable items — declared value required for claims.
- Tracking: https://www.indiapost.gov.in/VAS/Pages/trackconsignment.aspx — enter 13-digit tracking number.
- Government site may be slower than private couriers — be patient with page loads.
- Use `confirm_action` for booking review (no money), `collect_payment` for payment (actual charges).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
