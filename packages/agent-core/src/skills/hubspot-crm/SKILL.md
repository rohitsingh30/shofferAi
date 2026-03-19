---
name: hubspot-crm
description: Add contacts, create deals, and manage leads in HubSpot CRM — sales pipeline and contact management.
triggers:
  - hubspot
  - add contact to hubspot
  - hubspot crm
  - create deal
  - add lead
  - crm contact
  - hubspot deal
  - sales pipeline
  - lead management
  - add to crm
siteUrl: https://app.hubspot.com
requiresAuth: true
params:
  - name: action
    required: true
    hint: What to do — "add_contact", "create_deal", "add_lead", "update_contact", "view_pipeline"
  - name: contact_name
    required: false
    hint: Contact's full name (e.g. "John Smith")
  - name: contact_email
    required: false
    hint: Contact's email address
  - name: company
    required: false
    hint: Company/organization name
  - name: deal_name
    required: false
    hint: Deal name (e.g. "Enterprise License — Acme Corp")
  - name: deal_amount
    required: false
    hint: Deal value in INR (e.g. "50000", "2 lakhs")
---

# HubSpot CRM Contact & Deal Management

Chrome profile: rsinghtomar3011@gmail.com (HubSpot account signed in).

## Steps

### 1. Gather Requirements
- Confirm you have: action type.
- If action is "add_contact" or "add_lead":
  - If contact_name missing, use `ask_user` (input_type "freetext"): "What's the contact's full name?"
  - If contact_email missing, use `ask_user` (input_type "freetext"): "What's their email address?"
  - If company missing, use `ask_user` (input_type "freetext"): "What company are they from? (or say 'skip')"
- If action is "create_deal":
  - If deal_name missing, use `ask_user` (input_type "freetext"): "What should the deal be called?"
  - If deal_amount missing, use `ask_user` (input_type "freetext"): "What's the deal value in INR?"
  - If contact_name/email missing, use `ask_user`: "Associate with a contact? Enter name/email or say 'skip'."
- If action is "view_pipeline": no additional params needed.

### 2. Open HubSpot
- Open a NEW tab and navigate to `https://app.hubspot.com`.
- Take a snapshot to see the dashboard or landing page.
- HubSpot may redirect to a specific portal URL like `https://app.hubspot.com/contacts/{portalId}/`.
- Dismiss any onboarding tours, "What's new" banners, or setup prompts.

### 3. Verify Authentication
- Check if you see the HubSpot dashboard with the navigation sidebar (Contacts, Deals, etc.).
- If signed in: verify the correct portal/account is active.
- If NOT signed in: click "Log in" → "Sign in with Google" → select rsinghtomar3011@gmail.com.
- If CAPTCHA or 2FA appears, use `ask_user`: "Please complete HubSpot sign-in in the browser. Type 'done' when finished."
- **If you see a login page or wrong account, STOP and tell the user: "Session expired, please re-login in Chrome Debug."**

### 4a. Add Contact (if action is add_contact or add_lead)
- Navigate to Contacts: click "Contacts" in the top nav → "Contacts".
- Click "Create contact" button (top-right).
- Fill in the contact creation form:
  - Email: enter contact_email.
  - First name / Last name: split contact_name and enter.
  - Phone number: enter if provided.
  - Company: enter company name if provided.
  - Job title: enter if provided.
  - Lead status: set to "New" for new leads.
  - Lifecycle stage: "Lead" for add_lead, "Other" for add_contact.
- Take a snapshot of the filled form.
- Click "Create contact" to save.
- Take a snapshot of the contact record page.

### 4b. Create Deal (if action is create_deal)
- Navigate to Deals: click "Sales" in the top nav → "Deals".
- Click "Create deal" button (top-right).
- Fill in the deal creation form:
  - Deal name: enter deal_name.
  - Pipeline: select the appropriate pipeline (default "Sales Pipeline").
  - Deal stage: use `ask_user` (input_type "choice"): "Deal stage? Appointment Scheduled / Qualified to Buy / Presentation Scheduled / Decision Maker Bought-In / Contract Sent / Closed Won / Closed Lost"
  - Amount: enter deal_amount.
  - Close date: set expected close date.
  - Associated contact: search and link if contact was provided.
  - Associated company: search and link if company was provided.
- Take a snapshot of the filled form.
- Click "Create" to save the deal.
- Take a snapshot of the deal record page.

### 4c. View Pipeline (if action is view_pipeline)
- Navigate to Deals: click "Sales" in the top nav → "Deals".
- Switch to "Board" view to see the pipeline visualization.
- Take a snapshot of the pipeline board.
- Extract summary: deal count per stage, total pipeline value.
- Report pipeline overview to user.

### 5. Verify & Confirm
- After creating contact or deal, verify the record was saved:
  - Check the contact/deal detail page shows all entered information.
  - Verify associations (contact-company, deal-contact) are linked.
- Use `confirm_action`: "CRM record created" with action performed, record details, and CRM URL.

### 6. Collect Service Fee
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with action, record_type, record_details, crm_url
  - amount_inr: service fee amount (number)
  - description: "HubSpot CRM management service"
- STOP and WAIT for payment confirmation. If cancelled, CRM record remains saved.

### 7. Final Confirmation
- Take a final snapshot of the completed record.
- Extract and report: action performed, record type, record details (name, email, company, deal amount), CRM record URL.
- Report full details to user with the direct record link.
- If any step failed, report the error and suggest next steps.

## Site Notes

- Chrome Profile 3 (rsinghtomar3011@gmail.com) has HubSpot CRM access. Do NOT ask user for credentials.
- HubSpot session persists via cookies — may expire after 1-2 weeks. Re-login via Google SSO.
- HubSpot is a heavy React SPA — pages load slowly, wait for spinners to disappear before interacting.
- Portal ID is in the URL: `https://app.hubspot.com/contacts/{portalId}/` — note it for navigation.
- Free CRM tier: unlimited contacts, basic deal pipeline, email tracking, forms.
- Contact properties: First name, Last name, Email, Phone, Company, Job title, Lifecycle stage, Lead status.
- Deal properties: Deal name, Amount, Close date, Pipeline, Deal stage, Associated contacts/companies.
- Navigation: top bar has Contacts, Companies, Deals, Tasks, Marketing, Sales, Service menus.
- Search: universal search bar at top — search contacts/deals/companies by name or email.
- Duplicate detection: HubSpot warns if a contact with the same email already exists.
- Activity timeline: on each contact/deal page, shows all interactions (emails, calls, notes, tasks).
