---
name: portea-homecare
description: Book home healthcare services on Portea — nursing care, physiotherapy, lab tests, doctor visits at home.
triggers:
  - portea
  - home healthcare
  - home nursing
  - physiotherapy at home
  - home doctor visit
  - portea nursing
  - home lab test portea
  - portea physiotherapy
  - home health service
siteUrl: https://www.portea.com
requiresAuth: true
params:
  - name: service_type
    required: true
    hint: Service needed — "nursing", "physiotherapy", "doctor visit", "lab test", "elder care", "medical equipment"
  - name: city
    required: true
    hint: City for home service (e.g. "Bangalore", "Delhi", "Mumbai", "Hyderabad")
  - name: condition
    required: false
    hint: Medical condition or requirement (e.g. "post-surgery care", "knee pain", "diabetes management")
---

# Portea Home Healthcare Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Understand Requirements
- Determine: which service — nursing, physiotherapy, doctor visit, lab test, elder care, or equipment rental?
- Get details: city, specific condition, duration (one-time vs recurring), preferred timing.
- Use `ask_user` to clarify: "What type of home healthcare service do you need?"
- For physiotherapy: ask about condition (post-surgery, chronic pain, stroke rehab, sports injury).
- For nursing: ask about care type (wound dressing, injection, catheter, ICU-at-home).
- For lab tests: get test name(s) and preferred date.

### 2. Open Portea & Verify Login
- Open a NEW tab and navigate to `https://www.portea.com`.
- Take snapshot. Verify logged in (check for profile or account section).
- Select the city if prompted.
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Select Service
- Navigate to the appropriate service category on Portea.
- For nursing: browse nursing care packages (wound care, post-op, ICU-at-home, injections).
- For physiotherapy: browse physio packages (orthopedic, neuro, cardiac, sports rehab).
- For doctor visit: select general physician or specialist home visit.
- For lab tests: search for the test/package needed.
- Take snapshot of available options.
- Extract relevant details: service name, description, price, duration, frequency.
- Use `ask_user` (input_type "choice") to present top 3-5 options:
  "Service Name — ₹XXX per session — Duration — Description"

### 4. Select Schedule
- After service selection, choose preferred date and time slot.
- Show available slots: morning (8AM-12PM), afternoon (12PM-4PM), evening (4PM-8PM).
- Use `ask_user` (input_type "choice") to pick date and time.
- For recurring services (e.g., daily physiotherapy), set up the schedule frequency.
- If preferred slot unavailable, suggest alternatives.

### 5. Patient & Address Details
- Fill in patient details: name, age, gender, phone number.
- Add medical condition details and any special requirements.
- Confirm home address: full address with landmark, pincode.
- Use `ask_user` if address needs clarification.
- Take snapshot of the filled form.

### 6. Review & Confirm
- Use `confirm_action`:
  - Service type and specific package
  - Professional type (nurse/physiotherapist/doctor)
  - Date, time slot, and frequency (if recurring)
  - Patient name, age, condition
  - Home address
  - Price per session and total (if package)
  - Any preparation instructions
- Do NOT proceed unless user confirms.

### 7. Payment & Book
- Use `collect_payment`:
  - summary: JSON with service, date, time, address, price, patient details
  - amount_inr: total payable (per session or package total)
  - description: "Portea home healthcare booking"
- WAIT for payment confirmation.

### 8. Complete & Confirm
- Complete payment. Handle OTP via `ask_user` if needed.
- Take snapshot of booking confirmation.
- Report: booking ID, service type, professional assigned (if shown), date, time, address, amount paid.
- Remind: "The assigned professional will call you 30 minutes before arrival."
- For recurring: "Your schedule is set. You can manage sessions from your Portea account."

## Site Notes

- Portea is India's largest home healthcare company, operating in 30+ cities.
- Services: nursing care, physiotherapy, doctor visits, lab tests, ICU-at-home, elder care, medical equipment rental.
- Pricing: nursing ₹500-1500/visit, physiotherapy ₹600-1200/session, doctor visit ₹800-2000, lab tests vary.
- All professionals are verified, trained, and background-checked by Portea.
- ICU-at-home is available for post-hospitalization recovery — significantly cheaper than hospital stay.
- Physiotherapy packages (10-20 sessions) offer better per-session pricing than individual bookings.
- Lab test home collection: phlebotomist visits home, reports delivered digitally in 24-48 hours.
- Elder care packages: companion care, daily vitals monitoring, medication management.
- Medical equipment rental: oxygen concentrators, hospital beds, wheelchairs, pulse oximeters.
- Portea operates in Bangalore, Delhi NCR, Mumbai, Chennai, Hyderabad, Pune, Kolkata, and more.
- Use `confirm_action` for review, `collect_payment` for booking. WAIT for user response at each step.
