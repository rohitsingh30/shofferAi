---
name: thrillophilia-activity
description: Book adventure activities and tours on Thrillophilia — trekking, scuba diving, paragliding, bungee jumping, and more.
triggers:
  - thrillophilia
  - thrillophilia activity
  - adventure activity
  - book trek
  - book scuba
  - book paragliding
  - thrillophilia tour
  - adventure booking thrillophilia
siteUrl: https://www.thrillophilia.com
requiresAuth: true
params:
  - name: activity
    required: true
    hint: Activity or tour type (e.g. "paragliding in Bir Billing", "scuba diving in Goa", "Kedarkantha trek")
  - name: destination
    required: false
    hint: Destination (e.g. "Rishikesh", "Manali", "Andaman", "Goa")
  - name: date
    required: true
    hint: Preferred date or date range (e.g. "March 25", "next weekend", "April first week")
  - name: participants
    required: false
    hint: Number of participants (default 1)
  - name: budget
    required: false
    hint: Budget per person (e.g. "under 5000", "below 10000")
---

# Thrillophilia Activity/Tour Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Activity Details
- Confirm activity type and destination. If any missing, use `ask_user`.
- Ask for preferred date or date range.
- Note number of participants and any specific requirements (beginner-friendly, certified instructor, equipment provided).
- Ask about budget range per person.
- For treks, ask about fitness level and duration preference (1-day, weekend, multi-day).
- Convert relative dates to actual dates.

### 2. Open Thrillophilia & Verify Login
- Open a NEW tab and navigate to `https://www.thrillophilia.com`.
- Take snapshot. Close any promotional popups or app-install banners.
- Verify logged in (profile name or icon visible in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search Activities
- Use search bar to search for the activity or destination.
- Alternatively, navigate via category: Water Sports, Trekking, Adventure, Tours, etc.
- Apply location filter if destination specified.
- Take snapshot of search results.

### 4. Filter & Present Options
- Apply filters: price range, duration, rating, activity type.
- Sort by: "Popularity", "Price Low to High", or "Rating".
- Extract top 4-5 activities with: name, operator/host, duration, rating, reviews count, price/person, inclusions summary.
- Check for Thrillophilia deals or group discounts.
- Use `ask_user` (input_type "choice") to present options. Format:
  "Bir Billing Paragliding (Tandem) — 15-20 min flight — ⭐ 4.7 (2,300 reviews) — ₹X,XXX/person — Includes: instructor, equipment, video"
- Add "Show more options" as last option.

### 5. View Activity Details
- Click selected activity. Take snapshot of detail page.
- Extract detailed information: full description, itinerary (if multi-day), inclusions, exclusions, meeting point, start time, things to carry, age/weight restrictions, cancellation policy.
- Present key details to user and confirm they are comfortable with the requirements.
- For treks: highlight difficulty level, altitude, total distance, camping details.
- Use `ask_user` to confirm the activity is suitable.

### 6. Select Date & Participants
- Check available dates on the calendar.
- If preferred date is not available, suggest nearest available dates.
- Set number of participants.
- Select any add-ons (GoPro video, photos, transport, meals) if available.
- Use `ask_user` (input_type "choice") to present add-on options if relevant.

### 7. Review Booking
- Proceed to review page. Take snapshot.
- Use `confirm_action` to present booking summary:
  - Activity name and operator
  - Destination / Meeting point
  - Date and time
  - Duration
  - Number of participants
  - Inclusions (instructor, equipment, meals, transport, photos/video)
  - Exclusions (anything not covered)
  - Things to carry / wear
  - Price breakdown: base price x participants, add-ons, GST, convenience fee, total
  - Cancellation/refund policy
  - Age/weight restrictions if any
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 8. Fill Participant Details & Payment
- Fill participant details: name, age, gender, contact number, email, emergency contact.
- For adventure activities, add any medical conditions or allergies if prompted.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with activity, destination, date, participants, inclusions, total
  - amount_inr: total amount (number)
  - description: "Thrillophilia activity booking"
- STOP and WAIT for payment confirmation.

### 9. Complete Booking & Confirm
- Complete payment on Thrillophilia (UPI/card/netbanking/wallet).
- Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: booking ID, activity name, operator, destination, date, time, meeting point, participants, total paid.
- Mention: "Save booking confirmation. Arrive at meeting point 15-30 minutes early. Carry ID proof and wear appropriate clothing/shoes."

## Site Notes

- Thrillophilia is India's largest adventure activities and tours marketplace with 15,000+ experiences.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Activities are operated by third-party vendors — Thrillophilia is the marketplace. Quality varies by operator.
- Always check reviews and ratings before recommending — prefer 4.0+ rated activities with 100+ reviews.
- Popular adventure destinations: Rishikesh (rafting, bungee), Manali (paragliding, skiing), Goa (scuba, water sports), Bir Billing (paragliding), Meghalaya (caving, canyoning).
- Cancellation policies vary: some offer full refund 48h before, others are non-refundable for last-minute bookings.
- Seasonal availability matters — paragliding in Bir Billing is best Oct-Jun, rafting in Rishikesh Sept-June, scuba in Andaman Oct-May.
- Group discounts (10-20% off) are common for 4+ participants — check and apply.
- For multi-day treks, Thrillophilia arranges transport, camping, food, and guides — all included in price.
- Weather can affect adventure activities — operators may reschedule. Inform user about weather dependency.
- Session can expire if idle — if redirected to login, stop and inform user.
- Use `confirm_action` for booking review, `collect_payment` for checkout. WAIT for user response.
