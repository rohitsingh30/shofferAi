---
name: bajaj-finserv-loan
description: Apply for a loan on Bajaj Finserv — personal loan, home loan, business loan, loan against property, gold loan.
triggers:
  - bajaj finserv loan
  - bajaj finserv personal loan
  - bajaj finserv home loan
  - bajaj finance loan
  - bajaj finserv business loan
  - apply loan bajaj
  - bajaj finserv emi
  - bajaj loan application
  - bajaj finserv pre-approved loan
siteUrl: https://www.bajajfinserv.in
requiresAuth: true
params:
  - name: loanType
    required: true
    hint: Type of loan ("personal", "home", "business", "loan against property", "gold", "doctor", "CA")
  - name: amount
    required: false
    hint: Desired loan amount (e.g. "5 lakh", "20 lakh", "50 lakh")
  - name: tenure
    required: false
    hint: Preferred repayment tenure (e.g. "12 months", "3 years", "20 years")
---

# Bajaj Finserv Loan Application

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine loan type: personal, home, business, loan against property (LAP), gold, or professional (doctor/CA).
- For personal loan: desired amount, purpose, monthly income, employer name, employment type (salaried/self-employed).
- For home loan: property location, property type (ready/under-construction), estimated cost, down payment available, income.
- For business loan: business type, vintage, annual turnover, desired amount, purpose (expansion/working capital/equipment).
- For LAP: property type, location, estimated market value, loan amount needed, income.
- For gold loan: approximate gold weight, purity, desired amount.
- Ask for CIBIL score if known (750+ preferred for best rates).
- Use `ask_user` to collect missing information.

### 2. Open Bajaj Finserv & Verify Login
- Open a NEW tab and navigate to `https://www.bajajfinserv.in`.
- Take snapshot. Verify logged in (check for user profile, "My Account", or existing customer dashboard).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Check for pre-approved offers banner — Bajaj Finserv frequently has pre-approved loan offers for existing customers.

### 3. Check Pre-Approved Offers
- Navigate to "Pre-Approved Offers" or "Check Your Offer" section.
- Enter mobile number or PAN to check pre-approved eligibility.
- Take snapshot of any pre-approved offers:
  - Pre-approved amount, interest rate, tenure, EMI, processing fee.
- If pre-approved offer exists and matches user's need, highlight it — these have instant disbursement.
- If no pre-approved offer, proceed to regular application.

### 4. Fill Loan Application
- Navigate to the relevant loan product page and click "Apply Now".
- Fill in the application form:
  - Personal: full name, DOB, PAN, mobile, email, current address, residence type (owned/rented).
  - Employment: type (salaried/self-employed/professional), company name, designation, work experience, monthly income.
  - Loan details: amount requested, preferred tenure, purpose.
  - For home loan: property address, builder name, agreement value, stamp duty, registration cost.
  - For business loan: GST number, business vintage, ITR details, annual turnover.
- Use `ask_user` for any details not already known (PAN, employer, income).
- Take snapshot after form completion.

### 5. Review Loan Offer
- Submit application. Wait for eligibility check (may take 30-60 seconds).
- Take snapshot of loan offer details.
- Present offer to user via `ask_user` (input_type "choice") if multiple tenure options:
  "₹5L — 12 months — ₹44,500/mo EMI — 11.5% p.a. — Processing ₹5,900"
  "₹5L — 24 months — ₹23,500/mo EMI — 12% p.a. — Processing ₹5,900"
  "₹5L — 36 months — ₹16,700/mo EMI — 12.5% p.a. — Processing ₹5,900"
- Show total interest payable and total amount for each option.

### 6. Review & Confirm
- Use `confirm_action` with full loan summary:
  - Loan type and amount sanctioned
  - Interest rate (fixed/floating) and type (reducing balance)
  - EMI amount and tenure
  - Processing fee and other charges (documentation, stamp duty, insurance)
  - Total interest payable over tenure
  - Total amount payable (principal + interest)
  - Disbursement mode (bank transfer) and expected timeline
  - Prepayment/foreclosure charges
  - Required documents for final disbursement
- Do NOT proceed unless user confirms.

### 7. Payment (Processing Fee)
- Processing fee is deducted upfront or from loan amount.
- If upfront payment required, use `collect_payment`:
  - summary: JSON with loan_type, amount, rate, tenure, emi, processing_fee
  - amount_inr: processing fee amount
  - description: "Bajaj Finserv loan processing fee"
- WAIT for payment confirmation.
- If processing fee is deducted from loan disbursement, inform user and skip payment step.

### 8. Complete & Confirm
- Complete e-KYC (Aadhaar OTP verification) — handle OTP via `ask_user`.
- Sign loan agreement digitally (e-sign via Aadhaar OTP).
- Handle any additional OTP via `ask_user`.
- Take snapshot of loan approval/sanction letter.
- Report: loan reference number, sanctioned amount, interest rate, EMI, tenure, first EMI date, disbursement timeline.
- Remind: "Loan amount will be credited to your bank account within 24-72 hours."
- "Set up ECS/auto-debit for EMI — missing EMI affects CIBIL score."
- "Download Bajaj Finserv app to track loan, pay EMI, and access account statement."

## Site Notes

- Bajaj Finserv (Bajaj Finance Ltd) is India's largest NBFC — RBI registered, AAA rated by CRISIL.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Session may expire after 10-15 minutes — Bajaj Finserv has aggressive session timeouts. If expired, ask user to re-login.
- Personal loan: ₹1L to ₹40L, 11-16% p.a., no collateral, instant disbursal for pre-approved.
- Home loan: up to ₹5Cr, 8.5-9.5% p.a., tenure up to 30 years, 80% LTV.
- Pre-approved offers have the best rates and instant disbursement — always check first.
- CIBIL score 750+ gets the best interest rate; below 650 may face rejection.
- Processing fee is typically 1-3% of loan amount (₹999-₹10,000+ depending on loan type and amount).
- Bajaj Finserv Flexi Loan: unique product where you draw only what you need, pay interest only on utilized amount.
- E-KYC via Aadhaar OTP is mandatory for loan disbursement — keep Aadhaar-linked mobile handy.
- Use `confirm_action` for loan offer review, `collect_payment` for processing fee. WAIT for user response at each step.
