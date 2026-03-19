---
name: linkedin-job
description: Search and apply for jobs on LinkedIn — use Easy Apply, filter by role/location/type, send applications.
triggers:
  - linkedin job
  - apply on linkedin
  - linkedin easy apply
  - find jobs on linkedin
  - linkedin job search
  - search linkedin jobs
  - apply for job on linkedin
  - linkedin career
siteUrl: https://www.linkedin.com/jobs
requiresAuth: true
params:
  - name: role
    required: true
    hint: Job title or role to search for (e.g. "data scientist", "frontend developer")
  - name: location
    required: false
    hint: Preferred location (e.g. "San Francisco", "Remote", "India")
  - name: job_type
    required: false
    hint: Job type preference (Full-time, Part-time, Contract, Remote)
  - name: experience_level
    required: false
    hint: Experience level (Entry, Associate, Mid-Senior, Director, Executive)
---

# LinkedIn Job Search & Apply

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- BEFORE opening the browser, check what the user provided.
- If user did not specify a role, use `ask_user` (input_type "freetext"): "What job role or title are you looking for on LinkedIn?"
- If location not provided, use `ask_user` (input_type "freetext"): "What location do you prefer? (e.g. 'Remote', 'Bangalore', 'Any')"
- Optionally ask about job type (Full-time, Part-time, Contract) and experience level.

### 2. Open LinkedIn Jobs & Verify Login
- Open a NEW tab and navigate to `https://www.linkedin.com/jobs/`.
- Take a snapshot. Check if logged in (profile photo or "Me" icon in navbar).
- If NOT logged in, click Sign In and use operator credentials transparently. Do NOT ask user for credentials.
- **If session expired or wrong account, STOP and tell user: "Session expired, please re-login to LinkedIn in Chrome Debug."**
- Take snapshot to confirm logged-in state and jobs page visible.

### 3. Search & Filter Jobs
- Use the job search bar — enter the role/title in "Search jobs" field.
- Enter location in the location field.
- Click Search.
- Apply filters:
  - "Easy Apply" toggle ON (prioritize Easy Apply jobs).
  - Date posted: Past week.
  - Job type if specified (Full-time, Remote, etc.).
  - Experience level if specified.
- Take snapshot of filtered search results.

### 4. Present Job Options
- Scan the results. Extract top 5-7 job listings with:
  - Company name
  - Job title
  - Location (Remote/Hybrid/On-site)
  - Posted date
  - Easy Apply badge (yes/no)
  - Number of applicants (if shown)
- Use `ask_user` (input_type "choice") to let user pick which jobs to apply to.
- If none are suitable, ask if user wants to adjust filters or see more results.

### 5. Apply via Easy Apply
- For each job the user selected:
  - Click on the job listing to open the detail panel.
  - Take snapshot of the job description.
  - Click "Easy Apply" button.
  - Fill in the Easy Apply form step by step:
    - Contact info (should be pre-filled from profile).
    - Resume — use the default resume on profile. If multiple, use `ask_user` to pick.
    - Additional questions (years of experience, work authorization, etc.) — use `ask_user` for each.
    - Cover letter if required — use `ask_user` (input_type "freetext").
  - Use `confirm_action` before clicking "Submit application":
    - Job title, company, location
    - "Confirm you want to submit this application?"
  - Do NOT submit unless user confirms.
  - Click "Submit application".
  - Take snapshot of confirmation.
  - If job does NOT have Easy Apply, inform user it redirects to company site and handle accordingly.

### 6. Final Confirmation
- Take a final snapshot showing applied jobs.
- Report to user:
  - Number of applications submitted
  - List of company names and job titles
  - Any applications that failed or need follow-up
  - "Check your LinkedIn notifications and email for responses"

## Site Notes

- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- LinkedIn may show premium upsell popups, messaging notifications, or connection suggestions — dismiss them.
- "Easy Apply" is the preferred flow — it stays within LinkedIn. Non-Easy Apply redirects to external sites.
- LinkedIn limits Easy Apply submissions — if rate-limited, inform user and pause.
- Some Easy Apply forms have multiple steps (2-4 pages) — navigate each carefully.
- LinkedIn sessions last weeks but may expire — if login page appears, STOP and inform user.
- LinkedIn uses React — always use Playwright fill/type methods, not keyboard.type for dropdowns.
- Use `confirm_action` before each application submission. WAIT for user response. Do NOT auto-proceed.
- Profile must have a resume uploaded. If missing, inform user to upload manually in LinkedIn settings.
- CAPTCHA or security checks may appear — inform user and pause if so.
