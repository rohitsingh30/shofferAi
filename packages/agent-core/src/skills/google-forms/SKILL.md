---
name: google-forms
description: Create a Google Form survey — add questions, configure settings, customize theme, and share the form link.
triggers:
  - google form
  - create form
  - create survey
  - google forms
  - make a form
  - survey form
  - questionnaire
  - feedback form
siteUrl: https://docs.google.com/forms
requiresAuth: true
params:
  - name: title
    required: true
    hint: Title of the form (e.g. "Customer Feedback", "Event RSVP", "Job Application")
  - name: questions
    required: true
    hint: List of questions to include (e.g. "Name, Email, Rating 1-5, Comments")
  - name: description
    required: false
    hint: Form description or instructions for respondents
---

# Google Forms Survey Creation

Chrome profile: rsinghtomar3011@gmail.com. Operator Google account.

## Steps

### 1. Gather Requirements
- Confirm you have: form title and list of questions.
- If title is missing, use `ask_user` (input_type "freetext"): "What should the form be titled?"
- If questions are missing or vague, use `ask_user` (input_type "freetext"): "List the questions you want in the form. For each, mention the type if needed (multiple choice, short answer, rating, dropdown, etc.)"
- Clarify question types if not specified: short answer, paragraph, multiple choice, checkboxes, dropdown, linear scale, date, time, file upload.
- Ask about form description/instructions if not provided.

### 2. Open Google Forms in New Tab
- Open a NEW tab and navigate to `https://docs.google.com/forms`.
- Take a snapshot to see the Google Forms homepage.
- Dismiss any promotional banners or tips dialogs.
- Verify the forms dashboard is visible with "Blank" and template options.

### 3. Verify Login
- Look for the Google account avatar in the top-right corner.
- If signed in as rsinghtomar3011@gmail.com: proceed.
- If NOT signed in or different account: Click account switcher, select rsinghtomar3011@gmail.com.
- If login required, enter credentials and handle 2FA if prompted.
- **If you see a login page or wrong account, STOP and tell the user: "Session expired, please re-login in Chrome Debug."**
- Take snapshot to confirm correct account is active.

### 4. Create New Form
- Click "Blank" (the + icon) to create a new blank form.
- Wait for the form editor to load.
- Take snapshot of the blank form editor.
- Click on "Untitled form" and type the form title.
- Click on "Form description" and type the description if provided.
- Take snapshot showing title and description set.

### 5. Add Questions
- For each question the user specified:
  - Click the "+" (Add question) button in the floating toolbar.
  - Type the question text in the "Untitled Question" field.
  - Select the appropriate question type from the dropdown (Short answer, Paragraph, Multiple choice, Checkboxes, Dropdown, Linear scale, Date, Time, File upload).
  - If multiple choice/checkboxes/dropdown: add all answer options.
  - If linear scale: set the range (e.g. 1-5, 1-10) and labels.
  - Toggle "Required" if the question should be mandatory.
  - Take snapshot after adding each question.
- If user didn't specify question types, use sensible defaults:
  - Name/Email: Short answer (required)
  - Comments/Feedback: Paragraph
  - Ratings: Linear scale (1-5)
  - Yes/No: Multiple choice
  - Categories: Dropdown

### 6. Configure Form Settings
- Click the gear icon (Settings) at the top.
- Configure based on user needs:
  - Collect email addresses: enable if form collects emails.
  - Limit to 1 response: enable if appropriate.
  - Allow response editing: configure as needed.
  - Show progress bar: enable for long forms.
  - Shuffle question order: usually off.
  - Confirmation message: set a thank-you message.
- Close settings dialog.
- Take snapshot of configured form.

### 7. Review Form
- Scroll through the entire form to verify all questions.
- Click "Preview" (eye icon) to see the respondent view.
- Take snapshot of the preview.
- Use `confirm_action` to present form summary:
  - Form title and description
  - Number of questions with types
  - Required fields listed
  - Settings summary (email collection, response limit, etc.)
- If user wants changes, go back and edit. If approved, proceed.

### 8. Share Form Link
- Click the "Send" button at the top-right.
- Click the link icon (chain link) to get the shareable URL.
- Check "Shorten URL" if available.
- Copy the form link.
- Take snapshot of the share dialog.
- Report to user:
  - Form title
  - Shareable link
  - Number of questions
  - Form edit link (for future modifications)
- Use `ask_user` (input_type "choice") if user wants additional sharing: "Copy link only", "Share via email", "Embed HTML code", "Share on social media".

### 9. Final Confirmation
- Take snapshot of the completed form in editor view.
- Report full summary to user:
  - Form title and link
  - All questions listed
  - Settings applied
  - How to view responses (Google Sheets integration)
- Mention that responses will appear in the "Responses" tab and can be exported to Google Sheets.

## Site Notes

- Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in to Google. Do NOT ask user for credentials.
- Google Forms is free with unlimited questions and responses.
- Forms are saved automatically to Google Drive — no manual save needed.
- The floating toolbar on the right has: add question, import, title/description, image, video, section.
- Question type dropdown appears when you click the question type icon (default is Multiple choice).
- "Required" toggle is at the bottom-right of each question card.
- For file upload questions: respondents must be signed into Google.
- Google Forms uses Material Design — elements may have loading animations.
- Form responses can be linked to Google Sheets for analysis.
- Use `confirm_action` for form review. No payment needed for Google Forms.
- When using confirm_action, WAIT for user response. Do NOT auto-proceed.
- If session expired, re-login with operator Google account. Do NOT ask user for credentials.
