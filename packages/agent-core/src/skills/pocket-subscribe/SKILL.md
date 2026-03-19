---
name: pocket-subscribe
description: Subscribe to Pocket Premium — save articles, videos, and web pages to read later with permanent library, full-text search, and ad-free reading.
triggers:
  - pocket premium subscribe
  - subscribe pocket
  - pocket premium plan
  - buy pocket premium
  - pocket subscription
  - pocket app premium
  - getpocket subscribe
  - pocket save articles
  - pocket read later premium
  - pocket unlimited
siteUrl: https://getpocket.com/premium
requiresAuth: true
params:
  - name: plan
    required: false
    hint: Plan preference (e.g. "monthly" at $4.99/mo or "annual" at $44.99/yr)
  - name: trial
    required: false
    hint: Whether to start with free trial if available (yes/no)
---

# Pocket Premium Subscription

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Explain Pocket Premium benefits to user:
  - **Permanent library** — saved articles are preserved forever, even if the original page goes offline.
  - **Full-text search** — search across all saved articles by content, not just title.
  - **Suggested tags** — automatic tagging for better organization.
  - **Ad-free reading** — clean, distraction-free reading experience.
  - **Unlimited highlights** — highlight and annotate saved articles.
  - **Premium fonts** — enhanced typography for comfortable reading.
- Ask preferred billing cycle via `ask_user` (input_type "choice"):
  - "Monthly — $4.99/mo"
  - "Annual — $44.99/yr (save 25%)"
- Note: Pricing is in USD. Verify on-screen pricing as it may vary.
- Determine if this is a new subscription, upgrade from free, or reactivation.
- Check if user already has a Pocket account (free tier).

### 2. Open Pocket & Verify Login
- Open a NEW tab and navigate to `https://getpocket.com/premium`.
- Take snapshot. Check if logged in (profile icon or username in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Pocket uses Mozilla/Firefox accounts for login — handle accordingly.
- Dismiss any pop-ups or promotional banners.

### 3. Navigate to Premium Page
- Take snapshot of Pocket Premium landing page.
- Verify current pricing and features:
  - Monthly price
  - Annual price and savings percentage
  - Feature comparison: Free vs Premium
  - Any promotional offers or discounts
- If user is already on Premium, check subscription status and inform user.
- If there is a free trial offer, inform user and ask if they want to try it first.
- Take snapshot showing plan options.

### 4. Select Plan
- Select the chosen billing cycle (monthly or annual).
- Take snapshot of plan selection / checkout page.
- If Pocket offers a trial period, toggle trial on/off based on user preference.
- Review the total amount to be charged.

### 5. Review & Confirm
- Use `confirm_action` with subscription summary:
  - Plan: Pocket Premium
  - Billing: monthly ($4.99/mo) or annual ($44.99/yr)
  - Features: permanent library, full-text search, suggested tags, ad-free, unlimited highlights, premium fonts
  - Free trial: X days (if applicable)
  - Auto-renewal: yes
  - First charge date
  - Cancellation: anytime, keeps saved articles
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Payment
- Use `collect_payment`:
  - summary: JSON with plan, billing_cycle, price, currency, free_trial, features_list, auto_renewal
  - amount_inr: approximate INR equivalent of the plan price
  - description: "Pocket Premium subscription"
- STOP and WAIT for payment confirmation.

### 7. Complete Subscription & Confirm
- Enter payment details on Pocket (credit card / PayPal).
- Handle OTP via `ask_user` if needed.
- Take snapshot of subscription confirmation page.
- Report to user: plan activated, price, billing cycle, next billing date, key features unlocked.
- Mention: "You can now use full-text search, permanent library, and ad-free reading. Install the Pocket browser extension and mobile app for the best experience."
- Suggest: "Save your first article by clicking the Pocket icon in your browser or sharing to Pocket from any app."

## Site Notes

- Pocket (by Mozilla) is the leading read-it-later app — save articles, videos, and web pages for offline reading.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in to Pocket. Do NOT ask user for credentials.
- Pocket uses Mozilla/Firefox accounts — the operator profile should have a linked Mozilla account.
- Pricing is in USD — Indian users need an international credit/debit card or PayPal.
- Pocket free tier allows unlimited saving but lacks full-text search, permanent library, and suggested tags.
- Pocket Premium's "permanent library" is a killer feature — articles are preserved even if the source website goes down.
- The Pocket browser extension (Chrome, Firefox, Safari) makes saving articles one-click easy.
- Pocket's "Best Of" recommendations surface high-quality articles based on user interests.
- Annual plan saves approximately 25% compared to monthly — recommend for committed users.
- Pocket was acquired by Mozilla in 2017 and integrates deeply with Firefox browser.
- Use `confirm_action` for subscription review, `collect_payment` for checkout. Always WAIT for user response.
