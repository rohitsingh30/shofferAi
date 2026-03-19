---
name: vakilsearch-legal
description: Register a company, trademark, or other legal service on VakilSearch — select service, fill details, submit application with payment.
triggers:
  - vakilsearch
  - register company
  - trademark registration
  - company registration india
  - vakilsearch legal
  - incorporate company
  - register trademark
  - pvt ltd registration
siteUrl: https://vakilsearch.com
requiresAuth: true
params:
  - name: service_type
    required: true
    hint: Type of legal service (e.g. "private limited company registration", "trademark registration", "GST registration")
  - name: company_name
    required: false
    hint: Proposed company or trademark name
  - name: directors
    required: false
    hint: Number of directors/partners and their names
  - name: business_activity
    required: false
    hint: Description of business activity for registration
---

# VakilSearch Legal Services

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- BEFORE opening the browser, check what the user provided.
- If user did not specify a service type, use `ask_user` (input_type "freetext"): "What legal service do you need on VakilSearch? (e.g. Private Limited Company Registration, Trademark Registration, GST Registration, LLP Registration)"
- If service involves company registration and no company name provided, use `ask_user` (input_type "freetext"): "What is the proposed company name? Provide 2-3 alternatives as MCA may reject the first choice."
- If directors/partners not specified, use `ask_user` (input_type "freetext"): "How many directors/partners? Please share their full names and email addresses."
- If business activity not specified, use `ask_user` (input_type "freetext"): "Briefly describe the main business activity (e.g. IT services, e-commerce, consulting)."

### 2. Open VakilSearch in New Tab
- Open a NEW tab and navigate to `https://vakilsearch.com`.
- Take a snapshot to see the landing page.
- Dismiss any promotional popups, cookie consent banners, chat widgets, or offer modals.
- Verify the main services menu or search bar is visible.

### 3. Verify Login
- Look for a profile icon, username, or "My Account" in the top-right header.
- If signed in: proceed to service selection.
- If NOT signed in: Click "Login" or "Sign In", attempt login with rsinghtomar3011@gmail.com.
- If OTP verification appears, use `ask_user`: "VakilSearch needs OTP verification. Please check your phone/email and share the OTP."
- **If session expired or wrong account, STOP and tell user: "Session expired, please re-login to VakilSearch in Chrome Debug."**
- Take snapshot to confirm logged-in state.

### 4. Select Service & Plan
- Navigate to the appropriate service page (e.g. Company Registration, Trademark Filing).
- Use the site navigation or search to find the exact service.
- Take snapshot of the service page.
- Review available plans/packages (Basic, Standard, Premium or similar tiers).
- Present plans via `ask_user` (input_type "choice"):
  - Plan name, price, and what is included
  - Government fees vs professional fees breakdown
  - Timeline for completion
  - Any add-ons (compliance package, trademark watch, etc.)
- If user wants to compare, show a summary of all tiers.

### 5. Fill Application Details
- Click "Get Started" or "Buy Now" for the selected plan.
- Fill in the application form with user-provided details:
  - Company/trademark name and alternatives
  - Director/partner details (name, email, phone, DIN if available)
  - Business activity description and NIC code selection
  - Registered office address (use `ask_user` if not provided)
  - Capital structure (authorized and paid-up capital)
- For trademark: class of goods/services, logo upload if needed.
- Take snapshot after filling each major section.
- Use `ask_user` (input_type "freetext") for any missing mandatory fields.

### 6. Review & Confirm Application
- Navigate to the application summary/review page.
- Take snapshot of the complete application details.
- Use `confirm_action` to present full summary:
  - Service selected and plan chosen
  - Company/trademark name
  - Director/partner details
  - Government fees + professional fees breakdown
  - Total amount payable
  - Estimated timeline for completion
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 7. Payment
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with service type, plan, company name, directors, fees breakdown, total
  - amount_inr: total amount including government fees (number)
  - description: "VakilSearch legal service"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.
- Complete payment on VakilSearch using available payment method.
- Handle payment OTP via `ask_user` if needed.

### 8. Confirmation & Next Steps
- Take snapshot of confirmation/receipt page.
- Extract: order number, service details, estimated timeline, assigned expert (if shown).
- Report full details to user:
  - Order/application number
  - Service and plan selected
  - Amount paid
  - Estimated completion timeline
  - Documents to be submitted (if any pending)
  - Assigned legal expert contact (if shown)
- Inform user about next steps: "VakilSearch will assign a legal expert who will contact you for document collection. Keep your Aadhaar, PAN, and address proof ready."

## Site Notes

- Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- VakilSearch shows government fees separately from professional fees — always show the full breakdown to user.
- Company registration requires DSC (Digital Signature Certificate) and DIN — VakilSearch handles these as part of the package.
- Trademark registration takes 6-8 months minimum — set expectations with user upfront.
- VakilSearch has a chat widget that may overlay form fields — close it if it interferes.
- Session can expire during long forms — if login page reappears, STOP and inform user.
- VakilSearch uses React — always use Playwright fill/type methods for form fields.
- Use `confirm_action` for application review, `collect_payment` for actual payment. WAIT for user response. Do NOT auto-proceed.
- Government fees are non-refundable — mention this to user before payment.
- VakilSearch may offer compliance packages as upsell — present to user but do not auto-add.
- Some services require physical document submission post-order — inform user about this.
