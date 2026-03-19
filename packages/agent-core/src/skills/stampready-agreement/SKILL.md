---
name: stampready-agreement
description: Create a rent agreement online on StampReady or NoBroker — draft agreement, e-stamp paper, notarization, and doorstep delivery.
triggers:
  - stampready
  - nobroker rent agreement
  - online rent agreement
  - e-stamp rent agreement
  - rental agreement online
  - create rent agreement
  - stampready agreement
  - police verification rent
siteUrl: https://www.nobroker.in/rent-agreement
requiresAuth: true
params:
  - name: city
    required: true
    hint: City where property is located (e.g. "Bangalore", "Mumbai", "Pune", "Chennai")
  - name: landlord_name
    required: false
    hint: Full name of the landlord/owner
  - name: tenant_name
    required: false
    hint: Full name of the tenant
  - name: property_address
    required: false
    hint: Full address of the rental property
  - name: monthly_rent
    required: false
    hint: Monthly rent amount in INR
  - name: lease_duration
    required: false
    hint: Lease duration (e.g. "11 months", "2 years")
---

# StampReady / NoBroker Rent Agreement

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- BEFORE opening the browser, check what the user provided.
- If city not specified, use `ask_user` (input_type "freetext"): "Which city is the rental property in? (e.g. Bangalore, Mumbai, Pune, Chennai, Hyderabad)"
- If landlord name missing, use `ask_user` (input_type "freetext"): "What is the landlord's full name (as per Aadhaar/PAN)?"
- If tenant name missing, use `ask_user` (input_type "freetext"): "What is the tenant's full name (as per Aadhaar/PAN)?"
- If property address missing, use `ask_user` (input_type "freetext"): "What is the full property address? (Include flat number, building, street, area, city, PIN code)"
- If monthly rent not specified, use `ask_user` (input_type "freetext"): "What is the monthly rent amount (in INR)?"
- If lease duration not specified, use `ask_user` (input_type "choice"): "What is the lease duration?" with options "11 months", "1 year", "2 years", "3 years", "Custom".
- Ask about security deposit if not provided: use `ask_user` (input_type "freetext"): "What is the security deposit amount (in INR)?"

### 2. Open NoBroker Rent Agreement in New Tab
- Open a NEW tab and navigate to `https://www.nobroker.in/rent-agreement`.
- Take a snapshot to see the landing page.
- Dismiss any promotional popups, app install banners, cookie consent, or offer modals.
- Verify the rent agreement form or "Create Agreement" CTA is visible.
- If redirected to NoBroker homepage, navigate directly to the rent agreement section.

### 3. Verify Login
- Look for a profile icon, phone number, or "My Account" in the header.
- If signed in: proceed to agreement creation.
- If NOT signed in: Click "Login" or "Sign In", attempt login with rsinghtomar3011@gmail.com.
- If OTP required, use `ask_user`: "NoBroker needs OTP verification. Please share the OTP sent to the registered mobile number."
- **If session expired or wrong account, STOP and tell user: "Session expired, please re-login to NoBroker in Chrome Debug."**
- Take snapshot to confirm logged-in state.

### 4. Select Plan & Services
- Review available plans for rent agreement creation.
- Take snapshot of the plans page.
- Present options via `ask_user` (input_type "choice"):
  - Basic: Agreement draft + e-stamp paper (price)
  - Standard: Draft + e-stamp + notarization (price)
  - Premium: Draft + e-stamp + notarization + doorstep delivery (price)
  - Add-ons: Police verification, society NOC template
- Select the plan chosen by user.
- If user wants police verification added, include it.

### 5. Fill Agreement Details
- Fill the rent agreement form step by step:
  - **Landlord details**: Full name, parent's name, Aadhaar number, PAN, permanent address, phone, email.
  - **Tenant details**: Full name, parent's name, Aadhaar number, PAN, permanent address, phone, email.
  - **Property details**: Full address, property type (apartment/house/commercial), furnishing status, carpet area.
  - **Agreement terms**: Monthly rent, security deposit, lease start date, lease duration, rent escalation clause, maintenance charges.
  - **Clauses**: Lock-in period, notice period, subletting allowed, pet policy, parking.
- Use `ask_user` (input_type "freetext") for each set of missing details (Aadhaar, PAN, parent names).
- Take snapshot after each major section is filled.
- For additional clauses, use `ask_user`: "Any additional clauses to include? (e.g. no pets, no subletting, 2-month notice period, specific maintenance terms)"

### 6. Preview Agreement Draft
- Navigate to the agreement preview page.
- Take snapshot of the full draft document.
- Scroll through the entire agreement and take multiple snapshots if needed.
- Highlight key terms for user review:
  - Rent amount and escalation
  - Security deposit and refund terms
  - Lock-in and notice period
  - Maintenance responsibility
  - Termination clauses
- Use `confirm_action` to present summary:
  - Landlord and tenant names
  - Property address
  - Monthly rent and security deposit
  - Lease duration and start date
  - Stamp duty amount
  - Service fee and delivery charges
  - Total payable
- Do NOT proceed unless user confirms. If user wants changes, go back and edit.

### 7. Payment
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with landlord, tenant, property, rent, deposit, duration, stamp duty, service fee, total
  - amount_inr: total amount including stamp duty (number)
  - description: "NoBroker rent agreement"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.
- Complete payment on NoBroker using available payment method.
- Handle payment OTP via `ask_user` if needed.

### 8. Confirmation & Delivery Tracking
- Take snapshot of the order confirmation page.
- Extract: order number, agreement summary, delivery address, estimated delivery date, tracking link.
- Report full details to user:
  - Order/reference number
  - Agreement between (landlord) and (tenant)
  - Property address
  - Monthly rent and deposit
  - Stamp duty paid
  - Total amount paid
  - Delivery method and estimated date
  - Tracking link (if available)
  - "Keep Aadhaar originals ready — delivery agent may need to verify identity."

## Site Notes

- Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Stamp duty varies by state: Maharashtra ~0.25% of total rent, Karnataka ~1%, others vary — NoBroker auto-calculates.
- Rent agreements over 11 months require mandatory registration in most states — this is a separate process.
- NoBroker needs Aadhaar numbers for both landlord and tenant for e-stamp generation — this is mandatory.
- NoBroker may aggressively promote its property listing services — dismiss these prompts.
- Session can expire — if login page reappears, STOP and inform user.
- NoBroker uses React — always use Playwright fill/type methods.
- Use `confirm_action` for agreement review, `collect_payment` for actual payment. WAIT for user response. Do NOT auto-proceed.
- Doorstep delivery is available in major metros only (Bangalore, Mumbai, Pune, Chennai, Hyderabad, Delhi NCR).
- Police verification is optional but recommended — it takes 7-15 days after agreement is signed.
- E-stamp paper is valid only in the state it is purchased for — cannot be used across states.
- Both parties need to sign the printed agreement — delivery agent collects signatures during doorstep visit.
