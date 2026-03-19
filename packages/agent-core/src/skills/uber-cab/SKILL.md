---
name: uber-cab
description: Book Uber ride — set pickup/drop, select ride type (Go/Premier/XL), confirm ride, pay.
triggers:
  - uber
  - book uber
  - uber ride
  - uber cab
  - uber go
  - uber premier
  - uber xl
  - uber airport
  - uber taxi
  - book cab on uber
siteUrl: https://www.uber.com
requiresAuth: true
params:
  - name: pickup
    required: true
    hint: Pickup location (e.g. "IGI Airport T3", "Koramangala Bangalore", "home")
  - name: drop
    required: true
    hint: Drop location (e.g. "Electronic City", "Mumbai Airport", "Cyber Hub Gurgaon")
  - name: when
    required: false
    hint: Ride time (e.g. "now", "tomorrow 6 AM", "March 25 at 4 PM"). Default is now.
  - name: rideType
    required: false
    hint: Ride type preference (e.g. "Go", "Go Sedan", "Premier", "UberXL", "Auto", "Moto")
---

# Uber Ride Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect ride details
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **pickup** (type: "address", required): Pickup location. Show saved addresses + current location option.
2. **drop** (type: "address", required): Drop-off location
3. **when** (type: "chip_bar"): Now (default), Schedule for later

**CRITICAL**: Do NOT open the browser without pickup and drop locations.
### 1. Gather Ride Details
- Confirm pickup location and drop location. If any missing, use `ask_user`.
- Ask if ride is now or scheduled (date/time).
- Note ride type preference: UberGo, Go Sedan, Premier, UberXL, Uber Auto, Uber Moto.
- For Uber Intercity, confirm destination city and one-way/round-trip.
- For Uber Rentals, confirm hours needed (1 hr, 2 hr, 4 hr, 8 hr).
- Default to immediate ride if time not specified.

### 2. Open Uber & Verify Login
- Open a NEW tab and navigate to `https://m.uber.com/`.
- Take snapshot. Dismiss any popups (cookie consent, location access, app download).
- Verify logged in (profile icon or name visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Set Pickup & Drop
- Click "Where to?" or the pickup input field.
- Type pickup address, select from autocomplete suggestions.
- Type drop address, select from autocomplete suggestions.
- If scheduling for later, click "Schedule" and set date and time.
- Take snapshot showing the route map and ride options.

### 4. Present Ride Options
- Wait for ride options to load with prices and ETAs.
- Extract available ride types with: name, ETA, estimated fare, capacity, description.
- Use `ask_user` (input_type "choice") to present options. Format:
  "UberGo — ETA 4 min — Rs X,XXX (est.) — Compact, 4 seats"
  "Premier — ETA 7 min — Rs X,XXX (est.) — Premium sedan, 4 seats"
  "UberXL — ETA 10 min — Rs X,XXX (est.) — SUV, 6 seats"
- Warn about surge pricing if active (shown as "Prices are higher due to demand").
- If Uber Green available, mention it as eco-friendly option.

### 5. Review & Confirm Ride
- Use `confirm_action` to present ride summary:
  - Pickup: full address
  - Drop: full address
  - Ride type
  - Estimated distance and duration
  - Estimated fare (or fare range showing min-max)
  - Surge pricing indicator (if any)
  - Schedule time (if scheduled)
  - Payment method
  - Note: toll charges, airport surcharge may be extra
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Payment
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with pickup, drop, ride type, estimated fare, distance, schedule
  - amount_inr: estimated fare amount (number)
  - description: "Uber ride"
- STOP and WAIT for payment confirmation.
- Note: Final fare is calculated based on actual route, time, and distance.

### 7. Book & Confirm
- Click "Confirm" / "Request" to book the ride.
- Take snapshot of ride confirmation screen.
- Wait for driver assignment (may take 1-5 minutes).
- Report: ride type, driver name, car model, license plate, OTP/PIN (if shown), ETA, pickup/drop, estimated fare.
- For scheduled rides, mention: "Ride scheduled. You'll be notified when driver is assigned."
- Mention: "Share trip with trusted contacts for safety. Track ride in real-time."

## Site Notes

- Uber is the global ride-hailing leader. Available in 100+ Indian cities.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Uber web (m.uber.com) is the mobile web interface -- works well on desktop too.
- Surge pricing ("Prices are higher due to demand") can 1.5x-3x the fare. Always warn user.
- Uber ride types in India: Auto, Moto, UberGo (hatchback), Go Sedan, Premier (sedan), UberXL (SUV).
- Uber Go is the most affordable car option. Premier for comfort. XL for groups.
- Upfront pricing: Uber shows the fare before booking. Final fare may differ for route changes.
- Uber Intercity: fixed-price rides between cities. Better value than outstation taxi for some routes.
- Uber Rentals: hourly packages for multiple stops. Good for city tours or errands.
- Airport rides often have surcharge (Rs 80-100) -- include in fare estimate.
- PIN/OTP verification is required in some cities -- share the PIN shown on screen with driver.
- Cancellation within 5 minutes is free. After that, cancellation fee (Rs 50-100) applies.
- If no drivers available, suggest waiting 2-3 minutes or trying a different ride type.
- Use `confirm_action` for ride review, `collect_payment` for payment. WAIT for user response.
