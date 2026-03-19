---
name: manipal-hospital
description: Book appointment at Manipal Hospital — find specialists by department, schedule in-person or video consultation.
triggers:
  - manipal hospital
  - manipal healthcare
  - book doctor manipal
  - manipal appointment
  - manipal specialist
  - manipal hospital booking
  - manipal consultation
  - manipal hospital doctor
siteUrl: https://www.manipalhospitals.com
requiresAuth: true
params:
  - name: speciality
    required: true
    hint: Department or speciality (e.g. "cardiology", "oncology", "neurology", "orthopedics", "gastroenterology")
  - name: city
    required: false
    hint: City or hospital location (e.g. "Bangalore", "Delhi", "Mangalore", "Pune", "Goa", "Jaipur")
  - name: consultation_type
    required: false
    hint: "in-person" or "video" consultation (default in-person)
---

# Manipal Hospital Appointment Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Understand Requirements
- Determine: speciality/department, preferred Manipal Hospital location, in-person vs video.
- If user describes condition, map to the appropriate department.
- Use `ask_user` for missing details: "Which speciality do you need and which city?"
- Ask about urgency and any specific doctor preference.
- Note if this is a first visit or follow-up with an existing doctor.

### 2. Open Manipal Hospitals & Verify Login
- Open a NEW tab and navigate to `https://www.manipalhospitals.com`.
- Take snapshot. Verify logged in (check for profile/account icon).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Find Specialist
- Navigate to "Find a Doctor" or use the search functionality.
- Filter by: speciality/department, hospital location/city.
- Take snapshot of doctor listings.
- Extract top 3-5 doctors: name, designation, speciality, experience, hospital unit, qualifications, next available slot.
- Use `ask_user` (input_type "choice"):
  "Dr. Name — Designation — Speciality — XX yrs — Manipal [Location] — Available: [date/time]"

### 4. Select Appointment Slot
- Click the selected doctor. Take snapshot of profile and availability page.
- Choose consultation type: in-person or video.
- Show available slots for the next 5-7 days.
- Use `ask_user` (input_type "choice") to pick preferred date and time.
- If preferred slot not available, suggest nearby dates or other Manipal locations in the same city.

### 5. Fill Patient Details
- Enter patient information: full name, date of birth, gender, phone number, email.
- Add reason for visit or health concern.
- Mention if first consultation or follow-up.
- Upload previous reports if user has them (use `ask_user` to collect files).
- Take snapshot of the completed registration form.

### 6. Review & Confirm
- Use `confirm_action`:
  - Doctor name, designation, department, qualifications
  - Hospital: Manipal Hospital [Location] with full address
  - Consultation type: In-person / Video
  - Date and time
  - Consultation fee (if displayed)
  - Patient name and reason for visit
  - Any preparation instructions
- Do NOT proceed unless user confirms.

### 7. Payment & Book
- If online payment is required:
  - Use `collect_payment`:
    - summary: JSON with doctor, department, hospital, date, time, consultation_type, fee
    - amount_inr: consultation fee
    - description: "Manipal Hospital appointment"
  - WAIT for payment confirmation.
- If payment at hospital: inform user that payment will be collected at reception.

### 8. Complete & Confirm
- Complete the booking process. Handle OTP via `ask_user` if needed.
- Take snapshot of appointment confirmation.
- Report: appointment/reference ID, doctor name, department, hospital with address, date, time.
- In-person: "Arrive 20 minutes early for registration. Carry previous medical records and photo ID."
- Video: "You will receive a video call link via SMS/email before the appointment time."
- Remind: "For rescheduling, contact Manipal helpline or manage from your online account."

## Site Notes

- Manipal Hospitals is one of India's largest multi-speciality hospital chains with 30+ hospitals.
- Major locations: Bangalore (HAL Airport Road, Old Airport Road, Whitefield, Sarjapur), Delhi, Mangalore, Pune, Goa, Jaipur, Kolkata, Vijayawada.
- Manipal is the flagship hospital of the Manipal Group — affiliated with Manipal Academy of Higher Education.
- Strong specialities: oncology, cardiac sciences, neurosciences, organ transplant, orthopedics, gastroenterology.
- Consultation fees vary: ₹400-2500 depending on speciality, doctor seniority, and location.
- Video consultations available through Manipal Hospitals app and website.
- NABH and JCI accredited — among the highest quality standards in Indian healthcare.
- International patient department available for overseas patients — translator and visa support.
- Health checkup packages: Comprehensive, Executive, Cardiac, Women's, Senior Citizen — ₹1999-12999.
- Emergency: Manipal has 24/7 emergency services — for emergencies, direct user to nearest Manipal ER or call 108.
- Manipal Hospital Bangalore (Old Airport Road) is the flagship unit with the widest range of super-specialities.
- Use `confirm_action` for review, `collect_payment` for booking. WAIT for user response at each step.
