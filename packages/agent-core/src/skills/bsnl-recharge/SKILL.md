---
name: bsnl-recharge
description: Recharge BSNL prepaid or pay BSNL postpaid/landline bills on bsnl.co.in. Browse plans and pay.
triggers:
  - bsnl recharge
  - recharge bsnl
  - bsnl prepaid recharge
  - bsnl postpaid bill
  - bsnl plan
  - bsnl data pack
  - pay bsnl bill
  - bsnl landline bill
  - bsnl broadband bill
  - bsnl fiber bill
siteUrl: https://portal.bsnl.in
requiresAuth: true
params:
  - name: number
    required: true
    hint: BSNL mobile or landline number to recharge/pay (e.g. "9876543210" or "011-12345678")
  - name: plan_type
    required: false
    hint: Prepaid, postpaid, landline, or broadband (default prepaid)
  - name: amount
    required: false
    hint: Preferred plan or amount (e.g. "₹299 plan", "cheapest unlimited", "bharat fiber")
---

# BSNL Recharge & Bill Payment

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect recharge/bill details
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **number** (type: "text", required): Account number or mobile number
2. **plan** (type: "text", collapsed): Specific plan or amount (optional — can browse plans on site)

**CRITICAL**: Do NOT open the browser without the account/mobile number.
### 1. Gather Requirements
- Get the BSNL number or account to recharge/pay.
- Determine type: prepaid mobile recharge, postpaid mobile bill, landline bill, BSNL Bharat Fiber broadband bill.
- Ask if user has a preferred plan amount, data requirement, or validity preference.
- For landline/broadband: get the account number or registered phone number.
- Use `ask_user` for any missing details.

### 2. Open BSNL Portal & Verify Login
- Open a NEW tab and navigate to:
  - Recharge: `https://portal.bsnl.in/` or `https://bsnl.co.in/recharge`
  - Bill payment: `https://portal.bsnl.in/myaccount/postpaidbills.php`
- Take snapshot. Verify logged in (account dashboard or profile visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Enter Number & Browse Plans
- Enter the BSNL number in the recharge/bill input field.
- Wait for plan listing to load. BSNL shows plans by category:
  - **STV (Special Tariff Voucher)**: data + calls bundles
  - **PV (Plan Voucher)**: base plan changes
  - **Data STVs**: data-only packs
  - **Talktime**: top-up vouchers
  - **Annual Plans**: long validity plans (365 days)
  - **Bharat Fiber Plans**: broadband/fiber plans
- For postpaid/landline: fetch current bill amount, due date, and usage summary.
- Extract top 5-8 relevant plans with: price, data, validity, calls, SMS, extras.
- Use `ask_user` (input_type "choice") to pick a plan:
  - "₹XXX — XX GB/day — XX days — Unlimited calls — [extras]"
- Take snapshot after plan selection.

### 4. Review & Confirm
- Use `confirm_action` with recharge/bill summary:
  - BSNL number / account
  - Type (prepaid / postpaid / landline / broadband)
  - Selected plan or bill details
  - Any promotional offer or discount
  - Total amount to pay
- Do NOT proceed unless user confirms.

### 5. Payment
- Use `collect_payment`:
  - summary: JSON with number, type, plan_details, total
  - amount_inr: total amount
  - description: "BSNL recharge/bill payment"
- WAIT for payment confirmation from user.

### 6. Complete & Confirm
- Complete payment on BSNL portal (UPI / card / net banking).
- Handle OTP via `ask_user` if needed.
- Take snapshot of success/confirmation page.
- Report to user: transaction ID, BSNL number, plan/bill paid, validity, data balance, amount paid, next due date (for postpaid).

## Site Notes

- BSNL portal can be slow and outdated — wait extra time for pages to load (up to 15-20 seconds).
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in. Do NOT ask user for credentials.
- BSNL plans are generally cheaper than private operators — highlight value for money.
- BSNL has different plans for different circles/states — the portal auto-detects circle from the number.
- Bharat Fiber (FTTH) plans vary by circle — always check the portal for current pricing.
- BSNL landline bills include local + STD call charges — share breakdown if user asks.
- The BSNL portal sometimes shows CAPTCHA — handle it carefully, use `ask_user` if CAPTCHA cannot be solved.
- Payment gateway may redirect to a separate page — follow the redirect and complete payment.
- BSNL recharges may take slightly longer to activate (up to 5-10 minutes) compared to private operators.
- Use `confirm_action` for review, `collect_payment` for checkout. Always WAIT for user response.
