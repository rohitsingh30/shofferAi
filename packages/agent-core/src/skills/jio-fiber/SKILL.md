---
name: jio-fiber
description: Subscribe to JioFiber broadband plans — select plan, enter address, schedule installation, pay.
triggers:
  - jio fiber
  - jiofiber
  - jio broadband
  - jio wifi plan
  - jio internet connection
  - jio fiber plan
  - jio home broadband
  - subscribe jiofiber
siteUrl: https://www.jio.com/fiber
requiresAuth: true
params:
  - name: plan
    required: false
    hint: Preferred plan or speed (e.g. "300 Mbps", "unlimited 999 plan")
  - name: address
    required: true
    hint: Installation address with pincode
  - name: phone
    required: false
    hint: Contact phone number for installation
---

# JioFiber Broadband Subscription

Chrome profile: rsinghtomar3011@gmail.com. Operator Jio account logged in.

## Steps

### 1. Gather Requirements
- Check if user specified preferred plan, speed, or budget.
- If not, use `ask_user` (input_type "freetext"): "What speed/budget are you looking for in a broadband plan? (e.g. 100 Mbps, under Rs 1000/month)"
- Get installation address if not provided: use `ask_user` (input_type "freetext"): "What's your installation address with pincode?"

### 2. Open JioFiber Website
- Open a NEW tab and navigate to `https://www.jio.com/fiber`.
- Take a snapshot to verify page loaded.
- Check if logged in to Jio account (profile icon or MyJio section).
- **If NOT logged in or session expired, STOP and tell user: "Jio session expired, please re-login in Chrome Debug."**
- Do NOT ask user for credentials.

### 3. Verify Login & Check Availability
- Take snapshot confirming JioFiber plans page.
- Enter the user's pincode/address to check JioFiber availability.
- Take snapshot of availability result.
- If NOT available, inform user: "JioFiber is not available at your address yet." and STOP.
- If available, proceed to plan selection.

### 4. Browse & Select Plan
- Navigate to plans section.
- Take snapshot of all available plans with speeds, prices, OTT bundles.
- Present top plans to user using `ask_user` (input_type "choice"):
  - Plan name, speed (Mbps), price/month, data limit, included OTT apps
- User selects preferred plan.
- Click on the selected plan.
- Take snapshot of plan details page.

### 5. Fill Installation Details
- Enter installation address details (house/flat number, building, street, city, pincode).
- Enter contact number for installation coordination.
- Select preferred installation date/slot if available.
- Use `ask_user` (input_type "choice") for installation time slot preference.
- Take snapshot of filled form.
- Use `confirm_action` to present subscription summary:
  - Plan: name, speed, price
  - Installation address
  - Installation date/slot
  - One-time charges (if any) + monthly rental
- Do NOT proceed unless user confirms.

### 6. Checkout & Payment
- Click proceed to payment.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with plan name, speed, monthly price, one-time charges, installation date
  - amount_inr: first payment amount (number)
  - description: "JioFiber broadband subscription"
- STOP and WAIT for payment confirmation.
- Only proceed if payment confirmed. If cancelled, ask what to change.

### 7. Complete & Confirm
- Complete the subscription on Jio website.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: subscription ID, plan details, installation date, total paid, next steps.

## Site Notes

- JioFiber plans start from Rs 399/month — check latest pricing on the site.
- Plans include OTT bundles (Netflix, Prime, Disney+ etc.) at higher tiers.
- Availability varies by pincode — always check first before showing plans.
- Installation usually takes 2-5 days after subscription.
- One-time security deposit may apply for the router (Rs 1000-2500).
- Operator Chrome Profile 3 is logged in. Do NOT ask user for phone or credentials.
- Jio website is React-based — wait for dynamic content to load.
- Session may require OTP re-verification — operator handles this, not user.
- Free router included with most plans. Premium router (Wi-Fi 6) costs extra.
- Use `confirm_action` for subscription review, `collect_payment` for actual payment.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
