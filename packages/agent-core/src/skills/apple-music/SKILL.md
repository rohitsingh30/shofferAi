---
name: apple-music
description: Subscribe to Apple Music India. Individual, Student, and Family plans with lossless audio and spatial audio.
triggers:
  - apple music subscription
  - subscribe apple music
  - apple music plan
  - apple music india
  - buy apple music
  - apple music family
  - apple music student
  - apple music lossless
  - get apple music
  - apple music annual plan
siteUrl: https://music.apple.com
requiresAuth: true
params:
  - name: plan
    required: false
    hint: Preferred plan (e.g. "Individual", "Student", "Family")
  - name: duration
    required: false
    hint: Monthly (Apple Music India is monthly auto-renew)
---

# Apple Music India Subscription

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine which Apple Music plan the user wants. Available India plans (verify on site):
  - **Voice** — ~₹49/mo — Siri-only, Apple devices, no app browsing, ad-free
  - **Student** — ~₹49/mo — 1 device, requires student verification, full access, Apple TV+ included
  - **Individual** — ~₹99/mo — 1 device, full access, lossless audio, spatial audio, lyrics
  - **Family** — ~₹149/mo — up to 6 family members, full access, lossless, spatial audio
- If user is unsure, use `ask_user` (input_type "choice"):
  - "Voice — ₹49/mo — Siri-only, Apple devices"
  - "Student — ₹49/mo — Full access, requires student ID"
  - "Individual — ₹99/mo — Full access, lossless + spatial audio"
  - "Family — ₹149/mo — Up to 6 members, full access"
- Ask if user has Apple devices (iPhone, Mac, HomePod) — Apple Music is optimized for Apple ecosystem.
- For Student plan: user needs UNiDAYS verification with valid university enrollment.
- For Family plan: requires Apple ID Family Sharing setup.
- Clarify if new subscription or plan change.

### 2. Open Apple Music & Verify Login
- Open a NEW tab and navigate to `https://music.apple.com`.
- Take snapshot. Check if logged in with Apple ID (profile icon in top-right or account menu).
- If NOT logged in, login transparently with Apple ID. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- If already subscribed, navigate to account settings to view or change plan.

### 3. Navigate to Plan Selection
- Navigate to subscription page or `https://music.apple.com/subscribe` via account menu.
- Take snapshot of available plans with current India pricing.
- Verify current pricing on screen (Apple occasionally adjusts India pricing).
- Check for free trial availability — Apple Music typically offers 1-month free for new subscribers.
- If user has an active trial or subscription, show current status.
- If prices differ from discussed, present the actual on-screen plans.
- Use `ask_user` (input_type "choice") to confirm plan if not yet chosen.
- Select the chosen plan.

### 4. Review & Confirm
- Use `confirm_action` with subscription summary:
  - Plan name (Voice / Student / Individual / Family)
  - Monthly price
  - Number of accounts/members
  - Audio quality: lossless, Hi-Res Lossless, Spatial Audio with Dolby Atmos
  - Features: lyrics, music videos, radio, Apple TV+ (Student only)
  - Free trial: if applicable (1 month for new users)
  - Billing: monthly auto-renew
  - First charge date (after trial if applicable)
- Do NOT proceed unless user confirms.

### 5. Payment
- Use `collect_payment`:
  - summary: JSON with plan, price_monthly, members, audio_quality, features, trial_info
  - amount_inr: monthly plan price (or 0 if free trial)
  - description: "Apple Music India subscription"
- WAIT for payment confirmation from user.

### 6. Complete & Confirm
- Complete payment on Apple Music (Apple ID balance / credit card / debit card / UPI).
- Handle OTP or two-factor authentication via `ask_user` if needed.
- Take snapshot of subscription confirmation page.
- Report to user: plan activated, monthly price, number of members, audio features (lossless, spatial), free trial details (if any), next billing date, how to cancel.
- For Family plan: mention how to invite members via Apple Family Sharing in Settings.
- Mention: "You can cancel anytime from Apple ID Account settings or Settings > Subscriptions on your Apple device."

## Site Notes

- Apple Music is Apple's music streaming service with 100M+ songs, lossless audio, Spatial Audio with Dolby Atmos, and curated playlists.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in with Apple ID. Do NOT ask user for credentials.
- Apple Music India pricing is among the cheapest globally — Individual at ₹99/mo is significantly lower than the US price.
- Apple Music offers lossless and Hi-Res Lossless at no extra cost (included in all plans except Voice) — a major differentiator over competitors.
- Spatial Audio with Dolby Atmos works on compatible headphones (AirPods Pro, AirPods Max) — mention for users with these devices.
- Apple Music typically offers a 1-month free trial for new subscribers — always check and highlight this.
- Student plan includes Apple TV+ at no extra cost — excellent value for students.
- Voice plan is limited to Siri voice commands on Apple devices only — no app browsing. Clarify this limitation.
- Payment is through Apple ID billing — methods include credit/debit card, UPI (via Apple ID), and Apple ID balance (gift cards).
- Apple Music web player works on any browser, but the best experience is on Apple devices with the native Music app.
- Session may expire due to Apple ID security; if login wall appears, stop and notify user to re-login in Chrome Debug.
- Use `confirm_action` for review, `collect_payment` for checkout. Always WAIT for user response.
