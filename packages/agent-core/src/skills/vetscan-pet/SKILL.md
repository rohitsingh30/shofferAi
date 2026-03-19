---
name: vetscan-pet
description: Book online vet consultation on VetScan — dog, cat, and pet health, video consult with veterinarians.
triggers:
  - vetscan
  - vet consultation
  - online vet
  - pet doctor
  - dog vet
  - cat vet
  - pet consultation
  - veterinary consultation
  - vet appointment online
siteUrl: https://www.vetscan.in
requiresAuth: true
params:
  - name: pet_type
    required: true
    hint: Type of pet (e.g. "dog", "cat", "bird", "rabbit", "fish")
  - name: concern
    required: true
    hint: Pet health concern or symptoms (e.g. "not eating", "vomiting", "skin rash", "limping", "vaccination")
  - name: pet_name
    required: false
    hint: Pet's name and breed (e.g. "Max, Golden Retriever", "Luna, Persian cat")
---

# VetScan Online Vet Consultation

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Understand Requirements
- Determine: pet type, specific health concern, urgency level.
- Use `ask_user` to gather: "What type of pet, and what symptoms or concern do you have?"
- Ask for pet details: name, breed, age, weight (helps vet with diagnosis).
- Assess urgency: is this an emergency (bleeding, poisoning, seizure) or routine concern?
- If emergency: advise user to visit nearest pet hospital immediately — VetScan is for non-emergency consults.
- Ask about vaccination/deworming status if relevant.

### 2. Open VetScan & Verify Login
- Open a NEW tab and navigate to `https://www.vetscan.in`.
- Take snapshot. Verify logged in (check for profile or account section).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Browse Veterinarians
- Navigate to consultation booking or "Find a Vet" section.
- Filter by: pet type (dog/cat/exotic), speciality if available, availability.
- Take snapshot of available veterinarians.
- Extract top 3-5 vets: name, qualifications, experience, speciality (small animal, dermatology, orthopedics), rating, consultation fee, availability.
- Use `ask_user` (input_type "choice"):
  "Dr. Name — BVSc/MVSc — XX yrs exp — Speciality — Rating X.X — ₹XXX — Available: [time]"

### 4. Select Consultation Slot
- Click on the selected vet. Take snapshot of profile.
- Choose: instant consultation or scheduled appointment.
- If scheduled: show available date and time slots.
- Use `ask_user` (input_type "choice") to select the preferred slot.
- If instant consult available and concern is urgent, recommend instant.

### 5. Add Pet & Health Details
- Fill in pet profile: name, type (dog/cat/other), breed, age, weight, gender (male/female, neutered/intact).
- Add health concern description with symptoms, duration, and any changes in behavior.
- Upload photos or videos of the pet's condition if available (use `ask_user` to collect).
- Mention any current medications, allergies, or diet information.
- Take snapshot of the filled form.

### 6. Review & Confirm
- Use `confirm_action`:
  - Veterinarian name and qualifications
  - Consultation mode: Video / Audio
  - Date and time (or "Instant — within 10 minutes")
  - Pet details: name, breed, age, weight
  - Health concern summary
  - Consultation fee
- Do NOT proceed unless user confirms.

### 7. Payment & Book
- Use `collect_payment`:
  - summary: JSON with vet_name, consultation_type, date, time, pet_details, concern, fee
  - amount_inr: consultation fee
  - description: "VetScan vet consultation"
- WAIT for payment confirmation.

### 8. Complete & Confirm
- Complete payment. Handle OTP via `ask_user` if needed.
- Take snapshot of booking confirmation.
- Report: booking ID, vet name, date/time, consultation mode, pet details.
- For instant: "The vet will connect with you within 10 minutes. Keep your camera ready to show the pet."
- For scheduled: "You will receive a reminder before your appointment."
- Remind: "Have your pet nearby during the consultation. The vet may ask to see the pet on camera."
- "Prescription and treatment plan will be shared digitally after the consultation."

## Site Notes

- VetScan offers online veterinary consultations connecting pet owners with qualified veterinarians.
- Consultation fees: ₹199-599 for video/audio consultations with experienced vets.
- Available for dogs, cats, birds, rabbits, and exotic pets — specify pet type during booking.
- Video consultation is preferred over audio — vet can visually assess the pet's condition.
- Common concerns handled well online: skin issues, dietary advice, behavioral problems, minor digestive issues, vaccination schedules.
- NOT suitable for emergencies: trauma, poisoning, severe bleeding, difficulty breathing — direct to nearest vet hospital.
- Vet may recommend in-person visit or lab tests if condition requires physical examination.
- Prescriptions issued are valid at pet pharmacies and veterinary stores.
- Follow-up consultations may be available free or discounted within a few days.
- Keep pet's vaccination card and any previous medical records handy during consultation.
- Peak hours (evenings/weekends) may have longer wait times — morning slots tend to be faster.
- Use `confirm_action` for review, `collect_payment` for booking. WAIT for user response at each step.
