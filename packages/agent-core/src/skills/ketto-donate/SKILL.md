---
name: ketto-donate
description: Donate to causes on Ketto India — crowdfunding for medical, education, disaster relief, and social causes.
triggers:
  - ketto donate
  - donate on ketto
  - ketto crowdfunding
  - ketto medical fundraiser
  - donate ketto cause
  - ketto charity
  - crowdfunding donation india
  - ketto education fund
  - help on ketto
  - ketto campaign donate
siteUrl: https://www.ketto.org
requiresAuth: true
params:
  - name: cause_url
    required: false
    hint: Direct URL to a Ketto campaign/fundraiser (e.g. "https://www.ketto.org/fundraiser/...")
  - name: amount
    required: false
    hint: Donation amount in INR (e.g. "500", "1000", "5000")
  - name: category
    required: false
    hint: Cause category preference (e.g. "medical", "education", "disaster relief", "children", "animals")
  - name: anonymous
    required: false
    hint: Whether to donate anonymously (yes/no, default no)
---

# Ketto Donation

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine what the user wants to donate to. Options:
  - **Specific campaign** — user provides a Ketto URL or campaign name.
  - **Browse by category** — medical, education, disaster relief, children, animals, women empowerment, environment.
  - **Trending campaigns** — show top fundraisers currently active.
- If user has a specific URL, skip browsing and go directly.
- Ask donation amount via `ask_user` if not provided. Common amounts: ₹100, ₹500, ₹1000, ₹2000, ₹5000.
- Ask if user wants to donate anonymously via `ask_user` (input_type "choice"):
  - "Donate with my name visible"
  - "Donate anonymously"
- Clarify if user wants a tax receipt (80G eligible campaigns only).

### 2. Open Ketto & Verify Login
- Open a NEW tab and navigate to `https://www.ketto.org`.
- Take snapshot. Check if logged in (profile icon / name in top bar).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Dismiss any app-install banners, notification prompts, or cookie consent dialogs.

### 3. Find Campaign
- If user provided a specific campaign URL, navigate directly to it.
- If browsing by category, navigate to the relevant category page:
  - Medical: `https://www.ketto.org/cause/medical-fundraising`
  - Education: `https://www.ketto.org/cause/education-fundraising`
  - Children: `https://www.ketto.org/cause/children-fundraising`
- Take snapshot of campaign listings.
- Present top 3-5 campaigns to user via `ask_user` (input_type "choice") with:
  - Campaign title
  - Amount raised vs goal
  - Number of supporters
  - Days remaining
- Let user pick a campaign.

### 4. Review Campaign Details
- Navigate to the selected campaign page.
- Take snapshot of the campaign page.
- Show user key details via `ask_user`:
  - Campaign title and organizer name
  - Story summary (first 2-3 lines)
  - Amount raised / goal / percentage funded
  - Number of donors
  - Whether it is 80G tax-deductible
  - Verification badge (if present)
- Enter the donation amount in the donation box.
- Select anonymous donation if requested.
- Take snapshot with amount entered.

### 5. Confirm Donation
- Use `confirm_action` with donation summary:
  - Campaign title
  - Organizer name
  - Donation amount: ₹X,XXX
  - Anonymous: yes/no
  - Tax deductible (80G): yes/no
  - Platform tip (Ketto may suggest a tip — show amount)
  - Total charge: ₹X,XXX (donation + tip if any)
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Payment
- Use `collect_payment`:
  - summary: JSON with campaign_title, organizer, donation_amount, anonymous, tax_deductible, platform_tip, total
  - amount_inr: total amount including any platform tip
  - description: "Ketto donation"
- STOP and WAIT for payment confirmation.

### 7. Complete Donation & Confirm
- Proceed with payment on Ketto (UPI / card / net banking).
- Handle OTP via `ask_user` if needed.
- Take snapshot of donation confirmation / thank you page.
- Report to user: donation amount, campaign name, receipt/transaction ID, 80G receipt info if applicable.
- Mention: "You will receive a confirmation email at the registered email address."

## Site Notes

- Ketto is India's largest crowdfunding platform — campaigns cover medical emergencies, education, disaster relief, and social causes.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in to Ketto. Do NOT ask user for credentials.
- Ketto may add a platform tip (e.g. 10%) on top of the donation — always show this to the user before confirming.
- 80G tax deduction is only available for select verified campaigns — check and inform user.
- Minimum donation on Ketto is typically ₹100. No upper limit.
- Ketto charges no platform fee to donors, but the suggested tip funds their operations.
- Always verify the campaign is still active (not expired or fully funded) before proceeding.
- Some campaigns have stretch goals — even fully funded campaigns may accept additional donations.
- Use `confirm_action` for donation review, `collect_payment` for checkout. Always WAIT for user response.
