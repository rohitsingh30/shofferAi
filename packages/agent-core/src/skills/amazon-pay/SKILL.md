---
name: amazon-pay
description: Add money to Amazon Pay wallet balance — load wallet for shopping, bill payments, and transfers.
triggers:
  - amazon pay
  - add money amazon pay
  - amazon pay balance
  - load amazon pay
  - amazon wallet
  - amazon pay top up
  - add balance amazon
  - amazon pay recharge
siteUrl: https://www.amazon.in/pay
requiresAuth: true
params:
  - name: amount
    required: true
    hint: Amount to add in INR (e.g. "500", "1000", "2000")
  - name: payment_method
    required: false
    hint: Payment method (UPI, debit card, net banking, credit card)
---

# Amazon Pay Wallet Top-Up

Chrome profile: rsinghtomar3011@gmail.com. Operator Amazon account logged in.

## Steps

### 1. Gather Requirements
- Check if user specified the amount to add.
- If not, use `ask_user` (input_type "freetext"): "How much money do you want to add to Amazon Pay? (e.g. Rs 500, Rs 1000)"
- Note any payment method preference.
- Inform user about any ongoing cashback offers on loading Amazon Pay.

### 2. Open Amazon Pay
- Open a NEW tab and navigate to `https://www.amazon.in/pay` or `https://www.amazon.in/gp/payments`.
- Take a snapshot to verify page loaded.
- Check if logged in ("Hello, [Name]" in top nav).
- **If NOT logged in or session expired, STOP and tell user: "Amazon session expired, please re-login in Chrome Debug."**
- Do NOT ask user for credentials.

### 3. Verify Login & Check Balance
- Take snapshot confirming Amazon Pay page.
- Note current Amazon Pay balance (displayed on the page).
- Report current balance to user.
- Navigate to "Add Money" or "Top Up" section.
- Take snapshot of add money page.

### 4. Enter Amount
- Enter the requested amount in the add money field.
- Check for any ongoing offers (e.g. "Add Rs 1000, get Rs 50 cashback").
- If offers available, present to user using `ask_user` (input_type "choice"):
  - Suggested amounts with cashback offers
  - User's requested amount
- Take snapshot showing amount entered and any offers applied.

### 5. Review Top-Up
- Use `confirm_action` to present top-up summary:
  - Current balance
  - Amount to add
  - Any cashback/offer applicable
  - New balance after top-up
- Do NOT proceed unless user confirms.

### 6. Checkout & Payment
- Click "Add Money" / "Proceed to Pay".
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with current balance, amount to add, cashback, new balance
  - amount_inr: amount to add (number)
  - description: "Amazon Pay wallet top-up"
- STOP and WAIT for payment confirmation.
- Only proceed if payment confirmed.

### 7. Complete & Confirm
- Complete the payment on Amazon.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: transaction ID, amount added, cashback earned (if any), new Amazon Pay balance.

## Site Notes

- Amazon Pay balance can be used for: shopping, bill payments, recharges, money transfers.
- Maximum wallet balance limit is Rs 1,00,000 (KYC completed) or Rs 10,000 (basic).
- Amazon frequently offers cashback on loading money — always check current offers.
- Minimum top-up amount is usually Rs 1.
- Amazon Pay balance is non-refundable but can be used for any Amazon purchase.
- Operator Chrome Profile 3 is logged in. Do NOT ask user for phone or credentials.
- Amazon uses dynamic rendering — wait for payment options to load.
- Session managed by cookies. If expired, operator re-logins in Chrome Debug.
- Gift card balance and Amazon Pay balance are different — clarify with user.
- UPI is the fastest payment method for adding money.
- Use `confirm_action` for top-up review (no money), `collect_payment` for actual payment.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
