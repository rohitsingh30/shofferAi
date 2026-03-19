---
name: adobe-creative
description: Subscribe to Adobe Creative Cloud India. Photography plan, Single App, or All Apps — Photoshop, Illustrator, Premiere Pro, and more.
triggers:
  - adobe creative cloud
  - subscribe adobe
  - adobe photoshop plan
  - buy adobe
  - adobe photography plan
  - adobe all apps
  - adobe premiere pro
  - adobe illustrator plan
  - adobe subscription india
  - creative cloud subscribe
  - adobe lightroom plan
  - adobe student plan
siteUrl: https://www.adobe.com/in/creativecloud/plans.html
requiresAuth: true
params:
  - name: plan
    required: false
    hint: Preferred plan — "Photography", "Single App", "All Apps", or specific app name
  - name: billing
    required: false
    hint: Billing cycle — "monthly" or "annual" (annual is cheaper per month)
  - name: user_type
    required: false
    hint: User type — "individual", "student", "business", or "school"
---

# Adobe Creative Cloud India Subscription

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine what Adobe plan the user needs via `ask_user` (input_type "choice"):
  - "Photography Plan — ₹888/mo — Photoshop + Lightroom + 20GB cloud"
  - "Single App — ₹1,675/mo — Choose one app (Photoshop, Illustrator, Premiere Pro, etc.)"
  - "All Apps — ₹4,230/mo — 20+ Creative Cloud apps + 100GB cloud storage"
  - "All Apps (Student) — ₹1,596/mo — Full suite at 60% off for students/teachers"
- If user wants a Single App, ask which app via `ask_user` (input_type "choice"):
  - "Photoshop — Photo editing, compositing, AI-powered tools"
  - "Illustrator — Vector graphics, logo design, illustrations"
  - "Premiere Pro — Video editing, color grading, motion graphics"
  - "After Effects — Visual effects, motion design, animation"
  - "InDesign — Page layout, publishing, print design"
  - "Lightroom — Photo editing, cloud-based, all devices"
  - "Acrobat Pro — PDF editing, forms, e-signatures"
  - "Other app (specify)"
- Ask about billing cycle — annual (paid monthly) is significantly cheaper than month-to-month.
- For students: verify they have a valid .edu email or institution documentation.

### 2. Open Adobe & Verify Login
- Open a NEW tab and navigate to `https://www.adobe.com/in/creativecloud/plans.html`.
- Take snapshot. Check if logged in (Adobe account avatar in top-right corner).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- If user already has a subscription, navigate to Account → Plans to view/change current plan.

### 3. Navigate to Plan Selection
- Browse the plans page for India pricing.
- Take snapshot of available plans with current pricing.
- Verify on-screen prices (Adobe India pricing may differ from listed — always use what's shown).
- If there is a promotional offer (Adobe frequently runs 40-60% off deals), highlight the savings.
- Select the user's chosen plan category.
- For annual vs monthly billing, show the price difference clearly.

### 4. Configure Plan & Review
- Select the specific plan and billing option.
- Take snapshot of the checkout/order summary page.
- Use `confirm_action` with subscription summary:
  - Plan name (Photography / Single App / All Apps)
  - Specific apps included
  - Monthly price in INR
  - Annual commitment and total yearly cost (if annual plan)
  - Cloud storage included (20GB / 100GB)
  - Adobe Fonts, Adobe Portfolio, Behance included
  - Early termination fee (50% of remaining months for annual plan)
  - Free trial period (if available — Adobe often offers 7-day free trial)
  - First charge date
- Do NOT proceed unless user confirms.

### 5. Payment
- Use `collect_payment`:
  - summary: JSON with plan, apps_included, price_monthly_inr, billing_cycle, cloud_storage, trial_info
  - amount_inr: first month's price in INR
  - description: "Adobe Creative Cloud India subscription"
- WAIT for payment confirmation from user.

### 6. Complete & Confirm
- Proceed to Adobe checkout page.
- Enter payment method (credit/debit card / UPI / net banking).
- Handle OTP via `ask_user` if needed.
- Take snapshot of subscription confirmation page.
- Report to user:
  - Plan activated — apps available to download
  - Monthly charge in INR
  - How to install: Download Adobe Creative Cloud desktop app → install individual apps
  - Cloud storage allocated
  - Next billing date
  - How to cancel: adobe.com → Account → Plans → Cancel Plan
- **Important**: Warn about annual plan cancellation fee: "Annual plans charged monthly have a 50% early termination fee if cancelled before 12 months."

### 7. Verify Activation
- Navigate to Adobe account page to confirm active subscription.
- Take snapshot showing active plan status and available apps.
- Confirm to user that all included apps are ready for download via Creative Cloud desktop app.

## Site Notes

- Adobe Creative Cloud is the industry standard for creative professionals — Photoshop, Illustrator, Premiere Pro are essential tools.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in to Adobe. Do NOT ask user for credentials.
- Adobe India pricing is in INR — significantly cheaper than US pricing due to regional pricing.
- Adobe frequently runs promotional deals (40-65% off first year) — always check for active promotions before subscribing.
- Photography Plan (₹888/mo) is the best value for photographers — includes full Photoshop + Lightroom at a fraction of the cost.
- Student/Teacher discount is 60% off All Apps — requires valid .edu email or SheerID verification.
- Annual plan (paid monthly) is much cheaper per month than month-to-month, but has a 50% early termination fee — warn user clearly.
- Adobe accepts credit/debit card, UPI, and net banking in India — more payment options than most international services.
- All Creative Cloud plans include Adobe Fonts (thousands of fonts), Adobe Portfolio, and Behance integration.
- Adobe offers a 7-day free trial for most plans — check if available and highlight to new users.
- Lightroom (cloud-based) works on mobile/tablet/web — useful for users who edit on multiple devices.
- Creative Cloud desktop app is required to install individual apps — guide user to download it after subscribing.
- Use `confirm_action` for review, `collect_payment` for checkout. Always WAIT for user response.
