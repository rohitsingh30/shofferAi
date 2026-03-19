---
name: abhibus-bus
description: Book bus tickets on AbhiBus — search routes, compare operators, select seats, fill details, pay.
triggers:
  - abhibus
  - abhibus bus
  - book bus on abhibus
  - abhibus bus booking
  - bus ticket abhibus
  - abhibus bus ticket
  - abhibus travel
  - bus booking abhibus
siteUrl: https://www.abhibus.com
requiresAuth: true
params:
  - name: from
    required: true
    hint: Departure city (e.g. "Hyderabad", "Bangalore", "Chennai")
  - name: to
    required: true
    hint: Arrival city (e.g. "Vijayawada", "Tirupati", "Goa")
  - name: date
    required: true
    hint: Travel date (e.g. "March 25", "next Friday", "2026-04-10")
  - name: busType
    required: false
    hint: Bus type preference (e.g. "Sleeper", "AC", "Volvo", "Non-AC Seater")
  - name: operator
    required: false
    hint: Preferred bus operator (e.g. "APSRTC", "Orange Travels", "SRS Travels")
---

# AbhiBus Bus Ticket Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### Step 0: Collect bus journey details
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **from** (type: "text", required): Departure city
2. **to** (type: "text", required): Arrival city
3. **date** (type: "calendar", required, mode: "single"): Journey date

**CRITICAL**: Do NOT open the browser without from, to, and date.

### 1. Gather Travel Details
- Confirm from city, to city, travel date. If any missing, use `ask_user`.
- Ask for bus type preference (AC/Non-AC, Sleeper/Seater, Volvo).
- Ask if there is a preferred operator or departure time window.
- Note number of passengers and any seat preferences (window, lower berth).
- Convert relative dates to actual dates (e.g. "tomorrow" to specific date).

### 2. Open AbhiBus & Verify Login
- Open a NEW tab and navigate to `https://www.abhibus.com`.
- Take snapshot. Close any app-install banners or promotional popups.
- Verify logged in (profile icon or name visible in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search Buses
- Enter departure city in "From" field, select from autocomplete dropdown.
- Enter arrival city in "To" field, select from autocomplete dropdown.
- Select travel date from date picker.
- Click "Search Buses" button.
- Take snapshot of results page.

### 4. Filter & Present Options
- Apply filters: bus type (AC/Non-AC, Sleeper/Seater), operator (if specified), departure time window.
- Sort by price (low to high) or departure time based on user preference.
- Extract top 4-5 buses with: operator name, bus type, departure time, arrival time, duration, rating, price, available seats.
- Check for any AbhiBus offers or cashback deals.
- Use `ask_user` (input_type "choice") to present options. Format:
  "Orange Travels — AC Sleeper — Dep 9:30 PM, Arr 6:00 AM (8h 30m) — ⭐ 4.2 — ₹X,XXX — 25 seats"
- Add "Show more results" as last option.

### 5. Select Seats
- Click selected bus. Take snapshot of seat layout.
- Present available seats via `ask_user` (input_type "choice").
- Highlight window seats, lower berths (for sleeper), and seats with extra legroom.
- For multiple passengers, select seats together.
- Mention boarding and dropping points available.

### 6. Select Boarding & Dropping Points
- Present boarding point options via `ask_user` (input_type "choice").
- Present dropping point options via `ask_user` (input_type "choice").
- Include address and landmark for each point.

### 7. Review Booking
- Use `confirm_action` to present booking summary:
  - Operator name and bus type
  - Route: From city → To city
  - Date, departure time, arrival time, duration
  - Seat number(s) selected
  - Boarding point (address)
  - Dropping point (address)
  - Price breakdown: base fare, GST, service charge, total
  - Cancellation policy
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 8. Fill Passenger Details & Payment
- Fill passenger details: name, age, gender, email, phone.
- For multiple passengers, fill each.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with operator, bus type, route, date, seats, boarding/dropping, total
  - amount_inr: total amount (number)
  - description: "AbhiBus bus ticket booking"
- STOP and WAIT for payment confirmation.

### 9. Complete Booking & Confirm
- Complete payment on AbhiBus (UPI/card/netbanking/wallet).
- Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: ticket ID, operator, bus type, route, date, departure/arrival times, seat numbers, boarding point, total paid.
- Mention: "Save ticket ID. Reach boarding point 15 minutes early. Carry valid photo ID."

## Site Notes

- AbhiBus is a leading bus booking platform in India, especially strong in South India (AP, Telangana, Karnataka, Tamil Nadu).
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- AbhiBus includes both private operators and state RTC buses (APSRTC, KSRTC, TSRTC, SETC).
- Live tracking is available on most buses after boarding — share the link with user.
- Cancellation policies vary by operator — some allow free cancellation up to 6 hours before departure.
- Seat layout differs: Seater (2+2 or 2+1), Sleeper (upper/lower), Semi-Sleeper. Always show the layout.
- Prices surge during festivals (Dussehra, Diwali, Sankranti) and weekends — book early for better rates.
- Boarding points can be far from city center — always confirm address with user.
- Session can expire if idle — if redirected to login, stop and inform user.
- Use `confirm_action` for booking review, `collect_payment` for checkout. WAIT for user response.
