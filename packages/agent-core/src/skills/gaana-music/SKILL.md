---
name: gaana-music
description: Subscribe to Gaana Plus. Music streaming, podcasts, ad-free listening, and offline downloads.
triggers:
  - gaana subscription
  - subscribe gaana
  - gaana plus plan
  - gaana premium
  - buy gaana
  - gaana music
  - gaana ad free
  - gaana offline
  - get gaana plus
  - gaana annual plan
siteUrl: https://gaana.com
requiresAuth: true
params:
  - name: plan
    required: false
    hint: Preferred plan (e.g. "Gaana Plus Monthly", "Gaana Plus Annual")
  - name: duration
    required: false
    hint: Monthly or annual (e.g. "monthly", "yearly", "annual")
---

# Gaana Plus Subscription

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine which Gaana Plus plan the user wants. Available India plans (verify on site):
  - **Gaana Plus Monthly** — ~₹99/mo — ad-free, HD audio, offline downloads, unlimited skips
  - **Gaana Plus Quarterly** — ~₹199/3-months — ad-free, HD audio, offline, better value
  - **Gaana Plus Annual** — ~₹399/yr — ad-free, HD audio, offline, best value
- If user is unsure, use `ask_user` (input_type "choice"):
  - "Gaana Plus Monthly — ~₹99/mo — Ad-free, HD audio, offline"
  - "Gaana Plus Quarterly — ~₹199/3-months — Better value"
  - "Gaana Plus Annual — ~₹399/yr — Best value"
- Ask if user is primarily interested in Bollywood music, regional music, podcasts, or international songs.
- Clarify if new subscription or renewal/upgrade.
- Gaana may offer a free trial for new users — check eligibility.

### 2. Open Gaana & Verify Login
- Open a NEW tab and navigate to `https://gaana.com`.
- Take snapshot. Check if logged in (profile icon or name visible in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- If already subscribed, navigate to account/subscription page.

### 3. Navigate to Plan Selection
- Navigate to Gaana Plus subscription page via profile menu or `https://gaana.com/plus`.
- Take snapshot of available plans with current pricing.
- Verify current pricing on screen (Gaana may run promotional pricing).
- If prices differ from discussed, present the actual on-screen plans to user.
- Use `ask_user` (input_type "choice") to confirm plan and duration if not yet chosen.
- Select the chosen plan on the page.

### 4. Review & Confirm
- Use `confirm_action` with subscription summary:
  - Plan name (Monthly / Quarterly / Annual)
  - Duration
  - Price
  - Features: ad-free, HD audio quality, offline downloads, unlimited skips
  - Number of devices
  - Free trial: if applicable
  - Billing: auto-renew date
  - First charge date (after trial if applicable)
- Do NOT proceed unless user confirms.

### 5. Payment
- Use `collect_payment`:
  - summary: JSON with plan, duration, price, features, trial_info
  - amount_inr: subscription price (or 0 if free trial)
  - description: "Gaana Plus subscription"
- WAIT for payment confirmation from user.

### 6. Complete & Confirm
- Enter payment method on Gaana (UPI / credit card / debit card / net banking / wallet).
- Handle OTP via `ask_user` if needed.
- Take snapshot of subscription confirmation page.
- Report to user: plan activated, price paid, validity period, key features (ad-free, HD, offline), next billing date, how to cancel.
- Mention: "You can manage or cancel your subscription from Gaana Account settings."

## Site Notes

- Gaana is one of India's largest music streaming platforms with 45M+ songs across Bollywood, regional, devotional, international, and podcast content.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in to Gaana. Do NOT ask user for credentials.
- Gaana Plus pricing is competitive — annual plan at ~₹399/yr is among the cheapest ad-free music subscriptions in India.
- Gaana may run promotional pricing or bundled offers with telecom partners — always verify on-screen prices.
- Payment methods accepted: UPI, credit/debit card, net banking, Paytm, Google Pay, and other wallets.
- Gaana login uses phone number + OTP, Google sign-in, or email — if OTP is triggered, use `ask_user` to collect it.
- Gaana Plus offers HD audio quality (320kbps) vs free tier (128kbps) — mention this for audiophile users.
- Gaana has strong regional music coverage (Punjabi, Tamil, Telugu, Bengali, Marathi) — highlight based on user preference.
- Free tier is ad-supported with limited skips and standard audio quality — make sure user understands the Plus benefits.
- Session may expire; if login wall appears mid-flow, stop and notify user to re-login in Chrome Debug.
- Use `confirm_action` for review, `collect_payment` for checkout. Always WAIT for user response.
