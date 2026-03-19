---
name: kissht-emi
description: Convert purchases to EMI on KissHT — no-cost EMI, buy now pay later, instant credit line, cardless EMI.
triggers:
  - kissht
  - kissht emi
  - buy now pay later kissht
  - kissht loan
  - no cost emi kissht
  - kissht credit line
  - convert to emi
  - cardless emi
  - kissht pay later
siteUrl: https://www.kissht.com
requiresAuth: true
params:
  - name: purpose
    required: true
    hint: What to buy or convert ("mobile phone", "laptop", "appliance", "shopping", "travel", "medical")
  - name: amount
    required: false
    hint: Purchase amount or credit line needed (e.g. "15000", "50000", "1 lakh")
  - name: tenure
    required: false
    hint: Preferred EMI tenure (e.g. "3 months", "6 months", "9 months", "12 months", "18 months")
---

# KissHT EMI & Buy Now Pay Later

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine the use case: purchase conversion to EMI, buy now pay later, or credit line activation.
- Ask what the user wants to buy/convert: mobile, laptop, appliance, electronics, travel, medical expense.
- Ask for purchase amount or credit limit needed (KissHT offers ₹5,000 to ₹2,00,000).
- Ask for preferred EMI tenure: 3, 6, 9, 12, 15, or 18 months.
- Ask if user wants no-cost EMI (available on select products/merchants) or standard EMI.
- Ask about merchant/store if user is buying from a specific retailer.
- Use `ask_user` to collect any missing details.

### 2. Open KissHT & Verify Login
- Open a NEW tab and navigate to `https://www.kissht.com`.
- Take snapshot. Verify logged in (check for dashboard, credit limit display, or profile section).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- KissHT may redirect to app — stay on web version if possible. If web not available, inform user.

### 3. Check Credit Limit
- Navigate to dashboard or "My Account" section.
- Take snapshot of available credit limit.
- If user already has an active credit line:
  - Show available limit, total limit, used amount.
  - Check if sufficient for the requested purchase.
- If user is new (no credit line yet):
  - Navigate to "Get Credit Line" or "Apply" section.
  - Fill in details: mobile number, PAN, employment type, monthly income.
  - Wait for instant credit assessment (30-60 seconds).
  - Take snapshot of approved credit limit.
- Present credit line details to user.

### 4. Browse EMI Options
- Navigate to "Shop on EMI" or "Partner Merchants" section.
- If buying from a specific merchant:
  - Check if merchant is a KissHT partner (Croma, Reliance Digital, Vijay Sales, etc.).
  - Show available offers: no-cost EMI, cashback, instant discount.
- If converting existing purchase:
  - Navigate to "Convert to EMI" section.
  - Enter purchase amount and select tenure.
- Take snapshot of EMI plan options.
- Present EMI breakdown via `ask_user` (input_type "choice"):
  "₹30,000 — 3 months — ₹10,000/mo — No-cost EMI — Zero interest"
  "₹30,000 — 6 months — ₹5,250/mo — ₹1,500 interest — ₹250/mo extra"
  "₹30,000 — 12 months — ₹2,750/mo — ₹3,000 interest — ₹250/mo extra"
- Clearly highlight no-cost EMI options if available.

### 5. Select Plan & Fill Details
- User selects preferred EMI plan.
- Fill in required details:
  - Personal: full name, email, DOB, PAN (if not already provided).
  - Address: current address, pincode.
  - Bank: account number, IFSC (for auto-debit mandate setup).
  - Purchase details: product description, merchant name, invoice (if converting existing purchase).
- Handle Aadhaar e-KYC if required — OTP via `ask_user`.
- Take snapshot after form completion.

### 6. Review & Confirm
- Use `confirm_action` with complete EMI summary:
  - Product/purchase description
  - Total purchase amount
  - EMI plan: tenure, monthly EMI, interest rate (or "no-cost")
  - Processing/convenience fee (if any)
  - Total interest payable (₹0 for no-cost EMI)
  - Total amount payable over tenure
  - First EMI date and debit method (auto-debit/UPI mandate)
  - Lending partner NBFC name
  - Foreclosure/prepayment terms
  - Late payment charges
- Do NOT proceed unless user confirms.

### 7. Payment (Down Payment / Processing Fee)
- Some EMI plans require a down payment or processing fee upfront.
- If upfront payment required:
  - Use `collect_payment`:
    - summary: JSON with product, amount, tenure, emi, interest, processing_fee, down_payment
    - amount_inr: down payment or processing fee
    - description: "KissHT EMI down payment / processing fee"
  - WAIT for payment confirmation.
- If no upfront payment (full amount converted to EMI), inform user and proceed.

### 8. Activate & Confirm
- Complete e-NACH mandate setup for auto-debit of EMIs.
- Handle OTP via `ask_user` for mandate verification.
- Sign digital agreement via Aadhaar e-sign if required.
- Take snapshot of EMI activation confirmation.
- Report: EMI reference ID, product, total amount, EMI amount, tenure, first EMI date, auto-debit setup status, lending partner.
- Remind: "EMI will auto-debit on the specified date each month — ensure sufficient bank balance."
- "For no-cost EMI: total payable equals product price — no hidden charges."
- "Prepayment allowed after 3 EMIs — check KissHT app for prepayment option."
- "Track all EMIs in KissHT app — download from Play Store/App Store."
- "Late payment attracts ₹500-1000 penalty + impacts CIBIL score."

## Site Notes

- KissHT (Ring/Pay in 3) is a fintech BNPL platform — partners with RBI-registered NBFCs for lending.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Session may expire after 10-15 minutes — if expired or app redirect appears, ask user to re-login in Chrome Debug.
- Credit line range: ₹5,000 to ₹2,00,000 based on credit score and income.
- No-cost EMI is genuinely zero interest — merchant absorbs the cost. Available at select partners only.
- KissHT charges 14-30% p.a. for standard EMI — rate depends on credit profile.
- Processing fee is typically 1-3% of transaction amount + GST.
- KissHT partners with Croma, Reliance Digital, Vijay Sales, Chroma, and 5000+ offline/online merchants.
- CIBIL 700+ recommended for approval — lower scores may get smaller limits or higher rates.
- KissHT web experience is limited compared to app — some features may only work in the app.
- EMI bounce (failed auto-debit) attracts ₹500-1000 penalty and negative CIBIL impact — warn user to maintain balance.
- Use `confirm_action` for EMI plan review, `collect_payment` for down payment/fee. WAIT for user response at each step.
