---
name: aha-subscribe
description: Subscribe to aha. Telugu and Tamil entertainment platform with originals, movies, and web series.
triggers:
  - aha subscription
  - subscribe aha
  - aha plan
  - aha premium
  - buy aha
  - aha telugu
  - aha tamil
  - aha originals
  - get aha
  - aha annual plan
siteUrl: https://www.aha.video
requiresAuth: true
params:
  - name: plan
    required: false
    hint: Preferred plan (e.g. "Monthly", "Annual", "Gold Annual")
  - name: duration
    required: false
    hint: Monthly or annual (e.g. "monthly", "yearly", "annual")
---

# aha Subscription

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine which aha plan the user wants. Available India plans (verify on site):
  - **Monthly** — ~₹149/mo — all content, ad-free, 2 devices, HD
  - **Annual** — ~₹699/yr — all content, ad-free, 2 devices, HD, best value
  - **Gold Annual** — ~₹1499/yr — all content, ad-free, 4 devices, 4K, offline downloads
- If user is unsure, use `ask_user` (input_type "choice"):
  - "Monthly — ~₹149/mo — All content, 2 devices, HD"
  - "Annual — ~₹699/yr — All content, 2 devices, best value"
  - "Gold Annual — ~₹1499/yr — 4 devices, 4K, offline downloads"
- Ask if user prefers Telugu or Tamil content (aha has separate Telugu and Tamil sections).
- Clarify if new subscription or renewal/upgrade.
- aha sometimes offers free trials for new users — check eligibility.

### 2. Open aha & Verify Login
- Open a NEW tab and navigate to `https://www.aha.video`.
- Take snapshot. Check if logged in (profile icon or name visible in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- If already subscribed, navigate to account/subscription page.

### 3. Navigate to Plan Selection
- Navigate to subscription page via profile menu or `https://www.aha.video/subscribe`.
- Take snapshot of available plans with current pricing.
- Verify current pricing on screen (aha may run promotions around Telugu/Tamil festivals).
- If prices differ from discussed, present the actual on-screen plans to user.
- Use `ask_user` (input_type "choice") to confirm plan and duration if not yet chosen.
- Select the chosen plan on the page.

### 4. Review & Confirm
- Use `confirm_action` with subscription summary:
  - Plan name (Monthly / Annual / Gold Annual)
  - Duration (monthly / annual)
  - Price
  - Number of devices / screens
  - Video quality (HD / 4K)
  - Offline downloads (Gold only)
  - Content access: Telugu and Tamil originals, movies, web series
  - Billing: auto-renew date
- Do NOT proceed unless user confirms.

### 5. Payment
- Use `collect_payment`:
  - summary: JSON with plan, duration, price, devices, quality, offline_downloads, languages
  - amount_inr: subscription price (or 0 if free trial)
  - description: "aha subscription"
- WAIT for payment confirmation from user.

### 6. Complete & Confirm
- Enter payment method on aha (UPI / credit card / debit card / net banking / wallet).
- Handle OTP via `ask_user` if needed.
- Take snapshot of subscription confirmation page.
- Report to user: plan activated, price paid, validity period, content highlights (Telugu/Tamil), number of devices, next billing date, how to cancel.
- Mention: "You can manage or cancel your subscription from aha Account settings."

## Site Notes

- aha is the leading Telugu and Tamil streaming platform, co-founded by Geetha Arts and Arha Media, focused exclusively on south Indian content.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in to aha. Do NOT ask user for credentials.
- aha plans and pricing may change around major festivals (Sankranti, Ugadi, Pongal, Diwali) — always verify on-screen prices.
- aha content is split into aha Telugu and aha Tamil — both are included in subscription, but the app defaults to one language based on preference.
- Payment methods accepted: UPI, credit/debit card, net banking, Paytm, Google Pay, and other wallets.
- aha login uses phone number + OTP — if OTP is triggered, use `ask_user` to collect it.
- aha originals like Kudi Yedamaithe, 11th Hour, and 3 Roses are popular — mention these if user is exploring.
- aha also features same-day digital premieres of theatrical Telugu/Tamil films — highlight this as a key differentiator.
- Some aha content is available free with ads — user should understand the premium vs free tier difference.
- Session may expire; if login wall appears mid-flow, stop and notify user to re-login in Chrome Debug.
- Use `confirm_action` for review, `collect_payment` for checkout. Always WAIT for user response.
