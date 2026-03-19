---
name: coursera-course
description: Enroll in Coursera courses or specializations — search, compare, enroll free or paid.
triggers:
  - coursera
  - coursera course
  - enroll coursera
  - coursera specialization
  - coursera certificate
  - online course coursera
  - learn on coursera
  - coursera class
  - coursera degree
siteUrl: https://www.coursera.org
requiresAuth: true
params:
  - name: topic
    required: true
    hint: Course or specialization topic (e.g. "machine learning", "Google project management", "AWS cloud")
  - name: type
    required: false
    hint: Type preference (e.g. "course", "specialization", "professional certificate", "degree")
  - name: free_or_paid
    required: false
    hint: Enrollment preference (e.g. "free audit", "with certificate", "Coursera Plus")
  - name: university
    required: false
    hint: Preferred university or provider (e.g. "Stanford", "Google", "IBM", "University of Michigan")
---

# Coursera Course Enrollment

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Course Requirements
- Confirm what the user wants to learn and whether they need a certificate.
- Get: topic, type preference (single course vs specialization vs professional certificate), free audit vs paid.
- Use `ask_user` for missing critical info (topic at minimum).
- Clarify: "Do you want to audit for free (no certificate) or enroll with certificate (paid)?"

### 2. Open Coursera
- Open a NEW tab and navigate to `https://www.coursera.org`.
- Take snapshot. Verify logged in (profile avatar in top-right).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Filter Courses
- Use the search bar to find the topic.
- Apply filters: Type (Course, Specialization, Professional Certificate), Level (Beginner, Intermediate, Advanced), Language.
- Sort by "Best Match" or "Highest Rated".
- Take snapshot. Extract top 3-5 results with: title, provider/university, rating, number of enrollments, duration, free/paid status.
- Use `ask_user` (input_type "choice") to let user pick:
  "Machine Learning by Stanford (Andrew Ng) — 4.9★ (5M enrolled) — 11 weeks — Free audit available"

### 4. Review Course Details
- Click the selected course. Take snapshot.
- Summarize: what you'll learn, syllabus/modules, instructor(s), skills gained, estimated time commitment per week.
- Check enrollment options: Free audit (no certificate), Single course purchase, Coursera Plus subscription.
- If specialization, mention how many courses are included and total duration.
- Present enrollment options via `ask_user` (input_type "choice"):
  "Free audit (no certificate)", "Single course — ₹3,499", "Coursera Plus — ₹5,499/month (all courses)"

### 5. Enroll & Confirm
- If free audit: click "Enroll for Free" then select "Audit" option. Skip to Step 7.
- If paid: proceed to payment page. Take snapshot.
- Use `confirm_action`:
  - Course/specialization title and provider
  - Instructor name(s)
  - Duration and weekly commitment
  - Enrollment type (single course / Coursera Plus)
  - Price (one-time or monthly)
  - Certificate included: Yes/No
  - 7-day free trial available: Yes/No
- Do NOT proceed unless user confirms.

### 6. Payment (Paid Enrollment Only)
- Use `collect_payment`:
  - summary: JSON with course_title, provider, enrollment_type, price, certificate, trial_info
  - amount_inr: total amount
  - description: "Coursera course enrollment"
- WAIT for payment confirmation.

### 7. Complete & Confirm
- Complete enrollment. Handle payment OTP via `ask_user` if needed.
- Take snapshot of enrollment confirmation / course dashboard.
- Report: course title, provider, enrollment type, certificate status, start date, total paid (or "Free audit").
- Mention: "You can start learning immediately. Coursera courses are self-paced with suggested deadlines."
- If paid with trial: "Your 7-day free trial starts now. Cancel before it ends to avoid charges."

## Site Notes

- Coursera offers free audit for most individual courses (no certificate). Paid enrollment includes graded assignments and certificate.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator's email.
- Coursera Plus (₹5,499/month or ₹29,999/year) gives unlimited access to 7,000+ courses — worth it if user plans multiple courses.
- Professional Certificates (Google, IBM, Meta) are popular for job seekers — 3-6 months, widely recognized.
- 7-day free trial is available for Coursera Plus and some specializations — always mention this.
- Financial aid is available for users who can't afford — takes 15 days to process. Mention if user has budget concerns.
- Courses from top universities (Stanford, Yale, Princeton) are highly valued — highlight the institution.
- Some courses have peer-reviewed assignments — mention the time commitment.
- Deadlines are suggested but flexible — user can reset deadlines anytime.
- Use `confirm_action` for enrollment review, `collect_payment` for paid enrollment. WAIT for user response.
