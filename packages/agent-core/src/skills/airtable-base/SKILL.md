---
name: airtable-base
description: Create Airtable bases with tables, fields, views, and records — flexible database and project tracking.
triggers:
  - airtable
  - create airtable
  - airtable base
  - airtable database
  - create database
  - airtable table
  - spreadsheet database
  - create airtable base
  - airtable template
  - data tracker
siteUrl: https://airtable.com
requiresAuth: true
params:
  - name: base_name
    required: true
    hint: Name for the base (e.g. "Customer Tracker", "Content Calendar", "Inventory")
  - name: template
    required: false
    hint: Template preference (e.g. "blank", "project tracker", "content calendar", "CRM", "inventory")
  - name: tables
    required: false
    hint: Table names to create (e.g. "Contacts, Deals, Tasks")
  - name: fields
    required: false
    hint: Field/column definitions (e.g. "Name, Email, Phone, Status, Due Date")
  - name: share_with
    required: false
    hint: Email addresses of collaborators to invite
---

# Airtable Base Creation

Chrome profile: rsinghtomar3011@gmail.com (Airtable account signed in).

## Steps

### 1. Gather Requirements
- Confirm you have: base name.
- If base_name is missing, use `ask_user` (input_type "freetext"): "What should the Airtable base be called?"
- If template not specified, use `ask_user` (input_type "choice"): "Start from template or blank? Blank / Project Tracker / Content Calendar / CRM / Inventory / Event Planning"
- If tables not specified, suggest defaults based on template/purpose:
  - CRM: "Contacts, Companies, Deals, Activities"
  - Project Tracker: "Tasks, Projects, Team Members"
  - Content Calendar: "Content, Authors, Channels, Schedule"
- Use `ask_user` (input_type "freetext") to confirm tables or get custom ones.
- Default to one table matching base_name if user skips.

### 2. Open Airtable
- Open a NEW tab and navigate to `https://airtable.com`.
- Take a snapshot to see the dashboard or landing page.
- Dismiss any onboarding tours, "Welcome" modals, or feature announcements.

### 3. Verify Authentication
- Check if you see the Airtable home/dashboard with existing bases.
- If signed in: proceed to base creation.
- If NOT signed in: click "Sign in" → "Continue with Google" → select rsinghtomar3011@gmail.com.
- If CAPTCHA or 2FA appears, use `ask_user`: "Please complete Airtable sign-in in the browser. Type 'done' when finished."
- **If you see a login page or wrong account, STOP and tell the user: "Session expired, please re-login in Chrome Debug."**

### 4. Create New Base
- Click "+ Create" or "Add a base" on the dashboard.
- If user wants a template: select "Start with a template" → browse or search for the template → click "Use template".
- If blank: click "Start from scratch" or "Blank base".
- Wait for the base to be created and the table editor to load.
- Take a snapshot to confirm the base is open with a default table.

### 5. Configure Tables & Fields
- Rename the default table: double-click "Table 1" tab and type the first table name.
- For each additional table:
  - Click the "+" tab next to existing table tabs.
  - Type the table name and press Enter.
- For each table, set up fields/columns:
  - Click "+" at the end of the column headers to add a new field.
  - Choose field type (Single line text, Email, Phone, Single select, Date, Checkbox, etc.).
  - Name the field appropriately.
  - For Single select / Multiple select: add option values.
- Remove unwanted default fields if they don't match the user's needs.
- Take a snapshot showing the configured table structure.

### 6. Add Sample Records
- Use `ask_user` (input_type "freetext"): "Want me to add sample records? Describe them or say 'skip'."
- If user provides data, click into cells and enter the values.
- For select fields, type the value — Airtable auto-creates options.
- Take a snapshot after adding records.

### 7. Set Up Views
- Default view is "Grid view". If user wants additional views:
  - Click "Views" sidebar → "Create a view".
  - Choose: Grid, Kanban, Calendar, Gallery, Form, or Gantt.
  - Configure the view (group by, sort, filter as needed).
- Use `ask_user` (input_type "choice") if multiple view types could be useful: "Add a Kanban view? Yes / No"

### 8. Share & Confirm
- If share_with was provided:
  - Click "Share" button at the top-right.
  - Enter each email address and set permission (Creator, Editor, Commenter, Viewer).
  - Click "Invite" to share.
- Use `confirm_action`: "Airtable base ready" with base name, tables, fields, records count, views, sharing status, and base URL.

### 9. Collect Service Fee
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with base_name, tables, fields_per_table, records_added, views, shared_with, base_url
  - amount_inr: service fee amount (number)
  - description: "Airtable base creation and setup"
- STOP and WAIT for payment confirmation. If cancelled, base remains accessible.

### 10. Final Confirmation
- Take a final snapshot of the completed base.
- Extract and report: base name, URL (from address bar), tables created, fields per table, records added, views set up, sharing status.
- Report full details to user with the direct base link.
- If any step failed, report the error and suggest next steps.

## Site Notes

- Chrome Profile 3 (rsinghtomar3011@gmail.com) has Airtable access. Do NOT ask user for credentials.
- Airtable session persists via cookies — may expire after 1-2 weeks. Re-login via Google SSO.
- Airtable is a React SPA — wait for table grid to fully render before clicking cells.
- Field types: Single line text, Long text, Attachment, Checkbox, Single select, Multiple select, Date, Phone, Email, URL, Number, Currency, Percent, Duration, Rating, Formula, Rollup, Lookup, etc.
- Free tier: unlimited bases, 1000 records per base, 1 GB attachments, 5 views per table.
- Adding fields: "+" button at end of column headers opens field type picker.
- Cell editing: single-click selects, double-click or Enter to edit cell content.
- Tab key moves to next cell, Enter moves down — efficient for bulk data entry.
- Base URL format: `https://airtable.com/{baseId}/{tableId}/{viewId}` — copy from address bar.
- Airtable may show "Try Interface Designer" or "Automations" prompts — dismiss unless requested.
- Forms can be created as a view — useful for data collection and sharing publicly.
