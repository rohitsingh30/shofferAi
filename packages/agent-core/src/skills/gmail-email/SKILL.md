---
name: gmail-email
description: Compose and send an email via Gmail — write subject, body, add attachments, CC/BCC, and send.
triggers:
  - gmail
  - send email
  - compose email
  - send mail
  - email via gmail
  - write email
  - gmail send
  - send an email
siteUrl: https://mail.google.com
requiresAuth: true
params:
  - name: to
    required: true
    hint: Recipient email address (e.g. "john@example.com")
  - name: subject
    required: true
    hint: Email subject line
  - name: body
    required: false
    hint: Email body content or key points to include
  - name: cc
    required: false
    hint: CC email addresses (comma-separated)
  - name: attachment
    required: false
    hint: Description of attachment to include (if any)
---

# Gmail Email Compose & Send

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- BEFORE opening the browser, check what the user provided.
- If user did not specify a recipient, use `ask_user` (input_type "freetext"): "Who do you want to send this email to? (email address)"
- If no subject provided, use `ask_user` (input_type "freetext"): "What should the email subject be?"
- If no body provided, use `ask_user` (input_type "freetext"): "What should the email say? (You can give key points and I'll draft it, or provide the full text)"
- If user mentioned an attachment, use `ask_user` (input_type "freetext"): "Please describe the attachment or confirm the file name to attach."
- If user gave key points instead of full text, draft a professional email body and present it for approval.

### 2. Open Gmail & Verify Login
- Open a NEW tab and navigate to `https://mail.google.com`.
- Take a snapshot. Check if logged in (profile icon in top-right, inbox visible).
- If NOT logged in, the Google login flow should auto-detect the Chrome profile session. Do NOT ask user for credentials.
- **If session expired or wrong account, STOP and tell user: "Session expired, please re-login to Gmail in Chrome Debug."**
- Verify the correct account is active (rsinghtomar3011@gmail.com). If wrong account, click the account switcher.
- Take snapshot to confirm inbox is visible.

### 3. Compose Email
- Click the "Compose" button (usually bottom-left or floating "+").
- Wait for the compose window to appear.
- Fill in the To field with the recipient email address.
- If CC was specified, click "Cc" link to expand, then fill in CC addresses.
- If BCC was specified, click "Bcc" link to expand, then fill in BCC addresses.
- Fill in the Subject field.
- Click the body area and type/paste the email body.
- Take snapshot of the composed email.

### 4. Add Attachment (if needed)
- If user requested an attachment:
  - Click the attachment icon (paperclip) in the compose toolbar.
  - Navigate to the file in the file picker dialog.
  - If file path is unclear, use `ask_user` (input_type "freetext"): "What is the file name or path of the attachment?"
  - Wait for upload to complete (progress bar finishes).
  - Take snapshot to confirm attachment is attached.
- If no attachment needed, skip this step.

### 5. Review & Confirm
- Take a final snapshot of the complete composed email.
- Use `confirm_action` to present email summary:
  - To: recipient(s)
  - CC/BCC: if any
  - Subject: subject line
  - Body: first 100 words preview
  - Attachment: file name (if any)
  - "Confirm you want to send this email?"
- Do NOT send unless user confirms.
- If user wants to edit, make the requested changes and re-confirm.

### 6. Send & Confirm
- Click the "Send" button (blue button in compose window).
- Take snapshot after sending (Gmail shows "Message sent" notification).
- Report to user:
  - Email sent successfully
  - To: recipient(s)
  - Subject: subject line
  - Attachment: included (if any)
  - "The email has been sent from rsinghtomar3011@gmail.com"

## Site Notes

- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in to Google. Do NOT ask user for credentials.
- Gmail may show promotional popups, Meet sidebar, or Chat sidebar — ignore them.
- The compose window may open as a small popup at bottom-right or as a full page — handle both.
- Gmail auto-saves drafts — if something goes wrong, the draft is preserved.
- For attachments, the file must be accessible on the operator's machine or via a URL.
- Gmail sessions persist for weeks via Chrome profile — rarely expires.
- Gmail uses a complex DOM — use aria-labels and role selectors where possible.
- Use `confirm_action` before sending (no money involved). WAIT for user response. Do NOT auto-send.
- If user asks to schedule send, use the dropdown arrow next to Send and pick "Schedule send".
- Maximum attachment size is 25MB. For larger files, Gmail auto-suggests Google Drive.
- If composing a reply, navigate to the thread first, then click Reply instead of Compose.
