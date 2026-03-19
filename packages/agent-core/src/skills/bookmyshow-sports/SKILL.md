---
name: bookmyshow-sports
description: Book sports event tickets on BookMyShow — IPL, ISL, PKL, WPL cricket and football matches. Search, select seats, pay.
triggers:
  - bookmyshow sports
  - book ipl tickets
  - ipl match tickets
  - book isl tickets
  - book pkl tickets
  - cricket match tickets
  - football match tickets
  - sports event tickets
  - wpl tickets
  - kabaddi match tickets
  - stadium tickets
siteUrl: https://in.bookmyshow.com
requiresAuth: true
params:
  - name: event
    required: true
    hint: Sports event or match (e.g. "IPL CSK vs MI", "ISL Bengaluru FC", "PKL Tamil Thalaivas")
  - name: city
    required: false
    hint: City (e.g. "Mumbai", "Chennai", "Bangalore", "Delhi", "Kolkata")
  - name: date
    required: false
    hint: Preferred date or match day (e.g. "this weekend", "April 10", "next home match")
  - name: tickets
    required: false
    hint: Number of tickets and seating preference (e.g. "2 tickets, corporate box", "4 general stand")
  - name: budget
    required: false
    hint: Budget per ticket (e.g. "under 2000", "premium", "cheapest available")
---

# BookMyShow Sports Event Tickets

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect booking preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **what** (type: "text", required): Movie name, event, or "what's showing"
2. **date** (type: "chip_bar"): Today, Tomorrow, This Weekend
3. **tickets** (type: "stepper"): Number of tickets, counter with default 2, min 1, max 10

**CRITICAL**: Do NOT open the browser without knowing what to book.
### 1. Gather Match Details
- Confirm: sport (cricket/football/kabaddi), league (IPL/ISL/PKL/WPL), teams or match, city, date.
- If user says "book IPL tickets", ask which match or team they support.
- Use `ask_user` for missing info: "Which match? E.g. CSK vs MI, RCB vs KKR?"
- Get: number of tickets, seating preference (general, premium, corporate box), budget.
- If user is flexible, will show upcoming matches for their preferred team.

### 2. Open BookMyShow & Set City
- Open a NEW tab and navigate to `https://in.bookmyshow.com`.
- Take snapshot. If city selection popup appears, select the correct city (match venue city).
- Verify logged in (profile icon visible in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search for Sports Events
- Navigate to "Sports" category or search for the specific match/team.
- Apply filters: sport type, date range.
- Take snapshot. Extract matching events with: match name, teams, venue (stadium), date, time, price range.
- If multiple matches found, present top 5 via `ask_user` (input_type "choice"):
  "CSK vs MI — MA Chidambaram Stadium, Chennai — April 12, 7:30 PM — ₹800-15,000"
- Click the selected match.

### 4. Select Ticket Category & Stands
- Match detail page shows stadium layout with stand/section options and pricing.
- Take snapshot. Present stand categories via `ask_user` (input_type "choice"):
  "General Stand — ₹800", "Premium Stand — ₹2,000", "Pavilion — ₹5,000", "Corporate Box — ₹15,000"
- Select the chosen category and number of tickets.
- If stadium has seat map, pick best available seats (prefer center-pitch view, good elevation).
- Take snapshot showing selected tickets.

### 5. Fill Attendee Details
- If required, fill attendee names and ID details for stadium entry.
- Use pre-filled profile data where possible.
- If additional info needed (e.g. ID proof type), use `ask_user`.

### 6. Review & Confirm
- Proceed to booking summary. Take snapshot.
- Use `confirm_action`:
  - Match: teams and league
  - Venue: stadium name and city
  - Date and time (gates open time + match start time)
  - Stand/section and seat numbers
  - Number of tickets
  - Price per ticket, convenience fee, total
  - Entry rules (no outside food, bag size restrictions)
- Do NOT proceed unless user confirms.

### 7. Payment
- Use `collect_payment`:
  - summary: JSON with match, venue, date, time, stand, seats, tickets, total
  - amount_inr: total amount
  - description: "BookMyShow sports event tickets"
- WAIT for payment confirmation.

### 8. Complete & Confirm
- Complete payment on BookMyShow. Handle OTP via `ask_user` if needed.
- Take snapshot of ticket/confirmation page.
- Report: booking ID, match details, venue, date, time, stand, seat numbers, total paid, e-ticket info.
- Remind: "Gates open 2 hours before match. Carry valid photo ID matching the booking. No outside food/drinks allowed. Download e-ticket or keep QR code ready."
- Mention parking info and nearest metro station if visible on page.

## Site Notes

- BookMyShow is the primary platform for IPL, ISL, PKL, WPL, and international cricket/football match tickets in India.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Session may expire after 30 days — if login wall appears, ask user to re-login manually in Chrome Debug.
- IPL tickets sell out extremely fast — "Fast Filling" means book immediately, do not browse around.
- Convenience fee: ₹50-200 per ticket for sports events — included in the total shown to user.
- Resale/scalping is not supported — if "Sold Out", suggest alternative matches or stands.
- Bank offers (HDFC, ICICI, SBI) may give 10-15% off — always check and apply best coupon at checkout.
- Stadium entry requires valid photo ID (Aadhaar, PAN, Passport) — remind user to carry one.
- Some stadiums have e-ticket only (no physical tickets) — QR code on phone is sufficient.
- Rain-affected matches: refund policies vary by organizer — mention if visible during booking.
- Use `confirm_action` for review, `collect_payment` for checkout. WAIT for user response at each step.
