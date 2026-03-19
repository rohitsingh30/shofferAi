---
name: voot-subscribe
description: Subscribe to Voot Select (JioCinema). Colors, MTV, Nickelodeon content, originals, and Paramount+ shows.
triggers:
  - voot subscription
  - subscribe voot
  - voot select plan
  - voot premium
  - buy voot
  - voot colors
  - voot mtv content
  - voot select annual
  - get voot select
  - voot originals
siteUrl: https://www.voot.com
requiresAuth: true
params:
  - name: plan
    required: false
    hint: Preferred plan (e.g. "Voot Select Monthly", "Voot Select Annual")
  - name: duration
    required: false
    hint: Monthly or annual (e.g. "monthly", "yearly", "annual")
---

# Voot Select Subscription

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine which Voot Select plan the user wants. Available India plans (verify on site):
  - **Voot Select Monthly** — ~₹149/mo — ad-free, all originals, Colors/MTV before TV
  - **Voot Select Annual** — ~₹499-₹999/yr — ad-free, all content, best value
- Note: Voot may have merged with or redirected to JioCinema — verify current branding on site.
- If user is unsure, use `ask_user` (input_type "choice"):
  - "Voot Select Monthly — ~₹149/mo — All content, ad-free"
  - "Voot Select Annual — ~₹999/yr — All content, best value"
- Ask if user is interested in Colors shows, MTV content, Nickelodeon (kids), or Paramount+ originals.
- Clarify if new subscription or renewal/upgrade.

### 2. Open Voot & Verify Login
- Open a NEW tab and navigate to `https://www.voot.com`.
- Take snapshot. Check if redirected (Voot may redirect to JioCinema). Note the actual URL.
- Check if logged in (profile icon or name visible in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- If site has been rebranded/merged, inform user and proceed with the current platform.

### 3. Navigate to Plan Selection
- Navigate to subscription/upgrade page via profile menu or account settings.
- Take snapshot of available plans with current pricing.
- Verify current pricing on screen (Voot/JioCinema frequently changes plans and pricing).
- If prices differ from discussed, present the actual on-screen plans to user.
- Use `ask_user` (input_type "choice") to confirm plan and duration if not yet chosen.
- Select the chosen plan on the page.

### 4. Review & Confirm
- Use `confirm_action` with subscription summary:
  - Plan name and platform (Voot Select or JioCinema Premium)
  - Duration (monthly / annual)
  - Price
  - Number of devices / screens
  - Content access: Colors, MTV, Nickelodeon, Paramount+, originals
  - Ad-free status
  - Billing: auto-renew date
- Do NOT proceed unless user confirms.

### 5. Payment
- Use `collect_payment`:
  - summary: JSON with plan, duration, price, devices, content_access, platform
  - amount_inr: subscription price
  - description: "Voot Select / JioCinema subscription"
- WAIT for payment confirmation from user.

### 6. Complete & Confirm
- Enter payment method (UPI / credit card / debit card / net banking / wallet).
- Handle OTP via `ask_user` if needed.
- Take snapshot of subscription confirmation page.
- Report to user: plan activated, price paid, validity period, content highlights, next billing date, how to cancel.
- Mention: "You can manage or cancel your subscription from Account settings on the platform."

## Site Notes

- Voot Select is the premium tier of Viacom18's streaming platform, featuring Colors, MTV, Comedy Central, Nickelodeon, and Paramount+ content.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in. Do NOT ask user for credentials.
- Voot has been undergoing rebranding — it may redirect to JioCinema following the Viacom18-Jio merger. Always check the actual site state before proceeding.
- If Voot has merged into JioCinema, adapt the flow to use JioCinema's subscription page instead.
- Payment methods accepted: UPI, credit/debit card, net banking, Paytm, and other wallets.
- Voot/JioCinema login typically uses phone number + OTP — if OTP is triggered, use `ask_user` to collect it.
- Colors shows (Bigg Boss, Khatron Ke Khiladi) appear on Voot Select before TV broadcast — highlight this for Colors fans.
- Jio users may get bundled access — ask user if they have a Jio plan that includes Voot/JioCinema Premium.
- Session can expire frequently — if login wall appears mid-flow, stop and notify user to re-login in Chrome Debug.
- Use `confirm_action` for review, `collect_payment` for checkout. Always WAIT for user response.
