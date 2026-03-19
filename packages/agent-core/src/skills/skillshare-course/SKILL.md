---
name: skillshare-course
description: Join Skillshare classes — search creative courses, enroll in free trial or premium membership.
triggers:
  - skillshare
  - skillshare course
  - join skillshare class
  - skillshare creative course
  - learn on skillshare
  - skillshare membership
  - skillshare free trial
  - creative class online
  - skillshare tutorial
siteUrl: https://www.skillshare.com
requiresAuth: true
params:
  - name: topic
    required: true
    hint: Creative skill or course topic (e.g. "illustration", "graphic design", "photography", "animation", "watercolor")
  - name: skill_level
    required: false
    hint: Skill level (e.g. "beginner", "intermediate", "advanced", "all levels")
  - name: duration
    required: false
    hint: Preferred class duration (e.g. "under 30 minutes", "1-2 hours", "any")
  - name: plan
    required: false
    hint: Membership preference (e.g. "free trial", "annual premium", "monthly premium")
---

# Skillshare Class Enrollment

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Course Requirements
- Confirm what creative skill the user wants to learn. If vague (e.g. "learn art"), ask for specifics.
- Get: topic, skill level, preferred class duration, membership plan preference.
- Use `ask_user` for missing critical info (topic at minimum).
- Ask: "Are you interested in the 7-day free trial or do you want to subscribe to Skillshare Premium?"

### 2. Open Skillshare
- Open a NEW tab and navigate to `https://www.skillshare.com`.
- Take snapshot. Verify logged in (profile avatar in top-right corner).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Classes
- Use the search bar to search for the topic.
- Apply filters: Skill Level (if specified), Duration, Class Type (class vs workshop).
- Sort by "Trending" or "Popular".
- Take snapshot. Extract top 3-5 classes with: title, teacher, number of students, duration, number of projects, class rating.
- Use `ask_user` (input_type "choice") to let user pick a class:
  "Illustration Masterclass by Skillshare Staff — 15K students — 2hr 15min — 4.8★ — 350 projects"

### 4. Review Class Details
- Click the selected class to open its detail page. Take snapshot.
- Summarize key details: what you'll learn, class outline/lessons, teacher bio, student reviews, class project description.
- If user wants to compare, go back and show another option.
- Check if the class is included in Premium or requires additional purchase.

### 5. Select Membership Plan
- If user is not a Premium member, navigate to membership/pricing page. Take snapshot.
- Present options via `ask_user` (input_type "choice"):
  "7-Day Free Trial (then ₹750/month)", "Annual Premium — ₹4,500/year (₹375/month)", "Monthly Premium — ₹750/month"
- Highlight any ongoing promotions or discount codes.
- Explain: Premium gives unlimited access to all 30,000+ classes.

### 6. Review & Confirm
- Proceed to checkout/enrollment page. Take snapshot.
- Use `confirm_action`:
  - Class title and teacher
  - Number of students and rating
  - Duration and number of lessons
  - Membership plan selected
  - Free trial period (if applicable)
  - Price and billing cycle
  - Total amount to pay today
- Do NOT proceed unless user confirms.

### 7. Payment
- Use `collect_payment`:
  - summary: JSON with class_title, teacher, membership_plan, billing_cycle, price, trial_info
  - amount_inr: total amount
  - description: "Skillshare membership enrollment"
- WAIT for payment confirmation.

### 8. Complete & Confirm
- Complete the enrollment on Skillshare. Handle payment OTP via `ask_user` if needed.
- Take snapshot of enrollment confirmation / class dashboard.
- Report: class title, teacher, membership type, trial end date (if applicable), total paid.
- Mention: "You now have access to all Skillshare Premium classes. Your selected class is ready to start. Remember to cancel before the trial ends if you only want the free trial."

## Site Notes

- Skillshare focuses on creative skills: illustration, design, photography, animation, writing, film, music, and business.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator's email.
- Free trial is 7 days — user gets full Premium access during trial. Always mention the cancellation deadline.
- Skillshare shows prices in USD by default. Convert and mention INR equivalent for Indian users.
- Class projects are a key feature — students create their own work and share with the community. Mention this.
- Some teachers offer downloadable resources (templates, brushes, worksheets) — highlight if available.
- Skillshare does not issue certificates like Coursera/Udemy — clarify if user expects one.
- Annual plan is significantly cheaper per month than monthly plan — recommend if user plans to use regularly.
- Use `confirm_action` for enrollment review, `collect_payment` for checkout. WAIT for user response at each step.
