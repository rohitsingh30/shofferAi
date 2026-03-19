---
name: cuemath-math
description: Enroll kids in Cuemath online math classes — select grade, plan, schedule, subscribe, pay.
triggers:
  - cuemath
  - cue math
  - math classes for kids
  - online math tutor
  - enroll cuemath
  - cuemath subscription
  - math tuition online
  - kids math classes
  - learn math online
siteUrl: https://www.cuemath.com
requiresAuth: true
params:
  - name: child_age
    required: true
    hint: Child's age or grade (e.g. "8 years", "Grade 4", "Class 6")
  - name: plan_type
    required: false
    hint: Plan preference (trial class, monthly, quarterly, annual)
  - name: schedule
    required: false
    hint: Preferred schedule (e.g. "weekends", "weekday evenings", "MWF 5pm")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, EMI, wallet)
---

# Cuemath Online Math Classes Enrollment

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm the child's age/grade and current math level (struggling, average, advanced).
- Use `ask_user` to clarify: specific math topics needed, school board (CBSE, ICSE, State, IB), schedule preferences.
- If grade not provided, ask via `ask_user` (input_type "freetext"): "What grade/class is the child in? Cuemath covers KG to Grade 12."
- Note: Cuemath offers 1-on-1 live math classes with personalized curriculum.

### 2. Open Cuemath in a NEW Tab & Verify Login
- Open a NEW tab and navigate to `https://www.cuemath.com`.
- Take snapshot. Close any popup, chatbot, or promotional overlay.
- Verify logged in (profile/account section in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Explore Math Programs
- Navigate to the programs/courses section.
- Take snapshot of available programs.
- Browse programs matching the child's grade:
  - KG-Grade 2: Number sense, counting, basic shapes, patterns
  - Grade 3-5: Arithmetic, fractions, decimals, geometry, word problems
  - Grade 6-8: Algebra, ratios, percentages, data handling, mensuration
  - Grade 9-10: Advanced algebra, trigonometry, coordinate geometry, statistics
  - Grade 11-12: Calculus, probability, competitive math (JEE/Olympiad)
- Extract details: program level, topics covered, class frequency, teacher quality, price.
- Use `ask_user` (input_type "choice") to present program options.

### 4. Select Plan & Schedule
- After user picks a program, show available plans:
  - Free trial class (1 session)
  - Monthly plan (4-8 classes/month)
  - Quarterly plan (discounted)
  - Semi-annual plan
  - Annual plan (best value)
- Present plans with pricing via `ask_user` (input_type "choice"). Format: "Plan — ₹X,XXX/month — X classes/month — Duration"
- Confirm schedule preferences: preferred days and time slots.
- Use `ask_user` (input_type "choice") to let user pick from available time slots.
- If user wants a trial first, book a free trial class.

### 5. Fill Enrollment Details
- Enter child's details: name, age, grade, school board.
- Enter parent's contact: name, email, phone (use `ask_user` if needed for child-specific info).
- Mention any specific math areas the child needs help with.
- Select the chosen program, plan, and schedule.
- Take snapshot of enrollment summary.

### 6. Review Enrollment
- Use `confirm_action` to present enrollment summary:
  - Child's name, age, and grade
  - Math program selected
  - Topics and curriculum outline
  - Plan type, duration, and class frequency
  - Schedule (days and time)
  - Total cost and any discounts
  - Free trial session if applicable
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 7. Payment
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with program, grade, plan, schedule, duration, classes per month, total cost, discount
  - amount_inr: total amount (number)
  - description: "Cuemath math classes enrollment"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 8. Complete Enrollment & Confirm
- Complete payment flow on site.
- Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: enrollment ID, program, grade, plan, schedule, first class date, assigned teacher (if shown), total paid.

## Site Notes

- Cuemath offers 1-on-1 live math classes with expert teachers. All classes are online via their platform.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- Cuemath covers KG to Grade 12 — math only, not other subjects.
- Pricing: Expect ₹3,000-8,000/month depending on grade and plan. Annual plans offer 20-40% discount.
- Free trial class is always available — recommend trying before committing to a paid plan.
- Cuemath uses a proprietary math learning platform with visual puzzles, worksheets, and games.
- Teachers are vetted and trained — Cuemath assigns teachers based on grade and availability.
- Classes are typically 45-60 minutes, 2-3 times per week.
- Cuemath follows school curriculum (CBSE, ICSE, State boards) plus enrichment topics.
- Competitive math prep (Olympiad, JEE foundation) available for higher grades.
- Refund policy: Full refund within 7 days. Pro-rata refund after initial period.
- Use `confirm_action` for enrollment review (no money), `collect_payment` for actual payment.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
