---
name: milaap-donate
description: Donate to causes on Milaap — social impact crowdfunding for medical, education, livelihood, and community projects in India.
triggers:
  - milaap donate
  - donate on milaap
  - milaap crowdfunding
  - milaap fundraiser
  - milaap charity
  - donate milaap cause
  - social impact donation milaap
  - milaap medical fund
  - milaap help
  - give on milaap
siteUrl: https://www.milaap.org
requiresAuth: true
params:
  - name: cause_url
    required: false
    hint: Direct URL to a Milaap fundraiser (e.g. "https://milaap.org/fundraisers/...")
  - name: amount
    required: false
    hint: Donation amount in INR (e.g. "500", "1000", "5000")
  - name: category
    required: false
    hint: Cause category (e.g. "medical", "education", "livelihood", "memorial", "sports", "community")
  - name: anonymous
    required: false
    hint: Whether to donate anonymously (yes/no, default no)
---

# Milaap Donation

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine what the user wants to donate to. Options:
  - **Specific fundraiser** — user provides a Milaap URL or fundraiser name.
  - **Browse by category** — medical, education, livelihood, memorial, sports, community development.
  - **Trending fundraisers** — show currently popular campaigns.
- If user has a specific URL, skip browsing and go directly.
- Ask donation amount via `ask_user` if not provided. Common amounts: ₹500, ₹1000, ₹2000, ₹5000, ₹10000.
- Ask if user wants to donate anonymously via `ask_user` (input_type "choice"):
  - "Donate with my name visible"
  - "Donate anonymously"
- Ask if user wants to leave a message of support for the fundraiser.

### 2. Open Milaap & Verify Login
- Open a NEW tab and navigate to `https://www.milaap.org`.
- Take snapshot. Check if logged in (profile avatar or name visible in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Dismiss any pop-ups, notification prompts, or cookie banners.

### 3. Find Fundraiser
- If user provided a specific fundraiser URL, navigate directly to it.
- If browsing by category, navigate to the relevant category:
  - Medical: `https://milaap.org/fundraisers/medical`
  - Education: `https://milaap.org/fundraisers/education`
  - Livelihood: `https://milaap.org/fundraisers/livelihood`
- Take snapshot of fundraiser listings.
- Present top 3-5 fundraisers to user via `ask_user` (input_type "choice") with:
  - Fundraiser title
  - Beneficiary name
  - Amount raised vs goal
  - Number of supporters
  - Time remaining
- Let user select a fundraiser.

### 4. Review Fundraiser Details
- Navigate to the selected fundraiser page.
- Take snapshot of the fundraiser page.
- Present key details to user:
  - Fundraiser title and organizer
  - Beneficiary name and story summary
  - Amount raised / goal / percentage
  - Number of donors and shares
  - Whether it is tax-deductible (80G/FCRA)
  - Milaap verification status
- Click "Donate Now" button.
- Enter the donation amount.
- Toggle anonymous if requested.
- Add support message if user provided one.
- Take snapshot showing donation form filled.

### 5. Confirm Donation
- Use `confirm_action` with donation summary:
  - Fundraiser title
  - Beneficiary name
  - Donation amount: ₹X,XXX
  - Anonymous: yes/no
  - Support message: text or none
  - Tax deductible (80G): yes/no
  - Platform contribution (Milaap may suggest) : ₹X
  - Total charge: ₹X,XXX
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Payment
- Use `collect_payment`:
  - summary: JSON with fundraiser_title, beneficiary, donation_amount, anonymous, tax_deductible, platform_contribution, total
  - amount_inr: total amount
  - description: "Milaap donation"
- STOP and WAIT for payment confirmation.

### 7. Complete Donation & Confirm
- Proceed with payment on Milaap (UPI / card / net banking).
- Handle OTP via `ask_user` if needed.
- Take snapshot of donation confirmation / thank you page.
- Report to user: donation amount, fundraiser name, transaction ID, tax receipt availability.
- Mention: "You will receive a confirmation email and can track the fundraiser progress on Milaap."

## Site Notes

- Milaap is a leading Indian social impact crowdfunding platform focused on medical emergencies, education, and livelihood support.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in to Milaap. Do NOT ask user for credentials.
- Milaap may suggest a platform contribution (voluntary tip) — always disclose this to the user before confirming.
- Tax deduction under 80G is available for eligible campaigns — verify on the fundraiser page and inform user.
- Milaap fundraisers are verified by the platform — look for the verification badge.
- Minimum donation is typically ₹100. There is no maximum limit for individual donations.
- Milaap supports UPI, credit/debit cards, net banking, and international cards for NRI donors.
- Fundraiser updates are posted by organizers — donors receive email notifications about progress.
- Some fundraisers accept foreign contributions (FCRA registered) — mention if user asks about international donations.
- Use `confirm_action` for donation review, `collect_payment` for checkout. Always WAIT for user response.
