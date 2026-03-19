---
name: airindia-flight
description: Book Air India flights on airindia.com — search routes, select class, fill details, pay.
triggers:
  - air india
  - air india flight
  - book air india
  - airindia booking
  - air india ticket
  - ai flight
  - air india airline
  - maharaja flight
siteUrl: https://www.airindia.com
requiresAuth: true
params:
  - name: from
    required: true
    hint: Departure city or airport (e.g. "Delhi", "BOM", "Bangalore")
  - name: to
    required: true
    hint: Arrival city or airport (e.g. "London", "Mumbai", "New York")
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

# Air India Flight Booking

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
- Note passenger count (adults, children, infants).
- Ask about cabin class: Economy, Premium Economy, Business, or First.
- Check if user is a Flying Returns member (for mileage accrual).
- Convert relative dates to actual dates.

### 2. Open Air India & Verify Login
- Open a NEW tab and navigate to `https://www.airindia.com`.
- Take snapshot. Close any promotional popups or cookie consent banners.
- Verify logged in (Flying Returns profile or name visible in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search Flights
- Select trip type: One Way or Round Trip.
- Enter departure city in "From" field, select from autocomplete.
- Enter arrival city in "To" field, select from autocomplete.
- Select departure date from calendar.
- If round-trip, select return date.
- Set passenger count and cabin class.
- Click "Search Flights" button.
- Take snapshot of search results.

### 4. Filter & Present Options
- View available flights for the route.
- Extract top 4-5 options with: flight number (AI-XXX), departure time, arrival time, duration, stops, aircraft type, fare.
- Note codeshare flights (AI + partner airlines like Vistara, ANA, Lufthansa).
- Check for multi-city or connecting flight options.
- Use `ask_user` (input_type "choice") to present options. Format:
  "AI-302 — DEL 09:15 → BOM 11:25 (2h 10m) Non-stop — Economy ₹X,XXX"
- Add "Show more flights" as last option.

### 5. Select Fare & Class
- Click selected flight. Take snapshot of fare options.
- Present available fare brands:
  - Economy: Value, Flex, Comfort
  - Premium Economy: Value, Flex
  - Business: Classic, Flex
  - First: (single tier)
- Extract: fare name, baggage allowance, seat selection, lounge access, change/cancel fee, meal.
- Use `ask_user` (input_type "choice") to present fare options.

### 6. Review Booking
- Proceed to review/summary page. Take snapshot.
- Use `confirm_action` to present booking summary:
  - Airline: Air India (AI-XXX)
  - From → To with airport names, terminals
  - Departure/Arrival date and time
  - Duration, stops (layover city and duration if connecting)
  - Cabin class and fare brand
  - Baggage allowance (cabin + check-in)
  - Meal included (yes/no)
  - Price breakdown: base fare, fuel surcharge, taxes, airport charges, total
  - Change/cancellation policy
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 7. Fill Passenger Details & Payment
- Fill passenger details: title, first name, last name (as on passport for international), DOB, nationality, passport number (international flights), contact email, phone.
- Add Flying Returns number if applicable.
- Add special requests (meal preference, wheelchair, etc.) if needed.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with flight, route, date, class, fare brand, total
  - amount_inr: total amount (number)
  - description: "Air India flight booking"
- STOP and WAIT for payment confirmation.

### 8. Complete Booking & Confirm
- Complete payment on airindia.com (UPI/card/netbanking).
- Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: booking reference/PNR, flight number, route, date, departure/arrival times, terminal, cabin class, baggage, total paid.
- For international: "Carry passport and visa. Web check-in opens 48 hours before departure."
- For domestic: "Carry valid photo ID. Web check-in opens 48 hours before departure."

## Site Notes

- Air India is India's flag carrier airline, recently acquired by Tata Group with significant fleet and service upgrades.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Air India flies both domestic and international routes — including ultra-long-haul to USA, UK, Europe, Australia.
- After the Tata acquisition and Vistara merger, Air India has expanded premium cabin offerings significantly.
- Flying Returns is Air India's loyalty program — members earn miles on every flight. Check if user is a member.
- Business and First class include lounge access, priority boarding, extra baggage, premium meals.
- Economy baggage: domestic 15-25kg, international 23-46kg depending on route and fare.
- Air India's website can be slow during high traffic — retry if pages timeout.
- For international flights, passport details are MANDATORY at booking — ensure user provides them.
- Infant (under 2) does not get a seat — must sit on adult's lap. Child (2-11) gets a seat at discounted fare.
- Session can expire if idle — if redirected to home page, stop and inform user.
- Use `confirm_action` for booking review, `collect_payment` for checkout. WAIT for user response.
