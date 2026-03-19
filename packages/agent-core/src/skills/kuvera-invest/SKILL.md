---
name: kuvera-invest
description: Invest in mutual funds on Kuvera — goal-based investing, direct plans, SIP, lump sum, tax saving ELSS.
triggers:
  - kuvera
  - kuvera mutual fund
  - invest kuvera
  - kuvera sip
  - kuvera invest
  - goal based investing
  - direct mutual fund
  - kuvera elss
  - tax saving mutual fund kuvera
siteUrl: https://kuvera.in
requiresAuth: true
params:
  - name: investmentType
    required: true
    hint: "sip", "lump sum", "goal-based", or "tax saving (ELSS)"
  - name: query
    required: false
    hint: Fund name, category, or goal (e.g. "Nifty 50 index", "retirement", "tax saving", "debt fund")
  - name: amount
    required: false
    hint: Monthly SIP amount or lump sum amount in INR (e.g. "5000", "50000")
---

# Kuvera Mutual Fund Investment

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine investment type: SIP (monthly), lump sum (one-time), goal-based, or tax saving (ELSS).
- For goal-based: ask about the goal (retirement, house, education, emergency fund), target amount, timeline.
- For SIP: ask monthly amount and preferred fund category (equity, debt, hybrid, index, ELSS).
- For lump sum: ask amount and risk tolerance (aggressive, moderate, conservative).
- For ELSS: mention 80C tax benefit up to ₹1.5L, 3-year lock-in.
- Use `ask_user` for missing info: "What is your investment goal? How much can you invest monthly?"

### 2. Open Kuvera & Verify Login
- Open a NEW tab and navigate to `https://kuvera.in/explore`.
- Take snapshot. Verify logged in (dashboard with portfolio or user name visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Verify KYC status — Kuvera requires completed KYC (PAN + Aadhaar) to invest.

### 3. Explore & Filter Funds
- Navigate to "Explore" or search for funds by name/category.
- Apply filters: category (equity/debt/hybrid/ELSS/index), AMC, risk level, returns period.
- Take snapshot of filtered fund list.
- Extract top 5 funds: name, category, 1yr/3yr/5yr returns, star rating, expense ratio, minimum investment, AUM.
- For goal-based: use Kuvera's goal planner to get recommended allocation.

### 4. Present Options to User
- Present funds via `ask_user` (input_type "choice"):
  "Parag Parikh Flexi Cap — Equity — 3yr: 18.5% — ⭐ 5 — Expense: 0.63% — Min SIP ₹1,000"
  "UTI Nifty 50 Index — Index — 3yr: 15.2% — ⭐ 4 — Expense: 0.18% — Min SIP ₹500"
  "Axis ELSS Tax Saver — ELSS — 3yr: 14.8% — ⭐ 4 — Expense: 0.55% — Lock-in 3yr"
- If user wants more detail, click through to fund page and show NAV history, portfolio composition.
- Take snapshot of selected fund's detail page.

### 5. Configure Investment
- Click "Invest" on the selected fund.
- For SIP:
  - Enter monthly amount, select SIP date (1st-28th).
  - Set up e-mandate (autopay) for auto-debit — Kuvera supports BSE/NSE mandates.
  - Choose tenure (perpetual or fixed months).
- For lump sum:
  - Enter investment amount (minimum varies by fund, usually ₹100-₹5,000).
- For goal-based:
  - Set up the goal on Kuvera with target amount and timeline.
  - Kuvera auto-recommends fund allocation (equity/debt split based on timeline).
- Take snapshot of the order form.

### 6. Review & Confirm
- Use `confirm_action`:
  - Fund name and AMC
  - Investment type: SIP / Lump Sum / Goal-based
  - Amount: monthly SIP amount or lump sum
  - SIP date and mandate details (if SIP)
  - Expense ratio and exit load
  - Category and risk level
  - Direct plan (zero commission — Kuvera only sells direct plans)
  - Lock-in period (3 years for ELSS, none for others)
  - Expected returns (historical, not guaranteed)
- Do NOT proceed unless user confirms.

### 7. Payment & Execute
- Proceed to payment — UPI, net banking, or mandate auto-debit.
- Use `collect_payment`:
  - summary: JSON with fund_name, type, amount, sip_date, category, expense_ratio
  - amount_inr: investment amount
  - description: "Kuvera mutual fund investment"
- WAIT for payment confirmation.

### 8. Confirm Investment
- Complete payment. Handle UPI PIN or OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report:
  - Order ID / folio number
  - Fund name and plan (Direct)
  - Amount invested
  - NAV allotment: T+1 for equity, T+1 for debt
  - SIP details: monthly amount, debit date, mandate status
  - For ELSS: "Lock-in until [date]. Tax deduction under 80C."
- For SIP: "SIP of ₹XX will auto-debit on the Xth of every month. First installment processed."
- Mention: "Track your investments and goals on Kuvera dashboard. All investments are in Direct plans (zero commission)."

## Site Notes

- Kuvera is a free direct mutual fund platform — zero commission, zero fees for investors.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Session typically lasts several days but may expire — if login wall appears, ask user to re-login in Chrome Debug.
- Kuvera ONLY sells direct plans — these have 0.5-1% lower expense ratio than regular plans (significant over long term).
- KYC is mandatory — if not completed, guide user to do Aadhaar-based e-KYC on Kuvera (takes 5 minutes).
- Kuvera's goal planner is excellent — automatically adjusts equity/debt ratio based on time horizon.
- ELSS funds: best for tax saving under 80C — invest before March 31 for current FY deduction.
- Minimum SIP can be as low as ₹100 on some funds — great for beginners.
- Exit load: typically 1% if redeemed within 1 year for equity funds (varies by fund).
- Kuvera supports family accounts — can invest for spouse, parents, children under one login.
- Use `confirm_action` for order review, `collect_payment` for execution. WAIT for user response.
