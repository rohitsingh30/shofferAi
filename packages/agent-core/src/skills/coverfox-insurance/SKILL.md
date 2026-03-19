---
name: coverfox-insurance
description: Compare and buy insurance on Coverfox — car, bike, health, term life, travel insurance at best prices.
triggers:
  - coverfox
  - coverfox insurance
  - compare insurance coverfox
  - cheapest insurance
  - best insurance price
  - insurance comparison
  - coverfox car insurance
  - coverfox health insurance
  - compare health plans
  - insurance broker online
siteUrl: https://www.coverfox.com
requiresAuth: true
params:
  - name: insuranceType
    required: true
    hint: Type of insurance ("car", "bike", "health", "term life", "travel", "home")
  - name: details
    required: false
    hint: Vehicle number (for motor), age/family (for health), destination/dates (for travel)
  - name: budget
    required: false
    hint: Premium budget preference (e.g. "under 10000", "cheapest", "best value")
---

# Coverfox Insurance Comparison & Purchase

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine insurance type: car, bike, health, term life, travel, or home.
- For car/bike: registration number, make, model, year, previous insurer, NCB, claim history.
- For health: ages of all members to cover, family configuration, city, pre-existing diseases, budget.
- For term life: age, gender, annual income, smoking status, desired cover amount, policy term.
- For travel: destination, dates, traveller count and ages, purpose (leisure/business/study).
- Ask for budget/premium preference: cheapest, best value, comprehensive.
- Use `ask_user` to collect any missing details.

### 2. Open Coverfox & Verify Login
- Open a NEW tab and navigate to `https://www.coverfox.com`.
- Take snapshot. Verify logged in (check for profile icon or user name in top header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Note: Coverfox allows quote browsing without login, but login is needed for purchase.

### 3. Get Multi-Insurer Quotes
- Navigate to the relevant insurance section.
- Fill in quote form with all details:
  - Car/Bike: registration number, vehicle details, previous policy info, NCB.
  - Health: member details, ages, pincode, sum insured preference.
  - Term life: age, income, smoking status, cover amount, term.
  - Travel: destination, dates, travellers.
- Submit and take snapshot.
- Wait for multiple insurer quotes to load (15-30 seconds — Coverfox fetches from 20+ insurers).

### 4. Compare Plans Across Insurers
- Take snapshot of the comparison table.
- Coverfox shows quotes from all major insurers side by side. Extract top 5-7 quotes:
  - Car/Bike: insurer name, IDV, premium, add-ons, claim ratio, cashless garages, Coverfox rating.
  - Health: insurer, plan name, sum insured, premium, co-pay, room rent, network hospitals, waiting period, Coverfox rating.
  - Term life: insurer, cover amount, premium (monthly/annual), claim ratio, riders available, Coverfox rating.
  - Travel: insurer, coverage, premium, medical cover, trip cancellation, Coverfox rating.
- Present top options via `ask_user` (input_type "choice"):
  "HDFC ERGO — ₹10L — ₹9,500/yr — 97% claim ratio — ★4.5 Coverfox rating"
  "ICICI Lombard — ₹10L — ₹8,800/yr — 97.5% claim ratio — ★4.3 rating"
  "Star Health — ₹10L — ₹11,200/yr — 96% claim ratio — ★4.6 rating"
- Highlight cheapest, best rated, and best claim ratio options.

### 5. Customize Selected Plan
- Click on the selected insurer's plan. Take snapshot of plan detail page.
- Show customization options specific to the insurer:
  - Car/Bike: zero dep, roadside assistance, engine protect, NCB protect, consumables.
  - Health: riders (critical illness, personal accident, maternity), sub-limit options, OPD cover.
  - Term life: riders (accidental death, critical illness, premium waiver), payout options (lump sum/monthly).
  - Travel: add-ons (adventure sports, gadget cover, cruise, visa refusal).
- Use `ask_user` for add-on selections.
- Show final premium after customization.

### 6. Review & Confirm
- Use `confirm_action` with complete comparison summary:
  - Selected insurer and plan name
  - Coverage details (IDV/sum insured/cover amount)
  - Selected add-ons and riders
  - Final premium and payment frequency
  - Coverfox rating and claim settlement ratio
  - Key terms: deductible, co-pay, waiting period
  - Policy tenure and start date
  - Nominee details
  - How this compares to other quotes (savings vs average)
- Do NOT proceed unless user confirms.

### 7. Payment & Purchase
- Fill in personal and policy details as required by the selected insurer.
- For motor: vehicle details, previous policy, inspection (if needed).
- For health/term: health declaration, medical history, nominee.
- Use `collect_payment`:
  - summary: JSON with insurer, plan_name, type, coverage, premium, add_ons, tenure, coverfox_discount
  - amount_inr: final premium amount
  - description: "Coverfox insurance purchase"
- WAIT for payment confirmation.

### 8. Confirm Policy
- Complete payment. Handle OTP via `ask_user` if required.
- Take snapshot of policy confirmation.
- Report: policy number, insurer, plan name, coverage, premium paid, policy period, nominee.
- Remind: "Policy document will be emailed by the insurer. Also available in your Coverfox dashboard."
- "Coverfox provides free claim assistance — contact them during claims for help."
- "Set renewal reminder — Coverfox will also send email/SMS 30 days before expiry."

## Site Notes

- Coverfox is an IRDA-licensed insurance broker — compares 20+ insurers to find the best price.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Session may expire after 7-14 days — if login wall appears, ask user to re-login manually in Chrome Debug.
- Coverfox often has exclusive discounts not available on insurer's direct website.
- Premiums shown are identical or lower than insurer's own website — Coverfox earns commission from insurers.
- Free claim assistance is a major benefit — Coverfox assigns a claim manager to help with documentation and follow-up.
- Coverfox rating system (1-5 stars) is based on claim ratio, customer reviews, and plan features — very useful for comparison.
- Policy is issued by the insurer directly — Coverfox is only the intermediary/broker.
- Coverfox may call user after quote generation for follow-up — inform user about potential calls.
- Payment goes to Coverfox who remits to insurer — payment receipt from Coverfox is valid proof.
- Use `confirm_action` for plan review, `collect_payment` for purchase. WAIT for user response at each step.
