---
name: groww-invest
description: Invest in mutual funds or stocks on Groww — search funds, start SIP, buy stocks, track portfolio.
triggers:
  - groww
  - invest groww
  - mutual fund groww
  - buy stocks groww
  - start sip
  - groww sip
  - groww mutual fund
  - invest money
  - buy mutual fund
siteUrl: https://groww.in
requiresAuth: true
params:
  - name: investmentType
    required: true
    hint: "mutual fund", "sip", "stock", or "etf"
  - name: query
    required: false
    hint: Fund name, stock name, or investment goal (e.g. "Nifty 50 index fund", "HDFC Bank", "tax saving ELSS")
  - name: amount
    required: false
    hint: Amount to invest in INR (e.g. "5000", "10000")
---

# Groww Investment

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Understand Requirements
- Determine: mutual fund (lump sum or SIP) vs stock/ETF purchase.
- For mutual funds: fund category preference (equity/debt/hybrid/ELSS/index), SIP amount and frequency, investment horizon.
- For stocks: stock name, quantity or amount, market order vs limit order.
- Use `ask_user` for missing info: "How much would you like to invest? Lump sum or monthly SIP?"
- If user is unsure about which fund, suggest based on goal (tax saving, long term growth, safe debt fund).

### 2. Open Groww & Verify Login
- Open a NEW tab and navigate to `https://groww.in`.
- Take snapshot. Verify logged in (check for portfolio/dashboard or user name).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Verify KYC status — Groww requires completed KYC to invest.

### 3a. Search Mutual Funds
- Navigate to mutual funds section or search by fund name/category.
- Take snapshot of search results or category listing.
- Filter by: category, AMC, returns (1yr/3yr/5yr), rating, expense ratio, fund size.
- Extract top 5 funds: name, category, 1yr/3yr/5yr returns, rating (stars), expense ratio, minimum SIP, AUM.
- Use `ask_user` (input_type "choice"):
  "Fund Name — Category — 3yr: XX% — ⭐ X.X — Expense: X.XX% — Min SIP ₹XXX"
- For ELSS: mention ₹1.5L tax deduction under 80C and 3-year lock-in.

### 3b. Search Stocks
- Navigate to stocks section or search by company name/ticker.
- Take snapshot of stock page.
- Show: current price, day change (%), 52-week high/low, P/E ratio, market cap.
- Use `ask_user`: "How many shares? Or invest a specific amount?"
- Show estimated cost including brokerage (Groww charges ₹20 per order or 0.05%).

### 4. Configure Investment
- For mutual fund SIP:
  - Select SIP frequency (monthly), SIP date (1st-28th), amount.
  - Set up mandate (autopay) if first SIP.
- For mutual fund lump sum:
  - Enter amount (minimum ₹100-500 depending on fund).
- For stocks:
  - Select order type: Market or Limit.
  - Enter quantity or amount.
  - For limit order, set target price.
- Take snapshot of order form.

### 5. Review & Confirm
- Use `confirm_action`:
  - Investment type: SIP/Lump Sum/Stock Buy/Stock Sell
  - Fund/Stock name
  - Amount/Quantity
  - For SIP: monthly amount, SIP date, mandate setup
  - For stocks: order type, price, total cost, brokerage, taxes (STT, stamp duty)
  - For mutual funds: NAV, exit load, lock-in period (if any)
- Do NOT proceed unless user confirms.

### 6. Payment & Execute
- For mutual funds: payment via UPI mandate or net banking.
- For stocks: payment from Groww balance or linked bank.
- Use `collect_payment`:
  - summary: JSON with investment type, name, amount, SIP details if applicable
  - amount_inr: investment amount
  - description: "Groww investment"
- WAIT for payment confirmation.

### 7. Confirm Investment
- Complete the transaction. Handle UPI PIN or OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report:
  - Mutual fund: order ID, fund name, amount, NAV allotment date, SIP date (if SIP).
  - Stock: order ID, stock name, quantity, average price, total cost, order status.
- For SIP: "SIP of ₹XXX will auto-debit on the Xth of every month. First installment processed."
- For stocks: "Order placed. Settlement in T+1 working day."
- Mention: "Track your investments on Groww dashboard."

## Site Notes

- Groww is one of India's top investment platforms — 10Cr+ users, SEBI registered.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Session may expire after 24 hours for trading — if login wall appears, ask user to re-login manually in Chrome Debug.
- KYC is mandatory for investing — if not done, guide user to complete it (Aadhaar + PAN, takes 5 minutes).
- Mutual fund SIPs can start from as low as ₹100/month on many funds.
- Stock market hours: 9:15 AM - 3:30 PM IST (Mon-Fri). After-market orders (AMO) queue for next day.
- Groww charges zero commission on mutual funds; ₹20/order for stocks.
- ELSS funds: best for tax saving under Section 80C — 3 year lock-in, potential 12-15% returns.
- Index funds (Nifty 50, Sensex) are recommended for beginners — low cost, diversified.
- Exit load on mutual funds: typically 1% if redeemed within 1 year (varies by fund).
- Use `confirm_action` for order review, `collect_payment` for execution. WAIT for user response.
