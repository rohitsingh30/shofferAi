---
name: indigo-flight
description: Book IndiGo flights on goindigo.in — search routes, select flights, choose fares, fill details, pay.
triggers:
  - indigo flight
  - indigo booking
  - book indigo
  - goindigo
  - indigo air ticket
  - 6e flight
  - indigo airline
  - book flight indigo
siteUrl: https://www.goindigo.in
requiresAuth: true
params:
  - name: from
    required: true
    hint: Departure city or airport (e.g. "Delhi", "BOM", "Bangalore")
  - name: to
    required: true
    hint: Arrival city or airport (e.g. "Goa", "Mumbai", "Chennai")
  - name: date
    required: true
    hint: Departure date (e.g. "March 25", "next Friday", "2026-04-10")
  - name: returnDate
    required: false
    hint: Return date for round-trip (omit for one-way)
  - name: passengers
    required: false
    hint: Number of passengers (default 1 adult)
  - name: fareType
    required: false
    hint: Fare type preference (Saver, Flexi, Super 6E). Default Saver.
---

# IndiGo Flight Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Travel Details
- Confirm from city, to city, departure date. If any missing, use `ask_user`.
- Ask if one-way or round-trip. If round-trip, confirm return date.
- Note passenger count (adults, children, infants).
- Ask about fare type preference: Saver (cheapest), Flexi (changeable), Super 6E (premium).
- Convert relative dates to actual dates.

### 2. Open IndiGo & Verify Login
- Open a NEW tab and navigate to `https://www.goindigo.in`.
- Take snapshot. Close any promotional popups or banners.
- Verify logged in (profile icon, 6E Rewards name, or login status visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search Flights
- Select trip type: One Way or Round Trip.
- Click "From" field, type departure city, select from autocomplete.
- Click "To" field, type arrival city, select from autocomplete.
- Select departure date using date picker.
- If round-trip, select return date.
- Set passenger count if non-default.
- Click "Search Flight" button.
- Take snapshot of results page.

### 4. Filter & Present Options
- View all available flights for the route and date.
- Extract top 4-5 flights with: flight number, departure time, arrival time, duration, stops, fare (Saver/Flexi/Super 6E).
- Check for "6E Sale" or promotional fares.
- Note non-stop vs connecting flights.
- Use `ask_user` (input_type "choice") to present options. Format:
  "6E-2145 — 06:30-09:10 (2h 40m) Non-stop — Saver ₹X,XXX / Flexi ₹X,XXX"
- Add "Show more flights" or "Try different date" as options.

### 5. Select Fare Type
- Click selected flight. Take snapshot of fare comparison.
- Present fare types with details:
  - Saver: cheapest, no free changes, limited baggage
  - Flexi: free date change, extra baggage
  - Super 6E: free meals, extra legroom, priority check-in, 2x baggage
- Extract: fare name, baggage (cabin + check-in), seat selection, meal, change/cancel fee.
- Use `ask_user` (input_type "choice") to present fare options.

### 6. Add-ons (Optional)
- If user wants, present available add-ons: extra baggage, seat selection, meals, 6E Tiffin.
- Skip add-ons unless user explicitly requests them.
- If Super 6E selected, add-ons are mostly included.

### 7. Review Booking
- Proceed to review page. Take snapshot.
- Use `confirm_action` to present flight summary:
  - Flight number (6E-XXXX)
  - From → To with airport names and terminals
  - Departure/Arrival date and time
  - Duration, stops (layover details if any)
  - Fare type selected
  - Baggage allowance (cabin + check-in)
  - Price breakdown: base fare, fuel surcharge, taxes, convenience fee, add-ons, total
  - Cancellation/change policy
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 8. Fill Passenger Details & Payment
- Fill passenger details: name (as on government ID), date of birth, gender, contact email, phone.
- Apply 6E Rewards points if available and user wants.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with flight number, route, date, fare type, price breakdown, total
  - amount_inr: total amount (number)
  - description: "IndiGo flight booking"
- STOP and WAIT for payment confirmation.

### 9. Complete Booking & Confirm
- Complete payment on goindigo.in (UPI/card/netbanking).
- Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: booking reference/PNR, flight number, route, date, departure/arrival times, terminal info, total paid.
- Mention: "Carry valid photo ID. Web check-in opens 48 hours before departure at goindigo.in. Download boarding pass."

## Site Notes

- IndiGo (6E) is India's largest domestic airline by market share with extensive route coverage.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- goindigo.in can be slow during flash sales — be patient and retry if pages don't load.
- "6E Sale" fares are extremely cheap but non-refundable and no changes allowed.
- Convenience fee (~₹250-400) is added at checkout on most payment methods — UPI may waive it.
- Saver fare includes only 1 x 15kg check-in bag. Extra bags cost ₹1,500-3,500 depending on route.
- IndiGo does NOT serve free meals on any fare except Super 6E — meals must be pre-booked.
- Seat selection: free on Super 6E, paid (₹200-800) on Saver/Flexi. XL seats (extra legroom) cost more.
- 6E Rewards members earn points on every booking — check balance and apply if beneficial.
- Session can expire if idle too long — if redirected to home, stop and inform user.
- Use `confirm_action` for booking review, `collect_payment` for checkout. WAIT for user response.
