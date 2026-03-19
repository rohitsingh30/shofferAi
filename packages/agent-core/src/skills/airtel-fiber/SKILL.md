---
name: airtel-fiber
description: Subscribe to Airtel Xstream Fiber broadband — select plan, check availability, schedule installation, pay.
triggers:
  - airtel fiber
  - airtel xstream
  - airtel broadband
  - airtel wifi plan
  - airtel internet connection
  - airtel xstream fiber
  - airtel home broadband
  - subscribe airtel fiber
siteUrl: https://www.airtel.in/xstream-fiber
requiresAuth: true
params:
  - name: plan
    required: false
    hint: Preferred plan or speed (e.g. "200 Mbps", "Entertainment plan")
  - name: address
    required: true
    hint: Installation address with pincode
  - name: phone
    required: false
    hint: Contact phone number
---

# Airtel Xstream Fiber Subscription

Chrome profile: rsinghtomar3011@gmail.com. Operator Airtel account logged in.

## Steps

### 1. Gather Requirements
- Check if user specified plan preference, speed requirement, or budget.
- If not, use `ask_user` (input_type "freetext"): "What internet speed or budget do you prefer? (e.g. 100 Mbps, under Rs 800/month)"
- Get installation address if not provided: use `ask_user` (input_type "freetext"): "What's your installation address with pincode for Airtel Fiber?"

### 2. Open Airtel Xstream Fiber
- Open a NEW tab and navigate to `https://www.airtel.in/xstream-fiber`.
- Take a snapshot to verify page loaded.
- Check if logged in (My Account / profile icon visible).
- **If NOT logged in or session expired, STOP and tell user: "Airtel session expired, please re-login in Chrome Debug."**
- Do NOT ask user for credentials.

### 3. Verify Login & Check Availability
- Take snapshot confirming Xstream Fiber page.
- Look for availability checker — enter user's pincode or address.
- Take snapshot of availability result.
- If NOT available, inform user and STOP.
- If available, note the available plans for the area.

### 4. Browse & Select Plan
- Navigate to plans listing for user's area.
- Take snapshot of all Xstream Fiber plans.
- Present plans to user using `ask_user` (input_type "choice"):
  - Plan name, speed (Mbps), price/month, data limit, OTT apps included
  - Highlight any current offers or discounts
- User selects preferred plan.
- Click "Buy Now" or "Get Connection" for the selected plan.
- Take snapshot of plan detail/confirmation.

### 5. Fill Installation Details
- Enter installation address (flat/house, building, locality, city, pincode).
- Enter contact number.
- Select installation date/slot if available.
- Use `ask_user` (input_type "choice") for preferred time slot.
- Take snapshot of completed form.
- Use `confirm_action` to present subscription summary:
  - Plan name, speed, monthly price
  - Installation address and scheduled date
  - One-time charges (installation, router deposit)
  - First month total
- Do NOT proceed unless user confirms.

### 6. Checkout & Payment
- Click proceed to payment.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with plan, speed, monthly price, one-time charges, installation date
  - amount_inr: first payment amount (number)
  - description: "Airtel Xstream Fiber subscription"
- STOP and WAIT for payment confirmation.
- Only proceed if payment confirmed. If cancelled, ask what to change.

### 7. Complete & Confirm
- Complete subscription on Airtel website.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: subscription/order ID, plan details, installation date, amount paid, what to expect next.

## Site Notes

- Airtel Xstream Fiber plans start around Rs 499/month — check latest on site.
- Higher plans include OTT bundles (Disney+, Netflix, Prime, etc.).
- Unlimited data on all plans (no FUP on most current plans).
- Installation typically within 2-3 days in metro cities.
- One-time installation charge around Rs 1000-1500 may apply.
- Operator Chrome Profile 3 is logged in. Do NOT ask user for phone or credentials.
- Airtel website has dynamic content — wait for plan cards to render before clicking.
- Session may require OTP — operator handles it, never ask user.
- Router included free with most plans. Wi-Fi 6 router on premium plans.
- Airtel Thanks rewards may offer extra benefits — mention if visible.
- Use `confirm_action` for subscription review, `collect_payment` for actual payment.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
