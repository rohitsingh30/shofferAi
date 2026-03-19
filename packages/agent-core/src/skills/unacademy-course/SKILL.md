---
name: unacademy-course
description: Subscribe to Unacademy Plus for exam prep — UPSC, CAT, JEE, NEET, SSC courses and live classes.
triggers:
  - unacademy
  - unacademy course
  - unacademy plus
  - exam prep unacademy
  - upsc preparation
  - cat preparation unacademy
  - jee coaching online
  - neet preparation online
  - unacademy subscription
  - ssc exam prep
siteUrl: https://unacademy.com
requiresAuth: true
params:
  - name: exam
    required: true
    hint: Target exam or subject (e.g. "UPSC CSE", "CAT", "JEE Main", "NEET", "SSC CGL", "Gate CSE")
  - name: language
    required: false
    hint: Preferred language (e.g. "English", "Hindi", "Hinglish"). Default Hindi for most exams.
  - name: educator
    required: false
    hint: Preferred educator/teacher name if any (e.g. "Roman Saini", "Kiran Bedi")
  - name: plan
    required: false
    hint: Subscription plan preference (e.g. "monthly", "yearly", "Iconic")
---

# Unacademy Course Subscription

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Exam & Subscription Requirements
- Confirm which exam the user is preparing for.
- Get: exam name, language preference, any specific educator they follow, subscription plan preference.
- Use `ask_user` for missing critical info (exam/subject at minimum).
- Ask: "Are you looking for a full subscription (Plus/Iconic) or a specific course batch?"

### 2. Open Unacademy
- Open a NEW tab and navigate to `https://unacademy.com`.
- Take snapshot. Verify logged in (profile icon in top-right).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Navigate to Exam Category
- Find and click the user's exam goal from the homepage or "Explore" menu.
- Categories: UPSC, CAT, JEE, NEET, SSC, Bank Exams, State PSC, Gate, etc.
- Take snapshot. Browse available courses, batches, and educators for the selected exam.
- Extract top 3-5 options: batch name, educator, start date, schedule, language, subscriber count.
- Use `ask_user` (input_type "choice") to let user pick a batch/course:
  "UPSC CSE 2026 Batch — Roman Saini — Hindi — Starts April 1 — 50K subscribers"

### 4. Review Course & Educator Details
- Click the selected batch/course. Take snapshot.
- Summarize: syllabus coverage, number of lectures, live class schedule, doubt-clearing sessions, test series included.
- Show educator profiles: teaching style, subscriber count, ratings.
- If user wants to compare educators or batches, navigate back and show alternatives.

### 5. Select Subscription Plan
- Navigate to subscription/pricing page. Take snapshot.
- Present subscription options via `ask_user` (input_type "choice"):
  "Plus Monthly — ₹1,166/month", "Plus Yearly — ₹9,999/year (₹833/month)", "Iconic — ₹24,999/year (personal mentorship)"
- Highlight any ongoing discounts or promotional pricing.
- Explain differences: Plus (live classes + recordings), Iconic (Plus + personal mentor + doubt clearing priority).

### 6. Review & Confirm
- Proceed to payment page. Take snapshot.
- Use `confirm_action`:
  - Exam goal and batch selected
  - Educator(s) included
  - Subscription plan and duration
  - Features: live classes, recordings, test series, doubt sessions
  - Original price vs discounted price
  - Total amount to pay
- Do NOT proceed unless user confirms.

### 7. Payment
- Use `collect_payment`:
  - summary: JSON with exam, batch, educator, plan, duration, features, total
  - amount_inr: total amount
  - description: "Unacademy subscription"
- WAIT for payment confirmation.

### 8. Complete & Confirm
- Complete payment on Unacademy. Handle OTP via `ask_user` if needed.
- Take snapshot of subscription confirmation / dashboard.
- Report: subscription plan, exam goal, batch enrolled, start date, validity period, total paid.
- Mention: "Your subscription is active. Live classes appear in your schedule. Recordings are available within 24 hours."

## Site Notes

- Unacademy is India's top exam prep platform — covers UPSC, CAT, JEE, NEET, SSC, Bank PO, Gate, and more.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator's phone.
- Plus subscription gives access to ALL educators and batches for the selected exam goal — not just one batch.
- Iconic plan includes personal mentorship, priority doubt-solving, and structured study plan — significantly more expensive.
- Free content (YouTube-style) is available without subscription — clarify if user wants free vs paid.
- Unacademy frequently runs sales (Republic Day, Independence Day, exam result season) — discounts of 30-50%.
- Referral codes can give additional discounts — ask user if they have one.
- Live classes have scheduled times — user needs to be available or watch recordings later.
- Test series and practice questions are a major value-add — always mention if included.
- Some exam goals require separate subscriptions — UPSC and CAT are different goals.
- Use `confirm_action` for subscription review, `collect_payment` for checkout. WAIT for user response at each step.
