---
name: bookmyshow-event
description: Book concert, comedy show, or live event tickets on BookMyShow — search events, select seats, pay.
triggers:
  - bookmyshow event
  - book concert tickets
  - comedy show tickets
  - live event tickets
  - book event
  - concert booking
  - standup comedy tickets
  - music concert
  - book live show
  - bms event tickets
siteUrl: https://in.bookmyshow.com
requiresAuth: true
params:
  - name: event
    required: true
    hint: Event name or type (e.g. "Arijit Singh concert", "standup comedy", "Sunburn festival")
  - name: city
    required: false
    hint: City (e.g. "Delhi", "Mumbai", "Bangalore"). Auto-detected if already set on BMS.
  - name: date
    required: false
    hint: Preferred date (e.g. "this weekend", "Saturday", "April 15")
  - name: tickets
    required: false
    hint: Number of tickets (default 2) and seating preference (e.g. "2 tickets, VIP")
---

# BookMyShow Event Tickets

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect booking preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **what** (type: "text", required): Movie name, event, or "what's showing"
2. **date** (type: "chip_bar"): Today, Tomorrow, This Weekend
3. **tickets** (type: "stepper"): Number of tickets, counter with default 2, min 1, max 10

**CRITICAL**: Do NOT open the browser without knowing what to book.
### 1. Gather Event Details
- Confirm event name or type. If user said "comedy show near me" or a genre, will browse what's available.
- Get: city (if not set), date preference, number of tickets, seating category preference.
- Use `ask_user` for missing critical info (event name or type at minimum).

### 2. Open BookMyShow & Set City
- Open a NEW tab and navigate to `https://in.bookmyshow.com`.
- Take snapshot. If city selection popup appears, select the user's city.
- Verify logged in (profile icon visible in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search for Events
- Navigate to "Events" section or use the search bar to find the event.
- Apply filters: city, date range, event category (Music, Comedy, Workshops, Sports, etc.).
- Take snapshot. Extract top 3-5 matching events with: event name, venue, date(s), price range, artist/performer.
- Use `ask_user` (input_type "choice") to let user pick an event.
- Click the selected event to open its detail page.

### 4. Select Date & Time
- Event detail page shows available dates and times. Take snapshot.
- If multiple dates available, present via `ask_user` (input_type "choice").
- If multiple time slots on the same date, present via `ask_user` (input_type "choice").
- Click the selected date/time.

### 5. Select Ticket Category & Seats
- Ticket selection page shows categories: General, Silver, Gold, VIP, Fan Pit, etc. with prices.
- Take snapshot. Present categories via `ask_user` (input_type "choice"):
  "Gold — ₹2,500/ticket", "VIP — ₹5,000/ticket", "Fan Pit — ₹8,000/ticket".
- Select the requested number of tickets in chosen category.
- If seat map is available, pick best available seats (prefer center, good view).
- Take snapshot showing selected tickets/seats.

### 6. Review & Confirm
- Proceed to booking summary. Take snapshot.
- Use `confirm_action`:
  - Event name, artist/performer
  - Venue name and address
  - Date and time
  - Ticket category, number of tickets
  - Seat numbers (if assigned seating)
  - Price per ticket, convenience fee, total
- Do NOT proceed unless user confirms.

### 7. Payment
- Use `collect_payment`:
  - summary: JSON with event, venue, date, time, tickets, category, total
  - amount_inr: total amount
  - description: "BookMyShow event tickets"
- WAIT for payment confirmation.

### 8. Complete & Confirm
- Complete payment on BookMyShow. Handle OTP via `ask_user` if needed.
- Take snapshot of ticket/confirmation page.
- Report: booking ID, event name, venue, date, time, ticket category, seat numbers, total paid, e-ticket/QR info.
- Mention: "Show this e-ticket at the venue entrance. Arrive 30 minutes early for security check."

## Site Notes

- BookMyShow hosts concerts, comedy shows, workshops, sports events, and festivals across India.
- Convenience fee: ₹50-150 per ticket for events — always included in total shown to user.
- Popular events (Arijit Singh, Coldplay, IPL) sell out within minutes — "Fast Filling" tag means hurry.
- "Sold Out" events cannot be booked — suggest alternative dates or similar events.
- VIP/Fan Pit categories are significantly more expensive (3-10x) — always clarify user's budget preference.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator's phone.
- Events may have age restrictions (e.g. 18+ for comedy/pubs) — inform user if visible.
- Some events offer early bird discounts — mention if available.
- Cancellation policy varies by event — some are non-refundable. Mention policy during confirm step.
- Bank offers (HDFC, ICICI, SBI) may give 10-15% off — always check and apply best coupon.
- Use `confirm_action` for review, `collect_payment` for checkout. WAIT for user response at each step.
