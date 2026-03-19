---
name: extramarks-learning
description: Subscribe to Extramarks e-learning platform — K-12, select class, subjects, plan, subscribe, pay.
triggers:
  - extramarks
  - extra marks
  - extramarks subscription
  - enroll extramarks
  - online classes extramarks
  - extramarks learning
  - e-learning for kids
  - extramarks k12
  - school learning online
siteUrl: https://www.extramarks.com
requiresAuth: true
params:
  - name: child_class
    required: true
    hint: Child's class/grade (e.g. "Class 5", "Grade 8", "12th CBSE")
  - name: board
    required: false
    hint: School board (CBSE, ICSE, State board, IB)
  - name: subjects
    required: false
    hint: Subjects needed (e.g. "all subjects", "math and science", "JEE prep")
  - name: plan_type
    required: false
    hint: Plan preference (monthly, annual, 2-year)
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, EMI, wallet)
---

# Extramarks E-Learning Subscription

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm the child's class/grade, school board, and subjects needed.
- Use `ask_user` to clarify: specific subjects (Math, Science, English, Social Studies, Hindi), learning goals (school syllabus, exam prep, competitive exams), current performance level.
- If class not provided, ask via `ask_user` (input_type "freetext"): "What class is the child in? (e.g. Class 1 through Class 12)"
- If board not provided, ask via `ask_user` (input_type "choice"): Present CBSE, ICSE, State Board options.
- Note: Extramarks covers K-12 across multiple boards.

### 2. Open Extramarks in a NEW Tab & Verify Login
- Open a NEW tab and navigate to `https://www.extramarks.com`.
- Take snapshot. Close any popup, chatbot, or promotional overlay.
- Verify logged in (profile/account icon in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Select Class & Board
- Navigate to the appropriate section based on child's class level:
  - Primary (Class 1-5): Foundational learning, animated lessons
  - Middle School (Class 6-8): Detailed subject coverage, practice tests
  - Secondary (Class 9-10): Board exam preparation, NTSE prep
  - Senior Secondary (Class 11-12): Board + competitive exam prep (JEE, NEET)
- Select the exact class and school board.
- Take snapshot of available learning modules.

### 4. Explore Content & Features
- Browse available content for the selected class:
  - Video lessons (chapter-wise, concept-wise)
  - Interactive quizzes and practice tests
  - NCERT solutions and textbook resources
  - Live doubt resolution
  - Performance tracking and reports
  - Sample papers and previous year papers (for board exam classes)
- Present key features and subject coverage via `ask_user` (input_type "choice").
- If user needs specific subjects only, note for plan selection.

### 5. Select Subscription Plan
- Show available plans:
  - Monthly plan
  - Quarterly plan
  - Semi-annual plan
  - Annual plan (recommended, best value)
  - 2-year plan (if available)
- Present plans with pricing via `ask_user` (input_type "choice"). Format: "Plan — ₹X,XXX — Duration — Subjects Included"
- Mention any ongoing offers or back-to-school discounts.
- Clarify: all subjects included or subject-wise pricing (varies by class level).

### 6. Fill Registration Details
- Enter child's details: name, class, school board, school name.
- Enter parent's contact: name, email, phone (use `ask_user` if needed).
- Select the chosen plan and subjects.
- Take snapshot of subscription summary.

### 7. Review Subscription
- Use `confirm_action` to present subscription summary:
  - Child's name, class, and board
  - Subjects covered
  - Plan type and duration
  - Features included (videos, tests, live classes, doubt resolution)
  - Total cost and any discounts
  - Start date and validity
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 8. Payment
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with class, board, subjects, plan, duration, features, total cost, discount
  - amount_inr: total amount (number)
  - description: "Extramarks e-learning subscription"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 9. Complete Subscription & Confirm
- Complete payment flow on site.
- Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: subscription ID, class, board, subjects, plan duration, total paid, app download instructions, login credentials if separate.

## Site Notes

- Extramarks covers K-12 across CBSE, ICSE, and multiple State Boards with comprehensive content.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- Extramarks has both web and mobile app — subscription works across all devices.
- Pricing varies significantly by class: Primary (₹5,000-10,000/yr), Secondary (₹8,000-15,000/yr), Sr. Secondary (₹10,000-20,000/yr).
- Content is board-aligned — NCERT-based for CBSE, board-specific textbooks for others.
- Live classes and doubt resolution may have separate scheduling — confirm availability.
- Free trial/demo available — always offer before committing to a paid plan.
- EMI options available on annual and 2-year plans — inform user if total is high.
- Extramarks also offers school partnerships — individual subscription may differ from school-provided access.
- Performance reports sent to parents via email/app — useful for tracking progress.
- Use `confirm_action` for subscription review (no money), `collect_payment` for actual payment.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
