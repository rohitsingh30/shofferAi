---
name: gpay-recharge
description: Mobile recharge on Google Pay web — prepaid/postpaid recharge, select plan, pay via GPay.
triggers:
  - google pay recharge
  - gpay recharge
  - mobile recharge gpay
  - google pay mobile
  - gpay prepaid recharge
  - gpay postpaid bill
  - recharge on google pay
  - google pay plan
siteUrl: https://pay.google.com/gp/w/home/activity
requiresAuth: true
params:
  - name: phone_number
    required: true
    hint: Mobile number to recharge (e.g. "9876543210")
  - name: amount
    required: false
    hint: Recharge amount or plan (e.g. "Rs 299", "unlimited plan")
  - name: operator
    required: false
    hint: Mobile operator (e.g. "Jio", "Airtel", "Vi", "BSNL")
---

# Google Pay Mobile Recharge

Chrome profile: rsinghtomar3011@gmail.com. Operator Google account logged in.

## Steps

### 1. Gather Requirements
- Check if user provided mobile number and operator.
- If number missing, use `ask_user` (input_type "freetext"): "What mobile number do you want to recharge?"
- If operator not specified, it will be auto-detected from the number.
- If amount/plan not specified, use `ask_user` (input_type "freetext"): "What recharge amount or plan do you need? (e.g. Rs 299, unlimited data plan)"

### 2. Open Google Pay Web
- Open a NEW tab and navigate to `https://pay.google.com/gp/w/home/activity` or Google Pay recharge section.
- Take a snapshot to verify page loaded.
- Check if logged in (Google account profile visible).
- **If NOT logged in or session expired, STOP and tell user: "Google account session expired, please re-login in Chrome Debug."**
- Do NOT ask user for credentials.

### 3. Verify Login & Navigate to Recharge
- Take snapshot confirming Google Pay page.
- Navigate to "Mobile Recharge" or "New Payment" > "Mobile Recharge" section.
- Take snapshot of recharge page.

### 4. Enter Number & Select Plan
- Enter the mobile number.
- Wait for operator auto-detection (Jio, Airtel, Vi, BSNL).
- If operator not auto-detected, select manually.
- Take snapshot showing detected operator and available plans.
- Browse plans by category: popular, unlimited, data, talktime, validity.
- Present recommended plans using `ask_user` (input_type "choice"):
  - Plan: price, data, validity, talktime, SMS, description
  - Highlight best value plans
- User selects preferred plan.
- Click on selected plan.
- Take snapshot confirming plan selection.

### 5. Review Recharge
- Use `confirm_action` to present recharge summary:
  - Mobile number and operator
  - Plan: price, data, validity, calls, SMS
  - Any cashback/reward from Google Pay
- Do NOT proceed unless user confirms.

### 6. Checkout & Payment
- Click "Pay" / "Recharge".
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with phone number, operator, plan details, cashback, amount
  - amount_inr: recharge amount (number)
  - description: "Mobile recharge via Google Pay"
- STOP and WAIT for payment confirmation.
- Only proceed if payment confirmed.

### 7. Complete & Confirm
- Complete the recharge on Google Pay.
- Handle UPI PIN or payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: transaction ID, mobile number, operator, plan activated, amount paid, cashback earned, validity.

## Site Notes

- Google Pay web has limited features compared to the mobile app — recharge is available on web.
- Auto-detection of operator works for most Indian numbers.
- Google Pay often offers cashback/rewards on recharges — mention to user.
- Prepaid plans change frequently — always show current plans from the site.
- Postpaid bill payment is separate from prepaid recharge — confirm with user.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) is logged in to Google.
- Do NOT ask user for Google credentials — session must already be active.
- Google Pay uses Material Design — wait for plan cards to render dynamically.
- Session managed by Google cookies — long-lived but may require re-auth.
- UPI payment goes through Google Pay's UPI handle — instant processing.
- Recharge is instant — user should see balance update within minutes.
- Use `confirm_action` for recharge review (no money), `collect_payment` for actual payment.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
