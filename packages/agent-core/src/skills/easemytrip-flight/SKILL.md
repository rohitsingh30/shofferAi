---
name: easemytrip-flight
description: Book flights on EaseMyTrip — budget-friendly airline search, zero convenience fee, compare and book cheapest flights.
triggers:
  - easemytrip flight
  - book flight on easemytrip
  - easemytrip flight booking
  - easemytrip air ticket
  - easy trip flight
  - emt flight
  - cheapest flight easemytrip
  - easemytrip plane ticket
siteUrl: https://www.easemytrip.com
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
    hint: Cabin class (Economy, Premium Economy, Business). Default Economy.
---

# EaseMyTrip Flight Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Travel Details
- Confirm from city, to city, departure date. If any missing, use `ask_user`.
- Ask if one-way or round-trip. If round-trip, confirm return date.
- Note passenger count, cabin class, airline preference.
- Convert relative dates to actual dates (e.g. "next Monday" to specific date).
- Default to 1 adult, Economy if not specified.

### 2. Open EaseMyTrip & Verify Login
- Open a NEW tab and navigate to `https://www.easemytrip.com/flights.html`.
- Take snapshot. Dismiss any popups (app install, login prompts, offer banners).
- Verify logged in (profile name or "My Account" showing logged-in state).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search Flights
- Select "One Way" or "Round Trip".
- Click "From" field, type departure city, select from autocomplete.
- Click "To" field, type arrival city, select from autocomplete.
- Set departure date using date picker.
- If round-trip, set return date.
- Set travellers and class if non-default.
- Click "Search" button.
- Take snapshot of results page.

### 4. Filter & Present Options
- Apply filters: preferred airline, non-stop/1-stop, departure time window, price range.
- Sort by price (low to high) -- EaseMyTrip excels at budget fares.
- Extract top 4-5 flights with: airline, flight number, departure time, arrival time, duration, stops, price.
- Highlight that EaseMyTrip charges ZERO convenience fee -- fares shown are final.
- Check for bank offers (HDFC, ICICI, SBI, etc.) and EMT exclusive deals.
- Use `ask_user` (input_type "choice") to present options. Format:
  "SpiceJet SG-8169 — 07:00-09:20 (2h 20m) Non-stop — Rs X,XXX (no convenience fee)"
- Add "Show more results" as last option.

### 5. Select Fare Type
- Click selected flight. Take snapshot of fare options.
- Present fare types: Saver, Flexi, Super Saver, Comfort (varies by airline).
- Extract: fare name, baggage allowance, seat selection, cancellation/change fee, meal.
- Use `ask_user` (input_type "choice") to present fare options.
- Mention free date change or cancellation if available on higher fare tiers.

### 6. Review Booking
- Proceed to review page. Take snapshot.
- Use `confirm_action` to present flight summary:
  - Airline, flight number
  - From/To with airport names and terminals
  - Departure/Arrival date and time
  - Duration, stops (layover details if any)
  - Fare type, baggage allowance
  - Price breakdown: base fare, taxes, fees (zero convenience fee)
  - Total amount
  - Cancellation/change policy
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 7. Fill Passenger Details & Payment
- Fill passenger details: name (as on ID), age, gender, contact email, phone.
- Skip add-ons (seat selection, meals, insurance) unless user requests.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with flight, route, date, fare type, price breakdown, total
  - amount_inr: total amount (number)
  - description: "EaseMyTrip flight booking"
- STOP and WAIT for payment confirmation.

### 8. Complete Booking & Confirm
- Complete payment on EaseMyTrip (UPI/card/netbanking/EMT wallet).
- Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: booking ID/PNR, airline, flight number, route, date, departure/arrival times, terminal info, total paid.
- Mention: "Carry valid photo ID. Web check-in opens 48-72 hours before departure."

## Site Notes

- EaseMyTrip is India's only major OTA that charges ZERO convenience fee -- fares are often the cheapest.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- EaseMyTrip shows promotional popups and app-download banners -- dismiss all immediately.
- "EMT Negotiate" feature lets users bid for lower fares on select routes -- mention if visible.
- Bank offers (HDFC, ICICI, SBI) provide 5-10% instant discount -- always check the offers section.
- No convenience fee means the price displayed in search results is the price you pay -- a key selling point.
- EaseMyTrip wallet balance can be applied at checkout for additional savings -- check balance.
- Prices update frequently -- warn user if fare changes during booking flow.
- For round-trip, both legs must be selected before proceeding to passenger details.
- Domestic flights: 15kg check-in + 7kg cabin is standard. Verify per fare type and airline.
- Session can expire on idle -- if redirected to login, stop and inform user.
- Use `confirm_action` for booking review, `collect_payment` for checkout. WAIT for user response.
