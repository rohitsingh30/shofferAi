---
name: apna-jobs
description: Find and apply for jobs on Apna — delivery, sales, support, telecalling, data entry, and other entry-level roles.
triggers:
  - apna jobs
  - find jobs on apna
  - apna app job
  - delivery job apna
  - sales job apna
  - telecalling job
  - apna job apply
  - apna.co jobs
siteUrl: https://apna.co
requiresAuth: true
params:
  - name: role
    required: true
    hint: Job role to search for (e.g. "delivery executive", "sales executive", "telecaller", "data entry", "customer support")
  - name: city
    required: true
    hint: City for job search (e.g. "Delhi", "Mumbai", "Bangalore", "Hyderabad")
  - name: salary
    required: false
    hint: Expected monthly salary (e.g. "15000-20000", "25000+")
  - name: education
    required: false
    hint: Education level (e.g. "10th pass", "12th pass", "graduate", "any")
---

# Apna — Job Search & Apply

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- BEFORE opening the browser, check what the user provided.
- If user did not specify a role, use `ask_user` (input_type "freetext"): "What kind of job are you looking for? (e.g. delivery executive, sales, telecaller, data entry, customer support)"
- If city not provided, use `ask_user` (input_type "freetext"): "Which city are you looking for jobs in?"
- Optionally ask about salary expectations and education qualification if not provided.
- Ask: "Are you looking for full-time, part-time, or work from home?"

### 2. Open Apna & Verify Login
- Open a NEW tab and navigate to `https://apna.co/jobs`.
- Take a snapshot. Check if logged in (profile icon or user menu visible in header).
- If NOT logged in, attempt login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired or login fails, STOP and tell user: "Session expired, please re-login to Apna in Chrome Debug."**
- Take snapshot to confirm logged-in state and jobs listing page visible.

### 3. Search & Filter Jobs
- Use the search bar to enter the user's desired role.
- Set the city/location filter.
- Apply additional filters: salary range, education, job type (full-time/part-time/WFH).
- Apply freshers-friendly filter if user is a fresher.
- Sort by "Most Recent" or "Relevance".
- Take snapshot of search results.

### 4. Present Job Options
- Scan the results. Extract top 5-7 job listings with:
  - Company name
  - Job title
  - Location / area
  - Salary range (monthly)
  - Education requirement
  - Experience requirement
  - Job type (full-time / part-time / WFH)
  - Number of openings
- Use `ask_user` (input_type "choice") to let user pick which jobs to apply to:
  "Delivery Partner at Zomato — Rs 18,000-25,000/month — Indiranagar, Bangalore — 10th Pass OK — 50 openings"
- If none are suitable, ask if user wants to adjust filters or see next page.

### 5. Apply to Selected Jobs
- For each job the user selected:
  - Click on the job listing to open the detail page.
  - Take snapshot of the full job description, requirements, and company details.
  - Summarize: salary, shift timings, responsibilities, requirements, interview process, joining timeline.
  - Click "Apply" button.
  - Fill in any required application fields (name, phone, qualification, experience).
  - If screening questions appear, use `ask_user` to get answers.
  - Use `confirm_action` before submitting each application:
    - Job title, company, location, salary
    - "Confirm you want to apply to this position?"
  - Do NOT submit unless user confirms.
  - Take snapshot after each application submission.

### 6. Collect Service Fee
- Use `collect_payment` after applications are submitted:
  - summary: "Job application service — applied to X positions on Apna"
  - amount_inr: service fee amount
  - description: "ShofferAI concierge fee for job search and application on Apna"

### 7. Final Confirmation
- Take a final snapshot of all applications submitted.
- Report to user:
  - Number of jobs applied to
  - List of company names, job titles, and expected salaries
  - Any applications that need follow-up
  - Next steps: "HR teams on Apna typically respond within 2-3 days via call or chat."
  - "Check your Apna app for interview schedules and chat messages from recruiters."

## Site Notes

- Apna is India's largest professional networking platform for entry-level and grey/blue-collar jobs.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Apna may require phone OTP verification — OTP goes to operator's phone.
- Many jobs on Apna have instant interview scheduling — inform user about upcoming calls.
- Job listings often show "X people applied" — prioritize listings with fewer applicants for better chances.
- Apna uses community groups — do not accidentally join communities or post content.
- Apna sessions may expire after a few days — if login page appears, STOP and inform user.
- Salary is typically shown as monthly in-hand — clarify with user if they need CTC or annual breakdown.
- Some listings redirect to WhatsApp for direct HR contact — offer this option to user.
- Use `confirm_action` before each job application. WAIT for user response. Do NOT auto-proceed.
- If CAPTCHA or phone verification appears, inform user and pause.
