---
name: paytm-electricity
description: Pay electricity bill on Paytm. Select state, choose provider, enter consumer number, and pay.
triggers:
  - pay electricity bill
  - electricity bill payment
  - pay light bill
  - electricity bill on paytm
  - bijli bill payment
  - pay power bill
  - electricity bill paytm
  - light bill payment paytm
  - pay bijli bill
  - electricity bill online
siteUrl: https://paytm.com/electricity-bill-payment
requiresAuth: true
params:
  - name: provider
    required: false
    hint: Electricity provider (e.g. "BSES Rajdhani", "MSEDCL", "BESCOM", "TNEB", "UPPCL")
  - name: consumer_number
    required: true
    hint: Consumer number or account number from electricity bill (e.g. "1234567890")
  - name: state
    required: false
    hint: State for provider selection (e.g. "Delhi", "Maharashtra", "Karnataka")
---

# Paytm Electricity Bill Payment

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect recharge/bill details
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **number** (type: "text", required): Account number or mobile number
2. **plan** (type: "text", collapsed): Specific plan or amount (optional — can browse plans on site)

**CRITICAL**: Do NOT open the browser without the account/mobile number.
### 1. Gather Requirements
- Get the electricity consumer number or account number (printed on the physical bill).
- Determine the electricity provider/board. If not specified, ask for the state and city to narrow down:
  - Delhi: BSES Rajdhani, BSES Yamuna, NDPL/Tata Power Delhi
  - Maharashtra: MSEDCL, Adani Electricity (Mumbai), BEST (Mumbai), Tata Power (Mumbai)
  - Karnataka: BESCOM (Bangalore), HESCOM, MESCOM, CESC, GESCOM
  - Tamil Nadu: TNEB / TANGEDCO
  - UP: UPPCL (various discom zones)
  - Other states: respective state electricity boards
- Use `ask_user` for any missing details (consumer number, provider, state).

### 2. Open Paytm Electricity & Verify Login
- Open a NEW tab and navigate to `https://paytm.com/electricity-bill-payment`.
- Take snapshot. Verify logged in (Paytm account name or profile icon visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Select Provider & Fetch Bill
- Select the electricity provider/board from the dropdown or search.
- Enter the consumer number / account number.
- Click "Fetch Bill" or "Proceed" and wait for bill details to load.
- Take snapshot and extract bill details:
  - Consumer name
  - Consumer number
  - Bill amount (current due)
  - Bill date and due date
  - Units consumed
  - Any arrears or previous dues
  - Late payment surcharge (if past due date)
- If bill fetch fails, ask user to verify consumer number and provider.

### 4. Review & Confirm
- Use `confirm_action` with bill summary:
  - Electricity provider
  - Consumer number and name
  - Bill amount (current + arrears if any)
  - Due date
  - Late fee warning (if approaching or past due date)
  - Any Paytm cashback or offer
  - Total amount to pay
- Do NOT proceed unless user confirms.

### 5. Payment
- Use `collect_payment`:
  - summary: JSON with provider, consumer_number, consumer_name, bill_amount, due_date, total
  - amount_inr: total amount
  - description: "Electricity bill payment via Paytm"
- WAIT for payment confirmation from user.

### 6. Complete & Confirm
- Complete payment on Paytm (UPI / card / net banking / Paytm wallet).
- Handle OTP via `ask_user` if needed.
- Take snapshot of payment success page.
- Report to user: transaction ID, provider, consumer number, amount paid, payment date, next expected bill date.

## Site Notes

- Paytm supports 100+ electricity providers across all Indian states — always search for the correct one.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in. Do NOT ask user for credentials.
- Consumer number format varies by provider (8-12 digits typically) — validate format before submission.
- Bill fetch may take 5-10 seconds — wait patiently for the bill details to appear.
- Some providers support partial payment — clarify with user if they want to pay full or partial amount.
- Late payment surcharge is added automatically after due date — inform user about the extra charge.
- Paytm may show cashback offers on electricity bill payment — mention if applicable.
- Some rural/smaller providers may not be available on Paytm — suggest alternative (provider website) if not found.
- Payment confirmation from the provider may take 24-48 hours to reflect in the provider's system.
- Use `confirm_action` for review, `collect_payment` for checkout. Always WAIT for user response.
