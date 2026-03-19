---
name: narayana-health
description: Book appointment at Narayana Health — find specialists, schedule in-person or teleconsultation, book health checkups.
triggers:
  - narayana health
  - narayana hospital
  - narayana hrudayalaya
  - book doctor narayana
  - narayana appointment
  - narayana specialist
  - narayana teleconsult
  - narayana health booking
siteUrl: https://www.narayanahealth.org
requiresAuth: true
params:
  - name: speciality
    required: true
    hint: Department or speciality (e.g. "cardiology", "cardiac surgery", "oncology", "neurology", "orthopedics")
  - name: city
    required: false
    hint: City or hospital location (e.g. "Bangalore", "Kolkata", "Ahmedabad", "Gurugram", "Mysore")
  - name: consultation_type
    required: false
    hint: "in-person", "teleconsult", or "health checkup" (default in-person)
---

# Narayana Health Appointment Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Understand Requirements
- Determine: speciality/department, city preference, in-person vs teleconsultation.
- If user describes condition or symptoms, recommend the appropriate speciality.
- Use `ask_user` for missing info: "Which speciality and city do you prefer?"
- Note if user has a specific doctor preference or needs a second opinion.
- Ask about urgency: earliest available or specific date.

### 2. Open Narayana Health & Verify Login
- Open a NEW tab and navigate to `https://www.narayanahealth.org`.
- Take snapshot. Verify logged in (check for profile or patient portal section).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Find Specialist
- Navigate to "Find a Doctor" or browse by department/speciality.
- Filter by: speciality, hospital/city, doctor name if specified.
- Take snapshot of doctor listing.
- Extract top 3-5 doctors: name, designation, speciality, experience, hospital unit, qualifications, notable achievements.
- Use `ask_user` (input_type "choice"):
  "Dr. Name — Designation — XX yrs exp — Narayana [Location] — Speciality — Available: [date]"

### 4. Select Appointment
- Click on selected doctor. Take snapshot of profile and availability.
- Choose: in-person appointment or teleconsultation.
- Show available date and time slots.
- Use `ask_user` (input_type "choice") to pick the preferred slot.
- If no suitable slots, suggest alternative doctors or Narayana Health locations.
- For teleconsultation: confirm that user has phone/video capability.

### 5. Fill Patient Details
- Enter patient details: full name, age/DOB, gender, phone number, email.
- Add health concern, symptoms, or reason for visit.
- Mention first visit vs follow-up.
- Upload previous reports/scans if user has them (use `ask_user` to collect).
- Take snapshot of the completed form.

### 6. Review & Confirm
- Use `confirm_action`:
  - Doctor name, designation, department, qualifications
  - Hospital: Narayana Health [Location] with address
  - Consultation mode: In-person / Teleconsult (phone/video)
  - Date and time
  - Consultation fee (if applicable)
  - Patient name and health concern
  - Any preparation instructions (fasting, reports to carry)
- Do NOT proceed unless user confirms.

### 7. Payment & Book
- If online payment required:
  - Use `collect_payment`:
    - summary: JSON with doctor, department, hospital, date, time, fee
    - amount_inr: consultation fee
    - description: "Narayana Health appointment"
  - WAIT for payment confirmation.
- If payment at hospital: inform user about registration charges at reception.

### 8. Complete & Confirm
- Complete booking. Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: appointment/token number, doctor name, department, hospital with full address, date, time.
- In-person: "Arrive 20 minutes early. Carry previous reports, prescriptions, and photo ID."
- Teleconsult: "You will receive a call/video link at your registered phone number at the scheduled time."
- Remind: "For rescheduling or cancellation, contact Narayana Health helpline."

## Site Notes

- Narayana Health (founded by Dr. Devi Shetty) is known for affordable, high-quality healthcare with 20+ hospitals.
- Major locations: Bangalore (Health City — flagship), Kolkata (RN Tagore), Ahmedabad, Gurugram, Mysore, Shimoga, Jaipur, Howrah.
- World-renowned for cardiac surgery — performs one of the highest volumes of heart surgeries globally.
- Strong specialities: cardiac sciences, oncology, nephrology, neurosciences, organ transplant, orthopedics.
- Consultation fees: ₹300-2000 — among the most affordable of premium hospital chains.
- Narayana Health is known for its mission of affordable healthcare — many subsidized schemes for BPL patients.
- Teleconsultation available for most specialities via phone or video call.
- NABH accredited hospitals with international quality standards.
- Health checkup packages: ₹999-8999 — comprehensive, cardiac, diabetic, women's health options.
- Narayana Health City (Bangalore) is a 30-acre medical campus with multiple super-speciality hospitals.
- International patient services available with dedicated coordinators for overseas patients.
- Emergency: 24/7 emergency and trauma care — for emergencies, direct to nearest Narayana ER or call 108.
- Use `confirm_action` for review, `collect_payment` for booking. WAIT for user response at each step.
