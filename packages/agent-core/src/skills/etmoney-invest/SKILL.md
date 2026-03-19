---
name: etmoney-invest
description: Invest in mutual funds on ET Money — search funds, compare returns, start SIP or lump sum investment.
triggers:
  - et money
  - etmoney invest
  - mutual fund investment
  - invest in mutual funds
  - sip investment
  - et money mutual fund
  - start sip
  - lump sum mutual fund
  - best mutual fund
  - etmoney sip
siteUrl: https://www.etmoney.com
requiresAuth: true
params:
  - name: fund_type
    required: false
    hint: Type of mutual fund (e.g. "equity", "debt", "hybrid", "ELSS tax saving", "index fund")
  - name: investment_type
    required: false
    hint: Investment mode — "SIP" (monthly) or "lump sum" (one-time)
  - name: amount
    required: false
    hint: Investment amount (e.g. "₹5000/month SIP", "₹50000 lump sum")
  - name: fund_name
    required: false
    hint: Specific fund name if known (e.g. "Nifty 50 index fund", "Parag Parikh Flexi Cap")
---

# ET Money — Mutual Fund Investment

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Ask user what they want to invest in: equity, debt, hybrid, ELSS (tax saving), index fund, liquid fund.
- Ask investment mode: SIP (systematic monthly) or lump sum (one-time).
- Ask investment amount and duration (for SIP).
- Ask risk appetite: conservative, moderate, aggressive.
- If user names a specific fund, note it for direct search.
- Use `ask_user` for any missing details.

### 2. Open ET Money & Verify Login
- Open a NEW tab and navigate to `https://www.etmoney.com/mutual-funds`.
- Take snapshot. Verify logged in (profile/name visible in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Funds
- If specific fund requested, search by name.
- Otherwise, browse by category: top equity funds, best ELSS funds, top index funds, etc.
- Apply filters: fund type, AMC, risk level, returns period.
- Wait for results to load.
- Take snapshot of fund listings.
- Extract top 5 funds with: fund name, AMC, category, 1Y/3Y/5Y returns, expense ratio, fund size.

### 4. Present Fund Options
- Present top funds via `ask_user` (input_type "choice"):
  "Parag Parikh Flexi Cap — 18.5% 3Y return — ₹45,000 Cr AUM — 0.63% expense"
  "Mirae Asset Large Cap — 15.2% 3Y return — ₹38,000 Cr AUM — 0.53% expense"
  "Nifty 50 Index Fund (UTI) — 14.8% 3Y return — ₹12,000 Cr AUM — 0.18% expense"
- If user wants more details, click through to fund detail page.
- Show: NAV, returns chart, portfolio composition, risk rating, fund manager.
- Take snapshot of selected fund details.

### 5. Set Up Investment
- Click "Invest" or "Start SIP" on the chosen fund.
- Enter investment details:
  - SIP: monthly amount, SIP date (1st-28th), duration
  - Lump sum: one-time amount
- Select folio: new or existing (if user has prior investments in same AMC).
- Take snapshot after investment details filled.

### 6. Review & Confirm
- Use `confirm_action` with investment summary:
  - Fund name and AMC
  - Category (equity/debt/hybrid/ELSS)
  - Investment type: SIP or lump sum
  - Amount (monthly for SIP, one-time for lump sum)
  - SIP date and duration (if SIP)
  - Expected returns (historical, not guaranteed)
  - Expense ratio
  - Tax implications (ELSS: ₹1.5L deduction under 80C; LTCG: 10% above ₹1L)
- Do NOT proceed unless user confirms.

### 7. Payment
- Use `collect_payment`:
  - summary: JSON with fund_name, type, amount, investment_mode, sip_date
  - amount_inr: first SIP amount or lump sum amount
  - description: "ET Money mutual fund investment"
- WAIT for payment confirmation.

### 8. Complete & Confirm
- Complete payment via UPI/netbanking/mandate registration.
- For SIP: set up auto-debit mandate (e-NACH) — handle OTP via `ask_user`.
- Take snapshot of investment confirmation page.
- Report: folio number, fund name, amount invested, units allotted (T+1 for equity), SIP registered date, next SIP date.

## Site Notes

- ET Money is a SEBI-registered investment platform — direct mutual fund plans (no commission, lower expense ratio).
- Direct plans on ET Money save 0.5-1% annually vs regular plans sold by distributors.
- KYC (PAN + Aadhaar) is mandatory for mutual fund investment — ET Money handles eKYC online.
- Chrome profile rsinghtomar3011@gmail.com is pre-logged into ET Money. Do NOT ask user for credentials.
- SIP minimum is typically ₹500/month for most funds; some allow ₹100.
- ELSS funds have a 3-year lock-in period — the only mutual funds with tax benefits under Section 80C.
- Units are allotted at NAV of the investment date (T+0 for liquid, T+1 for equity, T+1 for debt).
- ET Money shows "ET Money Rank" — their proprietary fund rating based on returns, risk, and consistency.
- For lump sum, consider Systematic Transfer Plan (STP) to reduce timing risk — mention to user.
- Redemption: equity funds T+1, liquid funds T+0, ELSS after 3-year lock-in.
- Use `confirm_action` for review, `collect_payment` for investment. WAIT for user response.
