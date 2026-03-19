---
name: naukri-job
description: Search and apply for jobs on Naukri.com — filter by role, location, salary, experience, apply to matching positions.
triggers:
  - naukri
  - apply on naukri
  - job search naukri
  - find jobs on naukri
  - naukri job apply
  - search naukri jobs
  - apply for job
  - naukri.com
siteUrl: https://www.naukri.com
requiresAuth: true
params:
  - name: role
    required: true
    hint: Job title or role to search for (e.g. "software engineer", "product manager")
  - name: location
    required: false
    hint: Preferred city or remote (e.g. "Bangalore", "Remote", "Mumbai")
  - name: experience
    required: false
    hint: Years of experience (e.g. "3", "5-8")
  - name: salary
    required: false
    hint: Expected salary range in LPA (e.g. "10-15 LPA")
---

# Naukri.com Job Search & Apply

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- BEFORE opening the browser, check what the user provided.
- If user did not specify a role, use `ask_user` (input_type "freetext"): "What job role or title are you looking for?"
- If location not provided, use `ask_user` (input_type "freetext"): "Which city or location do you prefer? (or type 'Remote' / 'Any')"
- If experience not provided, use `ask_user` (input_type "freetext"): "How many years of experience do you have?"
- Optionally ask about salary expectations if not provided.

### 2. Open Naukri & Verify Login
- Open a NEW tab and navigate to `https://www.naukri.com`.
- Take a snapshot. Check if logged in (profile icon or name visible in header).
- If NOT logged in, click Login and use operator credentials transparently. Do NOT ask user for credentials.
- **If session expired or wrong account, STOP and tell user: "Session expired, please re-login to Naukri in Chrome Debug."**
- Take snapshot to confirm logged-in state and homepage visible.

### 3. Search Jobs
- Click the search bar at the top of the page.
- Type the user's desired role/title and set the location filter.
- Apply experience filter if provided.
- Apply salary filter if provided.
- Press Search or click the search button.
- Take snapshot of search results.

### 4. Present Job Options
- Scan the first page of results. Extract top 5-7 job listings with:
  - Company name
  - Job title
  - Location
  - Salary range (if shown)
  - Experience required
  - Posted date
- Use `ask_user` (input_type "choice") to let user pick which jobs to apply to.
- If none are suitable, ask if user wants to refine search or see next page.

### 5. Apply to Selected Jobs
- For each job the user selected:
  - Click on the job listing to open the detail page.
  - Take snapshot of the job description.
  - Click "Apply" or "Apply on company site" button.
  - If Naukri shows a quick-apply form, fill in any required fields.
  - If it redirects to an external site, navigate there and complete the application.
  - If resume upload is needed and a resume is already on profile, use that.
  - If additional questions appear (cover letter, availability), use `ask_user` to get answers.
  - Take snapshot after each application submission.
- Use `confirm_action` before submitting each application:
  - Job title, company, location, salary
  - "Confirm you want to apply to this position?"
- Do NOT submit unless user confirms.

### 6. Final Confirmation
- Take a final snapshot of the applications submitted.
- Report to user:
  - Number of jobs applied to
  - List of company names and job titles
  - Any jobs that failed or need follow-up
  - Next steps (e.g. "Check your Naukri inbox for responses")

## Site Notes

- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Naukri may show popups for profile completion, resume update, or premium plans — dismiss them.
- "Apply" button may say "Apply on company site" which redirects externally — handle both flows.
- Some jobs require answering screening questions — use `ask_user` for each question.
- Naukri sessions expire after a few days — if login page appears, STOP and inform user.
- Resume should already be uploaded to the Naukri profile. If missing, inform user to upload manually.
- Naukri uses React — always use Playwright fill/type methods.
- Use `confirm_action` before each job application. WAIT for user response. Do NOT auto-proceed.
- Job search results may vary by time of day — always take fresh snapshots.
- If CAPTCHA appears during login or apply, inform user and pause.
