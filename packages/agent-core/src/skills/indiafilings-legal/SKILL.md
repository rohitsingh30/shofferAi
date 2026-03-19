---
name: indiafilings-legal
description: Register a company, file compliance, or get legal services on IndiaFilings — company incorporation, annual filings, trademark, ISO certification.
triggers:
  - indiafilings
  - company registration indiafilings
  - indiafilings compliance
  - annual filing india
  - roc filing
  - company incorporation online
  - indiafilings trademark
  - iso certification india
siteUrl: https://www.indiafilings.com
requiresAuth: true
params:
  - name: service_type
    required: true
    hint: Type of service (e.g. "Private Limited Registration", "LLP Registration", "Annual ROC Filing", "Trademark", "ISO Certification")
  - name: entity_name
    required: false
    hint: Company or LLP name (provide 2-3 alternatives)
  - name: num_partners
    required: false
    hint: Number of directors or partners
  - name: state
    required: false
    hint: State of registration (e.g. "Karnataka", "Maharashtra", "Delhi")
---

# IndiaFilings Legal & Compliance Services

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- BEFORE opening the browser, check what the user provided.
- If user did not specify a service type, use `ask_user` (input_type "choice"): "What service do you need on IndiaFilings?" with options "Private Limited Company Registration", "LLP Registration", "One Person Company", "Annual ROC Filing", "Trademark Registration", "GST Registration", "ISO Certification", "Other".
- If service involves incorporation and no entity name, use `ask_user` (input_type "freetext"): "What is the proposed company/LLP name? Please provide 2-3 alternatives as MCA may reject the primary choice."
- If number of partners/directors not specified, use `ask_user` (input_type "freetext"): "How many directors/partners will be involved? Please share their full names."
- If state not specified, use `ask_user` (input_type "freetext"): "In which state should the company be registered? (Registered office state)"

### 2. Open IndiaFilings in New Tab
- Open a NEW tab and navigate to `https://www.indiafilings.com`.
- Take a snapshot to see the landing page.
- Dismiss any promotional popups, festive offers, chat widgets, or WhatsApp buttons.
- Verify the main navigation with service categories is visible.

### 3. Verify Login
- Look for a profile icon, username, or "My Account" link in the top-right header.
- If signed in: proceed to service selection.
- If NOT signed in: Click "Login" or "Sign In", attempt login with rsinghtomar3011@gmail.com.
- If OTP or email verification appears, use `ask_user`: "IndiaFilings needs verification. Please share the OTP sent to your registered email/phone."
- **If session expired or wrong account, STOP and tell user: "Session expired, please re-login to IndiaFilings in Chrome Debug."**
- Take snapshot to confirm logged-in state.

### 4. Select Service & Package
- Navigate to the specific service page using the site menu or URL.
- Take snapshot of the service detail page.
- Review available packages (Basic, Standard, Premium, or Fast Track):
  - What is included in each package
  - Government fees vs professional fees
  - Timeline for each package
  - Any add-ons (compliance kit, trademark search, accounting)
- Present packages via `ask_user` (input_type "choice"):
  - Package name with price
  - Key inclusions (DSC, DIN, name approval, incorporation certificate)
  - Estimated timeline
- If user wants more details, navigate to the comparison table.

### 5. Fill Application Form
- Click "Buy Now" or "Get Started" on the selected package.
- Fill the application form step by step:
  - Entity name and 2 alternatives
  - Director/partner details: name, father's name, DOB, email, phone, address
  - Business activity description
  - Registered office address and state
  - Authorized capital and paid-up capital (for company registration)
  - Designated partners (for LLP)
- Use `ask_user` (input_type "freetext") for any field not already provided.
- Take snapshot after completing each section of the form.
- For annual filings: enter CIN/LLPIN, financial year, and upload financial statements if needed.

### 6. Review Application & Confirm
- Navigate to the order summary/review page.
- Take snapshot of the complete application.
- Use `confirm_action` to present full summary:
  - Service type and package selected
  - Entity name (primary + alternatives)
  - Director/partner details
  - State of registration
  - Government fees + professional fees + GST breakdown
  - Total payable amount
  - Estimated timeline
  - Documents that will be needed post-order
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 7. Payment
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with service, package, entity name, directors, state, fee breakdown, total
  - amount_inr: total amount including government fees and GST (number)
  - description: "IndiaFilings legal service"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.
- Complete payment on IndiaFilings using available payment method.
- Handle payment OTP via `ask_user` if needed.

### 8. Confirmation & Document Submission
- Take snapshot of the order confirmation page.
- Extract: order number, service details, assigned expert, estimated timeline.
- Report full details to user:
  - Order/reference number
  - Service and package selected
  - Amount paid with breakdown
  - Assigned expert (name and contact if shown)
  - Estimated completion date
  - Documents to submit: Aadhaar, PAN, address proof, photos, rent agreement (for office address)
- Inform user: "IndiaFilings will assign a dedicated expert who will contact you within 24 hours for document collection. Keep Aadhaar, PAN, passport-size photos, and address proof ready."

## Site Notes

- Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- IndiaFilings separates government fees from professional fees — always show full breakdown to user.
- Company registration requires DSC (Digital Signature Certificate) for all directors — IndiaFilings handles this.
- MCA name approval can take 2-5 days and may be rejected — always provide alternative names.
- IndiaFilings has a WhatsApp chat widget and phone callback popup — close them if they interfere with the form.
- Annual ROC filings have strict deadlines — late filing attracts additional government penalty.
- Session can expire during long multi-step forms — if login page reappears, STOP and inform user.
- IndiaFilings uses standard HTML forms — use Playwright fill/type methods.
- Use `confirm_action` for application review, `collect_payment` for actual payment. WAIT for user response. Do NOT auto-proceed.
- Some services (like ISO certification) require a site audit — this is a post-payment physical step.
- IndiaFilings may offer compliance packages as annual subscriptions — present to user but do not auto-add.
- Government fees are non-refundable even if application is rejected — mention this before payment.
