---
name: parivahan-license
description: Apply for or renew driving license on Parivahan — fill application, upload documents, book slot, pay fee.
triggers:
  - driving license
  - renew license
  - parivahan
  - apply driving license
  - dl renewal
  - learner license
  - driving licence online
  - rto driving license
  - parivahan dl
siteUrl: https://parivahan.gov.in
requiresAuth: true
params:
  - name: service_type
    required: true
    hint: Service type — "learner license", "permanent license", "renewal", "duplicate", "international permit"
  - name: state
    required: true
    hint: State of residence (e.g. "Maharashtra", "Karnataka", "Delhi")
  - name: rto
    required: false
    hint: Preferred RTO office (e.g. "Andheri RTO", "RTO Bangalore Central")
---

# Parivahan Driving License Application

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm the service type: Learner License / Permanent License / Renewal / Duplicate / International Driving Permit.
- If not provided, use `ask_user` (input_type "choice"):
  "What do you need? 1) Learner License 2) Permanent License 3) Renewal 4) Duplicate 5) International Permit"
- Confirm state of residence and preferred RTO.
- Ask for vehicle class: LMV (car), MCWG (motorcycle), both.
- For renewal: ask for existing DL number and expiry date.
- Note: Learner License is prerequisite for Permanent License (30-day gap required).

### 2. Open Parivahan & Verify Login
- Open a NEW tab and navigate to `https://parivahan.gov.in/parivahan/`.
- Take snapshot. Dismiss any popups or advisories.
- Click "Online Services" → "Driving Licence Related Services".
- Select the user's state from the dropdown. This redirects to the state transport portal.
- Verify logged in (dashboard or profile visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Select Service & Fill Application
- From the services menu, select the appropriate service (Apply LL / Apply DL / Renewal / Duplicate).
- Fill the application form:
  - Personal details: name, father's name, DOB, address
  - Vehicle class selection: LMV, MCWG, or both
  - For renewal: existing DL number, old RTO
  - Blood group, qualification, phone, email
- Upload documents when prompted:
  - Age proof (Aadhaar / birth certificate)
  - Address proof (Aadhaar / utility bill)
  - Medical certificate (Form 1A) if applicable
  - Existing DL copy (for renewal/duplicate)
  - Passport-size photo
- Use `ask_user` if any document upload needs user's file.
- Take snapshot of completed form.

### 4. Book RTO Slot
- Navigate to slot booking section.
- Select preferred RTO office from the dropdown.
- View available dates and time slots — take snapshot.
- Present options via `ask_user` (input_type "choice"):
  "RTO Andheri — April 5, 10:00 AM"
  "RTO Andheri — April 7, 2:30 PM"
  "RTO Borivali — April 6, 11:00 AM"
- Select the user's chosen slot.
- For LL: slot may be for online test. For DL: slot is for driving test at RTO.

### 5. Review & Confirm
- Use `confirm_action`:
  - Service: Learner License / Permanent DL / Renewal
  - Applicant: name, DOB
  - Vehicle class: LMV / MCWG / both
  - RTO: name and address
  - Appointment date and time
  - Documents uploaded (list)
  - Fee breakdown: application fee + test fee + smart card fee
    - LL: ~₹200-500 | DL: ~₹500-1000 | Renewal: ~₹400-800 (varies by state)
- Do NOT proceed unless user confirms.

### 6. Payment
- Use `collect_payment`:
  - summary: JSON with service, applicant, rto, slot, vehicle_class, fee_breakdown
  - amount_inr: total fee
  - description: "Parivahan driving license application fee"
- WAIT for payment confirmation.
- Only proceed if payment confirmed.

### 7. Complete & Final Confirmation
- Complete payment on the portal (netbanking / card / UPI via state payment gateway).
- Handle OTP via `ask_user` if needed.
- Take snapshot of application receipt page.
- Report:
  - Application number / receipt number
  - Service applied for
  - RTO appointment date, time, and address
  - Documents to carry (originals + photocopies)
  - What to expect (LL: computer test | DL: driving test | Renewal: verification only)
  - Fee paid
- Mention: "Carry original documents + photocopies to the RTO. Reach 15 minutes early. For DL test, practice H-test and 8-test."

## Site Notes

- parivahan.gov.in is the central portal — it redirects to state-specific transport portals for actual services.
- Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Each state has its own transport website — the flow may vary slightly between states.
- Parivahan portal can be very slow and occasionally down — retry patiently.
- Learner License requires a computer-based test at the RTO (road signs, traffic rules).
- Permanent License requires a driving test — minimum 30 days after LL issuance.
- DL validity: 20 years from issue or until age 50 (whichever is earlier). After 50: 5-year renewal.
- International Driving Permit is valid for 1 year — requires existing valid Indian DL.
- Smart card DL is now standard — replaces old paper licenses.
- Medical certificate (Form 1A) required for 40+ age or transport vehicle applicants.
- Session expires quickly — work fast and avoid idle time on the portal.
- Use `confirm_action` for review, `collect_payment` for payment. WAIT for user response.
