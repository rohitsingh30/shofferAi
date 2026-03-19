---
name: hungama-music
description: Subscribe to Hungama Music/Play. Bollywood music, movies, web series, kids content, and games.
triggers:
  - hungama subscription
  - subscribe hungama
  - hungama plan
  - hungama music
  - buy hungama
  - hungama play
  - hungama bollywood music
  - hungama movies
  - get hungama
  - hungama premium
siteUrl: https://www.hungama.com
requiresAuth: true
params:
  - name: plan
    required: false
    hint: Preferred plan (e.g. "Gold Monthly", "Gold Annual", "Music Only")
  - name: duration
    required: false
    hint: Monthly or annual (e.g. "monthly", "yearly", "annual")
---

# Hungama Music/Play Subscription

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine which Hungama plan the user wants. Available India plans (verify on site):
  - **Hungama Gold Monthly** — ~₹99/mo — ad-free music, movies, web series, games, kids
  - **Hungama Gold Annual** — ~₹499/yr — all Gold content, best value
  - **Hungama Music Pro** — ~₹66/mo or ~₹199/yr — music only, ad-free, offline downloads
- If user is unsure, use `ask_user` (input_type "choice"):
  - "Hungama Gold Monthly — ~₹99/mo — Music + movies + games, ad-free"
  - "Hungama Gold Annual — ~₹499/yr — Everything, best value"
  - "Hungama Music Pro — ~₹199/yr — Music only, ad-free, offline"
- Ask if user primarily wants music, movies, or both.
- Clarify if new subscription or renewal/upgrade.
- Hungama may offer free trial for new users — check eligibility.

### 2. Open Hungama & Verify Login
- Open a NEW tab and navigate to `https://www.hungama.com`.
- Take snapshot. Check if logged in (profile icon or name visible in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- If already subscribed, navigate to My Account or subscription management page.

### 3. Navigate to Plan Selection
- Navigate to subscription page via profile menu or pricing/plans section.
- Take snapshot of available plans with current pricing.
- Verify current pricing on screen (Hungama frequently bundles with telecom operators at different prices).
- If prices differ from discussed, present the actual on-screen plans to user.
- Use `ask_user` (input_type "choice") to confirm plan if not yet chosen.
- Select the chosen plan on the page.

### 4. Review & Confirm
- Use `confirm_action` with subscription summary:
  - Plan name (Gold Monthly / Gold Annual / Music Pro)
  - Duration (monthly / annual)
  - Price
  - Content access: music, movies, web series, games, kids (depends on plan)
  - Ad-free status
  - Offline downloads
  - Number of devices
  - Billing: auto-renew date
- Do NOT proceed unless user confirms.

### 5. Payment
- Use `collect_payment`:
  - summary: JSON with plan, duration, price, content_access, offline_downloads, ad_free
  - amount_inr: subscription price
  - description: "Hungama subscription"
- WAIT for payment confirmation from user.

### 6. Complete & Confirm
- Enter payment method on Hungama (UPI / credit card / debit card / net banking / wallet).
- Handle OTP via `ask_user` if needed.
- Take snapshot of subscription confirmation page.
- Report to user: plan activated, price paid, validity period, content access, offline download info, next billing date, how to cancel.
- Mention: "You can manage or cancel your subscription from Hungama Account settings."

## Site Notes

- Hungama is one of India's oldest digital entertainment platforms, offering Bollywood/regional music, movies, web series, games, and kids content.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in to Hungama. Do NOT ask user for credentials.
- Hungama plans are among the cheapest in Indian OTT — starting around ₹66/month for music-only.
- Hungama is frequently bundled with telecom operators (Airtel Wynk, Vodafone-Idea) — check if user already has bundled access.
- Payment methods accepted: UPI, credit/debit card, net banking, Paytm, and other wallets.
- Hungama login uses phone number + OTP or email/password — if OTP is triggered, use `ask_user` to collect it.
- Hungama has a massive catalog of 10M+ songs across Bollywood, Indipop, devotional, and regional languages.
- Hungama Play (video) and Hungama Music are technically separate products but bundled under Gold.
- Free tier is heavily ad-supported with limited content — make sure user understands the premium benefits.
- Session may expire; if login wall appears mid-flow, stop and notify user to re-login in Chrome Debug.
- Use `confirm_action` for review, `collect_payment` for checkout. Always WAIT for user response.
