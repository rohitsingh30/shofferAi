---
name: paytm-insider
description: Book entertainment events on Paytm Insider — comedy shows, music concerts, food festivals, nightlife. Browse, select, pay.
triggers:
  - paytm insider
  - insider event
  - book comedy show
  - book music event
  - food festival tickets
  - nightlife event
  - paytm insider tickets
  - standup comedy insider
  - live music insider
  - weekend event tickets
  - paytm insider comedy
siteUrl: https://insider.in
requiresAuth: true
params:
  - name: event
    required: true
    hint: Event name or type (e.g. "standup comedy", "live music", "food festival", "DJ night", "open mic")
  - name: city
    required: false
    hint: City (e.g. "Mumbai", "Bangalore", "Delhi", "Pune", "Hyderabad", "Chennai")
  - name: date
    required: false
    hint: Preferred date (e.g. "this Friday", "weekend", "tonight", "next Saturday")
  - name: tickets
    required: false
    hint: Number of tickets (e.g. "2", "4 tickets", "couple pass")
  - name: genre
    required: false
    hint: Genre or mood (e.g. "comedy", "Bollywood music", "EDM", "jazz", "open mic", "art exhibition")
---

# Paytm Insider Entertainment Events

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect booking preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **what** (type: "text", required): Movie name, event, or "what's showing"
2. **date** (type: "chip_bar"): Today, Tomorrow, This Weekend
3. **tickets** (type: "stepper"): Number of tickets, counter with default 2, min 1, max 10

**CRITICAL**: Do NOT open the browser without knowing what to book.
### 1. Gather Event Preferences
- Determine: event type or name, city, date preference, number of tickets, genre/mood.
- If user says "plan something fun this weekend", ask about preferences.
- Use `ask_user` for missing info: "What are you in the mood for? Comedy, live music, food festival, art, nightlife?"
- Get city, date (especially day/evening/night preference), group size.
- Ask about budget range if not specified.

### 2. Open Paytm Insider & Verify Login
- Open a NEW tab and navigate to `https://insider.in`.
- Take snapshot. Verify logged in (check for profile icon or user name in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Set city if prompted or needed.

### 3. Browse & Search Events
- Use search bar or browse categories: Comedy, Music, Food & Drink, Nightlife, Art, Outdoor, Workshops, Screening.
- Apply filters: city, category, date range, price (free/paid), time of day.
- Take snapshot. Extract top 5 events: event name, venue, date, time, price range, genre, artist/host, ratings/popularity.
- Present via `ask_user` (input_type "choice"):
  "Event Name — Venue — Date Time — ₹price — Genre — Artist/Host"
- Click the selected event.

### 4. Event Details & Ticket Type
- Event detail page shows description, lineup, venue details, terms.
- Take snapshot. Show: event description, lineup/performers, venue, dress code, age restriction.
- If multiple ticket tiers (General, VIP, Couple, Group, Table), present via `ask_user` (input_type "choice"):
  "General — ₹499", "VIP — ₹999 (Priority entry + 1 drink)", "Couple — ₹1,499", "Table for 4 — ₹3,999 (Reserved seating + bottle)"
- Select ticket type and quantity.

### 5. Select Date/Show Time (if applicable)
- Some events have multiple show times (e.g. comedy: 6 PM show, 9 PM show).
- Present via `ask_user` (input_type "choice") if multiple options.
- Take snapshot of selected tickets.

### 6. Review & Confirm
- Proceed to booking summary. Take snapshot.
- Use `confirm_action`:
  - Event name, artist/performer/host
  - Venue name and full address
  - Date and time (doors open + show start)
  - Ticket type, quantity
  - Price per ticket, convenience fee, GST, total
  - Inclusions (drinks, food, merch)
  - Age restriction and dress code
  - Entry rules (ID required, no outside F&B)
  - Cancellation/refund policy
- Do NOT proceed unless user confirms.

### 7. Payment
- Use `collect_payment`:
  - summary: JSON with event, artist, venue, date, time, ticket_type, quantity, total
  - amount_inr: total amount
  - description: "Paytm Insider event tickets"
- WAIT for payment confirmation.

### 8. Complete & Confirm
- Complete payment on Paytm Insider. Handle OTP via `ask_user` if needed.
- Take snapshot of booking confirmation page.
- Report: booking ID, event name, venue and address, date, time, ticket type, quantity, total paid, e-ticket/QR code.
- Remind: "Show e-ticket QR at the entrance. Carry valid photo ID. Arrive 15-30 minutes before show time."
- Mention parking availability, nearest metro, and any dress code requirements.
- For nightlife events: "Cover charge may include drinks — check inclusions. Stag entry policies may apply."

## Site Notes

- Paytm Insider (insider.in) is one of India's top entertainment event platforms — comedy, music, food festivals, nightlife, art, workshops.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Session may expire after 30 days — if login wall appears, ask user to re-login manually in Chrome Debug.
- Paytm Insider and Insider.in are the same platform — Paytm acquired Insider. Both URLs redirect to insider.in.
- Popular comedy shows (Zakir Khan, Biswa, Abhishek Upmanyu) sell out within hours — "Selling Fast" means hurry.
- Convenience fee: typically 5-10% per ticket — always included in total shown to user.
- Couple/pair passes are cheaper per person than individual tickets — suggest if user is going with a partner.
- Nightlife events may have stag entry restrictions or higher pricing for men — check and inform.
- Some events are 18+ or 21+ — always mention age restrictions visible on the event page.
- Paytm wallet payments may earn cashback — check for active offers during payment.
- Food festivals often have free entry but paid food coupons — clarify what the ticket includes.
- Use `confirm_action` for review, `collect_payment` for checkout. WAIT for user response at each step.
