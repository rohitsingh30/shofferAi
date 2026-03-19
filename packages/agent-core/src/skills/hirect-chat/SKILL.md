---
name: hirect-chat
description: Find jobs and chat directly with founders and HR on Hirect — instant chat-based hiring for tech, product, and business roles.
triggers:
  - hirect jobs
  - hirect chat
  - chat with HR hirect
  - hirect apply
  - direct hire hirect
  - hirect founder chat
  - hirect startup jobs
  - hirect.com
siteUrl: https://www.hirect.in
requiresAuth: true
params:
  - name: role
    required: true
    hint: Job role to search (e.g. "backend developer", "product manager", "sales manager", "marketing lead")
  - name: location
    required: false
    hint: Preferred city (e.g. "Bangalore", "Mumbai", "Remote", "Delhi NCR")
  - name: experience
    required: false
    hint: Years of experience (e.g. "0-2", "3-5", "5+")
  - name: salary
    required: false
    hint: Expected CTC (e.g. "8-12 LPA", "15 LPA+", "any")
  - name: company_type
    required: false
    hint: Company type preference (e.g. "startup", "MNC", "product company", "any")
---

# Hirect — Chat-Based Direct Hiring

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- BEFORE opening the browser, check what the user provided.
- If user did not specify a role, use `ask_user` (input_type "freetext"): "What role are you looking for? (e.g. backend developer, product manager, sales manager, content writer)"
- If location not provided, use `ask_user` (input_type "freetext"): "Which city do you prefer? (e.g. 'Bangalore', 'Remote', 'Mumbai', 'Any')"
- If experience not mentioned, use `ask_user` (input_type "freetext"): "How many years of experience do you have?"
- Optionally ask about expected salary and company type preference.
- Explain to user: "On Hirect, you can directly chat with founders and hiring managers — no recruiter middleman."

### 2. Open Hirect & Verify Login
- Open a NEW tab and navigate to `https://www.hirect.in`.
- Take a snapshot. Check if logged in (profile icon or chat dashboard visible).
- If NOT logged in, attempt login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired or login requires OTP, STOP and tell user: "Session expired, please re-login to Hirect in Chrome Debug."**
- Take snapshot to confirm logged-in state and job listings accessible.

### 3. Search & Filter Jobs
- Navigate to the jobs section or use the search functionality.
- Enter the user's desired role in the search bar.
- Apply filters:
  - Location: city or remote.
  - Experience range.
  - Salary range / CTC.
  - Company type if specified.
  - Job type: full-time, contract.
- Sort by "Most Recent" or "Relevance".
- Take snapshot of filtered results.

### 4. Present Job Options
- Scan results. Extract top 5-7 job listings with:
  - Company name
  - Job title
  - Location (Remote/On-site/Hybrid)
  - CTC range
  - Experience required
  - Key skills
  - Hiring manager / founder name (if visible)
  - Posted date
  - Response time indicator (if available)
- Use `ask_user` (input_type "choice") to let user pick which jobs to explore:
  "Senior Backend Developer at PayU (Bangalore) — 18-25 LPA — 3-5 years — Node.js, AWS — Chat with CTO"
- If none match, ask if user wants to adjust filters.

### 5. Initiate Chat & Apply
- For each job the user selected:
  - Click on the listing to open the job details.
  - Take snapshot of the full job description and company info.
  - Summarize: role, responsibilities, tech stack, benefits, team size, growth trajectory.
  - Click "Chat Now" or "Start Conversation" button.
  - If Hirect prompts an intro message, draft a professional introduction:
    - Brief background, relevant experience, why interested in this role.
    - Use `ask_user` (input_type "freetext"): "I'll send an intro message to the hiring manager. Any specific points you'd like me to highlight?"
  - Use `confirm_action` before sending the chat message:
    - Company, role, hiring manager name
    - Preview of the intro message
    - "Confirm you want to initiate this conversation?"
  - Do NOT send unless user confirms.
  - Take snapshot after initiating each chat.

### 6. Collect Service Fee
- Use `collect_payment` after chats are initiated:
  - summary: "Job chat initiations — started X conversations on Hirect"
  - amount_inr: service fee amount
  - description: "ShofferAI concierge fee for job search and direct chat on Hirect"

### 7. Final Confirmation
- Take a final snapshot of all conversations started.
- Report to user:
  - Number of conversations initiated
  - List of companies, roles, and hiring managers contacted
  - Any pending actions (profile updates, chat responses needed)
  - Next steps: "Hiring managers on Hirect typically respond within 24-48 hours via chat."
  - "Check your Hirect inbox regularly — conversations move fast. Enable push notifications."
  - "If a founder responds, you can schedule an interview directly in the chat."

## Site Notes

- Hirect is a chat-first hiring platform — the main interaction is direct messaging with founders and HR, not traditional form-based applications.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Hirect may require phone number verification via OTP during login — OTP goes to operator's phone.
- The platform emphasizes speed — conversations can lead to interviews within 24-48 hours.
- Profile completeness matters — complete profiles get 3x more responses. Warn user if profile seems incomplete.
- Hirect sessions may expire — if login page appears, STOP and inform user.
- Do NOT send generic or spam messages — each intro should be personalized for the role and company.
- Some companies may request immediate availability for a call — inform user and ask for preferred time slots.
- Hirect shows "Active X hours ago" for hiring managers — prioritize recently active ones.
- Use `confirm_action` before initiating each chat. WAIT for user response. Do NOT auto-proceed.
- The platform is mobile-first — the web version may have limited features compared to the app.
