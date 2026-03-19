---
name: passport-appointment
description: Book passport appointment on Passport Seva — select office, choose date/slot, fill application, pay fee.
triggers:
  - passport appointment
  - book passport
  - passport seva
  - passport application
  - renew passport
  - new passport
  - passport office appointment
  - passportindia appointment
  - passport slot booking
siteUrl: https://www.passportindia.gov.in
requiresAuth: true
params:
  - name: service_type
    required: true
    hint: Type of service — "new passport", "reissue", "renewal", "tatkal"
  - name: city
    required: true
    hint: Preferred passport office city (e.g. "Delhi", "Mumbai", "Bangalore")
  - name: preferred_date
    required: false
    hint: Preferred appointment date (e.g. "next week", "March 30")
---

# Passport Appointment Booking (Passport Seva)

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm service type: New Passport / Reissue / Renewal / Tatkal.
- Confirm preferred city for passport office.
- If not provided, use `ask_user` (input_type "choice"): "What do you need? 1) New Passport 2) Renewal 3) Reissue 4) Tatkal"
- Ask for preferred date range. Convert relative dates to actual.
- Note: Tatkal costs extra but has faster processing (1-3 days vs 30 days).
- Confirm applicant type: Adult / Minor.

### 2. Open Passport Seva & Verify Login
- Open a NEW tab and navigate to `https://www.passportindia.gov.in`.
- Take snapshot. Dismiss any popups or maintenance notices.
- Click "Existing User Login" or navigate to the login page.
- Verify logged in (dashboard visible with applicant name).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Handle CAPTCHA if present — attempt auto-solve or use `ask_user`.

### 3. Select Service & Fill Application
- From the dashboard, click "Apply for Fresh Passport / Reissue of Passport".
- Select the appropriate option: Fresh Passport or Re-issue.
- Select type: Normal or Tatkal.
- Select pages: 36 pages (default) or 60 pages.
- Fill applicant details from saved profile or ask user via `ask_user`.
- Take snapshot of filled application form.

### 4. Choose Passport Office & Date
- Navigate to "Schedule Appointment" section.
- Select state and district from dropdowns.
- Select preferred Passport Seva Kendra (PSK) or Post Office Passport Seva Kendra (POPSK).
- View available dates — take snapshot of the calendar.
- Present available slots via `ask_user` (input_type "choice"):
  "PSK Mumbai — March 28, 10:30 AM"
  "PSK Mumbai — March 29, 2:00 PM"
  "POPSK Andheri — March 30, 11:00 AM"
- If no slots available for preferred date, show nearest available dates.

### 5. Review & Confirm Appointment
- Use `confirm_action`:
  - Service: New Passport / Reissue / Tatkal
  - Applicant name
  - Passport office: name and address
  - Appointment date and time slot
  - Documents required (list based on service type)
  - Fee: ₹1,500 (normal) / ₹3,500 (tatkal) + ₹2,000 (tatkal surcharge if applicable)
- Do NOT proceed unless user confirms.

### 6. Payment
- Use `collect_payment`:
  - summary: JSON with service_type, applicant, office, date, slot, fee_breakdown
  - amount_inr: total fee amount
  - description: "Passport Seva appointment fee"
- WAIT for payment confirmation.
- Only proceed if payment confirmed. If cancelled, ask what to change.

### 7. Complete Payment & Final Confirmation
- Complete payment on Passport Seva portal (SBI ePay / netbanking / card / UPI).
- Handle OTP via `ask_user` if needed.
- Take snapshot of booking confirmation page.
- Report:
  - Application Reference Number (ARN)
  - Appointment date, time, and passport office address
  - Documents to carry (original + photocopy)
  - Fee paid
  - What to expect at the office (token, verification, photo/biometrics)
- Mention: "Reach 15 minutes early. Carry original documents + photocopies. No phones allowed inside PSK."

## Site Notes

- passportindia.gov.in is the ONLY official portal for Indian passport services. Never use agents or touts.
- Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Passport Seva portal is often slow and may timeout — retry page loads patiently.
- Appointment slots fill up fast in metro cities — book 2-3 weeks in advance.
- Tatkal: faster processing but costs ₹2,000 extra. Available at PSK only (not POPSK).
- Normal passport processing: 30-45 days. Tatkal: 1-3 working days (if police verification clear).
- Required documents vary by service type — always list them in the confirmation.
- CAPTCHA is required on login — may need user help.
- Session expires quickly (10-15 minutes of inactivity) — work fast.
- SBI ePay is the payment gateway — supports netbanking, cards, UPI.
- If appointment is missed, the fee is non-refundable. User must re-apply and re-pay.
- Use `confirm_action` for review, `collect_payment` for payment. WAIT for user response.
