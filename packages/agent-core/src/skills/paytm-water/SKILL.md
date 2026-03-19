---
name: paytm-water
description: Pay water bill on Paytm. Select provider, enter connection/consumer number, and pay.
triggers:
  - pay water bill
  - water bill payment
  - water bill on paytm
  - pay water bill online
  - jal board bill
  - water supply bill
  - pani bill payment
  - water bill paytm
  - municipal water bill
  - pay water charges
siteUrl: https://paytm.com/water-bill-payment
requiresAuth: true
params:
  - name: provider
    required: false
    hint: Water provider (e.g. "Delhi Jal Board", "BWSSB Bangalore", "MCGM Mumbai", "Chennai Metro Water")
  - name: connection_number
    required: true
    hint: Water connection number or consumer number from bill (e.g. "W1234567890")
  - name: city
    required: false
    hint: City for provider selection (e.g. "Delhi", "Bangalore", "Mumbai", "Chennai")
---

# Paytm Water Bill Payment

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Get the water connection number or consumer number (printed on the physical water bill).
- Determine the water provider/board. If not specified, ask for city to narrow down:
  - Delhi: Delhi Jal Board (DJB)
  - Bangalore: BWSSB (Bangalore Water Supply and Sewerage Board)
  - Mumbai: MCGM / BMC Water Department
  - Chennai: Chennai Metro Water Supply and Sewerage Board (CMWSSB)
  - Hyderabad: HMWSSB (Hyderabad Metropolitan Water Supply)
  - Pune: PMC Water Department
  - Other cities: respective municipal water boards
- Use `ask_user` for any missing details (connection number, provider, city).

### 2. Open Paytm Water Bill & Verify Login
- Open a NEW tab and navigate to `https://paytm.com/water-bill-payment`.
- Take snapshot. Verify logged in (Paytm account name or profile icon visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Select Provider & Fetch Bill
- Select the water provider/board from the dropdown or search.
- Enter the connection number / consumer number.
- Click "Fetch Bill" or "Proceed" and wait for bill details to load.
- Take snapshot and extract bill details:
  - Consumer name and address
  - Connection number
  - Bill amount (current due)
  - Bill period (from-to dates)
  - Due date
  - Water consumption (kilolitres)
  - Sewerage charges (if bundled)
  - Any arrears or previous unpaid dues
  - Late payment penalty (if past due)
- If bill fetch fails, ask user to verify connection number and provider.

### 4. Review & Confirm
- Use `confirm_action` with bill summary:
  - Water provider
  - Connection number and consumer name
  - Bill period and consumption
  - Bill amount (current + arrears if any)
  - Sewerage charges (if separate)
  - Due date and late fee warning
  - Any Paytm cashback offer
  - Total amount to pay
- Do NOT proceed unless user confirms.

### 5. Payment
- Use `collect_payment`:
  - summary: JSON with provider, connection_number, consumer_name, bill_amount, due_date, total
  - amount_inr: total amount
  - description: "Water bill payment via Paytm"
- WAIT for payment confirmation from user.

### 6. Complete & Confirm
- Complete payment on Paytm (UPI / card / net banking / Paytm wallet).
- Handle OTP via `ask_user` if needed.
- Take snapshot of payment success page.
- Report to user: transaction ID, provider, connection number, amount paid, payment date, bill period covered.

## Site Notes

- Paytm supports water bill payments for major Indian cities — not all municipal boards are available.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in. Do NOT ask user for credentials.
- Water bills are typically bimonthly or quarterly — billing cycle varies by city and provider.
- Connection number format varies by provider — Delhi Jal Board uses K-numbers, BWSSB uses RR numbers, etc.
- Many water boards bundle sewerage/drainage charges with the water bill — show full breakdown.
- Bill fetch may take 10-15 seconds for some providers — wait patiently for the response.
- Some providers do not support online bill fetch on Paytm — user may need to enter amount manually.
- Late payment penalties can be steep — inform user if bill is overdue and penalty is being applied.
- Payment reflects in the provider's system within 24-48 hours — advise user to keep the transaction receipt.
- Use `confirm_action` for review, `collect_payment` for checkout. Always WAIT for user response.
