---
name: moneyview-loan
description: Get instant personal loan on MoneyView — quick approval, minimal documents, disbursal in minutes.
triggers:
  - moneyview loan
  - moneyview personal loan
  - money view loan
  - instant personal loan
  - quick loan online
  - moneyview app loan
  - fast loan approval
  - instant loan disbursal
  - moneyview apply
siteUrl: https://www.moneyview.in
requiresAuth: true
params:
  - name: amount
    required: true
    hint: Desired loan amount (e.g. "50000", "1 lakh", "5 lakh")
  - name: purpose
    required: false
    hint: Loan purpose (e.g. "medical", "travel", "wedding", "education", "home renovation", "debt consolidation")
  - name: tenure
    required: false
    hint: Preferred tenure (e.g. "6 months", "12 months", "24 months", "36 months", "60 months")
---

# MoneyView Instant Personal Loan

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm loan amount needed (MoneyView offers ₹10,000 to ₹10,00,000).
- Ask for loan purpose: medical emergency, travel, wedding, education, home renovation, debt consolidation, shopping.
- Ask for preferred repayment tenure (6 to 60 months).
- Collect basic details: monthly income, employment type (salaried/self-employed), employer name.
- Ask about existing loans/EMIs — affects eligibility.
- MoneyView needs minimal documents — PAN + bank statement or salary slips + Aadhaar.
- Use `ask_user` to collect any missing information.

### 2. Open MoneyView & Verify Login
- Open a NEW tab and navigate to `https://www.moneyview.in/personal-loan`.
- Take snapshot. Verify logged in (check for profile/dashboard access or logged-in state).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- MoneyView may redirect to app download — stay on the web version.

### 3. Check Eligibility
- Click on "Check Eligibility" or "Apply Now".
- Fill in basic details:
  - Mobile number (if not auto-filled from login).
  - PAN number — MoneyView does instant CIBIL check.
  - Employment type: salaried or self-employed.
  - Monthly income (net take-home for salaried, monthly revenue for self-employed).
  - Employer name and work email (for salaried).
  - Current city and pincode.
- Submit and wait for eligibility check (usually 30-60 seconds).
- Take snapshot of eligibility result.

### 4. Review Loan Offers
- MoneyView shows personalized loan offers based on credit profile.
- Take snapshot of available offers.
- Extract offer details: eligible amount, interest rate, tenure options, EMI, processing fee.
- Present options via `ask_user` (input_type "choice"):
  "₹3L — 12 months — ₹27,500/mo — 16% p.a. — Processing ₹3,540"
  "₹3L — 24 months — ₹14,800/mo — 17% p.a. — Processing ₹3,540"
  "₹3L — 36 months — ₹10,600/mo — 18% p.a. — Processing ₹3,540"
- Show total interest payable for each option.
- Note: MoneyView partners with multiple NBFCs — actual lender name may vary (Aditya Birla Finance, Fullerton, etc.).

### 5. Complete KYC & Documentation
- After user selects offer, proceed to KYC step.
- Upload or verify documents:
  - PAN card (usually auto-verified via NSDL).
  - Aadhaar for e-KYC (OTP based — handle via `ask_user`).
  - Bank statement: MoneyView may ask for net banking login or PDF upload for last 3-6 months.
  - Salary slips (for salaried) — last 3 months.
- Use `ask_user` for any OTP or document clarification.
- Take snapshot after KYC completion.

### 6. Review & Confirm
- Use `confirm_action` with full loan details:
  - Loan amount and purpose
  - Interest rate (reducing balance) and APR
  - EMI amount and number of installments
  - Processing fee and GST
  - Total interest payable
  - Total amount payable (principal + interest + fees)
  - Disbursement timeline (usually within 24 hours, often same day)
  - Lending partner/NBFC name
  - Prepayment/foreclosure charges
  - EMI debit date and bank account for disbursement
- Do NOT proceed unless user confirms.

### 7. Payment (Processing Fee)
- Processing fee is typically deducted from the loan disbursement amount.
- If upfront payment is required:
  - Use `collect_payment`:
    - summary: JSON with amount, rate, tenure, emi, processing_fee, lender
    - amount_inr: processing fee amount
    - description: "MoneyView personal loan processing fee"
  - WAIT for payment confirmation.
- If fee is deducted from disbursement, inform user: "Processing fee of ₹XXX will be deducted from loan amount."

### 8. Sign Agreement & Confirm
- Complete e-sign of loan agreement via Aadhaar OTP.
- Handle OTP via `ask_user`.
- Set up ECS/e-NACH mandate for EMI auto-debit.
- Take snapshot of loan approval confirmation.
- Report: loan reference ID, sanctioned amount, net disbursement (after fee deduction), interest rate, EMI, first EMI date, lender name.
- Remind: "Loan amount will be credited to your bank account within 2-24 hours."
- "EMI will auto-debit on the specified date — ensure sufficient balance."
- "Prepayment is allowed after 3 EMIs — partial prepayment reduces tenure."
- "Track loan status and repayment in MoneyView app."

## Site Notes

- MoneyView is a fintech lending platform — not a bank. It partners with RBI-registered NBFCs for disbursement.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Session may expire after 10-15 minutes — if login wall or app redirect appears, ask user to re-login in Chrome Debug.
- Personal loan range: ₹10,000 to ₹10,00,000. Interest: 14-36% p.a. depending on credit score.
- CIBIL 750+ gets 14-18% rates; 650-750 gets 18-28%; below 650 may face rejection or very high rates.
- MoneyView's USP is speed — same-day disbursement for most approved applications.
- Processing fee is typically 1-3% of loan amount + 18% GST.
- Actual lender varies: Aditya Birla Finance, Fullerton India, DMI Finance, etc. — loan agreement is with the NBFC, not MoneyView.
- MoneyView may ask for net banking access to fetch bank statements automatically — this is safe and encrypted.
- Foreclosure charges: typically 2-5% of outstanding principal after lock-in period (3-6 months).
- Use `confirm_action` for loan offer review, `collect_payment` for processing fee if applicable. WAIT for user response.
