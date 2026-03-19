---
name: coindcx-crypto
description: Trade crypto on CoinDCX — buy Bitcoin, Ethereum, or altcoins with INR, set limit orders, track portfolio.
triggers:
  - coindcx
  - buy crypto coindcx
  - sell crypto coindcx
  - coindcx bitcoin
  - coindcx trade
  - coindcx ethereum
  - trade crypto india
  - coindcx portfolio
  - crypto exchange india
siteUrl: https://coindcx.com
requiresAuth: true
params:
  - name: action
    required: true
    hint: "buy" or "sell"
  - name: coin
    required: false
    hint: Cryptocurrency name or symbol (e.g. "Bitcoin", "BTC", "Ethereum", "ETH", "Solana", "MATIC")
  - name: amount
    required: false
    hint: Amount in INR to invest or coin quantity to sell (e.g. "10000", "0.5 ETH")
---

# CoinDCX Crypto Trading

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine action: buy or sell.
- Ask which cryptocurrency the user wants to trade.
- Ask for investment amount in INR (buy) or quantity to sell.
- Ask for order type: market order (instant at current price) or limit order (set target price).
- If user is new to crypto, suggest starting with BTC or ETH — safest large-cap options.
- Use `ask_user` for any missing info: "Which crypto would you like to buy? How much INR do you want to invest?"

### 2. Open CoinDCX & Verify Login
- Open a NEW tab and navigate to `https://coindcx.com/exchange`.
- Take snapshot. Verify logged in (check for wallet icon, user avatar, or balance display).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Check for 2FA prompt — use `ask_user` to get the authenticator/SMS code if required.

### 3. Check Wallet & Balances
- Navigate to wallet or portfolio section.
- Take snapshot of balances.
- Extract: INR balance available for trading, existing crypto holdings.
- If insufficient INR for the intended purchase, inform user: "Your INR balance is ₹XX. You need ₹YY. Would you like to deposit more?"
- Show current portfolio summary if user has existing holdings.

### 4. Search & View Coin
- Use the exchange search to find the trading pair (e.g. BTC/INR, ETH/INR, SOL/INR).
- Take snapshot of the trading pair page with price chart.
- Extract: current price, 24h change (%), 24h high/low, 24h volume, market cap.
- Present to user via `ask_user`:
  "ETH/INR — ₹XX,XXX — 24h: +X.X% — High: ₹XX,XXX — Low: ₹XX,XXX. Confirm trade?"
- If user wants to compare multiple coins, show a comparison table.

### 5. Configure Order
- For market order:
  - Enter INR amount (buy) or coin quantity (sell).
  - System auto-calculates estimated coins to receive or INR proceeds.
- For limit order:
  - Use `ask_user` to get target price: "At what price should the order trigger?"
  - Enter limit price and quantity/amount.
  - Show estimated fill details.
- Take snapshot of the configured order form.
- Verify all fields are correct before proceeding.

### 6. Review & Confirm
- Use `confirm_action`:
  - Action: Buy / Sell
  - Coin: full name and symbol
  - Trading pair: e.g. ETH/INR
  - Order type: Market / Limit
  - Amount: INR to spend or coins to sell
  - Price: current market price or limit price
  - Estimated quantity received
  - Trading fee: 0.1% maker / 0.1% taker (CoinDCX standard)
  - TDS: 1% on sell transactions (as per Indian tax law)
  - Total cost / net proceeds
- Do NOT proceed unless user confirms.

### 7. Execute & Payment
- Place the order on CoinDCX.
- Use `collect_payment`:
  - summary: JSON with action, coin, pair, order_type, amount, price, fee, tds
  - amount_inr: total INR involved in trade
  - description: "CoinDCX crypto trade"
- WAIT for payment confirmation.

### 8. Confirm Trade
- Take snapshot of order execution / trade confirmation.
- Report:
  - Order ID / Trade ID
  - Coin and quantity traded
  - Execution price (weighted average for market orders)
  - Total INR spent or received
  - Fee deducted
  - TDS deducted (for sells)
  - Updated wallet balance
- For limit orders: "Limit order placed at ₹XX. Will execute when market reaches your price. Check 'Open Orders'."
- For market orders: "Trade complete! X.XXXX [COIN] added to your wallet."
- Mention: "View your portfolio and P&L on CoinDCX dashboard."

## Site Notes

- CoinDCX is a leading Indian crypto exchange — FIU registered, backed by major VCs.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Session may expire after a few hours — if login wall or 2FA appears, ask user to re-login in Chrome Debug.
- CoinDCX often requires 2FA (Google Authenticator or SMS OTP) — be prepared to ask user for the code.
- Trading fees: 0.1% maker / 0.1% taker — lower than WazirX. Volume discounts available.
- 1% TDS on crypto sales above ₹10,000/year (Section 194S) — deducted at source by CoinDCX.
- 30% tax on crypto gains (no loss offset) — remind user of Indian crypto tax obligations.
- CoinDCX supports 500+ coins — more variety than WazirX.
- INR deposit via UPI, IMPS, NEFT — usually instant for UPI.
- Crypto markets trade 24/7/365 — no market hours restriction.
- CoinDCX has a "CoinDCX Pro" interface for advanced traders — use standard exchange for simplicity.
- Use `confirm_action` for order review, `collect_payment` for execution. WAIT for user response.
