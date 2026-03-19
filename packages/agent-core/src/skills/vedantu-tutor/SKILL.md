---
name: vedantu-tutor
description: Book live tutoring sessions on Vedantu — select subject, grade, and schedule 1-on-1 or group classes.
triggers:
  - vedantu
  - vedantu tutor
  - book vedantu class
  - vedantu live class
  - vedantu tutoring
  - online tutor vedantu
  - vedantu session
  - vedantu maths class
  - vedantu science class
  - vedantu jee neet
siteUrl: https://www.vedantu.com
requiresAuth: true
params:
  - name: subject
    required: true
    hint: Subject or exam (e.g. "Mathematics", "Physics", "Chemistry", "JEE Main", "NEET", "CBSE Class 10")
  - name: grade
    required: false
    hint: Class/grade level (e.g. "Class 8", "Class 10", "Class 12", "IIT-JEE", "NEET")
  - name: session_type
    required: false
    hint: Session type (e.g. "1-on-1 tutoring", "group live class", "crash course")
  - name: schedule
    required: false
    hint: Preferred timing (e.g. "weekday evenings", "weekends", "morning batch")
---

# Vedantu Live Tutoring Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Tutoring Requirements
- Confirm what subject and grade the user needs tutoring for.
- Get: subject, grade/class, session type preference (1-on-1 vs group), schedule preference.
- Use `ask_user` for missing critical info (subject and grade at minimum).
- Ask: "Do you want a 1-on-1 personal tutor session or a group live class?"

### 2. Open Vedantu
- Open a NEW tab and navigate to `https://www.vedantu.com`.
- Take snapshot. Verify logged in (profile icon or name in top-right).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Navigate to Subject & Grade
- Find the user's grade and subject from the homepage or navigation menu.
- Categories: CBSE, ICSE, State Board, JEE, NEET, Foundation courses.
- Take snapshot. Browse available courses, batches, and live class schedules.
- Extract top 3-5 options: course/batch name, teacher, schedule, number of sessions, student reviews, price.
- Use `ask_user` (input_type "choice") to let user pick:
  "CBSE Class 10 Maths — Master Teacher Anand — Mon/Wed/Fri 6PM — 60 sessions — 4.8★ — ₹15,000"

### 4. Review Course & Teacher Details
- Click the selected course or teacher profile. Take snapshot.
- Summarize: syllabus coverage, number of sessions, session duration, teacher qualifications, teaching methodology, recorded class availability.
- Show teacher stats: experience, students taught, average rating.
- If user wants to compare teachers or batches, navigate back and show alternatives.

### 5. Select Plan & Schedule
- Navigate to pricing/enrollment page. Take snapshot.
- Present plan options via `ask_user` (input_type "choice"):
  "Monthly — ₹2,500/month", "Quarterly — ₹6,000 (₹2,000/month)", "Annual — ₹15,000 (₹1,250/month)"
- Highlight: number of live sessions per week, doubt-solving sessions, test series, recorded lectures included.
- If 1-on-1, show per-session pricing and available time slots.

### 6. Review & Confirm
- Proceed to checkout page. Take snapshot.
- Use `confirm_action`:
  - Subject and grade
  - Course/batch name and teacher
  - Session type (1-on-1 or group)
  - Schedule and number of sessions
  - Plan selected and duration
  - Features: live classes, recordings, doubt sessions, tests
  - Original price vs discounted price
  - Total amount to pay
- Do NOT proceed unless user confirms.

### 7. Payment
- Use `collect_payment`:
  - summary: JSON with subject, grade, batch, teacher, plan, sessions, schedule, total
  - amount_inr: total amount
  - description: "Vedantu tutoring subscription"
- WAIT for payment confirmation.

### 8. Complete & Confirm
- Complete payment on Vedantu. Handle OTP via `ask_user` if needed.
- Take snapshot of enrollment confirmation / student dashboard.
- Report: course enrolled, teacher assigned, session schedule, next class date and time, plan validity, total paid.
- Mention: "Your Vedantu classes are scheduled. Download the Vedantu app for live class notifications. Recorded sessions will be available within a few hours after each class."

## Site Notes

- Vedantu is India's leading live tutoring platform — covers CBSE, ICSE, State Boards, JEE, NEET, and foundation courses.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator's phone.
- Vedantu WAVE (Whiteboard Audio Video Environment) is their proprietary live class technology — classes are interactive with real-time Q&A.
- 1-on-1 sessions are significantly more expensive than group classes — clarify budget before recommending.
- Free trial classes are often available for new users — always check and mention.
- Vedantu frequently runs discount campaigns during exam season — discounts of 20-40% on annual plans.
- "Master Teachers" on Vedantu are their top-rated educators — prioritize these when recommending.
- Doubt-solving sessions are included in most plans — available daily, not just during scheduled classes.
- Use `confirm_action` for enrollment review, `collect_payment` for checkout. WAIT for user response at each step.
