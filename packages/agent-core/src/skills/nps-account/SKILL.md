---
name: nps-account
description: Open or contribute to NPS (National Pension System) account on npscra.nsdl.co.in — register, invest, check balance.
triggers:
  - nps account
  - national pension system
  - nps contribution
  - open nps account
  - nps investment
  - nps balance
  - contribute to nps
  - nps tier 1
  - nps tier 2
  - pension fund nps
siteUrl: https://enps.nsdl.com
requiresAuth: true
params:
  - name: action
    required: true
    hint: Action — "open account", "contribute", "check balance", "change allocation"
  - name: tier
    required: false
    hint: NPS tier — "Tier 1" (pension, lock-in) or "Tier 2" (savings, no lock-in)
  - name: amount
    required: false
    hint: Contribution amount (e.g. "₹5000", "₹50000")
  - name: pran
    required: false
    hint: PRAN number (12-digit Permanent Retirement Account Number) if existing subscriber
---

# NPS — National Pension System Account

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine user's goal: open new NPS account, make contribution, check balance, or change fund allocation.
- For new account: ask for Tier 1 (mandatory pension) and/or Tier 2 (voluntary savings).
- For contribution: ask for PRAN number, tier, and amount.
- For balance check: ask for PRAN number.
- Ask about pension fund manager preference: SBI, LIC, UTI, HDFC, ICICI, Kotak, Aditya Birla.
- Use `ask_user` for any missing details.

### 2. Open eNPS Portal & Verify Login
- Open a NEW tab and navigate to `https://enps.nsdl.com/eNPS/NationalPensionSystem.html`.
- Take snapshot. Check if logged in or on landing page.
- If NOT logged in, login with PRAN/credentials transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3A. New Account Registration (if opening account)
- Click "Registration" → "All Citizens of India".
- Fill personal details: name, DOB, PAN, Aadhaar, mobile, email, address.
- Use `ask_user` for: PAN number, Aadhaar number, DOB, nominee details.
- Select Tier 1 (mandatory) and optionally Tier 2.
- Choose pension fund manager via `ask_user` (input_type "choice"):
  "SBI Pension Funds — Largest AUM, conservative"
  "HDFC Pension Management — Good equity returns"
  "ICICI Prudential — Balanced approach"
  "UTI Retirement Solutions — Government backed"
  "Kotak Mahindra Pension Fund — Aggressive equity"
- Choose investment allocation:
  - Active choice: user picks % in Equity (E), Corporate Bonds (C), Government Securities (G), Alternative (A)
  - Auto choice: lifecycle fund based on age (aggressive/moderate/conservative)
- Take snapshot after registration form filled.

### 3B. Make Contribution (if contributing)
- Click "Contribution" on the portal.
- Enter PRAN number and verify identity.
- Select Tier 1 or Tier 2.
- Enter contribution amount.
- Take snapshot after details entered.

### 3C. Check Balance (if checking)
- Login with PRAN.
- Navigate to "Transaction Statement" or "Holding Statement".
- Take snapshot of balance and holdings.

### 4. Present Account/Investment Details
- For new account: show registration summary and investment allocation.
- For contribution: show current balance + proposed contribution.
- For balance check, present via `ask_user`:
  "PRAN: XXXXXXXXXXXX"
  "Tier 1 Balance: ₹X,XX,XXX"
  "Tier 2 Balance: ₹X,XX,XXX (if applicable)"
  "Fund Manager: [name]"
  "Allocation: E-XX% C-XX% G-XX% A-XX%"
  "Last contribution: ₹X,XXX on [date]"
- Take snapshot of holdings breakdown.

### 5. Review & Confirm
- Use `confirm_action` with summary:
  - Action: new registration / contribution / balance check
  - PRAN number (existing or to be generated)
  - Tier 1/Tier 2
  - Fund manager and allocation
  - Contribution amount (if applicable)
  - Tax benefits: Section 80CCD(1) up to ₹1.5L + 80CCD(1B) additional ₹50K
  - Total to pay (for contribution/registration)
- Do NOT proceed unless user confirms.

### 6. Payment (for contribution/registration)
- Use `collect_payment`:
  - summary: JSON with pran, tier, amount, fund_manager, allocation
  - amount_inr: contribution amount or initial deposit
  - description: "NPS contribution/registration"
- WAIT for payment confirmation.
- Minimum initial contribution: ₹500 for Tier 1, ₹1000 for Tier 2.

### 7. Complete & Confirm
- Complete payment via netbanking/UPI/debit card.
- Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- For new account: report PRAN number generated, welcome kit details, first contribution receipt.
- For contribution: report transaction reference, amount credited, updated balance, units allotted.

## Site Notes

- NPS is a government-backed pension scheme regulated by PFRDA — long-term retirement savings with tax benefits.
- Tier 1: mandatory pension account with lock-in till age 60. Partial withdrawal allowed after 3 years for specific purposes.
- Tier 2: voluntary savings account with no lock-in — can withdraw anytime (no tax benefit unless government employee).
- Chrome profile rsinghtomar3011@gmail.com may have existing eNPS login. Do NOT ask user for credentials.
- Tax benefits: 80CCD(1) up to ₹1.5L (within 80C limit) + 80CCD(1B) additional ₹50K exclusive NPS deduction.
- At age 60: minimum 40% must be used to buy annuity (pension), remaining 60% is tax-free lump sum.
- eNPS portal (NSDL) handles online registration and contribution for all citizens — no need to visit POP (Point of Presence).
- Fund allocation: Equity (E) capped at 75% for active choice, reduces with age in auto choice.
- NPS returns are market-linked — not guaranteed. Historical Tier 1 returns: 9-12% CAGR over 10 years.
- Aadhaar and PAN are mandatory for NPS registration — eKYC via Aadhaar OTP is supported.
- Use `confirm_action` for review, `collect_payment` for contribution/registration. WAIT for user response.
