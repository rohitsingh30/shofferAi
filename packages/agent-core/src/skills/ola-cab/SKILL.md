---
name: ola-cab
description: Book Ola cab for airport transfer, city ride, or outstation — set pickup/drop, select cab type, confirm and pay.
triggers:
  - ola cab
  - book ola
  - ola ride
  - ola airport transfer
  - ola outstation
  - book cab on ola
  - ola taxi
  - ola rental
  - ola auto
  - ola booking
siteUrl: https://www.olacabs.com
requiresAuth: true
params:
  - name: pickup
    required: true
    hint: Pickup location (e.g. "IGI Airport Terminal 3", "Connaught Place", "home address")
  - name: drop
    required: true
    hint: Drop location (e.g. "Taj Hotel Delhi", "Mumbai Airport", "Bangalore MG Road")
  - name: when
    required: false
    hint: Ride time (e.g. "now", "tomorrow 6 AM", "March 25 at 4 PM"). Default is now.
  - name: cabType
    required: false
    hint: Cab type preference (e.g. "Mini", "Sedan", "Prime", "SUV", "Auto")
---

# Ola Cab Booking

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
- Note cab type preference: Mini, Sedan, Prime Sedan, Prime SUV, Auto, Bike.
- For outstation rides, confirm one-way or round-trip and dates.
- For rental rides, confirm hours needed (e.g. 4 hrs, 8 hrs).
- Default to immediate ride if time not specified.

### 2. Open Ola & Verify Login
- Open a NEW tab and navigate to `https://www.olacabs.com/`.
- Take snapshot. Dismiss any popups (app download, offers, location permission).
- Verify logged in (profile icon or phone number visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- **Note**: Ola web may redirect to the booking page or app download page. Use the web booking interface.

### 3. Set Pickup & Drop
- Click pickup field, type the pickup address, select from autocomplete/suggestions.
- Click drop field, type the drop address, select from autocomplete/suggestions.
- If scheduling for later, set the date and time.
- Take snapshot showing route and options.

### 4. Present Cab Options
- Wait for cab options to load with ETAs and prices.
- Extract available cab types with: category name, ETA, estimated fare, car models.
- Use `ask_user` (input_type "choice") to present options. Format:
  "Ola Prime Sedan — ETA 5 min — Rs X,XXX (est.) — Toyota Etios / Honda City"
  "Ola Mini — ETA 3 min — Rs XXX (est.) — WagonR / Celerio"
- Note surge pricing if active -- warn user.
- If outstation, show package rates (per km, driver allowance, toll extra).

### 5. Review & Confirm Ride
- Use `confirm_action` to present ride summary:
  - Pickup: full address
  - Drop: full address
  - Cab type
  - Estimated distance and time
  - Estimated fare (or fare range)
  - Surge multiplier (if any)
  - Schedule time (if scheduled)
  - Payment mode
  - Inclusions: toll, parking, extra km charges
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Payment
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with pickup, drop, cab type, estimated fare, distance, schedule
  - amount_inr: estimated fare amount (number)
  - description: "Ola cab ride"
- STOP and WAIT for payment confirmation.
- Note: Final fare may differ from estimate based on actual route/time.

### 7. Book & Confirm
- Click "Book" / "Confirm" to book the ride.
- Take snapshot of booking confirmation.
- Report: booking ID, driver name (if assigned), car number, cab type, ETA, pickup/drop, estimated fare.
- For scheduled rides, mention: "Ride scheduled. Driver will be assigned closer to pickup time."
- Mention: "Track ride in real-time on Ola app. Share ride details with trusted contact for safety."

## Site Notes

- Ola is one of India's largest ride-hailing platforms. Available in 250+ cities.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Ola web interface may be limited compared to app -- some features may redirect to app download.
- Surge pricing during peak hours (morning 8-10 AM, evening 5-8 PM, rain) can 1.5x-3x the fare.
- Ola categories: Mini (cheapest), Sedan, Prime Sedan (mid-range), Prime SUV (premium), Auto, Bike.
- Outstation rides have per-km charges + driver allowance + toll. Get exact quote before booking.
- Rental rides: 1 hr/10 km, 2 hr/20 km, 4 hr/40 km, 8 hr/80 km packages available.
- Airport rides may have fixed pricing -- check before booking for transparency.
- Driver assignment may take 1-5 minutes after booking -- wait and report once assigned.
- Cancellation within 5 minutes is usually free. After that, cancellation fee applies.
- If no drivers available, suggest trying a different cab type or waiting a few minutes.
- Safety features: share ride, SOS button, ride OTP -- mention if relevant.
- Use `confirm_action` for ride review, `collect_payment` for payment. WAIT for user response.
