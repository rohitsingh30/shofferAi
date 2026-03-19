---
name: fi-money
description: Manage money on Fi (neobank) — savings account, smart deposits, mutual fund investments, spending insights.
triggers:
  - fi money
  - fi bank
  - fi savings
  - fi deposit
  - fi mutual fund
  - fi neobank
  - fi account
  - fi smart deposit
  - fi invest
siteUrl: https://fi.money
requiresAuth: true
params:
  - name: action
    required: true
    hint: "check balance", "smart deposit", "invest", "transfer", or "spending insights"
  - name: amount
    required: false
    hint: Amount in INR (e.g. "10000" for deposit, "5000" for mutual fund)
  - name: fund
    required: false
    hint: Fund name or category for investment (e.g. "liquid fund", "Nifty 50 index")
---

# Fi Money (Neobank) Management

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine action: check balance, create smart deposit (FD), invest in mutual funds, transfer money, or view spending insights.
- For smart deposit: ask amount, tenure preference (flexible or fixed), and whether to auto-invest on salary credit.
- For mutual fund: ask fund type (liquid, equity, debt, index), amount, SIP or lump sum.
- For transfer: ask recipient details (UPI ID, account number), amount, and purpose.
- For spending insights: ask for time period (this month, last month, last 3 months).
- Use `ask_user` for missing info: "What would you like to do on Fi? Check balance, invest, or something else?"

### 2. Open Fi & Verify Login
- Open a NEW tab and navigate to `https://fi.money`.
- Take snapshot. Verify logged in (dashboard with account balance, stash, or user greeting visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Fi may require phone OTP for web login — handle via `ask_user` if prompted.

### 3. View Account Dashboard
- Take snapshot of the main dashboard.
- Extract: savings account balance, stash balance (smart deposits), investment value, recent transactions.
- Show summary to user: "Account balance: ₹XX,XXX | Smart deposits: ₹XX,XXX | Investments: ₹XX,XXX."
- If user asked for spending insights, navigate to the analytics section.

### 4a. Smart Deposit (FD)
- Navigate to "Smart Deposit" or "Stash" section.
- Take snapshot of deposit options.
- Extract: current interest rates for different tenures (7 days to 5 years), minimum deposit amount.
- Fi offers flexible deposits (withdraw anytime, slightly lower rate) and fixed deposits (higher rate, lock-in).
- Enter deposit amount and select tenure.
- Use `ask_user` (input_type "choice"):
  "Flexible — 5.5% p.a. — Withdraw anytime — No lock-in"
  "90 days — 7.0% p.a. — Premature withdrawal with penalty"
  "1 year — 7.5% p.a. — Best rate — Lock-in"

### 4b. Mutual Fund Investment
- Navigate to "Invest" or "Mutual Funds" section.
- Take snapshot of available funds.
- Extract: fund names, categories, returns (1yr/3yr), expense ratio, minimum investment.
- Present options via `ask_user` (input_type "choice"):
  "Fi Liquid Fund — Debt — 1yr: 6.8% — Expense: 0.15% — Min ₹500"
  "Nifty 50 Index — Equity — 3yr: 15.2% — Expense: 0.18% — Min ₹100"
- Configure: SIP or lump sum, amount, SIP date.

### 4c. Money Transfer
- Navigate to "Send Money" or payments section.
- Enter recipient: UPI ID, or bank account + IFSC.
- Enter amount and optional note.
- Take snapshot of transfer form.

### 5. Review & Confirm
- Use `confirm_action`:
  - Action type: Smart Deposit / Mutual Fund / Transfer
  - For deposit: amount, tenure, interest rate, maturity amount, maturity date
  - For mutual fund: fund name, type (SIP/lump sum), amount, expense ratio
  - For transfer: recipient, amount, payment mode
  - Source: Fi savings account (balance: ₹XX,XXX)
  - Any fees or charges
- Do NOT proceed unless user confirms.

### 6. Payment & Execute
- For smart deposit: amount debited from Fi savings account.
- For mutual fund: payment via Fi account balance or UPI.
- For transfer: UPI or IMPS from Fi account.
- Use `collect_payment`:
  - summary: JSON with action, details, amount, source_balance
  - amount_inr: transaction amount
  - description: "Fi Money transaction"
- WAIT for payment confirmation.
- Handle UPI PIN or OTP via `ask_user` if needed.

### 7. Confirm Transaction
- Take snapshot of confirmation page.
- Report:
  - For smart deposit: deposit ID, amount, rate, tenure, maturity date, maturity value.
  - For mutual fund: order ID, fund name, amount, NAV allotment date.
  - For transfer: transaction ID, recipient, amount, status (success/pending).
  - Updated account balance.
- For smart deposit: "₹XX,XXX locked for [tenure] at [rate]% p.a. Maturity on [date]: ₹XX,XXX."
- For mutual fund: "Investment of ₹XX placed. Units allotted by tomorrow."
- For transfer: "₹XX sent to [recipient]. Transaction ID: [id]."
- Mention: "Track everything on the Fi app or fi.money dashboard."

## Site Notes

- Fi is a neobank by epiFi (backed by Google, Sequoia) — partners with Federal Bank for deposits (RBI insured up to ₹5L).
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Fi web experience may be limited compared to the app — some features might redirect to app download. If so, inform user.
- Session may expire quickly (security-focused neobank) — if login wall appears, ask user to re-login in Chrome Debug.
- Fi savings account interest: 4% p.a. on balance up to ₹1L (via Federal Bank).
- Smart Deposits are FDs via Federal Bank — insured up to ₹5L by DICGC. Rates vary 5.5%-7.5% p.a.
- Fi offers "Jump" (salary account), "Ask Fi" (AI spending insights), and "Jars" (goal-based savings).
- Mutual funds on Fi are limited selection but curated — powered by in-app integration.
- UPI transfers from Fi are instant. NEFT/IMPS also supported for bank transfers.
- Fi has excellent spending analytics — auto-categorizes transactions, shows patterns.
- Use `confirm_action` for review, `collect_payment` for any transaction. WAIT for user response.
