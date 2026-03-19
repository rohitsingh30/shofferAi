---
name: zomato-pro
description: Subscribe to Zomato Gold/Pro membership — free delivery, extra discounts, priority service.
triggers:
  - zomato pro
  - zomato gold
  - zomato membership
  - subscribe zomato pro
  - zomato pro plan
  - zomato gold membership
  - zomato unlimited delivery
  - zomato pro benefits
siteUrl: https://www.zomato.com/pro
requiresAuth: true
params:
  - name: plan
    required: false
    hint: Preferred plan duration (e.g. "1 month", "3 months", "12 months")
---

# Zomato Gold/Pro Membership Subscription

Chrome profile: rsinghtomar3011@gmail.com. Operator Zomato account logged in.

## Steps

### 1. Gather Requirements
- Check if user specified plan duration preference.
- If not, we will present all available plans.
- Note: Zomato has rebranded membership multiple times (Gold → Pro → Gold) — use whatever is current.

### 2. Open Zomato Pro/Gold Page
- Open a NEW tab and navigate to `https://www.zomato.com/pro` or `https://www.zomato.com/gold`.
- Take a snapshot to verify page loaded.
- Check if logged in (profile icon / account name visible).
- **If NOT logged in or session expired, STOP and tell user: "Zomato session expired, please re-login in Chrome Debug."**
- Do NOT ask user for credentials.

### 3. Verify Login & Check Status
- Take snapshot confirming Zomato Pro/Gold page.
- Check if operator account already has an active membership.
- If already subscribed, inform user: current plan, expiry, benefits being used.
- If not subscribed or expired, proceed to plan selection.

### 4. Browse Plans
- Take snapshot of available membership plans.
- Present plans to user using `ask_user` (input_type "choice"):
  - Plan duration (1/3/6/12 months)
  - Price per month and total price
  - Benefits: free delivery, extra discounts, priority support, dine-in offers
  - Any introductory/trial offers
  - Best value recommendation
- Note: Zomato Gold may include dine-in benefits (complimentary dishes/drinks).

### 5. Review Subscription
- User selects preferred plan.
- Click on selected plan.
- Take snapshot of plan details and terms.
- Use `confirm_action` to present subscription summary:
  - Plan duration, total price, monthly equivalent
  - Full benefits list: delivery, discounts, dine-in, priority
  - Auto-renewal terms and cancellation policy
  - Estimated monthly savings
- Do NOT proceed unless user confirms.

### 6. Checkout & Payment
- Click "Subscribe" or "Get Pro/Gold".
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with plan, duration, price, benefits, auto-renewal info
  - amount_inr: subscription amount (number)
  - description: "Zomato Pro/Gold membership"
- STOP and WAIT for payment confirmation.
- Only proceed if payment confirmed.

### 7. Complete & Confirm
- Complete subscription on Zomato.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: membership type, plan duration, start/expiry dates, amount paid, benefits now active.

## Site Notes

- Zomato has rebranded membership several times: Gold → Pro → Gold. Check current naming on the site.
- Benefits typically: free delivery, extra discounts (up to 30%), priority delivery, dine-in perks.
- Dine-in benefits may include: complimentary dishes or drinks at partner restaurants.
- Plans usually range from Rs 149/month to Rs 1499/year — verify current pricing.
- Auto-renewal is typically enabled by default — always inform user.
- Operator Chrome Profile 3 is logged in. Do NOT ask user for phone or credentials.
- Zomato uses React SPA — wait for plan cards to render.
- Session managed by cookies. If expired, operator re-logins in Chrome Debug.
- Membership benefits apply immediately after subscription.
- Free delivery has minimum order value — varies by city (Rs 149-199).
- Use `confirm_action` for plan review (no money), `collect_payment` for actual payment.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
