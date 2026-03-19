---
name: phonepe-fastag
description: Recharge FASTag on PhonePe — enter vehicle number, select amount, pay highway toll charges.
triggers:
  - phonepe fastag
  - fastag recharge phonepe
  - recharge fastag on phonepe
  - phonepe toll recharge
  - phonepe fastag top up
  - phonepe highway toll
  - phonepe vehicle recharge
  - fastag phonepe pay
siteUrl: https://www.phonepe.com/fastag
requiresAuth: true
params:
  - name: vehicle_number
    required: true
    hint: Vehicle registration number (e.g. "MH12AB1234", "KA01MN5678")
  - name: amount
    required: false
    hint: Recharge amount in INR (e.g. "500", "1000", "2000")
  - name: operator
    required: false
    hint: FASTag issuer bank (e.g. "PhonePe", "ICICI", "SBI", "Kotak", "HDFC")
---

# PhonePe FASTag Recharge

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Get the vehicle registration number from user.
- Ask for recharge amount if not provided. Common amounts: ₹200, ₹500, ₹1000, ₹2000.
- Ask for FASTag issuer bank if not specified. Common issuers: PhonePe, ICICI, SBI, Kotak, HDFC, Axis.
- Use `ask_user` for any missing details.

### 2. Open PhonePe FASTag & Verify Login
- Open a NEW tab and navigate to `https://www.phonepe.com/fastag`.
- Take snapshot. Verify logged in (PhonePe account visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Enter Vehicle Details
- Enter the vehicle registration number.
- Select the FASTag issuer bank from the list if prompted.
- Wait for vehicle and FASTag details to load — owner name, current balance, issuer.
- Take snapshot showing vehicle details and FASTag balance.
- Report current balance to user.

### 4. Select Recharge Amount
- Enter the desired recharge amount or pick from presets.
- If user hasn't specified, present options via `ask_user` (input_type "choice"):
  "₹200 — Light top-up"
  "₹500 — Standard top-up"
  "₹1000 — Full top-up"
  "₹2000 — Heavy top-up"
  "Custom amount"
- Take snapshot after amount is entered.

### 5. Review & Confirm
- Use `confirm_action` with recharge summary:
  - Vehicle number
  - Vehicle owner name
  - FASTag issuer bank
  - Current FASTag balance
  - Recharge amount
  - Any offers/cashback
  - Total to pay
- Do NOT proceed unless user confirms.

### 6. Payment
- Use `collect_payment`:
  - summary: JSON with vehicle_number, owner_name, issuer_bank, recharge_amount, total
  - amount_inr: total recharge amount
  - description: "PhonePe FASTag recharge"
- WAIT for payment confirmation.

### 7. Complete & Confirm
- Complete payment via PhonePe (UPI/card/wallet).
- Handle OTP via `ask_user` if needed.
- Take snapshot of success page.
- Report: transaction ID, vehicle number, amount recharged, new balance, estimated reflection time.

## Site Notes

- PhonePe is one of India's largest UPI payment platforms with FASTag recharge support.
- PhonePe web may redirect some flows to app — use web version where available, fallback to direct bank FASTag portals.
- Vehicle number format: 2 letters (state) + 2 digits (RTO) + 2 letters + 4 digits (e.g. KA01MN5678).
- FASTag balance typically reflects within 30 minutes of successful recharge.
- Minimum recharge is usually ₹100; maximum varies by issuer bank.
- Chrome profile rsinghtomar3011@gmail.com is pre-logged into PhonePe. Do NOT ask user for credentials.
- If FASTag lookup fails, verify vehicle number format and issuer bank with user.
- PhonePe sometimes offers cashback on FASTag recharge — check and mention.
- UPI is the default and fastest payment method on PhonePe.
- PhonePe may require UPI PIN for payment — this is handled on the user's phone, not in browser.
- Use `confirm_action` for review, `collect_payment` for checkout. WAIT for user response.
