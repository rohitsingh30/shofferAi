---
name: max-healthcare
description: Book appointment at Max Hospital — find specialists by department, schedule in-person or video consultation.
triggers:
  - max hospital
  - max healthcare
  - book appointment max
  - max hospital appointment
  - max specialist
  - max hospital doctor
  - max healthcare booking
  - max hospital consultation
siteUrl: https://www.maxhealthcare.in
requiresAuth: true
params:
  - name: speciality
    required: true
    hint: Department or speciality (e.g. "cardiology", "orthopedics", "neurology", "oncology", "gastroenterology")
  - name: location
    required: false
    hint: Preferred Max Hospital location (e.g. "Saket", "Patparganj", "Vaishali", "Gurgaon", "Mohali")
  - name: consultation_type
    required: false
    hint: "in-person" or "video" consultation (default in-person)
---

# Max Healthcare Appointment Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Understand Requirements
- Determine: department/speciality, preferred hospital location, in-person vs video consultation.
- If user describes condition but not speciality, map to the correct department.
- Use `ask_user` to clarify missing details: "Which speciality do you need? Any preferred Max Hospital location?"
- Ask about urgency: today/tomorrow or flexible scheduling.
- Note if user has a specific doctor preference.

### 2. Open Max Healthcare & Verify Login
- Open a NEW tab and navigate to `https://www.maxhealthcare.in`.
- Take snapshot. Verify logged in (check for user profile or "My Account" section).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Find Specialist
- Navigate to "Find a Doctor" or the relevant department page.
- Filter by: speciality/department, hospital location, availability.
- Take snapshot of doctor listing results.
- Extract top 3-5 doctors: name, designation, speciality, experience (years), hospital unit, qualifications, consultation fee, next available slot.
- Use `ask_user` (input_type "choice"):
  "Dr. Name — Designation — Speciality — XX yrs — Max [Location] — ₹XXX — Next: [date/time]"

### 4. Select Appointment Slot
- Click on the selected doctor. Take snapshot of their profile page.
- Choose consultation type: in-person or video.
- Show available date and time slots for the next 5-7 days.
- Use `ask_user` (input_type "choice") to select preferred slot.
- If preferred date/time unavailable, show closest alternatives or other Max locations.

### 5. Fill Patient Details
- Enter patient information: full name, age, gender, phone number, email.
- Add medical concern or reason for visit.
- Upload previous reports if user has them (use `ask_user` to collect files).
- Select first visit or follow-up.
- Take snapshot of the completed form.

### 6. Review & Confirm
- Use `confirm_action`:
  - Doctor name, designation, department
  - Hospital: Max [Location] with full address
  - Consultation type: In-person / Video
  - Date and time slot
  - Consultation fee
  - Patient name and concern
  - Any preparation instructions (fasting, reports to carry)
- Do NOT proceed unless user confirms.

### 7. Payment & Book
- Use `collect_payment`:
  - summary: JSON with doctor, department, hospital, date, time, consultation_type, fee
  - amount_inr: consultation fee
  - description: "Max Healthcare appointment"
- WAIT for payment confirmation.

### 8. Complete & Confirm
- Complete payment. Handle OTP via `ask_user` if needed.
- Take snapshot of appointment confirmation.
- Report: appointment ID, doctor name, department, hospital location with address, date, time, fee paid.
- For in-person: "Please arrive 15 minutes early. Carry any previous medical reports and valid ID."
- For video: "You will receive a video consultation link via SMS/email before the appointment."
- Remind: "You can reschedule up to 4 hours before the appointment from your Max account."

## Site Notes

- Max Healthcare is one of India's largest hospital chains with 17+ hospitals across North India.
- Major locations: Saket, Patparganj, Vaishali, Shalimar Bagh, Dwarka (Delhi NCR), Gurgaon, Mohali, Dehradun, Lucknow.
- Consultation fees: ₹500-2500 depending on speciality and doctor seniority.
- Video consultations available for most specialities — same fee as in-person typically.
- Max hospitals are NABH and JCI accredited — internationally recognized quality standards.
- Speciality strengths: cardiac surgery, oncology, neurosciences, orthopedics, organ transplant.
- Health checkup packages available: Max Comprehensive (₹2999-9999), Executive, Cardiac, Women's.
- Emergency: Max has 24/7 emergency departments — for emergencies, direct user to call Max emergency or 108.
- International patient services available — multilingual support for non-Indian patients.
- Max app provides appointment management, reports access, and video consultation capability.
- Follow-up within 7 days with the same doctor is usually discounted or free.
- Use `confirm_action` for review, `collect_payment` for booking. WAIT for user response at each step.
