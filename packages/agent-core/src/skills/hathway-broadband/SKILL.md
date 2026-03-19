---
name: hathway-broadband
description: Pay Hathway broadband bill or upgrade plan. Login, view bill, pay, or change broadband plan.
triggers:
  - hathway broadband bill
  - pay hathway bill
  - hathway internet bill
  - hathway wifi bill
  - hathway broadband payment
  - hathway cable bill
  - hathway plan upgrade
  - hathway broadband recharge
  - hathway fiber bill
  - pay hathway broadband
siteUrl: https://www.hathway.com
requiresAuth: true
params:
  - name: account_id
    required: true
    hint: Hathway account/customer ID or registered mobile number (e.g. "9876543210")
  - name: action
    required: false
    hint: Pay bill, upgrade plan, or view usage (default pay bill)
  - name: plan
    required: false
    hint: Preferred plan if upgrading (e.g. "100 Mbps plan", "cheapest plan", "unlimited")
---

# Hathway Broadband Bill Payment

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect recharge/bill details
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **number** (type: "text", required): Account number or mobile number
2. **plan** (type: "text", collapsed): Specific plan or amount (optional — can browse plans on site)

**CRITICAL**: Do NOT open the browser without the account/mobile number.
### 1. Gather Requirements
- Get the Hathway customer ID, account number, or registered mobile number.
- Determine action: pay current bill, upgrade/change plan, or check usage and balance.
- If upgrading, ask for preferred speed tier or budget.
- Ask which city the connection is in (Hathway operates in Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Pune, etc.).
- Use `ask_user` for any missing details.

### 2. Open Hathway & Verify Login
- Open a NEW tab and navigate to `https://www.hathway.com/broadband-plans` or `https://www.hathway.com/myaccount`.
- Take snapshot. Verify logged in (account dashboard or My Account page visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. View Bill & Account Details
- Navigate to My Account > Billing section.
- Take snapshot and extract:
  - Current plan name and speed
  - Monthly charge
  - Outstanding bill amount and due date
  - Data usage and FUP status
  - Account balance
  - Connection status (active / suspended / expired)
- If user wants to upgrade, navigate to plan change/upgrade section:
  - List available plans with: name, speed, data limit, price.
  - Use `ask_user` (input_type "choice") to pick a plan:
    - "₹XXX/month — [Plan Name] — XX Mbps — [Unlimited/XX GB FUP]"
- Take snapshot after viewing bill or selecting upgrade.

### 4. Review & Confirm
- Use `confirm_action` with payment/upgrade summary:
  - Hathway customer/account ID
  - Current plan and connection status
  - Outstanding bill amount or new plan details
  - Due date
  - Any installation charge (for plan upgrade) or late fee
  - Total amount to pay
- Do NOT proceed unless user confirms.

### 5. Payment
- Use `collect_payment`:
  - summary: JSON with account_id, plan, bill_amount, due_date, total
  - amount_inr: total amount
  - description: "Hathway broadband bill"
- WAIT for payment confirmation from user.

### 6. Complete & Confirm
- Complete payment on Hathway (UPI / card / net banking).
- Handle OTP via `ask_user` if needed.
- Take snapshot of payment success page.
- Report to user: transaction ID, account ID, plan, amount paid, new balance, next billing date.

## Site Notes

- Hathway is a major cable and broadband ISP in India — also provides cable TV services.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in. Do NOT ask user for credentials.
- Hathway plans vary by city — Mumbai plans differ from Bangalore, Delhi, etc. Always check the portal.
- Hathway was acquired by Reliance Jio — some integration with JioFiber may be visible on the portal.
- FUP limits apply on many Hathway plans — after limit, speed is throttled significantly. Mention this.
- If connection is suspended due to non-payment, paying the outstanding amount restores service within a few hours.
- Hathway also offers cable TV + broadband combo plans — ask if user wants a bundled plan.
- The website may be slow or have older UI — wait extra time for page loads and payment processing.
- Plan upgrades may require a technician visit for hardware changes — inform user if applicable.
- Use `confirm_action` for review, `collect_payment` for checkout. Always WAIT for user response.
