---
name: jupiter-bank
description: Banking on Jupiter — check account balance, UPI payments, manage rewards, savings pots, track spending.
triggers:
  - jupiter
  - jupiter bank
  - jupiter money
  - jupiter upi
  - jupiter rewards
  - jupiter savings
  - jupiter account
  - jupiter balance
  - jupiter payment
siteUrl: https://jupiter.money
requiresAuth: true
params:
  - name: action
    required: true
    hint: "check balance", "send money", "rewards", "savings pot", or "spending analysis"
  - name: amount
    required: false
    hint: Amount in INR for transfer or savings pot (e.g. "5000", "10000")
  - name: recipient
    required: false
    hint: UPI ID or account details for money transfer (e.g. "name@upi", "9876543210@paytm")
---

# Jupiter Bank Account Management

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine action: check balance, send money (UPI/bank transfer), manage rewards (jewels), create/manage savings pot, or view spending analysis.
- For send money: ask recipient (UPI ID, phone number, or bank details), amount, and purpose.
- For savings pot: ask goal name, target amount, monthly auto-save amount.
- For rewards: ask if user wants to check jewel balance, redeem rewards, or browse offers.
- For spending analysis: ask time period (this month, last month, custom range).
- Use `ask_user` for missing info: "What would you like to do on Jupiter?"

### 2. Open Jupiter & Verify Login
- Open a NEW tab and navigate to `https://jupiter.money`.
- Take snapshot. Verify logged in (dashboard with balance, recent transactions, or user greeting visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Jupiter may require phone OTP for web login — handle via `ask_user`.

### 3. View Account Dashboard
- Take snapshot of the dashboard.
- Extract: account balance, savings pot balances, jewels (reward points), recent transactions (last 5).
- Present summary: "Balance: ₹XX,XXX | Savings pots: ₹XX,XXX | Jewels: XX,XXX (₹XX value)."
- Show recent transaction history if user requested balance check.

### 4a. Send Money (UPI/Transfer)
- Navigate to send money or payments section.
- Enter recipient details: UPI ID, phone number, or bank account + IFSC.
- Enter amount and optional note/remarks.
- Take snapshot of the transfer form.
- Verify details are correct before proceeding.

### 4b. Manage Savings Pots
- Navigate to "Pots" or savings section.
- Take snapshot of existing pots.
- Show existing pots: name, balance, target, auto-save status.
- To create new pot: enter name, target amount, auto-save amount (daily/weekly/monthly).
- To add money to existing pot: select pot, enter amount.
- Use `ask_user` (input_type "choice") if user has multiple pots:
  "Vacation Fund — ₹15,000/₹50,000 — Auto-save ₹2,000/month"
  "Emergency Fund — ₹25,000/₹1,00,000 — Auto-save ₹5,000/month"
  "New Pot — Create a fresh savings pot"

### 4c. Rewards & Jewels
- Navigate to rewards or jewels section.
- Take snapshot of jewels balance and available offers.
- Extract: total jewels, monetary value, expiring jewels, available redemption options.
- Show redemption options via `ask_user` (input_type "choice"):
  "Amazon Gift Card — 5,000 jewels — ₹50 value"
  "Cashback to account — 10,000 jewels — ₹100"
  "Partner offers — various jewel amounts"

### 4d. Spending Analysis
- Navigate to spending insights or analytics section.
- Take snapshot of spending breakdown.
- Extract: total spend by category (food, shopping, bills, transport, entertainment), top merchants, month-over-month comparison.
- Present summary: "This month: ₹XX,XXX total — Food ₹XX,XXX (XX%) — Shopping ₹XX,XXX (XX%)."

### 5. Review & Confirm
- Use `confirm_action`:
  - Action: Send Money / Create Pot / Add to Pot / Redeem Rewards
  - For transfer: recipient, amount, payment mode (UPI/IMPS/NEFT)
  - For pot: pot name, amount to add, auto-save settings
  - For rewards: reward type, jewels to redeem, value received
  - Account balance after transaction
  - Any fees (Jupiter UPI transfers are free)
- Do NOT proceed unless user confirms.

### 6. Payment & Execute
- Execute the transaction.
- Use `collect_payment`:
  - summary: JSON with action, recipient_or_pot, amount, payment_mode
  - amount_inr: transaction amount
  - description: "Jupiter bank transaction"
- WAIT for payment confirmation.
- Handle UPI PIN via `ask_user` if needed for transfers.

### 7. Confirm Transaction
- Take snapshot of confirmation/success page.
- Report:
  - For transfer: transaction ID, recipient, amount, status (success/pending), timestamp.
  - For pot: pot name, new balance, target progress, next auto-save date.
  - For rewards: jewels redeemed, reward received, remaining jewels.
  - Updated account balance.
- For transfer: "₹XX sent to [recipient] via UPI. Transaction ID: [id]."
- For pot: "₹XX added to [pot name]. Progress: ₹XX/₹XX (XX% of goal)."
- For rewards: "Redeemed XX jewels for ₹XX [reward type]. Remaining: XX jewels."
- Mention: "Track all transactions on Jupiter app or jupiter.money."

## Site Notes

- Jupiter is a neobank (backed by QED, Matrix) — partners with Federal Bank for savings accounts (RBI insured up to ₹5L).
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Jupiter web experience may have limited features compared to the app — core banking and UPI work on web.
- Session may expire frequently — if login wall appears, ask user to re-login in Chrome Debug.
- Jupiter "Jewels" are loyalty points earned on every UPI payment, bill pay, and feature usage.
- Savings account interest: up to 4% p.a. (via Federal Bank).
- Jupiter "Pots" are virtual savings jars — money stays in savings account but is earmarked for goals.
- UPI transfers are instant and free. NEFT/RTGS also supported for larger amounts.
- Jupiter has "Edge" (credit card) co-branded with CSB Bank — ₹500 cashback/month on spending.
- Auto-save feature deducts fixed amount daily/weekly/monthly into pots — great for disciplined saving.
- Use `confirm_action` for review, `collect_payment` for execution. WAIT for user response.
