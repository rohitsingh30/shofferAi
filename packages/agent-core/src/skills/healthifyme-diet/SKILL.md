---
name: healthifyme-diet
description: Get a diet or fitness plan on HealthifyMe — set goals, explore plans, subscribe, track meals and workouts.
triggers:
  - healthifyme
  - healthifyme diet plan
  - healthifyme fitness
  - get diet plan
  - calorie tracking
  - fitness plan online
  - healthifyme subscription
  - weight loss plan
siteUrl: https://www.healthifyme.com
requiresAuth: true
params:
  - name: goal
    required: true
    hint: Fitness or diet goal (e.g. "lose 5 kg", "gain muscle", "eat healthier", "track calories")
  - name: plan_type
    required: false
    hint: Plan preference (e.g. "Pro plan", "Smart plan", "free plan")
  - name: diet_preference
    required: false
    hint: Dietary preference (e.g. "vegetarian", "vegan", "keto", "no preference")
  - name: budget
    required: false
    hint: Max subscription price (e.g. "under 2000/month", "budget 5000")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, net banking)
---

# HealthifyMe Diet & Fitness Plan

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm the user's primary goal: weight loss, muscle gain, healthy eating, calorie tracking, or general fitness.
- Use `ask_user` to clarify: current weight, target weight, timeline, dietary restrictions (veg, vegan, keto, allergies).
- Note any preference for plan tier (free vs Pro vs Smart Plan with coach).
- Ask about activity level (sedentary, moderate, active) if not provided.

### 2. Open HealthifyMe & Verify Login
- Open a NEW tab and navigate to `https://www.healthifyme.com`.
- Take snapshot. Verify logged in (profile icon or username visible in header/dashboard).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Explore Available Plans
- Navigate to the plans/pricing page.
- Take snapshot of available subscription plans.
- Extract details for each plan: name, price (monthly/quarterly/annual), features (coach access, diet plans, workout plans, calorie tracker, Smart AI).
- Use `ask_user` (input_type "choice") to present plan options. Format: "Plan Name — Rs X,XXX/month — Features: coach, diet plan, tracker"
- If user wants the free tier, proceed with free account setup.

### 4. Set Up Profile & Goals
- Navigate to profile/goal setup if not already configured.
- Enter user's goal (weight loss target, timeline).
- Set dietary preference (vegetarian, non-veg, vegan, keto).
- Set activity level and any health conditions.
- Take snapshot of the configured goal dashboard.
- Confirm with user: "Your goal is set to [goal]. Daily calorie target: X,XXX kcal. Does this look right?"

### 5. Review Plan Details & Confirm
- If subscribing to a paid plan, navigate to the subscription checkout page.
- Take snapshot of subscription summary.
- Use `confirm_action` to present subscription summary:
  - Plan: name, tier, duration
  - Features: what is included (coach, meal plans, workout plans)
  - Price: monthly rate, total cost, any discounts
  - Free trial period if applicable
  - Auto-renewal terms
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Payment & Subscribe
- If paid plan, proceed to payment page.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with plan name, duration, features, price, total
  - amount_inr: total subscription amount (number)
  - description: "HealthifyMe subscription"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Subscription & Confirm
- Complete the payment flow on HealthifyMe.
- Handle OTP via `ask_user` if needed.
- Take snapshot of the subscription confirmation / dashboard page.
- Report: plan subscribed, duration, next billing date, daily calorie target, key features activated.
- If free plan, confirm account setup and show the dashboard with tracking features.

## Site Notes

- HealthifyMe plans: Free (basic tracking), Pro (AI coach + diet plans), Smart Plan (human coach + personalized plans).
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- HealthifyMe often runs discounts on annual plans — check for active offers before subscribing.
- The app is primarily mobile-focused; the web version may have limited features compared to the app.
- Smart Plan includes a real human nutritionist — mention this premium feature if relevant.
- Free trial periods (7-14 days) are sometimes offered for Pro/Smart — check and inform user.
- Calorie tracking, water intake, and step counting are available on the free tier.
- Auto-renewal is default on paid plans — clearly inform user about cancellation policy.
- Use `confirm_action` for plan review, `collect_payment` for subscription checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
