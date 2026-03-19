---
name: hdfc-loan
description: Apply for HDFC Bank loan — personal loan, home loan, car loan, two-wheeler loan, gold loan, education loan.
triggers:
  - hdfc bank loan
  - hdfc personal loan
  - hdfc home loan
  - hdfc car loan
  - apply loan hdfc
  - hdfc bank personal loan
  - hdfc education loan
  - hdfc loan application
  - hdfc pre-approved loan
siteUrl: https://www.hdfcbank.com
requiresAuth: true
params:
  - name: loanType
    required: true
    hint: Type of loan ("personal", "home", "car", "two-wheeler", "gold", "education", "loan against property")
  - name: amount
    required: false
    hint: Desired loan amount (e.g. "3 lakh", "50 lakh", "1 crore")
  - name: tenure
    required: false
    hint: Preferred repayment tenure (e.g. "12 months", "5 years", "20 years")
---

# HDFC Bank Loan Application

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine loan type: personal, home, car, two-wheeler, gold, education, or loan against property.
- For personal loan: amount needed, purpose, monthly income, employment type, employer name, years of experience.
- For home loan: property type (flat/house/plot), location, builder name, property cost, down payment budget, income.
- For car loan: new or used car, make/model, on-road price, down payment, dealer location.
- For two-wheeler loan: make/model, on-road price, down payment.
- For education loan: institution name, course, country, course fee, co-applicant details, collateral availability.
- For gold loan: approximate gold weight and purity, amount needed.
- Ask CIBIL score if known (750+ preferred).
- Use `ask_user` for any missing information.

### 2. Open HDFC Bank & Verify Login
- Open a NEW tab and navigate to `https://www.hdfcbank.com`.
- Take snapshot. Verify logged in (check for net banking login, user name, or "Welcome" message).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Check for pre-approved offers (HDFC Bank shows these prominently for existing customers).

### 3. Check Pre-Approved Offers
- Navigate to "Offers" or "Pre-Approved Loans" section in the dashboard.
- If logged into net banking, check for personalized offers:
  - Pre-approved personal loan amount, rate, tenure.
  - Pre-approved home loan or car loan offers.
- Take snapshot of any available offers.
- Present pre-approved offers first — these have instant approval and best rates.
- If no pre-approved offers, proceed to regular application flow.

### 4. Fill Loan Application
- Navigate to the relevant loan product page.
- Click "Apply Now" and fill the application:
  - Personal: full name, DOB, PAN, mobile, email, current and permanent address, years at current address.
  - Employment: salaried/self-employed, company name, designation, total experience, monthly/annual income.
  - Financial: existing EMIs, credit card limits, bank account details.
  - Loan specifics:
    - Personal: amount, tenure, purpose.
    - Home: property details, agreement value, down payment, co-applicant income.
    - Car: vehicle details, on-road price, loan amount, tenure.
    - Education: course details, institution, fee structure, co-applicant.
- Use `ask_user` for any required details not yet known.
- Take snapshot after form completion.

### 5. Review Loan Offer
- Submit application. Wait for processing (30 seconds to 2 minutes).
- Take snapshot of loan eligibility and offer details.
- Present offer options via `ask_user` (input_type "choice"):
  - Personal: "₹10L — 36 months — ₹33,214/mo — 10.5% p.a."
  - Home: "₹60L — 20 years — ₹57,853/mo — 8.45% floating"
  - Car: "₹8L — 5 years — ₹16,377/mo — 8.75% p.a."
- Show total interest and total outgo for each tenure option.
- Mention if rate is fixed or floating (home loans are typically floating).

### 6. Review & Confirm
- Use `confirm_action` with comprehensive summary:
  - Loan type, amount sanctioned, interest rate (fixed/floating)
  - EMI amount, tenure, first EMI date
  - Processing fee (usually 0.5-2% of loan amount)
  - Other charges: documentation, legal/valuation (home), insurance (if bundled)
  - Total interest payable over tenure
  - Total amount payable
  - Prepayment/part-payment terms (home loan: nil for floating rate per RBI)
  - Required documents for disbursement
  - Co-applicant details (if applicable)
- Do NOT proceed unless user confirms.

### 7. Payment (Processing Fee)
- If upfront processing fee is required:
  - Use `collect_payment`:
    - summary: JSON with loan_type, amount, rate, tenure, emi, processing_fee, charges
    - amount_inr: processing fee amount
    - description: "HDFC Bank loan processing fee"
  - WAIT for payment confirmation.
- If processing fee is deducted from disbursement, inform user and skip this step.

### 8. Complete & Confirm
- Complete e-KYC and document verification.
- Handle OTP via `ask_user` (Aadhaar OTP for e-KYC, bank OTP for payment).
- For home loan: schedule property valuation and legal verification (HDFC Bank arranges).
- Sign loan agreement digitally or note branch visit requirement.
- Take snapshot of loan approval/sanction page.
- Report: loan reference number, sanctioned amount, interest rate, EMI, tenure, disbursement timeline.
- Remind: "Loan will be credited to your HDFC Bank account within 24-48 hours (personal/car)."
- "Home loan disbursement happens post property verification — 7-15 working days."
- "Set up auto-debit mandate for EMI — missing EMI impacts CIBIL score significantly."
- "HDFC Bank has part-payment facility — use it to reduce interest burden."

## Site Notes

- HDFC Bank is India's largest private bank — most trusted lender with competitive rates.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Session may expire after 5-10 minutes — HDFC net banking has strict session timeout. If expired, ask user to re-login.
- Personal loan: ₹50K to ₹40L, 10.5-24% p.a., no collateral, 12-60 months tenure.
- Home loan: up to ₹10Cr, 8.35-9.5% floating, up to 30 years, 75-90% LTV.
- HDFC Bank existing customers get preferential rates — 0.5-1% lower than new customers.
- Pre-approved offers are common for salary account holders — always check first.
- Car loan for used cars has higher rates (11-14% p.a.) vs new cars (8.5-9.5% p.a.).
- Education loan up to ₹7.5L without collateral; above ₹7.5L requires property collateral.
- Processing fee: personal loan ₹999-₹2,500, home loan 0.5% (min ₹3,000), car loan 0.5%.
- HDFC Bank net banking portal can be complex — navigate carefully, multiple sections for different products.
- Use `confirm_action` for loan offer review, `collect_payment` for processing fee. WAIT for user response at each step.
