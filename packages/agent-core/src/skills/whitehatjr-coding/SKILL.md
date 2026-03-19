---
name: whitehatjr-coding
description: Enroll kids in coding classes on WhiteHat Jr — browse courses, select plan, book trial or subscribe, pay.
triggers:
  - whitehat jr
  - whitehatjr
  - coding classes for kids
  - kids coding
  - enroll coding class
  - whitehat jr coding
  - learn coding kids
  - kids programming class
  - coding for children
siteUrl: https://www.whitehatjr.com
requiresAuth: true
params:
  - name: child_age
    required: true
    hint: Child's age (e.g. "7 years", "10 years old")
  - name: course_type
    required: false
    hint: Course preference (e.g. "beginner coding", "app development", "AI", "game development")
  - name: plan_type
    required: false
    hint: Plan preference (trial class, monthly, quarterly, annual)
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, EMI, wallet)
---

# WhiteHat Jr Kids Coding Enrollment

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm the child's age and any coding experience level (beginner, some experience, advanced).
- Use `ask_user` to clarify preferences: course type (coding, app dev, game dev, AI/ML), schedule preference (weekday/weekend, time slots).
- If child's age not provided, ask via `ask_user` (input_type "freetext"): "How old is the child? WhiteHat Jr courses are designed for ages 6-18."
- Note: WhiteHat Jr offers 1-on-1 live classes — confirm if user wants trial or full enrollment.

### 2. Open WhiteHat Jr in a NEW Tab & Verify Login
- Open a NEW tab and navigate to `https://www.whitehatjr.com`.
- Take snapshot. Close any popup or promotional banner.
- Verify logged in (profile/account section in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Explore Available Courses
- Navigate to the courses section or use the age-based course finder.
- Take snapshot of available courses.
- Browse courses matching the child's age and interest:
  - Introduction to Coding (ages 6-8)
  - App Development (ages 8-14)
  - Game Development (ages 8-14)
  - AI & Machine Learning (ages 12-18)
  - Advanced Coding (ages 10-18)
- Extract details: course name, age range, curriculum highlights, number of classes, price.
- Use `ask_user` (input_type "choice") to present course options. Format: "Course Name — Age X-X — X classes — ₹X,XXX/month"

### 4. Select Plan & Schedule
- After user picks a course, show available plans:
  - Free trial class (1 class)
  - Monthly plan
  - Quarterly plan (usually discounted)
  - Annual plan (best value)
- Present plans with pricing via `ask_user` (input_type "choice").
- If user wants a trial first, book a free trial class.
- For paid plans, confirm schedule preferences: preferred days and time slots.
- Use `ask_user` (input_type "choice") to let user pick available time slots.

### 5. Fill Enrollment Details
- Enter child's details: name, age, grade.
- Enter parent's contact: name, email, phone (use `ask_user` if needed for child-specific info).
- Select the chosen course, plan, and schedule.
- Take snapshot of enrollment summary.

### 6. Review Enrollment
- Use `confirm_action` to present enrollment summary:
  - Child's name and age
  - Course selected and curriculum outline
  - Plan type (monthly/quarterly/annual) and duration
  - Schedule (days and time)
  - Total cost and any discounts
  - Free trial included or not
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 7. Payment
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with course, plan, schedule, duration, total cost, discount
  - amount_inr: total amount (number)
  - description: "WhiteHat Jr coding class enrollment"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 8. Complete Enrollment & Confirm
- Complete payment flow on site.
- Handle OTP via `ask_user` if needed.
- Take snapshot of enrollment confirmation page.
- Report: enrollment ID, course name, plan, schedule, first class date, total paid, teacher assignment (if shown).

## Site Notes

- WhiteHat Jr offers 1-on-1 live coding classes for ages 6-18. All classes are online.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- WhiteHat Jr is owned by BYJU'S — the platform may redirect or show BYJU'S branding.
- Free trial class is available — always offer this option before paid enrollment.
- Pricing varies by plan: monthly is most expensive per class, annual is cheapest. Expect ₹5,000-15,000/month.
- Classes are conducted by trained teachers — not pre-recorded. Schedule flexibility is high.
- WhiteHat Jr uses a proprietary coding platform — no installation required, works in browser.
- Refund policy: 100% refund if cancelled within the trial period. Partial refund after.
- EMI options available on annual plans — mention to user if the total is high.
- The site may push hard for enrollment — ignore upselling popups and focus on user's chosen plan.
- Use `confirm_action` for enrollment review (no money), `collect_payment` for actual payment.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
