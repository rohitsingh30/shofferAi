---
name: toppr-learning
description: Subscribe to Toppr learning platform — K-12, exam prep, select class, plan, subscribe, pay.
triggers:
  - toppr
  - toppr learning
  - toppr subscription
  - enroll toppr
  - toppr exam prep
  - toppr classes
  - online learning toppr
  - toppr for kids
  - competitive exam prep toppr
siteUrl: https://www.toppr.com
requiresAuth: true
params:
  - name: child_class
    required: true
    hint: Child's class/grade (e.g. "Class 7", "Grade 10", "12th science")
  - name: board
    required: false
    hint: School board (CBSE, ICSE, State board, IB)
  - name: goal
    required: false
    hint: Learning goal (e.g. "school exams", "JEE", "NEET", "Olympiad", "NTSE")
  - name: plan_type
    required: false
    hint: Plan preference (monthly, annual, 2-year)
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, EMI, wallet)
---

# Toppr Learning Platform Subscription

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm the child's class/grade, school board, and learning goals.
- Use `ask_user` to clarify: primary goal (school exam improvement, competitive exam prep, foundation building), specific subjects or exams (JEE, NEET, Olympiad, NTSE, board exams).
- If class not provided, ask via `ask_user` (input_type "freetext"): "What class is the child in? Toppr covers Class 5 through Class 12."
- If board not provided, ask via `ask_user` (input_type "choice"): Present CBSE, ICSE, State Board options.
- Note: Toppr specializes in adaptive learning with AI-driven practice and doubt solving.

### 2. Open Toppr in a NEW Tab & Verify Login
- Open a NEW tab and navigate to `https://www.toppr.com`.
- Take snapshot. Close any popup, chatbot, or promotional overlay.
- Verify logged in (profile/account icon in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Select Class, Board & Goal
- Navigate to the appropriate section:
  - Class 5-8: Foundation courses, school syllabus, Olympiad prep
  - Class 9-10: Board exam prep (CBSE/ICSE), NTSE, Olympiad
  - Class 11-12 Science: JEE Main/Advanced, NEET, board exams
  - Class 11-12 Commerce: CA Foundation, board exams
- Select the exact class, board, and exam/goal.
- Take snapshot of available learning tracks.

### 4. Explore Features & Content
- Browse available content for the selected class and goal:
  - Video lessons (chapter-wise with animations)
  - Adaptive practice (AI-driven question selection)
  - Instant doubt solving (24/7 text/image-based)
  - Mock tests and previous year papers
  - Performance analytics and weak area identification
  - Live classes (if available for the selected plan)
- Present key features and subject coverage to user.
- Use `ask_user` (input_type "choice") if multiple learning tracks are available.

### 5. Select Subscription Plan
- Show available plans:
  - Monthly plan (basic access)
  - Quarterly plan
  - Semi-annual plan
  - Annual plan (recommended, most features)
  - 2-year plan (best value for exam prep)
  - JEE/NEET specific plans (if applicable)
- Present plans with pricing via `ask_user` (input_type "choice"). Format: "Plan — ₹X,XXX — Duration — Features"
- Mention any ongoing offers or seasonal discounts.
- For competitive exam students, recommend longer plans aligned with exam timeline.

### 6. Fill Registration Details
- Enter child's details: name, class, school board, target exam (if any).
- Enter parent's contact: name, email, phone (use `ask_user` if needed).
- Select the chosen plan and learning track.
- Take snapshot of subscription summary.

### 7. Review Subscription
- Use `confirm_action` to present subscription summary:
  - Child's name, class, and board
  - Learning goal / target exam
  - Subjects covered
  - Plan type and duration
  - Features included (videos, adaptive practice, doubt solving, mock tests, live classes)
  - Total cost and any discounts
  - Start date and validity
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 8. Payment
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with class, board, goal, subjects, plan, duration, features, total cost, discount
  - amount_inr: total amount (number)
  - description: "Toppr learning platform subscription"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 9. Complete Subscription & Confirm
- Complete payment flow on site.
- Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: subscription ID, class, board, goal, plan duration, total paid, app download instructions, login credentials if separate.

## Site Notes

- Toppr focuses on K-12 adaptive learning and competitive exam prep (JEE, NEET, Olympiad, NTSE).
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- Toppr is now part of BYJU'S group — the platform may show BYJU'S branding or redirect.
- Pricing: Expect ₹5,000-20,000/year depending on class and plan. JEE/NEET plans are premium.
- Toppr's USP is adaptive practice — the AI adjusts difficulty based on student performance.
- Doubt solving is 24/7 — students can upload photo of a question and get step-by-step solutions.
- Free trial available — always offer before paid enrollment.
- Toppr works on web, Android, and iOS — subscription is cross-platform.
- For JEE/NEET prep, recommend starting in Class 11 with a 2-year plan for best results.
- EMI options available on annual and 2-year plans — mention if total exceeds ₹10,000.
- Mock tests simulate actual exam patterns (JEE, NEET, board) — valuable for exam students.
- Use `confirm_action` for subscription review (no money), `collect_payment` for actual payment.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
