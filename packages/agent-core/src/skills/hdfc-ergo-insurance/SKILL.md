---
name: hdfc-ergo-insurance
description: Buy HDFC ERGO insurance — car, health, travel, two-wheeler, home, and cyber insurance plans.
triggers:
  - hdfc ergo
  - hdfc ergo insurance
  - car insurance hdfc
  - health insurance hdfc ergo
  - travel insurance hdfc
  - two wheeler insurance hdfc
  - hdfc ergo motor insurance
  - hdfc ergo health plan
  - buy hdfc ergo policy
siteUrl: https://www.hdfcergo.com
requiresAuth: true
params:
  - name: insuranceType
    required: true
    hint: Type of insurance ("car", "two-wheeler", "health", "travel", "home", "cyber")
  - name: details
    required: false
    hint: Vehicle registration number (for motor), age/family (for health), travel dates/destination (for travel)
---

# HDFC ERGO Insurance Purchase

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine insurance type: car, two-wheeler, health, travel, home, or cyber.
- For car/two-wheeler: registration number, make, model, year, previous insurer, NCB percentage.
- For health: age of proposer, family members to cover (self/spouse/children/parents), city, pre-existing conditions.
- For travel: destination country, travel dates, number of travellers, trip purpose (leisure/business).
- For home: property address, type (owned/rented), building value, contents value.
- Use `ask_user` to collect any missing details specific to the insurance type.

### 2. Open HDFC ERGO & Verify Login
- Open a NEW tab and navigate to `https://www.hdfcergo.com`.
- Take snapshot. Verify logged in (check for profile/account icon or name in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Get Quotes
- Navigate to the correct insurance section based on type.
- Fill in required details on the quote form:
  - Car/Two-wheeler: registration number, make, model, variant, fuel type, year, previous policy details, NCB.
  - Health: age, family configuration, pincode, sum insured preference.
  - Travel: destination, dates, traveller details, trip type.
- Submit the form. Take snapshot.
- Wait for quotes to load (may take 10-20 seconds).

### 4. Compare Plans
- Take snapshot of available plans/options.
- Extract plan details:
  - Car/Two-wheeler: plan name, IDV, premium, add-ons included, cashless garages, claim settlement ratio.
  - Health: plan name (Optima Secure/Optima Restore/My Health Suraksha), sum insured, premium, co-pay, room rent limit, network hospitals, waiting period.
  - Travel: plan name, coverage amount, premium, medical cover, trip cancellation, baggage loss.
- Present comparison using `ask_user` (input_type "choice"):
  "Plan Name — Coverage ₹XX lakh — Premium ₹XXX/yr — Key Feature"
- Highlight best value and recommended plan.

### 5. Customize Plan
- Click selected plan. Take snapshot of plan customization page.
- Show available add-ons and riders:
  - Car/Two-wheeler: zero depreciation, roadside assistance, engine protect, NCB protect, return to invoice, consumables cover.
  - Health: restoration benefit, maternity cover, OPD cover, personal accident, critical illness rider.
  - Travel: adventure sports cover, home burglary, passport loss, trip delay.
- Use `ask_user` for add-on preferences if user wants customization.
- Recalculate premium with selected options.

### 6. Review & Confirm
- Use `confirm_action` with full summary:
  - Insurance type and plan name
  - Coverage details (IDV/sum insured/travel cover amount)
  - Add-ons and riders selected
  - Premium amount (annual/monthly/one-time)
  - Key terms: deductible, co-pay, waiting period, exclusions
  - Policy tenure and start date
  - Nominee details (if applicable)
- Do NOT proceed unless user confirms.

### 7. Payment & Purchase
- Fill in personal details: name, DOB, address, PAN (for health/life), nominee information.
- For car/two-wheeler: previous policy number if renewal, vehicle inspection details if required.
- Use `collect_payment`:
  - summary: JSON with plan_name, type, coverage, premium, add_ons, tenure
  - amount_inr: premium amount
  - description: "HDFC ERGO insurance purchase"
- WAIT for payment confirmation.

### 8. Confirm Policy
- Complete payment. Handle OTP via `ask_user` if needed (bank OTP for net banking/card).
- Take snapshot of policy confirmation page.
- Report: policy number, plan name, coverage amount, premium paid, policy start/end dates, nominee.
- Remind: "Policy document will be emailed to your registered email. Download from HDFC ERGO portal too."
- For car/two-wheeler: "Keep digital copy in DigiLocker for traffic stops."
- For health: "Download health card from HDFC ERGO app for cashless hospitalization at 13,000+ network hospitals."

## Site Notes

- HDFC ERGO is India's third-largest private general insurer — part of HDFC Group, highly trusted.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Session may expire after 7-15 days — if login wall appears, ask user to re-login manually in Chrome Debug.
- HDFC ERGO Optima Secure is their flagship health plan — ₹10L-₹1Cr sum insured, no room rent cap, restoration benefit.
- Car insurance: Comprehensive plan covers own damage + third-party; standalone third-party is cheapest but minimal.
- Claim settlement ratio is ~97% — among the best in general insurance.
- Zero depreciation add-on is critical for cars less than 5 years old — covers full parts cost without depreciation deduction.
- Travel insurance is mandatory for Schengen visa — HDFC ERGO plans are embassy-accepted.
- Premium payment can be done via net banking, credit/debit card, UPI — all major banks supported.
- Use `confirm_action` for plan review, `collect_payment` for purchase. WAIT for user response at each step.
