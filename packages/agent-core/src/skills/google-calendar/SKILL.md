---
name: google-calendar
description: Create and manage Google Calendar events — set title, date, time, location, invitees, reminders.
triggers:
  - google calendar
  - create calendar event
  - schedule meeting
  - add to calendar
  - calendar event
  - set reminder
  - schedule event
  - google calendar event
siteUrl: https://calendar.google.com
requiresAuth: true
params:
  - name: title
    required: true
    hint: Event title (e.g. "Team standup", "Doctor appointment")
  - name: date
    required: true
    hint: Event date (e.g. "tomorrow", "March 20", "2026-03-18")
  - name: time
    required: true
    hint: Event time (e.g. "2:00 PM", "10:00 - 11:00 AM")
  - name: invitees
    required: false
    hint: Email addresses of people to invite (comma-separated)
  - name: location
    required: false
    hint: Event location or "Google Meet" for video call
  - name: description
    required: false
    hint: Event description or agenda
---

# Google Calendar Event Creation

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- BEFORE opening the browser, check what the user provided.
- If user did not specify a title, use `ask_user` (input_type "freetext"): "What should the event be called?"
- If no date provided, use `ask_user` (input_type "freetext"): "What date should this event be on? (e.g. 'tomorrow', 'March 20')"
- If no time provided, use `ask_user` (input_type "freetext"): "What time should the event start and end? (e.g. '2:00 PM - 3:00 PM')"
- Parse relative dates (tomorrow, next Monday) into actual dates.
- If user wants to invite people but did not provide emails, use `ask_user` (input_type "freetext"): "Who should I invite? (email addresses, comma-separated)"

### 2. Open Google Calendar & Verify Login
- Open a NEW tab and navigate to `https://calendar.google.com`.
- Take a snapshot. Check if logged in (calendar grid visible, profile icon in top-right).
- If NOT logged in, the Google login flow should auto-detect the Chrome profile session. Do NOT ask user for credentials.
- **If session expired or wrong account, STOP and tell user: "Session expired, please re-login to Google in Chrome Debug."**
- Verify the correct account is active (rsinghtomar3011@gmail.com). If wrong account, click account switcher.
- Take snapshot to confirm calendar is visible.

### 3. Create New Event
- Click the "+" or "Create" button to start a new event.
- If a quick-create popup appears, click "More options" to get the full event form.
- Fill in the event details:
  - Title: type the event title.
  - Date: click the date field and set the correct date.
  - Time: set start time and end time. If only start time given, default to 1 hour duration.
  - If all-day event, toggle the "All day" checkbox.
- Take snapshot of the form so far.

### 4. Add Optional Details
- If location provided:
  - Click "Add location" and type the location. If "Google Meet", click "Add Google Meet video conferencing".
- If invitees provided:
  - Click "Add guests" and type each email address. Press Enter after each to add.
  - Wait for each guest to resolve (shows name if in contacts).
- If description provided:
  - Click "Add description" and type the description or agenda.
- If user wants a reminder:
  - Click "Add notification" and set the reminder time (default 30 minutes before).
- If user wants it to repeat (weekly standup, etc.):
  - Click "Does not repeat" dropdown and select the recurrence pattern.
- Take snapshot of the complete event form.

### 5. Review & Confirm
- Use `confirm_action` to present event summary:
  - Title, date, time (start - end)
  - Location (if any)
  - Invitees (if any)
  - Description preview (if any)
  - Google Meet link (if added)
  - "Confirm you want to create this event?"
- Do NOT save unless user confirms.
- If user wants to edit, make the requested changes and re-confirm.

### 6. Save & Confirm
- Click "Save" button.
- If invitees were added, Google Calendar asks "Send invitation emails?" — click "Send".
- Take snapshot of the calendar showing the new event.
- Report to user:
  - Event created successfully
  - Title, date, time
  - Google Meet link (if created)
  - Invitees notified (if any)
  - "Event added to rsinghtomar3011@gmail.com calendar"

## Site Notes

- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in to Google. Do NOT ask user for credentials.
- Google Calendar may default to the wrong time zone — verify IST (Asia/Kolkata) is set.
- The "quick add" popup is limited — always click "More options" for full control.
- Google Calendar DOM uses aria-labels extensively — prefer aria-label selectors.
- Adding Google Meet is one click — it auto-generates a meeting link.
- If invitees are added, Calendar asks whether to send invites — always send unless user says otherwise.
- Google sessions persist for weeks via Chrome profile — rarely expires.
- Use `confirm_action` before saving (no money involved). WAIT for user response. Do NOT auto-save.
- Recurring events: be careful editing — Calendar asks "This event" vs "All events" vs "This and following".
- Calendar may show other calendars (holidays, birthdays) — create event on the primary calendar only.
- If user asks to delete or edit an existing event, navigate to it first by searching or clicking on the date.
