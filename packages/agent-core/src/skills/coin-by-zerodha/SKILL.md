---
name: coin-by-zerodha
description: Buy mutual funds on Zerodha Coin — search funds, start SIP, make lump sum investments, track portfolio.
triggers:
  - zerodha coin
  - coin zerodha
  - zerodha mutual fund
  - buy mutual fund zerodha
  - zerodha sip
  - coin sip
  - coin mutual fund
  - zerodha invest
  - mutual fund on kite
siteUrl: https://coin.zerodha.com
requiresAuth: true
params:
  - name: investmentType
    required: true
    hint: "sip" or "lump sum"
  - name: query
    required: false
    hint: Fund name or category (e.g. "Nifty 50 index", "ELSS", "liquid fund", "flexi cap")
  - name: amount
    required: false
    hint: Amount in INR (e.g. "5000" for SIP, "25000" for lump sum)
---

# Zerodha Coin Mutual Fund Investment

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine investment type: SIP (monthly) or lump sum (one-time).
- Ask for fund preference: specific fund name, category (equity, debt, hybrid, index, ELSS), or goal.
- Ask for amount: monthly SIP amount or lump sum amount.
- If user is unsure, recommend based on goal:
  - Tax saving → ELSS funds
  - Long term wealth → Nifty 50 / Flexi Cap
  - Short term parking → Liquid / Ultra Short Duration
  - Retirement → Balanced Advantage / Target Date
- Use `ask_user` for missing info: "Which type of mutual fund interests you? How much would you like to invest?"

### 2. Open Coin & Verify Login
- Open a NEW tab and navigate to `https://coin.zerodha.com`.
- Take snapshot. Verify logged in (portfolio dashboard, user name, or holdings visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Zerodha uses TOTP-based 2FA — if prompted, use `ask_user` to get the authenticator code.
- Verify Zerodha account has KYC completed and Coin is activated.

### 3. Search & Filter Funds
- Use the search bar or "Explore" section to find funds.
- Filter by: category, sub-category, AMC, returns, rating, fund size.
- Take snapshot of search results.
- Extract top 5 funds: name, category, 1yr/3yr/5yr CAGR, Morningstar rating, expense ratio, minimum SIP/lump sum, AUM.
- Coin shows direct plans only — mention this advantage to user.

### 4. Present Fund Options
- Present top funds via `ask_user` (input_type "choice"):
  "Mirae Asset Large Cap — Equity — 3yr: 16.8% — ⭐ 5 — Expense: 0.53% — Min SIP ₹1,000"
  "HDFC Index Nifty 50 — Index — 3yr: 15.1% — ⭐ 4 — Expense: 0.20% — Min SIP ₹500"
  "Axis Bluechip — Large Cap — 3yr: 13.5% — ⭐ 4 — Expense: 0.43% — Min SIP ₹500"
- Click on selected fund for detailed page — show NAV chart, holdings, sector allocation.
- Take snapshot of fund detail page.

### 5. Place Order
- Click "Buy" or "SIP" on the selected fund.
- For SIP:
  - Enter monthly amount (minimum varies, usually ₹500).
  - Select SIP date (specific dates available based on AMC).
  - Set up OTM (One Time Mandate) for auto-debit if not already set up.
- For lump sum:
  - Enter investment amount.
  - Minimum varies by fund (₹100-₹5,000).
- Take snapshot of the order form with all details filled.

### 6. Review & Confirm
- Use `confirm_action`:
  - Fund name and AMC
  - Plan: Direct (always on Coin)
  - Investment type: SIP / Lump Sum
  - Amount: ₹XX (monthly for SIP, one-time for lump sum)
  - SIP date (if SIP)
  - Expense ratio
  - Exit load (if any)
  - Lock-in period (3 years for ELSS)
  - Historical returns (1yr/3yr/5yr) — "Past performance does not guarantee future returns"
  - Mandate status (for SIP)
- Do NOT proceed unless user confirms.

### 7. Payment & Execute
- Coin deducts from linked bank account via UPI mandate or net banking.
- Use `collect_payment`:
  - summary: JSON with fund_name, plan, type, amount, sip_date, expense_ratio
  - amount_inr: investment amount
  - description: "Zerodha Coin mutual fund investment"
- WAIT for payment confirmation.
- Handle UPI PIN or bank OTP via `ask_user` if needed.

### 8. Confirm Investment
- Take snapshot of order confirmation page.
- Report:
  - Order ID
  - Fund name (Direct plan)
  - Amount invested
  - NAV allotment timeline: T+1 for equity, T+1 for debt
  - For SIP: SIP registration number, debit date, mandate reference
  - Folio number (if new) or existing folio
- For SIP: "SIP of ₹XX registered. Auto-debit on the Xth of every month via your linked bank."
- For lump sum: "Investment of ₹XX placed. Units will be allotted at tomorrow's NAV."
- Mention: "Track on Kite app or coin.zerodha.com. All holdings are in demat form."

## Site Notes

- Zerodha Coin is part of Zerodha, India's largest stockbroker — 1.8 Cr+ accounts, SEBI registered.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Zerodha session expires daily (around midnight) — if login wall appears, ask user to re-login in Chrome Debug.
- TOTP 2FA is mandatory on Zerodha — user will need to provide 6-digit authenticator code via `ask_user`.
- Coin ONLY offers direct plans — zero commission, lower expense ratio than regular plans.
- All mutual fund units on Coin are held in demat form (linked to Zerodha demat account).
- Zerodha charges zero fee for mutual fund investments — no commission, no AMC charges from Zerodha's side.
- OTM (One Time Mandate) is required for SIP auto-debit — setup takes 1-2 days for bank approval.
- Coin is accessible via coin.zerodha.com or within the Kite trading platform.
- ELSS investments before March 31 qualify for current FY tax deduction under Section 80C.
- Use `confirm_action` for order review, `collect_payment` for execution. WAIT for user response.
