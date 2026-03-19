---
name: jiocinema-subscribe
description: Subscribe to JioCinema Premium — choose plan, get access to Hollywood, sports, and originals, pay.
triggers:
  - jiocinema
  - jiocinema premium
  - subscribe jiocinema
  - jio cinema subscription
  - jiocinema plan
  - buy jiocinema
  - jiocinema premium subscription
  - watch on jiocinema
  - jio cinema premium
siteUrl: https://www.jiocinema.com
requiresAuth: true
params:
  - name: plan
    required: false
    hint: Plan preference (e.g. "Premium", "Family", "Ad-lite")
  - name: billing
    required: false
    hint: Billing preference (e.g. "monthly", "quarterly", "yearly")
---

# JioCinema Premium Subscription

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Subscription Preferences
- Ask user what they want to watch (Hollywood movies, sports, originals) to recommend the right plan.
- Get: plan type preference, billing cycle preference.
- Use `ask_user` if not specified: "What content are you interested in? (Hollywood movies, IPL/sports, HBO originals, Peacock shows)"

### 2. Open JioCinema
- Open a NEW tab and navigate to `https://www.jiocinema.com`.
- Take snapshot. Verify logged in (profile icon visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Check if user already has an active subscription. If yes, inform and ask about upgrade/renewal.

### 3. Navigate to Premium Plans
- Click on "Premium" or "Subscribe" or navigate to the plans page.
- Take snapshot. Extract all available plans with pricing and features:
  - Ad-Lite plan: basic content with fewer ads
  - Premium plan: all content, ad-free, 4K, multiple screens
  - Family plan: multiple profiles, simultaneous streams
- Note any ongoing offers, discounts, or bundled deals.

### 4. Compare Plans & Select
- Present plan options via `ask_user` (input_type "choice"):
  "Ad-Lite Monthly — ₹29/month — with ads, limited content"
  "Premium Monthly — ₹89/month — ad-free, 4K, all content"
  "Premium Yearly — ₹599/year — best value, save 44%"
- Highlight what's included in each plan:
  - HBO Originals, Peacock shows, Hollywood movies
  - IPL and sports streaming (if applicable to season)
  - 4K/HDR streaming, Dolby audio
  - Number of simultaneous screens
  - Download for offline viewing

### 5. Review & Confirm
- Click the selected plan. Take snapshot of checkout page.
- Use `confirm_action`:
  - Plan name and tier
  - Billing cycle (monthly/quarterly/yearly)
  - Price per cycle
  - Content access: Hollywood, Sports, Originals, Regional
  - Streaming quality: 4K/HDR availability
  - Number of screens/profiles
  - Auto-renewal notice
  - Cancellation policy
- Do NOT proceed unless user confirms.

### 6. Payment
- Use `collect_payment`:
  - summary: JSON with plan, billing_cycle, price, content_access, quality, screens
  - amount_inr: total amount for the billing cycle
  - description: "JioCinema Premium subscription"
- WAIT for payment confirmation.

### 7. Complete & Confirm
- Complete the subscription on JioCinema. Handle payment OTP via `ask_user` if needed.
- Take snapshot of subscription confirmation / premium dashboard.
- Report: plan name, price paid, validity period, next billing date, content now unlocked.
- Mention: "JioCinema Premium is now active! You can stream on up to [X] devices simultaneously. Download the JioCinema app on your TV, phone, and tablet for the best experience."
- Suggest popular content: "Check out [trending show/movie] now available in 4K."

## Site Notes

- JioCinema is a major Indian OTT platform — hosts HBO, Peacock, and Paramount content plus IPL cricket.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. Login typically uses Jio phone number + OTP.
- Plan prices change frequently — always verify current pricing on the site before presenting to user.
- IPL streaming may be included in premium or require a separate sports add-on — check carefully.
- Jio users (Jio SIM) sometimes get bundled JioCinema access — check if already active before purchasing.
- Free tier exists with ads and limited content — clarify if user wants free vs premium.
- Annual plans offer significant savings (30-50%) over monthly — recommend for committed users.
- 4K streaming requires a compatible device and stable internet (25+ Mbps) — mention this.
- Content library varies by plan tier — some content is premium-only. Verify user's desired content is in the chosen plan.
- Multiple profiles can be set up for family members — each gets personalized recommendations.
- Use `confirm_action` for subscription review, `collect_payment` for checkout. WAIT for user response at each step.
