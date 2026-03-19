---
name: google-meet
description: Create a Google Meet video meeting link — schedule via Google Calendar, set date/time, share link with participants.
triggers:
  - google meet
  - create meet link
  - google meet link
  - schedule google meet
  - video call
  - meet link
  - google video meeting
  - create meeting link
siteUrl: https://meet.google.com
requiresAuth: true
params:
  - name: title
    required: true
    hint: Meeting title (e.g. "Project review", "1-on-1 catch up")
  - name: date
    required: true
    hint: Meeting date (e.g. "tomorrow", "March 20")
  - name: time
    required: true
    hint: Meeting time (e.g. "4:00 PM", "10:00 AM - 11:00 AM")
  - name: invitees
    required: false
    hint: Email addresses of participants to invite (comma-separated)
  - name: description
    required: false
    hint: Meeting description or agenda
---

# Google Meet Link Creation

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- BEFORE opening the browser, check what the user provided.
- If user did not specify a title, use `ask_user` (input_type "freetext"): "What should the meeting be called?"
- If no date provided, use `ask_user` (input_type "freetext"): "What date should this meeting be on?"
- If no time provided, use `ask_user` (input_type "freetext"): "What time should the meeting start? (e.g. '4:00 PM')"
- Parse relative dates (tomorrow, next Monday, etc.) into actual dates.
- If invitees not provided but user mentioned sharing, use `ask_user` (input_type "freetext"): "Who should I invite? (email addresses, comma-separated)"

### 2. Open Google Meet & Verify Login
- Open a NEW tab and navigate to `https://meet.google.com`.
- Take a snapshot. Check if logged in (profile icon in top-right, "New meeting" button visible).
- If NOT logged in, the Google login flow should auto-detect the Chrome profile session. Do NOT ask user for credentials.
- **If session expired or wrong account, STOP and tell user: "Session expired, please re-login to Google in Chrome Debug."**
- Verify the correct account is active (rsinghtomar3011@gmail.com).
- Take snapshot to confirm Meet homepage is visible.

### 3. Create Meeting via Google Calendar
- The best way to create a scheduled Google Meet is through Google Calendar integration.
- Click "New meeting" dropdown button.
- Select "Schedule in Google Calendar" option.
- This opens Google Calendar event creation with Google Meet auto-attached.
- Fill in the event details:
  - Title: type the meeting title.
  - Date: set the correct date using the date picker.
  - Time: set start and end time. If only start provided, default to 1 hour.
- Take snapshot of the calendar form.

### 4. Add Participants & Details
- If invitees were provided:
  - Click "Add guests" field.
  - Type each email address and press Enter to add.
  - Wait for each guest to resolve.
- If description or agenda provided:
  - Click "Add description" and type it.
- Verify the Google Meet link is auto-generated (shown in the event form as "Join with Google Meet" with a meet.google.com link).
- Copy the Google Meet link from the form.
- Take snapshot of the complete event with Meet link visible.

### 5. Review & Confirm
- Use `confirm_action` to present meeting summary:
  - Title
  - Date and time
  - Google Meet link (the meet.google.com URL)
  - Invitees (if any)
  - Description (if any)
  - "Confirm you want to schedule this meeting and send invites?"
- Do NOT save unless user confirms.
- If user wants to edit, make the requested changes and re-confirm.

### 6. Save & Share
- Click "Save" button in Google Calendar.
- If invitees added, click "Send" when prompted to send invitation emails.
- Take snapshot of the calendar showing the event.
- Report to user:
  - Meeting scheduled successfully
  - Title, date, time
  - Google Meet link (clickable URL) — this is the key deliverable
  - Invitees notified via email (if any)
  - "Share the Meet link with anyone who needs to join"
  - "Meeting created under rsinghtomar3011@gmail.com calendar"

## Site Notes

- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in to Google. Do NOT ask user for credentials.
- Google Meet links are permanent — they work until the event is deleted or the link is revoked.
- The easiest way to create a scheduled Meet is via Calendar — it auto-generates the link.
- For instant meetings (no scheduling), click "New meeting" then "Start an instant meeting" or "Get a meeting link to share".
- Google Meet has no time limit for Google Workspace accounts. Free accounts have a 60-min limit for 3+ people.
- Google sessions persist for weeks via Chrome profile — rarely expires.
- Google Meet uses standard Google UI components — use aria-labels for selectors.
- Use `confirm_action` before saving (no money involved). WAIT for user response. Do NOT auto-save.
- If user just wants a quick link (no scheduling), use "Get a meeting link to share" — instant, no calendar event.
- The Meet link format is: meet.google.com/xxx-yyyy-zzz.
- Invitees receive an email with the Meet link and a calendar event — they can join from either.
