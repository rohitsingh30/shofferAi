---
name: hudle-sports
description: Book sports facilities on Hudle — courts, turfs, swimming pools. Search venues, pick time slot, pay.
triggers:
  - hudle
  - hudle booking
  - book sports court hudle
  - hudle badminton
  - hudle football turf
  - book turf hudle
  - hudle cricket
  - hudle tennis court
  - hudle swimming
  - sports facility hudle
siteUrl: https://hudle.in
requiresAuth: true
params:
  - name: sport
    required: true
    hint: Sport type (e.g. "badminton", "cricket", "football", "tennis", "swimming", "table tennis")
  - name: city
    required: false
    hint: City (e.g. "Delhi", "Gurgaon", "Noida", "Bangalore", "Mumbai")
  - name: date
    required: false
    hint: Preferred date (e.g. "today", "tomorrow", "this Saturday")
  - name: time
    required: false
    hint: Preferred time slot (e.g. "morning", "evening", "7pm")
  - name: locality
    required: false
    hint: Area or locality (e.g. "Dwarka", "Saket", "Vasant Kunj", "Sector 29")
---

# Hudle Sports Facility Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine: sport type, city, preferred locality, date, time slot.
- If user says "book a court", clarify sport type and location.
- Use `ask_user` for missing info: "Which sport? Badminton, football, cricket, tennis, swimming?"
- Ask about date and time if not provided.
- Ask about preferences: indoor vs outdoor, group size, budget.

### 2. Open Hudle & Verify Login
- Open a NEW tab and navigate to `https://hudle.in`.
- Take snapshot. Verify logged in (check for profile icon or user name in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Set city or location if needed.

### 3. Search for Venues
- Use the search or browse section to find venues by sport type and location.
- Apply filters: sport, city, locality, date.
- Take snapshot. Extract top 5 venues: venue name, locality, sport options, rating, price range, distance.
- If user specified a locality, prioritize venues there.
- Use `ask_user` (input_type "choice"):
  "Venue Name — Locality — Rating — ₹price/hr — Indoor/Outdoor — Distance"

### 4. Select Date & Time Slot
- Click selected venue. Take snapshot of venue details and slot availability.
- Show available time slots for the chosen date. Hudle shows hourly slots with pricing.
- Present via `ask_user` (input_type "choice"):
  "6:00 AM - 7:00 AM — ₹500", "7:00 AM - 8:00 AM — ₹700 (Peak)"
- If preferred date has no slots, suggest next available date.
- Select the chosen slot.

### 5. Select Court / Facility
- If venue has multiple courts or facilities, present options via `ask_user` (input_type "choice").
- Show court type (wooden, synthetic, grass), condition, and pricing differences.
- If only one facility available, proceed directly.
- Take snapshot of selected facility and slot.

### 6. Review & Confirm
- Proceed to booking summary. Take snapshot.
- Use `confirm_action`:
  - Venue name and full address with landmark
  - Sport type and facility (court/turf/pool)
  - Court/facility name and type
  - Date and time slot
  - Duration
  - Price breakdown: base price, GST, platform fee, total
  - Cancellation policy
- Do NOT proceed unless user confirms.

### 7. Payment
- Use `collect_payment`:
  - summary: JSON with venue, sport, facility, date, time, duration, total
  - amount_inr: total amount
  - description: "Hudle sports facility booking"
- WAIT for payment confirmation.

### 8. Complete & Confirm
- Complete payment on Hudle. Handle OTP via `ask_user` if needed.
- Take snapshot of booking confirmation page.
- Report: booking ID, venue name and address, sport, facility, date, time slot, duration, total paid.
- Remind: "Carry your own equipment. Arrive 10 minutes early. Show booking confirmation at venue reception."
- Share venue address with Google Maps link if available.

## Site Notes

- Hudle is a popular sports facility booking platform in India, strong presence in Delhi NCR, Bangalore, Mumbai.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Session may expire after 30 days — if login wall appears, ask user to re-login manually in Chrome Debug.
- Peak hours (6-9 AM, 6-10 PM) are priced 30-50% higher than off-peak hours.
- Hudle offers "Hudle Pass" subscription for regular players — check if user has an active pass.
- Cancellation: typically free if done 4-6 hours before slot; late cancellation may forfeit full amount.
- Some venues accept partial payment online, rest at venue — clarify during checkout.
- Venues in Delhi NCR have highest availability; other cities may have limited listings.
- GST (18%) and platform fee (₹20-50) are added at checkout — always show total inclusive price to user.
- Use `confirm_action` for review, `collect_payment` for checkout. WAIT for user response at each step.
