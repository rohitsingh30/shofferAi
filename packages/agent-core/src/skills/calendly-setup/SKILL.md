---
name: calendly-setup
description: Set up Calendly scheduling pages with event types, availability, and booking links — meeting scheduling automation.
triggers:
  - calendly
  - set up calendly
  - scheduling page
  - calendly link
  - book a meeting
  - meeting scheduler
  - create calendly event
  - availability page
  - scheduling link
  - calendly event type
siteUrl: https://calendly.com
requiresAuth: true
params:
  - name: event_name
    required: true
    hint: Name for the event type (e.g. "30 Min Meeting", "Discovery Call", "Product Demo")
  - name: duration
    required: false
    hint: Meeting duration in minutes (e.g. "15", "30", "60") — default 30
  - name: availability
    required: false
    hint: Available hours (e.g. "Mon-Fri 9am-5pm", "weekdays 10am-6pm IST")
  - name: location
    required: false
    hint: Meeting location — "google_meet", "zoom", "phone", "in_person", or custom URL
  - name: description
    required: false
    hint: Description shown to people booking (e.g. "Quick sync to discuss project updates")
---

# Calendly Scheduling Page Setup

Chrome profile: rsinghtomar3011@gmail.com (Calendly account signed in).

## Steps

### 1. Gather Requirements
- Confirm you have: event name.
- If event_name is missing, use `ask_user` (input_type "freetext"): "What should the event be called? (e.g. '30 Min Meeting', 'Discovery Call')"
- If duration not specified, use `ask_user` (input_type "choice"): "How long? 15 minutes / 30 minutes / 45 minutes / 60 minutes"
- If availability not specified, use `ask_user` (input_type "freetext"): "What are your available hours? (e.g. 'Mon-Fri 9am-5pm IST')"
- If location not specified, use `ask_user` (input_type "choice"): "Where will meetings happen? Google Meet / Zoom / Phone Call / In Person / Custom Link"
- Default duration to 30 minutes, availability to Mon-Fri 9am-5pm IST, location to Google Meet.

### 2. Open Calendly
- Open a NEW tab and navigate to `https://calendly.com/event_types/user/me`.
- Take a snapshot to see the dashboard or landing page.
- Dismiss any onboarding tours, "Welcome" modals, or upgrade prompts.

### 3. Verify Authentication
- Check if you see the Calendly dashboard with event types listed.
- If signed in: proceed to event type creation.
- If NOT signed in: click "Log In" → "Continue with Google" → select rsinghtomar3011@gmail.com.
- If CAPTCHA or 2FA appears, use `ask_user`: "Please complete Calendly sign-in in the browser. Type 'done' when finished."
- **If you see a login page or wrong account, STOP and tell the user: "Session expired, please re-login in Chrome Debug."**

### 4. Create New Event Type
- Click "+ New Event Type" or "Create" button on the dashboard.
- Calendly may ask for event type format: "One-on-One" / "Group" / "Collective" / "Round Robin".
- Select "One-on-One" unless user specified otherwise.
- Enter the event name in the title field.
- Set the duration (15, 30, 45, or 60 minutes).
- Take a snapshot to confirm the event creation form is open.

### 5. Configure Event Details
- Set the event description if provided (description param or ask user).
- Configure the location/meeting type:
  - Google Meet: select "Google Meet" from location options (requires Google Calendar connected).
  - Zoom: select "Zoom" (requires Zoom integration).
  - Phone: select "Phone call" and choose who calls whom.
  - In Person: enter the address.
  - Custom: enter the meeting URL.
- Set event color for visual distinction on the dashboard.
- Take a snapshot of the configuration.

### 6. Set Availability
- Navigate to the "Availability" or "When can people book this event?" section.
- Set available days: check/uncheck days of the week per user's preference.
- Set time ranges for each day (e.g. 9:00 AM - 5:00 PM).
- Set timezone (default to IST / Asia/Kolkata unless user specifies otherwise).
- Configure buffer time between meetings: use `ask_user` (input_type "choice"): "Buffer between meetings? No buffer / 5 minutes / 10 minutes / 15 minutes"
- Set scheduling window: how far in advance people can book (e.g. 60 days out).
- Set minimum scheduling notice (e.g. 4 hours ahead).
- Take a snapshot showing availability settings.

### 7. Configure Booking Form
- Set invitee questions — default fields: Name, Email.
- If user wants additional questions: click "Add new question" and configure.
- Use `ask_user` (input_type "freetext"): "Any additional questions for people booking? (e.g. 'What would you like to discuss?') — or say 'skip'."
- Set confirmation page message or redirect URL.
- Configure email notifications and reminders.
- Take a snapshot of the booking form configuration.

### 8. Preview & Publish
- Click "Save & Close" or "Publish" to activate the event type.
- Navigate to the event type page to get the booking link.
- Take a snapshot of the live booking page preview.
- Use `confirm_action`: "Calendly event ready" with event name, duration, availability, location, booking link.

### 9. Collect Service Fee
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with event_name, duration, availability, location, timezone, booking_url
  - amount_inr: service fee amount (number)
  - description: "Calendly scheduling page setup"
- STOP and WAIT for payment confirmation. If cancelled, event type remains active.

### 10. Final Confirmation
- Take a final snapshot of the completed event type.
- Extract and report: event name, duration, availability hours, location type, booking link (from Calendly URL), timezone.
- Report full details to user with the direct booking link.
- If any step failed, report the error and suggest next steps.

## Site Notes

- Chrome Profile 3 (rsinghtomar3011@gmail.com) has Calendly access. Do NOT ask user for credentials.
- Calendly session persists via cookies — may expire after 1-2 weeks. Re-login via Google SSO.
- Calendly is a React SPA — wait for event type forms to fully render before interacting.
- Free tier: 1 active event type, basic integrations. Paid tiers allow unlimited event types.
- Google Calendar connection is needed for Google Meet — check Settings → Connected Calendars.
- Booking link format: `https://calendly.com/{username}/{event-slug}`.
- Event slug is auto-generated from event name — can be customized in the URL section.
- Availability syncs with connected calendars — busy times are automatically blocked.
- Timezone detection: Calendly auto-detects invitee timezone and shows their local times.
- Reminders and follow-ups: configurable in the "Notifications" section of event settings.
- Embed options: available in "Share" section — inline embed, popup widget, or popup text.
