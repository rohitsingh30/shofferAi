---
name: khan-academy
description: Start learning on Khan Academy — select subject, create personalized learning plan, track progress.
triggers:
  - khan academy
  - khan academy course
  - learn on khan academy
  - khan academy math
  - khan academy science
  - khan academy sat prep
  - free learning khan
  - khan academy class
  - khan academy subject
  - khanmigo
siteUrl: https://www.khanacademy.org
requiresAuth: true
params:
  - name: subject
    required: true
    hint: Subject or topic (e.g. "Algebra", "Biology", "Physics", "SAT prep", "Economics", "Computer Programming")
  - name: grade
    required: false
    hint: Grade level or course level (e.g. "Class 8", "Class 10", "AP", "college-level", "any")
  - name: goal
    required: false
    hint: Learning goal (e.g. "exam prep", "school supplement", "self-study", "catch up on basics")
  - name: khanmigo
    required: false
    hint: Whether to enable Khanmigo AI tutor (e.g. "yes", "no", "interested")
---

# Khan Academy Learning Setup

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Learning Requirements
- Confirm what the user wants to learn and their current level.
- Get: subject, grade/level, learning goal, interest in Khanmigo AI tutor.
- Use `ask_user` for missing critical info (subject at minimum).
- Ask: "Khan Academy is free for all content. Would you also like Khanmigo, the AI tutor assistant (paid)?"

### 2. Open Khan Academy
- Open a NEW tab and navigate to `https://www.khanacademy.org`.
- Take snapshot. Verify logged in (profile avatar in top-right).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Navigate to Subject
- Find the user's subject from the homepage, "Courses" menu, or search.
- Categories: Math (K-12 through college), Science (Biology, Chemistry, Physics), Computing, Economics, Arts & Humanities, SAT/LSAT prep.
- Take snapshot. Show the course structure and available units.
- Extract key info: number of units, lessons per unit, practice exercises, mastery challenges.
- Use `ask_user` (input_type "choice") to let user pick starting point:
  "Start from Unit 1 (Basics)", "Jump to Unit 4 (Intermediate)", "Take Course Challenge to find level", "Browse all units"

### 4. Review Course Structure
- Click the selected unit/starting point. Take snapshot.
- Summarize: unit topics, number of lessons, videos, articles, practice exercises per unit.
- Show the mastery system: how skills progress from "Not started" to "Familiar" to "Proficient" to "Mastered".
- If SAT/test prep, show practice test availability and score tracking.
- Explain the learning path and estimated time to complete.

### 5. Set Up Learning Plan
- Help user configure their learning dashboard.
- Set daily goal via `ask_user` (input_type "choice"):
  "15 minutes/day", "30 minutes/day", "45 minutes/day", "60 minutes/day"
- Enable progress tracking and mastery goals.
- Take snapshot of the configured learning dashboard.
- If user wants Khanmigo AI tutor, proceed to Step 6. Otherwise, skip to Step 8.

### 6. Khanmigo AI Tutor (If Requested)
- Navigate to Khanmigo subscription page. Take snapshot.
- Present options via `ask_user` (input_type "choice"):
  "Khanmigo Monthly — ₹350/month", "Khanmigo Annual — ₹3,500/year (₹292/month)", "Continue with Free Khan Academy only"
- Explain: Khanmigo provides AI-powered tutoring, essay feedback, debate practice, and personalized guidance.

### 7. Review & Confirm (Khanmigo Only)
- If subscribing to Khanmigo, proceed to checkout. Take snapshot.
- Use `confirm_action`:
  - Subject and course selected
  - Daily learning goal
  - Khanmigo plan and billing cycle
  - Features: AI tutoring, essay review, writing coach, debate partner
  - Free trial period (if available)
  - Total amount to pay
- Do NOT proceed unless user confirms.
- Use `collect_payment`:
  - summary: JSON with subject, course, khanmigo_plan, billing_cycle, features, total
  - amount_inr: total amount
  - description: "Khanmigo AI tutor subscription"
- WAIT for payment confirmation.

### 8. Complete & Confirm
- If Khanmigo, complete subscription. Handle OTP via `ask_user` if needed.
- Start the first lesson or practice exercise to verify setup.
- Take snapshot of the learning interface / first lesson.
- Report: subject and course, starting unit, daily goal, Khanmigo status, total paid (or "Free").
- Mention: "Khan Academy is completely free for all course content. Your learning plan is set up. Complete lessons and practice exercises daily to build mastery. Your progress is tracked and you can earn badges and energy points."

## Site Notes

- Khan Academy is a free, non-profit education platform — all courses, videos, and exercises are free forever.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator's email/Google.
- Khanmigo (AI tutor) is the only paid feature — everything else is completely free. Do not mislead users into thinking courses cost money.
- Khan Academy's mastery system tracks skill proficiency across topics — encourage users to aim for "Mastered" level.
- SAT prep on Khan Academy is officially partnered with College Board — high quality and free.
- Indian curriculum content (CBSE/NCERT) is available in Hindi and English — check user's board preference.
- Practice exercises are unlimited and adaptive — they adjust difficulty based on performance.
- Parent/teacher dashboards are available for monitoring student progress — mention if relevant.
- Use `confirm_action` and `collect_payment` ONLY for Khanmigo subscription. WAIT for user response at each step.
