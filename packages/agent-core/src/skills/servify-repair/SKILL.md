---
name: servify-repair
description: Get device repair or protection plan on Servify — phone screen repair, extended warranty, damage protection.
triggers:
  - servify
  - servify repair
  - phone screen repair
  - device protection
  - extended warranty servify
  - servify protection plan
  - mobile repair servify
  - screen replacement
  - phone damage protection
siteUrl: https://www.servify.in
requiresAuth: true
params:
  - name: service_type
    required: true
    hint: What service (e.g. "screen repair", "extended warranty", "damage protection plan", "battery replacement")
  - name: device
    required: true
    hint: Device brand and model (e.g. "iPhone 15 Pro", "Samsung Galaxy S24", "OnePlus 12")
  - name: purchase_date
    required: false
    hint: When the device was purchased (e.g. "6 months ago", "January 2025")
---

# Servify Device Repair & Protection

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm what the user needs. Servify offers:
  - **Screen Repair**: cracked screen, display replacement for phones, tablets, laptops
  - **Extended Warranty**: extend manufacturer warranty by 1-2 years
  - **Damage Protection**: accidental damage, liquid damage, theft protection
  - **Battery Replacement**: degraded battery service
  - **General Repair**: speaker, mic, charging port, camera issues
- If vague, use `ask_user` to clarify: device brand, model, issue/service type.
- Get device purchase date and whether it is under warranty.
- Ask if user has an existing Servify plan or is buying new.

### 2. Open Servify in a NEW Tab
- Open a NEW tab and navigate to `https://www.servify.in`.
- Take snapshot. Dismiss any promotional popups or banners.
- Verify logged in (profile icon or user name visible in top-right corner).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Select Device & Service
- Navigate to the appropriate section (Repair / Protect / Plans).
- Search or browse for the user's device brand and model.
- Take snapshot of available services or plans for the device.
- Extract options: plan name, coverage details, price, validity period, what is included/excluded.
- Use `ask_user` (input_type "choice") to present options:
  - "Plan/Service Name -- Rs.XXX -- Coverage: [details] -- Validity: X months/years"
- If repair: show estimated repair cost and turnaround time.
- If protection plan: show coverage amount, deductible, claim process.

### 4. Review Plan or Repair Details
- Click selected plan or repair service.
- Take snapshot of detailed page.
- Extract: full plan name, price, coverage limit, number of claims allowed, deductible per claim, exclusions.
- For repair: extract repair cost, parts included, warranty on repair, pickup/drop details.
- Confirm device details (IMEI/serial may be needed -- use `ask_user` if required).
- Present summary to user and confirm selection.

### 5. Add to Cart & Confirm
- Add selected plan/repair to cart.
- Take snapshot of cart or order summary.
- Apply any promo codes if visible.
- Use `confirm_action` to present order summary:
  - Device: brand, model
  - Service/Plan: name, coverage details
  - Price: amount, any discount applied
  - Validity: start and end date
  - Deductible: per claim (if applicable)
  - Turnaround: estimated time (for repairs)
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Payment
- Proceed to checkout.
- Verify delivery/pickup address. Add new address via `ask_user` if needed.
- Use `collect_payment`:
  - summary: JSON with device, service/plan, coverage, price, validity
  - amount_inr: total amount
  - description: "Servify device repair/protection plan"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Order Confirmation
- Complete payment on Servify. Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order/plan ID, device details, service/plan purchased, coverage period, amount paid, next steps (pickup schedule for repairs, plan activation date for protection).
- Mention: "Your plan is now active. You can manage claims via the Servify app."

## Site Notes

- Servify is India's leading device protection and repair platform. Partners with Apple, Samsung, OnePlus, Xiaomi.
- Chrome Profile 3 (rsinghtomar3011@gmail.com) must be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Device IMEI or serial number may be required for protection plans -- use `ask_user` to collect.
- Screen repair pricing varies significantly by device model -- always confirm price before proceeding.
- Protection plans have a waiting period (usually 30 days) before claims can be filed -- inform user.
- Some plans require device inspection (photo upload) before activation -- guide user through this.
- Servify partners with authorized service centers -- repairs carry manufacturer-grade quality.
- Payment: online only (UPI, card, net banking). EMI options available on some plans.
- Repair turnaround: 2-5 business days for most issues. Doorstep repair available in select cities.
- Use `confirm_action` for order review, `collect_payment` for checkout. WAIT for user response at each step.
