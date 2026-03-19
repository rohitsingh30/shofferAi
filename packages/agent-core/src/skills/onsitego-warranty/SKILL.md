---
name: onsitego-warranty
description: Buy extended warranty or damage protection on Onsitego — for phones, laptops, appliances, TVs, wearables.
triggers:
  - onsitego
  - extended warranty
  - onsitego warranty
  - damage protection plan
  - appliance warranty
  - phone warranty
  - laptop warranty
  - buy extended warranty
  - onsitego protection
siteUrl: https://www.onsitego.com
requiresAuth: true
params:
  - name: product_type
    required: true
    hint: Product category (e.g. "mobile phone", "laptop", "washing machine", "TV", "refrigerator")
  - name: brand_model
    required: true
    hint: Brand and model (e.g. "iPhone 15", "Samsung Galaxy S24", "LG 8kg washing machine")
  - name: plan_type
    required: false
    hint: Plan preference (e.g. "extended warranty", "damage protection", "complete protection")
  - name: purchase_price
    required: false
    hint: Original product purchase price (e.g. "45000", "Rs 30000")
---

# Onsitego Extended Warranty & Protection

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm what protection the user needs. Onsitego offers:
  - **Extended Warranty**: extends manufacturer warranty by 1-3 years (covers manufacturing defects)
  - **Damage Protection**: accidental damage, liquid spill, screen crack
  - **Complete Protection**: extended warranty + damage protection combined
  - **AMC (Annual Maintenance Contract)**: for appliances like AC, washing machine
- If vague, use `ask_user` to clarify: product type, brand, model, purchase price, purchase date.
- Ask when the product was purchased (plans must be bought within a window of original purchase).
- Determine if user wants warranty only, damage protection only, or complete coverage.

### 2. Open Onsitego in a NEW Tab
- Open a NEW tab and navigate to `https://www.onsitego.com`.
- Take snapshot. Dismiss any promotional popups or banners.
- Verify logged in (account icon or profile name visible).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Select Product Category
- Use the product category selector or search bar to find the right plan.
- Select product type (mobile, laptop, TV, washing machine, AC, refrigerator, etc.).
- Enter product details: brand, model, purchase price range, purchase date.
- Take snapshot of available plans.
- Extract options: plan name, coverage type, duration (1yr/2yr/3yr), price, what is covered.
- Use `ask_user` (input_type "choice") to present plans:
  - "Plan Name -- Rs.XXX -- Duration: X years -- Covers: [manufacturing defects / accidental damage / both]"

### 4. Review Plan Details
- Click selected plan for full details.
- Take snapshot of plan details page.
- Extract: plan name, price, coverage duration, coverage limit, number of claims, claim process, exclusions.
- Note: deductible amounts per claim, waiting period, documentation required.
- Highlight key benefits: "Covers liquid damage", "No questions asked replacement", "Doorstep service".
- Confirm plan choice with user: "Buy [Plan Name] for [Device] at Rs.XXX for X years?"

### 5. Enter Product Details & Confirm
- Fill in product information: brand, model, serial/IMEI (use `ask_user` to collect if needed).
- Enter purchase date and invoice number if required.
- Take snapshot of order summary.
- Use `confirm_action` to present:
  - Product: brand, model, purchase price
  - Plan: name, coverage type, duration
  - Price: plan cost, any discount or promo applied
  - Coverage start date and end date
  - Claim limit and deductible
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Payment
- Proceed to payment page.
- Use `collect_payment`:
  - summary: JSON with product, plan, coverage, duration, price
  - amount_inr: total amount
  - description: "Onsitego extended warranty/protection plan"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Plan Activation & Confirmation
- Complete payment on Onsitego. Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: plan ID, product details, plan name, coverage period (start-end), amount paid, claim process summary.
- Mention: "Your plan is now active. File claims via onsitego.com or call 9222-20-9222."

## Site Notes

- Onsitego is India's #1 extended warranty and device protection brand. Partners with Amazon, Flipkart, Croma.
- Chrome Profile 3 (rsinghtomar3011@gmail.com) must be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Plans must be purchased within 9-12 months of product purchase (varies by category) -- check eligibility.
- Extended warranty covers only manufacturing defects. Damage protection covers accidental damage. Complete protection covers both.
- Some plans require invoice upload during purchase -- use `ask_user` to get invoice photo/details.
- Onsitego plans are non-transferable and linked to the specific device serial/IMEI.
- Claim process: raise claim on website/app, get approval, doorstep repair or service center visit.
- Payment: online only (UPI, card, net banking, wallets). No COD for protection plans.
- Plans for phones are priced based on device purchase price slab (e.g. Rs 10K-20K, Rs 20K-40K).
- Use `confirm_action` for order review, `collect_payment` for payment. WAIT for user response at each step.
