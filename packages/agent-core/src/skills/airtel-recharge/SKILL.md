---
name: airtel-recharge
description: Recharge Airtel prepaid or postpaid, pay Airtel bills on airtel.in. Browse plans and pay.
triggers:
  - airtel recharge
  - recharge airtel
  - airtel prepaid recharge
  - airtel postpaid bill
  - airtel plan
  - pay airtel bill
  - airtel data pack
  - airtel unlimited plan
  - airtel fiber bill
  - airtel dth recharge
siteUrl: https://www.airtel.in
requiresAuth: true
params:
  - name: number
    required: true
    hint: Airtel mobile number to recharge (e.g. "9876543210")
  - name: plan_type
    required: false
    hint: Prepaid, postpaid, DTH, or fiber (default prepaid)
  - name: amount
    required: false
    hint: Preferred plan or amount (e.g. "₹299 plan", "cheapest unlimited", "1 GB daily")
---

# Airtel Recharge & Bill Payment

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect recharge/bill details
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **number** (type: "text", required): Account number or mobile number
2. **plan** (type: "text", collapsed): Specific plan or amount (optional — can browse plans on site)

**CRITICAL**: Do NOT open the browser without the account/mobile number.
### 1. Gather Requirements
- Get the Airtel number or account to recharge/pay.
- Determine type: prepaid recharge, postpaid bill, DTH recharge, Airtel Xstream Fiber bill.
- Ask if user has a preferred plan amount, data requirement, or validity preference.
- For DTH: get subscriber ID or registered mobile number.
- For Fiber: get account number or registered mobile.
- Use `ask_user` for any missing details.

### 2. Open Airtel.in & Verify Login
- Open a NEW tab and navigate to:
  - Prepaid: `https://www.airtel.in/prepaid-recharge/`
  - Postpaid: `https://www.airtel.in/postpaid-bill-payment/`
  - DTH: `https://www.airtel.in/dth-recharge/`
  - Fiber: `https://www.airtel.in/broadband-bill-payment/`
- Take snapshot. Verify logged in (profile icon or name visible in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Enter Number & Browse Plans
- Enter the Airtel number in the recharge field.
- Wait for plans to load. Airtel shows plans by category:
  - **Recommended**: AI-suggested best plan for the user
  - **Unlimited**: calls + data + SMS combos
  - **Data Add-ons**: extra data booster packs
  - **Talktime**: balance top-up for calls
  - **International Roaming**: travel packs
  - **Airtel Black**: bundled family/premium plans
- For postpaid/fiber: fetch current bill amount, due date, and usage summary.
- For DTH: show channel packs and add-on options.
- Extract top 5-8 plans with: price, data/day, validity, calls, SMS, OTT benefits.
- Use `ask_user` (input_type "choice") to pick a plan:
  - "₹XXX — XX GB/day — XX days — Unlimited calls — [OTT: Disney+, Amazon, etc.]"
- Take snapshot after plan selection.

### 4. Review & Confirm
- Use `confirm_action` with recharge/bill summary:
  - Airtel number / account
  - Type (prepaid / postpaid / DTH / fiber)
  - Selected plan or bill details
  - Any coupon, cashback, or Airtel Thanks reward
  - Total amount to pay
- Do NOT proceed unless user confirms.

### 5. Payment
- Use `collect_payment`:
  - summary: JSON with number, type, plan_details, total
  - amount_inr: total amount
  - description: "Airtel recharge/bill payment"
- WAIT for payment confirmation from user.

### 6. Complete & Confirm
- Complete payment on Airtel (UPI / card / net banking / Airtel Payments Bank).
- Handle OTP via `ask_user` if needed.
- Take snapshot of success/confirmation page.
- Report to user: transaction ID, Airtel number, plan/bill paid, validity, data balance, amount paid, next due date (for postpaid/fiber).

## Site Notes

- Airtel.in is the official Bharti Airtel recharge and bill payment portal.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in. Do NOT ask user for credentials.
- Airtel plans change frequently — always browse current plans on the website, never assume pricing.
- Airtel Thanks rewards may offer discounts or cashback — check and mention if applicable.
- Many Airtel plans bundle OTT subscriptions (Disney+ Hotstar, Amazon Prime, etc.) — highlight these.
- Airtel Black (bundled family plan) combines postpaid + fiber + DTH — ask if user wants this.
- Airtel Payments Bank wallet can sometimes be used for payment — mention if balance is available.
- DTH recharges: Airtel Digital TV channel packs are separate from base recharge — clarify what user needs.
- Postpaid bill payment: Airtel shows detailed usage breakdown — share if user asks.
- Recharge is usually instant — balance and plan activate within 1-2 minutes.
- Use `confirm_action` for review, `collect_payment` for checkout. Always WAIT for user response.
