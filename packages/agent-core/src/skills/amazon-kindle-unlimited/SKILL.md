---
name: amazon-kindle-unlimited
description: Subscribe to Kindle Unlimited India on Amazon — unlimited reading from 2M+ ebooks, audiobooks, and magazines for a monthly fee.
triggers:
  - kindle unlimited subscribe
  - subscribe kindle unlimited
  - amazon kindle unlimited
  - kindle unlimited india
  - buy kindle unlimited
  - kindle unlimited plan
  - unlimited reading amazon
  - kindle subscription
  - amazon ebook subscription
  - kindle unlimited membership
siteUrl: https://www.amazon.in/kindle-dbs/hz/subscribe/ku
requiresAuth: true
params:
  - name: plan
    required: false
    hint: Plan preference (e.g. "monthly", "3 months", "6 months", "12 months")
  - name: trial
    required: false
    hint: Whether to start with free trial if available (yes/no)
---

# Kindle Unlimited India Subscription

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine if user wants to subscribe fresh or is renewing.
- Explain Kindle Unlimited briefly:
  - **Unlimited reading** from 2M+ titles — ebooks, audiobooks, magazines.
  - Read on any device — Kindle, phone, tablet, PC.
  - Borrow up to 20 titles at a time, return and borrow more anytime.
- Ask preferred plan duration via `ask_user` (input_type "choice"):
  - "1 month — ₹169/mo"
  - "3 months — ₹449 (₹150/mo)"
  - "6 months — ₹849 (₹142/mo)"
  - "12 months — ₹1499 (₹125/mo)"
- Note: Pricing may vary. Always verify on-screen prices.
- Check if user is eligible for a free trial (30-day trial for first-time subscribers).
- If user wants the trial, confirm they understand it auto-renews after 30 days.

### 2. Open Amazon Kindle Unlimited & Verify Login
- Open a NEW tab and navigate to `https://www.amazon.in/kindle-dbs/hz/subscribe/ku`.
- Take snapshot. Verify logged in (greeting "Hello, [name]" in top bar).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Dismiss any app-install banners or notification prompts.

### 3. Navigate to Plan Selection
- Take snapshot of Kindle Unlimited landing/subscription page.
- Check if free trial is available (banner usually shows "Start your 30-day free trial").
- Verify current pricing for all plan options — use what is shown on screen.
- If already subscribed, check subscription status and offer plan change or renewal.
- If pricing differs from what was discussed, inform user of actual prices.
- Select the chosen plan (or free trial if applicable).
- Take snapshot of selected plan.

### 4. Review Subscription Details
- Take snapshot of the subscription review page.
- Use `confirm_action` with subscription summary:
  - Plan: Kindle Unlimited (duration)
  - Price: ₹X,XXX (or "Free for 30 days, then ₹169/mo")
  - Access: 2M+ ebooks, audiobooks, magazines
  - Devices: unlimited (Kindle, phone, tablet, PC)
  - Borrow limit: 20 titles at a time
  - Auto-renewal: yes, monthly/annual
  - Cancellation: anytime, no penalty
  - First charge date
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 5. Payment
- Use `collect_payment`:
  - summary: JSON with plan, duration, price, auto_renewal, first_charge_date, includes_trial
  - amount_inr: plan price (0 if free trial)
  - description: "Amazon Kindle Unlimited subscription"
- STOP and WAIT for payment confirmation.
- If free trial with ₹0, still confirm with user before proceeding.

### 6. Complete Subscription & Confirm
- Add/confirm payment method on Amazon (credit card / debit card / UPI for auto-pay).
- Handle OTP via `ask_user` if needed.
- Take snapshot of subscription confirmation page.
- Report to user: plan activated, price, next billing date, number of titles available, how to browse.
- Mention: "You can start reading immediately. Browse Kindle Unlimited titles at amazon.in/kindle-unlimited. Cancel anytime from Amazon → Your Memberships."
- Suggest: "Download the Kindle app on your phone for the best reading experience."

## Site Notes

- Kindle Unlimited India offers 2M+ titles including Indian language books (Hindi, Tamil, Telugu, Marathi, etc.).
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in to Amazon. Do NOT ask user for credentials.
- Kindle Unlimited pricing in India starts at ₹169/mo — significantly cheaper than global pricing.
- Free 30-day trial is typically available for first-time subscribers — always check eligibility.
- Auto-renewal is enabled by default — remind user they can cancel anytime from account settings.
- Kindle Unlimited is different from Prime Reading (included with Prime) — KU has a much larger catalog.
- No Kindle device required — the Kindle app works on iOS, Android, PC, and Mac.
- Users can borrow up to 20 titles simultaneously and must return one to borrow a new one.
- Some popular titles and new releases may NOT be in Kindle Unlimited — manage expectations.
- Use `confirm_action` for subscription review, `collect_payment` for checkout. Always WAIT for user response.
