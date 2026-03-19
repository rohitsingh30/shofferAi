---
name: swiggy-one
description: Subscribe to Swiggy One membership — unlimited free delivery, extra discounts on food and Instamart.
triggers:
  - swiggy one
  - swiggy one membership
  - subscribe swiggy one
  - swiggy membership
  - swiggy one plan
  - swiggy unlimited delivery
  - swiggy one subscribe
  - swiggy one benefits
siteUrl: https://www.swiggy.com/one
requiresAuth: true
params:
  - name: plan
    required: false
    hint: Preferred plan duration (e.g. "1 month", "3 months", "12 months")
---

# Swiggy One Membership Subscription

Chrome profile: rsinghtomar3011@gmail.com. Operator Swiggy account logged in.

## Steps

### 1. Gather Requirements
- Check if user specified plan duration preference.
- If not, note that we will show all available plans for user to choose.
- Check if user already has an active Swiggy One membership (will verify after login).

### 2. Open Swiggy One Page
- Open a NEW tab and navigate to `https://www.swiggy.com/one` or `https://www.swiggy.com/swiggy-one`.
- Take a snapshot to verify page loaded.
- Check if logged in (profile icon / account name visible).
- **If NOT logged in or session expired, STOP and tell user: "Swiggy session expired, please re-login in Chrome Debug."**
- Do NOT ask user for credentials.

### 3. Verify Login & Check Status
- Take snapshot confirming Swiggy One page.
- Check if operator account already has an active Swiggy One membership.
- If already subscribed, inform user of current plan status, expiry date, and benefits.
- If not subscribed or expired, proceed to plan selection.

### 4. Browse Plans
- Take snapshot of all available Swiggy One plans.
- Present plans to user using `ask_user` (input_type "choice"):
  - Plan duration (1/3/6/12 months)
  - Price per month and total price
  - Key benefits: free delivery, extra discounts, priority support
  - Any trial period or introductory offers
  - Savings vs ordering without membership
- Highlight the best value plan (usually longer duration = cheaper per month).

### 5. Review Subscription
- User selects preferred plan.
- Click on the selected plan.
- Take snapshot of plan details.
- Use `confirm_action` to present subscription summary:
  - Plan: duration, price, auto-renewal terms
  - Benefits: free delivery limit, discount percentages, Instamart benefits
  - Cancellation policy
  - Comparison: estimated savings per month based on average orders
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Subscribe" or "Buy Now".
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with plan duration, price, benefits list, auto-renewal info
  - amount_inr: subscription amount (number)
  - description: "Swiggy One membership subscription"
- STOP and WAIT for payment confirmation.
- Only proceed if payment confirmed.

### 7. Complete & Confirm
- Complete subscription on Swiggy.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: membership ID, plan duration, start date, expiry date, amount paid, key benefits activated.

## Site Notes

- Swiggy One gives free delivery on food orders + Instamart + Dineout discounts.
- Plans typically: 1 month (~Rs 149), 3 months (~Rs 349), 12 months (~Rs 999) — verify current pricing.
- Auto-renewal is usually ON by default — inform user about this.
- Free delivery has a minimum order value (usually Rs 149-199).
- Savings depend on order frequency — mention break-even point to user.
- Operator Chrome Profile 3 is logged in. Do NOT ask user for phone or credentials.
- Swiggy uses React SPA — wait for plan cards and pricing to render.
- Session managed by cookies. If expired, operator re-logins in Chrome Debug.
- If account already has Swiggy One, renewal extends the current plan.
- Trial offers (1 rupee trial, free trial) may be available for first-time subscribers.
- Use `confirm_action` for plan review (no money), `collect_payment` for actual payment.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
