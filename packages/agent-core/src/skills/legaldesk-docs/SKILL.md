---
name: legaldesk-docs
description: Create legal documents on LegalDesk — rent agreements, affidavits, power of attorney, wills, and other notarized documents with doorstep delivery.
triggers:
  - legaldesk
  - rent agreement online
  - create affidavit
  - legal document online
  - power of attorney
  - legaldesk rent agreement
  - notarized document
  - online affidavit india
siteUrl: https://legaldesk.com
requiresAuth: true
params:
  - name: document_type
    required: true
    hint: Type of legal document (e.g. "Rent Agreement", "Affidavit", "Power of Attorney", "Will", "Partnership Deed")
  - name: city
    required: false
    hint: City where the document is needed (for stamp duty and delivery)
  - name: parties
    required: false
    hint: Names of the parties involved (e.g. landlord and tenant names)
  - name: delivery_type
    required: false
    hint: Delivery preference (e.g. "doorstep delivery", "e-stamp only", "print at home")
---

# LegalDesk Legal Document Creation

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- BEFORE opening the browser, check what the user provided.
- If user did not specify document type, use `ask_user` (input_type "choice"): "What legal document do you need?" with options "Rent Agreement", "Affidavit", "Power of Attorney", "Will / Testament", "Partnership Deed", "Sale Deed", "Gift Deed", "Other".
- If city not specified, use `ask_user` (input_type "freetext"): "Which city do you need the document for? (Stamp duty varies by state/city)"
- If parties not specified, use `ask_user` (input_type "freetext"): "Please share the names of the parties involved (e.g. Landlord: John Doe, Tenant: Jane Smith)."
- For rent agreement: ask about property address, monthly rent, security deposit, lease duration, and start date if not provided.

### 2. Open LegalDesk in New Tab
- Open a NEW tab and navigate to `https://legaldesk.com`.
- Take a snapshot to see the landing page.
- Dismiss any promotional popups, cookie consent, offer banners, or chat widgets.
- Verify the document categories or main navigation is visible.

### 3. Verify Login
- Look for a profile icon, username, or "My Account" in the header.
- If signed in: proceed to document creation.
- If NOT signed in: Click "Login" or "Sign In", attempt login with rsinghtomar3011@gmail.com.
- If OTP or email verification appears, use `ask_user`: "LegalDesk needs verification. Please share the OTP sent to your registered phone/email."
- **If session expired or wrong account, STOP and tell user: "Session expired, please re-login to LegalDesk in Chrome Debug."**
- Take snapshot to confirm logged-in state.

### 4. Select Document Type & Template
- Navigate to the specific document category (e.g. "Rent Agreement", "Affidavits").
- Take snapshot of the document type page.
- If multiple templates exist (e.g. different affidavit types), present options via `ask_user` (input_type "choice"):
  - Template name and brief description
  - Price for each template
  - Whether e-stamp and notarization are included
- Select the appropriate template.
- Review inclusions: drafting, e-stamp paper, notarization, doorstep delivery.

### 5. Fill Document Details
- Click "Create Now" or "Draft Document" on the selected template.
- Fill in the document form step by step:
  - **For Rent Agreement**: landlord name/address, tenant name/address, property address, monthly rent, security deposit, lease start date, duration, maintenance charges, lock-in period, other clauses.
  - **For Affidavit**: deponent name, father's name, address, purpose, statement content.
  - **For Power of Attorney**: principal name, attorney name, powers granted, property details.
  - **For Will**: testator name, beneficiaries, asset distribution, executor name.
- Use `ask_user` (input_type "freetext") for each set of missing details.
- Take snapshot after filling each major section.
- Add any special clauses if user requests (e.g. pet policy, subletting rules, notice period).

### 6. Select Delivery & Stamp Paper
- Choose the delivery option:
  - Present via `ask_user` (input_type "choice"): "How would you like to receive the document?" with options:
    - "Doorstep delivery (printed on e-stamp paper, notarized)" with price
    - "E-stamp paper only (courier)" with price
    - "PDF draft only (no stamp paper)" with price
- Select city/state for stamp duty calculation.
- Take snapshot of the delivery and pricing page.
- Review stamp duty amount (varies by state — Maharashtra, Karnataka, etc.).

### 7. Review Document & Confirm
- Navigate to the document preview/review page.
- Take snapshot of the full document draft.
- Use `confirm_action` to present summary:
  - Document type and template
  - Party names and key details
  - Stamp duty amount
  - Professional fee
  - Delivery charges
  - Total amount payable
  - Delivery timeline (e.g. "3-5 business days for doorstep delivery")
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 8. Payment
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with document type, parties, key terms, stamp duty, professional fee, delivery fee, total
  - amount_inr: total amount including stamp duty (number)
  - description: "LegalDesk document creation"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.
- Complete payment on LegalDesk using available payment method.
- Handle payment OTP via `ask_user` if needed.

### 9. Confirmation & Tracking
- Take snapshot of the order confirmation page.
- Extract: order number, document type, delivery address, estimated delivery date, tracking info.
- Report full details to user:
  - Order/reference number
  - Document type created
  - Parties mentioned
  - Stamp duty and total amount paid
  - Delivery method and estimated date
  - Tracking link (if provided)
  - "You will receive the notarized document at your doorstep. Keep your ID proof ready for delivery verification."

## Site Notes

- Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Stamp duty varies significantly by state — Maharashtra charges 0.25% of annual rent for rent agreements, Karnataka charges 1%.
- LegalDesk offers doorstep delivery with notarization — this is the premium option and most convenient.
- Rent agreements in Maharashtra require mandatory registration if lease exceeds 11 months.
- LegalDesk may show a WhatsApp support widget — close if it interferes with forms.
- Session can expire during long forms — if login page reappears, STOP and inform user.
- LegalDesk uses standard HTML forms — use Playwright fill/type methods.
- Use `confirm_action` for document review, `collect_payment` for actual payment. WAIT for user response. Do NOT auto-proceed.
- E-stamp paper availability depends on state — some states only support physical stamp paper.
- Notarization requires witness signatures — LegalDesk provides witnesses as part of doorstep service.
- Documents can be edited before final printing — but NOT after e-stamp is generated.
- Delivery timelines vary: 2-3 days in metros, 5-7 days in other cities.
