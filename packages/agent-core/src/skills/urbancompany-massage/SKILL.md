---
name: urbancompany-massage
description: Book a spa massage at home on Urban Company — select massage type, duration, therapist gender, schedule, pay.
triggers:
  - book massage
  - spa at home
  - home massage
  - urban company massage
  - body massage
  - head massage
  - full body massage
  - relaxation massage
  - couple massage
  - deep tissue massage
siteUrl: https://www.urbancompany.com
requiresAuth: true
params:
  - name: massage_type
    required: true
    hint: Type of massage (e.g. "full body", "head & shoulders", "deep tissue", "Swedish", "Ayurvedic")
  - name: duration
    required: false
    hint: Preferred duration (e.g. "60 min", "90 min", "45 min")
  - name: therapist_gender
    required: false
    hint: Therapist gender preference (e.g. "female", "male", "no preference")
  - name: date
    required: false
    hint: Preferred date (e.g. "today", "tomorrow", "Saturday")
  - name: time
    required: false
    hint: Preferred time slot (e.g. "morning", "2 PM", "evening")
---

# Urban Company Spa Massage at Home

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect service details
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **service** (type: "text", required): What service is needed
2. **address** (type: "address", required): Service location. Show saved addresses.
3. **date** (type: "calendar", collapsed, mode: "single"): Preferred date

**CRITICAL**: Do NOT open the browser without knowing the service type and address.
### 1. Gather Requirements
- Confirm what type of massage the user wants. Use `ask_user` to clarify if vague:
  - **Massage types**: Full body, head & shoulders, back & neck, foot reflexology, deep tissue, Swedish, Ayurvedic oil, aromatherapy, couple massage, post-natal.
  - Duration: 45 min, 60 min, 90 min, 120 min.
  - Therapist gender preference: female therapist, male therapist, no preference.
  - Date and time preference.
  - Any health conditions or areas to avoid (important for massage).
- If user says "just a massage" or "relax", default to recommending full body relaxation massage (60 min).

### 2. Open Urban Company & Verify Login
- Open a NEW tab and navigate to `https://www.urbancompany.com`.
- Take snapshot. Verify logged in (profile icon or name visible).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Set location if prompted (user's city/area). Use `ask_user` for address if not set.

### 3. Navigate to Spa & Massage
- Navigate to Spa for Women or Massage for Men category (based on user's requirement).
- Take snapshot of the massage services page.
- Browse available massage packages. Common options:
  - **Stress Relief**: Head, neck, shoulder — 30-45 min
  - **Full Body Relaxation**: Swedish/oil massage — 60-90 min
  - **Deep Tissue**: Intense pressure, muscle knots — 60-90 min
  - **Aromatherapy**: Essential oils, relaxing — 60-90 min
  - **Ayurvedic Abhyanga**: Traditional oil massage — 60-90 min
  - **Post-natal**: Gentle massage for new mothers — 60 min
  - **Couple Spa**: Two therapists, simultaneous — 60-90 min
- Extract options with: package name, description, duration, price, included services, rating.
- Use `ask_user` (input_type "choice") to present top options:
  - "Full Body Relaxation — 60 min — Rs X,XXX — Swedish technique, oil included"
  - "Deep Tissue Massage — 90 min — Rs X,XXX — Targets muscle knots, high pressure"
  - "Aromatherapy Spa — 60 min — Rs X,XXX — Essential oils, calming music"

### 4. Customize & Add to Cart
- Select the chosen package.
- If add-ons available (head massage, foot scrub, face mask), present via `ask_user` (input_type "choice"):
  - "Add Head Massage — +Rs XXX — 15 min"
  - "Add Foot Scrub — +Rs XXX — 15 min"
  - "No add-ons"
- Select therapist gender preference if the option is shown.
- Take snapshot of selected service with details.
- Use `confirm_action` to present service summary:
  - Service: massage type, duration
  - Add-ons: if any
  - Therapist: gender preference
  - Price breakdown: base + add-ons
  - Total amount
- Do NOT proceed unless user confirms.

### 5. Select Date & Time
- Navigate to date/time selection.
- Take snapshot of available slots.
- Choose preferred date from calendar.
- Choose time slot. Present available slots via `ask_user` (input_type "choice"):
  - "Morning: 8 AM, 9 AM, 10 AM, 11 AM"
  - "Afternoon: 12 PM, 1 PM, 2 PM, 3 PM"
  - "Evening: 4 PM, 5 PM, 6 PM, 7 PM"
- If preferred slot unavailable, show nearest alternatives.
- Confirm slot with user.

### 6. Payment & Book
- Verify address is correct for the service visit.
- Use `collect_payment`:
  - summary: JSON with massage type, duration, add-ons, date, time, therapist, total
  - amount_inr: total amount (number)
  - description: "Urban Company spa massage"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Confirm Booking
- Complete payment. Handle OTP via `ask_user` if needed.
- Take snapshot of booking confirmation page.
- Report: booking ID, massage type, duration, date, time slot, therapist assigned (if shown), address, total paid.
- Mention: "Your therapist will arrive at your doorstep with all equipment (massage table, oils, towels). Please ensure a quiet room is available. You can track arrival via the UC app."

## Site Notes

- Urban Company spa services are available in 40+ Indian cities. Female therapists for women, male/female for men.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Therapists bring everything: portable massage table, fresh sheets, oils, towels. User just needs a room.
- UC Safe: all therapists are background-verified, trained, and rated. 4.5+ rating is excellent.
- Tipping: optional, not included in price. Common to tip Rs 100-200 for good service.
- Cancellation policy: free cancellation up to 2-3 hours before appointment. After that, cancellation fee applies.
- Couple massage requires 2 therapists — availability may be limited. Book in advance.
- Peak hours (evenings, weekends) may have surge pricing or limited slots — inform user.
- Women's spa services are more extensive (bridal packages, body polishing, scrubs). Men's options are simpler.
- Payment: online only (UPI, card, wallet). No cash on delivery for services.
- UC Plus membership gives discounts and priority booking — apply if user has membership.
- Use `confirm_action` for service review, `collect_payment` for booking. WAIT for user response.
