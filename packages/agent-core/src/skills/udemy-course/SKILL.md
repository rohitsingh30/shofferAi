---
name: udemy-course
description: Buy online courses on Udemy — search courses, compare ratings and reviews, purchase.
triggers:
  - udemy
  - buy udemy course
  - udemy course
  - online course udemy
  - learn on udemy
  - udemy tutorial
  - buy course online
  - udemy class
  - udemy training
siteUrl: https://www.udemy.com
requiresAuth: true
params:
  - name: topic
    required: true
    hint: Course topic or name (e.g. "Python programming", "React", "data science", "photography")
  - name: level
    required: false
    hint: Difficulty level (e.g. "beginner", "intermediate", "advanced", "all levels")
  - name: budget
    required: false
    hint: Budget preference (e.g. "under ₹500", "any price", "free")
  - name: language
    required: false
    hint: Course language (e.g. "English", "Hindi"). Default English.
---

# Udemy Course Purchase

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Course Requirements
- Confirm what the user wants to learn. If vague (e.g. "learn coding"), ask for specifics.
- Get: topic, difficulty level preference, budget constraints, language preference.
- Use `ask_user` for missing critical info (topic at minimum).

### 2. Open Udemy
- Open a NEW tab and navigate to `https://www.udemy.com`.
- Take snapshot. Verify logged in (profile avatar in top-right corner).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Filter Courses
- Use the search bar to search for the topic.
- Apply filters: Rating (4.0+), Level (if specified), Language, Price (if budget given).
- Sort by "Most Relevant" or "Highest Rated".
- Take snapshot. Extract top 3-5 courses with: title, instructor, rating, number of reviews, duration, price, bestseller/highest-rated tag.
- Use `ask_user` (input_type "choice") to let user pick a course:
  "Python Bootcamp by Jose Portilla — 4.7★ (500K reviews) — 22hrs — ₹449 — Bestseller"

### 4. Review Course Details
- Click the selected course to open its detail page. Take snapshot.
- Summarize key details to user: what you'll learn, course content sections, instructor bio, last updated date.
- If user wants to compare, go back and show another option.
- Check if there's a current discount or sale price vs original price.

### 5. Add to Cart & Review
- Click "Add to Cart" or "Buy Now".
- If coupon codes are visible or applicable, apply the best one.
- Take snapshot of cart/checkout page.
- Use `confirm_action`:
  - Course title and instructor
  - Rating and number of reviews
  - Duration and number of lectures
  - Original price vs sale price (if discounted)
  - Any coupon applied
  - Final total in INR
- Do NOT proceed unless user confirms.

### 6. Payment
- Use `collect_payment`:
  - summary: JSON with course_title, instructor, rating, duration, price, discount, total
  - amount_inr: total amount
  - description: "Udemy course purchase"
- WAIT for payment confirmation.

### 7. Complete & Confirm
- Complete the purchase on Udemy. Handle payment OTP via `ask_user` if needed.
- Take snapshot of purchase confirmation / "Start Learning" page.
- Report: course title, instructor, access details (lifetime access), total paid.
- Mention: "You now have lifetime access to this course. Start learning anytime from your Udemy dashboard."

## Site Notes

- Udemy frequently runs sales (₹399-₹499 per course) — regular prices of ₹3,000+ are almost never paid. If no sale, suggest user wait.
- Courses come with lifetime access and 30-day money-back guarantee.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator's phone/email.
- "Bestseller" and "Highest Rated" tags indicate top courses in a category — prioritize these.
- Check "Last Updated" date — courses not updated in 2+ years may have outdated content. Warn user.
- Some courses have free preview lectures — mention this if user wants to try before buying.
- Udemy shows prices in INR for Indian users. If showing USD, the account region may need adjustment.
- Certificate of completion is included — mention for users who need it for resumes.
- Instructor response rate and Q&A activity indicate course support quality — mention if notably good or bad.
- Use `confirm_action` for purchase review, `collect_payment` for checkout. WAIT for user response at each step.
