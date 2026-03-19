---
name: fortis-hospital
description: Book appointment at Fortis Hospital — find specialists, schedule consultation, book health checkup packages.
triggers:
  - fortis hospital
  - fortis appointment
  - book doctor fortis
  - fortis healthcare
  - fortis specialist
  - fortis health checkup
  - fortis consultation
  - fortis hospital booking
siteUrl: https://www.fortishealthcare.com
requiresAuth: true
params:
  - name: speciality
    required: true
    hint: Department or speciality (e.g. "cardiology", "orthopedics", "oncology") or "health checkup" for packages
  - name: city
    required: false
    hint: City or hospital location (e.g. "Gurgaon", "Bangalore", "Mumbai", "Noida", "Kolkata")
  - name: consultation_type
    required: false
    hint: "in-person", "video", or "health checkup" (default in-person)
---

# Fortis Hospital Appointment Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Understand Requirements
- Determine: doctor consultation or health checkup package?
- For doctor: get speciality, city/location preference, in-person vs video.
- For health checkup: get package type (comprehensive, cardiac, women's, executive).
- Use `ask_user` for missing details: "Which speciality or health checkup are you looking for?"
- If user mentions symptoms, recommend the appropriate speciality.
- Ask about preferred Fortis location if multiple in the city.

### 2. Open Fortis & Verify Login
- Open a NEW tab and navigate to `https://www.fortishealthcare.com`.
- Take snapshot. Verify logged in (check for profile or account section).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3a. Find Doctor
- Navigate to "Find a Doctor" section.
- Search by speciality and location. Apply available filters.
- Take snapshot of results.
- Extract top 3-5 doctors: name, designation, speciality, experience, hospital unit, qualifications, consultation fee, availability.
- Use `ask_user` (input_type "choice"):
  "Dr. Name — Designation — XX yrs exp — Fortis [Location] — ₹XXX — Available: [date]"

### 3b. Health Checkup Package
- Navigate to "Health Checkup" or "Preventive Health" section.
- Browse packages by type: Basic, Comprehensive, Master, Cardiac, Diabetic, Women's.
- Take snapshot of available packages.
- Show package details: name, tests included, price, duration, fasting requirements.
- Use `ask_user` (input_type "choice"):
  "Package Name — XX tests — ₹XXXX — [description]"

### 4. Select Schedule
- For doctor: show available slots over the next 5-7 days.
- For health checkup: show available dates (morning slots, fasting preferred).
- Use `ask_user` (input_type "choice") to pick date and time.
- If preferred slot unavailable, suggest alternatives or nearby Fortis hospitals.

### 5. Fill Patient Details
- Enter: full name, age, gender, phone number, email.
- For doctor: add reason for consultation, previous medical history.
- For health checkup: note any specific conditions or allergies.
- Take snapshot of the completed form.

### 6. Review & Confirm
- Use `confirm_action`:
  - For doctor: doctor name, speciality, hospital location, date, time, consultation type, fee
  - For checkup: package name, tests count, hospital, date, time, price, fasting instructions
  - Patient details summary
  - Total payable amount
  - Preparation instructions
- Do NOT proceed unless user confirms.

### 7. Payment & Book
- Use `collect_payment`:
  - summary: JSON with service details, hospital, date, time, price
  - amount_inr: total payable
  - description: "Fortis Hospital booking"
- WAIT for payment confirmation.

### 8. Complete & Confirm
- Complete payment. Handle OTP via `ask_user` if needed.
- Take snapshot of booking confirmation.
- For doctor: report appointment ID, doctor name, hospital address, date, time, fee.
- For checkup: report booking ID, package name, hospital, date, time, preparation instructions.
- In-person: "Arrive 15 minutes early with previous reports and photo ID."
- Video: "Consultation link will be sent via SMS/email."
- Checkup: "Fast for 10-12 hours before the appointment. Carry previous health reports."

## Site Notes

- Fortis Healthcare operates 27+ hospitals across India — one of the largest private chains.
- Major locations: Gurgaon (Fortis Memorial), Bangalore (Fortis Hospital), Mumbai, Noida, Mohali, Kolkata, Jaipur, Chennai.
- Consultation fees: ₹600-3000 depending on doctor seniority and speciality.
- Health checkup packages: ₹1499-14999 — comprehensive packages include 60-80+ tests.
- Fortis is known for cardiac care, oncology, neurosciences, and organ transplant programs.
- Video consultation (Fortis MyHealth app) available for most specialities.
- NABH accredited hospitals — quality and safety standards maintained.
- Fortis Healthworld pharmacies available in-hospital for immediate medicine dispensing.
- Second opinion service available — can consult Fortis specialists for complex cases.
- Emergency: Fortis has 24/7 emergency and trauma centers — for emergencies, direct user to call Fortis helpline or 108.
- Corporate health packages available with tie-ups — ask if user's company has a Fortis partnership.
- Use `confirm_action` for review, `collect_payment` for booking. WAIT for user response at each step.
