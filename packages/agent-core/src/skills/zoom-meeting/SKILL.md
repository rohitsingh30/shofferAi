---
name: zoom-meeting
description: Create a Zoom meeting — set topic, date, time, duration, get shareable meeting link and password.
triggers:
  - zoom
  - create zoom meeting
  - zoom call
  - schedule zoom
  - zoom link
  - zoom meeting link
  - set up zoom
  - zoom video call
siteUrl: https://zoom.us
requiresAuth: true
params:
  - name: topic
    required: true
    hint: Meeting topic or title (e.g. "Weekly sync", "Client call")
  - name: date
    required: true
    hint: Meeting date (e.g. "tomorrow", "March 20", "2026-03-18")
  - name: time
    required: true
    hint: Meeting start time (e.g. "3:00 PM", "10:00 AM IST")
  - name: duration
    required: false
    hint: Meeting duration in minutes (e.g. "30", "60"). Default 60.
  - name: invitees
    required: false
    hint: Email addresses of participants to invite
---

# Zoom Meeting Creation

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- BEFORE opening the browser, check what the user provided.
- If user did not specify a topic, use `ask_user` (input_type "freetext"): "What should the Zoom meeting topic be?"
- If no date provided, use `ask_user` (input_type "freetext"): "What date should the meeting be on?"
- If no time provided, use `ask_user` (input_type "freetext"): "What time should the meeting start? (e.g. '3:00 PM IST')"
- Parse relative dates (tomorrow, next Monday) into actual dates.
- If duration not provided, default to 60 minutes.

### 2. Open Zoom & Verify Login
- Open a NEW tab and navigate to `https://zoom.us/meeting/schedule`.
- Take a snapshot. Check if logged in (profile icon or name in top-right corner).
- If NOT logged in, click Sign In. Zoom may offer Google SSO — use that with the Chrome profile. Do NOT ask user for credentials.
- **If session expired or wrong account, STOP and tell user: "Session expired, please re-login to Zoom in Chrome Debug."**
- Take snapshot to confirm logged-in state and schedule page visible.

### 3. Fill Meeting Details
- On the schedule meeting form, fill in:
  - Topic: type the meeting topic/title.
  - Date: set the meeting date using the date picker.
  - Time: set the start time. Ensure correct AM/PM and time zone (IST).
  - Duration: set hours and minutes (e.g. 1 hour 0 minutes for 60 min).
- Configure meeting options:
  - Enable "Waiting Room" (default on).
  - Enable "Passcode" (auto-generated).
  - Video: Host ON, Participants ON (or as user prefers).
  - Audio: Both (Telephone and Computer Audio).
- Take snapshot of the filled form.

### 4. Review & Confirm
- Use `confirm_action` to present meeting summary:
  - Topic
  - Date and time (with time zone)
  - Duration
  - Waiting room: enabled/disabled
  - Passcode: yes (auto-generated)
  - "Confirm you want to schedule this Zoom meeting?"
- Do NOT save unless user confirms.
- If user wants to edit, make the requested changes and re-confirm.

### 5. Save & Get Meeting Link
- Click "Save" or "Schedule" button.
- Wait for the meeting confirmation page to load.
- Take snapshot of the meeting details page.
- Extract:
  - Meeting ID
  - Meeting link (URL)
  - Passcode
  - Date and time
  - Duration

### 6. Share & Final Confirmation
- If invitees were provided:
  - Click "Copy Invitation" to get the full invitation text.
  - Share the meeting link and details with user so they can forward to invitees.
- Take a final snapshot.
- Report to user:
  - Meeting scheduled successfully
  - Topic, date, time, duration
  - Meeting link (clickable URL)
  - Meeting ID and passcode
  - "Share this link with your participants"

## Site Notes

- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in to Zoom. Do NOT ask user for credentials.
- Zoom may offer Google SSO login — use it since the Chrome profile has Google signed in.
- Free Zoom accounts have a 40-minute limit for group meetings (3+ participants). Inform user if relevant.
- Zoom may show upgrade prompts or feature announcements — dismiss them.
- Time zone defaults to the account setting — verify it matches IST (Asia/Kolkata).
- Zoom sessions can expire — if login page appears, STOP and inform user.
- Zoom web uses standard form elements — Playwright fill/type methods work well.
- Use `confirm_action` before scheduling (no money involved). WAIT for user response. Do NOT auto-schedule.
- Meeting passcode is auto-generated — always include it when sharing the link.
- If user wants a recurring meeting, use the "Recurring meeting" checkbox and set the recurrence pattern.
- Zoom calendar integration may sync with Google Calendar — the event may auto-appear in Calendar.
