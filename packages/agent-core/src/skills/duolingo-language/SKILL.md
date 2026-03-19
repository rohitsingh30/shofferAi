---
name: duolingo-language
description: Start a language course on Duolingo — select language, begin learning, upgrade to Duolingo Plus/Super.
triggers:
  - duolingo
  - duolingo course
  - learn language duolingo
  - duolingo plus
  - duolingo super
  - language learning duolingo
  - duolingo subscription
  - duolingo premium
  - learn spanish duolingo
  - learn french duolingo
siteUrl: https://www.duolingo.com
requiresAuth: true
params:
  - name: language
    required: true
    hint: Language to learn (e.g. "Spanish", "French", "Japanese", "German", "Korean", "Hindi", "Mandarin")
  - name: current_level
    required: false
    hint: Current proficiency (e.g. "complete beginner", "some basics", "intermediate")
  - name: plan
    required: false
    hint: Plan preference (e.g. "free", "Super Duolingo", "Duolingo Max", "family plan")
  - name: goal
    required: false
    hint: Learning goal (e.g. "travel", "work", "school", "casual", "fluency")
---

# Duolingo Language Course Setup

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Language Learning Requirements
- Confirm which language the user wants to learn and their current level.
- Get: target language, current proficiency, learning goal, plan preference (free vs paid).
- Use `ask_user` for missing critical info (language at minimum).
- Ask: "Are you a complete beginner or do you already know some basics? And would you like the free version or Duolingo Super (ad-free, unlimited hearts)?"

### 2. Open Duolingo
- Open a NEW tab and navigate to `https://www.duolingo.com`.
- Take snapshot. Verify logged in (profile avatar or streak counter visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Select Language Course
- If user doesn't have the target language active, navigate to "Courses" or "Add a Course".
- Select the target language from the available options.
- Take snapshot. If user is a beginner, start from scratch. If intermediate, check for placement test option.
- Show available sections: "Duolingo offers a placement test to skip basics. Want to take it or start from Unit 1?"
- Use `ask_user` (input_type "choice"):
  "Start from Unit 1 (Beginner)", "Take Placement Test (skip known material)", "Continue existing progress"

### 4. Configure Learning Settings
- Set daily goal via `ask_user` (input_type "choice"):
  "Casual — 5 min/day", "Regular — 10 min/day", "Serious — 15 min/day", "Intense — 20 min/day"
- Take snapshot of the learning path/tree.
- Summarize the course structure: number of units, skills per unit, estimated completion time.
- Show user what the first few lessons cover.

### 5. Upgrade to Super Duolingo (If Requested)
- If user wants the paid plan, navigate to subscription page. Take snapshot.
- Present options via `ask_user` (input_type "choice"):
  "Super Duolingo — ₹699/month (ad-free, unlimited hearts)", "Super Duolingo — ₹4,999/year (₹416/month)", "Duolingo Max — ₹9,999/year (AI features)", "Family Plan — ₹7,999/year (up to 6 members)"
- If user wants to stay free, skip to Step 8.
- Highlight: 14-day free trial available for Super Duolingo.

### 6. Review & Confirm
- If upgrading, proceed to checkout page. Take snapshot.
- Use `confirm_action`:
  - Language course selected
  - Current progress level
  - Daily goal set
  - Subscription plan and billing cycle
  - Free trial period (if applicable)
  - Features: ad-free, unlimited hearts, progress quizzes, streak repair
  - Total amount to pay
- Do NOT proceed unless user confirms.

### 7. Payment (Paid Plans Only)
- Use `collect_payment`:
  - summary: JSON with language, plan, billing_cycle, features, trial_period, total
  - amount_inr: total amount
  - description: "Duolingo Super subscription"
- WAIT for payment confirmation.

### 8. Complete & Confirm
- If paid, complete the subscription on Duolingo. Handle OTP via `ask_user` if needed.
- If free, start the first lesson to verify setup.
- Take snapshot of the learning dashboard / first lesson.
- Report: language course, daily goal, subscription type, trial end date (if applicable), total paid (or "Free plan").
- Mention: "Your Duolingo course is set up! Complete lessons daily to maintain your streak. Duolingo works best with consistent daily practice, even just 5-10 minutes."

## Site Notes

- Duolingo is the world's most popular language learning platform — free tier is fully functional with ads and limited hearts.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator's email/Google.
- Super Duolingo removes ads and gives unlimited hearts (no penalty for mistakes) — worth it for serious learners.
- Duolingo Max includes AI-powered features: Explain My Answer, Roleplay conversations — only available for select languages.
- 14-day free trial is available for Super — always mention and remind user to cancel if they only want to try it.
- Duolingo shows prices in local currency — verify INR is shown for Indian users.
- The placement test can save significant time for users who already know basics — always recommend for non-beginners.
- Streaks are a core motivation feature — encourage user to enable daily reminders.
- Leaderboards and leagues add competitive motivation — mention if user is competitive.
- Use `confirm_action` for subscription review, `collect_payment` for paid plans. WAIT for user response at each step.
