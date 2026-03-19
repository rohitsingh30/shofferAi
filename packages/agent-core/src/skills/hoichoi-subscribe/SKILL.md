---
name: hoichoi-subscribe
description: Subscribe to Hoichoi. Bengali entertainment platform with originals, movies, web series, and classic films.
triggers:
  - hoichoi subscription
  - subscribe hoichoi
  - hoichoi plan
  - hoichoi premium
  - buy hoichoi
  - hoichoi bengali
  - hoichoi web series
  - hoichoi originals
  - get hoichoi
  - hoichoi annual plan
siteUrl: https://www.hoichoi.tv
requiresAuth: true
params:
  - name: plan
    required: false
    hint: Preferred plan (e.g. "Monthly", "Annual", "Super Annual")
  - name: duration
    required: false
    hint: Monthly or annual (e.g. "monthly", "yearly", "annual")
---

# Hoichoi Subscription

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine which Hoichoi plan the user wants. Available India plans (verify on site):
  - **Monthly** — ~₹49/mo — all content, ad-free, 2 devices
  - **Annual** — ~₹399/yr — all content, ad-free, 2 devices, best value
  - **Super Annual** — ~₹599/yr — all content, ad-free, 4 devices, offline downloads, 4K
- If user is unsure, use `ask_user` (input_type "choice"):
  - "Monthly — ~₹49/mo — All content, 2 devices"
  - "Annual — ~₹399/yr — All content, 2 devices, best value"
  - "Super Annual — ~₹599/yr — 4 devices, offline, 4K"
- Ask if user is primarily interested in Bengali web series, classic Bengali cinema, or Hoichoi originals.
- Clarify if new subscription or renewal/upgrade.
- Hoichoi sometimes offers a 7-day or 14-day free trial — check eligibility.

### 2. Open Hoichoi & Verify Login
- Open a NEW tab and navigate to `https://www.hoichoi.tv`.
- Take snapshot. Check if logged in (profile icon or name visible in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- If already subscribed, navigate to My Account or subscription management page.

### 3. Navigate to Plan Selection
- Navigate to subscription page: `https://www.hoichoi.tv/subscribe` or via profile menu.
- Take snapshot of available plans with current pricing.
- Verify current pricing on screen (Hoichoi may run promotional pricing around Durga Puja or Bengali New Year).
- If prices differ from discussed, present the actual on-screen plans to user.
- Use `ask_user` (input_type "choice") to confirm plan and duration if not yet chosen.
- Select the chosen plan on the page.

### 4. Review & Confirm
- Use `confirm_action` with subscription summary:
  - Plan name (Monthly / Annual / Super Annual)
  - Duration (monthly / annual)
  - Price
  - Number of devices / screens
  - Video quality (HD / 4K)
  - Offline downloads (Super Annual only)
  - Ad-free status
  - Free trial: if applicable
  - Billing: auto-renew date
- Do NOT proceed unless user confirms.

### 5. Payment
- Use `collect_payment`:
  - summary: JSON with plan, duration, price, devices, quality, offline_downloads, trial_info
  - amount_inr: subscription price (or 0 if free trial)
  - description: "Hoichoi subscription"
- WAIT for payment confirmation from user.

### 6. Complete & Confirm
- Enter payment method on Hoichoi (UPI / credit card / debit card / net banking / wallet).
- Handle OTP via `ask_user` if needed.
- Take snapshot of subscription confirmation page.
- Report to user: plan activated, price paid, validity period, number of devices, content highlights, next billing date, how to cancel.
- Mention: "You can manage or cancel your subscription from Hoichoi Account settings."

## Site Notes

- Hoichoi is the leading Bengali entertainment streaming platform with originals, classic Bengali cinema, web series, and music.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in to Hoichoi. Do NOT ask user for credentials.
- Hoichoi pricing is among the most affordable OTT platforms in India — starting at just ~₹49/month.
- Hoichoi runs promotional pricing around Bengali festivals (Durga Puja, Poila Boishakh) — always verify on-screen prices.
- Payment methods accepted: UPI, credit/debit card, net banking, Paytm, and other wallets.
- Hoichoi login uses phone number + OTP or email — if OTP is triggered, use `ask_user` to collect it.
- Hoichoi content is primarily in Bengali but some titles have Hindi and English subtitles — mention this for non-Bengali speakers.
- Hoichoi originals like Byomkesh, Manbhanjan, and Hello are popular — mention these if user is exploring the platform.
- Hoichoi also has a free tier with limited content and ads — user should know the difference between free and premium.
- Session may expire; if login wall appears mid-flow, stop and notify user to re-login in Chrome Debug.
- Use `confirm_action` for review, `collect_payment` for checkout. Always WAIT for user response.
