---
name: wazirx-crypto
description: Buy or sell crypto on WazirX — search coins, place market/limit orders, check portfolio and P&L.
triggers:
  - wazirx
  - buy crypto wazirx
  - sell crypto wazirx
  - wazirx bitcoin
  - wazirx trade
  - buy bitcoin
  - buy ethereum
  - crypto trading
  - wazirx portfolio
siteUrl: https://wazirx.com
requiresAuth: true
params:
  - name: action
    required: true
    hint: "buy" or "sell"
  - name: coin
    required: false
    hint: Cryptocurrency name or symbol (e.g. "Bitcoin", "BTC", "Ethereum", "ETH", "Solana", "DOGE")
  - name: amount
    required: false
    hint: Amount in INR to spend or number of coins to sell (e.g. "5000", "0.01 BTC")
---

# WazirX Crypto Trading

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine action: buy or sell.
- Ask which coin/token the user wants to trade.
- Ask for amount: INR amount (for buy) or coin quantity (for sell).
- Ask for order type preference: market order (instant) or limit order (set price).
- If user is unsure which coin, ask about their goal: long-term hold, quick trade, meme coin, top coins by market cap.
- Use `ask_user` for any missing details: "Which cryptocurrency do you want to buy? And how much INR do you want to invest?"

### 2. Open WazirX & Verify Login
- Open a NEW tab and navigate to `https://wazirx.com/exchange`.
- Take snapshot. Verify logged in (check for wallet balance, user icon, or portfolio link).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Check if 2FA prompt appears — if so, use `ask_user` to get the authenticator code from user.

### 3. Check Wallet Balance
- Navigate to wallet/funds section.
- Take snapshot of INR balance and crypto holdings.
- Extract: available INR balance, existing holdings of the target coin (if any).
- If INR balance is insufficient for buy, inform user and ask if they want to deposit first.
- Report current holdings to user for context.

### 4. Search & Select Coin
- Navigate to the exchange page and search for the coin pair (e.g. BTC/INR, ETH/INR).
- Take snapshot of the trading pair page.
- Extract current market data: last traded price, 24h high/low, 24h volume, 24h price change (%).
- Show order book summary: top buy/sell prices, spread.
- Use `ask_user` to confirm the coin and show current price:
  "BTC/INR — Current price: ₹XX,XX,XXX — 24h change: +X.XX% — 24h high: ₹XX — 24h low: ₹XX. Proceed?"

### 5. Configure Order
- For market order:
  - Enter INR amount (buy) or coin quantity (sell).
  - Calculate estimated coins to receive (buy) or INR to receive (sell).
- For limit order:
  - Ask user for target price via `ask_user`: "At what price per coin do you want the order to execute?"
  - Enter price, quantity/amount.
  - Show estimated fill: "You will get ~X.XXXX BTC at ₹XX,XX,XXX per BTC."
- Take snapshot of the order form with all fields filled.

### 6. Review & Confirm Order
- Use `confirm_action`:
  - Action: Buy / Sell
  - Coin: name and symbol
  - Pair: e.g. BTC/INR
  - Order type: Market / Limit
  - Amount: INR amount or coin quantity
  - Price: market price or limit price
  - Estimated coins/INR received
  - Trading fee: 0.2% maker / 0.2% taker (WazirX standard)
  - Total cost including fees
- Do NOT proceed unless user confirms.

### 7. Execute & Payment
- Place the order on WazirX.
- Use `collect_payment`:
  - summary: JSON with action, coin, pair, order_type, amount, price, fee
  - amount_inr: total INR amount (buy) or expected INR (sell)
  - description: "WazirX crypto trade"
- WAIT for payment confirmation.

### 8. Confirm Trade
- Take snapshot of order confirmation / trade history.
- Report:
  - Order ID
  - Coin bought/sold, quantity
  - Execution price (average if market order)
  - Total INR spent/received
  - Fees charged
  - Updated wallet balance
- For limit orders: "Limit order placed. It will execute when price reaches ₹XX. Check open orders for status."
- For market orders: "Trade executed successfully. Coins are in your WazirX wallet."
- Mention: "Track your portfolio on WazirX dashboard."

## Site Notes

- WazirX is India's largest crypto exchange — SEBI/FIU registered, owned by Binance.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Session may expire frequently (every few hours) due to security — if login wall or 2FA appears, ask user to re-login manually in Chrome Debug.
- 2FA (Google Authenticator) is likely enabled — may need user to provide 6-digit code via `ask_user`.
- WazirX charges 0.2% trading fee on both maker and taker orders.
- 1% TDS is deducted on crypto sales above ₹10,000/year as per Indian tax law (Section 194S).
- 30% flat tax on crypto gains in India — no loss offset allowed. Warn user about tax implications.
- Crypto markets are 24/7 — no market hours restriction unlike stocks.
- WazirX has INR pairs and USDT pairs — always prefer INR pairs for direct rupee trading.
- Withdrawal to external wallet may require address whitelisting (24h cooling period).
- Use `confirm_action` for order review, `collect_payment` for execution. WAIT for user response.
