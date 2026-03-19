---
name: scribd-subscribe
description: Subscribe to Scribd — unlimited access to ebooks, audiobooks, magazines, documents, podcasts, and sheet music for a monthly fee.
triggers:
  - scribd subscribe
  - subscribe scribd
  - scribd membership
  - scribd plan
  - buy scribd
  - scribd ebooks
  - scribd audiobooks
  - scribd unlimited
  - join scribd
  - scribd subscription india
siteUrl: https://www.scribd.com
requiresAuth: true
params:
  - name: plan
    required: false
    hint: Plan preference (Scribd is typically monthly at $11.99/mo or local equivalent)
  - name: trial
    required: false
    hint: Whether to start with free trial if available (yes/no)
---

# Scribd Subscription

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Explain Scribd to user briefly:
  - **All-in-one library** — ebooks, audiobooks, magazines, documents, podcasts, sheet music.
  - **Unlimited access** — read/listen as much as you want (some titles have monthly limits).
  - **Cross-platform** — works on web, iOS, Android, Kindle Fire.
- Determine if this is a new subscription or reactivation.
- Check if user is eligible for a free trial (30-day or 60-day trial sometimes offered).
- Ask if user wants to start with the trial via `ask_user` (input_type "choice"):
  - "Start with free trial (auto-renews after trial period)"
  - "Subscribe directly (no trial)"
- Inform user about pricing — Scribd charges in USD ($11.99/mo) or local currency equivalent.
- Use `ask_user` to confirm user is okay with the pricing.

### 2. Open Scribd & Verify Login
- Open a NEW tab and navigate to `https://www.scribd.com`.
- Take snapshot. Check if logged in (profile avatar or username in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Dismiss any pop-ups, promotional overlays, or cookie consent banners.

### 3. Navigate to Subscription Page
- Navigate to `https://www.scribd.com/subscribe` or the pricing/plan page.
- Take snapshot of subscription page.
- Verify current pricing and plan details:
  - Monthly price (in USD or INR equivalent)
  - What is included (ebooks, audiobooks, magazines, etc.)
  - Trial period and terms
  - Any promotional offers or discounts
- If pricing differs from what was discussed, inform user of actual price.
- If already subscribed, check account status and inform user.

### 4. Select Plan & Configure
- Select the subscription plan (Scribd typically has one plan).
- If free trial is available and user wants it, select the trial option.
- Take snapshot of plan selection.
- Enter any required account details.
- Take snapshot showing the plan ready for checkout.

### 5. Review & Confirm
- Use `confirm_action` with subscription summary:
  - Plan: Scribd Unlimited
  - Price: $11.99/mo (or ₹ equivalent shown)
  - Free trial: X days (if applicable)
  - Access: ebooks, audiobooks, magazines, documents, podcasts, sheet music
  - Devices: web, iOS, Android, Kindle Fire
  - Auto-renewal: yes, monthly
  - First charge date: after trial ends or immediately
  - Cancellation: anytime, no penalty
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Payment
- Use `collect_payment`:
  - summary: JSON with plan, price_monthly, currency, free_trial_days, first_charge_date, auto_renewal
  - amount_inr: approximate INR equivalent of monthly fee (0 if free trial)
  - description: "Scribd subscription"
- STOP and WAIT for payment confirmation.

### 7. Complete Subscription & Confirm
- Enter payment details on Scribd (credit card / international debit card).
- Handle OTP via `ask_user` if needed.
- Take snapshot of subscription confirmation page.
- Report to user: plan activated, price, trial end date (if trial), next billing date, what is included.
- Mention: "You can start reading/listening immediately. Download the Scribd app for offline access. Cancel anytime from Account Settings."
- Suggest popular categories: bestselling ebooks, top audiobooks, trending magazines.

## Site Notes

- Scribd is a global digital library with millions of titles — ebooks, audiobooks, magazines, documents, podcasts, and sheet music.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in to Scribd. Do NOT ask user for credentials.
- Scribd charges in USD ($11.99/mo) — Indian users need an international credit/debit card or PayPal.
- Free trial is 30 days for new users (sometimes 60 days with promotions) — always check current offer.
- Scribd has a "throttling" system — if you read too many premium titles in a month, some may become temporarily unavailable.
- Downloaded content for offline reading is available in the Scribd mobile app.
- Scribd includes Everand (formerly Scribd's ebook/audiobook brand) — same subscription covers both.
- Magazine access includes current and back issues from hundreds of publications.
- Document section includes academic papers, research, legal documents — unique to Scribd.
- Use `confirm_action` for subscription review, `collect_payment` for checkout. Always WAIT for user response.
