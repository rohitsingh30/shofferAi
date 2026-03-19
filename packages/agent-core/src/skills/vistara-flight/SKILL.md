---
name: vistara-flight
description: Book Vistara flights on airvistara.com — search routes, select premium economy/business, fill details, pay.
triggers:
  - vistara
  - vistara flight
  - book vistara
  - air vistara
  - vistara booking
  - vistara airline
  - uk flight
  - vistara premium
siteUrl: https://www.airvistara.com
requiresAuth: true
params:
  - name: from
    required: true
    hint: Departure city or airport (e.g. "Delhi", "BOM", "Bangalore")
  - name: to
    required: true
    hint: Arrival city or airport (e.g. "Mumbai", "Goa", "Kolkata")
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

# Vistara Flight Booking

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
- Ask about cabin class: Economy, Premium Economy, or Business.
- Note if user is a Club Vistara member for tier benefits and point accrual.
- Convert relative dates to actual dates.

### 2. Open Vistara & Verify Login
- Open a NEW tab and navigate to `https://www.airvistara.com`.
- Take snapshot. Close any promotional popups or cookie consent.
- Verify logged in (Club Vistara name or profile icon in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Note: After Vistara-Air India merger, the website may redirect — handle gracefully.

### 3. Search Flights
- Select trip type: One Way or Round Trip.
- Enter departure city, select from autocomplete.
- Enter arrival city, select from autocomplete.
- Select departure date using date picker.
- If round-trip, select return date.
- Set passengers and cabin class.
- Click "Search Flights".
- Take snapshot of results page.

### 4. Filter & Present Options
- View available flights for route and date.
- Extract top 4-5 flights with: flight number (UK-XXX), departure time, arrival time, duration, stops, fare per class.
- Note if any flights are operated by Air India (post-merger codeshare).
- Check for Vistara sale fares or corporate offers.
- Use `ask_user` (input_type "choice") to present options. Format:
  "UK-945 — 07:00-09:15 (2h 15m) Non-stop — Economy ₹X,XXX / Premium ₹X,XXX / Business ₹XX,XXX"
- Add "Show more flights" as last option.

### 5. Select Fare Type
- Click selected flight. Take snapshot of fare options.
- Present fare types per class:
  - Economy: Eco Saver, Eco Value, Eco Flex
  - Premium Economy: Premium Saver, Premium Value, Premium Flex
  - Business: Business Saver, Business Value, Business Flex
- Extract: fare name, baggage allowance, seat selection, meal, lounge, change/cancel fee, CV points earned.
- Use `ask_user` (input_type "choice") to present fare options.
- Highlight that Premium Economy and Business include complimentary meals and extra baggage.

### 6. Review Booking
- Proceed to review page. Take snapshot.
- Use `confirm_action` to present booking summary:
  - Flight number (UK-XXX)
  - From → To with airport names and terminals
  - Departure/Arrival date and time
  - Duration, stops
  - Cabin class and fare type
  - Baggage allowance (cabin + check-in)
  - Meal included, lounge access, priority boarding
  - Club Vistara points to be earned
  - Price breakdown: base fare, taxes, surcharges, total
  - Change/cancellation policy
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 7. Fill Passenger Details & Payment
- Fill passenger details: title, first name, last name (as on ID), date of birth, gender, contact email, phone.
- Add Club Vistara membership number if applicable.
- For special meals or assistance, add during booking.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with flight, route, date, class, fare type, price breakdown, total
  - amount_inr: total amount (number)
  - description: "Vistara flight booking"
- STOP and WAIT for payment confirmation.

### 8. Complete Booking & Confirm
- Complete payment on airvistara.com (UPI/card/netbanking).
- Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: booking reference/PNR, flight number, route, date, departure/arrival times, terminal, cabin class, baggage, CV points earned, total paid.
- Mention: "Carry valid photo ID. Web check-in opens 48 hours before departure. Business class passengers can use the Vistara lounge."

## Site Notes

- Vistara (UK) is a premium full-service Indian carrier, a Tata-Singapore Airlines joint venture, now merging with Air India.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Post-merger with Air India, Vistara flights may be listed under Air India — check both sites if needed.
- Vistara is known for superior in-flight service, especially in Premium Economy and Business class.
- Premium Economy is Vistara's unique selling point — wider seats, complimentary meal, extra baggage, priority check-in at Economy-plus pricing.
- Business class includes recliner seats (not flat beds on domestic), lounge access, 3-course meals, priority everything.
- Club Vistara loyalty: Silver, Gold, Platinum tiers. Points can be redeemed for award flights.
- Economy Eco Saver: 15kg check-in, no free cancellation. Eco Flex: 25kg, free changes, partial refund.
- Vistara serves complimentary meals on all flights over 90 minutes for Premium Economy and Business.
- The website may show "Air India by Vistara" branding post-merger — this is normal.
- Session can expire if idle — if redirected to login page, stop and inform user.
- Use `confirm_action` for booking review, `collect_payment` for checkout. WAIT for user response.
