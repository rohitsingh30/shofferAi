---
name: paytm-wallet
description: Add money to Paytm wallet — load wallet balance for payments, transfers, and recharges.
triggers:
  - paytm wallet
  - add money paytm
  - paytm wallet balance
  - load paytm wallet
  - paytm top up
  - add paytm balance
  - paytm wallet recharge
  - paytm money add
siteUrl: https://paytm.com/wallet
requiresAuth: true
params:
  - name: amount
    required: true
    hint: Amount to add in INR (e.g. "500", "1000", "5000")
  - name: payment_method
    required: false
    hint: Payment method (UPI, debit card, net banking, credit card)
---

# Paytm Wallet Top-Up

Chrome profile: rsinghtomar3011@gmail.com. Operator Paytm account logged in.

## Steps

### 1. Gather Requirements
- Check if user specified the amount to add.
- If not, use `ask_user` (input_type "freetext"): "How much money do you want to add to Paytm wallet? (e.g. Rs 500, Rs 1000)"
- Note any payment method preference.
- Check if user needs KYC upgrade for higher balance limit.

### 2. Open Paytm Wallet
- Open a NEW tab and navigate to `https://paytm.com/wallet` or `https://paytm.com/passbook`.
- Take a snapshot to verify page loaded.
- Check if logged in (profile/account visible with name).
- **If NOT logged in or session expired, STOP and tell user: "Paytm session expired, please re-login in Chrome Debug."**
- Do NOT ask user for credentials.

### 3. Verify Login & Check Balance
- Take snapshot confirming Paytm wallet page.
- Note current Paytm wallet balance.
- Report current balance and wallet type (Basic/Full KYC) to user.
- Navigate to "Add Money" section.
- Take snapshot of add money page.

### 4. Enter Amount
- Enter the requested amount in the add money field.
- Check for any cashback offers on adding money.
- If amount exceeds wallet limit (Rs 10,000 for basic, Rs 1,00,000 for full KYC):
  - Inform user about the limit.
  - Suggest KYC upgrade if basic wallet.
- Take snapshot showing amount entered.

### 5. Review Top-Up
- Use `confirm_action` to present top-up summary:
  - Current wallet balance
  - Amount to add
  - Wallet type and remaining limit
  - Any cashback/offer
  - New balance after top-up
- Do NOT proceed unless user confirms.

### 6. Checkout & Payment
- Click "Add Money" / "Proceed".
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with current balance, amount, wallet type, cashback, new balance
  - amount_inr: amount to add (number)
  - description: "Paytm wallet top-up"
- STOP and WAIT for payment confirmation.
- Only proceed if payment confirmed.

### 7. Complete & Confirm
- Complete the payment on Paytm.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation/passbook page.
- Report: transaction ID, amount added, cashback earned, new Paytm wallet balance.

## Site Notes

- Paytm wallet has two tiers: Basic (Rs 10,000 limit) and Full KYC (Rs 1,00,000 limit).
- Full KYC requires Aadhaar verification — cannot be done online for the user.
- Paytm wallet money can be used for: recharges, bill payments, shopping, transfers, QR payments.
- Cashback offers on adding money are common — always check before proceeding.
- Minimum add money amount is Rs 1.
- Operator Chrome Profile 3 is logged in. Do NOT ask user for phone or credentials.
- Paytm uses React — wait for wallet balance and forms to render.
- Session managed by cookies. If expired, operator re-logins in Chrome Debug.
- Wallet balance is different from Paytm Payments Bank balance — clarify with user.
- UPI and debit cards are the most common methods for adding money.
- Money added to wallet is instant — balance updates immediately.
- Use `confirm_action` for top-up review (no money), `collect_payment` for actual payment.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
