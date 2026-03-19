---
name: practo-doctor
description: Book doctor appointments on Practo — find doctors, check availability, book consultation.
triggers:
  - practo
  - book doctor
  - doctor appointment
  - find doctor
  - book consultation
  - online doctor
  - practo appointment
  - consult doctor
siteUrl: https://www.practo.com
requiresAuth: true
params:
  - name: speciality
    required: true
    hint: Type of doctor (e.g. "general physician", "dermatologist", "dentist", "gynecologist")
  - name: city
    required: false
    hint: City for in-person visit, or "online" for video consultation
  - name: concern
    required: false
    hint: Health concern (e.g. "skin rash", "back pain", "fever")
---

# Practo Doctor Appointment

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Understand Requirements
- Determine: speciality needed, in-person vs online, city, urgency.
- If user described symptoms but not speciality, suggest appropriate specialist.
- Use `ask_user` for missing info. Ask: "In-person visit or online video consultation?"

### 2. Open Practo & Verify Login
- Open a NEW tab:
  - In-person: `https://www.practo.com/[city]/doctor`
  - Online: `https://www.practo.com/consult`
- Take snapshot. Verify logged in.
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search Doctors
- Search by speciality in the search bar. Select city if needed.
- Take snapshot of results.
- Apply filters: availability (today/tomorrow), experience, fee range, rating.
- Extract top 3-5 doctors: name, speciality, experience (years), rating, consultation fee, next available slot, clinic name/location.
- Use `ask_user` (input_type "choice"): "Dr. Name — Speciality — XX yrs exp — ⭐ X.X — ₹XXX — Next: [date/time]"

### 4. Select Time Slot
- Click selected doctor. Take snapshot of profile page.
- Show available time slots for the next few days.
- Use `ask_user` (input_type "choice") to pick a slot.
- If preferred date/time not available, suggest alternatives.

### 5. Review & Confirm
- Use `confirm_action`:
  - Doctor name, speciality, qualification
  - Clinic name and address (for in-person) or "Video Consultation"
  - Date and time slot
  - Consultation fee
  - Any patient details needed
- Do NOT proceed unless user confirms.

### 6. Payment & Book
- Fill patient details: name, age, gender, phone.
- If concern provided, add it to the notes.
- Use `collect_payment`:
  - summary: JSON with doctor, speciality, date, time, fee
  - amount_inr: consultation fee
  - description: "Practo doctor appointment"
- WAIT for payment confirmation.

### 7. Confirm Booking
- Complete payment. Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation.
- Report: booking ID, doctor name, speciality, date, time, address/video link, fee paid.
- For video: "You'll receive a link on your phone before the appointment."
- For in-person: include clinic address and landmark.

## Site Notes

- Practo is India's largest doctor discovery and appointment platform.
- Online consultations: ₹200-800. In-person: ₹300-2000+.
- Practo Prime members get free consultations — check if applicable.
- Doctors verified by Practo — credentials are reliable.
- Ratings above 4.0 with 50+ reviews are trustworthy.
- Emergency: Practo is NOT for emergencies — direct user to hospital/108 if urgent.
- Follow-up consultations may be free within 7 days — mention this.
- Prescription will be sent digitally after consultation.
- Some doctors have "Instant Consult" — available now, no appointment needed.
- Video consultations work via Practo app — user needs Practo app installed.
- Use `confirm_action` for review, `collect_payment` for booking. WAIT for user response.
