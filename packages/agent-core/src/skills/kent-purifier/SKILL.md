---
name: kent-purifier
description: Book Kent water purifier service — AMC, filter change, membrane replacement, repair, installation.
triggers:
  - kent service
  - kent purifier service
  - kent ro service
  - kent filter change
  - kent water purifier repair
  - kent amc
  - book kent service
  - kent purifier installation
  - kent membrane change
siteUrl: https://www.kent.co.in/customer-services
requiresAuth: true
params:
  - name: service_type
    required: true
    hint: What service (e.g. "filter change", "AMC renewal", "repair", "installation", "membrane replacement", "annual service")
  - name: model
    required: false
    hint: Kent purifier model (e.g. "Kent Grand Plus", "Kent Pearl", "Kent Supreme Lite", "Kent Ace")
  - name: location
    required: false
    hint: City or pincode (e.g. "Delhi", "560001")
---

# Kent Water Purifier Service

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What product to search for
2. **budget** (type: "slider", collapsed): Budget range, min 100, max 50000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Gather Requirements
- Confirm the Kent purifier model and service needed. Kent services include:
  - **Filter Change**: sediment filter, carbon filter, UF membrane replacement
  - **RO Membrane Replacement**: when TDS reduction drops or water flow is very slow
  - **UV Lamp Replacement**: for UV purification models
  - **Annual Service / Preventive Maintenance**: full servicing, cleaning, filter check
  - **AMC (Annual Maintenance Contract)**: covers periodic servicing + parts at discounted rates
  - **Repair**: leaking, no power, motor noise, low water pressure, error indicators
  - **Installation**: new purifier setup, plumbing connection, tank setup
- Use `ask_user` to clarify: model name, purchase date, last service date, current issue.
- Ask if user has an existing AMC (affects pricing).
- Note: Kent recommends filter change every 6-12 months depending on water quality.
- Get user's pincode or city for technician assignment.

### 2. Open Kent Support in a NEW Tab
- Open a NEW tab and navigate to `https://www.kent.co.in/customer-services`.
- Take snapshot. Dismiss any popups or chat widgets.
- Verify logged in (account visible or "My Account" link accessible).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Register Service Request
- Navigate to "Book Service" or "Service Request" section.
- Select product: Water Purifier (RO/UV/UF).
- Enter model name/number and serial number (use `ask_user` if user needs help finding these).
- Select service type: Installation / Repair / Filter Change / AMC / Annual Service.
- Describe the issue or service needed in detail.
- Enter pincode to check service availability.
- Take snapshot of service form.

### 4. Choose Service Plan or Parts
- If filter/membrane change: show available filter kits and pricing.
  - Extract: filter kit name, compatible models, price, includes what parts.
  - Use `ask_user` (input_type "choice"): "Filter Kit -- Rs.XXX -- Includes: [filter list] -- For: [model]"
- If AMC: show available AMC plans.
  - Extract: plan name, duration, services included, parts covered, price.
  - Use `ask_user` (input_type "choice"): "AMC Plan -- Rs.XXX/year -- Includes: X services + [parts covered]"
- If repair: note issue for technician, estimate may be given after diagnosis.
- Schedule technician visit: select date and preferred time slot.
- Take snapshot of scheduling page.

### 5. Review & Confirm
- Take snapshot of service summary.
- Use `confirm_action` to present:
  - Purifier: model name, serial number
  - Service Type: filter change / AMC / repair / installation
  - Parts/Plan: selected kit or plan details
  - Scheduled Date & Time: technician visit slot
  - Address: service location
  - Cost: filter/AMC price + visiting charge (if applicable)
  - Warranty Status: in-warranty / out-of-warranty / AMC active
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Payment
- Use `collect_payment`:
  - summary: JSON with purifier_model, service_type, parts_or_plan, date, total_cost
  - amount_inr: total amount
  - description: "Kent water purifier service"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.
- Note: for repairs, advance visiting charge may be collected; full cost after diagnosis.

### 7. Service Confirmation
- Complete booking. Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: service request number, purifier model, service type, parts/plan, scheduled date and time, address, amount paid, technician details (if shown).
- Mention: "Kent technician will visit on the scheduled date. Keep purifier accessible and powered on. Helpline: 1860-233-5999."

## Site Notes

- Kent is India's leading water purifier brand with service coverage in 1500+ cities.
- Chrome Profile 3 (rsinghtomar3011@gmail.com) must be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Kent warranty: 1 year on purifier + 1 year on RO membrane (for most models).
- Filter kits: Rs 1500-3000 depending on model. RO membrane alone: Rs 1200-2000.
- AMC plans: Rs 2000-4000/year, includes 3-4 visits + filters at reduced cost.
- Kent visiting charge (without AMC): Rs 200-400 for out-of-warranty units.
- Kent uses only genuine spares. Beware: third-party filters void warranty. Clarify genuine parts to user.
- Water quality varies by area: high TDS areas need more frequent filter changes (every 6 months).
- Installation for new purifier is free within warranty period. Wall mounting included.
- Serial number is on the back panel sticker. Model name is on the front. Help user locate via `ask_user`.
- Use `confirm_action` for service review, `collect_payment` for payment. WAIT for user response at each step.
