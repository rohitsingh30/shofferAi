---
name: indeed-jobs
description: Search and apply for jobs on Indeed India — filter by role, location, salary, company, and submit applications.
triggers:
  - indeed jobs
  - apply on indeed
  - indeed job search
  - find jobs on indeed
  - indeed india jobs
  - search indeed
  - indeed apply
  - indeed.co.in
siteUrl: https://in.indeed.com
requiresAuth: true
params:
  - name: role
    required: true
    hint: Job title or keywords (e.g. "software developer", "marketing manager", "accountant")
  - name: location
    required: false
    hint: City or region (e.g. "Mumbai", "Bangalore", "Remote", "Delhi NCR")
  - name: salary
    required: false
    hint: Minimum salary expectation (e.g. "5 LPA", "30000/month", "any")
  - name: job_type
    required: false
    hint: Job type (Full-time, Part-time, Contract, Internship, Fresher)
  - name: experience
    required: false
    hint: Experience level in years (e.g. "0-1", "3-5", "fresher")
---

# Indeed India — Job Search & Apply

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- BEFORE opening the browser, check what the user provided.
- If user did not specify a role, use `ask_user` (input_type "freetext"): "What job title or role are you searching for on Indeed?"
- If location not provided, use `ask_user` (input_type "freetext"): "Which city or location do you prefer? (e.g. 'Mumbai', 'Remote', 'Any')"
- Optionally ask about salary expectations, job type, and experience level.
- Ask: "Do you prefer any specific company type — startup, MNC, government, or any?"

### 2. Open Indeed & Verify Login
- Open a NEW tab and navigate to `https://in.indeed.com`.
- Take a snapshot. Check if logged in (profile icon, "My Jobs" link, or account name visible).
- If NOT logged in, click Sign In and use operator credentials transparently. Do NOT ask user for credentials.
- **If session expired or login fails, STOP and tell user: "Session expired, please re-login to Indeed in Chrome Debug."**
- Take snapshot to confirm logged-in state and homepage visible.

### 3. Search & Filter Jobs
- Enter the user's role/keywords in the "What" search field.
- Enter location in the "Where" field.
- Click "Find Jobs" button.
- Apply filters from the sidebar:
  - Date posted: Last 7 days (or 14 days if few results).
  - Job type: Full-time / Part-time / Contract as specified.
  - Salary estimate if user provided a range.
  - Experience level if specified.
  - "Easily Apply" filter for streamlined applications.
- Take snapshot of search results.

### 4. Present Job Options
- Scan the first page of results. Extract top 5-7 job listings with:
  - Company name
  - Job title
  - Location (city, remote, hybrid)
  - Salary range (if displayed)
  - Posted date
  - Rating/reviews count
  - "Easily Apply" badge (yes/no)
- Use `ask_user` (input_type "choice") to let user pick which jobs to apply to.
- If none are suitable, ask if user wants to refine keywords or see next page.

### 5. Apply to Selected Jobs
- For each job the user selected:
  - Click on the job listing to open the detail panel.
  - Take snapshot of the full job description.
  - Summarize: responsibilities, qualifications, salary, benefits, company info.
  - Click "Apply Now" or "Apply on company site" button.
  - If Indeed shows its own application form:
    - Fill in required fields (contact info, resume, cover letter).
    - Answer screening questions using `ask_user` if needed.
  - If it redirects to an external company site:
    - Navigate there and complete the application form.
    - Use `ask_user` for any fields that need user input.
  - Use `confirm_action` before submitting each application:
    - Job title, company, location, salary
    - "Confirm you want to apply to this position?"
  - Do NOT submit unless user confirms.
  - Take snapshot after each submission.

### 6. Collect Service Fee
- Use `collect_payment` after applications are submitted:
  - summary: "Job application service — applied to X positions on Indeed"
  - amount_inr: service fee amount
  - description: "ShofferAI concierge fee for job search and application on Indeed India"

### 7. Final Confirmation
- Take a final snapshot of all applications submitted.
- Report to user:
  - Number of jobs applied to
  - List of company names, job titles, and salary ranges
  - Any applications that failed or redirected externally
  - Next steps: "Check your Indeed dashboard and email for recruiter responses."
  - "Companies typically respond within 5-14 days. You can track application status on Indeed."

## Site Notes

- Indeed is the world's largest job aggregator — pulls listings from company sites, staffing agencies, and direct posts.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Indeed may show Google OAuth login — use the operator's Google account if needed.
- "Easily Apply" jobs have a streamlined in-site form — prioritize these for faster applications.
- Many listings redirect to external company career pages — handle both flows gracefully.
- Indeed sessions can expire after a few weeks — if login page appears, STOP and inform user.
- Resume should be uploaded to Indeed profile. If missing, inform user to upload manually.
- Indeed may show duplicate listings from different sources — deduplicate before presenting.
- Salary estimates are sometimes Indeed's own projections, not employer-confirmed — note this to user.
- Use `confirm_action` before each application submission. WAIT for user response. Do NOT auto-proceed.
- If CAPTCHA appears during login or apply, inform user and pause.
