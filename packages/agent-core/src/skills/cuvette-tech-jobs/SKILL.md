---
name: cuvette-tech-jobs
description: Apply for tech and startup jobs on Cuvette — software engineering, data science, product, design roles at high-growth startups.
triggers:
  - cuvette jobs
  - cuvette tech
  - apply on cuvette
  - cuvette startup jobs
  - find jobs cuvette
  - cuvette software
  - cuvette.tech
  - cuvette internship
siteUrl: https://cuvette.tech
requiresAuth: true
params:
  - name: role
    required: true
    hint: Job role to search (e.g. "frontend developer", "backend engineer", "data scientist", "product manager", "UI/UX designer")
  - name: job_type
    required: false
    hint: Job type preference (Full-time, Internship, Contract, Freelance)
  - name: location
    required: false
    hint: Location preference (e.g. "Bangalore", "Remote", "Delhi NCR", "Any")
  - name: experience
    required: false
    hint: Experience level (e.g. "0-1 years", "2-4 years", "fresher")
  - name: salary
    required: false
    hint: Expected salary/stipend (e.g. "10-15 LPA", "50K/month stipend")
---

# Cuvette — Tech & Startup Job Application

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- BEFORE opening the browser, check what the user provided.
- If user did not specify a role, use `ask_user` (input_type "freetext"): "What tech role are you looking for? (e.g. frontend developer, backend engineer, data scientist, product manager)"
- If job type not specified, use `ask_user` (input_type "choice"): "Are you looking for: Full-time / Internship / Contract / Freelance?"
- If location not provided, use `ask_user` (input_type "freetext"): "Location preference? (e.g. 'Remote', 'Bangalore', 'Any')"
- Optionally ask about experience level and salary expectations.
- Ask: "Do you have a preference for company stage — early-stage startup, Series A-C, or any?"

### 2. Open Cuvette & Verify Login
- Open a NEW tab and navigate to `https://cuvette.tech/app/student/jobs`.
- Take a snapshot. Check if logged in (profile icon or dashboard visible).
- If NOT logged in, click Login/Sign In and use operator credentials transparently. Do NOT ask user for credentials.
- **If session expired or login fails, STOP and tell user: "Session expired, please re-login to Cuvette in Chrome Debug."**
- Take snapshot to confirm logged-in state and jobs listing visible.

### 3. Search & Filter Jobs
- Use the search/filter functionality to find matching roles.
- Apply filters:
  - Role/title matching user's request.
  - Job type: Full-time / Internship / Contract.
  - Location: Remote / specific city.
  - Salary/stipend range if specified.
  - Experience level filter.
  - Tech stack filter if user mentioned specific technologies.
- Sort by "Most Recent" or "Relevance".
- Take snapshot of filtered results.

### 4. Present Job Options
- Scan results. Extract top 5-7 listings with:
  - Company name and stage (Seed, Series A, etc.)
  - Job title
  - Location (Remote/Hybrid/On-site)
  - Salary range or stipend
  - Tech stack required
  - Posted date
  - Number of applicants
- Use `ask_user` (input_type "choice") to let user pick which jobs to apply to:
  "Frontend Developer at Razorpay (Series D) — Rs 18-25 LPA — Bangalore/Remote — React, TypeScript"
- If none are suitable, ask if user wants to adjust filters or explore other roles.

### 5. Apply to Selected Jobs
- For each job the user selected:
  - Click on the listing to open the full job page.
  - Take snapshot of the complete job description.
  - Summarize: responsibilities, required skills, tech stack, company culture, perks, growth.
  - Click "Apply" button.
  - Fill in any required application fields.
  - If assignment or coding test is required, inform user: "This role requires a take-home assignment. Details: [summary]"
  - If cover letter or motivation is needed, use `ask_user` (input_type "freetext") to draft it.
  - Use `confirm_action` before submitting each application:
    - Job title, company, location, salary, tech stack
    - "Confirm you want to apply to this position?"
  - Do NOT submit unless user confirms.
  - Take snapshot after each submission.

### 6. Collect Service Fee
- Use `collect_payment` after applications are submitted:
  - summary: "Tech job applications — applied to X positions on Cuvette"
  - amount_inr: service fee amount
  - description: "ShofferAI concierge fee for tech job search and application on Cuvette"

### 7. Final Confirmation
- Take a final snapshot of all applications submitted.
- Report to user:
  - Number of jobs applied to
  - List of companies, roles, and salary ranges
  - Any pending assignments or coding tests to complete
  - Next steps: "Cuvette startups typically respond within 3-7 days."
  - "Check your Cuvette dashboard for application status updates."
  - If assignments are pending: "Complete the take-home assignment by the deadline to proceed."

## Site Notes

- Cuvette is a curated tech job platform focused on startups and high-growth companies in India.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Cuvette uses a student/professional profile system — ensure the profile is complete (resume, skills, projects, GitHub).
- Many roles require take-home assignments or coding challenges — inform user clearly and share deadlines.
- Cuvette sessions may expire — if login page appears, STOP and inform user.
- Startups on Cuvette often offer equity/ESOPs in addition to salary — always mention this in job summaries.
- Cuvette has both job listings and placement programs (Cuvette Placements) — focus on direct job listings unless user asks.
- The platform is React-based — use Playwright fill/type methods for form inputs.
- Use `confirm_action` before each application. WAIT for user response. Do NOT auto-proceed.
- Some listings may be outdated — check posted date and warn user if older than 30 days.
