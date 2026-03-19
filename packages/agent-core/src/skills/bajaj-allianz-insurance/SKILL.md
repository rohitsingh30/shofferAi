---
name: bajaj-allianz-insurance
description: Buy Bajaj Allianz insurance — motor, health, travel, home, and cyber insurance plans.
triggers:
  - bajaj allianz
  - bajaj allianz insurance
  - bajaj allianz car insurance
  - bajaj allianz health insurance
  - bajaj allianz travel insurance
  - bajaj allianz motor insurance
  - buy bajaj allianz policy
  - bajaj allianz two wheeler insurance
  - bajaj insurance plan
siteUrl: https://www.bajajallianz.com
requiresAuth: true
params:
  - name: insuranceType
    required: true
    hint: Type of insurance ("car", "two-wheeler", "health", "travel", "home", "cyber")
  - name: details
    required: false
    hint: Vehicle registration (for motor), age/family (for health), destination/dates (for travel)
---

# Bajaj Allianz Insurance Purchase

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine insurance type: car, two-wheeler, health, travel, home, or cyber.
- For car/two-wheeler: registration number, make, model, year, variant, fuel type, previous insurer, NCB, RTO location.
- For health: age of all members, family configuration, city, pre-existing diseases, preferred sum insured.
- For travel: destination, travel dates, traveller count and ages, trip purpose, visa requirement.
- For home: property type (flat/house/villa), address, built-up area, building age, contents value.
- For cyber: type of coverage (identity theft, financial fraud, cyber extortion, data breach).
- Use `ask_user` to collect any missing details.

### 2. Open Bajaj Allianz & Verify Login
- Open a NEW tab and navigate to `https://www.bajajallianz.com`.
- Take snapshot. Verify logged in (check for profile/account icon or username in the header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Get Quotes
- Navigate to the relevant insurance product page.
- Fill in quote form with all collected details:
  - Car/Two-wheeler: registration number, vehicle details, previous policy information, NCB claim history.
  - Health: member ages, family type (individual/floater), pincode, sum insured preference.
  - Travel: destination country, start/end dates, traveller details, adventure sports requirement.
- Submit form. Take snapshot.
- Wait for quotes to generate (10-20 seconds).

### 4. Compare Plans
- Take snapshot of available plan tiers.
- Extract details for each option:
  - Car/Two-wheeler: plan type (Silver/Gold/Platinum), IDV, premium, included add-ons, cashless garages.
  - Health: plan name (Health Guard/Health Infinity/Health Ensure), sum insured, premium, co-pay, room rent, network hospitals, waiting period.
  - Travel: plan type (Individual/Family/Student/Senior), coverage amount, medical cover, trip cancellation, premium.
- Present comparison via `ask_user` (input_type "choice"):
  "Health Guard — ₹5L cover — ₹8,000/yr — 10% co-pay — 6,500+ hospitals"
  "Health Infinity — ₹Unlimited cover — ₹15,000/yr — No co-pay — No room rent cap"
- Highlight Bajaj Allianz's unique offerings (e.g., unlimited sum insured on Health Infinity).

### 5. Customize Plan
- Click selected plan. Take snapshot of customization screen.
- Show add-ons and rider options:
  - Car/Two-wheeler: zero dep, roadside assistance, engine protect, NCB protect, personal accident, key protect, tyre protect.
  - Health: hospital cash, personal accident, critical illness, maternity, OPD, wellness program, international treatment.
  - Travel: adventure sports, cruise cover, home country cover, golf cover, study interruption.
- Use `ask_user` for add-on selection preferences.
- Display recalculated premium.

### 6. Review & Confirm
- Use `confirm_action` with detailed summary:
  - Insurance type and plan name/tier
  - Coverage details (IDV/sum insured/travel cover)
  - Add-ons and riders selected
  - Total premium amount and payment frequency
  - Key terms: deductible, co-pay, waiting period, exclusions
  - Policy tenure and start date
  - Nominee details
- Do NOT proceed unless user explicitly confirms.

### 7. Payment & Purchase
- Fill in proposer details: full name, DOB, gender, address, PAN (if applicable), nominee.
- For motor: previous policy details, vehicle inspection if break in insurance.
- Use `collect_payment`:
  - summary: JSON with plan_name, type, coverage, premium, add_ons, tenure
  - amount_inr: total premium amount
  - description: "Bajaj Allianz insurance purchase"
- WAIT for payment confirmation.

### 8. Confirm Policy
- Complete payment. Handle OTP via `ask_user` if bank OTP needed.
- Take snapshot of policy confirmation.
- Report: policy number, plan name, coverage amount, premium paid, policy period, nominee, policy document link.
- Remind: "Policy document will be emailed. Download Bajaj Allianz Caringly Yours app for instant access."
- For motor: "Digital policy available in DigiLocker within 24 hours. Keep for traffic verification."
- For health: "Use Caringly Yours app for cashless at 6,500+ network hospitals and instant claim settlement."

## Site Notes

- Bajaj Allianz is a joint venture between Bajaj Finserv and Allianz SE (Germany) — among India's top 3 private general insurers.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Session may expire after 7-14 days — if login wall appears, ask user to re-login manually in Chrome Debug.
- Health Infinity is their USP — unlimited sum insured with no sub-limits; great for comprehensive coverage.
- Bajaj Allianz has 97%+ claim settlement ratio — excellent track record.
- "Caringly Yours" app allows instant cashless approval in under 30 minutes at network hospitals.
- Motor insurance renewal is instant online — no inspection needed if renewing within 90 days of expiry.
- Cyber insurance (Individual Cyber Safe) covers up to ₹1Cr for online fraud, identity theft, cyber extortion.
- Payment options: net banking, credit/debit card, UPI, wallets, EMI on select cards.
- Bajaj Allianz website is well-designed and fast — one of the smoother insurance purchase experiences.
- Use `confirm_action` for plan review, `collect_payment` for purchase. WAIT for user response at each step.
