---
name: edx-course
description: Enroll in edX university courses — MIT, Harvard, Berkeley; free audit or verified certificate.
triggers:
  - edx
  - edx course
  - enroll edx
  - edx certificate
  - edx mit course
  - edx harvard course
  - online university course edx
  - learn on edx
  - edx program
  - edx micromasters
siteUrl: https://www.edx.org
requiresAuth: true
params:
  - name: topic
    required: true
    hint: Course or subject topic (e.g. "computer science", "data science", "business management", "artificial intelligence")
  - name: university
    required: false
    hint: Preferred university (e.g. "MIT", "Harvard", "Berkeley", "IIT Bombay", "any")
  - name: enrollment_type
    required: false
    hint: Enrollment preference (e.g. "free audit", "verified certificate", "MicroMasters", "Professional Certificate")
  - name: level
    required: false
    hint: Course level (e.g. "introductory", "intermediate", "advanced")
---

# edX University Course Enrollment

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Course Requirements
- Confirm what the user wants to learn and whether they need a certificate.
- Get: topic, university preference, enrollment type (free audit vs verified certificate), level.
- Use `ask_user` for missing critical info (topic at minimum).
- Ask: "Do you want to audit for free (full course access, no certificate) or get a verified certificate (paid)?"

### 2. Open edX
- Open a NEW tab and navigate to `https://www.edx.org`.
- Take snapshot. Verify logged in (profile name/avatar in top-right).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Filter Courses
- Use the search bar to search for the topic.
- Apply filters: Subject, University/Partner, Level (Introductory, Intermediate, Advanced), Program Type (Course, MicroMasters, Professional Certificate, MicroBachelors).
- Sort by "Most Relevant" or "Highest Rated".
- Take snapshot. Extract top 3-5 results with: title, university, instructor, level, duration, pace (self-paced vs instructor-led), free audit available, certificate price.
- Use `ask_user` (input_type "choice") to let user pick:
  "CS50's Introduction to Computer Science — Harvard — 12 weeks — Introductory — Free audit / ₹7,500 certificate"

### 4. Review Course Details
- Click the selected course. Take snapshot.
- Summarize: what you'll learn, course syllabus/modules, prerequisites, instructor bio, estimated effort per week, start date.
- Show enrollment options: Audit track (free, limited access) vs Verified track (paid, full access + certificate).
- If MicroMasters/Professional Certificate, show all courses in the program and total duration/cost.
- If user wants to compare, go back and show another option.

### 5. Select Enrollment Track
- Present enrollment options via `ask_user` (input_type "choice"):
  "Audit Track — Free (no certificate, limited access)", "Verified Certificate — ₹7,500 (full access + certificate)", "edX Subscription — ₹32,999/year (unlimited certificates)"
- If free audit: skip to Step 7 (complete enrollment directly).
- If paid: proceed to checkout.
- Highlight any financial assistance options.

### 6. Review & Confirm (Paid Enrollment)
- Proceed to checkout page. Take snapshot.
- Use `confirm_action`:
  - Course title and university
  - Instructor name(s)
  - Duration, pace, and weekly commitment
  - Enrollment track (Verified Certificate / MicroMasters / etc.)
  - Certificate details and university branding
  - Financial assistance applied (if any)
  - Total amount to pay
- Do NOT proceed unless user confirms.

### 7. Payment (Paid Enrollment Only)
- Use `collect_payment`:
  - summary: JSON with course_title, university, instructor, duration, enrollment_track, certificate, total
  - amount_inr: total amount
  - description: "edX course enrollment"
- WAIT for payment confirmation.

### 8. Complete & Confirm
- Complete enrollment on edX. Handle OTP via `ask_user` if needed.
- If free audit: click "Enroll" and select "Audit This Course".
- Take snapshot of enrollment confirmation / course dashboard.
- Report: course title, university, enrollment track, start date, certificate status, total paid (or "Free audit").
- Mention: "You're enrolled! Self-paced courses can be started immediately. Instructor-led courses follow a schedule. Your certificate will be available upon completion."

## Site Notes

- edX offers courses from 160+ universities including MIT, Harvard, Berkeley, Stanford, IIT Bombay, and more.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator's email.
- Free audit gives access to course content but NOT graded assignments or certificates — clarify this distinction.
- Verified certificates cost ₹3,500-₹25,000 depending on the course and university — significant range.
- MicroMasters programs (4-6 courses) can count toward a full Master's degree at partner universities — highlight this pathway.
- Financial assistance is available for users who can't afford — application process takes a few days.
- edX subscription (₹32,999/year) gives unlimited certificates — worth it if user plans 5+ courses per year.
- Course archives remain accessible after the course ends — user can review material at their own pace.
- Some courses have prerequisites — always check and mention if the user might need foundational courses first.
- Use `confirm_action` for enrollment review, `collect_payment` for paid enrollment. WAIT for user response at each step.
