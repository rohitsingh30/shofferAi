---
name: goibibo-flight
description: Book flights on Goibibo — one-way or round-trip, search by route/dates, compare options, book and pay.
triggers:
  - goibibo flight
  - book flight on goibibo
  - goibibo flight booking
  - goibibo air ticket
  - flight on goibibo
  - goibibo plane ticket
  - cheap flight goibibo
  - goibibo domestic flight
siteUrl: https://www.goibibo.com
requiresAuth: true
params:
  - name: from
    required: true
    hint: Departure city or airport (e.g. "Delhi", "BOM", "Bangalore")
  - name: to
    required: true
    hint: Arrival city or airport (e.g. "Goa", "Mumbai", "Hyderabad")
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
    hint: Cabin class (Economy, Business). Default Economy.
---

# Goibibo Flight Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Travel Details
- Confirm from city, to city, departure date. If any missing, use `ask_user`.
- Ask if one-way or round-trip. If round-trip, confirm return date.
- Note passenger count, cabin class, any airline preference.
- Convert relative dates to actual dates.
- Default to 1 adult, Economy if not specified.

### 2. Open Goibibo & Verify Login
- Open a NEW tab and navigate to `https://www.goibibo.com/flights/`.
- Take snapshot. Dismiss any popups (app install, login, offers banner).
- Verify logged in (profile name/icon visible in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search Flights
- Select "One Way" or "Round Trip" tab.
- Click "From" field, type departure city, select from autocomplete.
- Click "To" field, type arrival city, select from autocomplete.
- Set departure date using date picker.
- If round-trip, set return date.
- Set travellers and class if non-default.
- Click "Search Flights" button.
- Take snapshot of results page.

### 4. Filter & Present Options
- Apply filters: non-stop or 1-stop, preferred airline, departure time window.
- Sort by price (low to high) or duration (shortest first).
- Extract top 4-5 flights with: airline, flight number, departure time, arrival time, duration, stops, price per person.
- Check for Goibibo deals, goCash+ offers, bank discounts.
- Use `ask_user` (input_type "choice") to present options. Format:
  "Air India AI-505 -- 07:15-09:45 (2h 30m) Non-stop -- Rs X,XXX"
- Add "Show more results" as last option.

### 5. Select Fare Type
- Click selected flight. Take snapshot of fare options.
- Present fare types (Saver, Flexi, Business Flex, etc.).
- Extract: fare name, baggage allowance, seat selection, cancellation/change fee, meal included.
- Use `ask_user` (input_type "choice") to present fare options.
- Highlight refundable fares if available.

### 6. Review Booking
- Proceed to review/traveller page. Take snapshot.
- Use `confirm_action` to present flight summary:
  - Airline, flight number
  - From/To with airport names and terminals
  - Departure/Arrival date and time
  - Duration, stops (layover info if any)
  - Fare type, baggage allowance
  - Price breakdown: base fare, taxes, convenience fee, discount, goCash
  - Total amount
  - Cancellation/change policy
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 7. Fill Passenger Details & Payment
- Fill passenger details: name (as on ID), date of birth, gender, contact email, phone.
- Skip add-ons (seat selection, meals, insurance) unless user requests.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with flight, route, date, fare type, price breakdown, total
  - amount_inr: total amount (number)
  - description: "Goibibo flight booking"
- STOP and WAIT for payment confirmation.

### 8. Complete Booking & Confirm
- Complete payment on Goibibo (UPI/card/netbanking/Goibibo wallet).
- Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: booking ID/PNR, airline, flight number, route, date, departure/arrival times, total paid.
- Mention: "Carry valid photo ID. Web check-in opens 48-72 hours before departure."
- Note goCash earned for future use if applicable.

## Site Notes

- Goibibo is part of the MakeMyTrip group. Strong domestic flight coverage.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Goibibo shows app-install and promotional popups -- dismiss all immediately.
- goCash+ rewards can be applied at checkout for instant discount -- check balance and mention.
- Bank offers (HDFC, ICICI, SBI, Axis) give 5-12% instant discount -- always check offer section.
- Convenience fee (Rs 200-350) is added at checkout -- include in total shown to user.
- "goCash+ Assured" flights guarantee goCash for future bookings -- mention if visible.
- Prices fluctuate in real-time -- if user delays, warn that price may change.
- For round-trip, both outbound and return flights must be selected before proceeding.
- Goibibo sometimes shows "Exclusive App Fare" which is web-unavailable -- ignore those.
- Domestic flights: 15kg check-in + 7kg cabin is standard. Verify per fare type.
- Session can time out on idle -- if redirected to login, stop and inform user.
- Use `confirm_action` for booking review, `collect_payment` for checkout. WAIT for user response.
