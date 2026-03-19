---
name: cleartax-itr
description: File income tax return on ClearTax — import Form 16, auto-fill details, claim deductions, file ITR.
triggers:
  - cleartax
  - file itr
  - income tax return
  - file tax return
  - cleartax itr
  - tax filing
  - itr filing
  - file income tax
  - tax return online
siteUrl: https://cleartax.in
requiresAuth: true
params:
  - name: assessmentYear
    required: true
    hint: Assessment year (e.g. "2025-26", "2024-25")
  - name: itrType
    required: false
    hint: ITR form type if known (e.g. "ITR-1", "ITR-2", "ITR-3") — auto-detected if not provided
  - name: hasForm16
    required: false
    hint: Whether user has Form 16 from employer ("yes" or "no")
---

# ClearTax ITR Filing

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Understand Requirements
- Determine: assessment year, source of income (salary/business/capital gains/other), Form 16 availability.
- Ask about income sources to determine correct ITR form:
  - ITR-1 (Sahaj): Salary + 1 house property + other sources (up to ₹50L)
  - ITR-2: Salary + capital gains + multiple house properties
  - ITR-3: Business/profession income
  - ITR-4 (Sugam): Presumptive business income
- Use `ask_user`: "Do you have Form 16 from your employer? What are your income sources?"
- Ask about deductions: Section 80C (PPF, ELSS, LIC), 80D (health insurance), HRA, home loan.

### 2. Open ClearTax & Verify Login
- Open a NEW tab and navigate to `https://cleartax.in/income-tax-return`.
- Take snapshot. Verify logged in (check for user profile or PAN).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Import Income Data
- If Form 16 available:
  - Navigate to "Upload Form 16" section.
  - Use `ask_user` to get Form 16 PDF from user.
  - Upload and let ClearTax auto-parse salary details, TDS, and deductions.
- If no Form 16:
  - Try "Import from Income Tax Portal" — ClearTax can auto-fetch AIS/26AS data.
  - If auto-import fails, manually enter salary details, TDS, and other income.
- Take snapshot after data is populated.
- Verify pre-filled data with user: employer name, gross salary, TDS deducted.

### 4. Fill Deductions & Exemptions
- Review and fill deduction sections:
  - Section 80C: PPF, ELSS, LIC premium, tuition fees, home loan principal (up to ₹1.5L).
  - Section 80D: Health insurance premium (₹25K self, ₹50K parents senior citizen).
  - Section 80CCD(1B): NPS additional ₹50K deduction.
  - HRA exemption: if applicable, enter rent paid, city.
  - Home loan interest: Section 24(b) up to ₹2L for self-occupied.
  - Section 80E: Education loan interest.
- Use `ask_user` for each deduction category: "Do you have any of these deductions?"
- Compare Old vs New tax regime — ClearTax shows both. Recommend the one with lower tax.
- Take snapshot of tax computation.

### 5. Review Tax Computation
- Use `confirm_action`:
  - Gross total income
  - Total deductions claimed
  - Taxable income
  - Tax payable / Refund due
  - Tax regime selected (Old/New)
  - TDS already paid
  - Self-assessment tax due (if any)
  - ITR form type auto-selected
- Show comparison: "Old regime tax: ₹XXX | New regime tax: ₹YYY"
- Do NOT proceed unless user confirms all details are correct.

### 6. Payment (if applicable) & File
- If self-assessment tax is due, user must pay via Challan 280 before filing.
  - Guide user or use `collect_payment`:
    - summary: JSON with income, deductions, tax due, regime, ITR type
    - amount_inr: self-assessment tax amount
    - description: "Self-assessment tax payment for ITR filing"
  - WAIT for payment confirmation.
- If ClearTax charges a filing fee (paid plan for ITR-2/3/4):
  - Use `collect_payment`:
    - summary: JSON with ClearTax plan, ITR type, features
    - amount_inr: ClearTax filing fee
    - description: "ClearTax ITR filing fee"
  - WAIT for payment confirmation.
- If refund due, no tax payment needed — proceed to file.

### 7. File & Confirm
- Submit ITR on ClearTax. Handle Aadhaar OTP e-verification via `ask_user`.
- Take snapshot of filing confirmation.
- Report:
  - ITR acknowledgement number
  - Assessment year
  - ITR form type
  - Total income declared
  - Tax paid / Refund expected
  - E-verification status
- Remind: "Download ITR-V from ClearTax or income tax portal for records."
- If refund: "Refund of ₹XXX will be credited to your bank in 15-45 days."
- Mention: "Keep ITR-V acknowledgement for 6 years as per IT Act."

## Site Notes

- ClearTax is India's leading tax filing platform — trusted by 6M+ taxpayers.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Session may expire after 7 days — if login wall appears, ask user to re-login manually in Chrome Debug.
- ITR-1 filing is FREE on ClearTax. ITR-2/3/4 requires paid plan (₹499-2499).
- PAN-Aadhaar must be linked — mandatory for e-filing. Check on income tax portal if unsure.
- Due date for salaried: July 31st. Late filing: penalty of ₹5000 (₹1000 if income < ₹5L).
- New tax regime is default from AY 2024-25 — user must explicitly opt for old regime.
- Capital gains from stocks/mutual funds need ITR-2 — cannot use ITR-1.
- ClearTax auto-fetches AIS (Annual Information Statement) — verify all transactions listed.
- E-verification via Aadhaar OTP is the easiest method — takes 2 minutes.
- Use `confirm_action` for tax review, `collect_payment` for tax/fees. WAIT for user response.
