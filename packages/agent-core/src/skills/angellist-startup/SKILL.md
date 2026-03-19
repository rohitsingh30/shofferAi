---
name: angellist-startup
description: Find and apply for startup jobs on AngelList (Wellfound) — equity-based roles, remote-first startups, engineering, product, and design positions.
triggers:
  - angellist jobs
  - wellfound jobs
  - startup jobs angellist
  - apply on angellist
  - angellist startup
  - wellfound apply
  - remote startup job
  - equity startup job
siteUrl: https://wellfound.com
requiresAuth: true
params:
  - name: role
    required: true
    hint: Job role to search (e.g. "full stack engineer", "product manager", "growth lead", "founding engineer")
  - name: location
    required: false
    hint: Location preference (e.g. "Remote", "Bangalore", "San Francisco", "India")
  - name: company_stage
    required: false
    hint: Startup stage preference (e.g. "Seed", "Series A", "Series B+", "any")
  - name: salary_range
    required: false
    hint: Expected salary range (e.g. "$100K-$150K", "20-30 LPA", "any")
  - name: equity
    required: false
    hint: Equity preference (e.g. "0.1-0.5%", "any equity", "no preference")
---

# AngelList / Wellfound — Startup Job Search & Apply

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- BEFORE opening the browser, check what the user provided.
- If user did not specify a role, use `ask_user` (input_type "freetext"): "What role are you looking for at startups? (e.g. full stack engineer, product manager, founding engineer, growth lead)"
- If location not provided, use `ask_user` (input_type "freetext"): "Location preference? (e.g. 'Remote', 'Bangalore', 'US/India', 'Any')"
- Ask about startup stage preference: "Do you have a preference for startup stage — Seed, Series A, Series B+, or any?"
- Optionally ask about equity expectations and salary range.
- Ask: "Are you open to remote-only roles or do you prefer in-office/hybrid?"

### 2. Open Wellfound & Verify Login
- Open a NEW tab and navigate to `https://wellfound.com/jobs`.
- Take a snapshot. Check if logged in (profile avatar or dashboard link visible in header).
- If NOT logged in, click Log In and use operator credentials transparently. Do NOT ask user for credentials.
- **If session expired or login fails, STOP and tell user: "Session expired, please re-login to Wellfound/AngelList in Chrome Debug."**
- Take snapshot to confirm logged-in state and job board visible.

### 3. Search & Filter Jobs
- Use the search bar to enter the user's role/title.
- Apply location filter (Remote, specific city, country).
- Apply filters:
  - Role type (Engineering, Product, Design, Marketing, etc.).
  - Company stage (Seed, Series A, Series B, etc.).
  - Salary range if specified.
  - Company size.
  - Remote-friendly toggle if user prefers remote.
- Sort by "Most Recent" or "Best Match".
- Take snapshot of filtered job listings.

### 4. Present Job Options
- Scan results. Extract top 5-7 listings with:
  - Company name and one-line description
  - Funding stage and total raised
  - Job title
  - Location (Remote/On-site/Hybrid)
  - Salary range
  - Equity range
  - Company size (team count)
  - Tech stack or key technologies
- Use `ask_user` (input_type "choice") to let user pick which jobs to explore:
  "Founding Engineer at Stealth AI Startup (Seed, $3M raised) — $120K-$160K + 0.5-1.0% equity — Remote — Python, LLMs"
- If none are suitable, ask if user wants to broaden search or try different keywords.

### 5. Apply to Selected Jobs
- For each job the user selected:
  - Click on the listing to open the full job page.
  - Take snapshot of the complete job description.
  - Summarize: mission, role responsibilities, required skills, equity details, team, culture, perks.
  - Click "Apply" or "Want to Work Here" button.
  - Fill in the application form:
    - Profile details (should be pre-filled from Wellfound profile).
    - Custom questions — use `ask_user` for each.
    - Cover note or "Why this startup" — use `ask_user` (input_type "freetext") to draft.
    - Resume / LinkedIn — use profile default.
  - Use `confirm_action` before submitting each application:
    - Company name, role, salary + equity range, location
    - "Confirm you want to apply to this startup?"
  - Do NOT submit unless user confirms.
  - Take snapshot after each submission.

### 6. Collect Service Fee
- Use `collect_payment` after applications are submitted:
  - summary: "Startup job applications — applied to X positions on Wellfound/AngelList"
  - amount_inr: service fee amount
  - description: "ShofferAI concierge fee for startup job search and application on Wellfound"

### 7. Final Confirmation
- Take a final snapshot of all applications submitted.
- Report to user:
  - Number of startups applied to
  - List of companies, roles, salary + equity ranges
  - Any applications that need follow-up (custom questions, portfolio links)
  - Next steps: "Startup founders on Wellfound typically respond within 3-10 days."
  - "Check your Wellfound messages — founders often reach out directly for a chat."
  - "Pro tip: Follow the companies to get updates on new openings."

## Site Notes

- AngelList rebranded to Wellfound — use wellfound.com as the primary URL.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Wellfound profile must be complete (bio, skills, experience, resume, LinkedIn) for best match quality.
- Equity ranges are indicative — actual equity is negotiated during offer stage. Always clarify this to user.
- Many listings are from US-based startups hiring remotely in India — salary may be in USD.
- Wellfound sessions can expire — if login page appears, STOP and inform user.
- "Actively Hiring" badge means the startup is responsive — prioritize these.
- Some startups show "Stealth" — the company name is hidden until they review your application.
- Founders may message directly on the platform — advise user to check Wellfound messages regularly.
- Use `confirm_action` before each application. WAIT for user response. Do NOT auto-proceed.
- Wellfound uses React — use Playwright fill/type methods for form interactions.
