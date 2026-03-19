---
name: paytm-postpaid
description: Pay postpaid mobile bill on Paytm. Enter number, auto-detect operator, fetch bill, and pay.
triggers:
  - pay postpaid bill
  - postpaid bill payment
  - mobile postpaid bill
  - pay phone bill
  - postpaid bill on paytm
  - pay postpaid bill online
  - mobile bill payment paytm
  - pay my phone bill
  - postpaid mobile bill paytm
  - airtel postpaid bill paytm
  - jio postpaid bill paytm
  - vi postpaid bill paytm
siteUrl: https://paytm.com/postpaid-mobile-bill-payment
requiresAuth: true
params:
  - name: number
    required: true
    hint: Postpaid mobile number (e.g. "9876543210")
  - name: operator
    required: false
    hint: Operator if known (e.g. "Airtel", "Jio", "Vi", "BSNL") — auto-detected from number
  - name: amount
    required: false
    hint: Amount to pay (default full bill). Can be "full bill", "minimum due", or specific amount.
---

# Paytm Postpaid Mobile Bill Payment

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Get the postpaid mobile number.
- Determine the operator. Paytm auto-detects operator from the number, but ask if ambiguous.
  - Major postpaid operators: Airtel, Jio, Vi (Vodafone Idea), BSNL, MTNL.
- Ask if user wants to pay full bill, minimum due, or a specific amount. Default to full bill.
- Use `ask_user` for any missing details (number, operator).

### 2. Open Paytm Postpaid & Verify Login
- Open a NEW tab and navigate to `https://paytm.com/postpaid-mobile-bill-payment`.
- Take snapshot. Verify logged in (Paytm account name or profile icon visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Enter Number & Fetch Bill
- Enter the postpaid mobile number in the input field.
- Wait for operator auto-detection. If operator is not auto-detected, select manually from dropdown.
- Click "Fetch Bill" or "Proceed" and wait for bill details to load.
- Take snapshot and extract bill details:
  - Account holder name
  - Mobile number
  - Operator
  - Bill amount (total outstanding)
  - Bill date and billing cycle
  - Due date
  - Minimum amount due (if different from total)
  - Last payment date and amount
  - Usage breakdown (calls, data, SMS, VAS) if available
- If bill fetch fails, ask user to verify number and operator.

### 4. Review & Confirm
- Use `confirm_action` with bill summary:
  - Operator and mobile number
  - Account holder name
  - Total bill amount
  - Minimum due (if applicable)
  - Billing cycle and due date
  - Amount to pay (full / minimum / custom)
  - Any Paytm cashback or promotional offer
  - Late fee warning (if past due date)
- Do NOT proceed unless user confirms.

### 5. Payment
- Use `collect_payment`:
  - summary: JSON with operator, number, account_name, bill_amount, due_date, paying_amount
  - amount_inr: amount to pay
  - description: "Postpaid mobile bill payment via Paytm"
- WAIT for payment confirmation from user.

### 6. Complete & Confirm
- Complete payment on Paytm (UPI / card / net banking / Paytm wallet).
- Handle OTP via `ask_user` if needed.
- Take snapshot of payment success page.
- Report to user: transaction ID, operator, mobile number, amount paid, payment date, next bill date.

## Site Notes

- Paytm supports all major postpaid operators — Airtel, Jio, Vi, BSNL, MTNL.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in. Do NOT ask user for credentials.
- Operator auto-detection works based on mobile number prefix — if it fails, select manually.
- Paying minimum due avoids late fee but interest accrues on remaining balance — warn user about this.
- Postpaid bills are typically monthly — due date is usually 15-20 days after bill generation.
- Paytm often offers cashback on first-time postpaid bill payments — mention if available.
- Bill fetch takes 5-10 seconds — wait for the amount to appear before proceeding.
- Some corporate postpaid connections may not support bill fetch — user may need to enter amount manually.
- Payment reflects in the operator's system within 2-4 hours for Airtel/Jio, up to 24 hours for BSNL.
- Use `confirm_action` for review, `collect_payment` for checkout. Always WAIT for user response.
