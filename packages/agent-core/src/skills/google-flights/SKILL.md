---
name: google-flights
description: Find cheapest flights on Google Flights — search, compare across airlines, track prices, and redirect to airline/OTA to book.
triggers:
  - google flights
  - cheapest flight
  - compare flights
  - find cheap flight
  - flight search google
  - google flights search
  - best flight deal
  - flight price comparison
  - google flight tracker
siteUrl: https://www.google.com/travel/flights
requiresAuth: false
params:
  - name: from
    required: true
    hint: Departure city or airport (e.g. "Delhi", "BOM", "Bangalore")
  - name: to
    required: true
    hint: Arrival city or airport (e.g. "Goa", "London", "Bangkok", "Dubai")
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
  - name: budget
    required: false
    hint: Max budget (e.g. "under 5000", "cheapest possible")
---

# Google Flights Search & Compare

Chrome profile: rsinghtomar3011@gmail.com.

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
- Confirm from city, to city, departure date. If any missing, use `ask_user`.
- Ask if one-way or round-trip. If round-trip, confirm return date.
- Note passenger count, cabin class, budget constraint, preferred airlines.
- Ask if dates are flexible -- Google Flights has a "Date grid" and "Price graph" feature.
- Convert relative dates to actual dates.
- Default to 1 adult, Economy, round-trip if not specified.

### 2. Open Google Flights
- Open a NEW tab and navigate to `https://www.google.com/travel/flights`.
- Take snapshot. Dismiss any cookie consent or locale popups.
- Google Flights does not require login, but being signed in personalizes results.
- Verify the page loaded with the search form visible.

### 3. Search Flights
- Select "One way" or "Round trip" from the trip type dropdown.
- Set number of passengers and class.
- Click "Where from?" field, type departure city/airport, select from autocomplete.
- Click "Where to?" field, type arrival city/airport, select from autocomplete.
- Set departure date. If round-trip, set return date.
- Press Enter or click "Search" / "Explore" button.
- Take snapshot of results page.

### 4. Analyze & Filter Results
- Note the "Best departing flights" and "Other departing flights" sections.
- Apply filters: stops (Nonstop, 1 stop, 2+ stops), airlines, times, duration, price.
- Use "Sort by" price if user wants cheapest option.
- If dates are flexible, check "Date grid" view for cheapest dates nearby.
- Check "Price graph" for price trends over the next few weeks/months.
- Extract top 5-6 flights with: airline(s), departure time, arrival time, duration, stops (layover city/duration), price, booking source (airline or OTA).
- Note "tracked prices" suggestion -- Google can alert when prices drop.

### 5. Present Options to User
- Use `ask_user` (input_type "choice") to present options. Format:
  "IndiGo — 06:30-09:10 (2h 40m) Nonstop — Rs X,XXX — via IndiGo.com"
  "Air India — 10:15-15:45 (5h 30m) 1 stop (BOM, 1h 20m) — Rs X,XXX — via MakeMyTrip"
- Include "Check flexible dates" option if user might shift dates.
- Include "Track this price" option if user wants alerts.
- Add "Show more results" as last option.

### 6. Explore Selected Flight
- Click selected flight to expand details.
- Take snapshot of expanded flight details.
- Show: full itinerary with layovers, baggage allowance, seat pitch (if shown), carbon emissions, fare class.
- Show booking options from multiple sources with prices (airline direct, MMT, Cleartrip, etc.).
- Use `ask_user` (input_type "choice") to present booking sources. Format:
  "Book via IndiGo.com — Rs X,XXX (airline direct)"
  "Book via MakeMyTrip — Rs X,XXX"
  "Book via Cleartrip — Rs X,XXX"

### 7. Redirect to Booking
- Click selected booking source. This opens the airline/OTA website.
- Take snapshot of the redirected booking page.
- Use `confirm_action` to present final summary:
  - Flight: airline, flight number(s)
  - Route: from/to with airport names
  - Departure/Arrival date and time
  - Duration, stops
  - Cabin class
  - Price from selected source
  - Baggage allowance
  - Booking source (airline or OTA name)
- Do NOT proceed unless user confirms. If cancelled, go back and pick another option.

### 8. Complete Booking on Redirected Site
- Fill passenger details on the airline/OTA site: name, DOB, gender, email, phone.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with flight, route, date, class, booking source, price
  - amount_inr: total amount (number)
  - description: "Flight booking via Google Flights"
- STOP and WAIT for payment confirmation.
- Complete payment on the airline/OTA site.
- Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: PNR/booking reference, airline, flight number, route, date, times, total paid, booking source.

## Site Notes

- Google Flights is a metasearch engine -- it compares prices but redirects to airline/OTA for booking.
- No login required, but Chrome Profile 3 (rsinghtomar3011@gmail.com) keeps preferences. Do NOT ask user for credentials.
- Google Flights shows the best overview of all available flights across airlines and OTAs.
- "Best flights" are ranked by price + duration + stops -- not just cheapest.
- Price tracking: Google can send email alerts when prices drop. Offer this to users who are flexible.
- Date grid and price graph are powerful tools for finding cheapest dates -- use if dates are flexible.
- Baggage info shown is from airline data -- verify on the booking site before paying.
- Multi-city trips can be searched via "Multi-city" option.
- Prices shown include taxes. However, the final price on the OTA may differ slightly due to fees.
- Google Flights does not charge any fee -- the booking happens entirely on the airline/OTA site.
- Carbon emissions are shown per flight -- mention if user is environmentally conscious.
- For international flights, check visa requirements and mention if relevant.
- The redirected site (airline/OTA) may have its own login requirement -- handle accordingly.
- Use `confirm_action` for booking review, `collect_payment` for payment. WAIT for user response.
