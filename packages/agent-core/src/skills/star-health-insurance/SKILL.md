---
name: star-health-insurance
description: Buy Star Health insurance — family floater, individual, senior citizen, and accident care health plans.
triggers:
  - star health
  - star health insurance
  - family floater insurance
  - star health family plan
  - star health individual plan
  - senior citizen health insurance
  - buy star health policy
  - star health premium
  - best health insurance india
siteUrl: https://www.starhealth.in
requiresAuth: true
params:
  - name: planType
    required: true
    hint: Type of plan ("family floater", "individual", "senior citizen", "accident care", "diabetes safe")
  - name: familyMembers
    required: false
    hint: Who to cover (e.g. "self + spouse + 2 kids", "parents aged 55 and 58", "self only")
  - name: sumInsured
    required: false
    hint: Preferred sum insured (e.g. "5 lakh", "10 lakh", "25 lakh", "1 crore")
---

# Star Health Insurance Purchase

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine plan type: family floater, individual, senior citizen, accident care, or specialized (diabetes safe, cardiac care).
- Collect family details: who to cover (self, spouse, children, parents), ages of each member.
- Ask for preferred sum insured range (₹5L minimum recommended, ₹10L+ for families).
- Ask about pre-existing conditions: diabetes, hypertension, thyroid, cardiac history.
- Ask for city/pincode (affects premium and network hospitals).
- Use `ask_user` for any missing information.

### 2. Open Star Health & Verify Login
- Open a NEW tab and navigate to `https://www.starhealth.in`.
- Take snapshot. Verify logged in (check for profile section or "My Account" in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Get Premium Quote
- Navigate to the appropriate plan category.
- Fill in the quote form:
  - Family floater: primary insured age, spouse age, children ages, pincode, sum insured.
  - Individual: age, gender, pincode, sum insured, pre-existing conditions.
  - Senior citizen: age (60+), spouse age if applicable, pincode, sum insured.
- Select policy tenure (1 year / 2 year / 3 year — multi-year gets discount).
- Submit form and take snapshot.
- Wait for premium calculation.

### 4. Compare Plans
- Take snapshot of available plan options.
- Extract key details for each plan:
  - Plan name (Star Comprehensive, Star Family Health Optima, Star Health Premier, Young Star, Star Senior Citizens Red Carpet).
  - Sum insured options, annual premium, co-pay percentage.
  - Room rent limit (single AC private room or no cap).
  - Network hospitals count, pre-existing disease waiting period.
  - Unique features: automatic recharge, no-claim bonus, free health check-up.
- Present comparison using `ask_user` (input_type "choice"):
  "Star Comprehensive — ₹10L cover — ₹12,500/yr — No room rent cap — 2yr PED waiting"
- Recommend best plan based on family needs.

### 5. Customize Plan
- Click on selected plan. Take snapshot of plan details and customization options.
- Show optional add-ons and riders:
  - Maternity cover (if applicable — waiting period 12-48 months).
  - Outpatient cover for consultations and diagnostics.
  - Critical illness rider for lump sum payout.
  - Personal accident cover.
  - Wellness and preventive health benefits.
- Use `ask_user` for rider and add-on preferences.
- Show updated premium with selections.

### 6. Review & Confirm
- Use `confirm_action` with full policy summary:
  - Plan name and type (family floater/individual/senior)
  - Members covered with ages
  - Sum insured and automatic recharge details
  - Annual premium amount
  - Co-pay percentage (if any)
  - Room rent limit and network hospital count
  - Pre-existing disease waiting period
  - No-claim bonus structure
  - Policy tenure and start date
  - Nominee name and relationship
- Do NOT proceed unless user confirms.

### 7. Payment & Purchase
- Fill in proposer and insured member details: full name, DOB, gender, height, weight, address, PAN.
- Fill health declaration form: pre-existing conditions, surgeries, hospitalizations in past 4 years.
- Nominee details: name, DOB, relationship.
- Use `collect_payment`:
  - summary: JSON with plan_name, members_covered, sum_insured, premium, riders, tenure
  - amount_inr: annual/multi-year premium
  - description: "Star Health insurance purchase"
- WAIT for payment confirmation.

### 8. Confirm Policy
- Complete payment. Handle OTP via `ask_user` if bank OTP is needed.
- Take snapshot of policy confirmation page.
- Report: policy number, plan name, members covered, sum insured, premium paid, policy period, nominee.
- Remind: "Policy document will be emailed. Download Star Health app for cashless at 14,000+ network hospitals."
- "Health card will be sent within 7 working days. Use policy number for cashless till then."
- "Free annual health check-up included after 1 claim-free year."

## Site Notes

- Star Health is India's largest standalone health insurer — specializes exclusively in health insurance.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Session may expire after 7-14 days — if login wall appears, ask user to re-login manually in Chrome Debug.
- Star Family Health Optima is their best-selling family floater — automatic recharge of sum insured, no room rent cap on higher variants.
- Star Comprehensive is their premium plan — covers everything including outpatient, dental, and infertility.
- Pre-existing disease waiting period: 48 months for most plans (reduced to 12-24 months on Comprehensive).
- Senior citizen plans accept ages up to 75 for new policies — unique in the market.
- No-claim bonus: sum insured increases by 25% per claim-free year (up to 100% increase) — very generous.
- Star Health has 14,000+ network hospitals — largest in standalone health insurance.
- Payment via net banking, credit/debit card, UPI; EMI available on select credit cards.
- Medical test may be required for senior citizens or high sum insured — Star arranges at home for free.
- Use `confirm_action` for plan review, `collect_payment` for purchase. WAIT for user response at each step.
