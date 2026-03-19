---
name: insider-events
description: Book events, workshops, and experiences on Insider.in — browse events, select tickets, pay.
triggers:
  - insider.in
  - insider events
  - book event insider
  - insider workshop
  - insider comedy
  - insider music
  - insider experience
  - book workshop insider
  - insider tickets
  - insider food festival
siteUrl: https://insider.in
requiresAuth: true
params:
  - name: event
    required: true
    hint: Event name or type (e.g. "comedy show", "food festival", "music workshop", "tech meetup")
  - name: city
    required: false
    hint: City (e.g. "Mumbai", "Delhi", "Bangalore", "Pune", "Hyderabad")
  - name: date
    required: false
    hint: Preferred date (e.g. "this weekend", "Saturday", "next month")
  - name: tickets
    required: false
    hint: Number of tickets (e.g. "2 tickets", "1 pass")
  - name: category
    required: false
    hint: Event category (e.g. "Comedy", "Music", "Workshops", "Food & Drink", "Outdoor", "Screening")
---

# Insider.in Event Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect booking preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **what** (type: "text", required): Movie name, event, or "what's showing"
2. **date** (type: "chip_bar"): Today, Tomorrow, This Weekend
3. **tickets** (type: "stepper"): Number of tickets, counter with default 2, min 1, max 10

**CRITICAL**: Do NOT open the browser without knowing what to book.
### 1. Gather Event Requirements
- Determine: event name or type, city, date preference, number of tickets, category.
- If user is vague (e.g. "find something fun this weekend"), ask about preferences.
- Use `ask_user` for missing info: "What kind of event? Comedy, music, workshop, food festival, outdoor activity?"
- Get city and date preferences if not provided.
- Ask about group size for ticket quantity.

### 2. Open Insider.in & Verify Login
- Open a NEW tab and navigate to `https://insider.in`.
- Take snapshot. Verify logged in (check for profile icon or user name).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Set city if prompted or if different from user's preference.

### 3. Search & Browse Events
- Use search bar or category navigation to find events.
- Apply filters: city, category (Comedy, Music, Workshops, Food & Drink, Outdoor, etc.), date range.
- Take snapshot. Extract top 5 events: event name, venue, date(s), time, price range, category, description snippet.
- Present via `ask_user` (input_type "choice"):
  "Event Name — Venue — Date Time — ₹price — Category — Brief description"
- Click the selected event.

### 4. Event Details & Ticket Type
- Event detail page shows full description, venue, dates, ticket types.
- Take snapshot. Show event details: description, lineup/speakers, venue, timings.
- If multiple ticket types (Early Bird, General, VIP, Group Pass), present via `ask_user` (input_type "choice"):
  "Early Bird — ₹499 (Limited)", "General — ₹799", "VIP — ₹1,999 (Includes F&B)"
- Select ticket type and quantity.

### 5. Select Date & Time (if multi-day)
- If event has multiple dates or time slots, present via `ask_user` (input_type "choice").
- Select the chosen date/time.
- Take snapshot of selected tickets.

### 6. Review & Confirm
- Proceed to booking summary. Take snapshot.
- Use `confirm_action`:
  - Event name and description
  - Venue name and full address
  - Date and time
  - Ticket type and quantity
  - Price per ticket, convenience fee, GST, total
  - What's included (F&B, merch, etc.)
  - Age restrictions or dress code if any
  - Cancellation/refund policy
- Do NOT proceed unless user confirms.

### 7. Payment
- Use `collect_payment`:
  - summary: JSON with event, venue, date, time, ticket_type, quantity, total
  - amount_inr: total amount
  - description: "Insider.in event tickets"
- WAIT for payment confirmation.

### 8. Complete & Confirm
- Complete payment on Insider.in. Handle OTP via `ask_user` if needed.
- Take snapshot of booking confirmation page.
- Report: booking ID, event name, venue and address, date, time, ticket type, quantity, total paid, e-ticket/QR info.
- Remind: "Show the e-ticket QR code at the venue entrance. Arrive 15-30 minutes early."
- Mention any special instructions from the event page (what to bring, parking, etc.).

## Site Notes

- Insider.in (by Paytm) is a major events platform in India — comedy, music, workshops, food festivals, outdoor adventures, screenings.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Session may expire after 30 days — if login wall appears, ask user to re-login manually in Chrome Debug.
- Insider.in has both free and paid events — always check for free events in the user's interest area.
- Early Bird tickets are significantly cheaper (30-50% off) but sell out fast — always check availability first.
- Convenience fee: typically 5-10% of ticket price — included in total shown to user.
- Popular events (big comedy shows, music festivals) sell out quickly — "Selling Fast" tag means act quickly.
- Some events are online (virtual workshops, webinars) — clarify if user wants in-person or online.
- Refund policy varies per event — some are fully non-refundable, others offer partial refunds up to 48 hours before.
- Paytm wallet and UPI payments may get cashback offers — check during payment.
- Use `confirm_action` for review, `collect_payment` for checkout. WAIT for user response at each step.
