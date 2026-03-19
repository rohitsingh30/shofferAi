---
name: angel-one-trading
description: Trade stocks, options, and IPOs on Angel One — search stocks, place buy/sell orders, check portfolio, trade F&O.
triggers:
  - angel one
  - angel one trade
  - angel one stocks
  - angel broking
  - buy stocks angel one
  - angel one options
  - angel one ipo
  - angel one portfolio
  - trade on angel one
siteUrl: https://www.angelone.in
requiresAuth: true
params:
  - name: action
    required: true
    hint: "buy", "sell", "options", or "ipo"
  - name: stock
    required: false
    hint: Stock name or symbol (e.g. "Reliance", "TATAMOTORS", "INFY", "NIFTY 24000 CE")
  - name: quantity
    required: false
    hint: Number of shares or lots (e.g. "10", "1 lot")
---

# Angel One Stock Trading

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine action: buy stock, sell stock, trade options (F&O), or apply for IPO.
- For stocks: ask stock name, quantity or amount, order type (market/limit/SL).
- For options: ask underlying (NIFTY/BANKNIFTY/stock), strike price, call/put, expiry.
- For IPO: ask which IPO, number of lots, bid price.
- Ask about investment horizon: intraday (MIS) or delivery (CNC).
- Use `ask_user` for missing info: "Which stock do you want to buy? How many shares?"

### 2. Open Angel One & Verify Login
- Open a NEW tab and navigate to `https://www.angelone.in/smart-api` or `https://trade.angelone.in`.
- Take snapshot. Verify logged in (check for user name, portfolio balance, or trading dashboard).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Handle MPIN or TOTP 2FA if prompted — use `ask_user` to get the code.

### 3. Check Account Balance & Holdings
- Navigate to portfolio or funds section.
- Take snapshot of account summary.
- Extract: available cash balance, margin available, current holdings, unrealized P&L.
- If insufficient funds for the intended trade, inform user: "Available margin: ₹XX. Required: ₹YY."
- For options: check if F&O is enabled on the account.

### 4. Search Stock & View Details
- Search for the stock/underlying in the trading platform.
- Take snapshot of the stock page.
- Extract: current price, day change (% and ₹), 52-week high/low, volume, market cap.
- For options: show option chain — strike prices, premiums, OI, IV.
- Present to user via `ask_user`:
  "RELIANCE — ₹2,485 — +1.2% today — 52W: ₹2,180-₹2,856 — Vol: 45L shares. Proceed?"
- For options: show relevant strikes around current price with premiums.

### 5. Configure Order
- Select order type:
  - Market order: execute at current market price.
  - Limit order: set target price, use `ask_user` for price.
  - Stop-loss (SL): set trigger price and limit price.
  - SL-Market: set trigger price, execute at market when triggered.
- Select product type: CNC (delivery) or MIS (intraday with margin).
- Enter quantity (stocks) or lots (options — 1 lot = specific quantity per underlying).
- For options: select call/put, strike, expiry date.
- Take snapshot of the order form.

### 6. Review & Confirm Order
- Use `confirm_action`:
  - Action: Buy / Sell
  - Stock/Option: name and symbol
  - Order type: Market / Limit / SL
  - Product: CNC (delivery) / MIS (intraday)
  - Quantity: shares or lots
  - Price: market / limit price / trigger price
  - Estimated cost: price x quantity
  - Brokerage: ₹20/order or 0.25% (whichever is lower)
  - Taxes: STT, stamp duty, GST, SEBI charges, exchange charges
  - Total estimated outflow
  - For options: premium, lot size, break-even price, max loss
- Do NOT proceed unless user confirms.

### 7. Execute & Payment
- Place the order on Angel One.
- Use `collect_payment`:
  - summary: JSON with action, stock, order_type, product, quantity, price, brokerage, taxes
  - amount_inr: total order value (or margin required for F&O)
  - description: "Angel One stock trade"
- WAIT for payment confirmation.

### 8. Confirm Trade
- Take snapshot of order confirmation / executed trades.
- Report:
  - Order ID
  - Stock/Option traded
  - Quantity executed
  - Average execution price
  - Total value
  - Brokerage and taxes charged
  - Net cost / proceeds
  - Order status: Executed / Partially filled / Pending
- For delivery: "Shares will be in your demat account after T+1 settlement."
- For intraday: "MIS position open. Must be squared off before 3:15 PM today."
- For options: "Option position active. Monitor carefully — options decay with time."
- For IPO: "IPO application submitted. Allotment results on [date]. Amount blocked via ASBA."
- Mention: "Track your portfolio on Angel One app or website."

## Site Notes

- Angel One (formerly Angel Broking) is one of India's largest stockbrokers — 2.5 Cr+ clients, SEBI registered.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Session expires daily (typically after market close) — if login wall appears, ask user to re-login in Chrome Debug.
- MPIN or TOTP 2FA is mandatory — user must provide the code via `ask_user` when prompted.
- Angel One charges ₹20/order flat for equity delivery, ₹20/order for F&O. Free delivery trades on some plans.
- Stock market hours: 9:15 AM - 3:30 PM IST (Mon-Fri). Pre-open: 9:00-9:15 AM. AMO for after hours.
- F&O requires margin — SPAN + exposure margin. Angel One shows margin requirement before order.
- Options are risky — 90%+ of option buyers lose money. Warn user about risk.
- IPO application via ASBA — amount blocked in bank account, debited only on allotment.
- Angel One Smart API allows algo trading — not relevant for manual orders via browser.
- Use `confirm_action` for order review, `collect_payment` for execution. WAIT for user response.
