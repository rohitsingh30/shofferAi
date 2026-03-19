---
name: marsvet-pet
description: Book vet appointment on MarsVet/Wiggles — pet health consultation, grooming, vaccination, and wellness services.
triggers:
  - marsvet
  - wiggles vet
  - pet grooming
  - pet vaccination
  - dog grooming
  - cat grooming
  - wiggles pet
  - marsvet appointment
  - pet wellness
siteUrl: https://www.wiggles.in
requiresAuth: true
params:
  - name: service_type
    required: true
    hint: Service needed — "vet consultation", "grooming", "vaccination", "deworming", "health checkup"
  - name: pet_type
    required: true
    hint: Type of pet (e.g. "dog", "cat")
  - name: city
    required: false
    hint: City for in-person services (e.g. "Mumbai", "Bangalore", "Delhi", "Pune", "Hyderabad")
---

# MarsVet/Wiggles Pet Services Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Understand Requirements
- Determine: vet consultation, grooming, vaccination, deworming, or health checkup?
- For vet consultation: get pet type, symptoms, urgency, online vs in-person.
- For grooming: get pet type, breed, size, preferred grooming package.
- For vaccination: get pet type, age, previous vaccination history.
- Use `ask_user` to clarify: "What service does your pet need — vet consultation, grooming, vaccination, or health checkup?"
- Get pet details: name, breed, age, weight.

### 2. Open Wiggles & Verify Login
- Open a NEW tab and navigate to `https://www.wiggles.in`.
- Take snapshot. Verify logged in (check for user profile or account section).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3a. Vet Consultation
- Navigate to "Vet Consultation" or "Talk to a Vet" section.
- Browse available veterinarians. Filter by pet type and speciality.
- Take snapshot of available vets.
- Extract top 3-5 vets: name, qualifications, experience, speciality, rating, fee, availability.
- Use `ask_user` (input_type "choice"):
  "Dr. Name — Qualifications — XX yrs — Speciality — ₹XXX — Available: [time]"

### 3b. Grooming Services
- Navigate to "Grooming" section. Select pet type and city.
- Browse grooming packages: basic bath, full grooming, spa, haircut, nail trim.
- Take snapshot of available packages.
- Show package details: name, services included, duration, price.
- Use `ask_user` (input_type "choice"):
  "Package Name — Services: [list] — Duration — ₹XXX"

### 3c. Vaccination / Health Services
- Navigate to "Vaccination" or "Pet Health" section.
- Show available vaccination schedules based on pet type and age.
- List: vaccine name, due date (based on age), price, package options.
- Use `ask_user` (input_type "choice") for vaccine/package selection.

### 4. Select Schedule
- For vet consultation: choose instant or scheduled. Show available time slots.
- For grooming: select preferred date and time slot. Note: grooming requires 1-3 hours.
- For vaccination: select date and time (morning preferred).
- Use `ask_user` (input_type "choice") to pick date and time.
- If home visit available, ask: "Would you prefer a home visit or visiting the clinic?"

### 5. Add Pet Details
- Fill in pet profile: name, type, breed, age, weight, gender, neutered status.
- For vet: add symptoms, medical history, current medications.
- For grooming: note any skin sensitivities, aggressive behavior warnings, special instructions.
- For vaccination: add previous vaccination records if available.
- Use `ask_user` to collect any photos or documents.
- Take snapshot of the completed form.

### 6. Review & Confirm
- Use `confirm_action`:
  - Service type and specific package/service
  - For vet: doctor name, consultation mode, date, time, fee
  - For grooming: package name, services, date, time, location (home/clinic), price
  - For vaccination: vaccine name, date, time, price
  - Pet details: name, breed, age
  - Address (for home visits)
  - Total payable amount
- Do NOT proceed unless user confirms.

### 7. Payment & Book
- Use `collect_payment`:
  - summary: JSON with service_type, details, pet_details, date, time, price
  - amount_inr: total payable
  - description: "Wiggles pet service booking"
- WAIT for payment confirmation.

### 8. Complete & Confirm
- Complete payment. Handle OTP via `ask_user` if needed.
- Take snapshot of booking confirmation.
- Report: booking ID, service type, date, time, location/mode, pet details, amount paid.
- For vet consult: "The vet will connect at the scheduled time. Keep your pet nearby."
- For grooming: "The groomer will arrive at your address. Ensure your pet is comfortable."
- For vaccination: "Carry previous vaccination card. The vet will update it after vaccination."
- Remind: "You will receive SMS/email confirmation with the professional's contact details."

## Site Notes

- Wiggles (formerly MarsVet) is India's leading pet care platform offering vet consultations, grooming, and wellness.
- Online vet consultations: ₹199-499 for video/audio calls with certified veterinarians.
- Grooming packages: ₹499-2499 depending on pet size, breed, and service level (basic to premium spa).
- Vaccination: individual vaccines ₹300-1500, puppy/kitten packages ₹1500-4000.
- Home grooming and home vaccination services available in major metros — Mumbai, Bangalore, Delhi, Pune, Hyderabad.
- Wiggles also sells pet food, supplements, and accessories — can add to order if needed.
- Groomers are trained and certified — mention any pet anxiety or aggression for special handling.
- For puppies/kittens: Wiggles offers new pet parent packages with consultation + vaccination + nutrition guidance.
- Deworming recommended every 3 months for dogs and cats — Wiggles tracks and reminds.
- NOT for pet emergencies — direct to nearest 24/7 veterinary hospital for trauma, poisoning, or severe illness.
- Wiggles app provides appointment tracking, pet health records, and reminders for vaccinations.
- Use `confirm_action` for review, `collect_payment` for booking. WAIT for user response at each step.
