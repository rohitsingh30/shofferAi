---
name: zee5-subscribe
description: Subscribe to ZEE5 India. Hindi and regional content, originals, movies, live TV, and kids shows.
triggers:
  - zee5 subscription
  - subscribe zee5
  - zee5 plan
  - zee5 premium
  - buy zee5
  - zee5 hindi
  - zee5 originals
  - zee5 annual plan
  - get zee5
  - zee5 regional content
siteUrl: https://www.zee5.com
requiresAuth: true
params:
  - name: plan
    required: false
    hint: Preferred plan (e.g. "Premium Monthly", "Premium Annual", "Club")
  - name: duration
    required: false
    hint: Monthly or annual (e.g. "monthly", "yearly", "annual")
---

# ZEE5 India Subscription

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine which ZEE5 plan the user wants. Available India plans (verify on site):
  - **ZEE5 Club** — ~₹599/yr — ad-supported, limited originals, TV shows before TV
  - **ZEE5 Premium Monthly** — ~₹149/mo — ad-free, all originals, movies, live TV
  - **ZEE5 Premium Annual** — ~₹599-₹999/yr — ad-free, all content, best value
- If user is unsure, use `ask_user` (input_type "choice"):
  - "ZEE5 Club — ~₹599/yr — Limited originals, ads"
  - "ZEE5 Premium Monthly — ~₹149/mo — All content, ad-free"
  - "ZEE5 Premium Annual — ~₹999/yr — All content, best value"
- Ask if user prefers Hindi, regional (Tamil, Telugu, Bengali, Marathi, Kannada), or multilingual content.
- Clarify if new subscription or renewal/upgrade.

### 2. Open ZEE5 & Verify Login
- Open a NEW tab and navigate to `https://www.zee5.com`.
- Take snapshot. Check if logged in (profile icon visible in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- If already subscribed, navigate to My Account or subscription management page.

### 3. Navigate to Plan Selection
- Navigate to subscription page: `https://www.zee5.com/myaccount/subscription` or via profile menu.
- Take snapshot of available plans with current pricing.
- Verify current pricing on screen (ZEE5 runs frequent promotions and plan changes).
- If prices differ from discussed, present the actual on-screen plans to user.
- Use `ask_user` (input_type "choice") to confirm plan and duration if not yet chosen.
- Select the chosen plan on the page.

### 4. Review & Confirm
- Use `confirm_action` with subscription summary:
  - Plan name (Club / Premium Monthly / Premium Annual)
  - Duration (monthly / annual)
  - Price
  - Number of devices / screens
  - Ad-free or ad-supported
  - Content access: originals, movies, live TV, regional content
  - Billing: auto-renew date
- Do NOT proceed unless user confirms.

### 5. Payment
- Use `collect_payment`:
  - summary: JSON with plan, duration, price, devices, ad_free, content_access
  - amount_inr: subscription price
  - description: "ZEE5 India subscription"
- WAIT for payment confirmation from user.

### 6. Complete & Confirm
- Enter payment method on ZEE5 (UPI / credit card / debit card / net banking / wallet).
- Handle OTP via `ask_user` if needed.
- Take snapshot of subscription confirmation page.
- Report to user: plan activated, price paid, validity period, content access, language options, next billing date, how to cancel.
- Mention: "You can manage or cancel your subscription from ZEE5 Account settings."

## Site Notes

- ZEE5 is one of India's largest OTT platforms with content in 12+ languages including Hindi, Tamil, Telugu, Bengali, Marathi, and Kannada.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in to ZEE5. Do NOT ask user for credentials.
- ZEE5 plans and pricing change frequently — they run aggressive promotions especially during festivals — always verify on-screen prices.
- ZEE5 has both ad-supported (Club) and ad-free (Premium) tiers — make sure user understands the difference.
- Payment methods accepted: UPI, credit/debit card, net banking, Paytm, PhonePe, and other wallets.
- ZEE5 often bundles with telecom operators (Airtel, Vi, Jio) — mention if user already has a telecom bundle.
- ZEE5 login uses phone number + OTP — if OTP is triggered, use `ask_user` to collect it.
- ZEE5 offers downloadable content on Premium for offline viewing — mention this as a perk.
- Session may expire; if login wall appears mid-flow, stop and notify user to re-login in Chrome Debug.
- Use `confirm_action` for review, `collect_payment` for checkout. Always WAIT for user response.
