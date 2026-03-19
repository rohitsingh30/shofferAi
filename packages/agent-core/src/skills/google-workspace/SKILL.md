---
name: google-workspace
description: Create and manage Google Workspace documents — Docs, Sheets, Slides, Forms — with templates and sharing.
triggers:
  - google docs
  - create document
  - google sheets
  - create spreadsheet
  - google slides
  - create presentation
  - google workspace
  - make a doc
  - new spreadsheet
  - create a google doc
  - share document
  - google drive
siteUrl: https://docs.google.com
requiresAuth: true
params:
  - name: doc_type
    required: true
    hint: Type of document — "doc", "sheet", "slide", or "form"
  - name: title
    required: true
    hint: Title for the document (e.g. "Q3 Marketing Plan", "Budget 2026")
  - name: template
    required: false
    hint: Template preference (e.g. "blank", "resume", "project proposal", "monthly budget")
  - name: share_with
    required: false
    hint: Email addresses to share with (comma-separated)
  - name: content_brief
    required: false
    hint: Brief description of content to populate (e.g. "weekly team meeting agenda")
---

# Google Workspace Document Management

Chrome profile: rsinghtomar3011@gmail.com (Google account signed in).
Today's date: use JavaScript `new Date().toISOString().split('T')[0]` for date references.

## Steps

### 1. Gather Requirements
- Confirm you have: document type (doc/sheet/slide/form) and title.
- If doc_type is missing, use `ask_user` (input_type "choice"): "What type of document? Google Doc / Google Sheet / Google Slides / Google Form"
- If title is missing, use `ask_user` (input_type "freetext"): "What should the document be called?"
- Ask about template preference if not specified — present common templates for the chosen type.
- Default to blank template if user says "just blank" or skips.

### 2. Open Google Workspace
- Open a NEW tab and navigate to the appropriate URL based on doc_type:
  - Doc: `https://docs.google.com/document/u/0/`
  - Sheet: `https://docs.google.com/spreadsheets/u/0/`
  - Slide: `https://docs.google.com/presentation/u/0/`
  - Form: `https://docs.google.com/forms/u/0/`
- Take a snapshot to verify the landing page loaded.
- Dismiss any "Welcome" or "What's new" modals if they appear.

### 3. Verify Authentication
- Check the top-right avatar/profile icon for the signed-in account.
- If signed in as rsinghtomar3011@gmail.com: proceed.
- If NOT signed in: click "Sign in" → select rsinghtomar3011@gmail.com from account chooser.
- If CAPTCHA or 2FA appears, use `ask_user`: "Please complete Google sign-in in the browser. Type 'done' when finished."
- **If you see a login page or wrong account, STOP and tell the user: "Session expired, please re-login in Chrome Debug."**

### 4. Create New Document
- Click the "+" / "Blank" button or select the requested template from the template gallery.
- If user requested a specific template: click "Template gallery" → find and click the matching template.
- Wait for the new document to load in the editor.
- Take a snapshot to confirm the editor is open.

### 5. Set Title & Add Content
- Click the "Untitled document" / "Untitled spreadsheet" title area at the top.
- Clear existing text and type the user's requested title.
- If content_brief was provided, add initial content:
  - For Docs: type headings and placeholder sections matching the brief.
  - For Sheets: set up column headers and basic structure.
  - For Slides: add title slide and content slide placeholders.
  - For Forms: add the form title and initial questions.
- Take a snapshot to show progress.
- Use `ask_user` (input_type "freetext"): "Here's the document so far. Want me to add or change anything?"

### 6. Configure Sharing
- If share_with was provided or user requests sharing:
  - Click the blue "Share" button (top-right).
  - In the "Add people" field, type each email address.
  - Use `ask_user` (input_type "choice"): "What permission level? Viewer / Commenter / Editor"
  - Click "Send" to share.
- If no sharing requested, skip this step.
- Use `confirm_action`: "Document ready to finalize" with title, type, sharing status, and link.

### 7. Collect Service Fee
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with doc_type, title, template_used, shared_with, document_url
  - amount_inr: service fee amount (number)
  - description: "Google Workspace document creation"
- STOP and WAIT for payment confirmation. If cancelled, document remains accessible.

### 8. Final Confirmation
- Take a final snapshot of the completed document.
- Extract and report: document title, type, URL (from browser address bar), sharing status, template used.
- Report full details to user with the direct link.
- If any step failed, report the error and suggest next steps.

## Site Notes

- Chrome Profile 3 (rsinghtomar3011@gmail.com) has full Google Workspace access. Do NOT ask user for credentials.
- Google session rarely expires — cookies persist for weeks. If expired, re-login via Google account chooser.
- Template gallery button is at the top of the home page — click "Template gallery" to expand.
- New documents auto-save to Google Drive — no manual save needed.
- Share dialog: "Add people" field accepts emails; permission dropdown is next to each entry.
- Google Docs uses contenteditable divs — use Playwright type() not fill() for document body.
- Forms have a different UI — questions are added via "+" button on the floating toolbar.
- Sheets may show a "Explore" panel on first open — close it to avoid confusion.
- Document URL in the address bar is the permanent shareable link.
- Google may show "Try the new editor" banners — dismiss them.
- Rate limiting: creating many docs quickly may trigger CAPTCHA.
