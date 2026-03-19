---
name: byju-kids
description: Enroll kids in BYJU'S Early Learn program — K-3 learning, select class, plan, subscribe, pay.
triggers:
  - byjus
  - byju's
  - byju kids
  - byjus early learn
  - enroll byjus
  - kids learning app
  - byjus subscription
  - early learn program
  - byjus classes for kids
siteUrl: https://byjus.com
requiresAuth: true
params:
  - name: child_age
    required: true
    hint: Child's age or class (e.g. "5 years", "Class 2", "LKG")
  - name: subject
    required: false
    hint: Subject preference (e.g. "math", "science", "english", "all subjects")
  - name: plan_type
    required: false
    hint: Plan preference (monthly, annual, 2-year)
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, EMI, wallet)
---

# BYJU'S Early Learn Enrollment

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm the child's age, class/grade, and learning goals.
- Use `ask_user` to clarify: specific subjects needed (Math, Science, English, EVS), current school board (CBSE, ICSE, State), any learning challenges.
- If child's class not provided, ask via `ask_user` (input_type "freetext"): "What class/grade is the child in? (e.g. LKG, UKG, Class 1, Class 2, Class 3)"
- Note: BYJU'S Early Learn covers LKG to Class 3. For higher classes, BYJU'S Learning App is used instead.

### 2. Open BYJU'S in a NEW Tab & Verify Login
- Open a NEW tab and navigate to `https://byjus.com`.
- Take snapshot. Close any popup, promotional overlay, or video autoplay.
- Verify logged in (profile icon or name in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Navigate to Early Learn Program
- Navigate to the Early Learn section (or search for "Early Learn" / "K-3").
- Take snapshot of available programs.
- Browse programs matching the child's class:
  - LKG/UKG: Disney-themed learning, phonics, numbers, shapes
  - Class 1: Math fundamentals, English reading, EVS basics
  - Class 2: Math (addition, subtraction, multiplication), English grammar, Science
  - Class 3: Math (fractions, geometry), Science experiments, English comprehension
- Extract details: program name, class level, subjects covered, learning approach, price.
- Use `ask_user` (input_type "choice") to present program options.

### 4. Select Plan & Features
- After user picks a program, show available subscription plans:
  - Monthly plan
  - Annual plan (usually 30-40% discount)
  - 2-year plan (best value)
  - BYJU'S tablet bundle (learning app + tablet)
- Present plans with pricing via `ask_user` (input_type "choice"). Format: "Plan — ₹X,XXX — Duration — Subjects Included"
- Clarify what is included: video lessons, interactive quizzes, personalized learning path, doubt resolution, progress reports.
- If user asks about free trial, check for available trial period.

### 5. Fill Enrollment Details
- Enter child's details: name, age, class/grade, school board.
- Enter parent's contact: name, email, phone (use `ask_user` if needed for child-specific info).
- Select the chosen program, plan, and start date.
- Take snapshot of enrollment summary.

### 6. Review Enrollment
- Use `confirm_action` to present enrollment summary:
  - Child's name, age, and class
  - Program selected (Early Learn / specific class)
  - Subjects and curriculum covered
  - Plan type and duration
  - Total cost, any discounts, EMI option
  - Free trial period if applicable
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 7. Payment
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with program, class, plan, duration, subjects, total cost, discount, EMI details
  - amount_inr: total amount (number)
  - description: "BYJU'S Early Learn enrollment"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 8. Complete Enrollment & Confirm
- Complete payment flow on site.
- Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: enrollment ID, program name, class, plan duration, total paid, app download instructions, first lesson start date.

## Site Notes

- BYJU'S Early Learn is for LKG to Class 3. For Class 4-12, use the regular BYJU'S Learning App.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- BYJU'S site is aggressive with popups and callback requests — dismiss all popups, do not fill callback forms.
- Pricing is not always visible on the website — may need to go through the enrollment flow to see prices.
- Expect ₹10,000-30,000/year depending on class and plan. EMI options available.
- BYJU'S may push tablet bundles (₹15,000-25,000) — only recommend if user asks for it.
- Free trial typically available for 7-15 days — always offer before paid enrollment.
- Learning content is available on mobile app (Android/iOS) and tablet — not just web.
- BYJU'S uses Disney characters for Early Learn — engaging for younger kids (LKG-Class 1).
- Refund policy: Full refund within 15 days of purchase. After that, pro-rata refund may be available.
- Use `confirm_action` for enrollment review (no money), `collect_payment` for actual payment.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
