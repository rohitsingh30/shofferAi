---
name: driveu-driver
description: Hire a driver on DriveU — hourly, one-way, round-trip, outstation, airport transfer.
triggers:
  - driveu
  - hire driver
  - book a driver
  - need a driver
  - driver for car
  - outstation driver
  - airport driver
  - hourly driver
  - temporary driver
  - chauffeur
siteUrl: https://www.driveu.in
requiresAuth: true
params:
  - name: trip_type
    required: true
    hint: Type of trip (e.g. "hourly", "one-way", "round trip", "outstation", "airport transfer")
  - name: pickup_location
    required: true
    hint: Pickup address or area (e.g. "Koramangala, Bangalore", "home")
  - name: drop_location
    required: false
    hint: Drop address for one-way trips (e.g. "Bangalore Airport", "Mysore")
  - name: date
    required: false
    hint: When you need the driver (e.g. "today 3 PM", "tomorrow morning", "next Saturday")
---

# DriveU Driver Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm the trip type and details:
  - **Hourly**: need driver for X hours within city (shopping, errands, hospital visits)
  - **One-way**: pickup to drop within city (airport, railway station, office)
  - **Round trip**: go and return same day
  - **Outstation**: intercity travel (Bangalore to Mysore, Delhi to Agra, etc.)
  - **Airport transfer**: to/from airport with flight details
- Get pickup location and drop location (if applicable).
- Get preferred date, time, and estimated duration for hourly bookings.
- If vague, use `ask_user` to clarify trip type and locations.
- Ask if user has car type preference requirement (hatchback, sedan, SUV driver experience).

### 2. Open DriveU in a NEW Tab
- Open a NEW tab and navigate to `https://www.driveu.in`.
- Take snapshot. Set city if prompted (Bangalore, Mumbai, Delhi, Hyderabad, Chennai, Pune).
- Verify logged in (profile or phone number visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Select Trip Type & Enter Details
- Select the correct trip type on the homepage/booking form.
- Enter pickup location and drop location.
- Select date and time.
- For outstation: enter destination city, dates (start and return).
- For hourly: enter estimated hours.
- Take snapshot of the booking form filled.

### 4. Choose Driver & Review Options
- Submit the booking form.
- Take snapshot of available drivers or fare estimate.
- Extract fare details: base fare, per km rate, per hour rate, total estimate.
- If multiple driver options available, present via `ask_user` (input_type "choice"):
  - "Driver Name — Rating ⭐ — X trips — ₹XXX estimated"
- Show fare breakdown to user.
- For outstation, show per-day rate and inclusions (fuel, tolls, parking).

### 5. Confirm Booking Details
- Use `confirm_action` to present booking summary:
  - Trip type (hourly/one-way/round-trip/outstation)
  - Pickup location and time
  - Drop location (if applicable)
  - Selected driver (if chosen)
  - Fare estimate with breakdown
  - Cancellation policy
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Payment
- Proceed to payment.
- Use `collect_payment`:
  - summary: JSON with trip type, pickup, drop, date, fare
  - amount_inr: estimated total (or advance amount if partial)
  - description: "DriveU driver booking"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Booking Confirmation
- Complete payment. Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: booking ID, driver name & phone (if assigned), pickup location & time, drop location, estimated fare, car requirements.
- Mention: "Driver will arrive at your pickup location. Track live on DriveU app. Call driver directly if needed."

## Site Notes

- DriveU is India's largest driver-on-demand platform. Available in 20+ cities.
- Chrome Profile 3 (rsinghtomar3011@gmail.com) must be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Hourly bookings: minimum 4 hours in most cities. Clarify with user.
- Outstation: driver bata (daily allowance) is usually included. Fuel at user's expense.
- Airport transfers: most popular use case. Confirm terminal number and flight time.
- Drivers are verified with background checks, DL verification, and training.
- Ratings: 4.5+ drivers are excellent. DriveU maintains a 4.0+ minimum.
- Payment: online (UPI, card) or cash. Advance booking requires online payment.
- Cancellation: free up to 1 hour before scheduled time. After that, cancellation fee applies.
- Night charges may apply (10 PM - 6 AM). Inform user if applicable.
- For long trips, driver needs rest breaks — factor this into time estimates.
- Use `confirm_action` for booking review, `collect_payment` for payment. WAIT for user response at each step.
