---
name: magzter-magazine
description: Subscribe to digital magazines on Magzter — browse All-Access Gold plan or buy individual magazine issues.
triggers:
  - magzter subscription
  - subscribe magzter
  - magzter magazine
  - digital magazine
  - buy magazine online
  - magzter gold
  - read magazine
  - magazine subscription india
  - magzter all access
  - online magazine
siteUrl: https://www.magzter.com
requiresAuth: true
params:
  - name: magazine_name
    required: false
    hint: Specific magazine name (e.g. "India Today", "Cosmopolitan", "Forbes India")
  - name: plan_type
    required: false
    hint: Subscription type — "all-access" (Magzter GOLD) or "single" (individual magazine)
  - name: duration
    required: false
    hint: Subscription duration (e.g. "1 month", "1 year"). Default 1 month.
---

# Magzter Magazine Subscription

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine what the user wants:
  - **Magzter GOLD** — All-Access subscription (7,500+ magazines & newspapers, unlimited reading).
  - **Single Magazine** — Subscribe to a specific magazine title (monthly/annual).
  - **Single Issue** — Buy one issue of a specific magazine.
- If user says "magazine subscription" without specifics, explain options via `ask_user` (input_type "choice"):
  - "Magzter GOLD — ₹399/mo or ₹3,999/yr — Unlimited access to 7,500+ titles"
  - "Single Magazine — Subscribe to one specific magazine (varies by title)"
  - "Single Issue — Buy one issue of a magazine (varies by title)"
- If single magazine, ask which magazine or genre they're interested in.
- Confirm duration preference: monthly or annual (annual saves significantly).

### 2. Open Magzter & Verify Login
- Open a NEW tab and navigate to `https://www.magzter.com`.
- Take snapshot. Check if logged in (profile icon or "My Library" visible in top bar).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- If already subscribed to GOLD, inform user and ask if they want to manage/renew.

### 3. Browse & Select
- **For Magzter GOLD**: Navigate to `https://www.magzter.com/gold` or the subscription page.
  - Take snapshot of GOLD plan details and pricing.
  - Show user the current pricing (monthly vs annual) and what's included.
- **For Single Magazine**: Use the search bar to find the specific magazine.
  - Take snapshot of search results.
  - Show user top results with: magazine name, publisher, language, frequency, price.
  - Use `ask_user` (input_type "choice") to let user pick if multiple matches.
- **For Browsing**: Navigate to categories (Business, Fashion, Technology, etc.).
  - Show top picks in the genre. Let user choose.

### 4. Review Subscription Details
- Navigate to the selected plan or magazine subscription page. Take snapshot.
- Use `confirm_action` with subscription summary:
  - Plan type (GOLD All-Access / Single Magazine / Single Issue)
  - Magazine name (if single)
  - Price (monthly or annual)
  - Billing cycle (auto-renew)
  - What's included (number of titles for GOLD, issues per year for single)
  - Supported devices (phone, tablet, desktop)
  - Free trial availability (if any)
- Do NOT proceed unless user confirms.

### 5. Payment
- Use `collect_payment`:
  - summary: JSON with plan_type, magazine_name, price, billing_cycle, duration
  - amount_inr: subscription price
  - description: "Magzter magazine subscription"
- WAIT for payment confirmation from user.

### 6. Complete & Confirm
- Proceed with payment on Magzter. Handle payment OTP via `ask_user` if needed.
- Take snapshot of subscription confirmation page.
- Report to user: plan activated, price paid, next billing date, number of magazines accessible.
- Mention: "You can read on Magzter app (iOS/Android) or web. Download issues for offline reading."
- Mention cancellation policy: "Cancel anytime from your Magzter account settings."

## Site Notes

- Magzter GOLD gives access to 7,500+ magazines and newspapers — best value for avid readers.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in. Do NOT ask user for credentials.
- Magzter often runs promotions on annual GOLD plans (up to 50% off) — check for active offers before subscribing.
- Single magazine subscriptions auto-renew — always inform user about billing cycle and how to cancel.
- Magzter supports offline reading through their mobile apps — worth mentioning for users who travel.
- Payment methods: UPI, credit/debit cards, net banking, Google Pay. No COD.
- Some magazines are available in regional Indian languages (Hindi, Tamil, Telugu, etc.) — ask user's language preference if browsing.
- Magzter GOLD annual plan is significantly cheaper per month than monthly — recommend annual if user plans long-term.
- Free trial may be available for new GOLD subscribers — check and apply if visible.
- Use `confirm_action` for review, `collect_payment` for checkout. Always WAIT for user response.
