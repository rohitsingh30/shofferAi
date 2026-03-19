---
name: goibibo-bus
description: Book bus tickets on Goibibo — search routes, filter by bus type, select seats, compare operators, book and pay.
triggers:
  - goibibo bus
  - book bus on goibibo
  - goibibo bus booking
  - goibibo bus ticket
  - bus on goibibo
  - goibibo volvo bus
  - goibibo sleeper bus
  - bus ticket goibibo
siteUrl: https://www.goibibo.com
requiresAuth: true
params:
  - name: from
    required: true
    hint: Departure city (e.g. "Bangalore", "Delhi", "Hyderabad", "Mumbai")
  - name: to
    required: true
    hint: Arrival city (e.g. "Chennai", "Goa", "Pune", "Manali")
  - name: date
    required: true
    hint: Travel date (e.g. "March 25", "tonight", "next Friday", "2026-04-10")
  - name: busType
    required: false
    hint: Bus type preference (e.g. "AC Sleeper", "Volvo", "Non-AC Seater", "Multi-axle")
  - name: passengers
    required: false
    hint: Number of passengers (default 1)
  - name: departureTime
    required: false
    hint: Preferred departure time window (e.g. "night", "morning", "after 8 PM")
---

# Goibibo Bus Ticket Booking

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
- Note bus type preference: AC/Non-AC, Sleeper/Seater, Volvo/Multi-axle.
- Note number of passengers, departure time preference (morning/afternoon/night).
- Ask about boarding point preference if user has one.
- Convert relative dates to actual dates.
- Default to 1 passenger if not specified.

### 2. Open Goibibo Buses & Verify Login
- Open a NEW tab and navigate to `https://www.goibibo.com/bus/`.
- Take snapshot. Dismiss any popups (app install, offers, login prompts, cookie banners).
- Verify logged in (profile name or icon in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search Buses
- Click "From" field, type departure city, select from autocomplete.
- Click "To" field, type arrival city, select from autocomplete.
- Set travel date using date picker.
- Click "Search Buses" button.
- Take snapshot of bus list results.

### 4. Filter & Present Options
- Apply filters: bus type (AC Sleeper, Volvo AC, Non-AC Seater, etc.), departure time window, operator rating (3.5+), price range.
- Sort by "Departure Time", "Price", "Rating", or "Duration" based on user preference.
- Extract top 4-5 buses with: operator name, bus type, departure time, arrival time, duration, rating, price per seat, available seats.
- Note amenities: WiFi, charging, blanket, water, live tracking, emergency contact.
- Check for goCash offers and bank discounts.
- Use `ask_user` (input_type "choice") to present options. Format:
  "VRL Travels — Volvo AC Sleeper — Dep 10:00 PM, Arr 6:30 AM (8h 30m) — Rating 4.3 — Rs X,XXX — 18 seats"
- Add "Show more results" as last option.

### 5. Select Seats
- Click selected bus. Take snapshot of seat layout.
- Show seat map: lower deck / upper deck (for sleeper), window/aisle.
- Present available seats via `ask_user` (input_type "choice"):
  - "Lower berth L3 (window) — Rs X,XXX"
  - "Upper berth U5 (aisle) — Rs XXX"
- For multiple passengers, try to select adjacent/nearby seats.
- Note price differences between lower/upper and window/aisle.

### 6. Select Boarding & Dropping Points
- Present available boarding points via `ask_user` (input_type "choice"). Include time and location.
- Present available dropping points via `ask_user` (input_type "choice"). Include time and location.
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
  - Price breakdown: base fare, GST, service fee, goCash discount
  - Total amount
  - Cancellation policy
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 8. Fill Details & Payment
- Fill passenger details: name, age, gender, contact email, phone.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with operator, bus type, route, date, seats, boarding/dropping, price breakdown, total
  - amount_inr: total amount (number)
  - description: "Goibibo bus ticket"
- STOP and WAIT for payment confirmation.

### 9. Complete Booking & Confirm
- Complete payment on Goibibo (UPI/card/netbanking/goCash).
- Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: ticket ID, operator, bus type, route, date, departure/arrival times, seat numbers, boarding point with address and time, total paid.
- Mention: "Carry valid photo ID. Reach boarding point 15 minutes early. Track bus live on Goibibo app."

## Site Notes

- Goibibo (part of MakeMyTrip group) offers extensive bus booking with goCash rewards integration.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Goibibo shows app-install popups and promotional banners -- dismiss all immediately.
- goCash+ rewards can be applied at bus checkout for instant discount -- check balance and mention.
- Bank offers (HDFC, ICICI, SBI, Axis) provide 5-10% off -- always check the offers section.
- Seat prices vary: lower berths cost more than upper, window seats may have premium on some operators.
- GST (5%) on bus tickets is mandatory -- include in total.
- Night buses (9 PM - 7 AM) are most popular for intercity travel -- check availability first.
- Boarding points can have multiple locations in a city -- always provide full address and landmark.
- Goibibo shows "Top Rated" and "Goibibo Assured" operators -- prefer these for reliability.
- Live tracking is available for most buses after departure -- mention this feature.
- Session can expire on idle -- if redirected to login, stop and inform user.
- Use `confirm_action` for booking review, `collect_payment` for payment. WAIT for user response.
