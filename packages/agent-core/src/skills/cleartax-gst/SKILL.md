---
name: cleartax-gst
description: File GST return on ClearTax — upload invoices, reconcile data, review summary, and file GSTR-1/GSTR-3B with payment.
triggers:
  - cleartax gst
  - file gst return
  - gst filing
  - cleartax
  - gstr-1 filing
  - gstr-3b filing
  - gst return online
  - upload gst invoices
siteUrl: https://cleartax.in/gst
requiresAuth: true
params:
  - name: return_type
    required: true
    hint: Type of GST return to file (e.g. "GSTR-1", "GSTR-3B", "GSTR-9")
  - name: filing_period
    required: true
    hint: Filing period (e.g. "March 2026", "Q4 FY 2025-26")
  - name: gstin
    required: false
    hint: GSTIN number of the business
  - name: invoice_source
    required: false
    hint: How to provide invoices (e.g. "upload Excel", "pull from Tally", "manual entry")
---

# ClearTax GST Return Filing

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- BEFORE opening the browser, check what the user provided.
- If user did not specify return type, use `ask_user` (input_type "choice"): "Which GST return do you need to file?" with options "GSTR-1 (Outward supplies)", "GSTR-3B (Monthly summary)", "GSTR-9 (Annual return)", "Other".
- If filing period not specified, use `ask_user` (input_type "freetext"): "What is the filing period? (e.g. March 2026, Q4 FY 2025-26)"
- If GSTIN not provided, use `ask_user` (input_type "freetext"): "Please share the GSTIN number for the business."
- Ask about invoice source: use `ask_user` (input_type "choice"): "How would you like to provide invoice data?" with options "Upload Excel/CSV", "Pull from Tally/Busy", "Manual entry", "Already uploaded on ClearTax".

### 2. Open ClearTax in New Tab
- Open a NEW tab and navigate to `https://cleartax.in/gst`.
- Take a snapshot to see the landing page.
- Dismiss any promotional popups, upgrade banners, or webinar notifications.
- Verify the GST dashboard or filing section is visible.

### 3. Verify Login
- Look for a profile icon, business name, or GSTIN in the header/sidebar.
- If signed in: verify the correct GSTIN is selected. If multiple GSTINs exist, select the correct one.
- If NOT signed in: Click "Login", attempt login with rsinghtomar3011@gmail.com.
- If OTP required, use `ask_user`: "ClearTax needs OTP verification. Please share the OTP sent to your registered mobile."
- **If session expired or wrong account, STOP and tell user: "Session expired, please re-login to ClearTax in Chrome Debug."**
- Take snapshot to confirm logged-in state with correct GSTIN.

### 4. Navigate to Return & Upload Invoices
- From the GST dashboard, select the correct return type (GSTR-1, GSTR-3B, etc.).
- Select the filing period specified by the user.
- Take snapshot of the return preparation page.
- If user wants to upload invoices:
  - Navigate to the upload section.
  - Use `ask_user` (input_type "freetext"): "Please prepare your invoice Excel/CSV file. I'll guide you to the upload button. Type 'ready' when the file is prepared."
  - Click the upload/import button and wait for file selection dialog.
  - Use `ask_user`: "Please select the invoice file in the file dialog. Type 'done' when uploaded."
- If invoices already exist on ClearTax, proceed to reconciliation.
- Take snapshot after upload shows success/error count.

### 5. Review & Reconcile Data
- Navigate to the summary/reconciliation page.
- Take snapshot of the invoice summary showing:
  - Total number of invoices
  - Total taxable value
  - CGST, SGST, IGST breakdowns
  - Any errors or mismatches flagged
- Present summary to user via `ask_user` (input_type "freetext"):
  - Total invoices: X
  - Total taxable value: Rs X
  - Total tax liability: Rs X (CGST + SGST + IGST)
  - Errors found: X invoices with issues
  - "Does this look correct? Type 'yes' to proceed or describe what needs fixing."
- If errors exist, help user resolve them one by one.

### 6. Confirm Filing Details
- Navigate to the final filing summary page.
- Take snapshot of the complete return summary.
- Use `confirm_action` to present filing summary:
  - Return type and filing period
  - GSTIN and business name
  - Total outward supplies (for GSTR-1)
  - Tax liability breakdown (CGST, SGST, IGST, Cess)
  - Late fee if applicable
  - Interest if filing is delayed
  - Total amount payable
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 7. Payment (if tax due)
- If there is tax liability or late fee to pay:
  - Use `collect_payment` to collect via Razorpay:
    - summary: JSON with return type, period, GSTIN, tax breakdown, late fee, interest, total
    - amount_inr: total tax + late fee + interest (number)
    - description: "ClearTax GST return filing"
  - STOP and WAIT for payment confirmation. If cancelled, ask what to change.
- Complete the GST payment challan on ClearTax.
- Handle OTP or EVC verification via `ask_user` if needed.
- If zero tax return (nil filing), skip payment and proceed directly.

### 8. File Return & Confirmation
- Click "File Return" or "Submit" on ClearTax.
- ClearTax will redirect to GST portal for OTP/DSC verification.
- Use `ask_user`: "GST portal needs verification. Please enter the OTP sent to the registered mobile on the GST portal. Type 'done' when complete."
- Take snapshot of the filing acknowledgment page.
- Report to user:
  - Return type and period filed
  - ARN (Acknowledgment Reference Number)
  - Filing date and time
  - Tax paid (if any)
  - Status: Filed successfully
  - "Download the acknowledgment from your ClearTax dashboard for records."

## Site Notes

- Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- ClearTax may have multiple GSTINs linked — always verify the correct GSTIN is selected before filing.
- GST filing requires OTP verification from GST portal — this is mandatory and cannot be skipped.
- Late filing attracts penalty of Rs 50/day (Rs 20/day for nil returns) — inform user about late fees upfront.
- GSTR-1 deadline is 11th of next month; GSTR-3B deadline is 20th of next month — mention if filing is overdue.
- ClearTax may show upgrade prompts for premium plans — dismiss unless user wants premium features.
- Invoice upload supports Excel (.xlsx), CSV, and JSON formats — guide user on correct template.
- ClearTax uses React — always use Playwright fill/type methods for form fields.
- Use `confirm_action` for filing review, `collect_payment` for tax payment. WAIT for user response. Do NOT auto-proceed.
- GST portal can be slow during peak filing dates (around deadlines) — be patient with page loads.
- Once filed, GST returns CANNOT be revised (except GSTR-9) — emphasize this before filing.
- If DSC (Digital Signature) is required instead of OTP, inform user they need the USB token plugged in.
