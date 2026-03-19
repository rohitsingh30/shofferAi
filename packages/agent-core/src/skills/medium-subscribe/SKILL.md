---
name: medium-subscribe
description: Subscribe to Medium membership — unlimited access to all articles, stories, and publications from writers and experts worldwide.
triggers:
  - medium subscribe
  - subscribe medium
  - medium membership
  - medium premium
  - buy medium membership
  - medium unlimited articles
  - join medium
  - medium plan
  - medium paywall
  - medium subscription india
siteUrl: https://medium.com/plans
requiresAuth: true
params:
  - name: plan
    required: false
    hint: Plan preference (e.g. "monthly" at $5/mo or "annual" at $50/yr)
  - name: trial
    required: false
    hint: Whether to start with free trial if available (yes/no)
  - name: friend_link
    required: false
    hint: Referral or friend link for discounted membership (if any)
---

# Medium Membership Subscription

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Explain Medium membership benefits to user:
  - **Unlimited reading** — access all paywalled articles across Medium.
  - **Member-only stories** — exclusive content from top writers and publications.
  - **Audio narrations** — listen to articles read aloud.
  - **Offline reading** — download articles in the Medium app.
  - **Support writers** — part of membership fee goes directly to writers you read.
  - **No ads** — clean reading experience.
  - **Custom app icon** — personalized Medium app icon (cosmetic perk).
- Ask preferred billing cycle via `ask_user` (input_type "choice"):
  - "Monthly — $5/mo"
  - "Annual — $50/yr (save 17%)"
- Note: Pricing is in USD. Verify on-screen pricing as it may differ.
- Determine if user already has a Medium account (free tier) or is new.
- Check if user has a referral/friend link for a discount.

### 2. Open Medium & Verify Login
- Open a NEW tab and navigate to `https://medium.com`.
- Take snapshot. Check if logged in (profile avatar in top-right corner).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Medium supports Google, Facebook, Apple, Twitter, and email login — use appropriate method.
- Dismiss any pop-ups, sign-up modals, or notification prompts.

### 3. Navigate to Membership Page
- Navigate to `https://medium.com/plans` or click "Upgrade" / "Get unlimited access".
- Take snapshot of membership plans page.
- Verify current pricing:
  - Monthly plan price
  - Annual plan price and savings
  - Any promotional offers or discounted first month
- If friend/referral link was provided, navigate to that link instead for discounted pricing.
- If already a member, check membership status and inform user.
- Take snapshot showing available plans.

### 4. Select Plan
- Select the chosen billing cycle (monthly or annual).
- If a promotional offer is available (e.g. first month at $1), highlight it to user.
- Take snapshot of plan selection / checkout page.
- Review the total to be charged.

### 5. Review & Confirm
- Use `confirm_action` with membership summary:
  - Plan: Medium Membership
  - Billing: monthly ($5/mo) or annual ($50/yr)
  - Features: unlimited articles, member-only stories, audio narrations, offline reading, support writers
  - Promotional pricing: (if applicable, e.g. "$1 for first month")
  - Auto-renewal: yes
  - First charge: amount and date
  - Cancellation: anytime, access until end of billing period
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Payment
- Use `collect_payment`:
  - summary: JSON with plan, billing_cycle, price, currency, promotional_offer, auto_renewal, features
  - amount_inr: approximate INR equivalent of the plan price
  - description: "Medium membership subscription"
- STOP and WAIT for payment confirmation.

### 7. Complete Subscription & Confirm
- Enter payment details on Medium (credit card / debit card / Google Pay / Apple Pay).
- Handle OTP via `ask_user` if needed.
- Take snapshot of membership confirmation page.
- Report to user: membership activated, price, billing cycle, next billing date, features unlocked.
- Mention: "You now have unlimited access to all Medium articles. Your reads also directly support the writers. Cancel anytime from Settings → Membership."
- Suggest: "Follow your favorite publications and writers for a personalized feed. Try the Medium app for offline reading."

## Site Notes

- Medium is the world's largest platform for thoughtful long-form content — tech, science, business, culture, self-improvement, and more.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in to Medium. Do NOT ask user for credentials.
- Medium charges in USD — Indian users need an international credit/debit card, Google Pay, or Apple Pay.
- Free Medium accounts get limited access (3 paywalled articles per month) — membership removes this limit.
- Medium frequently offers promotional pricing — "$1 for first month" or "4 months for $20" — always check for active offers.
- Part of the membership fee is distributed to writers based on reading time — this is Medium's Partner Program.
- Medium membership also unlocks the Medium app's offline reading and audio narration features.
- Annual plan saves approximately 17% compared to monthly — recommend for regular readers.
- Medium does not offer a family or team plan — each membership is individual.
- Some publications on Medium are free (no paywall) — membership is only needed for paywalled content.
- Use `confirm_action` for subscription review, `collect_payment` for checkout. Always WAIT for user response.
