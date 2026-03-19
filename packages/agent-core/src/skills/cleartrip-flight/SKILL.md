---
name: cleartrip-flight
description: Book flights on Cleartrip — search by route/date, filter by airline/time/stops, compare fares, book and pay.
triggers:
  - cleartrip flight
  - book flight on cleartrip
  - cleartrip flight booking
  - cleartrip air ticket
  - flight on cleartrip
  - cleartrip plane ticket
  - cheap flight cleartrip
  - cleartrip domestic flight
siteUrl: https://www.cleartrip.com
requiresAuth: true
params:
  - name: from
    required: true
    hint: Departure city or airport (e.g. "Delhi", "BOM", "Bangalore")
  - name: to
    required: true
    hint: Arrival city or airport (e.g. "Goa", "Mumbai", "Kolkata")
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

# Cleartrip Flight Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Travel Details
- Confirm from city, to city, departure date. If any missing, use `ask_user`.
- Ask if one-way or round-trip. If round-trip, confirm return date.
- Note passenger count, cabin class preference, airline preference, budget.
- Convert relative dates to actual dates.
- Default to 1 adult, Economy if not specified.

### 2. Open Cleartrip & Verify Login
- Open a NEW tab and navigate to `https://www.cleartrip.com/flights`.
- Take snapshot. Dismiss any popups (login prompt, promotional banners, cookie consent).
- Verify logged in (profile name or avatar in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search Flights
- Select "One Way" or "Round Trip".
- Click "From" field, type departure city, select from autocomplete.
- Click "To" field, type arrival city, select from autocomplete.
- Set departure date using date picker.
- If round-trip, set return date.
- Set travellers and class if non-default.
- Click "Search flights" button.
- Take snapshot of results page.

### 4. Filter & Present Options
- Apply filters: stops (non-stop, 1 stop), airlines, departure time range, price range.
- Sort by "Cheapest" or "Fastest" based on user preference.
- Extract top 4-5 flights with: airline, flight number, departure time, arrival time, duration, stops, price.
- Check for Cleartrip offers, Flipkart SuperCoin deals, bank offers.
- Use `ask_user` (input_type "choice") to present options. Format:
  "Vistara UK-835 -- 08:00-10:20 (2h 20m) Non-stop -- Rs X,XXX"
- Add "Show more results" as last option.

### 5. Select Fare Type
- Click selected flight. Take snapshot of fare options.
- Present fare types: Regular, Flexi, Super Saver, etc.
- Extract: fare name, baggage allowance, seat selection included, cancellation fee, change fee, meal.
- Use `ask_user` (input_type "choice") to present fare options.
- Mention ClearChoice (free cancellation add-on) if available.

### 6. Review Booking
- Proceed to traveller details / review page. Take snapshot.
- Use `confirm_action` to present flight summary:
  - Airline, flight number
  - From/To with airport names and terminals
  - Departure/Arrival date and time
  - Duration, stops (layover details if any)
  - Fare type, baggage allowance
  - Price breakdown: base fare, surcharges, taxes, convenience fee, discount
  - Total amount
  - Cancellation/change policy
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 7. Fill Passenger Details & Payment
- Fill passenger details: name (as on ID), date of birth, gender, contact email, phone.
- Add travel insurance or add-ons only if user requests.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with flight, route, date, fare type, price breakdown, total
  - amount_inr: total amount (number)
  - description: "Cleartrip flight booking"
- STOP and WAIT for payment confirmation.

### 8. Complete Booking & Confirm
- Complete payment on Cleartrip (UPI/card/netbanking/Cleartrip wallet).
- Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: booking reference, PNR, airline, flight number, route, date, times, total paid.
- Mention: "Carry valid photo ID. Web check-in opens 48-72 hours before departure."

## Site Notes

- Cleartrip is owned by Flipkart. Clean UI, good for comparing flights quickly.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Cleartrip may show Flipkart SuperCoin offers -- mention if significant discount.
- ClearChoice Max/Plus add-on provides free cancellation -- ask user if interested.
- Bank offers (HDFC, ICICI, Axis, SBI) provide 5-12% off -- always check offers section.
- Convenience fee (Rs 200-300) may be added at checkout -- include in total.
- Cleartrip's UI is relatively clean with fewer popups than MMT/Goibibo.
- "CT Flexmax" fare allows unlimited date changes -- relevant for flexible travellers.
- Prices can change between search and checkout -- warn user if price increases.
- Domestic baggage: typically 15kg check-in + 7kg cabin. Verify per airline and fare type.
- Cleartrip wallet (CT Cash) balance can be applied at checkout -- check and mention.
- Session timeout can occur -- if redirected to login, stop and inform user.
- Use `confirm_action` for booking review, `collect_payment` for checkout. WAIT for user response.
