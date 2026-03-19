---
name: netflix-subscribe
description: Subscribe to Netflix India. Choose plan (Mobile, Basic, Standard, Premium), enter payment, and activate.
triggers:
  - netflix subscription
  - subscribe netflix
  - netflix plan
  - netflix india
  - buy netflix
  - netflix premium
  - netflix basic
  - netflix mobile plan
  - get netflix
  - netflix account
siteUrl: https://www.netflix.com
requiresAuth: true
params:
  - name: plan
    required: false
    hint: Preferred Netflix plan (e.g. "Mobile", "Basic", "Standard", "Premium")
  - name: duration
    required: false
    hint: Duration preference (Netflix India is monthly auto-renew)
---

# Netflix India Subscription

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine which Netflix plan the user wants. Available India plans:
  - **Mobile** — ₹149/mo — 1 device, phone/tablet only, 480p
  - **Basic** — ₹199/mo — 1 device, any screen, 720p
  - **Standard** — ₹499/mo — 2 devices, Full HD 1080p, downloads
  - **Premium** — ₹649/mo — 4 devices, Ultra HD 4K + HDR, downloads
- If user is unsure, explain plans briefly via `ask_user` (input_type "choice"):
  - "Mobile — ₹149/mo — Phone/tablet only, 480p"
  - "Basic — ₹199/mo — 1 device, 720p"
  - "Standard — ₹499/mo — 2 devices, 1080p"
  - "Premium — ₹649/mo — 4 devices, 4K HDR"
- Clarify if this is a new subscription or plan upgrade/downgrade.

### 2. Open Netflix & Verify Login
- Open a NEW tab and navigate to `https://www.netflix.com`.
- Take snapshot. Check if already logged in (profile selection page or browse page).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- If already subscribed, navigate to account settings to change plan.

### 3. Navigate to Plan Selection
- If new subscription: navigate to `https://www.netflix.com/signup` or the plan picker page.
- If plan change: navigate to Account → Plan Details → Change Plan.
- Take snapshot of plan selection page.
- Verify current India pricing (prices may change — use what's shown on screen).
- Show user the plans with current pricing if different from what was discussed.
- Use `ask_user` (input_type "choice") to confirm plan selection if not already chosen.

### 4. Review & Confirm
- Use `confirm_action` with subscription summary:
  - Plan name (Mobile / Basic / Standard / Premium)
  - Monthly price
  - Number of devices / screens
  - Video quality (480p / 720p / 1080p / 4K)
  - Download support (yes/no)
  - Billing: monthly auto-renew
  - First charge date
- Do NOT proceed unless user confirms.

### 5. Payment
- Use `collect_payment`:
  - summary: JSON with plan, price_monthly, devices, quality, billing_type
  - amount_inr: monthly plan price
  - description: "Netflix India subscription"
- WAIT for payment confirmation from user.

### 6. Complete & Confirm
- Enter payment method on Netflix (UPI / credit card / debit card).
- Handle OTP via `ask_user` if needed.
- Take snapshot of subscription confirmation page.
- Report to user: plan activated, monthly price, number of screens, video quality, next billing date, how to cancel.
- Mention: "You can cancel anytime from Netflix Account settings. No cancellation fee."

## Site Notes

- Netflix India pricing is among the cheapest globally — plans start at ₹149/mo.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in to Netflix. Do NOT ask user for credentials.
- Netflix India plans and pricing change periodically — always verify on-screen prices, never hardcode.
- Netflix does NOT offer annual plans in India — all plans are monthly auto-renew.
- Payment methods accepted: UPI autopay, credit/debit card, net banking. No wallet support.
- If user already has a Netflix account, this becomes a plan change — navigate to Account settings.
- Netflix offers a download feature on Basic and above — worth mentioning for offline viewing.
- 4K content requires Premium plan AND a 4K-capable device — inform user if relevant.
- Netflix may show promotional pricing for new users — mention if any discount is visible.
- Plan changes take effect at the next billing cycle for downgrades, immediately for upgrades.
- Use `confirm_action` for review, `collect_payment` for checkout. Always WAIT for user response.
