---
name: slice-card
description: Manage Slice credit line — pay bills, track spending, check rewards, manage EMI, view statements.
triggers:
  - slice
  - slice card
  - slice pay
  - slice bill
  - slice credit
  - slice rewards
  - slice emi
  - slice statement
  - slice spend
siteUrl: https://www.sliceit.com
requiresAuth: true
params:
  - name: action
    required: true
    hint: "pay bill", "check balance", "track spending", "rewards", "convert to emi", or "view statement"
  - name: amount
    required: false
    hint: Amount to pay (e.g. "5000", "full due", "minimum due")
---

# Slice Credit Line Management

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine action: pay bill, check outstanding balance, track spending, check/redeem rewards, convert purchase to EMI, or view statement.
- For bill payment: ask whether to pay full due, minimum due, or a custom amount.
- For EMI conversion: ask which transaction to convert and preferred tenure (3/6/9/12 months).
- For rewards: ask if user wants to check balance, view offers, or redeem.
- For spending: ask time period — this billing cycle, last month, custom range.
- Use `ask_user` for missing info: "Would you like to pay your Slice bill or do something else?"

### 2. Open Slice & Verify Login
- Open a NEW tab and navigate to `https://www.sliceit.com` or Slice web dashboard.
- Take snapshot. Verify logged in (dashboard with credit limit, due amount, or user name visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Slice may require phone OTP for web login — handle via `ask_user`.

### 3. View Account Overview
- Take snapshot of the account dashboard.
- Extract: total credit limit, available limit, current outstanding, minimum due, due date, last payment date.
- Show summary: "Credit limit: ₹XX,XXX | Used: ₹XX,XXX | Available: ₹XX,XXX | Due: ₹XX,XXX by [date]."
- If due date is approaching (within 5 days), flag urgently: "Bill of ₹XX,XXX due in X days. Late payment affects credit score."

### 4a. Pay Bill
- Navigate to bill payment section.
- Take snapshot of payment page showing due amount breakdown.
- Extract: total outstanding, statement balance, minimum due, payment history.
- Show options via `ask_user` (input_type "choice"):
  "Pay full due — ₹XX,XXX — Avoid all interest"
  "Pay minimum due — ₹X,XXX — Avoid late fee (interest applies on rest)"
  "Pay custom amount — Enter your amount"
- For custom amount, use `ask_user` to get the specific amount.
- Warn if paying minimum: "Paying only minimum due will incur interest at ~3% per month on remaining balance."

### 4b. Track Spending
- Navigate to transactions or spending section.
- Take snapshot of transaction history.
- Extract: list of transactions with date, merchant, amount, category, EMI status.
- Summarize by category: "Food: ₹X,XXX (XX%) — Shopping: ₹X,XXX (XX%) — Bills: ₹X,XXX (XX%)."
- Show top 5 largest transactions this cycle.
- Highlight any transactions eligible for EMI conversion.

### 4c. Rewards & Cashback
- Navigate to rewards section.
- Take snapshot of reward balance and offers.
- Extract: reward points/cashback balance, pending rewards, available redemption options.
- Show options: "Cashback balance: ₹XXX. Redeem as statement credit or browse partner offers."
- List active offers and promotions.

### 4d. Convert to EMI
- Navigate to EMI conversion section or select a transaction.
- Show eligible transactions for EMI conversion.
- Use `ask_user` (input_type "choice") with transactions:
  "Amazon ₹15,000 — Convert to 3 EMIs of ₹5,167 (12% p.a.)"
  "Flipkart ₹8,000 — Convert to 6 EMIs of ₹1,400 (14% p.a.)"
- Show EMI details: monthly amount, interest rate, total cost, processing fee (if any).

### 5. Review & Confirm
- Use `confirm_action`:
  - Action: Pay Bill / Redeem Rewards / Convert to EMI
  - For bill pay: amount, payment type (full/minimum/custom), due date, interest saved
  - For EMI: transaction, tenure, monthly EMI, total interest, processing fee
  - For rewards: points to redeem, reward type, value
  - Impact on available credit limit
  - Payment source (linked bank account / UPI)
- Do NOT proceed unless user confirms.

### 6. Payment & Execute
- Process the transaction.
- Use `collect_payment`:
  - summary: JSON with action, amount, payment_type, due_date, interest_saved_or_charged
  - amount_inr: payment amount
  - description: "Slice credit line payment"
- WAIT for payment confirmation.
- Handle UPI PIN or OTP via `ask_user` if needed.

### 7. Confirm Transaction
- Take snapshot of success/confirmation page.
- Report:
  - For bill pay: transaction ID, amount paid, remaining balance, next due date, credit limit restored.
  - For EMI: EMI plan ID, monthly amount, tenure, first EMI date, total payable.
  - For rewards: reward redeemed, credit applied, remaining rewards.
  - Updated account status.
- For bill pay: "₹XX,XXX paid successfully. Available limit restored to ₹XX,XXX. Next due: [date]."
- For EMI: "EMI plan created: ₹XX/month for X months. First deduction on [date]."
- For rewards: "₹XXX cashback credited to your Slice account."
- If bill was overdue: "Payment received. Late fee of ₹XXX may have been applied. Contact Slice support to waive."
- Mention: "Track your spending and bills on the Slice app or website."

## Site Notes

- Slice (now Slice UPI + credit line) is a popular fintech offering credit lines and UPI payments.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Slice web interface may have limited features compared to the app — bill payment and basic account management work.
- Session may expire quickly — if login wall appears, ask user to re-login in Chrome Debug.
- Slice credit line interest: ~2-3% per month on revolving balance. Always recommend paying full due.
- Late payment impacts CIBIL score — strongly warn user if due date is near.
- Slice recently merged with North East Small Finance Bank — now a full banking entity.
- EMI conversion available on transactions above ₹3,000 typically — interest rates vary 12-24% p.a.
- Slice rewards/cashback earned on card usage — rates vary by merchant category.
- Minimum payment is typically 5% of outstanding or ₹500, whichever is higher.
- Slice credit limit ranges from ₹2,000 to ₹10,00,000 based on credit profile.
- Use `confirm_action` for review, `collect_payment` for bill payment. WAIT for user response.
