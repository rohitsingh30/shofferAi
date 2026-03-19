---
name: internshala-internship
description: Apply for internships on Internshala — search, filter by domain/stipend/location, and apply.
triggers:
  - internshala
  - apply internship
  - internshala internship
  - find internship
  - internship apply
  - summer internship
  - work from home internship
  - internshala apply
  - college internship
  - stipend internship
siteUrl: https://internshala.com
requiresAuth: true
params:
  - name: domain
    required: true
    hint: Internship domain (e.g. "web development", "data science", "marketing", "content writing", "graphic design")
  - name: location
    required: false
    hint: Location preference (e.g. "Delhi", "Bangalore", "work from home", "remote")
  - name: stipend
    required: false
    hint: Minimum stipend preference (e.g. "₹10,000/month", "₹15,000+", "any")
  - name: duration
    required: false
    hint: Duration preference (e.g. "2 months", "3 months", "6 months")
---

# Internshala Internship Application

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Internship Requirements
- Confirm what domain/field the user wants to intern in.
- Get: domain, location (or work from home), minimum stipend, duration preference, start date.
- Use `ask_user` for missing critical info (domain at minimum).
- Ask: "Do you prefer work from home, in-office, or either?"

### 2. Open Internshala
- Open a NEW tab and navigate to `https://internshala.com/internships`.
- Take snapshot. Verify logged in (profile icon in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Filter Internships
- Use the search bar or category filters to find internships in the user's domain.
- Apply filters: Location (Work From Home / specific city), Stipend range, Duration, Part-time/Full-time.
- Enable "Internships with job offer" filter if user is interested.
- Sort by "Relevance" or "Latest".
- Take snapshot. Extract top 5 internships with: company name, role title, stipend, duration, location, apply-by date, number of applicants.
- Use `ask_user` (input_type "choice") to let user pick:
  "Data Science Intern at Zomato — ₹20,000/month — 3 months — Work From Home — Apply by April 10"

### 4. Review Internship Details
- Click the selected internship. Take snapshot.
- Summarize: company about, role responsibilities, required skills, perks (certificate, letter of recommendation, flexible hours, PPO), number of openings, start date.
- If user wants to compare, go back and show another option.
- Check if the internship requires specific skills or assessments.

### 5. Prepare Application
- Click "Apply Now". Take snapshot of the application form.
- The form typically asks: cover letter, availability, assessment questions.
- Use `ask_user` (input_type "freetext") for cover letter: "Write a brief cover letter or tell me key points to include and I'll draft it."
- If there are assessment questions, present them to user via `ask_user` and fill in responses.
- Review the application form completeness. Ensure profile (resume, skills, education) is up to date.

### 6. Review & Confirm Application
- Take snapshot of the completed application.
- Use `confirm_action`:
  - Company name and role title
  - Stipend and duration
  - Location (WFH/office)
  - Start date
  - Cover letter summary
  - Assessment answers (if any)
  - Profile details being submitted
- Do NOT submit unless user confirms.

### 7. Submit Application
- Click "Submit" to send the application.
- Take snapshot of submission confirmation.
- Report: company name, role, application status, expected response timeline.
- Mention: "Application submitted successfully. You'll receive updates on your Internshala dashboard and email. Companies typically respond within 7-15 days."

### 8. Offer to Apply More
- Ask user: "Would you like to apply to more similar internships? I can help you apply to multiple positions."
- If yes, go back to Step 3 and show more options.

## Site Notes

- Internshala is India's largest internship platform — 100K+ internships across domains.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator's phone/email.
- Profile must be complete (resume, skills, education, work samples) for best results — warn if profile seems incomplete.
- "Actively Hiring" tag means the company is responsive — prioritize these listings.
- PPO (Pre-Placement Offer) internships can convert to full-time jobs — always highlight this perk.
- Cover letter is critical for standing out — help user write a compelling one. Do not submit a generic one.
- Some internships have assessment tests or assignments — user must complete these within deadline.
- Work From Home internships are highly competitive — suggest applying to multiple to increase chances.
- Stipend range: ₹5,000-₹40,000/month depending on domain and company. Unpaid internships exist too.
- Internshala also has trainings/courses — do not confuse with internship applications.
- Apply early — internships with fewer applicants have higher response rates.
- Use `confirm_action` before submitting application. No `collect_payment` needed — applications are free.
