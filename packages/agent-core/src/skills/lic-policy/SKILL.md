---
name: lic-policy
description: Buy LIC policy online on licindia.in — term insurance, endowment, ULIP, pension, and money-back plans.
triggers:
  - lic policy
  - lic insurance
  - lic india
  - buy lic plan
  - lic term insurance
  - lic endowment plan
  - lic ulip
  - lic online policy
  - lic pension plan
  - licindia
siteUrl: https://licindia.in
requiresAuth: true
params:
  - name: planType
    required: true
    hint: Type of LIC plan ("term", "endowment", "ulip", "pension", "money-back", "whole-life", "child")
  - name: coverAmount
    required: false
    hint: Desired sum assured (e.g. "50 lakh", "1 crore", "25 lakh")
  - name: tenure
    required: false
    hint: Policy term in years (e.g. "20", "30", "till 60")
---

# LIC Policy Online Purchase

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine plan category: term insurance, endowment, ULIP, pension, money-back, whole-life, or child plan.
- For term: age, sum assured desired, policy term, smoking status, income proof type.
- For endowment: age, sum assured, premium payment term, maturity benefit preference.
- For ULIP: age, investment amount, risk appetite (equity/debt/balanced), investment horizon.
- For pension: age, retirement age target, annuity amount desired, lump sum vs regular.
- For child: child's age, education milestone (graduation/post-grad), sum assured, premium budget.
- Use `ask_user` to collect missing details.

### 2. Open LIC India & Verify Login
- Open a NEW tab and navigate to `https://licindia.in`.
- Take snapshot. Verify logged in (check for "My Account" or user name in the portal).
- If NOT logged in, login transparently using saved credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Note: LIC portal may be slow — wait up to 30 seconds for page load.

### 3. Browse Plans
- Navigate to "Buy Online" or "Products" section.
- Find the relevant plan category (term/endowment/ULIP/pension/money-back).
- Current popular plans:
  - Term: LIC Jeevan Amar (non-participating pure term)
  - Endowment: LIC Jeevan Labh, LIC New Endowment Plan
  - ULIP: LIC Nivesh Plus
  - Pension: LIC Jeevan Akshay, LIC Saral Pension
  - Money-back: LIC Jeevan Tarun, LIC New Money Back Plan
  - Child: LIC Jeevan Tarun, LIC Yuva Term
- Take snapshot of available online plans.

### 4. Get Premium Quote
- Click on the desired plan. Fill in quote calculator:
  - Age, gender, sum assured, policy term, premium payment term.
  - Premium mode: yearly/half-yearly/quarterly/monthly (yearly is cheapest with rebate).
  - Rider options: accidental death benefit, accidental disability, critical illness.
- Take snapshot of premium calculation.
- Present premium details using `ask_user` (input_type "choice") if multiple plan options:
  "Jeevan Amar — ₹1Cr cover — ₹12,000/yr — 30yr term — No maturity benefit"
  "Jeevan Labh — ₹25L cover — ₹45,000/yr — 25yr term — Maturity ₹25L + bonus"

### 5. Fill Proposal Form
- Click "Buy Online" for the selected plan.
- Fill the online proposal form:
  - Personal details: full name (as per PAN), DOB, gender, marital status, occupation.
  - Contact: address, phone, email, Aadhaar number.
  - Financial: annual income, PAN number, existing LIC policies.
  - Health declaration: height, weight, pre-existing conditions, surgeries, hospitalizations.
  - Nominee: name, DOB, relationship, appointee (if nominee is minor).
- Use `ask_user` for any details not already known.
- Take snapshot after form completion.

### 6. Review & Confirm
- Use `confirm_action` with comprehensive summary:
  - Plan name and table number
  - Sum assured and policy term
  - Premium amount and payment frequency (yearly/half-yearly/quarterly/monthly)
  - Riders selected (if any)
  - Maturity benefit (estimated, with bonus projections for endowment/money-back)
  - Death benefit details
  - Premium payment term
  - Nominee name and relationship
  - Total premium outgo over policy term
- Do NOT proceed unless user confirms.

### 7. Payment
- Proceed to payment page.
- Use `collect_payment`:
  - summary: JSON with plan_name, sum_assured, premium, frequency, term, riders, nominee
  - amount_inr: first premium amount
  - description: "LIC policy first premium payment"
- WAIT for payment confirmation.
- Note: LIC accepts net banking, credit/debit card, UPI for online purchases.

### 8. Confirm Policy
- Complete payment. Handle OTP via `ask_user` if bank OTP is required.
- Take snapshot of policy issuance/receipt page.
- Report: policy number, plan name, sum assured, premium amount, policy commencement date, premium due date, nominee.
- Remind: "Save your policy bond — LIC will email it and also dispatch physical copy."
- "Register on LIC portal (licindia.in) to manage policy, pay premiums, and check status."
- "First premium receipt is your proof of insurance until policy bond arrives (15-30 days)."
- "LIC premium qualifies for tax deduction under Section 80C (up to ₹1.5L/year)."

## Site Notes

- LIC (Life Insurance Corporation of India) is the largest life insurer globally by policies — government-owned, 100% trust.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Session may expire after 15-30 minutes of inactivity — LIC portal has aggressive timeouts. If expired, ask user to re-login.
- LIC portal (licindia.in) is notoriously slow — wait patiently for pages to load (up to 30 seconds).
- Not all LIC plans are available online — only select plans can be purchased via the portal.
- Medical examination may be required for sum assured above ₹50L or age above 45 — LIC will arrange.
- LIC bonus rates are declared annually — endowment/money-back plans accrue reversionary bonus over the term.
- Jeevan Amar (term plan) is cheapest at ₹8,000-15,000/yr for ₹1Cr cover for age 25-35.
- Premium payment in March qualifies for current financial year tax benefit — remind user if near year-end.
- ECS/auto-debit mandate is recommended for premium payment — avoids policy lapse due to missed payments.
- Use `confirm_action` for plan review, `collect_payment` for first premium. WAIT for user response at each step.
