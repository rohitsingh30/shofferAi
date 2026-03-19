---
name: midjourney-subscribe
description: Subscribe to Midjourney AI art generation. Choose plan (Basic, Standard, Pro, Mega), pay, and start creating.
triggers:
  - midjourney subscription
  - subscribe midjourney
  - midjourney plan
  - buy midjourney
  - midjourney ai art
  - midjourney basic plan
  - midjourney pro plan
  - midjourney standard plan
  - get midjourney
  - midjourney mega plan
siteUrl: https://www.midjourney.com
requiresAuth: true
params:
  - name: plan
    required: false
    hint: Preferred plan — "Basic", "Standard", "Pro", or "Mega"
  - name: billing
    required: false
    hint: Billing cycle — "monthly" or "yearly" (yearly saves ~20%)
---

# Midjourney AI Art Subscription

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine which Midjourney plan the user wants via `ask_user` (input_type "choice"):
  - "Basic — $10/mo ($96/yr) — ~200 images/mo, 3 concurrent fast jobs"
  - "Standard — $30/mo ($288/yr) — 15hr fast GPU, unlimited relaxed, 3 concurrent fast jobs"
  - "Pro — $60/mo ($576/yr) — 30hr fast GPU, unlimited relaxed, 12 concurrent fast jobs, stealth mode"
  - "Mega — $120/mo ($1,152/yr) — 60hr fast GPU, unlimited relaxed, 12 concurrent fast jobs, stealth mode"
- Ask about billing preference via `ask_user` (input_type "choice"):
  - "Monthly billing"
  - "Yearly billing (save ~20%)"
- Explain key differences:
  - **Fast GPU**: High-priority image generation (seconds)
  - **Relaxed mode**: Lower priority, may take minutes but unlimited on Standard+
  - **Stealth mode**: Images not visible on Midjourney gallery (Pro+ only)
  - **Concurrent jobs**: How many images can be generated simultaneously

### 2. Open Midjourney & Verify Login
- Open a NEW tab and navigate to `https://www.midjourney.com`.
- Take snapshot. Check if logged in (profile icon or account name visible).
- If NOT logged in, login transparently via Discord SSO or email. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Midjourney may redirect to Discord for OAuth — handle the flow seamlessly.

### 3. Navigate to Subscription Page
- Navigate to `https://www.midjourney.com/account` or find the subscription/billing page.
- Take snapshot of current account status.
- Check if user already has an active subscription — if so, determine if this is an upgrade/downgrade.
- If new subscription: click "Subscribe" or "Get Started" button.
- Take snapshot of plan selection page.
- Verify current pricing (may differ from listed above — always use on-screen prices).

### 4. Select Plan & Review
- Select the user's chosen plan and billing cycle.
- Take snapshot of the checkout page.
- Use `confirm_action` with subscription summary:
  - Plan name (Basic / Standard / Pro / Mega)
  - Price per month/year in USD and approximate INR
  - Fast GPU hours included
  - Relaxed mode (unlimited for Standard+, not available on Basic)
  - Concurrent fast jobs
  - Stealth mode availability
  - Commercial usage rights (all paid plans include commercial license)
  - Billing cycle and next charge date
  - Forex note: "Charged in USD — bank will apply forex conversion"
- Do NOT proceed unless user confirms.

### 5. Payment
- Use `collect_payment`:
  - summary: JSON with plan, price_usd, price_inr_approx, billing_cycle, fast_gpu_hours, features
  - amount_inr: approximate INR equivalent of the USD price
  - description: "Midjourney AI subscription"
- WAIT for payment confirmation from user.

### 6. Complete & Confirm
- On the Midjourney checkout page, enter payment details (credit/debit card via Stripe).
- Handle OTP via `ask_user` if needed (international transaction OTP).
- Take snapshot of subscription confirmation page.
- Report to user:
  - Plan activated
  - Monthly/yearly charge in USD (approximate INR)
  - Fast GPU hours available
  - How to start: Use `/imagine` on midjourney.com or in Discord
  - How to manage: midjourney.com/account
  - How to cancel: Account → Subscription → Cancel
- Mention: "Cancellation takes effect at end of billing period. No partial refunds."

### 7. Verify Access
- Navigate to the Midjourney creation page.
- Take snapshot confirming active subscription badge and available fast hours.
- Confirm to user that all plan features are active and ready to use.

## Site Notes

- Midjourney is the leading AI image generation platform — known for high-quality, artistic outputs.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in to Midjourney (via Discord or email). Do NOT ask user for credentials.
- Midjourney bills in USD — Indian credit/debit cards incur forex markup (1.5-3.5% depending on bank).
- Midjourney accepts only credit/debit cards via Stripe — no UPI, no wallets, no net banking. Card must support international transactions.
- Yearly billing saves approximately 20% compared to monthly — recommend for committed users.
- All paid plans include commercial usage rights — images can be used for business, marketing, products, etc.
- Stealth mode (Pro/Mega only) keeps images private — without it, all generations are public on the Midjourney gallery.
- Midjourney previously required Discord — the web app (midjourney.com) now works independently, though Discord remains an option.
- Fast GPU hours reset monthly on the billing date — unused hours do not roll over.
- Relaxed mode on Standard+ is unlimited but slower (minutes instead of seconds) — great for bulk generation.
- If the user's bank blocks the international charge, suggest enabling international transactions or trying a different card.
- Use `confirm_action` for review, `collect_payment` for checkout. Always WAIT for user response.
