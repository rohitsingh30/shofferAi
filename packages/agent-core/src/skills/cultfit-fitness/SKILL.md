---
name: cultfit-fitness
description: Book gym session, yoga class, or fitness class on cult.fit — select center, class type, time slot, book.
triggers:
  - cult fit
  - cultfit
  - cult.fit
  - book gym class
  - book yoga class
  - fitness class booking
  - cult fit booking
  - gym session cult
  - cult fit yoga
siteUrl: https://www.cult.fit
requiresAuth: true
params:
  - name: classType
    required: true
    hint: Type of class (e.g. "yoga", "gym", "dance", "boxing", "HRX workout", "S&C", "cycling")
  - name: city
    required: false
    hint: City (e.g. "Bangalore", "Delhi", "Mumbai", "Hyderabad")
  - name: preferredTime
    required: false
    hint: Preferred time (e.g. "morning", "evening", "7am", "6pm")
  - name: date
    required: false
    hint: Date for the class (e.g. "today", "tomorrow", "March 20")
---

# cult.fit Fitness Class Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Understand Requirements
- Determine: class type (yoga/gym/dance/boxing/cycling/S&C), city, preferred center, date, time.
- If user is vague (e.g. "book a workout"), ask about class type preference.
- Use `ask_user` for missing info: "What type of class? Yoga, gym workout, dance, boxing, or cycling?"
- Ask about date and time preference if not provided.

### 2. Open cult.fit & Verify Login
- Open a NEW tab and navigate to `https://www.cult.fit`.
- Take snapshot. Verify logged in (check for profile icon or name).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Set city/location if prompted.

### 3. Browse Available Classes
- Navigate to the fitness section or class schedule.
- Filter by: class type, date, time of day (morning/afternoon/evening), center/location.
- Take snapshot of available classes.
- Extract top 5 options: class name, instructor name, center name and area, date, time, duration, spots left.
- If user has a preferred center, prioritize that.
- Use `ask_user` (input_type "choice"):
  "Class Name — Instructor — Center (Area) — Date Time — Duration — X spots left"

### 4. Select Class & Time
- Click selected class. Take snapshot of class details.
- Show class details: description, intensity level, what to bring, instructor profile.
- If selected slot is full, suggest next available slot at same center or nearby center.
- Use `ask_user` to confirm the selection if alternatives were shown.

### 5. Review & Confirm
- Use `confirm_action`:
  - Class name and type
  - Instructor name
  - Center name and full address
  - Date and time
  - Duration
  - Pack/membership status (trial, pay-per-session, or membership)
  - Price (if pay-per-session)
  - Cancellation policy
- Do NOT proceed unless user confirms.

### 6. Payment & Book
- If user has an active cult.fit membership/pack, booking may be free — just confirm.
- If pay-per-session or trial:
  - Use `collect_payment`:
    - summary: JSON with class, instructor, center, date, time, price
    - amount_inr: class fee
    - description: "cult.fit class booking"
  - WAIT for payment confirmation.
- If membership required, inform user about pack options and pricing.

### 7. Confirm Booking
- Complete the booking on cult.fit. Handle OTP via `ask_user` if needed.
- Take snapshot of booking confirmation.
- Report: booking ID, class name, instructor, center address, date, time, duration.
- Remind: "Arrive 10 minutes early. Carry water bottle, towel, and gym shoes."
- Mention: "You can cancel up to 2 hours before the class for a full refund to your pack."
- Share center address with landmark for navigation.

## Site Notes

- cult.fit is India's largest fitness platform — gyms, yoga, dance, and more across major cities.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Session may expire after 30 days — if login wall appears, ask user to re-login manually in Chrome Debug.
- cult.fit Elite membership: unlimited gym + group classes. cult.fit Pro: limited sessions per month.
- Trial classes available for new users — usually free or ₹99.
- Pay-per-session: ₹199-599 depending on class type and city.
- Popular classes fill up fast — morning 6-8am and evening 6-8pm slots book out 1-2 days in advance.
- Centers in Bangalore, Delhi NCR, Mumbai, Hyderabad, Chennai, Kolkata, Pune, Jaipur.
- Cancellation: free if done 2+ hours before class; late cancellation forfeits the session.
- cult.fit app is recommended for live tracking, but booking works on web too.
- Use `confirm_action` for review, `collect_payment` for pay-per-session. WAIT for user response.
