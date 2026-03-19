---
name: zerodha-trading
description: Trade stocks on Zerodha Kite — search stocks, place buy/sell orders, manage portfolio, track positions.
triggers:
  - zerodha
  - zerodha kite
  - trade stocks
  - buy stocks zerodha
  - sell stocks zerodha
  - kite trading
  - zerodha order
  - stock trading
  - place order zerodha
siteUrl: https://kite.zerodha.com
requiresAuth: true
params:
  - name: action
    required: true
    hint: "buy" or "sell"
  - name: stock
    required: true
    hint: Stock name or ticker symbol (e.g. "RELIANCE", "TCS", "HDFC Bank", "INFY")
  - name: quantity
    required: false
    hint: Number of shares (e.g. "10", "50", "100")
  - name: orderType
    required: false
    hint: "market" (default), "limit", "SL" (stop-loss), or "SL-M" (stop-loss market)
  - name: price
    required: false
    hint: Limit price or trigger price (required for limit/SL orders)
---

# Zerodha Kite Stock Trading

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Understand Requirements
- Determine: buy or sell, stock name/ticker, quantity, order type.
- For buy: ask about investment amount or number of shares.
- For sell: check if user holds the stock (will verify on Kite holdings).
- For limit orders: get target price.
- For stop-loss: get trigger price and limit price.
- Use `ask_user` for missing info: "How many shares? Market order or limit order?"
- IMPORTANT: Stock trading involves real money and market risk. Confirm user's intent clearly.

### 2. Open Zerodha Kite & Verify Login
- Open a NEW tab and navigate to `https://kite.zerodha.com`.
- Take snapshot. Verify logged in (check for dashboard, portfolio, or watchlist).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Zerodha requires 2FA (TOTP) — if prompted, ask user for TOTP code via `ask_user`.

### 3. Search Stock
- Use the search bar on Kite to search for the stock name/ticker.
- Take snapshot of search results.
- Select the correct stock from NSE/BSE exchange (prefer NSE for liquidity).
- Navigate to stock chart/details page.
- Show current market data:
  - Current price, day change (absolute and %), open, high, low, close
  - Volume, 52-week high/low
  - Market depth (bid/ask spread) for informed decisions
- If market is closed (after 3:30 PM or weekend), inform user and offer AMO (After Market Order).

### 4. Prepare Order
- Open the buy/sell order form on Kite.
- Fill in order details:
  - Exchange: NSE (default) or BSE
  - Order type: Market / Limit / SL / SL-M
  - Product type: CNC (delivery/long-term) or MIS (intraday)
  - Quantity: number of shares
  - Price: current market price (market order) or specified limit price
- Take snapshot of the order form.
- Calculate order value: quantity x price, plus charges (brokerage, STT, stamp duty, GST).

### 5. Review & Confirm
- Use `confirm_action`:
  - Action: BUY or SELL
  - Stock: name and ticker (e.g. "Reliance Industries (RELIANCE)")
  - Exchange: NSE/BSE
  - Order type: Market/Limit/SL/SL-M
  - Product: CNC (delivery) or MIS (intraday)
  - Quantity
  - Price (market/limit)
  - Estimated order value
  - Brokerage: ₹20 or 0.03% (whichever is lower)
  - Other charges: STT, stamp duty, exchange charges, GST
  - Total estimated cost
  - Market status: Open / Closed (AMO)
- **WARNING: "This is a real stock market order. Once executed, it cannot be undone."**
- Do NOT proceed unless user explicitly confirms.

### 6. Execute Order
- Place the order on Zerodha Kite.
- Use `collect_payment`:
  - summary: JSON with action, stock, quantity, price, order type, total value
  - amount_inr: total order value (for buy) or 0 (for sell, proceeds will be credited)
  - description: "Zerodha stock trade"
- WAIT for payment confirmation.
- Note: For buy orders, funds must be available in Zerodha account or linked bank.

### 7. Confirm Execution
- Take snapshot of order confirmation on Kite.
- Check order status: Executed / Pending / Rejected.
- Report:
  - Order ID
  - Stock name and ticker
  - Action: Buy/Sell
  - Quantity executed
  - Average execution price
  - Total value
  - Order status
  - Settlement: "T+1 — shares will appear in Demat by [date]" (for buy)
  - For sell: "Proceeds of ₹XXX will be available in [date]"
- If order is pending (limit/SL), inform: "Order is pending at ₹XXX. Will execute when price is reached."
- If rejected, report reason (insufficient funds, circuit limit, etc.).
- Mention: "Track your order and positions on Kite dashboard."

## Site Notes

- Zerodha is India's largest stockbroker by active clients — discount broker, ₹20 flat per order.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Session expires DAILY at end of market hours — user must re-login each trading day via Chrome Debug.
- Zerodha requires 2FA (TOTP via Kite app or Google Authenticator) — always need user input for this.
- Market hours: 9:15 AM - 3:30 PM IST, Monday to Friday (except market holidays).
- AMO (After Market Orders): placed after hours, executed at market open next trading day.
- CNC (Cash and Carry): for delivery/investment — no leverage. MIS (Margin Intraday): squared off by 3:20 PM.
- Brokerage: ₹20 per executed order or 0.03%, whichever is lower. Equity delivery is FREE.
- Funds: must be available in Zerodha account — add funds via UPI/net banking on Kite.
- Circuit limits: some stocks have 5%/10%/20% circuit — orders beyond circuit price are rejected.
- F&O (Futures & Options) also available but high risk — only for experienced traders.
- Use `confirm_action` for order review, `collect_payment` for execution. WAIT for user response.
