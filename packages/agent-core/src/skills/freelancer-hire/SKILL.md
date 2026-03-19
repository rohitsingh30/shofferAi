---
name: freelancer-hire
description: Hire freelancers on Freelancer.com — post a project, receive bids from freelancers, review profiles, and award the project.
triggers:
  - freelancer.com
  - hire freelancer
  - post project freelancer
  - freelancer hire
  - freelancer bid
  - outsource project
  - find freelancer online
  - freelancer.com project
siteUrl: https://www.freelancer.com
requiresAuth: true
params:
  - name: project_title
    required: true
    hint: Title of the project (e.g. "Build a React dashboard", "Design company brochure", "Data entry for 500 records")
  - name: project_description
    required: false
    hint: Detailed description of work needed
  - name: budget
    required: false
    hint: Budget range (e.g. "$100-300", "Hourly $15-25", "Fixed $500")
  - name: skills_needed
    required: false
    hint: Required skills (e.g. "React, Node.js, MongoDB", "Photoshop, Illustrator", "Excel, Data Entry")
  - name: deadline
    required: false
    hint: Project deadline (e.g. "1 week", "30 days", "3 months")
---

# Freelancer.com Project Posting & Hiring

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- BEFORE opening the browser, check what the user provided.
- If user did not specify a project title, use `ask_user` (input_type "freetext"): "What is the project title? (e.g. 'Build a React dashboard', 'Design company logo', 'Write 10 blog articles')"
- If project description not provided, use `ask_user` (input_type "freetext"): "Please describe the project in detail. Include scope, deliverables, and any specific requirements."
- If budget not specified, use `ask_user` (input_type "choice"): "What type of budget?" with options "Fixed Price (one-time payment)", "Hourly Rate". Then ask amount via `ask_user` (input_type "freetext"): "What is your budget range? (e.g. $100-300 fixed, or $15-25/hour)"
- If skills not specified, use `ask_user` (input_type "freetext"): "What skills should the freelancer have? (e.g. Python, Photoshop, Content Writing, Data Entry)"
- If deadline not specified, use `ask_user` (input_type "choice"): "When do you need this completed?" with options "Within 1 week", "Within 2 weeks", "Within 1 month", "Within 3 months", "Flexible / No rush".

### 2. Open Freelancer.com in New Tab
- Open a NEW tab and navigate to `https://www.freelancer.com`.
- Take a snapshot to see the homepage.
- Dismiss any promotional popups, cookie consent, app install banners, or upgrade prompts.
- Verify the main navigation and "Post a Project" button are visible.

### 3. Verify Login
- Look for a profile avatar, username, or notification bell in the top-right header.
- If signed in: proceed to project posting.
- If NOT signed in: Click "Log In", attempt login with rsinghtomar3011@gmail.com.
- If CAPTCHA, 2FA, or email verification appears, use `ask_user`: "Freelancer.com needs verification. Please complete the verification step in the browser and type 'done'."
- **If session expired or wrong account, STOP and tell user: "Session expired, please re-login to Freelancer.com in Chrome Debug."**
- Take snapshot to confirm logged-in state.

### 4. Post a New Project
- Click "Post a Project" button in the header or navigation.
- Take snapshot of the project creation form.
- Fill in the project details:
  - **Project title**: clear and descriptive title from user input.
  - **Project description**: detailed scope, deliverables, and requirements.
  - **Skills/tags**: add relevant skills (search and select from autocomplete).
  - **Budget type**: Fixed Price or Hourly.
  - **Budget range**: set min and max amounts.
  - **Project duration**: select matching timeline.
  - **File attachments**: if user has reference files, use `ask_user`: "Do you have any reference files to attach? If yes, I'll open the file picker. Type 'no' to skip."
- Take snapshot of the filled form.

### 5. Review & Publish Project
- Navigate to the project preview/review page.
- Take snapshot of the complete project listing preview.
- Use `confirm_action` to present project summary:
  - Project title
  - Description (first 200 characters)
  - Skills required
  - Budget type and range
  - Duration/deadline
  - "Once posted, freelancers will start bidding within minutes. Confirm to publish?"
- Do NOT post unless user confirms. If cancelled, ask what to change.
- Click "Post Project" or "Publish" to go live.
- Take snapshot of the confirmation.

### 6. Wait for Bids & Review Freelancers
- Navigate to the project page showing incoming bids.
- Take snapshot of the bids page.
- Wait for bids to come in (inform user: "Bids usually start arriving within 5-15 minutes. I'll check back shortly.").
- After bids arrive, extract top 5-7 freelancers with:
  - Freelancer name and country
  - Reputation score and review rating
  - Bid amount and delivery time
  - Earnings and completed projects count
  - Skills match percentage
  - Cover letter summary (first 2 lines)
- Present bids via `ask_user` (input_type "choice"):
  - Freelancer name, rating, bid amount, delivery time
  - Brief cover letter excerpt
  - "View more bids" and "Wait for more bids" options

### 7. Award Project & Payment
- Click on the selected freelancer's profile to review in detail.
- Take snapshot of the freelancer's full profile:
  - Portfolio items
  - Client reviews
  - Completed projects count
  - On-time and on-budget percentages
- Confirm selection with user via `confirm_action`:
  - Freelancer name, country, and rating
  - Bid amount and delivery timeline
  - Payment terms (milestone-based or full upfront)
  - "Award this project to [freelancer]?"
- If confirmed, click "Award" or "Hire" button.
- Set up milestone payment if applicable:
  - Use `ask_user` to determine milestone split (e.g. 50% upfront, 50% on delivery).
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with project title, freelancer name, bid amount, delivery time, milestone structure, platform fee, total
  - amount_inr: first milestone or full amount converted to INR (number)
  - description: "Freelancer.com project hiring"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.
- Complete the escrow deposit on Freelancer.com.

### 8. Project Kickoff Confirmation
- Take snapshot of the awarded project page.
- Report to user:
  - Project title and ID
  - Freelancer hired: name, rating, country
  - Agreed amount and payment structure
  - Expected delivery date
  - Milestone details (if applicable)
  - Platform fees charged
  - "Your freelancer has been notified. Communication will happen via Freelancer.com chat. I'll help you track progress and release milestone payments when deliverables are ready."

## Site Notes

- Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Freelancer.com charges a platform fee (3-10% depending on membership) on top of project cost — include in total shown to user.
- Payment goes into escrow — freelancer receives it only when user releases the milestone. This protects the user.
- Freelancer.com may show membership upgrade prompts (Preferred Freelancer, etc.) — dismiss unless user asks.
- Bids arrive quickly (within minutes) — but quality bids may take 1-2 hours. Advise patience.
- Session can expire — if login page appears, STOP and inform user.
- Freelancer.com uses Angular — use Playwright fill/type methods and wait for dynamic content to load.
- Use `confirm_action` for project review and hiring, `collect_payment` for escrow payment. WAIT for user response. Do NOT auto-proceed.
- Free accounts have limited project posts per month — inform user if limit is reached.
- Freelancer.com has a contest feature (similar to 99designs) — mention if user wants multiple submissions.
- Check freelancer's "On Time" and "On Budget" percentages — prioritize above 90%.
- Avoid freelancers with zero reviews or very new accounts unless their portfolio is strong.
- Communication between client and freelancer should happen on-platform for payment protection.
