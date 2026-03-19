---
name: paytm-recharge
description: Recharge mobile prepaid, pay bills (electricity, broadband, DTH) on Paytm.
triggers:
  - paytm recharge
  - mobile recharge
  - recharge my phone
  - prepaid recharge
  - paytm bill
  - pay electricity bill
  - pay broadband bill
  - dth recharge
  - recharge on paytm
  - pay bill on paytm
siteUrl: https://paytm.com
requiresAuth: true
params:
  - name: type
    required: true
    hint: What to recharge/pay (e.g. "mobile prepaid", "electricity bill", "broadband", "DTH")
  - name: number
    required: false
    hint: Mobile number or account/consumer number
  - name: amount
    required: false
    hint: Recharge amount or plan (e.g. "₹299 plan", "599 recharge")
  - name: operator
    required: false
    hint: Operator/provider (e.g. "Jio", "Airtel", "Vi", "BSES")
---

# Paytm Recharge & Bill Payment

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Clarify What to Pay
- Determine type: mobile recharge, electricity, broadband, DTH, gas, water.
- Get required details:
  - Mobile recharge: phone number, operator (auto-detect if possible), plan/amount
  - Electricity: consumer number, state, provider
  - Broadband: account number, provider
  - DTH: subscriber ID, provider
- Use `ask_user` for any missing info.

### 2. Open Paytm & Verify Login
- Open a NEW tab and navigate to relevant Paytm page:
  - Mobile: `https://paytm.com/recharge`
  - Electricity: `https://paytm.com/electricity-bill-payment`
  - Broadband: `https://paytm.com/broadband-bill-payment`
  - DTH: `https://paytm.com/dth-recharge`
- Take snapshot. Verify logged in.
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Enter Details
- **Mobile recharge**: Enter phone number → operator auto-detected → browse plans or enter amount.
  - If browsing plans, show top plans with data/validity/price.
  - Use `ask_user` (input_type "choice") to pick a plan.
- **Bill payment**: Enter consumer/account number → fetch bill → show amount due.
- Take snapshot after details entered.

### 4. Review & Confirm
- Use `confirm_action` with payment summary:
  - Type (recharge/bill)
  - Number/account
  - Operator/provider
  - Plan details or bill amount
  - Any cashback/promo
  - Total to pay
- Do NOT proceed unless user confirms.

### 5. Payment
- Use `collect_payment`:
  - summary: JSON with type, number, plan/bill, total
  - amount_inr: total
  - description: "Paytm recharge/bill"
- WAIT for payment confirmation.

### 6. Complete & Confirm
- Complete payment on Paytm (UPI/card/Paytm wallet).
- Handle OTP via `ask_user` if needed.
- Take snapshot of success page.
- Report: transaction ID, type, number, amount paid, new validity/balance (for recharge).

## Site Notes

- Paytm is India's largest bill payment platform.
- Mobile recharge plans change frequently — always browse current plans, don't assume.
- Auto-detect operator from phone number (Jio: 6/7/8/9 prefix patterns).
- Paytm cashback offers are common — mention if applicable.
- Paytm wallet balance can be used — check if available.
- Electricity bills: different providers per state (BSES Delhi, MSEDCL Maharashtra, etc.).
- Bill fetch may take a few seconds — wait for amount to load.
- Some bills support partial payment — clarify full vs partial.
- Paytm Postpaid (buy now pay later) available — mention if user interested.
- UPI payments on Paytm are instant. Card payments may need OTP.
- Use `confirm_action` for review, `collect_payment` for checkout. WAIT for user response.
