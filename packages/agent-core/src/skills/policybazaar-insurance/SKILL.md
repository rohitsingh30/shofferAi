---
name: policybazaar-insurance
description: Buy car, bike, health, or term life insurance on PolicyBazaar — compare plans, get quotes, purchase.
triggers:
  - policybazaar
  - buy insurance
  - car insurance
  - bike insurance
  - health insurance
  - term insurance
  - compare insurance
  - policybazaar insurance
  - insurance policy
siteUrl: https://www.policybazaar.com
requiresAuth: true
params:
  - name: insuranceType
    required: true
    hint: Type of insurance ("car", "bike", "health", "term life")
  - name: details
    required: false
    hint: Vehicle number (for car/bike), age/family members (for health), or annual income (for term)
---

# PolicyBazaar Insurance Purchase

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Understand Requirements
- Determine: insurance type (car/bike/health/term life).
- For car/bike: vehicle registration number, make, model, year, previous insurer, NCB (No Claim Bonus).
- For health: age, family members to cover, city, pre-existing conditions.
- For term life: age, annual income, smoking status, coverage amount desired.
- Use `ask_user` to collect missing details specific to insurance type.

### 2. Open PolicyBazaar & Verify Login
- Open a NEW tab and navigate to `https://www.policybazaar.com`.
- Take snapshot. Verify logged in (check for profile/account section).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Get Quotes
- Navigate to the correct insurance section (car/bike/health/term).
- Fill in required details:
  - Car/Bike: registration number, make, model, variant, year, previous policy details, NCB.
  - Health: age, family members (self/spouse/children/parents), pincode.
  - Term: age, gender, smoking status, annual income, coverage amount.
- Submit form. Take snapshot.
- Wait for quotes to load (may take 10-30 seconds).

### 4. Compare Plans
- Take snapshot of available plans.
- Extract top 5 plans with key details:
  - Car/Bike: insurer, IDV, premium, add-ons, cashless garages, claim settlement ratio.
  - Health: insurer, sum insured, premium, co-pay, room rent limit, network hospitals, waiting periods.
  - Term: insurer, coverage, premium (monthly/annual), claim settlement ratio, riders.
- Present comparison using `ask_user` (input_type "choice"):
  "Insurer — Coverage ₹XX lakh — Premium ₹XXX/yr — Claim Ratio XX% — [key feature]"
- Highlight best value and highest rated options.

### 5. Customize Plan
- Click selected plan. Take snapshot of plan details.
- Show customization options:
  - Car/Bike: add-ons (roadside assistance, zero depreciation, engine protect, NCB protect).
  - Health: room rent upgrade, maternity cover, OPD cover, critical illness rider.
  - Term: accidental death rider, critical illness rider, premium waiver, return of premium.
- Use `ask_user` for add-on/rider preferences if user wants customization.
- Recalculate premium with selected options.

### 6. Review & Confirm
- Use `confirm_action`:
  - Insurance type and insurer name
  - Coverage details (IDV/sum insured/life cover)
  - Add-ons/riders selected
  - Premium amount (annual/monthly)
  - Key terms: deductible, co-pay, waiting period, exclusions
  - Policy tenure
  - Nominee details (if applicable)
- Do NOT proceed unless user confirms.

### 7. Payment & Purchase
- Fill in personal details: name, DOB, address, PAN (for term/health), nominee.
- For car/bike: previous policy number if renewal.
- Use `collect_payment`:
  - summary: JSON with insurer, type, coverage, premium, add-ons, tenure
  - amount_inr: premium amount
  - description: "PolicyBazaar insurance purchase"
- WAIT for payment confirmation.

### 8. Confirm Policy
- Complete payment. Handle OTP via `ask_user` if needed.
- Take snapshot of policy confirmation.
- Report: policy number, insurer, coverage, premium paid, policy start/end dates, nominee.
- Remind: "Download policy document from PolicyBazaar dashboard or email."
- For car/bike: "Keep digital copy in DigiLocker or phone for traffic stops."
- For health: "Carry health card for cashless hospitalization."

## Site Notes

- PolicyBazaar is India's largest insurance aggregator — compares 50+ insurers.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Session may expire after 7-15 days — if login wall appears, ask user to re-login manually in Chrome Debug.
- PolicyBazaar earns commission — premiums shown are same as insurer's direct website.
- Car insurance: Third-party is mandatory (₹2000-3000/yr), comprehensive covers own damage too.
- Health insurance: Family floater is cheaper than individual for families; suggest ₹5L+ sum insured.
- Term insurance: Pure protection, no maturity benefit — cheapest at young age. ₹1Cr cover at ₹500-800/month for 25-30 year olds.
- Claim settlement ratio above 95% is good — highlight this when comparing.
- Pre-existing disease waiting period: typically 2-4 years for health insurance.
- PolicyBazaar may call the user after quote generation — inform user about this.
- Use `confirm_action` for plan review, `collect_payment` for purchase. WAIT for user response.
