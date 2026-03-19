---
name: mubi-subscribe
description: Subscribe to MUBI India. Curated indie, art-house, and international cinema. Hand-picked films daily.
triggers:
  - mubi subscription
  - subscribe mubi
  - mubi plan
  - mubi india
  - buy mubi
  - mubi art films
  - mubi indie movies
  - mubi curated cinema
  - get mubi
  - mubi annual plan
siteUrl: https://mubi.com
requiresAuth: true
params:
  - name: plan
    required: false
    hint: Preferred plan (e.g. "Monthly", "Annual")
  - name: duration
    required: false
    hint: Monthly or annual (e.g. "monthly", "yearly", "annual")
---

# MUBI India Subscription

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine which MUBI plan the user wants. Available India plans (verify on site):
  - **MUBI Monthly** — ~₹199/mo — full library access, curated daily picks, offline downloads
  - **MUBI Annual** — ~₹1999/yr — same features, ~17% savings over monthly
- If user is unsure, use `ask_user` (input_type "choice"):
  - "MUBI Monthly — ~₹199/mo — Full access, cancel anytime"
  - "MUBI Annual — ~₹1999/yr — Full access, best value (~17% off)"
- Ask if user is interested in specific genres: art-house, world cinema, classic films, festival picks.
- Clarify if new subscription or renewal. MUBI often offers a 7-day free trial for new users — check eligibility.
- Mention that MUBI shows 30 curated films at a time, with a new film added daily and one expiring.

### 2. Open MUBI & Verify Login
- Open a NEW tab and navigate to `https://mubi.com`.
- Take snapshot. Check if logged in (profile icon or user menu visible in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- If already subscribed, navigate to account/subscription page.

### 3. Navigate to Plan Selection
- Navigate to `https://mubi.com/en/plans` or subscription page via account settings.
- Take snapshot of available plans with current pricing.
- Verify current pricing on screen (MUBI may offer promotional pricing for India).
- Check for free trial availability and highlight it to user.
- If prices differ from discussed, present the actual on-screen plans.
- Use `ask_user` (input_type "choice") to confirm plan and duration if not yet chosen.
- Select the chosen plan on the page.

### 4. Review & Confirm
- Use `confirm_action` with subscription summary:
  - Plan name (Monthly / Annual)
  - Price
  - Library access: 30 curated films rotating daily
  - Offline downloads: yes
  - Devices: unlimited
  - Free trial: if applicable (7 days for new users)
  - Billing: auto-renew date
  - First charge date (after trial if applicable)
- Do NOT proceed unless user confirms.

### 5. Payment
- Use `collect_payment`:
  - summary: JSON with plan, duration, price, library_type, offline_downloads, trial_info
  - amount_inr: subscription price (or 0 if free trial)
  - description: "MUBI India subscription"
- WAIT for payment confirmation from user.

### 6. Complete & Confirm
- Enter payment method on MUBI (credit card / debit card / UPI if available).
- Handle OTP via `ask_user` if needed.
- Take snapshot of subscription confirmation page.
- Report to user: plan activated, price paid, validity period, how the curated library works (30 films, 1 new daily), offline downloads, next billing date, how to cancel.
- Mention: "You can cancel anytime from MUBI Account settings. If on a free trial, cancel before trial ends to avoid charges."

## Site Notes

- MUBI is a curated streaming platform focused on indie, art-house, classic, and international cinema — not a mainstream Bollywood/Hollywood service.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in to MUBI. Do NOT ask user for credentials.
- MUBI India pricing is significantly lower than global pricing — always verify on-screen prices as they may change.
- MUBI shows exactly 30 films at any time — a new film is added every day and one expires. This is a unique model worth explaining to new users.
- MUBI frequently offers a 7-day free trial for new subscribers — always check and highlight this.
- Payment methods on MUBI India may be limited to credit/debit cards — UPI support varies. Verify on the payment page.
- MUBI also distributes theatrical releases in India (MUBI GO) — this is separate from the streaming subscription.
- MUBI content includes Cannes, Venice, Berlin, and Sundance festival selections — mention for cinephile users.
- Session rarely expires on MUBI web, but if login wall appears, stop and notify user to re-login in Chrome Debug.
- Use `confirm_action` for review, `collect_payment` for checkout. Always WAIT for user response.
