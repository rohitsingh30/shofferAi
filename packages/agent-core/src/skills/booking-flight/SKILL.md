---
name: booking-flight
description: Search and book flights on Booking.com — compare airlines, prices, layovers, select flight, fill passenger details, and pay.
triggers:
  - booking.com flight
  - book flight booking.com
  - booking flight
  - flight on booking.com
  - booking.com air ticket
  - cheap flight booking
  - booking.com plane ticket
  - flight booking.com search
  - international flight booking
  - booking.com flights
siteUrl: https://www.booking.com/flights
requiresAuth: true
params:
  - name: from
    required: true
    hint: Departure city or airport (e.g. "Delhi", "BOM", "London Heathrow")
  - name: to
    required: true
    hint: Arrival city or airport (e.g. "Goa", "Paris CDG", "New York JFK")
  - name: date
    required: true
    hint: Departure date (e.g. "March 25", "next Friday", "2026-04-10")
  - name: returnDate
    required: false
    hint: Return date for round-trip (omit for one-way)
  - name: passengers
    required: false
    hint: Number of passengers (default 1 adult). Format: "2 adults, 1 child"
  - name: class
    required: false
    hint: Cabin class (Economy, Premium Economy, Business, First). Default Economy.
---

# Booking.com Flight Booking

Today's date: use JavaScript `new Date().toISOString().split('T')[0]` to resolve "tomorrow", "this weekend", etc.
Chrome profile: rsinghtomar3011@gmail.com (Genius Level 1 member — may get flight discounts).

## Steps

### Step 0: Collect travel details
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **from** (type: "text", required): Departure city/airport
2. **to** (type: "text", required): Arrival city/airport
3. **dates** (type: "calendar", required, mode: "range"): Travel dates with shortcuts (Today, Tomorrow, This weekend). Show "One-way only" option.
4. **passengers** (type: "stepper", required): Counters for Adults (default 1), Children, Infants
5. **class** (type: "chip_bar", collapsed): Economy, Business, First Class

**CRITICAL**: Do NOT open the browser without from, to, and date. These are mandatory search fields.

### 1. Gather Travel Details
- Confirm from city/airport, to city/airport, departure date. Use `ask_user` if any required param is missing.
- Ask if one-way or round-trip. If round-trip, confirm return date.
- Note passenger count (adults, children, infants), cabin class preference, any airline preference.
- Convert relative dates to actual dates (e.g. "next Monday" to specific date).
- Default to 1 adult, Economy class if not specified.

### 2. Navigate to Booking.com Flights & Verify Login
- Open a NEW tab and navigate to `https://www.booking.com/flights`.
- Take snapshot. Dismiss Genius sign-in popup (aria-label="Dismiss sign-in info") if it appears.
- Dismiss cookie consent banner (id="onetrust-accept-btn-handler") if present.
- Verify logged in (profile avatar/name in top-right header). Genius discounts should be active.
- If NOT signed in: Click "Sign in" and select rsinghtomar3011@gmail.com Google account.
- **If session expired or wrong account, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search Flights
- On the flights search page, fill in:
  - From: type departure city/airport, select from autocomplete dropdown.
  - To: type arrival city/airport, select from autocomplete dropdown.
  - Departure date: select from date picker.
  - Return date (if round-trip): select from date picker.
  - Passengers and cabin class: adjust if non-default.
- Select "One-way" or "Round-trip" toggle as appropriate.
- Click "Search" button.
- Take snapshot of results page. Wait for results to fully load.

### 4. Filter & Present Options
- Apply filters if user has preferences: direct flights only, specific airlines, departure time window, max price.
- Sort by "Best" (default), "Cheapest", or "Fastest" based on user priority.
- Extract top 4-5 flight options with: airline(s), departure time, arrival time, duration, stops (direct/1 stop/2 stops), layover details, price per person, total price.
- Check for Genius discount badge on any flights.
- Use `ask_user` (input_type "choice") to present options. Format:
  "IndiGo — 06:30-09:10 (2h 40m) Direct — ₹4,500/person"
  "Air India — 08:00-13:30 (5h 30m) 1 stop DEL (2h layover) — ₹3,800/person — Genius discount"
  "Emirates — 22:15+1 06:40 (8h 25m) Direct — ₹28,000/person — Business available"
