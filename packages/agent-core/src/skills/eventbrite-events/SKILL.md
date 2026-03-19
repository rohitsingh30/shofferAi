---
name: eventbrite-events
description: Find and book events on Eventbrite India — workshops, meetups, conferences, networking events. Browse, register, pay.
triggers:
  - eventbrite
  - eventbrite event
  - book event eventbrite
  - eventbrite workshop
  - eventbrite meetup
  - eventbrite conference
  - eventbrite india
  - tech meetup eventbrite
  - networking event
  - eventbrite tickets
siteUrl: https://www.eventbrite.com
requiresAuth: true
params:
  - name: event
    required: true
    hint: Event name, topic, or type (e.g. "AI workshop", "startup meetup", "marketing conference", "photography class")
  - name: city
    required: false
    hint: City (e.g. "Bangalore", "Mumbai", "Delhi", "Hyderabad", "Pune")
  - name: date
    required: false
    hint: Preferred date (e.g. "this weekend", "next week", "March", "any")
  - name: tickets
    required: false
    hint: Number of tickets (e.g. "1", "2 tickets")
  - name: type
    required: false
    hint: Event format (e.g. "online", "in-person", "free", "paid")
---

# Eventbrite Event Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine: event topic or name, city, date preference, number of tickets, format (online/in-person).
- If user is vague (e.g. "find a tech event"), ask about specific interest area and city.
- Use `ask_user` for missing info: "What kind of event are you looking for? Workshop, meetup, conference?"
- Ask about format preference: in-person, online, or hybrid.
- Get budget preference if not specified: free events only, or willing to pay.

### 2. Open Eventbrite & Verify Login
- Open a NEW tab and navigate to `https://www.eventbrite.com`.
- Take snapshot. Verify logged in (check for profile icon or user avatar).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Set location to India or the specific city.

### 3. Search for Events
- Use search bar to find events matching user's criteria.
- Apply filters: location/city, date range, category (Business, Technology, Health, Music, etc.), price (free/paid), format (online/in-person).
- Take snapshot. Extract top 5 events: event name, organizer, venue/platform, date, time, price, attendee count, description snippet.
- Present via `ask_user` (input_type "choice"):
  "Event Name — Organizer — Venue/Online — Date Time — ₹price (or Free) — X attending"
- Click the selected event.

### 4. Event Details & Ticket Selection
- Event page shows full description, agenda, speakers, venue, organizer info.
- Take snapshot. Show key details: what you'll learn, speakers/hosts, schedule, venue.
- If multiple ticket tiers (Free, Early Bird, General, VIP), present via `ask_user` (input_type "choice"):
  "Free Registration", "General — ₹500", "VIP — ₹2,000 (Includes lunch + networking)"
- Select ticket type and quantity.
- Fill in registration form with user details from profile.

### 5. Fill Registration Details
- Eventbrite may ask additional questions (company name, job title, dietary preferences, etc.).
- Fill from profile where possible. Use `ask_user` for event-specific questions.
- Take snapshot of completed registration form.

### 6. Review & Confirm
- Proceed to order summary. Take snapshot.
- Use `confirm_action`:
  - Event name and organizer
  - Venue name and address (or "Online" with platform)
  - Date and time (with timezone)
  - Ticket type and quantity
  - Price per ticket, service fee, total
  - What's included (lunch, materials, networking, certificate)
  - Cancellation/refund policy
- Do NOT proceed unless user confirms.

### 7. Payment
- If free event, proceed to registration directly (no payment needed).
- If paid event:
  - Use `collect_payment`:
    - summary: JSON with event, organizer, venue, date, time, ticket_type, quantity, total
    - amount_inr: total amount
    - description: "Eventbrite event registration"
  - WAIT for payment confirmation.

### 8. Complete & Confirm
- Complete registration/payment on Eventbrite. Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order number, event name, organizer, venue/platform, date, time, ticket type, total paid (or "Free"), confirmation email status.
- Remind: "Check your email for the confirmation and e-ticket. For in-person events, arrive 15 minutes early."
- For online events: "Join link will be emailed closer to the event date. Add to your calendar."

## Site Notes

- Eventbrite is a global event platform popular in India for tech meetups, workshops, conferences, and networking events.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Session may expire after 30 days — if login wall appears, ask user to re-login manually in Chrome Debug.
- Many events on Eventbrite India are free — especially tech meetups, community events, and introductory workshops.
- Service fee: Eventbrite charges 3.7% + ₹29 per ticket for paid events — organizer may absorb or pass to attendee.
- Eventbrite supports both INR and USD pricing — some international events charge in USD.
- Early Bird tickets close on a date, not when sold out — check if early bird is still available.
- Online events use Zoom, Google Meet, or Eventbrite's own streaming — join link sent via email.
- Refund policy: set by organizer — ranges from full refund to non-refundable. Always check before confirming.
- Eventbrite shows "X people interested" and "Y attending" — higher numbers indicate popular events.
- Use `confirm_action` for review, `collect_payment` for paid events. WAIT for user response at each step.
