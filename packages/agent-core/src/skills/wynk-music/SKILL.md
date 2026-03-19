---
name: wynk-music
description: Subscribe to Wynk Music (by Airtel). Music streaming, podcasts, Wynk Studio, and offline downloads.
triggers:
  - wynk subscription
  - subscribe wynk
  - wynk music plan
  - wynk premium
  - buy wynk
  - wynk airtel music
  - wynk ad free
  - wynk offline
  - get wynk
  - wynk music annual
siteUrl: https://wynk.in
requiresAuth: true
params:
  - name: plan
    required: false
    hint: Preferred plan (e.g. "Wynk Premium Monthly", "Wynk Premium Annual")
  - name: duration
    required: false
    hint: Monthly or annual (e.g. "monthly", "yearly", "annual")
---

# Wynk Music Subscription

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine which Wynk plan the user wants. Available India plans (verify on site):
  - **Wynk Premium Monthly** — ~₹99/mo — ad-free, HD audio, offline downloads, unlimited skips
  - **Wynk Premium Annual** — ~₹499/yr — ad-free, HD audio, offline, best value
- Note: Airtel users may get Wynk Premium free with certain postpaid/prepaid plans — check eligibility.
- If user is unsure, use `ask_user` (input_type "choice"):
  - "Wynk Premium Monthly — ~₹99/mo — Ad-free, HD audio, offline"
  - "Wynk Premium Annual — ~₹499/yr — Best value"
  - "Check Airtel bundle — may be free with your plan"
- Ask if user is an Airtel subscriber (important for bundled access).
- Ask if user is primarily interested in Bollywood, regional, international music, or podcasts.
- Clarify if new subscription or renewal/upgrade.

### 2. Open Wynk & Verify Login
- Open a NEW tab and navigate to `https://wynk.in`.
- Take snapshot. Check if logged in (profile icon or name visible in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- If already subscribed, navigate to account/subscription page.
- Wynk web may redirect to app download — if so, navigate directly to `https://wynk.in/music` or subscription page.

### 3. Navigate to Plan Selection
- Navigate to subscription/premium page via profile menu or settings.
- Take snapshot of available plans with current pricing.
- Verify current pricing on screen.
- Check if Airtel bundle pricing is available (may show different plans for Airtel users).
- If prices differ from discussed, present the actual on-screen plans to user.
- Use `ask_user` (input_type "choice") to confirm plan and duration if not yet chosen.
- Select the chosen plan on the page.

### 4. Review & Confirm
- Use `confirm_action` with subscription summary:
  - Plan name (Premium Monthly / Premium Annual / Airtel Bundle)
  - Duration (monthly / annual)
  - Price (or "Free with Airtel plan" if bundled)
  - Features: ad-free, HD audio, offline downloads, unlimited skips
  - Number of devices
  - Billing: auto-renew date or Airtel billing cycle
- Do NOT proceed unless user confirms.

### 5. Payment
- Use `collect_payment`:
  - summary: JSON with plan, duration, price, features, airtel_bundle
  - amount_inr: subscription price (may be 0 for Airtel bundle)
  - description: "Wynk Music subscription"
- WAIT for payment confirmation from user.
- If free with Airtel bundle, skip payment and activate directly.

### 6. Complete & Confirm
- Enter payment method on Wynk (UPI / credit card / debit card / Airtel billing / wallet).
- Handle OTP via `ask_user` if needed.
- Take snapshot of subscription confirmation page.
- Report to user: plan activated, price paid, validity period, features, next billing date, how to cancel.
- Mention: "You can manage or cancel your subscription from Wynk Account settings or through the Airtel Thanks app."

## Site Notes

- Wynk Music is Airtel's music streaming platform with 10M+ songs, podcasts, and Wynk Studio for independent artists.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in to Wynk. Do NOT ask user for credentials.
- Wynk is deeply integrated with Airtel — many Airtel postpaid and prepaid plans include free Wynk Premium. Always check this first.
- Wynk web experience may be limited compared to the mobile app — some features may redirect to app download.
- Payment methods accepted: UPI, credit/debit card, Airtel billing (for Airtel users), and wallets.
- Wynk login uses phone number + OTP — if OTP is triggered, use `ask_user` to collect it.
- Wynk offers Wynk Studio for independent artists to upload music — this is a unique feature worth mentioning.
- Wynk has strong Bollywood and regional music coverage, plus podcasts and audiobooks.
- Non-Airtel users can subscribe at full price; Airtel users often get 50-100% discount or free access.
- Session may expire; if login wall appears mid-flow, stop and notify user to re-login in Chrome Debug.
- Use `confirm_action` for review, `collect_payment` for checkout. Always WAIT for user response.