- Add "Show more results" as last option.

### 5. Select Flight & Review Details
- Click selected flight to expand details. Take snapshot.
- Extract full itinerary: flight number, aircraft type, baggage allowance (cabin + check-in), seat pitch, in-flight amenities.
- If round-trip, show both outbound and return legs clearly.
- For connecting flights, show layover airport and duration.
- If multiple fare options exist (Basic, Standard, Flexible), present via `ask_user` (input_type "choice"):
  "Basic — ₹4,500 — No checked bag, no changes"
  "Standard — ₹5,200 — 1 checked bag (23kg), changes for fee"
  "Flexible — ₹6,800 — 2 checked bags, free changes/cancellation"
- Click "Select" on chosen fare.

### 6. Fill Passenger Details
- Passenger details form appears. Take snapshot.
- Fill in for each passenger: full name (as on passport/ID), date of birth, gender, nationality.
- Fill contact details: email, phone number.
- For international flights, fill passport number, expiry date, issuing country if requested.
- Use `ask_user` for any passenger details not available from user profile (especially passport info for international flights).
- Add frequent flyer number if user has one.
- Skip optional add-ons (extra baggage, seat selection, travel insurance) unless user requests them.

### 7. Review & Confirm
- Proceed to review page. Take snapshot.
- Use `confirm_action` to present full booking summary:
  - Airline and flight number(s)
  - From/To with airport names and terminals
  - Departure and arrival date/time (for each leg if round-trip)
  - Duration and stops
  - Fare type and baggage allowance
  - Passenger name(s)
  - Price breakdown: base fare, taxes, fees, Genius discount, total per person, grand total
  - Cancellation/change policy
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 8. Payment
- Use `collect_payment`:
  - summary: JSON with airline, flight numbers, route, dates, passengers, fare type, baggage, price breakdown, total
  - amount_inr: total amount (number)
  - description: "Booking.com flight reservation"
- STOP and WAIT for payment confirmation.

### 9. Complete Booking & Confirm
- Complete payment on Booking.com. Handle 3DS/OTP via `ask_user` (input_type "otp") if needed.
- Take snapshot of confirmation page.
- Report: booking reference/PNR, airline, flight number(s), route, departure/arrival times, terminals, passenger names, baggage allowance, total paid, e-ticket info.
- Mention: "Carry valid photo ID (domestic) or passport (international). Web check-in opens 48-72 hours before departure. Arrive at the airport 2 hours (domestic) or 3 hours (international) before departure."

## Site Notes

- Booking.com Flights aggregates airlines globally — good for both domestic Indian and international flights.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) is Genius Level 1 — may see exclusive flight discounts. Do NOT ask user for credentials.
- Genius popup appears on EVERY page load on Booking.com — dismiss immediately with the X button.
- Cookie consent banner: click `#onetrust-accept-btn-handler` to dismiss.
- Currency is auto-detected by IP (INR from India). International flights may show in USD/EUR — convert for user.
- "Best" sort balances price and flight duration — recommend unless user specifically wants cheapest.
- Connecting flights: layover details are critical — mention minimum connection time warnings.
- Baggage policy varies by airline and fare — always verify and mention in the summary.
- Price can change between search and booking — if price increases, warn user and confirm they still want to proceed.
- For international flights, passport details are mandatory — collect early in the flow.
- Booking.com acts as an aggregator — actual ticket is issued by the airline. Mention the airline's policies.
- Use `confirm_action` for booking review, `collect_payment` for checkout. WAIT for user response.
