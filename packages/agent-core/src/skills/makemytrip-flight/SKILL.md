---
name: makemytrip-flight
description: Book flights on MakeMyTrip — search by route/date, compare airlines/times/prices, select, fill passenger details, pay.
triggers:
  - makemytrip flight
  - mmt flight
  - book flight on makemytrip
  - makemytrip flight booking
  - flight on mmt
  - mmt air ticket
  - makemytrip air booking
  - cheap flight makemytrip
siteUrl: https://www.makemytrip.com
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
  - name: class
    required: false
    hint: Cabin class (Economy, Premium Economy, Business, First). Default Economy.
---

# MakeMyTrip Flight Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Travel Details
- Confirm from city, to city, departure date. If any missing, use `ask_user`.
- Ask if one-way or round-trip. If round-trip, confirm return date.
- Note passenger count, cabin class preference, any airline preference.
- Convert relative dates to actual dates (e.g. "next Monday" to specific date).

### 2. Open MakeMyTrip & Verify Login
- Open a NEW tab and navigate to `https://www.makemytrip.com/flights`.
- Take snapshot. Close any app-install, login, or promotional popups.
- Verify logged in (profile icon or name visible in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search Flights
- Click "From" field, type departure city, select from autocomplete.
- Click "To" field, type arrival city, select from autocomplete.
- Set departure date using date picker.
- If round-trip, set return date.
- Set travellers and class if non-default.
- Click "Search" button.
- Take snapshot of results page.

### 4. Filter & Present Options
- Apply filters: preferred airline (if specified), non-stop/1-stop, departure time window.
- Sort by price (low to high) or departure time based on user preference.
- Extract top 4-5 flights with: airline, flight number, departure time, arrival time, duration, stops, price.
- Check for MMT SuperSaver or bank offers (HDFC, ICICI, etc.).
- Use `ask_user` (input_type "choice") to present options. Format:
  "IndiGo 6E-2145 — 06:30-09:10 (2h 40m) Non-stop — Rs X,XXX"
- Add "Show more results" as last option.

### 5. Select Fare Type
- Click selected flight. Take snapshot of fare options.
- Present fare types: Saver, Flexi, Super 6E / SME (varies by airline).
- Extract: fare name, baggage allowance, seat selection, cancellation/change fee, meal.
- Use `ask_user` (input_type "choice") to present fare options.
- Mention free cancellation or flexibility if available.

### 6. Review Booking
- Proceed to review page. Take snapshot.
- Use `confirm_action` to present flight summary:
  - Airline, flight number
  - From/To with airport names and terminals
  - Departure/Arrival date and time
  - Duration, stops (layover details if any)
  - Fare type, baggage allowance
  - Price breakdown: base fare, fuel surcharge, taxes, fees, discount
  - Total amount
  - Cancellation/change policy
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 7. Fill Passenger Details & Payment
- Fill passenger details: name (as on ID), age, gender, contact email, phone.
- Add frequent flyer number if user has one.
- If add-ons available (seat selection, meals, insurance), skip unless user requests.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with flight, route, date, fare type, price breakdown, total
  - amount_inr: total amount (number)
  - description: "MakeMyTrip flight booking"
- STOP and WAIT for payment confirmation.

### 8. Complete Booking & Confirm
- Complete payment on MakeMyTrip (UPI/card/netbanking).
- Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: booking ID/PNR, airline, flight number, route, date, departure/arrival times, terminal info, total paid.
- Mention: "Carry valid photo ID. Web check-in opens 48-72 hours before departure."

## Site Notes

- MakeMyTrip is India's largest OTA for flights. Wide coverage of domestic and international routes.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- MMT shows aggressive popups on load (app download, login prompts) -- dismiss all immediately.
- "MMT SuperSaver" fares are non-refundable but cheapest. "Flexi" fares allow free cancellation.
- Bank offers (HDFC, ICICI, Axis) give 10-15% instant discount on card payments -- always check.
- Convenience fee (~Rs 250-400) may be added at checkout -- mention in total.
- Prices fluctuate rapidly -- if user takes too long, price may change. Warn if it happens.
- For round-trip, both legs are shown together -- ensure both are acceptable before booking.
- Session can expire if idle too long -- if redirected to login, stop and inform user.
- Baggage: domestic flights typically 15kg check-in + 7kg cabin. Verify per fare type.
- Use `confirm_action` for booking review, `collect_payment` for checkout. WAIT for user response.
