---
name: act-broadband
description: Pay ACT Fibernet broadband bill online. Login, view bill, select plan, and pay.
triggers:
  - act broadband bill
  - pay act fibernet bill
  - act fibernet payment
  - act broadband payment
  - act internet bill
  - act fiber bill
  - pay act bill
  - act broadband recharge
  - act wifi bill
  - act fibernet recharge
siteUrl: https://selfcare.actcorp.in
requiresAuth: true
params:
  - name: account_id
    required: true
    hint: ACT Fibernet account ID or registered mobile/email (e.g. "ACT12345678" or "9876543210")
  - name: action
    required: false
    hint: Pay bill, upgrade plan, or view usage (default pay bill)
  - name: plan
    required: false
    hint: Preferred plan if upgrading (e.g. "ACT Storm", "1 Gbps plan", "cheapest plan")
---

# ACT Fibernet Broadband Bill Payment

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Get the ACT Fibernet account ID, registered mobile number, or email address.
- Determine action: pay current bill, upgrade/change plan, or check usage.
- If upgrading, ask for preferred speed/plan (ACT offers plans by speed: 100 Mbps, 200 Mbps, 300 Mbps, 1 Gbps).
- Ask which city the connection is in (ACT operates in Bangalore, Hyderabad, Chennai, Delhi, etc. — plans vary by city).
- Use `ask_user` for any missing details.

### 2. Open ACT Selfcare & Verify Login
- Open a NEW tab and navigate to `https://selfcare.actcorp.in/`.
- Take snapshot. Verify logged in (account dashboard with plan details visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. View Bill & Account Details
- Navigate to billing/payment section of the dashboard.
- Take snapshot and extract account details:
  - Current plan name and speed
  - Monthly charge
  - Outstanding bill amount and due date
  - Data usage (used / total FUP limit)
  - Billing cycle dates
  - Connection status (active / suspended)
- If user wants to upgrade, navigate to plan change section:
  - List available plans with: name, speed, FUP/unlimited, price, OTT bundles.
  - Use `ask_user` (input_type "choice") to pick a plan:
    - "₹XXX/month — [Plan Name] — XX Mbps — [Unlimited/XX GB FUP] — [OTT: Netflix, etc.]"
- Take snapshot after viewing bill or selecting new plan.

### 4. Review & Confirm
- Use `confirm_action` with payment/upgrade summary:
  - ACT account ID
  - Current plan and connection details
  - Outstanding bill amount or new plan details
  - Due date
  - Any late fee or penalty if overdue
  - Total amount to pay
- Do NOT proceed unless user confirms.

### 5. Payment
- Use `collect_payment`:
  - summary: JSON with account_id, plan, bill_amount, due_date, total
  - amount_inr: total amount
  - description: "ACT Fibernet broadband bill"
- WAIT for payment confirmation from user.

### 6. Complete & Confirm
- Complete payment on ACT Selfcare (UPI / card / net banking).
- Handle OTP via `ask_user` if needed.
- Take snapshot of payment success page.
- Report to user: transaction ID, account ID, plan name, amount paid, next billing date, connection validity.

## Site Notes

- ACT Fibernet selfcare portal is at selfcare.actcorp.in — the main website (actcorp.in) is for new connections.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in. Do NOT ask user for credentials.
- ACT plans vary significantly by city — Bangalore has different plans than Hyderabad, Chennai, Delhi, etc.
- ACT frequently bundles OTT subscriptions (Netflix, Amazon Prime, ZEE5) with higher-tier plans — highlight these.
- FUP (Fair Usage Policy) limits apply on some plans — after FUP, speed is reduced. Mention if applicable.
- If bill is overdue, connection may be suspended — paying clears the suspension within a few hours.
- ACT offers both monthly billing and advance payment (3/6/12 months) with discounts — mention if user is interested.
- The selfcare portal may redirect to a payment gateway — follow through and complete the transaction.
- Plan upgrades take effect from the next billing cycle unless ACT applies it immediately — clarify with user.
- Use `confirm_action` for review, `collect_payment` for checkout. Always WAIT for user response.
