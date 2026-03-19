---
name: smallcase-invest
description: Invest in Smallcases (thematic stock portfolios) — browse themes, buy baskets, track performance, rebalance.
triggers:
  - smallcase
  - smallcase invest
  - buy smallcase
  - thematic investing
  - smallcase portfolio
  - stock basket
  - smallcase buy
  - invest in theme
  - nifty smallcase
siteUrl: https://www.smallcase.com
requiresAuth: true
params:
  - name: theme
    required: false
    hint: Investment theme or smallcase name (e.g. "All Weather Investing", "IT Tracker", "Rising Rural Demand", "dividend", "EV")
  - name: amount
    required: false
    hint: Amount to invest in INR (e.g. "25000", "50000") — Smallcases have minimum investment amounts
  - name: broker
    required: false
    hint: Linked broker (e.g. "Zerodha", "Groww", "Angel One", "Upstox")
---

# Smallcase Thematic Portfolio Investment

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Ask what investment theme interests the user: technology, banking, EV, pharma, dividend, all-weather, etc.
- Ask for investment amount — Smallcases have minimum amounts (typically ₹5,000-₹50,000+).
- Ask which broker they use (Zerodha, Groww, Angel One, Upstox) — Smallcase works via linked broker.
- If user is new to Smallcases, explain: "Smallcases are pre-built portfolios of stocks/ETFs around a theme. You own the actual stocks in your demat account."
- Use `ask_user` for missing info: "What theme interests you? How much would you like to invest?"

### 2. Open Smallcase & Verify Login
- Open a NEW tab and navigate to `https://www.smallcase.com/discover`.
- Take snapshot. Verify logged in (check for user avatar, portfolio, or broker connection status).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Verify broker is linked — Smallcase requires a connected broker (Zerodha/Groww/etc.) to execute trades.

### 3. Browse & Discover Smallcases
- Browse the "Discover" page or search by theme/name.
- Apply filters: minimum investment, CAGR, volatility, popularity, manager.
- Take snapshot of discovery page with smallcase listings.
- Extract top 5 relevant smallcases: name, description, minimum investment, CAGR (1yr/3yr), volatility (low/medium/high), number of stocks, rebalance frequency.
- Note: some smallcases are free, others require a fee (₹100-₹900/quarter).

### 4. Present Smallcase Options
- Present top options via `ask_user` (input_type "choice"):
  "All Weather Investing — ₹8,346 min — 3yr CAGR: 14.2% — Low volatility — 7 stocks — Free"
  "Equity & Gold — ₹4,524 min — 3yr CAGR: 16.8% — Low volatility — 3 ETFs — Free"
  "IT Tracker — ₹32,450 min — 3yr CAGR: 22.1% — High volatility — 10 stocks — ₹100/qtr"
- Click on selected smallcase for detailed view: stock composition, historical performance, rebalance timeline.
- Take snapshot of the detailed smallcase page.

### 5. Review Composition & Configure
- Show full stock/ETF list with individual weights and allocations.
- Show historical performance chart, drawdown data, and comparison with benchmark (Nifty 50).
- Enter investment amount (must meet minimum, can invest more — proportionally scaled).
- If amount is less than minimum, inform user: "Minimum investment for this smallcase is ₹XX,XXX."
- Take snapshot of the order preview showing individual stock quantities and amounts.

### 6. Confirm Investment
- Use `confirm_action`:
  - Smallcase name and manager
  - Investment theme / description
  - Amount to invest
  - Number of stocks/ETFs in the basket
  - Individual stock breakdown (top 5 holdings with weights)
  - Historical CAGR (1yr/3yr)
  - Volatility level
  - Rebalance frequency (quarterly/semi-annually)
  - Subscription fee (if paid smallcase)
  - Broker through which trades will execute
  - "You will own these stocks directly in your demat account."
- Do NOT proceed unless user confirms.

### 7. Execute & Payment
- Click "Invest" — this triggers order placement via linked broker.
- Broker login/2FA may be required — handle via `ask_user` if needed.
- Use `collect_payment`:
  - summary: JSON with smallcase_name, amount, num_stocks, broker, cagr_3yr, fee
  - amount_inr: total investment amount
  - description: "Smallcase portfolio investment"
- WAIT for payment confirmation.
- Orders are placed as individual stock orders through the broker.

### 8. Confirm Portfolio Creation
- Take snapshot of order execution summary.
- Report:
  - Smallcase name
  - Total invested amount
  - Number of stocks bought
  - Individual stock orders: name, quantity, price, status (executed/pending)
  - Any partial fills or failed orders
  - Next rebalance date
  - Subscription status (if paid)
- "Your smallcase portfolio is active. Stocks are in your demat account via [broker]."
- "You'll be notified when rebalancing is needed — you can apply it with one click."
- Mention: "Track performance on smallcase.com or your broker app."

## Site Notes

- Smallcase is India's leading thematic investing platform — backed by Sequoia, trusted by 50L+ investors.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Smallcase session may expire — if login wall appears, ask user to re-login in Chrome Debug. Broker re-auth may also be needed.
- Smallcase requires a linked brokerage account (Zerodha, Groww, Angel One, etc.) — cannot invest without one.
- You own actual stocks/ETFs in your demat — not a mutual fund, no NAV, real-time market pricing.
- Minimum investment varies by smallcase — can range from ₹2,000 to ₹2,00,000+.
- Rebalancing is suggested periodically — user must manually apply (one-click on Smallcase).
- STT, stamp duty, and brokerage apply on each stock trade — shown in order summary.
- Paid smallcases charge ₹100-₹900 per quarter — fee goes to smallcase manager.
- Stock market hours: 9:15 AM - 3:30 PM IST (Mon-Fri). Orders outside hours queue as AMO.
- SIP on Smallcases: some support weekly/monthly SIP — auto-invests on schedule.
- Use `confirm_action` for investment review, `collect_payment` for execution. WAIT for user response.
