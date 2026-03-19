---
name: park-plus
description: Find parking, pay traffic challans, recharge FASTag, and manage vehicle services on Park+ — nearby parking, book spot, challan check.
triggers:
  - park plus
  - park+
  - find parking
  - parking near me
  - pay challan
  - traffic challan
  - fastag recharge
  - fastag balance
  - park plus challan
  - parking spot
  - vehicle challan check
  - e-challan payment
siteUrl: https://www.parkplus.io
requiresAuth: true
params:
  - name: service
    required: true
    hint: Service needed (e.g. "find parking", "pay challan", "FASTag recharge", "check challan", "buy FASTag")
  - name: vehicle_number
    required: false
    hint: Vehicle registration number (e.g. "DL01AB1234", "KA05MN6789")
  - name: location
    required: false
    hint: Location for parking search (e.g. "Connaught Place Delhi", "Koramangala Bangalore", "near Phoenix Mall Mumbai")
  - name: fastag_amount
    required: false
    hint: FASTag recharge amount (e.g. "500", "1000", "2000")
---

# Park+ Vehicle Services

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine which service the user needs:
  - **Find Parking**: location/area, date and time, duration, vehicle type (car/bike)
  - **Pay Challan**: vehicle registration number, check pending challans
  - **FASTag Recharge**: vehicle number or FASTag ID, recharge amount
  - **FASTag Purchase**: vehicle details for new FASTag
  - **Challan Check**: vehicle number to view pending e-challans with details
  - **Vehicle RC Details**: registration number for vehicle info lookup
- Use `ask_user` to get vehicle registration number (needed for most services).
- For parking: get exact location or landmark, preferred time, and duration.

### 2. Open Park+ in a NEW Tab
- Open a NEW tab and navigate to `https://www.parkplus.io`.
- Take snapshot. Allow location access if prompted for parking search.
- Verify logged in (profile icon or phone number visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3A. Find Parking
- Navigate to parking search section.
- Enter location, area, or landmark.
- Set date, time, and expected duration.
- Select vehicle type: car, bike, or SUV.
- Take snapshot of available parking spots.
- Extract parking options: name, address, distance, price/hour, availability, rating, covered/open.
- Present top 5-8 options via `ask_user` (input_type "choice"):
  - "[Parking Name] — [Distance] away — ₹XX/hr — [Covered/Open] — [Available spots] — Rating X.X"
- Select parking spot. Show details: entry/exit times, total cost estimate, directions.

### 3B. Check & Pay Challans
- Navigate to challan section.
- Enter vehicle registration number.
- Take snapshot while checking (may take a few seconds to fetch from traffic authority database).
- Extract pending challans: challan number, date, violation type, fine amount, issuing authority, location.
- Present all pending challans to user:
  - "Challan #XXX — [Date] — [Violation] — ₹XXX — [Authority] — [Location]"
- Use `ask_user` to confirm which challans to pay (individual or pay all).
- Calculate total: sum of selected challans + convenience fee (if any).

### 3C. FASTag Recharge
- Navigate to FASTag recharge section.
- Enter vehicle number or FASTag ID/barcode number.
- Fetch current FASTag balance and recent toll transactions.
- Present current balance: "Current FASTag balance: ₹XXX"
- Use `ask_user` for recharge amount (common: ₹200, ₹500, ₹1000, ₹2000).
- Show recent transactions: toll plaza, date, amount deducted.

### 3D. Buy New FASTag
- Navigate to FASTag purchase section.
- Enter vehicle details: registration number, vehicle class, owner name.
- Select FASTag issuer bank (ICICI, Paytm, Airtel, etc.).
- FASTag cost: typically ₹150-250 (security deposit) + initial recharge.
- Take snapshot of FASTag application form.

### 4. Review Service Details
- Take snapshot of the selected service summary.
- For parking: show spot details, timing, cost, cancellation policy.
- For challans: show challan list, individual amounts, total payable.
- For FASTag: show current balance, recharge amount, new balance after recharge.
- Present complete information before payment.

### 5. Confirm Action
- Use `confirm_action` to present service summary:
  - **Parking:** spot name, address, date/time, duration, vehicle number, total cost
  - **Challan:** vehicle number, number of challans, violation details, total fine amount + convenience fee
  - **FASTag Recharge:** vehicle number, current balance, recharge amount, new balance
  - **FASTag Purchase:** vehicle details, issuer bank, security deposit, initial recharge
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Payment
- Proceed to payment page.
- Use `collect_payment`:
  - summary: JSON with service type, vehicle number, details, total amount
  - amount_inr: total payable amount
  - description: "Park+ [service type] payment"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Service Confirmation
- Complete payment. Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- **Parking:** Report booking ID, parking name, address, date/time, duration, amount paid. Mention: "Show booking QR code at entry."
- **Challan:** Report receipt number, challans paid, total amount, clearance status. Mention: "Challan clearance reflects in 24-48 hours on Parivahan/traffic authority records."
- **FASTag Recharge:** Report transaction ID, recharge amount, new balance. Mention: "Balance updates within 30 minutes. Check on Park+ app."
- **FASTag Purchase:** Report FASTag number, issuer bank, delivery timeline. Mention: "FASTag will be delivered in 3-5 business days. Affix on windshield inside."

## Site Notes

- Park+ is India's leading vehicle management app — parking, challans, FASTag, fuel, car wash, and more.
- Chrome Profile 3 (rsinghtomar3011@gmail.com) must be logged in. Do NOT ask user for credentials.
- If session expired, login transparently via OTP. OTP goes to operator phone.
- Challan data is fetched from state traffic authority databases — may not cover all states.
- Supported challan states: Delhi, Rajasthan, UP, Karnataka, Maharashtra, Gujarat, MP, and more.
- FASTag recharge: minimum ₹100, maximum ₹1,00,000. UPI and card payments supported.
- Parking availability is real-time — book in advance for popular locations (malls, airports, stations).
- Park+ also offers: car wash booking, fuel price tracker, car/bike insurance, RC details lookup.
- Convenience fee on challan payment: typically ₹25-50 per challan.
- FASTag is mandatory for all four-wheelers on national highways — ₹1,000 fine for non-FASTag lanes.
- Park+ app shows parking history, challan alerts, and FASTag low balance notifications.
- Use `confirm_action` for service review, `collect_payment` for payment. WAIT for user response at each step.
