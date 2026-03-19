---
name: imagica-tickets
description: Book Imagica theme park tickets — select park (Theme Park, Water Park, Snow Park), date, package, and pay online.
triggers:
  - imagica
  - imagica tickets
  - adlabs imagica
  - imagica booking
  - book imagica
  - imagica theme park
  - imagica water park
  - imagica snow park
  - theme park tickets
  - imagica khopoli
siteUrl: https://www.imagicaa.com
requiresAuth: true
params:
  - name: parkType
    required: false
    hint: Park type (e.g. "Theme Park", "Water Park", "Snow Park", "All 3 parks combo")
  - name: date
    required: true
    hint: Visit date (e.g. "tomorrow", "Saturday", "March 25", "2026-04-10")
  - name: adults
    required: false
    hint: Number of adult tickets (default 2)
  - name: children
    required: false
    hint: Number of child tickets (default 0). Children aged 3-12 or below 140cm.
  - name: package
    required: false
    hint: Package type (e.g. "regular", "combo all parks", "park + meals", "park + hotel stay")
---

# Imagica Theme Park Tickets

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect booking preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **what** (type: "text", required): Movie name, event, or "what's showing"
2. **date** (type: "chip_bar"): Today, Tomorrow, This Weekend
3. **tickets** (type: "stepper"): Number of tickets, counter with default 2, min 1, max 10

**CRITICAL**: Do NOT open the browser without knowing what to book.
### 1. Gather Requirements
- Confirm visit date. Use `ask_user` if missing.
- Ask which park(s) user wants to visit if not specified:
  - Theme Park (rides, shows, attractions)
  - Water Park (slides, wave pool, lazy river)
  - Snow Park (indoor snow experience)
  - Combo (multiple parks)
- Get number of adults and children. Default to 2 adults, 0 children.
- Note package preference: regular, with meals, with hotel stay.
- Convert relative dates to actual dates.

### 2. Open Imagica & Verify Login
- Open a NEW tab and navigate to `https://www.imagicaa.com`.
- Take snapshot. Dismiss any promotional popups, seasonal offer banners, or cookie consent.
- Verify logged in (profile/account icon in header).
- If NOT logged in, login transparently using Google or email sign-in. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Navigate to Booking
- Click "Book Now" or navigate to the tickets/booking section.
- Take snapshot of the booking page.
- Select the park type (Theme Park, Water Park, Snow Park, or Combo).

### 4. Select Date & Package
- Select visit date from the calendar.
- Take snapshot. Check if the date is available and note if it is a peak day (weekend/holiday with higher pricing).
- If date unavailable, inform user and suggest nearest available date via `ask_user`.
- View available packages and pricing. Present via `ask_user` (input_type "choice"). Format:
  "Theme Park Regular — ₹1,499/adult, ₹1,199/child"
  "Water Park Regular — ₹999/adult, ₹799/child"
  "Theme + Water Combo — ₹1,999/adult, ₹1,599/child"
  "All 3 Parks Combo — ₹2,499/adult, ₹1,999/child"
  "Theme Park + Unlimited Meals — ₹1,999/adult"
  "Theme Park + Hotel Stay (Novotel) — ₹4,999/person"

### 5. Set Quantity & Add-ons
- Set number of adult and child tickets.
- Check for available add-ons: meal packages, Fastrack ride access, locker rental, parking pass.
- Present add-ons via `ask_user`:
  "Add Unlimited Meals — ₹500/person"
  "Add Fastrack (skip queues) — ₹700/person"
  "Add Parking Pass — ₹200"
  "No add-ons"
- Take snapshot of cart with all selections.

### 6. Fill Visitor Details
- Fill visitor details: lead visitor name, email, phone number.
- Fill additional visitor names/ages if required (especially for child tickets).
- Use details from user profile where available.
- Apply any promo code or coupon if user has one.
- Take snapshot after filling details.

### 7. Review & Confirm
- Take snapshot of order summary.
- Use `confirm_action` to present booking summary:
  - Park(s) selected
  - Visit date (include day of week)
  - Package type
  - Number of adults and children
  - Add-ons (meals, Fastrack, locker, parking)
  - Price breakdown: base tickets, add-ons, GST, discount (if promo applied), total
  - Park timings and location (Khopoli, Mumbai-Pune Expressway)
  - Important: carry photo ID, height restrictions for rides
- Do NOT proceed unless user confirms.

### 8. Payment
- Use `collect_payment`:
  - summary: JSON with park, date, package, adults, children, add-ons, promo code, total
  - amount_inr: total amount (number)
  - description: "Imagica theme park tickets"
- STOP and WAIT for payment confirmation.

### 9. Complete Booking & Confirm
- Complete payment on Imagica. Handle OTP via `ask_user` if needed.
- Take snapshot of booking confirmation page.
- Report: booking/order ID, park(s), visit date, package, visitor count, add-ons, total paid, e-ticket details.
- Mention: "Show the e-ticket QR code at the park entrance. Imagica is located on the Mumbai-Pune Expressway near Khopoli. Park opens at 10:30 AM. Carry comfortable clothes, sunscreen, and a change of clothes for water rides."

## Site Notes

- Imagica (Adlabs Imagicaa) is India's premier theme park located near Khopoli on the Mumbai-Pune Expressway.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Three parks on the same campus: Theme Park, Water Park, Snow Park — each requires separate or combo ticket.
- Online prices are typically 20-30% cheaper than gate prices — always book online.
- Combo tickets (Theme + Water) offer best value — recommend unless user specifically wants only one park.
- Snow Park is indoor and air-conditioned — jackets provided at entry. Duration: 30-45 minutes.
- Peak days (weekends, holidays, school vacations) have higher pricing and longer ride queues.
- Imagica is ~90 min drive from Mumbai, ~2 hours from Pune. Mention travel time in planning.
- Novotel hotel is on-site for overnight stays — combo packages with hotel are available.
- Some rides have height restrictions (min 120cm or 140cm) — relevant for children.
- Use `confirm_action` for booking review, `collect_payment` for checkout. WAIT for user response.
