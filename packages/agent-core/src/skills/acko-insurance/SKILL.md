---
name: acko-insurance
description: Buy car or bike insurance on Acko — instant quote, zero paperwork, digital policy, best price guarantee.
triggers:
  - acko
  - acko insurance
  - car insurance acko
  - bike insurance acko
  - two wheeler insurance
  - vehicle insurance
  - motor insurance
  - renew car insurance
  - renew bike insurance
  - acko car insurance
  - cheap car insurance
  - instant car insurance
siteUrl: https://www.acko.com
requiresAuth: true
params:
  - name: vehicle_type
    required: true
    hint: Vehicle type (e.g. "car", "bike", "scooter")
  - name: registration_number
    required: false
    hint: Vehicle registration number (e.g. "DL01AB1234", "KA05MN6789")
  - name: brand_model
    required: false
    hint: Vehicle brand and model (e.g. "Maruti Swift VXI", "Honda Activa 6G", "Hyundai Creta SX")
  - name: year
    required: false
    hint: Manufacturing/registration year (e.g. "2020", "2022")
  - name: policy_type
    required: false
    hint: Policy type (e.g. "comprehensive", "third-party only", "own damage only")
---

# Acko Car/Bike Insurance Purchase

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine vehicle type: car, bike, or scooter.
- Get registration number (Acko can auto-fetch vehicle details from RTO database).
- If no registration number: get brand, model, variant, fuel type, and year.
- Determine policy type needed:
  - **Comprehensive**: covers own damage + third-party liability (recommended)
  - **Third-party only**: mandatory minimum, covers only damage to others
  - **Own damage only**: covers only your vehicle (for those with valid TP policy)
- Ask about previous policy: insurer name, expiry date, any claims in past year, NCB (No Claim Bonus) percentage.
- Use `ask_user` for missing details. Registration number is the fastest path.

### 2. Open Acko in a NEW Tab
- Open a NEW tab and navigate to `https://www.acko.com`.
- Take snapshot. Navigate to car insurance or bike insurance section.
- Verify logged in (profile icon or email visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Enter Vehicle Details & Get Quote
- Enter registration number (Acko auto-populates make, model, variant, RTO).
- If manual entry: select brand → model → variant → fuel type → registration year → RTO.
- Enter previous policy details:
  - Previous insurer
  - Policy expiry date
  - Claims made in last year (yes/no)
  - NCB percentage (0%, 20%, 25%, 35%, 45%, 50%)
- Submit for instant quote.
- Take snapshot of quote page.
- Wait for quote to load (usually instant on Acko).

### 4. Review Quote & Customize
- Extract quote details:
  - IDV (Insured Declared Value) — the maximum claim amount
  - Base premium (own damage + third party)
  - GST (18%)
  - Total premium
  - NCB discount applied
- Take snapshot and present base quote to user.
- Show available add-ons (Acko's key add-ons):
  - **Zero Depreciation**: full claim without depreciation deduction (highly recommended)
  - **Engine Protect**: covers engine damage from water ingress, oil leakage
  - **Roadside Assistance (RSA)**: 24/7 towing, battery jumpstart, flat tyre
  - **Consumables Cover**: covers oil, coolant, nuts/bolts during claim
  - **Return to Invoice**: get full invoice value in total loss/theft
  - **NCB Protect**: retain NCB even after making a claim
  - **Key Replacement**: covers lost/stolen key replacement
  - **Tyre Protect**: covers tyre damage
- Use `ask_user` (input_type "choice") for add-on selection:
  - "Zero Depreciation — +₹XXX/yr — Recommended"
  - "Engine Protect — +₹XXX/yr"
  - "RSA — +₹XXX/yr"
  - (Let user select multiple)
- Adjust IDV if user wants higher/lower coverage.
- Recalculate total premium with selected add-ons.

### 5. Compare Plans (if Acko shows options)
- Acko may show multiple plan tiers (e.g. Silver, Gold, Platinum bundles).
- If available, extract each plan: included add-ons, price, savings vs individual add-ons.
- Present via `ask_user` (input_type "choice"):
  - "[Plan Name] — ₹XXX/yr — Includes: [add-on list] — Save ₹XXX vs buying separately"
- Recommend plan based on user's vehicle age and usage.

### 6. Review & Confirm Policy
- Use `confirm_action` to present final policy summary:
  - Vehicle: registration number, brand, model, variant, year
  - Policy type: comprehensive / TP only / OD only
  - IDV (Insured Declared Value)
  - Add-ons selected with individual costs
  - NCB discount percentage and amount
  - Premium breakdown: base OD + TP + add-ons + GST = total
  - Policy period: start date to end date (1 year)
  - Key exclusions and deductibles
  - Cashless garages network size
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 7. Payment
- Fill in personal details: name, email, phone, address, nominee.
- Use `collect_payment`:
  - summary: JSON with vehicle, policy type, IDV, add-ons, premium breakdown, total
  - amount_inr: total premium amount
  - description: "Acko vehicle insurance purchase"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 8. Policy Confirmation
- Complete payment. Handle OTP via `ask_user` if needed.
- Take snapshot of policy confirmation page.
- Report: policy number, vehicle details, coverage type, IDV, add-ons, premium paid, policy validity dates, nominee.
- Mention: "Digital policy delivered instantly to email and Acko app. No physical copy needed."
- Remind: "Download Acko app for instant claims. Cashless at 11,000+ garages across India."
- For car: "Keep digital copy accessible for traffic police checks."
- For bike: "Carry policy soft copy on phone — traffic challans are ₹2,000 for no insurance."

## Site Notes

- Acko is a digital-first insurance company — zero paperwork, instant policy, best online prices.
- Chrome Profile 3 (rsinghtomar3011@gmail.com) must be logged in. Do NOT ask user for credentials.
- If session expired, login transparently via OTP. OTP goes to operator phone.
- Acko is a direct insurer (not aggregator) — no middleman, no commission markup.
- Claim process: app-based, upload photos, get approval in minutes. 97%+ claim settlement ratio.
- Zero depreciation is the most important add-on — without it, claim payout reduces by 20-50% on parts.
- NCB saves up to 50% on OD premium — always preserve NCB by asking about claim history.
- Third-party insurance is legally mandatory — minimum ₹2,094/yr for cars, ₹538/yr for bikes.
- Comprehensive is strongly recommended — own damage cover protects against theft, accidents, natural disasters.
- Acko's cashless garage network: 11,000+ across India — no upfront payment during repairs.
- Renewal: Acko can renew other insurers' policies too — just enter previous policy details.
- Use `confirm_action` for policy review, `collect_payment` for purchase. WAIT for user response at each step.
