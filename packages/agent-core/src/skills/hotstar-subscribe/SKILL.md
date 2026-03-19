---
name: hotstar-subscribe
description: Subscribe to Disney+ Hotstar India. Choose plan (Mobile, Super, Premium), pay and activate.
triggers:
  - hotstar subscription
  - subscribe hotstar
  - disney hotstar plan
  - hotstar premium
  - hotstar super
  - buy hotstar
  - disney plus hotstar
  - hotstar annual plan
  - get hotstar
  - hotstar ipl
siteUrl: https://www.hotstar.com
requiresAuth: true
params:
  - name: plan
    required: false
    hint: Preferred plan (e.g. "Mobile", "Super", "Premium")
  - name: duration
    required: false
    hint: Monthly or annual (e.g. "monthly", "yearly", "annual")
---

# Disney+ Hotstar Subscription

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine which Hotstar plan the user wants. Available India plans (verify on site):
  - **Mobile** — ₹149/mo or ₹499/yr — 1 device, phone only, 720p
  - **Super** — ₹299/mo or ₹899/yr — 2 devices, any screen, 1080p, Disney+ content
  - **Premium** — ₹499/mo or ₹1499/yr — 4 devices, 4K, all content including HBO/Showtime
- If user is unsure, use `ask_user` (input_type "choice") to explain plans:
  - "Mobile — ₹499/yr — Phone only, 720p"
  - "Super — ₹899/yr — 2 devices, 1080p, Disney+"
  - "Premium — ₹1499/yr — 4 devices, 4K, all content"
- Ask monthly or annual preference. Annual is better value — recommend it.
- Clarify if new subscription or renewal/upgrade.

### 2. Open Hotstar & Verify Login
- Open a NEW tab and navigate to `https://www.hotstar.com`.
- Take snapshot. Check if logged in (profile icon visible in top-right).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- If already subscribed, navigate to account/subscription page.

### 3. Navigate to Plan Selection
- Navigate to subscription page: `https://www.hotstar.com/subscribe` or via profile menu.
- Take snapshot of available plans.
- Verify current pricing on screen (Hotstar changes plans/pricing frequently).
- If prices differ from above, present the actual on-screen plans.
- Use `ask_user` (input_type "choice") to confirm plan and duration if not yet chosen.
- Select the chosen plan on the page.

### 4. Review & Confirm
- Use `confirm_action` with subscription summary:
  - Plan name (Mobile / Super / Premium)
  - Duration (monthly / annual)
  - Price (monthly or annual rate)
  - Number of devices / screens
  - Video quality (720p / 1080p / 4K)
  - Content access (sports, Disney+, HBO, etc.)
  - Billing: auto-renew date
- Do NOT proceed unless user confirms.

### 5. Payment
- Use `collect_payment`:
  - summary: JSON with plan, duration, price, devices, quality, content_access
  - amount_inr: subscription price
  - description: "Disney+ Hotstar subscription"
- WAIT for payment confirmation from user.

### 6. Complete & Confirm
- Enter payment method on Hotstar (UPI / credit card / debit card / net banking).
- Handle OTP via `ask_user` if needed.
- Take snapshot of subscription confirmation page.
- Report to user: plan activated, price paid, validity period, number of screens, content access, next billing date, how to cancel.
- Mention: "You can manage or cancel your subscription from Hotstar Account settings."

## Site Notes

- Disney+ Hotstar is India's top streaming platform for cricket (IPL), Disney, Marvel, Star Wars, and HBO content.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in. Do NOT ask user for credentials.
- Hotstar plans and pricing change frequently — especially around IPL season — always verify on-screen prices.
- Annual plans offer significant savings over monthly — recommend annual unless user prefers monthly.
- Hotstar often runs promotional pricing for new users or during cricket season — mention if visible.
- Mobile plan is phone-only (no TV/laptop) — clarify this limitation to avoid confusion.
- Premium includes HBO, Showtime, and Hotstar Specials that other plans don't — mention if user cares about specific content.
- Payment methods: UPI, credit/debit card, net banking, Paytm. Some plans support carrier billing (Jio, Airtel).
- Hotstar may redirect to partner pages (Jio, Airtel) for bundled plans — stay on Hotstar direct.
- Session may expire frequently on Hotstar web — if login wall appears, stop and notify user.
- Use `confirm_action` for review, `collect_payment` for checkout. Always WAIT for user response.
