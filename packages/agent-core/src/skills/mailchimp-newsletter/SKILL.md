---
name: mailchimp-newsletter
description: Create an email campaign on Mailchimp — design template, add content, select audience, schedule or send immediately.
triggers:
  - mailchimp
  - email campaign
  - newsletter
  - send newsletter
  - email marketing
  - create campaign
  - mailchimp campaign
  - bulk email
  - email blast
siteUrl: https://mailchimp.com
requiresAuth: true
params:
  - name: campaign_name
    required: true
    hint: Internal campaign name (e.g. "March Newsletter", "Product Launch")
  - name: subject
    required: true
    hint: Email subject line
  - name: content
    required: true
    hint: Description of email content (text, images, links, CTA)
  - name: audience
    required: false
    hint: Audience or list to send to (e.g. "All Subscribers", "VIP Customers")
  - name: schedule
    required: false
    hint: Send time ("now", "tomorrow 10am", specific date/time)
---

# Mailchimp Email Campaign

Chrome profile: rsinghtomar3011@gmail.com. Operator Mailchimp account.

## Steps

### 1. Gather Requirements
- Confirm you have: campaign name, subject line, and content description.
- If campaign name is missing, use `ask_user` (input_type "freetext"): "What's the internal name for this campaign? (e.g. 'March 2026 Newsletter')"
- If subject line is missing, use `ask_user` (input_type "freetext"): "What should the email subject line be?"
- If content is vague, use `ask_user` (input_type "freetext"): "Describe the email content — what text, images, links, and call-to-action buttons should it include?"
- Ask about target audience if not specified.
- Ask about send schedule if not specified.

### 2. Open Mailchimp in New Tab
- Open a NEW tab and navigate to `https://mailchimp.com`.
- Take a snapshot to see the landing page or dashboard.
- Dismiss any onboarding modals, upgrade banners, or tips.
- Verify the Mailchimp dashboard is visible with campaigns, audience, and analytics sections.

### 3. Verify Login
- Look for the account name, avatar, or organization in the top navigation.
- If signed in: proceed to campaign creation.
- If NOT signed in: Click "Log In", enter operator credentials or use Google SSO with rsinghtomar3011@gmail.com.
- If CAPTCHA or 2FA appears, use `ask_user`: "Please complete sign-in in the browser. Type 'done' when finished."
- **If you see a login page or wrong account, STOP and tell the user: "Session expired, please re-login in Chrome Debug."**
- Take snapshot to confirm logged-in state.

### 4. Create New Campaign
- Click "Create" button or navigate to Campaigns > "Create Campaign".
- Select "Email" as the campaign type.
- Select "Regular" email (not A/B test, automated, or plain text unless specified).
- Enter the campaign name.
- Take snapshot of the campaign setup page.

### 5. Configure Recipients
- Click "Add Recipients" or "To" field.
- Select the target audience/list from available audiences.
- If multiple audiences exist, use `ask_user` (input_type "choice") to select which audience.
- If user wants a segment: configure segment rules (tags, engagement, location, etc.).
- Verify recipient count and audience name.
- Take snapshot showing selected audience and recipient count.

### 6. Set Email Details
- Click "From" field: verify sender name and email address.
- Click "Subject" field: enter the subject line.
- Add preview text if user provided it (appears in inbox preview).
- Take snapshot showing all email details configured:
  - To: audience name and count
  - From: sender name and email
  - Subject: subject line
  - Preview text

### 7. Design Email Content
- Click "Design Email" to open the email builder.
- Choose a template: use `ask_user` (input_type "choice") to present options: "Basic", "Simple Text", "Newsletter Layout", "Product Promotion", "Announcement", "Start from scratch".
- In the drag-and-drop editor:
  - Edit header section: add logo or header image.
  - Edit body text: replace placeholder content with user's text.
  - Add images: upload or use stock images from Mailchimp library.
  - Add CTA buttons: set button text and link URL.
  - Edit footer: verify unsubscribe link, address, social links.
- Take snapshot after each major section is edited.
- Use `ask_user` (input_type "choice") to confirm each section: "Looks good", "Change text", "Change image", "Change layout".

### 8. Preview & Review
- Click "Preview" to see desktop and mobile preview.
- Take snapshot of desktop preview.
- Take snapshot of mobile preview.
- Use `confirm_action` to present campaign summary:
  - Campaign name and subject line
  - Recipient audience and count
  - Sender name and email
  - Preview of key content sections
  - Send schedule (now or scheduled)
- If user wants changes, go back to relevant step. If approved, proceed.

### 9. Schedule or Send
- If sending now: confirm with user one final time.
- If scheduling: click "Schedule", set date and time, select timezone.
- Use `ask_user` (input_type "choice") if schedule not specified: "Send Now", "Schedule for tomorrow morning (10 AM IST)", "Schedule for specific date/time".
- If scheduling for specific time, use `ask_user` (input_type "freetext"): "When should this email be sent? (e.g. 'March 20, 2026 at 10:00 AM IST')"

### 10. Payment & Send
- Check if Mailchimp plan supports the audience size.
- If paid plan features needed, use `collect_payment` to collect via Razorpay:
  - summary: JSON with campaign name, audience size, plan cost, features
  - amount_inr: plan cost (number)
  - description: "Mailchimp email campaign"
- STOP and WAIT for payment confirmation if applicable.
- Click "Send" or "Schedule" button.
- Handle any confirmation dialogs ("Are you sure you want to send?").
- Take snapshot of the send/schedule confirmation.

### 11. Final Confirmation
- Take snapshot of the campaign sent/scheduled page.
- Report full details to user:
  - Campaign name and status (Sent / Scheduled)
  - Subject line
  - Recipient count
  - Send date/time
  - Campaign report link (for tracking opens, clicks, etc.)
- Mention that campaign analytics will be available in the Reports section after delivery.

## Site Notes

- Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in to Mailchimp. Do NOT ask user for credentials.
- Mailchimp Free plan: up to 500 contacts, 1,000 sends/month, limited templates.
- Mailchimp Standard/Essentials: more contacts, advanced features, A/B testing.
- Email builder is drag-and-drop — click content blocks to edit, drag to reorder.
- Always keep the unsubscribe link in the footer — required by CAN-SPAM law.
- Sender email must be verified in Mailchimp settings before sending.
- Campaign preview shows both desktop and mobile layouts.
- Mailchimp may flag compliance issues (missing address, spam triggers in subject line).
- Use `confirm_action` for campaign review (before sending), `collect_payment` only if paid plan needed.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
- If session expired, re-login with operator account. Do NOT ask user for credentials.
