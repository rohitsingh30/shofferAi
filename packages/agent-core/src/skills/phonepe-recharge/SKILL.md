---
name: phonepe-recharge
description: Mobile recharge and bill payments (electricity, gas, broadband, DTH) on PhonePe web.
triggers:
  - phonepe recharge
  - phonepe bill payment
  - recharge on phonepe
  - pay bill phonepe
  - mobile recharge phonepe
  - electricity bill phonepe
  - broadband bill phonepe
  - dth recharge phonepe
  - gas bill phonepe
  - phonepe prepaid recharge
siteUrl: https://www.phonepe.com
requiresAuth: true
params:
  - name: type
    required: true
    hint: What to recharge/pay (e.g. "mobile prepaid", "electricity bill", "broadband", "DTH", "gas bill")
  - name: number
    required: false
    hint: Mobile number or consumer/account number
  - name: amount
    required: false
    hint: Recharge amount or plan (e.g. "₹299 plan", "₹599 unlimited")
  - name: operator
    required: false
    hint: Operator/provider (e.g. "Jio", "Airtel", "Vi", "BSES", "Tata Power")
---

# PhonePe Recharge & Bill Payment

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect recharge/bill details
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **number** (type: "text", required): Account number or mobile number
2. **plan** (type: "text", collapsed): Specific plan or amount (optional — can browse plans on site)

**CRITICAL**: Do NOT open the browser without the account/mobile number.
### 1. Clarify What to Pay
- Determine type: mobile recharge, electricity bill, broadband, DTH, gas, water, landline.
- Get required details based on type:
  - **Mobile recharge**: phone number, operator (auto-detect if possible), plan/amount preference
  - **Electricity**: consumer number, state, provider (BSES, MSEDCL, Tata Power, etc.)
  - **Broadband**: account number, provider (ACT, Airtel, BSNL, etc.)
  - **DTH**: subscriber ID, provider (Tata Play, Airtel Digital TV, Dish TV, etc.)
  - **Gas**: consumer number, provider (IGL, MGL, Adani Gas, etc.)
- Use `ask_user` for any missing information.

### 2. Open PhonePe & Verify Login
- Open a NEW tab and navigate to `https://www.phonepe.com`.
- For mobile recharge, navigate directly to `https://www.phonepe.com/online-mobile-recharge/`.
- For electricity, navigate to `https://www.phonepe.com/electricity-bill-payment/`.
- Take snapshot. Verify logged in (profile/name visible in top bar).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Enter Details & Browse Options
- **Mobile recharge**: Enter phone number → operator auto-detected → browse available plans.
  - PhonePe shows plans by category: Popular, Data, Unlimited, Talktime, Others.
  - Extract top plans with data, validity, price, and benefits.
  - Use `ask_user` (input_type "choice") to pick a plan: "₹XXX — XX GB data — XX days — Unlimited calls"
- **Bill payment**: Enter consumer/account number → fetch outstanding bill → show amount due.
  - Show bill details: due date, bill period, amount, late fee (if any).
- Take snapshot after details are entered and plan/bill is shown.

### 4. Review & Confirm
- Use `confirm_action` with payment summary:
  - Type (recharge / bill payment)
  - Number / account ID
  - Operator / provider
  - Plan details or bill amount
  - Any cashback or coupon applied
  - Total amount to pay
- Do NOT proceed unless user explicitly confirms.

### 5. Payment
- Use `collect_payment`:
  - summary: JSON with type, number, operator, plan/bill details, total
  - amount_inr: total amount
  - description: "PhonePe recharge/bill payment"
- WAIT for payment confirmation from user.

### 6. Complete & Confirm
- Complete payment on PhonePe (UPI / card / wallet).
- Handle OTP via `ask_user` if needed.
- Take snapshot of success/confirmation page.
- Report to user: transaction ID, type, number, amount paid, new validity/balance (for recharge), next due date (for bills).

## Site Notes

- PhonePe is one of India's largest UPI-based payment platforms — supports recharge and 50+ bill categories.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in to PhonePe web. Do NOT ask user for credentials.
- Mobile recharge plans change frequently — always browse current plans on PhonePe, never assume pricing.
- Auto-detect operator from phone number prefix when possible (Jio, Airtel, Vi, BSNL patterns).
- PhonePe often has cashback offers on recharges — mention if any coupon/cashback is auto-applied.
- Electricity bill providers differ by state — confirm state/city if provider is ambiguous.
- Bill fetch may take a few seconds — wait for the amount to fully load before proceeding.
- UPI payments on PhonePe are instant. Card payments may require OTP verification.
- PhonePe wallet balance can sometimes be used — check if available and mention to user.
- Session may expire if Chrome Debug hasn't been used in a while — if login wall appears, stop and notify user.
- Use `confirm_action` for review, `collect_payment` for checkout. Always WAIT for user response.
