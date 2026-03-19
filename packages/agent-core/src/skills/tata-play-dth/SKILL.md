---
name: tata-play-dth
description: Recharge Tata Play (formerly Tata Sky) DTH — select plan/pack, enter subscriber ID, pay.
triggers:
  - tata play recharge
  - tata sky recharge
  - tata play dth
  - dth recharge tata
  - recharge tata sky
  - tata play plan
  - tata play channel pack
  - tata sky pack
siteUrl: https://www.tataplay.com
requiresAuth: true
params:
  - name: subscriber_id
    required: false
    hint: Tata Play subscriber ID or registered mobile number
  - name: amount
    required: false
    hint: Recharge amount or plan name (e.g. "Rs 300", "Hindi Lite HD pack")
  - name: pack_type
    required: false
    hint: Type of pack (monthly, long duration, add-on, channel pack)
---

# Tata Play DTH Recharge

Chrome profile: rsinghtomar3011@gmail.com. Operator Tata Play account logged in.

## Steps

### 1. Gather Requirements
- Check if user provided subscriber ID or registered mobile number.
- If not, use `ask_user` (input_type "freetext"): "What's your Tata Play subscriber ID or registered mobile number?"
- Check if user specified a recharge amount or pack preference.
- If not, use `ask_user` (input_type "freetext"): "What kind of recharge do you need? (e.g. monthly plan renewal, specific amount, add-on pack)"

### 2. Open Tata Play Website
- Open a NEW tab and navigate to `https://www.tataplay.com`.
- Take a snapshot to verify page loaded.
- Check if logged in (profile/account icon showing subscriber name).
- **If NOT logged in or session expired, STOP and tell user: "Tata Play session expired, please re-login in Chrome Debug."**
- Do NOT ask user for credentials.

### 3. Verify Login & Navigate to Recharge
- Take snapshot confirming logged-in state.
- Navigate to recharge/plans section.
- Enter subscriber ID or mobile number if needed.
- Take snapshot showing subscriber account details (current plan, balance, expiry).
- Report current plan status to user.

### 4. Select Pack/Plan
- Browse available plans and packs:
  - Monthly packs, long-duration packs (3/6/12 months)
  - Channel add-on packs, OTT combo packs
- Take snapshot of available options.
- Use `ask_user` (input_type "choice") to present best matching options:
  - Pack name, channels included, price, validity
  - Any current offers or discounts
- User selects preferred pack/amount.
- Click on selected plan.
- Take snapshot of plan details.

### 5. Review Recharge
- Take snapshot of recharge summary page.
- Use `confirm_action` to present recharge summary:
  - Subscriber ID / name
  - Selected pack: name, price, validity, channels
  - Current balance (if shown)
  - Total payable amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click proceed to payment.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with subscriber ID, pack name, channels count, validity, amount
  - amount_inr: recharge amount (number)
  - description: "Tata Play DTH recharge"
- STOP and WAIT for payment confirmation.
- Only proceed if payment confirmed. If cancelled, ask what to change.

### 7. Complete & Confirm
- Complete the recharge on Tata Play.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: transaction ID, pack activated, validity dates, amount paid, new balance/expiry.

## Site Notes

- Tata Play was formerly Tata Sky — users may use either name.
- Subscriber ID is a 10-digit number, different from mobile number.
- Long-duration packs (6/12 months) offer significant savings — suggest if user is open.
- OTT combo packs include streaming apps (Netflix, Prime, Disney+, etc.).
- Operator Chrome Profile 3 is logged in. Do NOT ask user for phone or credentials.
- Tata Play website uses Angular — wait for dynamic content to load.
- Session expiry handled by operator, never expose credentials to user.
- Recharge activates instantly — user should see channels within minutes.
- If account is inactive/expired, it may need a minimum recharge to reactivate.
- Use `confirm_action` for recharge review (no money), `collect_payment` for actual payment.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
