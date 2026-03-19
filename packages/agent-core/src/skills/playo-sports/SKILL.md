---
name: playo-sports
description: Book sports venues (badminton, cricket, football turfs) on Playo — search venues, pick time slot, pay.
triggers:
  - playo
  - book badminton court
  - book cricket turf
  - book football turf
  - playo booking
  - sports venue booking
  - book sports ground
  - playo badminton
  - playo cricket
  - book turf near me
siteUrl: https://playo.co
requiresAuth: true
params:
  - name: sport
    required: true
    hint: Sport type (e.g. "badminton", "cricket", "football", "tennis", "swimming")
  - name: city
    required: false
    hint: City (e.g. "Bangalore", "Hyderabad", "Chennai", "Mumbai")
  - name: date
    required: false
    hint: Preferred date (e.g. "today", "tomorrow", "Saturday", "March 25")
  - name: time
    required: false
    hint: Preferred time slot (e.g. "morning", "evening", "6pm-7pm")
  - name: area
    required: false
    hint: Locality or area (e.g. "Koramangala", "Indiranagar", "HSR Layout")
---

# Playo Sports Venue Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine: sport type, city, preferred area/locality, date, time slot, number of players/courts.
- If user is vague (e.g. "book a court"), ask which sport and location.
- Use `ask_user` for missing info: "Which sport? Badminton, cricket, football, tennis?"
- Ask about date and time preference if not provided.
- Ask about any preferences: indoor vs outdoor, synthetic vs natural turf, budget range.

### 2. Open Playo & Verify Login
- Open a NEW tab and navigate to `https://playo.co`.
- Take snapshot. Verify logged in (check for profile icon or user avatar in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Set city/location if prompted or if it differs from user request.

### 3. Search for Venues
- Navigate to venue search or use the sport-specific booking section.
- Set sport type, city, area, and date filters.
- Take snapshot. Extract top 5 venues with: venue name, area, sport facilities, rating, distance, price per hour.
- If user specified an area, prioritize venues in that locality.
- Use `ask_user` (input_type "choice"):
  "Venue Name — Area — Rating — ₹price/hr — Facilities (indoor/outdoor, courts available)"

### 4. Select Time Slot
- Click selected venue. Take snapshot of venue detail and available time slots.
- Show available slots for the requested date. Slots are typically 1-hour blocks.
- Present via `ask_user` (input_type "choice"):
  "6:00 AM - 7:00 AM — ₹600", "7:00 AM - 8:00 AM — ₹800 (Peak)", etc.
- If no slots available on requested date, suggest next available date.
- Select the chosen time slot.

### 5. Select Court / Turf
- If venue has multiple courts or turfs, present options via `ask_user` (input_type "choice"):
  "Court 1 — Indoor AC — ₹800/hr", "Court 2 — Outdoor — ₹500/hr"
- If only one court available, proceed directly.
- Take snapshot showing selected court and slot.

### 6. Review & Confirm
- Proceed to booking summary. Take snapshot.
- Use `confirm_action`:
  - Venue name and full address
  - Sport type
  - Court/turf name and type (indoor/outdoor)
  - Date and time slot
  - Duration
  - Price per hour, total amount
  - Cancellation policy
- Do NOT proceed unless user confirms.

### 7. Payment
- Use `collect_payment`:
  - summary: JSON with venue, sport, court, date, time, duration, total
  - amount_inr: total amount
  - description: "Playo sports venue booking"
- WAIT for payment confirmation.

### 8. Complete & Confirm
- Complete payment on Playo. Handle OTP via `ask_user` if needed.
- Take snapshot of booking confirmation page.
- Report: booking ID, venue name and address, sport, court, date, time slot, duration, total paid.
- Remind: "Carry your own equipment (rackets, shoes). Arrive 10 minutes early. Show booking confirmation at reception."
- Share venue address with landmark for navigation.

## Site Notes

- Playo is India's largest sports venue booking platform — badminton, cricket, football, tennis, swimming across major cities.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Session may expire after 30 days — if login wall appears, ask user to re-login manually in Chrome Debug.
- Peak hours (6-9 AM, 6-10 PM) are 20-50% more expensive and fill up fast — book 1-2 days ahead.
- Off-peak slots (10 AM - 4 PM weekdays) are cheapest — suggest if user is flexible.
- Playo credits/wallet may have balance — check and apply before payment.
- Cancellation: free if done 6+ hours before slot; late cancellation may forfeit 50% of booking amount.
- Some venues require advance full payment, others allow pay-at-venue — confirm during checkout.
- Playo also has "Play" feature for joining pickup games — this skill is for venue booking only.
- Use `confirm_action` for review, `collect_payment` for checkout. WAIT for user response at each step.
