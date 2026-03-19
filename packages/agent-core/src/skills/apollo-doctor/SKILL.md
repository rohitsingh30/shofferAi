---
name: apollo-doctor
description: Book doctor consultation on Apollo 24|7 — search specialists, choose video/in-person, book appointment.
triggers:
  - apollo doctor
  - apollo 247
  - apollo consultation
  - book doctor apollo
  - apollo specialist
  - video consultation apollo
  - apollo appointment
  - apollo 24|7
siteUrl: https://www.apollo247.com
requiresAuth: true
params:
  - name: speciality
    required: true
    hint: Type of doctor (e.g. "general physician", "cardiologist", "dermatologist", "orthopedic")
  - name: consultationType
    required: false
    hint: "video" or "in-person" (default video)
  - name: city
    required: false
    hint: City for in-person visit (e.g. "Delhi", "Mumbai", "Bangalore")
  - name: concern
    required: false
    hint: Health concern or symptoms (e.g. "chest pain", "skin allergy", "knee pain")
---

# Apollo 24|7 Doctor Consultation

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Understand Requirements
- Determine: speciality needed, video vs in-person, city (for in-person), urgency.
- If user described symptoms but not speciality, suggest appropriate specialist.
- Use `ask_user` for missing info. Ask: "Would you prefer a video consultation or in-person visit?"
- If urgency is high, suggest "Consult Now" (instant video) vs scheduled appointment.

### 2. Open Apollo 24|7 & Verify Login
- Open a NEW tab and navigate to `https://www.apollo247.com`.
- Take snapshot. Verify logged in (check for profile icon or name).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Set location/city if prompted.

### 3. Search Specialists
- Navigate to "Find Doctors" or use the speciality search.
- For video: filter by "Online Consultation Available".
- For in-person: filter by city and area.
- Take snapshot of search results.
- Apply filters: availability (today/tomorrow), experience, fee range, rating, gender preference.
- Extract top 3-5 doctors: name, qualification, speciality, experience (years), rating, consultation fee, next available slot, hospital/clinic name.
- Use `ask_user` (input_type "choice"):
  "Dr. Name — Speciality — XX yrs exp — ⭐ X.X — ₹XXX — Next: [date/time] — [Hospital]"

### 4. Select Time Slot
- Click selected doctor. Take snapshot of doctor profile page.
- Show available time slots for the next few days.
- Separate video and in-person slots clearly.
- Use `ask_user` (input_type "choice") to pick a slot.
- If preferred date/time not available, suggest next available alternatives.

### 5. Review & Confirm
- Use `confirm_action`:
  - Doctor name, speciality, qualification, experience
  - Consultation type: Video or In-Person
  - Hospital/clinic name and address (for in-person) or "Video Consultation"
  - Date and time slot
  - Consultation fee
  - Any patient details required
- Do NOT proceed unless user confirms.

### 6. Payment & Book
- Fill patient details: name, age, gender, phone, health concern.
- If concern provided, add it to the consultation notes.
- Use `collect_payment`:
  - summary: JSON with doctor, speciality, type, date, time, fee
  - amount_inr: consultation fee
  - description: "Apollo 24|7 doctor consultation"
- WAIT for payment confirmation.

### 7. Confirm Booking
- Complete payment on Apollo 24|7. Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: booking ID, doctor name, speciality, consultation type, date, time, fee paid.
- For video: "You'll receive the video link on the Apollo 247 app and via SMS before your appointment."
- For in-person: include hospital address, floor, and landmark.
- Mention: "You can cancel or reschedule up to 2 hours before the appointment."

## Site Notes

- Apollo 24|7 is Apollo Hospitals' digital health platform — India's largest hospital chain.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Session may expire after 30 days — if login wall appears, ask user to re-login manually in Chrome Debug.
- Video consultations: ₹199-1000. In-person: ₹300-2500+ depending on specialist.
- "Consult Now" feature connects to available doctor within 15 minutes — good for urgent cases.
- Apollo Circle membership gives free consultations and discounts — check if user is a member.
- Prescriptions are sent digitally via the app after consultation.
- Follow-up within 7 days is usually free.
- Apollo 24|7 also has pharmacy, lab tests, and health records — but this skill is for doctor consultations only.
- Emergency: Apollo 24|7 is NOT for emergencies — direct user to nearest Apollo Hospital ER or call 108.
- Use `confirm_action` for review, `collect_payment` for booking. WAIT for user response at each step.
