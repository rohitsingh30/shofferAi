---
name: spotify-subscribe
description: Subscribe to Spotify Premium India. Choose plan (Individual, Duo, Family, Student), pay and activate.
triggers:
  - spotify subscription
  - subscribe spotify
  - spotify premium
  - spotify plan
  - buy spotify
  - spotify family plan
  - spotify duo plan
  - spotify student plan
  - get spotify premium
  - spotify india plan
siteUrl: https://www.spotify.com
requiresAuth: true
params:
  - name: plan
    required: false
    hint: Preferred plan (e.g. "Individual", "Duo", "Family", "Student")
  - name: duration
    required: false
    hint: Monthly or annual if available (default monthly)
---

# Spotify Premium India Subscription

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine which Spotify Premium plan the user wants. Available India plans (verify on site):
  - **Mini** — ₹7/day or ₹25/week — 1 device, ad-free, no offline, phone only
  - **Individual** — ₹119/mo — 1 account, ad-free, offline downloads, all devices
  - **Duo** — ₹149/mo — 2 accounts, ad-free, offline, separate playlists
  - **Family** — ₹179/mo — 6 accounts, ad-free, offline, parental controls, Spotify Kids
  - **Student** — ₹59/mo — 1 account, requires student verification, ad-free, offline
- If user is unsure, use `ask_user` (input_type "choice"):
  - "Individual — ₹119/mo — 1 account, ad-free, offline"
  - "Duo — ₹149/mo — 2 accounts, for couples"
  - "Family — ₹179/mo — 6 accounts, Spotify Kids"
  - "Student — ₹59/mo — requires student ID"
- For Family/Duo: note that all members must live at the same address.
- For Student: user needs a valid university email or SheerID verification.

### 2. Open Spotify & Verify Login
- Open a NEW tab and navigate to `https://www.spotify.com`.
- Take snapshot. Check if logged in (profile name/icon in top-right corner).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Navigate to Plan Selection
- Navigate to `https://www.spotify.com/in/premium/` for plan overview.
- Or go to Account → Subscription → Manage for existing users.
- Take snapshot of plan selection page.
- Verify current India pricing on screen (prices may differ from listed above).
- If user already has Premium, check current plan and determine if upgrade/downgrade.
- Use `ask_user` (input_type "choice") to confirm plan if not yet chosen.
- Click on the chosen plan's "Get Premium" or "Change plan" button.

### 4. Review & Confirm
- Use `confirm_action` with subscription summary:
  - Plan name (Mini / Individual / Duo / Family / Student)
  - Monthly price
  - Number of accounts included
  - Features: ad-free, offline downloads, audio quality
  - Any free trial period (Spotify often offers 1-month free for new Premium users)
  - Billing: monthly auto-renew
  - First charge date (or free trial end date)
- Do NOT proceed unless user confirms.

### 5. Payment
- Use `collect_payment`:
  - summary: JSON with plan, price_monthly, accounts, features, trial_info
  - amount_inr: monthly plan price (or 0 if free trial)
  - description: "Spotify Premium India subscription"
- WAIT for payment confirmation from user.

### 6. Complete & Confirm
- Enter payment method on Spotify (UPI / credit card / debit card).
- Handle OTP via `ask_user` if needed.
- Take snapshot of subscription confirmation page.
- Report to user: plan activated, monthly price, number of accounts, free trial details (if any), next billing date, how to cancel.
- For Family plan: mention how to invite family members via Spotify Family hub.
- Mention: "You can cancel anytime from Spotify Account settings. No cancellation fee."

## Site Notes

- Spotify is the world's largest music streaming platform — India pricing is among the lowest globally.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in to Spotify. Do NOT ask user for credentials.
- Spotify India plans and pricing may change — always verify on-screen, never hardcode prices.
- Spotify frequently offers free trial (1 month) for new Premium users — check and highlight this.
- Mini plan is unique to India — great for users who only want short-term ad-free on phone.
- Student plan requires SheerID verification (university name + student ID) — this may take a few minutes.
- Family plan requires all members at the same address — Spotify verifies via GPS periodically.
- Duo plan includes "Duo Mix" — a shared playlist — mention as a perk for couples.
- Payment methods in India: UPI, credit/debit card. No wallet or net banking on Spotify.
- Spotify does NOT offer annual plans in India — all plans are monthly auto-renew (except Mini daily/weekly).
- If user has a free Spotify account, upgrading preserves all playlists and listening history.
- Use `confirm_action` for review, `collect_payment` for checkout. Always WAIT for user response.
