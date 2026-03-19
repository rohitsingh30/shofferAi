---
name: digit-insurance
description: Buy car or bike insurance on Digit Insurance — get quick quote, compare plans, buy policy online.
triggers:
  - digit insurance
  - car insurance
  - bike insurance
  - motor insurance
  - vehicle insurance digit
  - godigit insurance
  - two wheeler insurance
  - four wheeler insurance
  - renew car insurance
  - digit car insurance
siteUrl: https://www.godigit.com
requiresAuth: false
params:
  - name: vehicle_type
    required: true
    hint: Type of vehicle — "car" or "bike" (two-wheeler)
  - name: vehicle_number
    required: false
    hint: Vehicle registration number (e.g. "MH12AB1234")
  - name: policy_type
    required: false
    hint: Policy type — "comprehensive", "third-party only", or "own damage only"
---

# Digit Insurance — Car & Bike Insurance

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine vehicle type: car or bike (two-wheeler).
- Get vehicle registration number for renewal, or vehicle details for new policy.
- Ask for policy type preference: comprehensive (full cover), third-party only (mandatory minimum), own damage only.
- Ask if this is new insurance or renewal of existing policy.
- Use `ask_user` for any missing details.

### 2. Open Digit Insurance & Verify Login
- Open a NEW tab and navigate to:
  - Car: `https://www.godigit.com/motor-insurance/car-insurance`
  - Bike: `https://www.godigit.com/motor-insurance/two-wheeler-insurance`
- Take snapshot. Check if logged in or if fresh quote flow.
- If login needed, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Get Quick Quote
- Enter vehicle registration number (for renewal/existing vehicle).
- OR enter vehicle details manually: make, model, variant, year, RTO city.
- If entering manually, use `ask_user` for: make (e.g. Maruti, Hyundai), model (e.g. Swift, i20), variant, year of purchase.
- Wait for quote to generate.
- Take snapshot of quote page.

### 4. Compare Plans & Add-ons
- Show available plans: comprehensive, third-party, own damage.
- Extract: base premium, GST, total premium, IDV (Insured Declared Value), key coverages.
- Present add-on options via `ask_user` (input_type "choice"):
  "Zero depreciation — ₹XXX extra — Full claim without depreciation deduction"
  "Engine protection — ₹XXX extra — Covers engine damage from waterlogging"
  "Roadside assistance — ₹XXX extra — 24/7 towing and on-road help"
  "Return to invoice — ₹XXX extra — Full invoice value on total loss"
  "No add-ons — Base plan only"
- Take snapshot after plan and add-ons selected.

### 5. Fill Proposal Details
- Fill in personal details: name, DOB, phone, email, address, nominee.
- Fill vehicle details: engine number, chassis number (ask user if not auto-filled).
- Use `ask_user` for any missing info: previous policy number, previous insurer, NCB (No Claim Bonus) percentage.
- Take snapshot after form is filled.

### 6. Review & Confirm
- Use `confirm_action` with policy summary:
  - Vehicle: make, model, year, registration number
  - Policy type: comprehensive/TP/OD
  - IDV (Insured Declared Value)
  - Add-ons selected
  - NCB discount applied
  - Base premium + GST
  - Total premium to pay
  - Policy period (1 year)
- Do NOT proceed unless user confirms.

### 7. Payment
- Use `collect_payment`:
  - summary: JSON with vehicle, policy_type, idv, addons, ncb, total_premium
  - amount_inr: total premium amount
  - description: "Digit Insurance motor policy"
- WAIT for payment confirmation.

### 8. Complete & Confirm
- Complete payment (UPI/card/netbanking).
- Handle OTP via `ask_user` if needed.
- Take snapshot of policy confirmation page.
- Report: policy number, vehicle covered, policy type, IDV, premium paid, start date, expiry date, download link for policy PDF.

## Site Notes

- Digit Insurance (GoDigit) is an IRDAI-registered insurer known for simple, fast claims.
- Third-party insurance is legally mandatory for all vehicles in India — comprehensive is recommended.
- IDV (Insured Declared Value) is the max payout on total loss — higher IDV = higher premium.
- NCB (No Claim Bonus) gives discount for claim-free years: 20%, 25%, 35%, 45%, 50% for 1-5 years.
- Chrome profile rsinghtomar3011@gmail.com may have pre-filled details on Digit. Do NOT ask user for credentials.
- Zero depreciation add-on is highly recommended for cars under 5 years — full claim without deduction.
- Engine protection is critical in flood-prone cities (Mumbai, Chennai, Kolkata).
- Policy starts immediately after payment — digital copy available for download instantly.
- Digit claims are 100% paperless — settled via app/website.
- GST on insurance premium is 18% — this is included in the final quote.
- Use `confirm_action` for review, `collect_payment` for premium payment. WAIT for user response.
