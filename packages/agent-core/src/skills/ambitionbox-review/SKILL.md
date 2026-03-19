---
name: ambitionbox-review
description: Research company reviews, salaries, and interview questions on AmbitionBox (by Naukri) — India-focused employer insights.
triggers:
  - ambitionbox
  - ambition box review
  - company review ambitionbox
  - ambitionbox salary
  - ambitionbox interview
  - check company ambitionbox
  - naukri company review
  - ambitionbox ratings
siteUrl: https://www.ambitionbox.com
requiresAuth: true
params:
  - name: company
    required: true
    hint: Company name to research (e.g. "Wipro", "Swiggy", "HDFC Bank", "Zoho")
  - name: research_type
    required: false
    hint: What to research — reviews, salaries, interviews, benefits, or all (default "all")
  - name: role
    required: false
    hint: Specific role for salary/review lookup (e.g. "software developer", "business analyst")
  - name: department
    required: false
    hint: Department filter (e.g. "engineering", "sales", "HR", "finance")
---

# AmbitionBox — Company Reviews & Salary Research (India)

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- BEFORE opening the browser, check what the user provided.
- If user did not specify a company, use `ask_user` (input_type "freetext"): "Which company do you want to research on AmbitionBox?"
- If research type not specified, use `ask_user` (input_type "choice"): "What would you like to know? Reviews / Salaries / Interview Questions / Benefits / All of the above"
- If user wants salary info, ask for the specific role: "What role or designation should I check salary data for?"
- Optionally ask about department or location for more targeted results.

### 2. Open AmbitionBox & Verify Login
- Open a NEW tab and navigate to `https://www.ambitionbox.com`.
- Take a snapshot. Check if logged in (profile icon or Naukri account linked visible in header).
- If NOT logged in, click Login. AmbitionBox uses Naukri credentials — login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login to AmbitionBox/Naukri in Chrome Debug."**
- Take snapshot to confirm logged-in state.

### 3. Search for Company
- Use the search bar to type the company name.
- Select the correct company from dropdown suggestions (verify by industry, location, logo).
- Navigate to the company's AmbitionBox profile page.
- Take snapshot of the company overview.

### 4. Extract Company Overview
- Capture and summarize:
  - Overall rating (out of 5)
  - Total number of reviews
  - Category ratings: Work-life balance, Salary & benefits, Job security, Skill development, Work satisfaction, Company culture
  - "Highly rated for" and "Critical in" highlights
  - Company type (Indian MNC, Startup, Product, Service), size, founded year
  - Comparison with similar companies
- Present this overview to the user clearly.

### 5. Detailed Research Based on Request

#### If Reviews requested:
- Navigate to the Reviews section.
- Filter by: department, designation, rating, sort by recent.
- Extract top 5-7 reviews with: overall rating, likes, dislikes, work-life balance comment, role, employment status.
- Summarize common themes across positive and negative reviews.
- Use `ask_user` if user wants to filter further or see more.

#### If Salaries requested:
- Navigate to the Salaries section.
- Search or filter by the specific role.
- Extract: average salary, salary range (min-max), experience-wise breakdown, bonus info, total compensation.
- Show how it compares to industry average.
- Present salary progression by experience level if available.

#### If Interview Questions requested:
- Navigate to the Interviews section.
- Filter by role if specified.
- Extract top 5-7 interview experiences: difficulty level, questions asked, rounds (HR, technical, managerial), duration, result (selected/rejected).
- Highlight frequently asked questions for the target role.

#### If Benefits requested:
- Navigate to the Benefits section.
- Summarize: health insurance, WFH policy, leaves, cab/food, ESOPs, learning budget, perks.
- Compare with industry standards.

### 6. Present Findings & Offer Comparison
- Compile all research into a structured summary.
- Use `ask_user` (input_type "choice"): "Would you like to: See more reviews / Check salary for another role / Read interview experiences / Compare with another company / Done"
- If user wants to compare, repeat from Step 3 with the new company name.

### 7. Collect Service Fee
- Use `collect_payment` after research is complete:
  - summary: "Company research on AmbitionBox — detailed analysis of [company name]"
  - amount_inr: service fee amount
  - description: "ShofferAI concierge fee for AmbitionBox company research and salary analysis"

### 8. Final Summary
- Take a final snapshot of key pages accessed.
- Report to user:
  - Overall rating and top category scores
  - Top 3 pros and top 3 cons from employee reviews
  - Salary range for their target role with experience breakdown
  - Interview difficulty and key questions to prepare
  - Benefits highlights
  - Final recommendation: "Based on employee feedback, here is my assessment..."

## Site Notes

- AmbitionBox is owned by Naukri/InfoEdge — it is India's largest employer review platform with 5 Cr+ reviews.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in via Naukri SSO. Do NOT ask user for credentials.
- AmbitionBox may show "Login to read full review" prompts — being logged in avoids this.
- Salary data is self-reported and crowdsourced — always caveat this to user and suggest verifying during interviews.
- AmbitionBox sessions tied to Naukri login — if Naukri session expires, AmbitionBox also logs out. STOP and inform user.
- Some smaller companies have very few reviews — inform user and suggest checking Glassdoor as a supplementary source.
- Category ratings (work-life balance, salary, culture) are more reliable with 50+ reviews — note sample size to user.
- AmbitionBox frequently shows Naukri job recommendations — ignore and do not click on job listings unless user requests.
- Use `confirm_action` before any account-modifying actions. WAIT for user response. Do NOT auto-proceed.
- The site loads heavy JavaScript — wait for dynamic content before taking snapshots.
