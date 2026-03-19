---
name: tata-health
description: Book doctor consultations or lab tests on Tata Health (1mg) — find doctors, book appointments, order lab tests.
triggers:
  - tata health
  - 1mg doctor
  - 1mg consultation
  - tata 1mg
  - book lab test
  - book doctor tata
  - tata health consultation
  - online consultation 1mg
  - lab test booking
siteUrl: https://www.tatahealth.com
requiresAuth: true
params:
  - name: service_type
    required: true
    hint: Type of service — "doctor consultation" or "lab test"
  - name: speciality
    required: false
    hint: Doctor speciality (e.g. "general physician", "dermatologist") or test name (e.g. "CBC", "thyroid profile")
  - name: city
    required: false
    hint: City for in-person visits or lab sample collection
---

# Tata Health Doctor & Lab Test Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Understand Requirements
- Determine: doctor consultation or lab test booking?
- For doctor: get speciality, online vs in-person, symptoms/concerns.
- For lab test: get test name(s), preferred date, home collection vs lab visit.
- Use `ask_user` to clarify: "Would you like to book a doctor consultation or a lab test?"
- If user describes symptoms but not speciality, suggest the appropriate specialist.

### 2. Open Tata Health & Verify Login
- Open a NEW tab and navigate to `https://www.tatahealth.com`.
- Take snapshot. Verify logged in (check for profile icon or user name).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3a. Book Doctor Consultation
- Navigate to the "Consult Doctor" or speciality-specific section.
- Search by speciality or browse available doctors.
- Take snapshot of doctor listing results.
- Apply filters: availability, experience, fee range, language, gender preference.
- Extract top 3-5 doctors: name, speciality, experience, rating, consultation fee, next available slot.
- Use `ask_user` (input_type "choice"): "Dr. Name — Speciality — XX yrs — Rating X.X — ₹XXX — Next: [date/time]"

### 3b. Book Lab Test
- Navigate to the "Lab Tests" section.
- Search for the requested test or health package.
- Take snapshot of available options.
- Show test details: test name, parameters included, price, home collection availability.
- If multiple labs available, compare prices and ratings.
- Use `ask_user` (input_type "choice") for test/package selection.
- Select preferred date and time slot for sample collection.

### 4. Select Time Slot
- For doctor: show available slots for the next 3-5 days. Use `ask_user` (input_type "choice") to pick.
- For lab test: show available collection slots (morning preferred for fasting tests).
- Use `ask_user` to confirm date and time.
- If preferred slot unavailable, suggest closest alternatives.

### 5. Review & Confirm
- Use `confirm_action`:
  - For doctor: doctor name, speciality, date, time, consultation mode (video/in-person), fee
  - For lab test: test name, parameters, date, time, collection type (home/lab), address, price
  - Patient details: name, age, gender
  - Total payable amount
- Do NOT proceed unless user confirms.

### 6. Payment & Book
- Fill in patient details: name, age, gender, phone number.
- Add health concern or test requirement notes if applicable.
- Use `collect_payment`:
  - summary: JSON with service details, date, time, fee/price
  - amount_inr: total payable
  - description: "Tata Health booking"
- WAIT for payment confirmation.

### 7. Complete & Confirm
- Complete payment. Handle OTP via `ask_user` if needed.
- Take snapshot of booking confirmation.
- For doctor: report booking ID, doctor name, date, time, video link or clinic address.
- For lab test: report booking ID, test name, collection date/time, address, preparation instructions (fasting, etc.).
- Remind: "You will receive SMS/email confirmation with full details."

## Site Notes

- Tata Health (formerly 1mg) is backed by Tata Group — trusted and reliable platform.
- Online doctor consultations: ₹199-999 depending on speciality and experience.
- Lab tests: often 40-60% cheaper than walk-in lab rates with home collection included.
- Popular health packages: Full Body Checkup (₹599-1999), Thyroid Profile, Diabetes Panel.
- Home sample collection available in most metro and tier-1 cities — phlebotomist visits home.
- Fasting tests (blood sugar, lipid profile): inform user to fast 8-12 hours before sample collection.
- Reports delivered digitally within 24-48 hours for most tests.
- Tata Health Plus membership offers free consultations and discounted lab tests — check eligibility.
- Video consultations work via the Tata Health app or browser — user needs stable internet.
- Prescription from consultation is sent digitally and can be used to order medicines on 1mg.
- Use `confirm_action` for review, `collect_payment` for booking. WAIT for user response at each step.
