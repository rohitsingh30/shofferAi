---
name: townscript-events
description: Book events on Townscript — workshops, marathons, runs, festivals, tech events. Browse, register, pay.
triggers:
  - townscript
  - townscript event
  - book event townscript
  - townscript workshop
  - townscript marathon
  - townscript run
  - townscript festival
  - register event townscript
  - townscript tickets
  - townscript conference
siteUrl: https://www.townscript.com
requiresAuth: true
params:
  - name: event
    required: true
    hint: Event name or type (e.g. "marathon", "hackathon", "food festival", "yoga workshop", "5K run")
  - name: city
    required: false
    hint: City (e.g. "Pune", "Mumbai", "Bangalore", "Delhi", "Hyderabad")
  - name: date
    required: false
    hint: Preferred date (e.g. "this weekend", "next month", "April")
  - name: tickets
    required: false
    hint: Number of tickets or registrations (e.g. "1", "2 passes")
  - name: category
    required: false
    hint: Category (e.g. "Sports & Fitness", "Technology", "Food & Drink", "Art & Culture", "Kids")
---

# Townscript Event Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine: event type or name, city, date preference, number of tickets, category.
- If user is vague (e.g. "find a marathon near me"), ask for city and date preference.
- Use `ask_user` for missing info: "What kind of event? Marathon, workshop, festival, hackathon?"
- Get: city, preferred date/month, number of registrations, any t-shirt size preference (for runs).
- Ask about budget: free, budget-friendly, or premium events.

### 2. Open Townscript & Verify Login
- Open a NEW tab and navigate to `https://www.townscript.com`.
- Take snapshot. Verify logged in (check for profile icon or user name).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Set location/city if needed.

### 3. Search & Browse Events
- Use search bar or browse by category to find events.
- Apply filters: city, category (Sports & Fitness, Technology, Food & Drink, Art, Kids), date range, price.
- Take snapshot. Extract top 5 events: event name, organizer, venue, date, time, price, description, registration count.
- Present via `ask_user` (input_type "choice"):
  "Event Name — Organizer — Venue — Date — ₹price — Category — X registered"
- Click the selected event.

### 4. Event Details & Ticket Type
- Event detail page shows description, schedule, venue map, organizer info, FAQ.
- Take snapshot. Show key details: event description, schedule, what to expect, inclusions.
- If multiple ticket types (e.g. for a marathon: 5K, 10K, Half Marathon, Full Marathon), present via `ask_user` (input_type "choice"):
  "5K Run — ₹500 (T-shirt + Medal)", "10K Run — ₹800 (T-shirt + Medal + Refreshments)", "Half Marathon — ₹1,200"
- Select ticket type and quantity.

### 5. Fill Registration Form
- Townscript events often have custom registration forms (name, phone, email, emergency contact, t-shirt size, etc.).
- Fill from profile data where possible.
- Use `ask_user` for event-specific fields: "T-shirt size? S/M/L/XL/XXL" or "Emergency contact name and phone?"
- Take snapshot of completed form.

### 6. Review & Confirm
- Proceed to order summary. Take snapshot.
- Use `confirm_action`:
  - Event name and organizer
  - Venue name and address
  - Date and time (reporting time + event start time)
  - Ticket/registration type
  - Number of registrations
  - Price per ticket, platform fee, GST, total
  - Inclusions (t-shirt, medal, refreshments, certificate, etc.)
  - Kit collection details (for runs/marathons)
  - Cancellation/transfer policy
- Do NOT proceed unless user confirms.

### 7. Payment
- If free event, proceed to registration directly.
- If paid event:
  - Use `collect_payment`:
    - summary: JSON with event, venue, date, ticket_type, quantity, inclusions, total
    - amount_inr: total amount
    - description: "Townscript event registration"
  - WAIT for payment confirmation.

### 8. Complete & Confirm
- Complete registration/payment on Townscript. Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: registration ID, event name, venue, date, time, ticket type, inclusions, total paid, confirmation details.
- For runs/marathons: "Collect your BIB and kit from [venue] on [date]. Carry photo ID and confirmation email."
- For workshops: "Venue opens at [time]. Carry laptop if required. Certificate will be emailed post-event."
- Share venue location and parking information if available.

## Site Notes

- Townscript is a popular Indian event ticketing platform — especially strong for marathons, runs, hackathons, workshops, and local festivals.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Session may expire after 30 days — if login wall appears, ask user to re-login manually in Chrome Debug.
- Townscript has many free events — community meetups, introductory workshops, open-mic nights.
- Platform fee: 2-4% charged by Townscript on paid events — usually included in the displayed price.
- Marathons and runs are very popular on Townscript — they have BIB collection, timing chips, route maps.
- Early Bird pricing is common — often 20-40% cheaper than regular tickets. Check for active early bird.
- Group discounts may be available for some events — ask organizer via Townscript messaging if needed.
- Kit collection for runs typically happens 1-2 days before the event — inform user about dates and venue.
- Refund/transfer policy is set by organizer — some allow transfers to other participants, some are non-refundable.
- Use `confirm_action` for review, `collect_payment` for paid events. WAIT for user response at each step.
