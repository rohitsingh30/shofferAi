---
name: typeform-survey
description: Create Typeform surveys and quizzes with questions, logic jumps, and shareable links — beautiful form design.
triggers:
  - typeform
  - create survey
  - create typeform
  - survey form
  - typeform survey
  - create quiz
  - questionnaire
  - feedback form
  - typeform quiz
  - online survey
siteUrl: https://www.typeform.com
requiresAuth: true
params:
  - name: form_title
    required: true
    hint: Title for the form (e.g. "Customer Satisfaction Survey", "Team Feedback Quiz")
  - name: form_type
    required: false
    hint: Type — "survey", "quiz", "feedback", "registration", "poll"
  - name: questions
    required: false
    hint: Questions to include (e.g. "How satisfied are you? 1-5, What can we improve?, Would you recommend us?")
  - name: logic
    required: false
    hint: Logic jump rules (e.g. "If rating < 3, ask why dissatisfied")
  - name: thank_you_message
    required: false
    hint: Custom thank-you screen message
---

# Typeform Survey & Quiz Creation

Chrome profile: rsinghtomar3011@gmail.com (Typeform account signed in).

## Steps

### 1. Gather Requirements
- Confirm you have: form title.
- If form_title is missing, use `ask_user` (input_type "freetext"): "What should the form be called?"
- If form_type is missing, use `ask_user` (input_type "choice"): "What type? Survey / Quiz / Feedback Form / Registration / Poll"
- If questions not specified, use `ask_user` (input_type "freetext"): "What questions should be in the form? List them separated by commas or newlines."
- Suggest question types based on content:
  - Rating questions → Opinion Scale or Rating
  - Yes/No → Yes/No block
  - Open-ended → Short Text or Long Text
  - Multiple choice → Multiple Choice
- Default to 3-5 common questions for the form_type if user says "suggest some".

### 2. Open Typeform
- Open a NEW tab and navigate to `https://www.typeform.com`.
- Take a snapshot to see the dashboard or landing page.
- Dismiss any onboarding tours, "What's new" modals, or upgrade prompts.

### 3. Verify Authentication
- Check if you see the Typeform dashboard with existing forms/workspaces.
- If signed in: proceed to form creation.
- If NOT signed in: click "Login" → "Continue with Google" → select rsinghtomar3011@gmail.com.
- If CAPTCHA or 2FA appears, use `ask_user`: "Please complete Typeform sign-in in the browser. Type 'done' when finished."
- **If you see a login page or wrong account, STOP and tell the user: "Session expired, please re-login in Chrome Debug."**

### 4. Create New Form
- Click "+ Create typeform" or "New typeform" button on the dashboard.
- Typeform may show template options — select "Start from scratch" for blank or browse templates if user wants one.
- If form_type is "quiz", enable quiz mode in settings (Settings → Quiz → Toggle on).
- Wait for the form editor to load.
- Take a snapshot to confirm the editor is open.

### 5. Set Title & Welcome Screen
- Click the form title area and type the user's form_title.
- Configure the welcome screen:
  - Add a description/subtitle if appropriate.
  - Click "Start" button text to customize (e.g. "Begin Survey", "Take the Quiz").
- Take a snapshot of the welcome screen.

### 6. Add Questions
- For each question:
  - Click the "+" button or "Add new question" to add a question block.
  - Select the question type from the picker:
    - Multiple Choice, Short Text, Long Text, Opinion Scale, Rating, Yes/No, Dropdown, Email, Number, Date, File Upload, Picture Choice, Statement.
  - Type the question text.
  - For Multiple Choice: add answer options (click "+ Add choice" for each).
  - For Opinion Scale/Rating: set the scale range and labels.
  - For Quiz mode: mark correct answers and point values.
  - Set "Required" toggle if the question is mandatory.
- Arrange questions in logical order by dragging in the sidebar.
- Take a snapshot after adding all questions.

### 7. Configure Logic & Thank You Screen
- If logic jumps were requested:
  - Click "Logic" tab in the sidebar.
  - Add logic rules: "If answer to Q1 is X, jump to Q5" etc.
- Configure the thank-you/ending screen:
  - Click the ending screen in the sidebar.
  - Set custom message (use thank_you_message param or default "Thank you for your response!").
  - Optionally add a redirect URL or social sharing.
- Use `ask_user` (input_type "freetext"): "Form is set up. Want to add logic jumps, change any questions, or proceed?"
- Take a snapshot showing the completed form structure.

### 8. Preview & Share
- Click "Preview" button to see the form as respondents will.
- Take a snapshot of the preview.
- Click "Publish" to make the form live.
- Click "Share" to get the shareable link.
- Use `confirm_action`: "Survey ready to publish" with form title, question count, form type, share link.

### 9. Collect Service Fee
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with form_title, form_type, question_count, logic_rules, share_url
  - amount_inr: service fee amount (number)
  - description: "Typeform survey creation"
- STOP and WAIT for payment confirmation. If cancelled, form remains accessible.

### 10. Final Confirmation
- Take a final snapshot of the published form.
- Extract and report: form title, type, number of questions, share link, quiz mode status, logic rules added.
- Report full details to user with the direct share link.
- If any step failed, report the error and suggest next steps.

## Site Notes

- Chrome Profile 3 (rsinghtomar3011@gmail.com) has Typeform access. Do NOT ask user for credentials.
- Typeform session persists via cookies — may expire after 1-2 weeks. Re-login via Google SSO.
- Typeform editor is a React SPA — wait for question blocks to render before interacting.
- Each question is a "block" — one question per screen is Typeform's signature UX.
- Free tier: 10 questions per form, 10 responses per month, basic logic.
- Quiz mode: must be enabled in Settings before adding correct answers.
- Published forms get a URL like `https://{username}.typeform.com/to/{formId}`.
- "Publish" button is top-right — form is not live until published.
- Logic jumps: free tier supports basic logic; advanced branching needs paid plan.
- Typeform may show "Upgrade" prompts when adding >10 questions — respect free tier limits.
- Response data: accessible via "Results" tab in the editor.
