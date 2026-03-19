---
name: echallan-fine
description: Pay traffic challan/fine on eChallan Parivahan — search by vehicle or challan number, view violations, pay online.
triggers:
  - traffic challan
  - echallan
  - pay challan
  - traffic fine
  - vehicle challan
  - challan payment
  - traffic violation fine
  - e-challan pay
  - parivahan challan
siteUrl: https://echallan.parivahan.gov.in
requiresAuth: false
params:
  - name: search_type
    required: false
    hint: Search by "vehicle number" (e.g. "MH02AB1234") or "challan number" (e.g. "CH12345678")
  - name: vehicle_number
    required: false
    hint: Vehicle registration number (e.g. "MH02AB1234", "DL4CAF1234")
  - name: challan_number
    required: false
    hint: Specific challan number if known
---

# eChallan Traffic Fine Payment

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Search Details
- Ask how to search: by vehicle number or challan number.
- If not provided, use `ask_user` (input_type "choice"):
  "How would you like to search? 1) Vehicle Number 2) Challan Number"
- For vehicle number: confirm the full registration number (e.g. "MH02AB1234").
- For challan number: confirm the challan ID.
- If user doesn't know the challan number, default to vehicle number search.
- Validate vehicle number format: 2 letters (state) + 2 digits (RTO) + 1-2 letters + 4 digits.

### 2. Open eChallan Portal in NEW Tab
- Open a NEW tab and navigate to `https://echallan.parivahan.gov.in/index/paid-challan`.
- Take snapshot. Verify the search page is loaded.
- Dismiss any popups, cookie notices, or advisory banners.
- If the site is under maintenance, inform the user and suggest trying later.
- Navigate to "Check Challan Status" or "Pay Challan" section.

### 3. Search for Challans
- Select the search type: "Vehicle Number" or "Challan Number".
- Enter the vehicle number or challan number in the search field.
- If CAPTCHA is present, attempt to read and enter it.
- If CAPTCHA is unreadable, use `ask_user`: "I need help reading the CAPTCHA. What text do you see?"
- Click "Get Details" / "Search" button.
- Take snapshot of search results.
- Wait for results to load (government sites can be slow).

### 4. View Challan Details
- Extract all pending challans from the results:
  - Challan number
  - Violation date and time
  - Violation type (e.g. "Red Light Violation", "Over Speeding", "No Helmet", "Wrong Parking")
  - Location of violation
  - Fine amount
  - Status: Pending / Disposed / Under Adjudication
  - Photo evidence (if available)
- Take snapshot of challan list.
- If no pending challans, inform user: "No pending challans found for this vehicle. All clear!"

### 5. Select Challans to Pay
- Present pending challans via `ask_user` (input_type "choice"):
  "Challan 1: Red Light Violation — Andheri Signal — 15-Feb-2026 — ₹1,000"
  "Challan 2: No Parking — MG Road — 20-Feb-2026 — ₹500"
  "Pay All Pending (₹1,500)"
- Allow user to select individual challans or pay all at once.
- If user disputes a challan, inform about the adjudication process.

### 6. Review & Confirm Payment
- Use `confirm_action`:
  - Vehicle number
  - Number of challans selected
  - For each challan: number, violation, date, location, amount
  - Total fine amount
  - Late payment surcharge (if applicable)
  - Grand total
- Do NOT proceed unless user confirms.

### 7. Payment
- Use `collect_payment`:
  - summary: JSON with vehicle_number, challans (array), total_fine, surcharge, grand_total
  - amount_inr: grand total
  - description: "eChallan traffic fine payment"
- WAIT for payment confirmation.
- Only proceed if payment confirmed.

### 8. Complete Payment & Final Confirmation
- Complete payment on the eChallan portal (netbanking / card / UPI / wallet).
- Handle OTP via `ask_user` if needed.
- Take snapshot of payment receipt page.
- Report:
  - Transaction ID / receipt number
  - Challans paid (numbers and amounts)
  - Total amount paid
  - Vehicle number
  - Payment date
- Mention: "Save the receipt. Challan status updates in 24-48 hours. If your license was impounded, visit the RTO with this receipt."

## Site Notes

- echallan.parivahan.gov.in is the official portal for traffic challan payment across India.
- Chrome Profile 3 (rsinghtomar3011@gmail.com) is used for browsing. Do NOT ask user for credentials.
- No login required for searching challans — it's a public lookup by vehicle/challan number.
- CAPTCHA is required for every search — may need user help via `ask_user`.
- Government portal can be very slow during peak hours — be patient with page loads and retries.
- Not all states have integrated with the eChallan system — some states use their own portals.
- Challans have a time limit — unpaid challans after 60-90 days may result in court summons.
- Late payment surcharge may apply depending on the state and duration of non-payment.
- Photo/video evidence is available for camera-based challans — can be viewed on the portal.
- Some violations carry license suspension — inform user if serious violations are found.
- Court challans (under adjudication) cannot be paid online — must appear in traffic court.
- Use `confirm_action` for review, `collect_payment` for payment. WAIT for user response.
