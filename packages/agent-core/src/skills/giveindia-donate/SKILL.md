---
name: giveindia-donate
description: Donate to verified NGOs on GiveIndia — tax-deductible donations to trusted nonprofits across education, health, disaster relief, and more.
triggers:
  - giveindia donate
  - donate on giveindia
  - give india donation
  - giveindia ngo
  - donate to ngo india
  - giveindia charity
  - tax deductible donation india
  - giveindia fundraiser
  - give india cause
  - verified ngo donation
siteUrl: https://www.giveindia.org
requiresAuth: true
params:
  - name: cause_url
    required: false
    hint: Direct URL to a GiveIndia fundraiser or NGO page
  - name: amount
    required: false
    hint: Donation amount in INR (e.g. "500", "1000", "5000", "10000")
  - name: category
    required: false
    hint: Cause category (e.g. "education", "health", "disaster relief", "hunger", "women", "environment", "animals")
  - name: recurring
    required: false
    hint: Whether to set up recurring donation (yes/no, default no)
---

# GiveIndia Donation

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine what the user wants to donate to. Options:
  - **Specific NGO or fundraiser** — user provides a GiveIndia URL or organization name.
  - **Browse by cause** — education, health, hunger, disaster relief, women empowerment, environment, animals, elderly care.
  - **Browse verified NGOs** — GiveIndia's curated list of 200+ verified nonprofits.
  - **Trending campaigns** — currently active campaigns and appeals.
- If user has a specific URL, skip browsing and go directly.
- Ask donation amount via `ask_user` if not provided. Common amounts: ₹500, ₹1000, ₹2000, ₹5000, ₹10000.
- Ask if user wants one-time or recurring monthly donation via `ask_user` (input_type "choice"):
  - "One-time donation"
  - "Monthly recurring donation"
- All GiveIndia donations are 80G tax-deductible — inform user upfront.

### 2. Open GiveIndia & Verify Login
- Open a NEW tab and navigate to `https://www.giveindia.org`.
- Take snapshot. Check if logged in (profile icon or name in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Dismiss any pop-ups, notification banners, or cookie consent dialogs.

### 3. Find Cause or NGO
- If user provided a specific URL, navigate directly to it.
- If browsing by cause, navigate to the relevant category page:
  - Education: `https://www.giveindia.org/cause/education`
  - Health: `https://www.giveindia.org/cause/health`
  - Hunger: `https://www.giveindia.org/cause/hunger`
  - Disaster Relief: `https://www.giveindia.org/cause/disaster-relief`
- Take snapshot of available campaigns/NGOs.
- Present top 3-5 options to user via `ask_user` (input_type "choice") with:
  - NGO/campaign name
  - Cause description (1 line)
  - Amount raised / goal (if campaign)
  - GiveIndia rating/verification status
- Let user select a cause or NGO.

### 4. Review & Configure Donation
- Navigate to the selected fundraiser or NGO donation page.
- Take snapshot of the donation page.
- Present details to user:
  - NGO/campaign name and description
  - How funds will be used
  - Tax deductibility status (80G)
  - GiveIndia verification badge
  - Impact statement (e.g. "₹1000 feeds 10 children for a week")
- Enter the donation amount.
- Select one-time or recurring as chosen.
- Fill in donor details (name, email, phone, PAN for 80G receipt).
- Use `ask_user` to confirm PAN number for tax receipt if not on file.
- Take snapshot with all details entered.

### 5. Confirm Donation
- Use `confirm_action` with donation summary:
  - NGO/campaign name
  - Donation amount: ₹X,XXX
  - Type: one-time / monthly recurring
  - Tax deductible (80G): yes
  - PAN provided: yes/no
  - Impact: brief statement
  - Total charge: ₹X,XXX
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Payment
- Use `collect_payment`:
  - summary: JSON with ngo_name, cause, donation_amount, type, tax_deductible, pan_provided, total
  - amount_inr: total donation amount
  - description: "GiveIndia donation"
- STOP and WAIT for payment confirmation.

### 7. Complete Donation & Confirm
- Proceed with payment on GiveIndia (UPI / card / net banking).
- Handle OTP via `ask_user` if needed.
- Take snapshot of donation confirmation / thank you page.
- Report to user: donation amount, NGO name, transaction ID, 80G receipt info, recurring schedule if applicable.
- Mention: "You will receive a tax receipt (80G) via email. Keep it for ITR filing."

## Site Notes

- GiveIndia is India's largest donation platform with 200+ verified NGOs — all donations are 80G tax-deductible.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in to GiveIndia. Do NOT ask user for credentials.
- PAN card number is required for generating 80G tax receipts — ask user if not already on file.
- GiveIndia charges zero platform fee — 100% of the donation goes to the NGO.
- Recurring monthly donations can be cancelled anytime from the donor dashboard.
- GiveIndia verifies all partner NGOs — financial audits, site visits, impact reports.
- Minimum donation is ₹100 for one-time and ₹200/month for recurring.
- GiveIndia supports UPI, credit/debit cards, net banking, and employer matching programs.
- Corporate matching: some employers match GiveIndia donations — worth mentioning to user.
- Use `confirm_action` for donation review, `collect_payment` for checkout. Always WAIT for user response.
