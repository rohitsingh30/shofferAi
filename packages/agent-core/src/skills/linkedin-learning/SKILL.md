---
name: linkedin-learning
description: Subscribe to LinkedIn Learning — browse professional courses, start learning paths, earn certificates.
triggers:
  - linkedin learning
  - linkedin learning course
  - subscribe linkedin learning
  - linkedin learning path
  - linkedin course
  - linkedin training
  - linkedin professional development
  - linkedin learning certificate
  - learn on linkedin
  - linkedin learning subscription
siteUrl: https://www.linkedin.com/learning
requiresAuth: true
params:
  - name: topic
    required: true
    hint: Course or skill topic (e.g. "project management", "Excel", "Python", "leadership", "data analysis", "UX design")
  - name: content_type
    required: false
    hint: Content type (e.g. "individual course", "learning path", "certification prep")
  - name: skill_level
    required: false
    hint: Skill level (e.g. "beginner", "intermediate", "advanced")
  - name: plan
    required: false
    hint: Subscription preference (e.g. "monthly", "annual", "already have LinkedIn Premium")
---

# LinkedIn Learning Subscription

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Learning Requirements
- Confirm what professional skill the user wants to develop.
- Get: topic, content type (course vs learning path), skill level, subscription preference.
- Use `ask_user` for missing critical info (topic at minimum).
- Ask: "Do you already have LinkedIn Premium? LinkedIn Learning is included with Premium. Or would you like a standalone subscription?"

### 2. Open LinkedIn Learning
- Open a NEW tab and navigate to `https://www.linkedin.com/learning`.
- Take snapshot. Verify logged in (LinkedIn profile avatar in top-right).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Courses
- Use the search bar to search for the topic.
- Apply filters: Content Type (Course, Learning Path, Video), Level (Beginner, Intermediate, Advanced), Duration.
- Sort by "Most Relevant" or "Most Popular".
- Take snapshot. Extract top 3-5 results with: title, instructor, duration, level, number of viewers, LinkedIn certificate availability.
- Use `ask_user` (input_type "choice") to let user pick:
  "Project Management Foundations — Bonnie Biafore — 2h 10m — Beginner — 500K viewers — Certificate included"

### 4. Review Course Details
- Click the selected course. Take snapshot.
- Summarize: learning objectives, course contents/chapters, instructor bio, skills covered (LinkedIn Skills), exercise files availability.
- If Learning Path selected, show all courses included and total duration.
- Check if course completion adds skills to LinkedIn profile automatically.
- If user wants to compare, go back and show another option.

### 5. Subscribe to LinkedIn Learning
- If user doesn't have an active subscription, navigate to subscription page. Take snapshot.
- Present options via `ask_user` (input_type "choice"):
  "LinkedIn Learning Monthly — ₹1,550/month", "LinkedIn Learning Annual — ₹11,400/year (₹950/month)", "LinkedIn Premium Career — ₹4,250/month (includes Learning)", "1-Month Free Trial"
- Highlight: 1-month free trial available for new subscribers.
- If user already has LinkedIn Premium, skip directly to Step 7.

### 6. Review & Confirm
- Proceed to checkout/subscription page. Take snapshot.
- Use `confirm_action`:
  - Course or Learning Path title
  - Instructor and duration
  - Skills that will be added to LinkedIn profile
  - Certificate of completion included
  - Subscription plan and billing cycle
  - Free trial period (if applicable)
  - Total amount to pay
- Do NOT proceed unless user confirms.

### 7. Payment
- Use `collect_payment`:
  - summary: JSON with course_title, instructor, duration, skills, certificate, plan, trial_info, total
  - amount_inr: total amount
  - description: "LinkedIn Learning subscription"
- WAIT for payment confirmation.

### 8. Complete & Confirm
- Complete subscription and start the course on LinkedIn Learning. Handle OTP via `ask_user` if needed.
- Take snapshot of course player / learning dashboard.
- Report: course title, instructor, subscription type, trial end date (if applicable), total paid.
- Mention: "Your LinkedIn Learning subscription is active. Course completions automatically appear on your LinkedIn profile. You can download the LinkedIn Learning app for offline viewing."

## Site Notes

- LinkedIn Learning offers 18,000+ courses focused on business, technology, and creative skills.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator's email/phone.
- LinkedIn Learning is included with LinkedIn Premium Career and Premium Business plans — check if user already has Premium.
- Course completion certificates are automatically added to the user's LinkedIn profile — a major differentiator from other platforms.
- Skills validated through LinkedIn Learning courses appear in LinkedIn's "Skills" section — valuable for job seekers.
- Learning Paths are curated sequences of courses toward a specific role or skill — more structured than individual courses.
- Exercise files and quizzes are included in most courses — mention if available.
- 1-month free trial is available for new subscribers — always mention and remind about cancellation deadline.
- LinkedIn Learning content is updated regularly by industry practitioners — not academic professors.
- Use `confirm_action` for subscription review, `collect_payment` for checkout. WAIT for user response at each step.
