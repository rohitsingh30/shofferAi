---
name: sony-liv-subscribe
description: Subscribe to Sony LIV India. Sports (cricket, football, WWE), shows, movies, and originals.
triggers:
  - sonyliv subscription
  - subscribe sonyliv
  - sony liv plan
  - sony liv premium
  - buy sonyliv
  - sonyliv sports
  - sony liv cricket
  - sony liv wwe
  - get sonyliv
  - sony liv annual plan
siteUrl: https://www.sonyliv.com
requiresAuth: true
params:
  - name: plan
    required: false
    hint: Preferred plan (e.g. "Mobile", "LIV Premium", "LIV Premium Annual")
  - name: duration
    required: false
    hint: Monthly or annual (e.g. "monthly", "yearly", "annual")
---

# Sony LIV India Subscription

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine which Sony LIV plan the user wants. Available India plans (verify on site):
  - **Mobile Only** — ~₹599/yr — 1 device, phone/tablet only, 720p
  - **LIV Premium** — ~₹699/6-months or ~₹999/yr — 2 devices, Full HD, all content
  - **LIV Premium Annual** — ~₹999/yr — best value, all sports + originals + movies
- If user is unsure, use `ask_user` (input_type "choice"):
  - "Mobile Only — ~₹599/yr — Phone/tablet only, 720p"
  - "LIV Premium — ~₹699/6-months — 2 devices, Full HD"
  - "LIV Premium Annual — ~₹999/yr — All content, best value"
- Ask if user primarily wants sports (cricket, football, WWE) or entertainment (originals, movies).
- Clarify if new subscription or renewal/upgrade.

### 2. Open Sony LIV & Verify Login
- Open a NEW tab and navigate to `https://www.sonyliv.com`.
- Take snapshot. Check if logged in (profile icon or name visible in top-right).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- If already subscribed, navigate to account/subscription page to check current plan.

### 3. Navigate to Plan Selection
- Navigate to subscription page via profile menu or `https://www.sonyliv.com/upgrade`.
- Take snapshot of available plans with current pricing.
- Verify current pricing on screen (Sony LIV changes pricing frequently, especially around sports seasons).
- If prices differ from discussed, present the actual on-screen plans to user.
- Use `ask_user` (input_type "choice") to confirm plan and duration if not yet chosen.
- Select the chosen plan on the page.

### 4. Review & Confirm
- Use `confirm_action` with subscription summary:
  - Plan name (Mobile Only / LIV Premium / LIV Premium Annual)
  - Duration (6 months / annual)
  - Price
  - Number of devices / screens
  - Video quality (720p / Full HD)
  - Content access: sports (cricket, football, WWE, UFC), originals, movies, TV shows
  - Billing: auto-renew date
- Do NOT proceed unless user confirms.

### 5. Payment
- Use `collect_payment`:
  - summary: JSON with plan, duration, price, devices, quality, content_access
  - amount_inr: subscription price
  - description: "Sony LIV India subscription"
- WAIT for payment confirmation from user.

### 6. Complete & Confirm
- Enter payment method on Sony LIV (UPI / credit card / debit card / net banking / wallet).
- Handle OTP via `ask_user` if needed.
- Take snapshot of subscription confirmation page.
- Report to user: plan activated, price paid, validity period, number of screens, content highlights, next billing date, how to cancel.
- Mention: "You can manage or cancel your subscription from Sony LIV Account settings."

## Site Notes

- Sony LIV is the exclusive streaming home for live cricket (India tours), UEFA Champions League, WWE, UFC, and Sony originals like Scam 1992.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in to Sony LIV. Do NOT ask user for credentials.
- Sony LIV plans and pricing change frequently, especially around major cricket tournaments — always verify on-screen prices.
- Sony LIV does NOT offer monthly plans — minimum is usually 6 months or annual. Clarify this to users expecting monthly billing.
- Payment methods accepted: UPI, credit/debit card, net banking, Paytm, and other wallets.
- Sony LIV may offer bundled deals with telecom operators (Jio, Airtel) — mention if visible on the subscription page.
- Sports content availability depends on broadcasting rights, which can change between seasons.
- Sony LIV login typically uses phone number + OTP — if OTP is triggered, use `ask_user` to collect it.
- Session can expire frequently — if login wall appears mid-flow, stop and notify user to re-login in Chrome Debug.
- Use `confirm_action` for review, `collect_payment` for checkout. Always WAIT for user response.
