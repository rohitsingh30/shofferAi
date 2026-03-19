---
name: adda247-exam
description: Buy exam prep courses on Adda247 — government exam courses, test series, ebooks for SSC, Banking, Railways.
triggers:
  - adda247
  - adda247 course
  - adda247 exam prep
  - adda247 test series
  - adda247 ssc
  - adda247 banking
  - adda247 mahapack
  - government exam adda247
  - adda247 railways
  - adda247 subscription
siteUrl: https://www.adda247.com
requiresAuth: true
params:
  - name: exam
    required: true
    hint: Target exam (e.g. "SSC CGL", "IBPS PO", "RRB NTPC", "SBI Clerk", "UPSC", "State PCS", "CTET")
  - name: product
    required: false
    hint: Product type (e.g. "Mahapack", "test series", "video course", "ebook", "combo")
  - name: language
    required: false
    hint: Language preference (e.g. "English", "Hindi", "Bilingual")
  - name: budget
    required: false
    hint: Budget range (e.g. "under ₹500", "under ₹2,000", "any")
---

# Adda247 Exam Prep Purchase

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Exam Requirements
- Confirm which government exam the user is preparing for.
- Get: exam name, product type (Mahapack vs test series vs individual course), language, budget.
- Use `ask_user` for missing critical info (exam at minimum).
- Ask: "Do you want the Mahapack (complete course + test series + ebooks) or just a specific product like test series or video course?"

### 2. Open Adda247
- Open a NEW tab and navigate to `https://www.adda247.com`.
- Take snapshot. Verify logged in (profile icon/name in top-right).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Navigate to Exam Category
- Find the user's target exam from the homepage or navigation menu.
- Categories: SSC (CGL, CHSL, MTS, CPO), Banking (IBPS, SBI, RBI), Railways (RRB NTPC, Group D), UPSC, State PCS, Teaching (CTET, DSSSB), Defence (NDA, CDS, AFCAT), Insurance.
- Take snapshot. Browse available products for the selected exam.
- Extract top 3-5 products: product name, type (Mahapack/test series/video), content included, validity, price, student reviews.
- Use `ask_user` (input_type "choice") to let user pick:
  "SSC CGL Mahapack — Video + Test Series + Ebooks — 15 months — ₹3,999 — 4.5★ — 2L students"

### 4. Review Product Details
- Click the selected product. Take snapshot.
- Summarize: what's included (video lectures, live classes, test series, ebooks, PDFs), number of mock tests, number of video hours, teacher names, exam coverage.
- Show: exam pattern aligned, latest updates, student success stories/selections.
- Compare Mahapack vs individual products if relevant — Mahapack is usually the best value.
- If user wants to compare products, navigate back and show alternatives.

### 5. Check Offers & Coupons
- Look for active coupon codes, seasonal offers, or flash sales on the product page. Take snapshot.
- Present any available discounts via `ask_user`:
  "Apply coupon EXAM20 for 20% off", "Flash Sale: ₹3,999 → ₹2,999 (ends tonight)", "No offers currently available"
- Adda247 frequently has aggressive discounting — always check before proceeding to payment.

### 6. Review & Confirm
- Proceed to cart/checkout page. Take snapshot.
- Use `confirm_action`:
  - Product name and exam targeted
  - Content included: video hours, live classes, mock tests, ebooks
  - Teacher/faculty names
  - Language (English/Hindi/Bilingual)
  - Validity period
  - Original price vs discounted price
  - Coupon applied (if any)
  - Total amount to pay
- Do NOT proceed unless user confirms.

### 7. Payment
- Use `collect_payment`:
  - summary: JSON with product, exam, content_included, faculty, language, validity, original_price, discount, total
  - amount_inr: total amount
  - description: "Adda247 exam prep purchase"
- WAIT for payment confirmation.

### 8. Complete & Confirm
- Complete payment on Adda247. Handle OTP via `ask_user` if needed.
- Take snapshot of purchase confirmation / learning dashboard.
- Report: product purchased, exam covered, content access details, validity period, total paid.
- Mention: "Your Adda247 course is active. Access video lectures and test series from the Adda247 app or website. Live classes follow a fixed schedule — check the timetable in your dashboard. Start with a diagnostic mock test to identify weak areas."

## Site Notes

- Adda247 (formerly Bankersadda + SSCadda) is one of India's largest government exam prep platforms — strong in Banking, SSC, and Railways.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator's phone.
- Mahapack is their flagship product — bundles video course + test series + ebooks at a discount. Almost always the best value.
- Adda247 runs very frequent sales and flash discounts (sometimes 50-70% off) — always check for active offers before buying.
- Regional language support is strong — Hindi medium content is as comprehensive as English. Important for state exam aspirants.
- Their YouTube channels (Bankersadda, SSCadda) have free content — suggest for users on a tight budget before committing to paid.
- Previous year papers with detailed video solutions are a popular free resource — mention if user wants to try before buying.
- Adda247 app is essential for the full experience — live classes, tests, and ebook reader all work best on the app.
- Use `confirm_action` for purchase review, `collect_payment` for checkout. WAIT for user response at each step.
