---
name: youtube-premium
description: Subscribe to YouTube Premium India — choose individual or family plan, ad-free videos and music, pay.
triggers:
  - youtube premium
  - subscribe youtube premium
  - youtube premium subscription
  - youtube ad free
  - youtube music premium
  - buy youtube premium
  - youtube premium india
  - yt premium
siteUrl: https://www.youtube.com/premium
requiresAuth: true
params:
  - name: plan
    required: false
    hint: Plan preference (e.g. "individual", "family", "student")
  - name: billing
    required: false
    hint: Billing preference (e.g. "monthly", "yearly", "prepaid")
---

# YouTube Premium Subscription

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Subscription Preferences
- Ask user which plan they want if not specified.
- Get: plan type (individual/family/student), billing cycle preference.
- Use `ask_user` (input_type "choice") if not specified:
  "Individual — ₹149/month", "Family (up to 5 members) — ₹189/month", "Student — ₹79/month"

### 2. Open YouTube Premium
- Open a NEW tab and navigate to `https://www.youtube.com/premium`.
- Take snapshot. Verify logged in (profile avatar in top-right).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Check if user already has an active subscription. If yes, inform and ask if they want to upgrade/change.

### 3. Review Available Plans
- Take snapshot of the Premium plans page.
- Extract all available plans with pricing:
  - Individual Monthly, Individual Annual (if available)
  - Family Monthly (up to 5 members, same household)
  - Student Monthly (requires verification)
- Check for any free trial offers (typically 1-2 months free for new subscribers).
- Present via `ask_user` (input_type "choice") if user hasn't already chosen.

### 4. Select Plan & Review Benefits
- Click the chosen plan. Take snapshot.
- Summarize benefits:
  - Ad-free videos on YouTube
  - Background play (mobile)
  - YouTube Music Premium included
  - Offline downloads
  - YouTube Originals access
- If free trial available, mention: "First month free, then ₹149/month"
- If family plan, explain: members must be in same household, each gets their own account.
- If student plan, explain: requires annual verification via SheerID.

### 5. Confirm Subscription
- Take snapshot of the payment/checkout page.
- Use `confirm_action`:
  - Plan selected (Individual/Family/Student)
  - Monthly or annual billing
  - Price per billing cycle
  - Free trial period (if any)
  - Benefits included
  - Auto-renewal notice
  - Cancellation policy
- Do NOT proceed unless user confirms.

### 6. Payment
- Use `collect_payment`:
  - summary: JSON with plan, billing_cycle, price, trial_period, benefits
  - amount_inr: amount for first billing cycle (or 0 if free trial)
  - description: "YouTube Premium subscription"
- WAIT for payment confirmation.

### 7. Complete & Confirm
- Complete the subscription on YouTube. Handle payment OTP via `ask_user` if needed.
- Take snapshot of subscription confirmation page.
- Report: plan name, price, billing cycle, next billing date, trial end date (if applicable).
- Mention: "YouTube Premium is now active! Ad-free videos start immediately. YouTube Music Premium is also included — download the YouTube Music app for ad-free music streaming."
- If family plan: "You can add family members from Settings → Paid memberships → Manage family membership."

## Site Notes

- YouTube Premium India pricing: Individual ₹149/month, Family ₹189/month, Student ₹79/month (as of 2025).
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. Google login is used — OTP goes to operator's phone.
- Free trial (1-2 months) is usually available for first-time subscribers — always check and mention.
- YouTube Music Premium is included with YouTube Premium — no need to subscribe separately.
- Student plan requires SheerID verification — user needs a valid university email or student ID.
- Family plan requires all members to be in the same country and set up a Google family group.
- Annual plans (if available) offer ~16% savings over monthly — recommend if user plans long-term.
- Auto-renewal is ON by default — inform user about cancellation process if needed.
- If user already has a subscription, upgrading (e.g., Individual to Family) is possible mid-cycle.
- Payment methods: UPI, credit/debit card, net banking, Google Play balance.
- Use `confirm_action` for subscription review, `collect_payment` for checkout. WAIT for user response at each step.
