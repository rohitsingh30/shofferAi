---
name: wonderla-tickets
description: Book amusement park tickets at Wonderla — select park location, date, ticket type, and pay online.
triggers:
  - wonderla
  - wonderla tickets
  - wonderla booking
  - wonderla amusement park
  - book wonderla
  - wonderla bangalore
  - wonderla kochi
  - wonderla hyderabad
  - amusement park tickets
  - wonderla water park
siteUrl: https://www.wonderla.com
requiresAuth: true
params:
  - name: park
    required: true
    hint: Wonderla park location (e.g. "Bangalore", "Kochi", "Hyderabad", "Bhubaneswar")
  - name: date
    required: true
    hint: Visit date (e.g. "tomorrow", "Saturday", "March 25", "2026-04-10")
  - name: adults
    required: false
    hint: Number of adult tickets (default 2)
  - name: children
    required: false
    hint: Number of child tickets (default 0). Children aged 3-12 or below 140cm height.
  - name: ticketType
    required: false
    hint: Ticket type (e.g. "regular", "Fastrack", "combo with resort")
---

# Wonderla Amusement Park Tickets

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm park location (Bangalore, Kochi, Hyderabad, or Bhubaneswar). Use `ask_user` if not specified.
- Confirm visit date. Use `ask_user` if missing.
- Get number of adults and children. Default to 2 adults, 0 children if not specified.
- Note ticket type preference: regular, Fastrack (skip queues), or resort combo.
- Convert relative dates to actual dates.

### 2. Open Wonderla & Verify Login
- Open a NEW tab and navigate to `https://www.wonderla.com`.
- Take snapshot. Dismiss any promotional popups, offer banners, or cookie consent.
- Verify logged in (profile/account icon in header).
- If NOT logged in, login transparently using Google or email sign-in. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Select Park & Navigate to Booking
- Click on "Book Now" or navigate to the booking/tickets section.
- Select the park location (Bangalore / Kochi / Hyderabad / Bhubaneswar).
- Take snapshot of the booking page.
- Verify the correct park is selected.

### 4. Select Date & Ticket Type
- Select the visit date from the calendar/date picker.
- Take snapshot. Check if the date is available (park may be closed on certain days for maintenance).
- If date is unavailable, inform user and suggest nearest available date via `ask_user`.
- View available ticket types and pricing:
  - Regular entry
  - Fastrack (priority queue access)
  - Combo packages (park + resort, park + meals)
  - Group/family packages if available
- Present ticket options via `ask_user` (input_type "choice"). Format:
  "Regular Adult — ₹1,499/person"
  "Regular Child — ₹1,199/person"
  "Fastrack Adult — ₹1,999/person (skip ride queues)"
  "Combo: Park + Lunch Buffet — ₹1,799/person"

### 5. Set Quantity & Add to Cart
- Set number of adult and child tickets as per user requirements.
- Add any extras if offered: meal package, locker rental, photo pass.
- Use `ask_user` if optional add-ons are available: "Add lunch buffet for ₹300/person?"
- Take snapshot of cart with selected tickets.

### 6. Fill Visitor Details
- Fill in visitor details: lead visitor name, email, phone number.
- Fill additional visitor names if required by the system.
- Use details from user profile where available.
- Take snapshot after filling details.

### 7. Review & Confirm
- Take snapshot of order summary.
- Use `confirm_action` to present booking summary:
  - Park name and location
  - Visit date (day of week included)
  - Ticket type and count (adults, children)
  - Add-ons (meals, Fastrack, lockers)
  - Price per ticket, add-on charges, GST, total
  - Park timings for that day
  - Important notes (carry ID, height restrictions for rides)
- Do NOT proceed unless user confirms.

### 8. Payment
- Use `collect_payment`:
  - summary: JSON with park, date, ticket type, adults, children, add-ons, total
  - amount_inr: total amount (number)
  - description: "Wonderla amusement park tickets"
- STOP and WAIT for payment confirmation.

### 9. Complete Booking & Confirm
- Complete payment on Wonderla. Handle OTP via `ask_user` if needed.
- Take snapshot of booking confirmation page.
- Report: booking/order ID, park name, visit date, ticket details, number of visitors, total paid, e-ticket/QR code info.
- Mention: "Show the e-ticket QR code at the park entrance. Carry valid photo ID. Park opens at 11 AM (weekdays) or 11 AM (weekends). Wear comfortable clothes and carry a change for water rides."

## Site Notes

- Wonderla operates amusement parks in Bangalore, Kochi, Hyderabad, and Bhubaneswar.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Online tickets are 10-15% cheaper than gate tickets — always book online.
- Fastrack tickets let you skip ride queues and are worth the premium on weekends/holidays.
- Water park rides are included in the regular ticket — no separate entry needed.
- Parks are closed on select Tuesdays for maintenance — verify date availability before booking.
- Height restriction: children below 90cm may not be allowed on most rides. Below 140cm = child ticket.
- Weekend and holiday pricing is higher than weekday pricing — inform user of the difference.
- Lockers, meals, and rain ponchos can be bought at the park — pre-booking meals saves money.
- Monsoon season (Jun-Sep): water rides may be closed, but dry rides operate. Mention this if applicable.
- Use `confirm_action` for booking review, `collect_payment` for checkout. WAIT for user response.
