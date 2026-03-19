---
name: hirist-tech
description: Apply for premium tech jobs on Hirist — curated software engineering, data, DevOps, and product roles at top companies.
triggers:
  - hirist jobs
  - hirist tech
  - apply on hirist
  - hirist.com
  - hirist developer jobs
  - premium tech jobs
  - hirist software
  - hirist apply
siteUrl: https://www.hirist.com
requiresAuth: true
params:
  - name: role
    required: true
    hint: Tech role to search (e.g. "software engineer", "data scientist", "DevOps engineer", "engineering manager")
  - name: location
    required: false
    hint: Preferred city (e.g. "Bangalore", "Hyderabad", "Remote", "Pune")
  - name: experience
    required: false
    hint: Experience in years (e.g. "2-4", "5-8", "10+")
  - name: salary
    required: false
    hint: Expected CTC (e.g. "15-25 LPA", "30 LPA+", "any")
  - name: skills
    required: false
    hint: Key tech skills (e.g. "Java, Microservices", "Python, AWS", "React, Node.js")
---

# Hirist — Premium Tech Job Application

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- BEFORE opening the browser, check what the user provided.
- If user did not specify a role, use `ask_user` (input_type "freetext"): "What tech role are you looking for? (e.g. software engineer, data scientist, DevOps engineer, engineering manager)"
- If location not provided, use `ask_user` (input_type "freetext"): "Which city do you prefer? (e.g. 'Bangalore', 'Remote', 'Hyderabad', 'Any')"
- If experience not specified, use `ask_user` (input_type "freetext"): "How many years of experience do you have?"
- Optionally ask about expected CTC and key skills/tech stack.
- Ask: "Are you targeting specific companies or are you open to all good tech companies?"

### 2. Open Hirist & Verify Login
- Open a NEW tab and navigate to `https://www.hirist.com`.
- Take a snapshot. Check if logged in (profile icon or name visible in header).
- If NOT logged in, click Login/Sign In and use operator credentials transparently. Do NOT ask user for credentials.
- **If session expired or login fails, STOP and tell user: "Session expired, please re-login to Hirist in Chrome Debug."**
- Take snapshot to confirm logged-in state and job board visible.

### 3. Search & Filter Jobs
- Use the search bar to enter the user's desired role/keywords.
- Set the location filter to the preferred city.
- Apply additional filters:
  - Experience range.
  - Salary/CTC range.
  - Skills or technology tags.
  - Company type: Product / Startup / MNC / Service.
  - Posted date: Last 7 or 14 days.
  - Job type: Permanent / Contract.
- Sort by "Relevance" or "Date".
- Take snapshot of search results.

### 4. Present Job Options
- Scan results. Extract top 5-7 job listings with:
  - Company name
  - Job title
  - Location
  - CTC range
  - Experience required
  - Key skills listed
  - Posted date
  - Number of applicants (if shown)
  - Company type (product/startup/MNC)
- Use `ask_user` (input_type "choice") to let user pick which jobs to apply to:
  "Senior Software Engineer at Google — 35-50 LPA — Bangalore — Java, Distributed Systems — 3 days ago"
- If none match, ask if user wants to modify search criteria or see more results.

### 5. Apply to Selected Jobs
- For each job the user selected:
  - Click on the listing to open the full job detail page.
  - Take snapshot of the complete job description.
  - Summarize: responsibilities, qualifications, tech stack, team, benefits, company reputation.
  - Click "Apply" or "Apply Now" button.
  - Fill in any required application fields.
  - If resume upload is needed, use the profile's existing resume.
  - If additional questions appear (notice period, current CTC, expected CTC), use `ask_user` to get answers.
  - Use `confirm_action` before submitting each application:
    - Company, role, CTC range, location
    - "Confirm you want to apply to this position?"
  - Do NOT submit unless user confirms.
  - Take snapshot after each submission.

### 6. Collect Service Fee
- Use `collect_payment` after applications are submitted:
  - summary: "Premium tech job applications — applied to X positions on Hirist"
  - amount_inr: service fee amount
  - description: "ShofferAI concierge fee for tech job search and application on Hirist"

### 7. Final Confirmation
- Take a final snapshot of all applications submitted.
- Report to user:
  - Number of jobs applied to
  - List of companies, roles, and CTC ranges
  - Any applications that require additional steps (assessments, portfolio)
  - Next steps: "Companies on Hirist typically respond within 5-10 business days."
  - "Check your Hirist dashboard and registered email for interview invitations."
  - "Keep your profile and resume updated — Hirist recruiters actively source from profiles."

## Site Notes

- Hirist is a premium tech job board — it focuses on quality over quantity with curated listings from top tech companies.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Hirist is part of the iimjobs network — login credentials may be shared with iimjobs.com.
- Resume should be uploaded and profile should be complete (skills, experience, projects) for best visibility.
- Hirist sessions may expire after a few weeks — if login page appears, STOP and inform user.
- Many listings are from top product companies and unicorns — CTC ranges are competitive and often negotiable.
- Hirist may show "Featured" or "Premium" listings — these are paid employer postings and often have faster response times.
- Some applications may ask for current CTC and expected CTC — use `ask_user` to get accurate numbers. Do NOT guess.
- The site may show pop-ups for premium profile upgrades — dismiss them unless user specifically asks.
- Use `confirm_action` before each application. WAIT for user response. Do NOT auto-proceed.
- Hirist uses standard web forms — use Playwright fill/type methods for reliable input.
