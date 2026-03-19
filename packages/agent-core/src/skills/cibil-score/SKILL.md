---
name: cibil-score
description: Check CIBIL credit score and report on cibil.com — enter details, verify identity, view full credit report.
triggers:
  - cibil score
  - check cibil
  - credit score
  - check credit score
  - cibil report
  - transunion cibil
  - my cibil score
  - free cibil check
  - credit report
  - cibil score check
siteUrl: https://www.cibil.com
requiresAuth: true
params:
  - name: action
    required: false
    hint: Action — "check score" (default), "view full report", "dispute error"
---

# CIBIL Credit Score Check

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm user wants to check their CIBIL credit score and report.
- Ask if they want: just the score, full detailed report, or to dispute an error.
- Inform user that identity verification (PAN, DOB, phone OTP) will be needed.
- Use `ask_user` to confirm readiness.

### 2. Open CIBIL & Verify Login
- Open a NEW tab and navigate to `https://www.cibil.com/freecibilscore`.
- Take snapshot. Check if already logged in (dashboard with score visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Identity Verification (if needed)
- If not already verified, the site will ask for:
  - Full name as per PAN card
  - PAN number
  - Date of birth
  - Email address
  - Mobile number
- Use `ask_user` for PAN number and DOB if not already known.
- Handle phone/email OTP via `ask_user`: "Enter the OTP sent to your registered mobile."
- Take snapshot after verification.

### 4. View Credit Score
- Wait for score dashboard to load.
- Take snapshot of the CIBIL score dashboard.
- Extract and report:
  - CIBIL score (300-900 range)
  - Score rating: Poor (300-549), Fair (550-649), Good (650-749), Excellent (750-900)
  - Score trend (improved/declined/stable vs last check)
  - Number of active accounts
  - Total credit utilization percentage

### 5. View Detailed Report
- If user wants full report, navigate to detailed credit report section.
- Take snapshot of each section:
  - Account summary: total accounts, active, closed, overdue
  - Credit card accounts: bank, limit, outstanding, payment history
  - Loan accounts: type, lender, outstanding, EMI, status
  - Recent enquiries: who checked your CIBIL and when
- Present summary via `ask_user`:
  "Your CIBIL Score: XXX (Excellent)"
  "Active accounts: X credit cards, X loans"
  "Credit utilization: XX%"
  "Recent enquiries: X in last 6 months"

### 6. Review & Confirm
- Use `confirm_action` to confirm user has reviewed their report:
  - CIBIL score
  - Score category
  - Key factors affecting score
  - Recommendations to improve (if score < 750)
  - Any red flags (overdue accounts, high utilization)
- Ask if user wants to take any action: dispute errors, download report.

### 7. Payment (for premium report)
- Free tier shows score + basic report.
- If user wants premium features (detailed report, score simulator, alerts):
  - Use `collect_payment`:
    - summary: JSON with plan_name, features, duration, price
    - amount_inr: subscription amount
    - description: "CIBIL premium subscription"
  - WAIT for payment confirmation.
- If free tier is sufficient, skip this step.

### 8. Complete & Confirm
- Take final snapshot of the score dashboard.
- Report complete summary: CIBIL score, key highlights, improvement tips, next free check date.
- If user purchased premium, confirm subscription details.

## Site Notes

- CIBIL (TransUnion) is India's primary credit bureau — banks check CIBIL score for all loan/card approvals.
- Score range: 300-900. Above 750 is considered excellent for loan/card approval.
- One free CIBIL check per year is available at cibil.com — additional checks require subscription.
- Chrome profile rsinghtomar3011@gmail.com may have existing CIBIL account. Do NOT ask user for credentials.
- Checking your own CIBIL score is a "soft enquiry" — it does NOT reduce your score.
- Hard enquiries (by banks when you apply for loans/cards) do reduce score temporarily — visible in report.
- High credit utilization (>30% of limit) negatively impacts score — advise user to keep it low.
- Payment defaults/delays are the #1 factor hurting CIBIL score — even 1 day late is recorded.
- CIBIL report errors can be disputed online — takes 30-45 days to resolve.
- Score updates monthly based on data reported by banks — changes reflect with a lag.
- Use `confirm_action` for review, `collect_payment` for premium subscription. WAIT for user response.
