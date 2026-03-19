---
name: paytm-gas
description: Pay piped gas bill on Paytm. Select gas provider, enter customer ID, fetch bill, and pay.
triggers:
  - pay gas bill
  - gas bill payment
  - piped gas bill
  - gas bill on paytm
  - pay gas bill online
  - png bill payment
  - igl bill payment
  - mahanagar gas bill
  - adani gas bill
  - cooking gas bill
siteUrl: https://paytm.com/gas-bill-payment
requiresAuth: true
params:
  - name: provider
    required: false
    hint: Gas provider (e.g. "IGL", "Mahanagar Gas", "Adani Gas", "Gujarat Gas", "GAIL Gas")
  - name: customer_id
    required: true
    hint: Customer ID or BP number from gas bill (e.g. "1234567890")
  - name: city
    required: false
    hint: City for provider selection (e.g. "Delhi", "Mumbai", "Ahmedabad", "Lucknow")
---

# Paytm Piped Gas Bill Payment

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Get the piped gas customer ID or BP number (printed on the physical gas bill).
- Determine the gas provider. If not specified, ask for city to identify the provider:
  - Delhi/NCR: Indraprastha Gas Limited (IGL)
  - Mumbai: Mahanagar Gas Limited (MGL)
  - Ahmedabad/Gujarat: Adani Gas / Gujarat Gas
  - Pune: Maharashtra Natural Gas Limited (MNGL)
  - Lucknow/UP: Green Gas Limited / Torrent Gas
  - Bangalore: GAIL Gas
  - Other cities: respective city gas distribution companies
- Clarify that this is for piped natural gas (PNG), not LPG cylinder booking.
- Use `ask_user` for any missing details (customer ID, provider, city).

### 2. Open Paytm Gas Bill & Verify Login
- Open a NEW tab and navigate to `https://paytm.com/gas-bill-payment`.
- Take snapshot. Verify logged in (Paytm account name or profile icon visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Select Provider & Fetch Bill
- Select the piped gas provider from the dropdown or search.
- Enter the customer ID / BP number.
- Click "Fetch Bill" or "Proceed" and wait for bill details to load.
- Take snapshot and extract bill details:
  - Customer name and address
  - Customer ID / BP number
  - Bill amount (current due)
  - Bill period (from-to dates)
  - Gas consumption (SCM — Standard Cubic Meters)
  - Due date
  - Any previous unpaid dues or arrears
  - Late payment surcharge (if past due)
- If bill fetch fails, ask user to verify customer ID and provider.

### 4. Review & Confirm
- Use `confirm_action` with bill summary:
  - Gas provider
  - Customer ID and name
  - Bill period and gas consumption
  - Bill amount (current + arrears if any)
  - Due date
  - Late fee warning (if approaching/past due)
  - Any Paytm cashback offer
  - Total amount to pay
- Do NOT proceed unless user confirms.

### 5. Payment
- Use `collect_payment`:
  - summary: JSON with provider, customer_id, customer_name, bill_amount, due_date, total
  - amount_inr: total amount
  - description: "Piped gas bill payment via Paytm"
- WAIT for payment confirmation from user.

### 6. Complete & Confirm
- Complete payment on Paytm (UPI / card / net banking / Paytm wallet).
- Handle OTP via `ask_user` if needed.
- Take snapshot of payment success page.
- Report to user: transaction ID, gas provider, customer ID, amount paid, payment date, bill period covered.

## Site Notes

- Paytm supports piped natural gas (PNG) bill payments for major Indian city gas distributors.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in. Do NOT ask user for credentials.
- This skill is for piped gas (PNG) only — for LPG cylinder booking (Indane, HP Gas, Bharat Gas), use a different flow.
- Customer ID / BP number format varies by provider — IGL uses 10-digit, MGL uses 12-digit, etc.
- Gas bills are typically bimonthly — billing frequency varies by provider and city.
- Gas consumption is measured in SCM (Standard Cubic Meters) — average household uses 15-30 SCM per billing cycle.
- Bill fetch may take 5-10 seconds — wait patiently for the amount to load.
- Some providers charge a surcharge after the due date — inform user if bill is overdue.
- Payment reflects in the provider's system within 24-48 hours — advise user to save the receipt.
- Use `confirm_action` for review, `collect_payment` for checkout. Always WAIT for user response.
