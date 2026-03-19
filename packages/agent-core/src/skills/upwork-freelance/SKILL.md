---
name: upwork-freelance
description: Find and apply for freelance jobs on Upwork — search projects, review details, submit proposals with cover letter.
triggers:
  - upwork
  - freelance job
  - upwork proposal
  - find freelance work
  - apply on upwork
  - upwork job search
  - submit upwork proposal
  - freelance gig
siteUrl: https://www.upwork.com
requiresAuth: true
params:
  - name: skill
    required: true
    hint: Skill or job category to search (e.g. "web development", "data entry", "graphic design")
  - name: budget
    required: false
    hint: Budget preference (e.g. "Fixed $500+", "Hourly $30+")
  - name: experience_level
    required: false
    hint: Client's required experience (Entry, Intermediate, Expert)
  - name: proposal_intro
    required: false
    hint: Brief intro or pitch to include in proposals
---

# Upwork Freelance Job Search & Apply

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- BEFORE opening the browser, check what the user provided.
- If user did not specify a skill/category, use `ask_user` (input_type "freetext"): "What type of freelance work are you looking for on Upwork?"
- If no proposal intro provided, use `ask_user` (input_type "freetext"): "Give me a brief intro about yourself that I can include in proposals (2-3 sentences about your experience and skills)."
- Optionally ask about budget range and experience level preference.

### 2. Open Upwork & Verify Login
- Open a NEW tab and navigate to `https://www.upwork.com/nx/find-work/`.
- Take a snapshot. Check if logged in (profile avatar or name in top-right corner).
- If NOT logged in, click Log In and use operator credentials transparently. Do NOT ask user for credentials.
- **If session expired or wrong account, STOP and tell user: "Session expired, please re-login to Upwork in Chrome Debug."**
- Take snapshot to confirm logged-in state and job feed visible.

### 3. Search & Filter Jobs
- Use the search bar to enter the user's skill/category.
- Apply filters:
  - Job type: Fixed-price or Hourly (based on user preference).
  - Experience level if specified.
  - Budget range if specified.
  - Client history: "Payment verified" preferred.
  - Posted: Last 24 hours or Last 3 days.
- Click Search.
- Take snapshot of search results.

### 4. Present Job Options
- Scan results. Extract top 5-7 job postings with:
  - Job title
  - Client name and rating
  - Budget (fixed or hourly range)
  - Job description summary (first 2 lines)
  - Skills required
  - Proposals submitted count
  - Posted date
- Use `ask_user` (input_type "choice") to let user pick which jobs to apply to.
- If none are suitable, ask if user wants to refine search or see more results.

### 5. Submit Proposals
- For each job the user selected:
  - Click on the job listing to open the full detail page.
  - Take snapshot of the full job description.
  - Click "Apply Now" or "Submit a Proposal".
  - Fill in the proposal form:
    - Cover letter: Combine user's intro with job-specific details. Use `ask_user` (input_type "freetext") to review/edit the draft cover letter.
    - Bid amount: For hourly, suggest a rate. For fixed, suggest a price. Use `ask_user` to confirm.
    - Estimated duration if required.
    - Answer any screening questions using `ask_user`.
  - Use `confirm_action` before submitting the proposal:
    - Job title, client, bid amount
    - Cover letter preview (first 50 words)
    - "Confirm you want to submit this proposal?"
  - Do NOT submit unless user confirms.
  - Click "Submit Proposal".
  - Take snapshot of confirmation.
  - Note: Each proposal costs Connects — inform user of remaining Connects balance.

### 6. Final Confirmation
- Take a final snapshot.
- Report to user:
  - Number of proposals submitted
  - List of job titles and bid amounts
  - Connects spent and remaining balance
  - Any proposals that failed
  - "Check your Upwork messages for client responses"

## Site Notes

- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Upwork requires "Connects" to submit proposals — each proposal costs 2-6 Connects. Inform user if low.
- Upwork may show profile completion prompts or skill test suggestions — dismiss them.
- Proposals should be personalized per job — never send generic copy-paste proposals.
- Some jobs have screening questions that are mandatory — use `ask_user` for each.
- Upwork sessions can expire — if login page appears, STOP and inform user.
- Upwork uses React — always use Playwright fill/type methods.
- Use `confirm_action` before each proposal submission. WAIT for user response. Do NOT auto-proceed.
- Boosted proposals cost extra Connects — do NOT boost unless user explicitly asks.
- If CAPTCHA or identity verification appears, inform user and pause.
- Client's "Payment verified" badge is a good sign — prioritize verified clients.
