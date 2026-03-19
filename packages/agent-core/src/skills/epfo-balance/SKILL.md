---
name: epfo-balance
description: Check EPF (Employee Provident Fund) balance and passbook on epfindia.gov.in — login, view contributions, download passbook.
triggers:
  - epf balance
  - pf balance
  - check pf
  - epfo passbook
  - provident fund balance
  - epf passbook
  - check epf balance
  - epfo balance check
  - my pf balance
  - uan passbook
siteUrl: https://passbook.epfindia.gov.in
requiresAuth: true
params:
  - name: uan
    required: false
    hint: Universal Account Number (12-digit UAN, e.g. "101234567890")
  - name: action
    required: false
    hint: Action — "check balance" (default), "view passbook", "download statement"
---

# EPFO EPF Balance & Passbook Check

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm user wants to check EPF/PF balance and passbook.
- Ask for UAN (Universal Account Number) if not known — it is a 12-digit number.
- Ask what they need: just balance, full passbook with monthly entries, or downloadable statement.
- Use `ask_user` for UAN if not provided: "Please share your 12-digit UAN number."

### 2. Open EPFO Passbook & Verify Login
- Open a NEW tab and navigate to `https://passbook.epfindia.gov.in/MemberPassBook/Login`.
- Take snapshot. Check if already logged in (passbook/member dashboard visible).
- If NOT logged in, login transparently using UAN. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Handle Login Flow
- Enter UAN number in the UAN field.
- Enter password (from saved credentials in Chrome profile).
- Solve CAPTCHA — take snapshot and read the CAPTCHA text.
- If CAPTCHA is unclear, refresh and retry (max 3 attempts).
- Handle OTP if 2FA is enabled — use `ask_user`: "Enter the OTP sent to your registered mobile for EPFO login."
- Take snapshot after successful login.

### 4. View EPF Balance
- Navigate to the passbook section.
- Select the member ID / establishment if multiple exist.
- Wait for passbook data to load.
- Take snapshot of the passbook showing contributions.
- Extract and report:
  - Total EPF balance (employee + employer share)
  - Employee contribution total
  - Employer contribution total
  - Pension fund (EPS) contribution
  - Last contribution date and amount
  - Interest credited

### 5. Present Passbook Details
- Show recent contributions (last 6-12 months) via `ask_user`:
  "Total EPF Balance: ₹X,XX,XXX"
  "Employee share: ₹X,XX,XXX | Employer share: ₹X,XX,XXX"
  "Last contribution: ₹X,XXX on [date] by [employer]"
  "Interest credited: ₹X,XXX"
- If user has multiple member IDs (changed jobs), show each separately.
- Take snapshot of detailed passbook entries.

### 6. Review & Confirm
- Use `confirm_action` to confirm user has reviewed their EPF details:
  - Total balance across all member IDs
  - Current employer's contributions (up to date or pending)
  - Interest rate applied (current year)
  - Any transfer/withdrawal pending
- Ask if user wants to: download passbook PDF, transfer old PF, or initiate withdrawal.

### 7. Download Statement (if requested)
- Click download/print passbook option.
- Take snapshot of the downloaded/generated statement.
- Report: passbook downloaded successfully, total balance, contribution summary.

### 8. Complete & Confirm
- Take final snapshot of the balance summary.
- Report: total EPF balance, employee + employer breakdown, pension fund balance, last contribution details, any action items (pending transfer, KYC update needed).

## Site Notes

- EPFO (Employees' Provident Fund Organisation) manages retirement savings for salaried employees in India.
- UAN (Universal Account Number) is a 12-digit lifetime number that links all PF accounts across employers.
- EPF contribution: 12% of basic salary from employee + 12% from employer (3.67% EPF + 8.33% EPS pension).
- Chrome profile rsinghtomar3011@gmail.com may have saved EPFO credentials. Do NOT ask user for credentials.
- EPFO website has CAPTCHAs that can be difficult to read — may need multiple attempts.
- EPF interest rate is set annually by government — currently around 8.15% (FY 2023-24).
- EPF balance is tax-free on withdrawal after 5 years of continuous service.
- If user changed jobs, old PF should be transferred to new UAN — check if any transfer is pending.
- EPFO site is often slow during peak hours (1st-10th of month) — be patient with page loads.
- KYC (Aadhaar, PAN, bank linked to UAN) must be verified for online withdrawals/transfers.
- Use `confirm_action` for review. No payment needed for balance check — this is a free government service.
