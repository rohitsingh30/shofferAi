---
name: ixigo-flight
description: Book flights on ixigo — search across airlines, compare fares/times, select cheapest option, fill details, pay.
triggers:
  - ixigo flight
  - book flight on ixigo
  - ixigo flight booking
  - ixigo air ticket
  - cheap flight ixigo
  - ixigo plane ticket
  - flight on ixigo
  - ixigo domestic flight
siteUrl: https://www.ixigo.com
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
    hint: Cabin class (Economy, Premium Economy, Business). Default Economy.
---

# ixigo Flight Booking

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
- Note passenger count, cabin class, any airline preference.
- Convert relative dates to actual dates (e.g. "next Monday" to specific date).
- Default to 1 adult, Economy if not specified.

### 2. Open ixigo & Verify Login
- Open a NEW tab and navigate to `https://www.ixigo.com/flights`.
- Take snapshot. Dismiss any popups (app install, login, promotional banners).
- Verify logged in (profile icon or name visible in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search Flights
- Select "One Way" or "Round Trip" tab.
- Click "From" field, type departure city, select from autocomplete.
- Click "To" field, type arrival city, select from autocomplete.
- Set departure date using date picker.
- If round-trip, set return date.
- Set travellers and class if non-default.
- Click "Search" button.
- Take snapshot of results page.

### 4. Filter & Present Options
- Apply filters: preferred airline (if specified), non-stop/1-stop, departure time window.
- Sort by price (low to high) -- ixigo's default "Cheapest" sort is ideal.
- Extract top 4-5 flights with: airline, flight number, departure time, arrival time, duration, stops, price.
- Check for ixigo Assured fares and bank offers (HDFC, ICICI, SBI, etc.).
- Use `ask_user` (input_type "choice") to present options. Format:
  "IndiGo 6E-2145 — 06:30-09:10 (2h 40m) Non-stop — Rs X,XXX"
- Add "Show more results" as last option.

### 5. Select Fare Type
- Click selected flight. Take snapshot of fare options.
- Present fare types: Regular, Flexi, Super Saver (varies by airline).
- Extract: fare name, baggage allowance, seat selection, cancellation/change fee, meal.
- Use `ask_user` (input_type "choice") to present fare options.
- Highlight ixigo Assured fares (free cancellation) if available.

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
- Skip add-ons (seat selection, meals, insurance) unless user requests.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with flight, route, date, fare type, price breakdown, total
  - amount_inr: total amount (number)
  - description: "ixigo flight booking"
- STOP and WAIT for payment confirmation.

### 8. Complete Booking & Confirm
- Complete payment on ixigo (UPI/card/netbanking/ixigo money).
- Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: booking ID/PNR, airline, flight number, route, date, departure/arrival times, terminal info, total paid.
- Mention: "Carry valid photo ID. Web check-in opens 48-72 hours before departure."

## Site Notes

- ixigo is a leading Indian meta-search travel platform that aggregates fares across all airlines for the cheapest options.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- ixigo shows app-install popups, login modals, and promotional banners on load -- dismiss all immediately.
- "ixigo Assured" fares guarantee free cancellation and rescheduling -- recommend when available.
- ixigo compares fares across OTAs (MakeMyTrip, Goibibo, Cleartrip) and direct airline sites -- always picks cheapest source.
- Bank offers (HDFC, ICICI, SBI, Axis) provide 5-12% instant discount on card payments -- check offers section.
- Convenience fee (Rs 200-350) may be added at checkout -- include in total shown to user.
- ixigo Money (wallet) can be applied for additional discounts -- check balance at checkout.
- Prices change frequently on ixigo -- if user delays, warn that fare may update.
- Domestic flights: standard 15kg check-in + 7kg cabin. Verify per fare type and airline.
- Session can expire if idle -- if redirected to login page, stop and inform user.
- Use `confirm_action` for booking review, `collect_payment` for checkout. WAIT for user response.
