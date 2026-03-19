---
name: mfine-doctor
description: Book online doctor consultation on MFine — find specialists, schedule video consult, get prescriptions.
triggers:
  - mfine
  - mfine doctor
  - mfine consultation
  - online doctor mfine
  - video consultation mfine
  - specialist consultation mfine
  - book doctor mfine
  - mfine appointment
siteUrl: https://www.mfine.co
requiresAuth: true
params:
  - name: speciality
    required: true
    hint: Doctor speciality (e.g. "general physician", "dermatologist", "cardiologist", "pediatrician")
  - name: concern
    required: false
    hint: Health concern or symptoms (e.g. "persistent cough", "skin allergy", "chest pain")
  - name: preferred_time
    required: false
    hint: Preferred consultation time (e.g. "today evening", "tomorrow morning")
---

# MFine Online Doctor Consultation

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Understand Requirements
- Determine: speciality needed, health concern, urgency level.
- If user describes symptoms but not speciality, map symptoms to the right specialist.
- Use `ask_user` if unclear: "What symptoms or health concern would you like to consult about?"
- Ask about preferred time: "Would you like to consult now (instant) or schedule for later?"
- Note any previous medical history the user wants to share.

### 2. Open MFine & Verify Login
- Open a NEW tab and navigate to `https://www.mfine.co`.
- Take snapshot. Verify logged in (check for profile/account section).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Browse Specialists
- Navigate to the relevant speciality section or use the search/browse feature.
- Take snapshot of available doctors.
- Filter by: availability (instant vs scheduled), experience, rating, language.
- Extract top 3-5 doctors: name, speciality, qualifications, experience (years), hospital affiliation, rating, consultation fee, next available slot.
- Use `ask_user` (input_type "choice"):
  "Dr. Name — Speciality — XX yrs — Hospital — Rating X.X — ₹XXX — Available: [time]"

### 4. Select Consultation Slot
- Click on the selected doctor. Take snapshot of their profile.
- If instant consult available and user wants it, proceed directly.
- If scheduled: show available date and time slots for next 3-5 days.
- Use `ask_user` (input_type "choice") to pick a time slot.
- If no slots match preference, suggest the closest available alternatives.

### 5. Add Health Details
- Fill in patient details: name, age, gender, phone number.
- Add health concern description if provided.
- Upload any previous reports or images if user has them (use `ask_user` to get files).
- Take snapshot of the filled form.

### 6. Review & Confirm
- Use `confirm_action`:
  - Doctor name, speciality, qualifications, hospital
  - Consultation mode: Video/Audio
  - Date and time (or "Instant — within 5 minutes")
  - Consultation fee
  - Patient name and concern summary
- Do NOT proceed unless user confirms.

### 7. Payment & Book
- Use `collect_payment`:
  - summary: JSON with doctor, speciality, hospital, date, time, fee
  - amount_inr: consultation fee
  - description: "MFine doctor consultation"
- WAIT for payment confirmation.

### 8. Complete & Confirm
- Complete payment. Handle OTP via `ask_user` if needed.
- Take snapshot of booking confirmation page.
- Report: booking ID, doctor name, speciality, hospital, date/time, consultation mode.
- For instant consult: "Your doctor will connect within 5 minutes. Keep the app/browser open."
- For scheduled: "You will receive a reminder before your appointment."
- Remind: "Prescription will be shared digitally after the consultation."

## Site Notes

- MFine partners with top hospitals (Manipal, Fortis, Cloudnine, etc.) for quality doctors.
- Instant consultations available 24/7 for general physicians and some specialists.
- Consultation fees: ₹199-799 depending on speciality and doctor experience.
- Video consultation requires stable internet and camera/microphone access.
- MFine app provides better video quality than browser — suggest app if user has it installed.
- Follow-up consultations are often free within 7 days of the original appointment.
- Digital prescriptions are legally valid and can be used at any pharmacy.
- MFine stores consultation history — useful for follow-up visits with the same doctor.
- Health packages and lab tests are also available through MFine — mention if relevant.
- Emergency cases: MFine is NOT for emergencies — direct user to nearest hospital or call 108.
- Use `confirm_action` for review, `collect_payment` for booking. WAIT for user response at each step.
