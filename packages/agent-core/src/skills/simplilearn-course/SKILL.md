---
name: simplilearn-course
description: Enroll in Simplilearn certification programs — data science, cloud computing, PMP, cybersecurity, and more.
triggers:
  - simplilearn
  - simplilearn course
  - simplilearn certification
  - simplilearn data science
  - simplilearn pmp
  - simplilearn cloud
  - simplilearn training
  - professional certification simplilearn
  - simplilearn bootcamp
  - simplilearn masters program
siteUrl: https://www.simplilearn.com
requiresAuth: true
params:
  - name: course
    required: true
    hint: Course or certification topic (e.g. "data science", "PMP", "AWS", "cybersecurity", "digital marketing", "full stack developer")
  - name: program_type
    required: false
    hint: Program type (e.g. "individual course", "master's program", "postgraduate program", "bootcamp")
  - name: university
    required: false
    hint: University partner preference (e.g. "Purdue", "IIT Kanpur", "Caltech", "any")
  - name: budget
    required: false
    hint: Budget range (e.g. "under ₹50,000", "under ₹1,00,000", "any", "EMI preferred")
---

# Simplilearn Certification Enrollment

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Course Requirements
- Confirm what certification or skill the user wants to acquire.
- Get: course topic, program type preference, university partner preference, budget/EMI needs.
- Use `ask_user` for missing critical info (course topic at minimum).
- Ask: "Are you looking for an individual course, a Masters program with university certification, or a Postgraduate program?"

### 2. Open Simplilearn
- Open a NEW tab and navigate to `https://www.simplilearn.com`.
- Take snapshot. Verify logged in (profile name/avatar in top-right).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Programs
- Use the search bar or navigate to the relevant category.
- Categories: Data Science & AI, Cloud Computing, Cybersecurity, Project Management, Digital Marketing, DevOps, Full Stack Development.
- Take snapshot. Extract top 3-5 programs with: title, university partner, duration, mode (online/blended), rating, number of learners, price range.
- Use `ask_user` (input_type "choice") to let user pick:
  "PG Program in Data Science — Purdue University — 12 months — 4.7★ — 25K learners — ₹1,19,000"

### 4. Review Program Details
- Click the selected program. Take snapshot.
- Summarize: curriculum modules, tools/technologies covered, capstone project, mentor sessions, career support, certification details.
- Show: university partner, duration, weekly time commitment, prerequisites.
- Highlight job assistance: resume building, interview prep, job guarantee (if applicable).
- If user wants to compare programs, navigate back and show alternatives.

### 5. Select Plan & Payment Option
- Navigate to enrollment/pricing section. Take snapshot.
- Present options via `ask_user` (input_type "choice"):
  "One-time Payment — ₹1,19,000", "EMI — ₹9,917/month x 12 months", "Early Bird Discount — ₹99,000 (limited seats)"
- Highlight: EMI options (0% interest available), corporate reimbursement eligibility, early bird or cohort discounts.
- Check for ongoing promotions or scholarship options.

### 6. Review & Confirm
- Proceed to checkout/enrollment page. Take snapshot.
- Use `confirm_action`:
  - Program name and university partner
  - Duration and start date
  - Curriculum highlights (key modules)
  - Certification: university certificate + Simplilearn certificate
  - Career support: job guarantee, placement assistance
  - Payment option selected (one-time or EMI)
  - Total amount and EMI breakdown (if applicable)
- Do NOT proceed unless user confirms.

### 7. Payment
- Use `collect_payment`:
  - summary: JSON with program_name, university, duration, certification, career_support, payment_option, total
  - amount_inr: total amount (or first EMI installment)
  - description: "Simplilearn certification enrollment"
- WAIT for payment confirmation.

### 8. Complete & Confirm
- Complete enrollment on Simplilearn. Handle OTP via `ask_user` if needed.
- Take snapshot of enrollment confirmation / learning dashboard.
- Report: program name, university partner, cohort start date, duration, certification details, total paid.
- Mention: "Your enrollment is confirmed. You'll receive login credentials and cohort details via email. Live classes typically start within 1-2 weeks of the cohort start date."

## Site Notes

- Simplilearn offers professional certification programs in partnership with top universities (Purdue, Caltech, IIT Kanpur, IIM Bangalore).
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator's phone/email.
- Programs range from ₹10,000 (individual courses) to ₹2,50,000+ (Postgraduate programs) — always clarify budget upfront.
- EMI options are widely available — 0% interest EMI through select banks. Always mention for expensive programs.
- Simplilearn's "Job Guarantee" programs promise a job or money back — verify terms and mention clearly.
- Cohort-based programs have fixed start dates — check the next available cohort before enrolling.
- Free preview/demo classes are available for most programs — recommend before committing to expensive courses.
- Corporate reimbursement is common for Simplilearn courses — ask if user's employer sponsors learning.
- Use `confirm_action` for enrollment review, `collect_payment` for checkout. WAIT for user response at each step.
