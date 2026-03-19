---
name: vi-recharge
description: Recharge Vi (Vodafone Idea) prepaid or postpaid on myvi.in. Browse plans, select, and pay.
triggers:
  - vi recharge
  - vodafone recharge
  - recharge vi
  - vi prepaid recharge
  - vi postpaid bill
  - vi plan
  - vodafone idea recharge
  - vi data pack
  - pay vi bill
  - recharge vodafone idea
siteUrl: https://www.myvi.in
requiresAuth: true
params:
  - name: number
    required: true
    hint: Vi mobile number to recharge (e.g. "9876543210")
  - name: plan_type
    required: false
    hint: Prepaid or postpaid (default prepaid)
  - name: amount
    required: false
    hint: Preferred plan or amount (e.g. "₹299 plan", "cheapest unlimited", "maximum data")
---

# Vi (Vodafone Idea) Recharge

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect recharge/bill details
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **number** (type: "text", required): Account number or mobile number
2. **plan** (type: "text", collapsed): Specific plan or amount (optional — can browse plans on site)

**CRITICAL**: Do NOT open the browser without the account/mobile number.
### 1. Gather Requirements
- Get the Vi mobile number to recharge.
- Determine if prepaid recharge or postpaid bill payment. Default to prepaid if not specified.
- Ask if user has a preferred plan amount, data requirement, or validity preference.
- Check if user wants a specific category: unlimited, data-only, talktime, international roaming.
- Use `ask_user` for any missing details.

### 2. Open myvi.in & Verify Login
- Open a NEW tab and navigate to:
  - Prepaid: `https://www.myvi.in/prepaid/online-mobile-recharge`
  - Postpaid: `https://www.myvi.in/postpaid/pay-bill`
- Take snapshot. Verify logged in (profile icon or Vi account name visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Enter Number & Browse Plans
- Enter the Vi number in the recharge input field.
- Wait for plan listing to load. Vi shows plans by category:
  - **Recommended Plans**: best plans for the user's usage pattern
  - **Unlimited Plans**: calls + data + SMS bundles
  - **Data Booster**: additional data top-up packs
  - **Talktime**: balance top-up for calls
  - **International Roaming**: travel packs
  - **Vi Hero Unlimited**: premium combo plans
- For postpaid: fetch current bill amount, due date, and usage breakdown.
- Extract top 5-8 relevant plans with: price, data/day, validity, calls, SMS, extras.
- Use `ask_user` (input_type "choice") to pick a plan:
  - "₹XXX — XX GB/day — XX days — Unlimited calls — [extras]"
- Take snapshot after plan selection.

### 4. Review & Confirm
- Use `confirm_action` with recharge/bill summary:
  - Vi number
  - Prepaid/Postpaid
  - Selected plan details (price, data, validity, calls, SMS)
  - Any Vi cashback or promotional offer applied
  - Total amount to pay
- Do NOT proceed unless user confirms.

### 5. Payment
- Use `collect_payment`:
  - summary: JSON with number, plan_type, plan_details, total
  - amount_inr: total amount
  - description: "Vi recharge"
- WAIT for payment confirmation from user.

### 6. Complete & Confirm
- Complete payment on myvi.in (UPI / card / net banking / wallets).
- Handle OTP via `ask_user` if needed.
- Take snapshot of recharge success page.
- Report to user: transaction ID, Vi number, plan recharged, validity start/end, data balance, amount paid.

## Site Notes

- myvi.in is the official Vodafone Idea (Vi) recharge and bill payment portal.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in. Do NOT ask user for credentials.
- Vi plans change frequently — always browse current plans on the website, never assume pricing.
- Vi was formed from the merger of Vodafone India and Idea Cellular — users may refer to it as "Vodafone", "Idea", or "Vi".
- Vi Hero Unlimited plans are premium bundles with extra data, OTT subscriptions, and weekend data rollover — highlight these.
- Postpaid users can view detailed bill breakdown (calls, data, SMS, roaming) — share if user asks.
- Vi sometimes offers double data or cashback promotions — check and mention if applicable.
- Recharge is usually instant — plan activates within 1-2 minutes of payment confirmation.
- The website may prompt app download — ignore and continue on web version.
- Use `confirm_action` for review, `collect_payment` for checkout. Always WAIT for user response.
