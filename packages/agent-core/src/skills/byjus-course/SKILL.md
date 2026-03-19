---
name: byjus-course
description: Enroll in BYJU'S courses — K-12 learning, competitive exam prep, subscribe to BYJU'S app or classes.
triggers:
  - byjus
  - byjus course
  - byju's course
  - enroll byjus
  - byjus subscription
  - byjus classes
  - byjus learning app
  - byjus exam prep
  - byjus k12
  - byjus jee neet
siteUrl: https://byjus.com
requiresAuth: true
params:
  - name: subject
    required: true
    hint: Subject or exam (e.g. "Mathematics", "Science", "JEE", "NEET", "CBSE Class 10", "IAS")
  - name: grade
    required: false
    hint: Class/grade level (e.g. "Class 6", "Class 10", "Class 12", "competitive exam")
  - name: product
    required: false
    hint: Product preference (e.g. "BYJU'S App", "BYJU'S Classes", "BYJU'S Tuition Centre", "Aakash+BYJU'S")
  - name: budget
    required: false
    hint: Budget range (e.g. "under ₹10,000", "under ₹30,000", "any")
---

# BYJU'S Course Enrollment

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Learning Requirements
- Confirm what the user wants to study and their grade level.
- Get: subject, grade/class, product preference (app vs live classes), budget.
- Use `ask_user` for missing critical info (subject and grade at minimum).
- Ask: "Are you looking for the BYJU'S Learning App (self-paced), BYJU'S Classes (live), or exam-specific courses?"

### 2. Open BYJU'S
- Open a NEW tab and navigate to `https://byjus.com`.
- Take snapshot. Verify logged in (profile icon in top-right).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Navigate to Course Category
- Find the user's grade and subject from the homepage or navigation.
- Categories: K-12 (Class 1-12), JEE, NEET, IAS/UPSC, CAT, GRE, GMAT.
- Take snapshot. Browse available courses and products for the selected grade/exam.
- Extract top 3-5 options: product name, subjects covered, features, duration, price range.
- Use `ask_user` (input_type "choice") to let user pick:
  "BYJU'S Classes — Class 10 CBSE — Maths+Science — Live 1-on-1 — ₹25,000/year"

### 4. Review Course Details
- Click the selected course/product. Take snapshot.
- Summarize: syllabus coverage, learning methodology (videos, quizzes, live classes), teacher qualifications, adaptive learning features.
- Show what's included: video lessons, practice tests, personalized learning paths, doubt resolution.
- If user wants to compare products (App vs Classes vs Tuition Centre), present a comparison.

### 5. Select Plan & Duration
- Navigate to pricing/subscription page. Take snapshot.
- Present plan options via `ask_user` (input_type "choice"):
  "1 Year — ₹20,000", "2 Years — ₹35,000 (₹17,500/year)", "3 Years — ₹45,000 (₹15,000/year)"
- Highlight: subjects included, number of live sessions, test series, doubt resolution features.
- Mention any ongoing offers, scholarships, or EMI options.

### 6. Review & Confirm
- Proceed to enrollment/checkout page. Take snapshot.
- Use `confirm_action`:
  - Product name (App / Classes / Tuition Centre)
  - Grade and subjects covered
  - Plan duration
  - Features: video lessons, live classes, tests, doubt resolution
  - Original price vs offer price
  - EMI option (if applicable)
  - Total amount to pay
- Do NOT proceed unless user confirms.

### 7. Payment
- Use `collect_payment`:
  - summary: JSON with product, grade, subjects, plan_duration, features, emi_option, total
  - amount_inr: total amount
  - description: "BYJU'S course enrollment"
- WAIT for payment confirmation.

### 8. Complete & Confirm
- Complete payment on BYJU'S. Handle OTP via `ask_user` if needed.
- Take snapshot of enrollment confirmation / learning dashboard.
- Report: product enrolled, grade, subjects, plan validity, access details, total paid.
- Mention: "Your BYJU'S subscription is active. Download the BYJU'S app to access video lessons and adaptive practice. Live classes will appear in your schedule."

## Site Notes

- BYJU'S is India's largest edtech platform — covers K-12, JEE, NEET, IAS, CAT, and international curricula.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator's phone.
- BYJU'S has multiple products — Learning App (self-paced videos), Classes (live 1-on-1), Tuition Centre (offline), Aakash+BYJU'S (JEE/NEET) — clarify which one.
- Pricing is NOT transparent on the website — user may need to request a callback. If prices aren't shown, inform user and offer to submit inquiry.
- BYJU'S offers EMI options (0% interest) for expensive plans — always mention if user has budget concerns.
- Free trial/demo class is usually available — always check and recommend before committing to purchase.
- BYJU'S frequently runs sales during exam results season and back-to-school — discounts of 20-40%.
- Refund policy varies by product — mention the cooling-off period and cancellation terms.
- Use `confirm_action` for enrollment review, `collect_payment` for checkout. WAIT for user response at each step.
