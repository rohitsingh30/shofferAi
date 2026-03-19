---
name: glassdoor-review
description: Research company reviews, salaries, and interview experiences on Glassdoor India — help users evaluate employers before joining.
triggers:
  - glassdoor
  - company reviews glassdoor
  - glassdoor salary
  - glassdoor interview
  - check company on glassdoor
  - glassdoor india
  - company review
  - glassdoor ratings
siteUrl: https://www.glassdoor.co.in
requiresAuth: true
params:
  - name: company
    required: true
    hint: Company name to research (e.g. "TCS", "Flipkart", "Infosys", "Razorpay")
  - name: research_type
    required: false
    hint: What to research — reviews, salaries, interviews, or all (default "all")
  - name: role
    required: false
    hint: Specific role to check salary/reviews for (e.g. "software engineer", "product manager")
  - name: location
    required: false
    hint: Office location to focus on (e.g. "Bangalore", "Hyderabad", "Mumbai")
---

# Glassdoor India — Company Reviews & Salary Research

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- BEFORE opening the browser, check what the user provided.
- If user did not specify a company, use `ask_user` (input_type "freetext"): "Which company do you want to research on Glassdoor?"
- If research type not specified, use `ask_user` (input_type "choice"): "What would you like to know? Reviews / Salaries / Interview Experiences / All of the above"
- If user wants salary info, ask for the specific role: "What role or designation do you want salary data for?"
- Optionally ask about location if the company has multiple offices.

### 2. Open Glassdoor & Verify Login
- Open a NEW tab and navigate to `https://www.glassdoor.co.in`.
- Take a snapshot. Check if logged in (profile icon or account menu visible).
- If NOT logged in, click Sign In and use operator credentials transparently. Do NOT ask user for credentials.
- **If session expired or login wall blocks content, STOP and tell user: "Session expired, please re-login to Glassdoor in Chrome Debug."**
- Take snapshot to confirm logged-in state. Glassdoor requires login to view full reviews.

### 3. Search for Company
- Use the search bar to enter the company name.
- Select the correct company from autocomplete suggestions (verify by checking logo, industry, location).
- Navigate to the company's Glassdoor profile page.
- Take snapshot of the company overview page.

### 4. Extract Company Overview
- Capture and summarize:
  - Overall rating (out of 5)
  - Total number of reviews
  - "Recommend to a friend" percentage
  - CEO approval rating
  - Company size, industry, founded year, headquarters
  - Pros and Cons summary from top reviews
- Present this overview to the user.

### 5. Research Based on User Request

#### If Reviews requested:
- Navigate to the Reviews tab.
- Filter by: role (if specified), location (if specified), rating, date.
- Extract top 5-7 recent reviews with: rating, pros, cons, advice to management, employment status (current/former), role.
- Use `ask_user` (input_type "choice") if user wants to see more reviews or filter differently.

#### If Salaries requested:
- Navigate to the Salaries tab.
- Search for the specific role if provided.
- Extract salary data: base pay range, total pay range, number of salary reports, bonus/stock info.
- Compare with industry average if available.
- Present salary breakdown to user.

#### If Interview Experiences requested:
- Navigate to the Interviews tab.
- Filter by role if specified.
- Extract top 5 interview experiences: difficulty level, experience (positive/negative/neutral), interview questions asked, process duration, offer received (yes/no).
- Present to user as a summary.

### 6. Present Findings & Ask Follow-up
- Compile a comprehensive summary of all research findings.
- Use `ask_user` (input_type "choice"): "Would you like to: See more reviews / Check another role's salary / Read more interview experiences / Compare with another company / Done"
- If user wants to compare, repeat from Step 3 with the new company.

### 7. Collect Service Fee
- Use `collect_payment` after research is complete:
  - summary: "Company research on Glassdoor — detailed review of [company name]"
  - amount_inr: service fee amount
  - description: "ShofferAI concierge fee for Glassdoor company research and analysis"

### 8. Final Summary
- Take a final snapshot of the key research pages.
- Report to user:
  - Company rating and recommendation percentage
  - Key pros and cons (top 3 each)
  - Salary range for their target role
  - Interview difficulty and common questions
  - Overall recommendation: "Based on the data, here is my assessment..."
  - "You can bookmark this company on Glassdoor for updates."

## Site Notes

- Glassdoor requires login to view full reviews and salary data — the login wall is strict.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Glassdoor may prompt users to "give to get" — requiring a review submission to unlock content. Dismiss or skip these prompts.
- Reviews are anonymous — do not attempt to identify reviewers.
- Salary data is crowdsourced and may not reflect current market rates — always caveat this to user.
- Glassdoor sessions expire after a few weeks — if login page blocks content, STOP and inform user.
- Some companies have very few reviews — inform user if data is limited and suggest checking AmbitionBox as alternative.
- Glassdoor uses React and heavy JavaScript — always wait for page load before taking snapshots.
- Use `confirm_action` before any action that modifies the account (e.g. saving a company). WAIT for user response.
- Indian companies may have more reviews on AmbitionBox/Naukri — suggest cross-referencing if Glassdoor data is sparse.
