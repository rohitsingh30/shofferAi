---
name: mmt-bus
description: Book bus tickets on MakeMyTrip — search routes, filter by operator/type, select seats, fill details, pay.
triggers:
  - makemytrip bus
  - mmt bus
  - book bus on makemytrip
  - mmt bus ticket
  - makemytrip bus booking
  - bus on mmt
  - mmt bus travel
  - makemytrip bus ticket booking
siteUrl: https://www.makemytrip.com/bus-tickets
requiresAuth: true
params:
  - name: from
    required: true
    hint: Departure city (e.g. "Delhi", "Bangalore", "Mumbai")
  - name: to
    required: true
    hint: Arrival city (e.g. "Jaipur", "Chennai", "Goa")
  - name: date
    required: true
    hint: Travel date (e.g. "March 25", "next Friday", "2026-04-10")
  - name: busType
    required: false
    hint: Bus type preference (e.g. "AC Sleeper", "Volvo", "Non-AC Seater", "Multi-Axle")
  - name: operator
    required: false
    hint: Preferred operator (e.g. "VRL", "SRS", "Orange Travels", "KSRTC")
  - name: departureTime
    required: false
    hint: Preferred departure window (e.g. "evening", "after 9 PM", "morning")
---

# MakeMyTrip Bus Ticket Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Travel Details
- Confirm from city, to city, travel date. If any missing, use `ask_user`.
- Ask for bus type preference: AC/Non-AC, Sleeper/Seater/Semi-Sleeper, Volvo/Multi-Axle.
- Ask for preferred departure time window (morning, afternoon, evening, night).
- Note if there is a preferred operator.
- Note number of passengers and any seat preferences (window, lower berth for sleeper).
- Convert relative dates to actual dates.

### 2. Open MakeMyTrip Buses & Verify Login
- Open a NEW tab and navigate to `https://www.makemytrip.com/bus-tickets`.
- Take snapshot. Close any app-install banners, login prompts, or promotional popups.
- Verify logged in (profile icon or name visible in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Dismiss MMT aggressive popups immediately.

### 3. Search Buses
- Enter departure city in "From" field, select from autocomplete dropdown.
- Enter arrival city in "To" field, select from autocomplete dropdown.
- Select travel date from date picker.
- Click "Search" button.
- Take snapshot of results page.

### 4. Filter & Present Options
- Apply filters: bus type (AC/Non-AC, Sleeper/Seater, Volvo), departure time window, operator.
- Sort by: "Price" (low to high), "Departure Time", "Rating", or "Fastest".
- Extract top 4-5 buses with: operator name, bus type (AC Sleeper, Non-AC Seater, etc.), departure time, arrival time, duration, MMT rating, price, available seats.
- Check for MMT Super offers, cashback, or bank discounts (HDFC, ICICI).
- Use `ask_user` (input_type "choice") to present options. Format:
  "VRL Travels — Volvo Multi-Axle AC Sleeper — Dep 10:00 PM, Arr 6:30 AM (8h 30m) — ⭐ 4.5 — ₹X,XXX — 18 seats"
- Add "Show more results" as last option.

### 5. Select Seats
- Click selected bus. Take snapshot of seat layout.
- Show seat layout diagram: available (green), booked (gray), selected (blue).
- Present available seats with position info (window/aisle, upper/lower for sleeper).
- Use `ask_user` (input_type "choice") to let user pick seats.
- For multiple passengers, help select adjacent/nearby seats.

### 6. Select Boarding & Dropping Points
- Present boarding points with address and time via `ask_user` (input_type "choice").
- Present dropping points with address and time via `ask_user` (input_type "choice").
- Include landmark references for each point.
- Warn if boarding point is far from city center.

### 7. Review Booking
- Use `confirm_action` to present booking summary:
  - Operator name and bus type
  - Route: From → To
  - Date, departure time, arrival time, duration
  - Seat number(s) selected (with position: window/aisle, upper/lower)
  - Boarding point (name, address, boarding time)
  - Dropping point (name, address)
  - Price breakdown: base fare per seat, GST, MMT service fee, discount, total
  - Cancellation policy (operator-specific)
  - Rating and reviews summary
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 8. Fill Passenger Details & Payment
- Fill passenger details: name, age, gender, email, phone.
- For multiple passengers, fill each.
- Apply any MMT coupon or offer if available.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with operator, bus type, route, date, seats, boarding/dropping, total
  - amount_inr: total amount (number)
  - description: "MakeMyTrip bus ticket booking"
- STOP and WAIT for payment confirmation.

### 9. Complete Booking & Confirm
- Complete payment on MakeMyTrip (UPI/card/netbanking/wallet).
- Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: ticket ID/booking reference, operator, bus type, route, date, departure/arrival times, seat numbers, boarding point with address, total paid.
- Mention: "Save booking ID. Reach boarding point 15 minutes before departure. Carry valid photo ID. Track bus live on MMT app."

## Site Notes

- MakeMyTrip is India's largest OTA and offers extensive bus booking with wide operator coverage across India.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- MMT shows aggressive popups on load (app download, login prompts, newsletter) — dismiss all immediately.
- MMT aggregates both private operators (VRL, SRS, Orange, IntrCity) and state RTCs (KSRTC, APSRTC, UPSRTC).
- "MMT Assured" buses are quality-verified with guaranteed amenities — prefer these for better experience.
- Bank offers (HDFC, ICICI, Axis) can give 10-15% instant discount — always check at checkout.
- Bus type hierarchy: Multi-Axle Volvo AC Sleeper > AC Sleeper > AC Seater > Non-AC Sleeper > Non-AC Seater.
- Cancellation charges vary by operator and time before departure — can be 10% to 100% of fare.
- Live tracking available on most buses after departure — share tracking link with user.
- Prices surge on festival weekends and long weekends — book 3-5 days in advance for better rates.
- Session can expire if idle too long — if redirected to login, stop and inform user.
- Use `confirm_action` for booking review, `collect_payment` for checkout. WAIT for user response.
