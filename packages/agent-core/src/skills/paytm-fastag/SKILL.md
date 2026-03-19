---
name: paytm-fastag
description: Recharge FASTag on Paytm — enter vehicle number, select amount, pay toll charges.
triggers:
  - paytm fastag
  - fastag recharge
  - recharge fastag on paytm
  - toll recharge
  - fastag top up
  - paytm fastag recharge
  - vehicle fastag
  - highway toll recharge
  - fastag balance
  - recharge toll tag
siteUrl: https://paytm.com/fastag-recharge
requiresAuth: true
params:
  - name: vehicle_number
    required: true
    hint: Vehicle registration number (e.g. "MH12AB1234", "DL01CA5678")
  - name: amount
    required: false
    hint: Recharge amount in INR (e.g. "500", "1000", "2000")
  - name: operator
    required: false
    hint: FASTag issuer bank (e.g. "Paytm Payments Bank", "ICICI", "SBI", "Kotak")
---

# Paytm FASTag Recharge

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect recharge/bill details
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **number** (type: "text", required): Account number or mobile number
2. **plan** (type: "text", collapsed): Specific plan or amount (optional — can browse plans on site)

**CRITICAL**: Do NOT open the browser without the account/mobile number.
### 1. Gather Requirements
- Get the vehicle registration number from user.
- Ask for recharge amount. Common amounts: ₹200, ₹500, ₹1000, ₹2000.
- Ask for FASTag issuer bank if not provided. Common issuers: Paytm Payments Bank, ICICI, SBI, Kotak, HDFC, Airtel Payments Bank.
- Use `ask_user` for any missing details.

### 2. Open Paytm FASTag & Verify Login
- Open a NEW tab and navigate to `https://paytm.com/fastag-recharge`.
- Take snapshot. Verify logged in (Paytm account visible in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Enter Vehicle Details
- Enter the vehicle registration number in the search field.
- Select the FASTag issuer bank from dropdown if prompted.
- Wait for FASTag details to load — vehicle owner name, current balance.
- Take snapshot showing vehicle details and current FASTag balance.
- Report current balance to user via `ask_user`.

### 4. Select Recharge Amount
- Enter the recharge amount or select from preset amounts (₹200, ₹500, ₹1000, ₹2000).
- If user hasn't specified amount, present options via `ask_user` (input_type "choice"):
  "₹200 — Light top-up"
  "₹500 — Standard top-up"
  "₹1000 — Full top-up"
  "₹2000 — Heavy top-up"
- Take snapshot after amount entered.

### 5. Review & Confirm
- Use `confirm_action` with recharge summary:
  - Vehicle number
  - Vehicle owner name
  - FASTag issuer bank
  - Current FASTag balance
  - Recharge amount
  - Any cashback/promo applied
  - Total to pay
- Do NOT proceed unless user confirms.

### 6. Payment
- Use `collect_payment`:
  - summary: JSON with vehicle_number, owner_name, issuer_bank, recharge_amount, total
  - amount_inr: total recharge amount
  - description: "Paytm FASTag recharge"
- WAIT for payment confirmation.

### 7. Complete & Confirm
- Complete payment on Paytm (UPI/card/Paytm wallet).
- Handle OTP via `ask_user` if needed.
- Take snapshot of success page.
- Report: transaction ID, vehicle number, recharge amount, new FASTag balance, estimated reflection time.

## Site Notes

- FASTag is mandatory for all vehicles on Indian national highways — recharge keeps toll payments seamless.
- Paytm supports FASTag recharge for all major issuer banks (Paytm, ICICI, SBI, Kotak, HDFC, Airtel).
- Vehicle number format: 2 letters (state) + 2 digits (RTO) + 2 letters + 4 digits (e.g. MH12AB1234).
- FASTag balance reflects within 30 minutes of recharge — inform user.
- Minimum recharge amount is typically ₹100; maximum ₹1,00,000.
- Chrome profile rsinghtomar3011@gmail.com is pre-logged into Paytm. Do NOT ask user for credentials.
- If FASTag is not found for the vehicle number, ask user to verify the number and issuer bank.
- Paytm cashback offers are common on FASTag recharge — mention if applicable.
- Paytm wallet balance can be used for FASTag recharge — check if available.
- UPI payments on Paytm are instant. Card payments may need OTP.
- Use `confirm_action` for review, `collect_payment` for checkout. WAIT for user response.
