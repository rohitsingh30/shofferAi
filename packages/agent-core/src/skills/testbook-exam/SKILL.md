---
name: testbook-exam
description: Buy exam test series on Testbook — SSC, Bank PO, Railways, UPSC mock tests and practice papers.
triggers:
  - testbook
  - testbook test series
  - testbook exam prep
  - testbook ssc
  - testbook bank po
  - testbook railways
  - buy mock test testbook
  - testbook pass
  - testbook subscription
  - government exam testbook
siteUrl: https://testbook.com
requiresAuth: true
params:
  - name: exam
    required: true
    hint: Target exam (e.g. "SSC CGL", "IBPS PO", "RRB NTPC", "UPSC CSE", "SBI PO", "SSC CHSL", "RBI Grade B")
  - name: product
    required: false
    hint: Product type (e.g. "test series", "Testbook Pass", "video course", "combo pack")
  - name: language
    required: false
    hint: Language preference (e.g. "English", "Hindi", "Bilingual")
  - name: validity
    required: false
    hint: Validity period preference (e.g. "6 months", "1 year", "2 years")
---

# Testbook Exam Test Series Purchase

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Exam Requirements
- Confirm which government exam the user is preparing for.
- Get: exam name, product type (test series vs full course vs Testbook Pass), language, validity preference.
- Use `ask_user` for missing critical info (exam at minimum).
- Ask: "Do you want a test series for a specific exam or the Testbook Pass (access to ALL exam test series)?"

### 2. Open Testbook
- Open a NEW tab and navigate to `https://testbook.com`.
- Take snapshot. Verify logged in (profile icon in top-right).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Navigate to Exam Category
- Find the user's target exam from the homepage or exam categories.
- Categories: SSC (CGL, CHSL, MTS), Banking (IBPS, SBI, RBI), Railways (RRB NTPC, Group D, ALP), UPSC, State PSC, Defence, Teaching, Insurance.
- Take snapshot. Browse available test series and courses for the exam.
- Extract top 3-5 products: test series name, number of mock tests, number of sectional tests, language, validity, price, student count.
- Use `ask_user` (input_type "choice") to let user pick:
  "SSC CGL Tier-1 Test Series — 60 Mocks + 200 Sectional — Bilingual — 1 Year — ₹299 — 5L students"

### 4. Review Test Series Details
- Click the selected product. Take snapshot.
- Summarize: total mock tests, sectional tests, previous year papers, topic-wise tests, detailed solutions, performance analytics.
- Show: exam pattern followed, difficulty level, latest pattern updated, student reviews/ratings.
- Compare with Testbook Pass if individual test series is selected — Pass might be better value.
- If user wants to compare products, navigate back and show alternatives.

### 5. Select Plan
- Present plan/product options via `ask_user` (input_type "choice"):
  "Individual Test Series — ₹299 (1 exam)", "Testbook Pass — ₹599/year (ALL exams)", "Testbook Pass Pro — ₹999/year (ALL exams + video courses)", "Combo Pack — ₹499 (test series + ebook)"
- Highlight: Testbook Pass is almost always better value if user is preparing for multiple exams.
- Check for coupon codes or ongoing offers.

### 6. Review & Confirm
- Proceed to checkout page. Take snapshot.
- Use `confirm_action`:
  - Product name and exam(s) covered
  - Number of mock tests and sectional tests
  - Previous year papers included
  - Language (English/Hindi/Bilingual)
  - Validity period
  - Performance analytics and all-India rank feature
  - Coupon/discount applied
  - Total amount to pay
- Do NOT proceed unless user confirms.

### 7. Payment
- Use `collect_payment`:
  - summary: JSON with product, exam, mock_tests, sectional_tests, language, validity, discount, total
  - amount_inr: total amount
  - description: "Testbook test series purchase"
- WAIT for payment confirmation.

### 8. Complete & Confirm
- Complete payment on Testbook. Handle OTP via `ask_user` if needed.
- Take snapshot of purchase confirmation / test series dashboard.
- Report: product purchased, exam(s) covered, number of tests available, validity, total paid.
- Mention: "Your test series is active. Start with a full mock test to assess your current level. After each test, review detailed solutions and check your all-India rank. Download the Testbook app for mobile access."

## Site Notes

- Testbook is India's leading government exam prep platform — 2Cr+ students, covers SSC, Banking, Railways, Defence, Teaching exams.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator's phone.
- Testbook Pass (₹599/year) gives access to ALL exam test series — significantly better value than individual purchases for multi-exam aspirants.
- Testbook Pass Pro adds video courses and live classes on top of test series — recommend for comprehensive preparation.
- Prices are very affordable (₹199-₹999 range) — much cheaper than coaching institutes.
- Test series follow the latest exam pattern and are updated within days of any pattern change — mention this reliability.
- All-India rank feature after each mock test helps gauge relative performance — a key selling point.
- Detailed solutions with shortcuts and tricks are provided for every question — highlight this for exam prep.
- Use `confirm_action` for purchase review, `collect_payment` for checkout. WAIT for user response at each step.
