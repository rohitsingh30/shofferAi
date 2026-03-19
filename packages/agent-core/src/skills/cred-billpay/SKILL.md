---
name: cred-billpay
description: Pay credit card bills on CRED — check due amount, pay bills, earn rewards.
triggers:
  - cred
  - cred bill
  - pay credit card bill
  - credit card payment
  - cred pay
  - pay card bill
  - credit card bill on cred
siteUrl: https://web.cred.club
requiresAuth: true
params:
  - name: card
    required: false
    hint: Which credit card (e.g. "HDFC", "SBI", "ICICI") if user has multiple
  - name: amount
    required: false
    hint: Amount to pay (default full due amount). Can be "minimum due" or specific amount.
---

# CRED Credit Card Bill Payment

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect recharge/bill details
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **number** (type: "text", required): Account number or mobile number
2. **plan** (type: "text", collapsed): Specific plan or amount (optional — can browse plans on site)

**CRITICAL**: Do NOT open the browser without the account/mobile number.
### 1. Clarify Card & Amount
- If user has multiple cards, ask which one to pay.
- Ask: full due, minimum due, or specific amount?
- Default: pay full outstanding amount.

### 2. Open CRED & Verify Login
- Open a NEW tab and navigate to `https://web.cred.club`.
- Take snapshot. Verify logged in (dashboard with card(s) visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. View Bill Details
- Take snapshot of dashboard showing card(s) and bill amounts.
- Extract: card name/bank, total due, minimum due, due date, statement date.
- If multiple cards, present via `ask_user` (input_type "choice"):
  "HDFC Regalia — ₹XX,XXX due — Due: [date]"

### 4. Review & Confirm
- Click on the card to pay. Take snapshot of bill details.
- Use `confirm_action`:
  - Credit card: bank name, card type, last 4 digits
  - Total outstanding / statement balance
  - Minimum due
  - Amount to pay (full/minimum/custom)
  - Due date
  - CRED coins/rewards to be earned
- Do NOT proceed unless user confirms.

### 5. Payment
- Select pay full amount (or enter custom amount).
- Use `collect_payment`:
  - summary: JSON with card, amount, due_date, rewards
  - amount_inr: payment amount
  - description: "CRED credit card bill"
- WAIT for payment confirmation.

### 6. Complete & Confirm
- Complete payment via UPI/netbanking.
- Handle OTP via `ask_user` if needed.
- Take snapshot of success page.
- Report: transaction ID, card paid, amount, CRED coins earned, next due date.

## Site Notes

- CRED is a premium credit card bill payment platform.
- CRED web version has limited functionality vs app — bill payment works.
- CRED coins earned on every payment — can be redeemed for offers.
- CRED requires credit score 750+ to join — premium user base.
- Payment reflects in 1-3 business days on card statement.
- Always pay by due date to avoid interest charges — remind user.
- Paying minimum due avoids late fee but accrues interest — warn user.
- CRED sometimes offers cashback/rewards for paying early — mention.
- UPI is the fastest payment method on CRED.
- Use `confirm_action` for review, `collect_payment` for payment. WAIT for user response.
