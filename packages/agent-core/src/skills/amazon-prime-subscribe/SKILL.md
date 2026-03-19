---
name: amazon-prime-subscribe
description: Subscribe to Amazon Prime India. Choose annual or monthly plan, pay and activate.
triggers:
  - amazon prime subscription
  - subscribe amazon prime
  - amazon prime plan
  - buy amazon prime
  - amazon prime india
  - get amazon prime
  - amazon prime monthly
  - amazon prime annual
  - amazon prime video
  - join amazon prime
siteUrl: https://www.amazon.in
requiresAuth: true
params:
  - name: duration
    required: false
    hint: Monthly or annual (e.g. "monthly", "annual", "yearly")
  - name: plan_type
    required: false
    hint: Regular Prime or Prime Lite (if available)
---

# Amazon Prime India Subscription

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine plan preference. Available Amazon Prime India plans (verify on site):
  - **Prime Monthly** — ₹299/mo — Full Prime benefits
  - **Prime Annual** — ₹1499/yr — Full Prime benefits (saves ~₹2100 vs monthly)
  - **Prime Lite** — ₹999/yr — Limited benefits (no free delivery on some items, ads on Prime Video)
- If user is unsure, use `ask_user` (input_type "choice"):
  - "Prime Monthly — ₹299/mo — Full benefits, flexible"
  - "Prime Annual — ₹1499/yr — Full benefits, best value (saves ₹2100/yr)"
  - "Prime Lite — ₹999/yr — Budget option, limited benefits"
- Clarify if new subscription, renewal, or upgrade from Lite to full Prime.
- Mention key benefits: free delivery, Prime Video, Prime Music, Prime Reading, Prime Gaming.

### 2. Open Amazon & Verify Login
- Open a NEW tab and navigate to `https://www.amazon.in`.
- Take snapshot. Check if logged in (account name visible in top bar: "Hello, [Name]").
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Navigate to Prime Subscription
- Navigate to `https://www.amazon.in/prime` or click "Prime" link in the top bar.
- Take snapshot of Prime membership page.
- Verify current pricing on screen (Amazon occasionally adjusts pricing).
- Check if user is already a Prime member:
  - If yes: show current plan, expiry date, and option to change/renew.
  - If no: show available plans.
- If there's a free trial available (30 days for new members), mention it.
- Use `ask_user` (input_type "choice") to confirm plan and duration.

### 4. Review & Confirm
- Use `confirm_action` with subscription summary:
  - Plan type (Monthly / Annual / Lite)
  - Price
  - Key benefits included:
    - Free delivery (eligible items)
    - Prime Video (movies, series, live sports)
    - Prime Music (ad-free streaming)
    - Prime Reading (free ebooks)
    - Early access to Lightning Deals
  - Free trial period (if applicable)
  - Billing: auto-renew date
  - First charge date
- Do NOT proceed unless user confirms.

### 5. Payment
- Use `collect_payment`:
  - summary: JSON with plan_type, duration, price, benefits, trial_info
  - amount_inr: subscription price
  - description: "Amazon Prime India subscription"
- WAIT for payment confirmation from user.

### 6. Complete & Confirm
- Complete payment on Amazon (UPI / credit card / debit card / net banking / Amazon Pay).
- Handle OTP via `ask_user` if needed.
- Take snapshot of Prime activation confirmation page.
- Report to user: Prime activated, plan type, price paid, validity period, next billing date, key benefits now active.
- Mention: "You can manage or cancel from Amazon Account → Prime Membership. Cancel anytime, pro-rata refund available."

## Site Notes

- Amazon Prime India is one of the most popular subscription services — covers shopping, video, music, and gaming.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in to Amazon. Do NOT ask user for credentials.
- Amazon Prime pricing may change — always verify on-screen, never assume prices.
- Amazon frequently offers free 30-day trial for new Prime members — check and highlight this.
- Prime Lite is a budget tier unique to India — has ads on Prime Video and limited free delivery.
- Annual plan saves significantly over monthly — recommend annual unless user prefers flexibility.
- Amazon Pay balance can be used for Prime subscription — check if balance is available.
- Prime Video includes live cricket (some matches), Amazon Originals, and licensed content.
- Student discount may be available (Amazon Prime Student) — ask if user is a student.
- If user already has Prime, this could be a renewal or plan change — check current membership status first.
- Session on Amazon tends to last long but may expire after weeks — if login wall appears, stop and notify user.
- Use `confirm_action` for review, `collect_payment` for checkout. Always WAIT for user response.
