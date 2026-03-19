---
name: jio-recharge
description: Recharge Jio prepaid or postpaid on jio.com. Browse plans, select, and pay.
triggers:
  - jio recharge
  - recharge jio
  - jio prepaid recharge
  - jio postpaid bill
  - jio plan
  - jio data pack
  - recharge jio number
  - jio unlimited plan
  - pay jio bill
  - jio fiber bill
siteUrl: https://www.jio.com
requiresAuth: true
params:
  - name: number
    required: true
    hint: Jio mobile number to recharge (e.g. "9876543210")
  - name: plan_type
    required: false
    hint: Prepaid or postpaid (default prepaid)
  - name: amount
    required: false
    hint: Preferred plan or amount (e.g. "₹299 plan", "cheapest unlimited", "maximum data")
---

# Jio Recharge

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Get the Jio mobile number to recharge.
- Determine if prepaid or postpaid. Default to prepaid if not specified.
- Ask if user has a preferred plan amount or type (unlimited, data-only, international roaming).
- For Jio Fiber: get account number or registered mobile number.
- Use `ask_user` for any missing details.

### 2. Open Jio.com & Verify Login
- Open a NEW tab and navigate to `https://www.jio.com/recharge`.
- Take snapshot. Verify logged in (My Jio profile icon or name visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Enter Number & Browse Plans
- Enter the Jio number in the recharge input field.
- Wait for plan listing to load. Jio shows plans by category:
  - **Popular Plans**: most recharged plans
  - **Data Add-ons**: extra data packs
  - **Unlimited Plans**: calls + data + SMS bundles
  - **International Roaming**: travel packs
  - **JioFiber Plans**: broadband plans (if applicable)
- For postpaid: fetch current bill amount and due date.
- Extract top 5-8 relevant plans with: price, data, validity, calls, SMS, extras.
- Use `ask_user` (input_type "choice") to pick a plan:
  - "₹XXX — XX GB/day — XX days — Unlimited calls — [extras]"
- Take snapshot after plan selection.

### 4. Review & Confirm
- Use `confirm_action` with recharge summary:
  - Jio number
  - Prepaid/Postpaid
  - Selected plan details (price, data, validity, calls, SMS)
  - Any Jio coupon or discount applied
  - Total amount to pay
- Do NOT proceed unless user confirms.

### 5. Payment
- Use `collect_payment`:
  - summary: JSON with number, plan_type, plan_details, total
  - amount_inr: total amount
  - description: "Jio recharge"
- WAIT for payment confirmation from user.

### 6. Complete & Confirm
- Complete payment on Jio (UPI / card / net banking).
- Handle OTP via `ask_user` if needed.
- Take snapshot of recharge success page.
- Report to user: transaction ID, Jio number, plan recharged, validity start/end, data balance, amount paid.

## Site Notes

- Jio.com is the official Reliance Jio recharge portal — most reliable for Jio-specific plans.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in. Do NOT ask user for credentials.
- Jio plans change very frequently (sometimes weekly) — always browse current plans, never hardcode prices.
- Jio numbers start with specific prefixes (e.g., 6, 7, 8, 9 series) — validate the number looks correct.
- Jio often bundles free subscriptions (JioCinema, JioTV, JioCloud) with recharge plans — mention these perks.
- Postpaid bills can be paid in full or partial — clarify with user if outstanding balance is large.
- Jio Fiber (broadband) recharges are also available — ask if user means mobile or fiber.
- Payment options on jio.com: UPI, credit/debit card, net banking, Jio wallet, Paytm.
- Recharge is usually instant — balance reflects within 1-2 minutes.
- If the website redirects to MyJio app download page, navigate back to web recharge URL.
- Use `confirm_action` for review, `collect_payment` for checkout. Always WAIT for user response.
