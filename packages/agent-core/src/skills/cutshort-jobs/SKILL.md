---
name: cutshort-jobs
description: Apply for tech and product jobs on CutShort — AI-matched roles at startups and product companies with skill-based recommendations.
triggers:
  - cutshort jobs
  - apply on cutshort
  - cutshort tech jobs
  - find jobs cutshort
  - cutshort apply
  - cutshort.io
  - cutshort startup
  - cutshort product jobs
siteUrl: https://cutshort.io
requiresAuth: true
params:
  - name: role
    required: true
    hint: Job role to search (e.g. "fullstack developer", "data engineer", "product manager", "DevOps engineer")
  - name: skills
    required: false
    hint: Key skills to match (e.g. "React, Node.js", "Python, ML", "Java, Spring Boot")
  - name: location
    required: false
    hint: Location preference (e.g. "Bangalore", "Remote", "Pune", "Any")
  - name: experience
    required: false
    hint: Experience in years (e.g. "2-4", "5-8", "fresher")
  - name: salary
    required: false
    hint: Expected CTC range (e.g. "12-18 LPA", "25 LPA+", "any")
---

# CutShort — AI-Matched Tech Job Application

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- BEFORE opening the browser, check what the user provided.
- If user did not specify a role, use `ask_user` (input_type "freetext"): "What tech/product role are you looking for? (e.g. fullstack developer, data engineer, product manager)"
- If skills not specified, use `ask_user` (input_type "freetext"): "What are your top skills? (e.g. 'React, Node.js, TypeScript' or 'Python, ML, TensorFlow')"
- If location not provided, use `ask_user` (input_type "freetext"): "Location preference? (e.g. 'Remote', 'Bangalore', 'Any')"
- Optionally ask about experience and salary expectations.
- Ask: "Do you prefer product companies, startups, or are you open to service companies too?"

### 2. Open CutShort & Verify Login
- Open a NEW tab and navigate to `https://cutshort.io/jobs`.
- Take a snapshot. Check if logged in (profile icon or dashboard link visible).
- If NOT logged in, click Login and use operator credentials transparently. Do NOT ask user for credentials.
- **If session expired or login fails, STOP and tell user: "Session expired, please re-login to CutShort in Chrome Debug."**
- Take snapshot to confirm logged-in state and jobs page accessible.

### 3. Search & Filter Jobs
- Use the search/filter system to find matching roles.
- Apply filters:
  - Role/title keywords.
  - Skills filter — add each of the user's key skills.
  - Location: Remote / specific city.
  - Experience range.
  - Salary range / CTC.
  - Company type: Startup / Product / MNC.
  - Posted date: prefer recent listings.
- CutShort uses AI matching — check the "Recommended for you" section too.
- Take snapshot of filtered results.

### 4. Present Job Options
- Scan results. Extract top 5-7 listings with:
  - Company name
  - Job title
  - Location (Remote/Hybrid/On-site)
  - CTC range
  - Skills required
  - Experience required
  - Company description (one-liner)
  - Match score (if CutShort shows AI match percentage)
  - Number of applicants
- Use `ask_user` (input_type "choice") to let user pick which jobs to apply to:
  "Senior Frontend Engineer at Razorpay — 22-30 LPA — Bangalore/Remote — React, TypeScript, GraphQL — 92% match"
- If none are suitable, ask if user wants to adjust skill filters or broaden search.

### 5. Apply to Selected Jobs
- For each job the user selected:
  - Click on the listing to open the full job page.
  - Take snapshot of the complete job description.
  - Summarize: role responsibilities, tech stack, team composition, company culture, perks, growth path.
  - Click "Apply" or "I'm interested" button.
  - Fill in any application-specific fields.
  - If CutShort asks for a pitch/note, use `ask_user` (input_type "freetext"): "Write a brief pitch for why you're a great fit, or share key points and I'll draft it."
  - If skill assessment or coding test is part of the flow, inform user with details.
  - Use `confirm_action` before submitting each application:
    - Company, role, CTC, location, key skills
    - "Confirm you want to apply to this position?"
  - Do NOT submit unless user confirms.
  - Take snapshot after each submission.

### 6. Collect Service Fee
- Use `collect_payment` after applications are submitted:
  - summary: "Tech job applications — applied to X positions on CutShort"
  - amount_inr: service fee amount
  - description: "ShofferAI concierge fee for AI-matched job search and application on CutShort"

### 7. Final Confirmation
- Take a final snapshot of all applications submitted.
- Report to user:
  - Number of jobs applied to
  - List of companies, roles, CTC ranges, and match scores
  - Any pending skill assessments or tests
  - Next steps: "CutShort recruiters typically respond within 3-7 days."
  - "Check your CutShort inbox — recruiters may message you directly for interviews."
  - "Keep your CutShort profile updated — the AI re-matches you with new roles weekly."

## Site Notes

- CutShort uses AI to match candidates with jobs based on skills, experience, and preferences — profile completeness directly affects match quality.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- CutShort may use LinkedIn or Google OAuth for login — handle transparently.
- Profile must have skills, experience, and resume uploaded for AI matching to work well. Warn user if profile seems incomplete.
- CutShort sessions can expire — if login page appears, STOP and inform user.
- "Actively Hiring" tags indicate companies currently reviewing applications — prioritize these.
- CutShort has a built-in messaging system — recruiters may reach out even without formal application.
- Some roles show "Referral available" — highlight this to user as it increases chances.
- CutShort is React-based — use Playwright fill/type methods for all form inputs.
- Use `confirm_action` before each application. WAIT for user response. Do NOT auto-proceed.
- Salary ranges on CutShort are typically negotiable — advise user to aim for the higher end if experienced.
