---
name: microsoft365-subscribe
description: Subscribe to Microsoft 365 India. Personal or Family plan with Word, Excel, PowerPoint, Outlook, 1TB OneDrive, and more.
triggers:
  - microsoft 365
  - subscribe microsoft 365
  - office 365
  - buy microsoft office
  - microsoft 365 personal
  - microsoft 365 family
  - ms office subscription
  - buy office 365
  - microsoft word excel
  - office apps subscription
  - microsoft 365 india
  - onedrive 1tb plan
siteUrl: https://www.microsoft.com/en-in/microsoft-365
requiresAuth: true
params:
  - name: plan
    required: false
    hint: Preferred plan — "Personal" or "Family"
  - name: billing
    required: false
    hint: Billing cycle — "monthly" or "annual" (annual saves ~17%)
---

# Microsoft 365 India Subscription

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine which Microsoft 365 plan the user wants via `ask_user` (input_type "choice"):
  - "Personal — ₹489/mo or ₹4,899/yr — 1 person, Word, Excel, PowerPoint, Outlook, 1TB OneDrive"
  - "Family — ₹619/mo or ₹6,199/yr — Up to 6 people, all Office apps, 1TB OneDrive per person (6TB total)"
- Clarify key differences:
  - **Personal**: 1 user, 5 devices simultaneously, 1TB OneDrive
  - **Family**: Up to 6 users, 5 devices per person, 1TB OneDrive per person (6TB total), Family Safety app
- Ask about billing preference via `ask_user` (input_type "choice"):
  - "Monthly — ₹489/mo (Personal) or ₹619/mo (Family)"
  - "Annual — ₹4,899/yr (Personal) or ₹6,199/yr (Family) — save ~17%"
- Check if user already has a Microsoft account or existing subscription.
- If user only needs one app (e.g., just Word), mention that Microsoft 365 is the only way — individual app purchases are discontinued.

### 2. Open Microsoft 365 & Verify Login
- Open a NEW tab and navigate to `https://www.microsoft.com/en-in/microsoft-365`.
- Take snapshot. Check if logged in (Microsoft account avatar in top-right corner).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- If already subscribed, navigate to account.microsoft.com to check current plan and manage subscription.

### 3. Navigate to Plan Selection
- Browse the Microsoft 365 plans page for India pricing.
- Take snapshot of available plans.
- Verify on-screen prices — always use current displayed pricing, not hardcoded values.
- Check for any active promotions (Microsoft often offers first month free or discounted annual pricing).
- If user already has a subscription, show current plan and ask if they want to upgrade (Personal → Family) or change billing cycle.
- Click "Buy now" or "Try free for 1 month" for the chosen plan.

### 4. Configure & Review
- Select plan and billing cycle on the checkout page.
- Take snapshot of order summary.
- Use `confirm_action` with subscription summary:
  - Plan name (Personal / Family)
  - Price (monthly or annual in INR)
  - Number of users included
  - Apps included: Word, Excel, PowerPoint, Outlook, OneNote, OneDrive, Teams
  - OneDrive storage (1TB per person)
  - Number of devices (5 per person — PC, Mac, tablet, phone)
  - Microsoft Editor (advanced writing assistance)
  - Microsoft Defender (security for devices)
  - Free trial info (if applicable — often 1 month free)
  - Billing cycle and first charge date
  - Auto-renewal notice
- Do NOT proceed unless user confirms.

### 5. Payment
- Use `collect_payment`:
  - summary: JSON with plan, price_inr, billing_cycle, users, apps, storage, trial_info
  - amount_inr: subscription price in INR (or 0 if free trial)
  - description: "Microsoft 365 India subscription"
- WAIT for payment confirmation from user.

### 6. Complete & Confirm
- Proceed to Microsoft checkout.
- Select payment method (credit/debit card / UPI / net banking).
- Handle OTP via `ask_user` if needed.
- Take snapshot of subscription confirmation page.
- Report to user:
  - Plan activated (Personal / Family)
  - Monthly/annual charge in INR
  - Apps ready to install: Visit office.com or download Microsoft 365 desktop installer
  - OneDrive storage: 1TB available at onedrive.com
  - For Family plan: How to invite family members (account.microsoft.com → Sharing)
  - Next billing date
  - How to cancel: account.microsoft.com → Services & Subscriptions → Cancel
- Mention: "You can use Office apps online for free at office.com even without a subscription — the paid plan adds desktop apps, 1TB OneDrive, and premium features."

### 7. Verify Activation
- Navigate to `https://www.office.com` or `https://account.microsoft.com/services`.
- Take snapshot confirming active Microsoft 365 subscription.
- Verify user can access Word, Excel, PowerPoint online.
- For Family plan: guide user to invite family members via the sharing page.

## Site Notes

- Microsoft 365 is the successor to Office 365 — includes Word, Excel, PowerPoint, Outlook, OneNote, OneDrive, Teams, and more.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in to Microsoft. Do NOT ask user for credentials.
- Microsoft 365 India pricing is in INR — significantly cheaper than US pricing (Personal ₹4,899/yr vs $69.99/yr).
- Family plan is excellent value — 6 users with 1TB OneDrive each (6TB total) for just ₹6,199/yr.
- Microsoft often offers a 1-month free trial — check for this and recommend it to new subscribers.
- Annual billing saves ~17% compared to monthly — recommend for users who plan to keep the subscription.
- Microsoft 365 works on up to 5 devices per person simultaneously — Windows, Mac, iPad, iPhone, Android, and web.
- OneDrive 1TB is a major selling point — highlight it for users who need cloud storage (replaces Google Drive, Dropbox).
- Payment methods in India: credit/debit card, UPI, net banking. Microsoft India has good payment gateway support.
- Microsoft Editor (AI writing assistant) and Microsoft Defender (device security) are included but often overlooked — mention them.
- Cancellation of annual plan may have a prorated refund for unused months — Microsoft is generally fair about refunds.
- Individual Office app licenses (one-time purchase of Office 2024) still exist but lack cloud features and updates — subscription is recommended.
- Use `confirm_action` for review, `collect_payment` for checkout. Always WAIT for user response.
