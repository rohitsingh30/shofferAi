---
name: upstox-trading
description: Trade stocks and F&O on Upstox — search stocks, place orders, manage portfolio, check margins.
triggers:
  - upstox
  - upstox trade
  - upstox stocks
  - buy stocks upstox
  - sell stocks upstox
  - upstox options
  - upstox portfolio
  - trade on upstox
  - upstox order
siteUrl: https://upstox.com
requiresAuth: true
params:
  - name: action
    required: true
    hint: "buy", "sell", or "options"
  - name: stock
    required: false
    hint: Stock name or symbol (e.g. "TCS", "HDFCBANK", "NIFTY 24000 PE")
  - name: quantity
    required: false
    hint: Number of shares or lots (e.g. "50", "2 lots")
---

# Upstox Stock Trading

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine action: buy, sell, or trade options (F&O).
- For stocks: ask stock name/symbol, quantity or investment amount, order type (market/limit/SL).
- For options: ask underlying (NIFTY/BANKNIFTY/FINNIFTY/stock), strike price, call/put, expiry.
- Ask product type: delivery (CNC) or intraday (MIS/Intraday). Default to delivery for beginners.
- Use `ask_user` for missing info: "Which stock do you want to trade? How many shares?"
- If user is unsure, ask about their view: bullish, bearish, or neutral — suggest appropriate strategy.

### 2. Open Upstox & Verify Login
- Open a NEW tab and navigate to `https://pro.upstox.com` (Upstox Pro trading platform).
- Take snapshot. Verify logged in (check for portfolio value, funds display, or user name).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Handle 2FA (TOTP or PIN) if prompted — use `ask_user` to get the code from user.

### 3. Check Funds & Portfolio
- Navigate to funds or portfolio section.
- Take snapshot.
- Extract: available cash, margin available, used margin, current holdings summary, day P&L.
- If insufficient funds: "Available funds: ₹XX. You need ₹YY for this trade. Deposit ₹ZZ more?"
- Show existing position in the stock if user already holds it.

### 4. Search Stock & Analyze
- Search for the stock or option in the Upstox search bar.
- Take snapshot of the stock detail page.
- Extract: current price, change (₹ and %), 52-week range, volume, P/E ratio, market cap.
- For options: display option chain with strikes around current price, premiums, OI, Greeks (delta, theta).
- Present to user via `ask_user`:
  "HDFCBANK — ₹1,652 — +0.8% — 52W: ₹1,425-₹1,794 — P/E: 18.5. Proceed with order?"
- If user wants technical analysis, take snapshot of the chart.

### 5. Configure Order
- Place order with specified parameters:
  - Order type: Market / Limit / Stop Loss / SL-Market
  - Product: CNC (delivery) / Intraday (MIS)
  - Quantity: number of shares or option lots
  - Price: market price or specified limit price
  - Validity: Day / IOC (Immediate or Cancel)
- For limit orders, use `ask_user`: "At what price would you like to place the limit order?"
- For stop-loss, ask for trigger price and limit price.
- Take snapshot of the completed order form.

### 6. Review & Confirm
- Use `confirm_action`:
  - Action: Buy / Sell
  - Stock: name and symbol (or option details)
  - Order type: Market / Limit / SL
  - Product: CNC / Intraday
  - Quantity: shares or lots
  - Price: market or limit price
  - Estimated order value
  - Margin required (for F&O and intraday)
  - Brokerage: ₹20/order (Upstox standard for delivery and F&O)
  - Charges breakdown: STT, stamp duty, GST, exchange turnover, SEBI charges
  - Total estimated cost
  - For options: premium per lot, total premium, break-even, max profit/loss
- Do NOT proceed unless user confirms.

### 7. Execute & Payment
- Submit the order on Upstox.
- Use `collect_payment`:
  - summary: JSON with action, stock, order_type, product, quantity, price, charges
  - amount_inr: total order value or margin blocked
  - description: "Upstox stock trade"
- WAIT for payment confirmation.

### 8. Confirm Trade
- Take snapshot of order execution status.
- Report:
  - Order ID
  - Stock/Option details
  - Execution status: Complete / Partial / Pending / Rejected
  - Quantity filled and average price
  - Total value and net cost (including all charges)
  - P&L impact on portfolio
- For delivery: "Shares credited to demat after T+1 settlement."
- For intraday: "Intraday position open. Auto square-off at 3:15 PM if not closed."
- For options: "Option position live. Premium paid: ₹XX. Break-even at ₹XX."
- If order rejected, explain reason (insufficient margin, price band, etc.) and suggest fix.
- Mention: "Monitor your positions on Upstox Pro. Set alerts for price movements."

## Site Notes

- Upstox is a leading Indian discount broker — 1 Cr+ users, SEBI registered, backed by Ratan Tata.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Session expires daily — if login wall appears, ask user to re-login in Chrome Debug.
- 2FA (TOTP or 6-digit PIN) is mandatory on Upstox — user provides code via `ask_user`.
- Upstox charges ₹20/order for delivery and F&O. Intraday equity is also ₹20/order.
- Upstox Pro web platform (pro.upstox.com) has advanced charting and order placement.
- Stock market hours: 9:15 AM - 3:30 PM IST (Mon-Fri). AMO window: 3:45 PM - 8:57 AM next day.
- Intraday positions auto square-off at 3:15 PM — 15 minutes before market close.
- Options F&O requires margin activation — check if enabled on user's account.
- GTT (Good Till Triggered) orders available — set price alerts that auto-place orders.
- Use `confirm_action` for order review, `collect_payment` for execution. WAIT for user response.
