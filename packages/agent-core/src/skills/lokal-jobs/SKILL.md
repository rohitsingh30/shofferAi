---
name: lokal-jobs
description: Find local and blue-collar jobs on Lokal app/website — delivery, driver, field sales, warehouse, BPO, and other hyperlocal roles.
triggers:
  - lokal jobs
  - find jobs on lokal
  - lokal app jobs
  - blue collar jobs
  - local jobs near me
  - delivery boy job
  - driver job lokal
  - lokal job search
siteUrl: https://www.getlokal.app
requiresAuth: true
params:
  - name: job_type
    required: true
    hint: Type of job (e.g. "delivery boy", "driver", "field sales", "warehouse", "BPO", "security guard")
  - name: city
    required: true
    hint: City or area for job search (e.g. "Hyderabad", "Bangalore", "Pune")
  - name: salary_range
    required: false
    hint: Expected salary range (e.g. "15000-25000", "20000+")
  - name: experience
    required: false
    hint: Experience level (e.g. "fresher", "1-2 years", "any")
---

# Lokal Jobs — Local & Blue-Collar Job Search

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- BEFORE opening the browser, check what the user provided.
- If user did not specify a job type, use `ask_user` (input_type "freetext"): "What type of job are you looking for? (e.g. delivery boy, driver, field sales, warehouse helper, BPO executive)"
- If city not provided, use `ask_user` (input_type "freetext"): "Which city or area are you looking for jobs in?"
- Optionally ask about salary expectations and experience level if not provided.
- Ask: "Do you have any preference for company type — startup, MNC, local business, or any?"

### 2. Open Lokal & Verify Login
- Open a NEW tab and navigate to `https://www.getlokal.app/jobs`.
- Take a snapshot. Check if the site is accessible and if logged in (profile icon or account menu visible).
- If NOT logged in, attempt login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired or login fails, STOP and tell user: "Session expired, please re-login to Lokal in Chrome Debug."**
- Take snapshot to confirm logged-in state and jobs page visible.

### 3. Search & Filter Jobs
- Use the search functionality to enter the user's desired job type.
- Set the city/location filter to the user's preferred city.
- Apply salary filter if provided by the user.
- Apply experience filter if specified.
- Sort results by "Most Recent" or "Relevance" as appropriate.
- Take snapshot of search results page.

### 4. Present Job Options
- Scan the results. Extract top 5-7 job listings with:
  - Company name
  - Job title / role
  - Location / area within city
  - Salary offered (monthly)
  - Experience required
  - Posted date
  - Job type (full-time / part-time / contract)
- Use `ask_user` (input_type "choice") to let user pick which jobs to explore:
  "Delivery Executive at Swiggy — Rs 18,000-22,000/month — Koramangala, Bangalore — Fresher OK"
- If none are suitable, ask if user wants to refine search or see more results.

### 5. Review & Apply to Selected Jobs
- For each job the user selected:
  - Click on the job listing to open the detail page.
  - Take snapshot of the full job description.
  - Summarize: company info, responsibilities, requirements, salary, timings, benefits.
  - Click "Apply" or "Contact HR" button.
  - Fill in any required fields in the application form (name, phone, experience, etc.).
  - If additional questions appear, use `ask_user` to get answers from the user.
  - Use `confirm_action` before submitting each application:
    - Job title, company, location, salary
    - "Confirm you want to apply to this position?"
  - Do NOT submit unless user confirms.
  - Take snapshot after each application submission.

### 6. Collect Service Fee
- Use `collect_payment` after applications are submitted:
  - summary: "Job application service — applied to X positions on Lokal"
  - amount_inr: service fee amount
  - description: "ShofferAI concierge fee for job search and application on Lokal"

### 7. Final Confirmation
- Take a final snapshot of all applications submitted.
- Report to user:
  - Number of jobs applied to
  - List of company names, job titles, and expected salaries
  - Any applications that failed or need follow-up
  - Next steps: "You may receive calls from HR directly. Keep your phone available."
  - "Check your Lokal app inbox for updates on your applications."

## Site Notes

- Lokal is a hyperlocal jobs platform popular in Tier 2/3 cities — specializes in blue-collar and entry-level roles.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Lokal may require phone number verification via OTP — OTP goes to operator's phone.
- Many listings show HR phone numbers directly — offer to share these with the user as an alternative to in-app apply.
- Job descriptions are often in regional languages (Telugu, Hindi) — translate or summarize in English for the user.
- Lokal sessions may expire frequently — if login page appears, STOP and inform user.
- Some listings are duplicates posted by multiple agencies — deduplicate before presenting to user.
- Salary shown is often gross/in-hand monthly — clarify with user if they need CTC breakdown.
- Use `confirm_action` before each job application. WAIT for user response. Do NOT auto-proceed.
- If CAPTCHA or OTP verification appears during apply, inform user and pause.
