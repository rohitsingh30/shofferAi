---
name: redbus-bus
description: Book bus tickets on RedBus — search routes, compare operators/seat types, pick seats, book and pay.
triggers:
  - redbus
  - book bus
  - bus ticket
  - redbus booking
  - book bus ticket
  - bus to
  - redbus bus
  - bus travel
  - volvo bus
  - sleeper bus
siteUrl: https://www.redbus.in
requiresAuth: true
params:
  - name: from
    required: true
    hint: Departure city (e.g. "Bangalore", "Delhi", "Hyderabad")
  - name: to
    required: true
    hint: Arrival city (e.g. "Chennai", "Goa", "Mumbai")
  - name: date
    required: true
    hint: Travel date (e.g. "March 25", "tonight", "next Friday")
  - name: busType
    required: false
    hint: Bus type preference (e.g. "AC Sleeper", "Volvo", "Non-AC Seater", "Multi-axle")
  - name: passengers
    required: false
    hint: Number of passengers (default 1)
---

# RedBus Bus Ticket Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### Step 0: Collect bus journey details
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **from** (type: "text", required): Departure city
2. **to** (type: "text", required): Arrival city
3. **date** (type: "calendar", required, mode: "single"): Journey date

**CRITICAL**: Do NOT open the browser without from, to, and date.

### 1. Gather Travel Details
- Confirm from city, to city, travel date. If any missing, use `ask_user`.
- Note bus type preference (AC/Non-AC, Sleeper/Seater, Volvo/Multi-axle).
- Note number of passengers, boarding point preference, time preference (morning/evening/night).
- Convert relative dates to actual dates.
- Default to 1 passenger if not specified.

### 2. Open RedBus & Verify Login
- Open a NEW tab and navigate to `https://www.redbus.in`.
- Take snapshot. Dismiss any popups (app install, offers, login prompts).
- Verify logged in (profile icon or name in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search Buses
- Click "From" field, type departure city, select from autocomplete.
- Click "To" field, type arrival city, select from autocomplete.
- Set travel date using date picker.
- Click "Search Buses" button.
- Take snapshot of bus list results.

### 4. Filter & Present Options
- Apply filters: bus type (AC Sleeper, Volvo, etc.), departure time, rating 3.5+, price range.
- Sort by "Departure Time", "Price", "Rating", or "Duration" based on user preference.
- Extract top 4-5 buses with: operator name, bus type, departure time, arrival time, duration, rating, price, available seats.
- Note amenities: WiFi, charging point, blanket, water bottle, live tracking.
- Use `ask_user` (input_type "choice") to present options. Format:
  "SRS Travels — Volvo AC Sleeper — Dep 10:30 PM, Arr 6:30 AM (8h) — Rating 4.2 — Rs X,XXX — 15 seats"
- Add "Show more results" as last option.

### 5. Select Seats
- Click selected bus. Take snapshot of seat layout.
- Show seat availability map: upper deck / lower deck, window/aisle.
- Ask user for seat preference via `ask_user` (input_type "choice"):
  - "Lower berth window — Rs X,XXX"
  - "Upper berth aisle — Rs X,XXX"
- For multiple passengers, select adjacent seats when possible.
- Note boarding and dropping points.

### 6. Select Boarding & Dropping Points
- Present available boarding points via `ask_user` (input_type "choice").
- Present available dropping points via `ask_user` (input_type "choice").
- Confirm timing for selected boarding point.

### 7. Review Booking
- Proceed to review page. Take snapshot.
- Use `confirm_action` to present booking summary:
  - Operator name, bus type
  - From/To cities
  - Departure/Arrival date and time
  - Duration
  - Boarding point (name, address, time)
  - Dropping point (name, address, time)
  - Seat number(s)
  - Price breakdown: base fare, GST, service fee
  - Total amount
  - Cancellation policy
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 8. Fill Details & Payment
- Fill passenger details: name, age, gender, contact email, phone.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with operator, bus type, route, date, seats, boarding/dropping, total
  - amount_inr: total amount (number)
  - description: "RedBus bus ticket"
- STOP and WAIT for payment confirmation.

### 9. Complete Booking & Confirm
- Complete payment on RedBus (UPI/card/netbanking/RedBus wallet).
- Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: ticket ID, operator, bus type, route, date, departure/arrival times, seat numbers, boarding point with address and time, total paid.
- Mention: "Carry valid photo ID. Track bus live on RedBus app. Reach boarding point 15 min early."

## Site Notes

- RedBus is India's largest online bus ticketing platform. Covers all major routes.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- RedBus shows app-install popups and offer banners -- dismiss all immediately.
- Seat prices vary: lower berths cost more than upper, window more than aisle on some operators.
- "RedBus Prime" operators have higher quality and verified amenities -- prefer if user wants comfort.
- Women-only seats are marked pink -- relevant if booking for solo female traveller.
- Cancellation policy varies by operator -- some allow free cancellation up to 6 hours before departure.
- Live tracking is available for most buses -- mention this feature.
- Night buses (10 PM - 6 AM) are most popular for intercity travel -- check availability first.
- Boarding points can be confusing -- always provide full address and landmark.
- GST (5%) on bus tickets is mandatory -- include in total.
- Use `confirm_action` for booking review, `collect_payment` for payment. WAIT for user response.
