---
name: calendly-booking
description: Book a meeting via someone's Calendly link — select available time slot, fill in details, confirm booking.
triggers:
  - calendly
  - book calendly
  - calendly link
  - schedule via calendly
  - book meeting calendly
  - calendly appointment
  - book a slot
  - calendly booking
siteUrl: https://calendly.com
requiresAuth: false
params:
  - name: calendly_url
    required: true
    hint: The Calendly link to book (e.g. "https://calendly.com/johndoe/30min")
  - name: name
    required: false
    hint: Your full name for the booking
  - name: email
    required: false
    hint: Your email address for the booking confirmation
  - name: preferred_date
    required: false
    hint: Preferred date (e.g. "tomorrow", "March 20")
  - name: preferred_time
    required: false
    hint: Preferred time slot (e.g. "afternoon", "2:00 PM")
---

# Calendly Meeting Booking

Chrome profile: rsinghtomar3011@gmail.com (for auto-fill, but Calendly is public — no login required).

## Steps

### 1. Gather Requirements
- BEFORE opening the browser, check what the user provided.
- If user did not provide a Calendly URL, use `ask_user` (input_type "freetext"): "What is the Calendly link you want to book? (e.g. https://calendly.com/someone/meeting-type)"
- If no name provided, use `ask_user` (input_type "freetext"): "What name should I use for the booking?"
- If no email provided, use `ask_user` (input_type "freetext"): "What email address should be used for the booking confirmation?"
- If user has a preferred date/time, note it. Otherwise, will show available slots.

### 2. Open Calendly Link
- Open a NEW tab and navigate to the provided Calendly URL.
- Take a snapshot. Verify the page loads correctly with the host's scheduling page.
- If the link is invalid or the page shows an error, inform user: "This Calendly link doesn't seem to work. Please check the URL."
- If the page shows event type options (15min, 30min, 60min), present them to user.
- Use `ask_user` (input_type "choice") to let user pick the event type if multiple are shown.
- Take snapshot of the calendar/scheduling view.

### 3. Select Date
- The Calendly page shows a calendar with available dates (highlighted/bold).
- If user specified a preferred date:
  - Navigate to that date on the calendar (click forward arrows if needed).
  - Click on the preferred date.
- If no preferred date:
  - Present the next 5-7 available dates to user.
  - Use `ask_user` (input_type "choice") to let user pick a date.
- Take snapshot showing available time slots for the selected date.

### 4. Select Time Slot
- Calendly shows available time slots for the selected date.
- If user specified a preferred time:
  - Find the closest available slot to their preference.
  - If exact time not available, show nearby options.
- If no preferred time:
  - Present all available time slots for that date.
  - Use `ask_user` (input_type "choice") to let user pick a time slot.
- Click on the selected time slot.
- Click "Confirm" or "Next" to proceed to the details form.
- Take snapshot of the booking form.

### 5. Fill Booking Details
- Fill in the required fields:
  - Name: user's full name.
  - Email: user's email address.
- Fill any additional fields the host has configured:
  - Phone number, company, notes, etc.
  - Use `ask_user` for any field the user hasn't provided.
- If there is an optional "Add notes" or "Anything else?" field, ask user if they want to add a message.
- Take snapshot of the completed form.

### 6. Review & Confirm Booking
- Use `confirm_action` to present booking summary:
  - Host name (from the Calendly page)
  - Meeting type and duration
  - Date and time (with time zone)
  - Your name and email
  - Any additional notes
  - "Confirm you want to book this meeting?"
- Do NOT submit unless user confirms.
- If user wants to change, go back and adjust.

### 7. Submit & Final Confirmation
- Click "Schedule Event" or "Confirm" button.
- Take snapshot of the confirmation page.
- Report to user:
  - Meeting booked successfully
  - Host name
  - Meeting type and duration
  - Date and time
  - "Confirmation email sent to your email address"
  - Calendar invite details (if shown)
  - "You can cancel or reschedule via the link in your confirmation email"

## Site Notes

- Calendly is a public scheduling page — no login required to book. Chrome Profile 3 is used only for browser context.
- Do NOT ask user for the host's credentials — Calendly links are publicly accessible.
- Calendly shows times in the visitor's local time zone — verify it shows IST (or user's preferred zone).
- Available slots depend on the host's calendar — if no slots are available, inform user and suggest checking back later.
- Some Calendly pages require pre-screening questions — use `ask_user` for each.
- Calendly may show a cookie consent banner — dismiss it.
- Calendly uses React — always use Playwright fill/type methods.
- Use `confirm_action` before booking (no money involved). WAIT for user response. Do NOT auto-book.
- After booking, a confirmation email goes to the user's email and the host's email.
- If the Calendly link has multiple event types, let user choose before proceeding to date selection.
- Time zone mismatches are common — always confirm the displayed time zone with the user.
