---
name: incometax-refund
description: Check ITR refund status on incometax.gov.in — login, view filing status, track refund, check processing.
triggers:
  - income tax refund
  - itr refund status
  - check refund status
  - income tax refund status
  - itr status
  - tax refund
  - incometax refund check
  - when will i get my refund
  - refund status check
  - itr processing status
siteUrl: https://www.incometax.gov.in
requiresAuth: true
params:
  - name: pan
    required: false
    hint: PAN card number (e.g. "ABCDE1234F")
  - name: assessment_year
    required: false
    hint: Assessment year to check (e.g. "2025-26", "2024-25")
  - name: action
    required: false
    hint: Action — "check refund status" (default), "view ITR filing status", "download ITR-V"
---

# Income Tax Refund Status Check

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm user wants to check ITR refund or filing status.
- Ask for assessment year (AY) if not specified. Default: latest AY (e.g. AY 2025-26 for FY 2024-25).
- Ask what they need: refund status, ITR processing status, or download ITR-V acknowledgment.
- Use `ask_user` for any missing details.

### 2. Open Income Tax Portal & Verify Login
- Open a NEW tab and navigate to `https://www.incometax.gov.in/iec/foportal/`.
- Take snapshot. Check if logged in (dashboard with PAN/name visible).
- If NOT logged in, click "Login" and login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Handle Login Flow
- Enter PAN number in the User ID field.
- Enter password (from saved credentials in Chrome profile).
- Handle OTP/2FA — use `ask_user`: "Enter the OTP sent to your registered mobile/email for Income Tax portal login."
- Take snapshot after successful login to dashboard.

### 4. Check ITR Filing Status
- Navigate to: e-File → Income Tax Returns → View Filed Returns.
- Wait for the returns list to load.
- Take snapshot of filed returns page.
- Extract for each filed ITR:
  - Assessment Year
  - ITR form type (ITR-1, ITR-2, etc.)
  - Filing date
  - e-Verification status (Verified/Pending)
  - Processing status (Processed/Under Processing)
  - Refund status and amount (if applicable)
  - CPC order date (if processed)

### 5. Check Refund Status
- Click on the relevant AY's ITR to see detailed status.
- Take snapshot of refund tracking page.
- Extract refund details:
  - Refund amount (as per ITR filed)
  - Refund amount (as per CPC processing — may differ)
  - Refund status: Issued / Adjusted / Pending / Failed
  - If issued: date of issue, mode (direct bank credit / cheque), bank account
  - If failed: reason (bank account mismatch, KYC pending, etc.)
- Report to user via `ask_user` with clear summary.

### 6. Present Detailed Summary
- Present complete tax filing summary via `ask_user`:
  "AY 2025-26: ITR-1 filed on [date]"
  "Status: Processed by CPC on [date]"
  "Refund: ₹XX,XXX — Issued to [bank] on [date]"
  OR "Refund: ₹XX,XXX — Pending processing"
  OR "Refund: ₹XX,XXX — Failed (reason)"
- If CPC adjusted the refund amount, explain: "CPC reduced refund from ₹X to ₹Y due to [reason]."

### 7. Review & Confirm
- Use `confirm_action` to confirm user has reviewed their ITR status:
  - Filing status for requested AY
  - Refund amount and status
  - Any action required (e-verify pending, bank account update, respond to notice)
  - Estimated timeline for pending refund
- Ask if user wants to: download ITR-V, view intimation order (143(1)), or update bank account.

### 8. Complete & Confirm
- If user wants to download ITR-V or 143(1) order, navigate and download.
- Take final snapshot.
- Report: complete ITR status summary, refund details, any pending actions, estimated refund credit date.

## Site Notes

- Income Tax e-Filing portal (incometax.gov.in) is the official Government of India tax portal managed by CPC Bengaluru.
- ITR refund typically takes 20-45 days after e-verification. If delayed beyond 120 days, follow up.
- Chrome profile rsinghtomar3011@gmail.com may have saved Income Tax portal credentials. Do NOT ask user for credentials.
- e-Verification is MANDATORY within 30 days of filing — without it, ITR is treated as not filed.
- CPC (Centralized Processing Centre) may adjust refund amount based on their computation — Section 143(1) intimation.
- Refund failure common reasons: wrong bank account, bank account not pre-validated, name mismatch with PAN.
- To fix failed refund: update and pre-validate bank account on the portal, then request refund re-issue.
- Income Tax portal can be slow — especially during July-December (peak filing season).
- AY (Assessment Year) is one year ahead of FY (Financial Year): Income earned in FY 2024-25 → AY 2025-26.
- Old and New tax regime: check which regime was chosen while filing — affects tax computation.
- Use `confirm_action` for review. No payment needed — this is a free government service.
