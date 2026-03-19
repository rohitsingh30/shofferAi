---
name: icici-lombard-insurance
description: Buy ICICI Lombard insurance — motor, health, corporate, travel, and home insurance plans.
triggers:
  - icici lombard
  - icici lombard insurance
  - icici motor insurance
  - icici health insurance
  - icici lombard car insurance
  - icici lombard health plan
  - buy icici lombard policy
  - icici travel insurance
  - icici lombard corporate insurance
siteUrl: https://www.icicilombard.com
requiresAuth: true
params:
  - name: insuranceType
    required: true
    hint: Type of insurance ("car", "two-wheeler", "health", "travel", "home", "corporate")
  - name: details
    required: false
    hint: Vehicle number (for motor), age/family (for health), travel dates (for travel), company name (for corporate)
---

# ICICI Lombard Insurance Purchase

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine insurance type: car, two-wheeler, health, travel, home, or corporate.
- For car/two-wheeler: registration number, make, model, year, previous insurer, NCB, fuel type.
- For health: age, family members to cover, city, pre-existing diseases, preferred sum insured.
- For travel: destination, travel dates, number of travellers, purpose (leisure/business/student).
- For corporate: company name, number of employees, type of cover (group health/fire/liability).
- Use `ask_user` to collect any missing details.

### 2. Open ICICI Lombard & Verify Login
- Open a NEW tab and navigate to `https://www.icicilombard.com`.
- Take snapshot. Verify logged in (check for user profile icon or name in top-right).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Get Quotes
- Navigate to the relevant insurance product page.
- Fill in the quote form with all required details:
  - Car/Two-wheeler: registration number, make, model, variant, manufacture year, previous policy, NCB.
  - Health: age, family configuration (self/spouse/kids/parents), pincode, sum insured range.
  - Travel: destination country, travel dates, passport details, traveller ages.
- Submit form and take snapshot.
- Wait for quotes to generate (10-30 seconds).

### 4. Compare Plans
- Take snapshot of all available plan options.
- Extract key details for top plans:
  - Car/Two-wheeler: plan tier, IDV, premium, add-ons included, cashless garage count, claim ratio.
  - Health: plan name (iHealth/Complete Health Insurance), sum insured, premium, co-pay, sub-limits, network hospitals, waiting periods.
  - Travel: plan name, coverage, premium, medical emergency cover, trip cancellation, baggage delay.
- Present comparison using `ask_user` (input_type "choice"):
  "Plan — Coverage ₹XX lakh — Premium ₹XXX/yr — Key Benefit"
- Recommend the best plan based on coverage-to-premium ratio.

### 5. Customize Plan
- Click on the selected plan. Take snapshot of customization page.
- Show available add-ons and riders:
  - Car/Two-wheeler: zero depreciation, roadside assistance, engine protect, NCB protect, consumables, return to invoice, key replacement.
  - Health: maternity cover, OPD cover, critical illness rider, personal accident, wellness benefits, unlimited restoration.
  - Travel: adventure sports, visa refusal, financial emergency, study interruption (for students).
- Use `ask_user` for user preferences on add-ons.
- Show updated premium after customization.

### 6. Review & Confirm
- Use `confirm_action` with complete summary:
  - Insurance type and plan name
  - Coverage details (IDV/sum insured/travel cover)
  - Selected add-ons and riders
  - Total premium (annual/monthly/one-time)
  - Key terms: deductible, co-pay, waiting period, exclusions
  - Policy tenure and proposed start date
  - Nominee name and relationship
- Do NOT proceed unless user confirms.

### 7. Payment & Purchase
- Fill in proposer details: full name, DOB, gender, address, PAN (if required), nominee information.
- For motor: engine number, chassis number if new policy (not renewal).
- Use `collect_payment`:
  - summary: JSON with plan_name, type, coverage, premium, add_ons, tenure
  - amount_inr: total premium amount
  - description: "ICICI Lombard insurance purchase"
- WAIT for payment confirmation.

### 8. Confirm Policy
- Complete payment flow. Handle OTP via `ask_user` if bank OTP required.
- Take snapshot of policy issuance confirmation.
- Report: policy number, plan name, sum insured/IDV, premium paid, policy period, nominee details.
- Remind: "Policy document will be sent to registered email. Also available in ICICI Lombard IL TakeCare app."
- For motor: "Keep soft copy in DigiLocker. Carry for traffic police checks."
- For health: "Download IL TakeCare app for cashless at 9,000+ network hospitals."

## Site Notes

- ICICI Lombard is India's largest private sector general insurer by GDPI — part of ICICI Group.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Session may expire after 7-14 days — if login wall appears, ask user to re-login manually in Chrome Debug.
- IL TakeCare app provides instant claim settlement for health — recommend downloading.
- Motor insurance: ICICI Lombard offers instant policy issuance with real-time verification.
- Claim settlement ratio is ~97.5% — consistently among the top general insurers.
- Complete Health Insurance plan offers unlimited sum insured restoration — excellent for families.
- ICICI Lombard iHealth is their digital-first health plan — lower premium, no paperwork.
- Corporate plans need company details and employee count — may require callback from relationship manager.
- Payment via net banking, credit/debit card, UPI, or EMI options available on select cards.
- Use `confirm_action` for plan review, `collect_payment` for purchase. WAIT for user response at each step.
