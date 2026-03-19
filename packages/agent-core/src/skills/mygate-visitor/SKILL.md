---
name: mygate-visitor
description: Register visitor or delivery on MyGate — enter guest details, select flat, generate digital visitor pass.
triggers:
  - mygate
  - register visitor
  - visitor pass
  - mygate visitor
  - delivery entry
  - guest entry
  - gate pass
  - mygate delivery
  - society visitor pass
siteUrl: https://mygate.com
requiresAuth: true
params:
  - name: visitor_name
    required: true
    hint: Full name of the visitor/guest
  - name: visitor_type
    required: false
    hint: Type — "guest", "delivery", "cab", "maid", "maintenance"
  - name: visit_date
    required: false
    hint: Expected visit date and time (e.g. "today 3 PM", "tomorrow morning")
  - name: flat_number
    required: false
    hint: Flat/house number if not the default registered flat
---

# MyGate Visitor Registration

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Visitor Details
- Confirm visitor name, type, and expected date/time.
- If not provided, use `ask_user` (input_type "freetext"): "Who is visiting? Please share their name, purpose (guest/delivery/cab/maid), and expected date & time."
- Ask for visitor's phone number (optional but helpful for SMS notification).
- Confirm the flat number if user has multiple properties on MyGate.
- Convert relative dates/times to actual (e.g. "tomorrow 3 PM" → "March 17, 2026 3:00 PM").
- For delivery: ask for the delivery service name (e.g. "Amazon", "Swiggy", "Dunzo").

### 2. Open MyGate & Verify Login
- Open a NEW tab and navigate to `https://mygate.com` or `https://app.mygate.com`.
- Take snapshot. Dismiss any popups or app download prompts.
- Verify logged in (dashboard with flat/society details visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Check that the correct flat/society is selected in the dashboard.

### 3. Navigate to Pre-Approve Visitor
- Click on "Pre-approve" or "Invite Visitor" or "Expected Visitor" option.
- If multiple options exist (Guest / Delivery / Cab / Daily Help), select the correct type.
- Take snapshot of the visitor registration form.
- If MyGate web version has limited functionality, inform user and suggest alternatives.

### 4. Fill Visitor Details
- Enter visitor name in the name field.
- Enter visitor phone number (if provided).
- Select visitor type: Guest / Delivery / Cab / Maid / Maintenance.
- For delivery: select service provider or enter manually.
- Set visit date and time:
  - For one-time visit: select specific date and time window.
  - For recurring (maid/cook): set days of week and time.
- Select flat number from dropdown (if multiple).
- Set duration: "Single entry" / "Full day" / "Custom duration".
- Add any special instructions (e.g. "Allow entry even if I'm not home").
- Take snapshot of filled form.

### 5. Review & Confirm
- Use `confirm_action`:
  - Visitor name and phone
  - Visitor type (guest / delivery / cab / maid)
  - Visit date and time window
  - Flat number and society name
  - Duration / validity
  - Special instructions (if any)
  - Notification: visitor will receive SMS with entry passcode
- Do NOT proceed unless user confirms.

### 6. Submit & Generate Pass
- Click "Pre-approve" / "Invite" / "Submit" button.
- Wait for confirmation.
- Take snapshot of the generated visitor pass / confirmation.
- Extract pass details:
  - Passcode / OTP for entry
  - QR code (if generated)
  - Validity period
  - Gate instructions

### 7. Final Confirmation with Snapshot
- Take snapshot of the completed registration.
- Report:
  - Visitor name and type
  - Entry passcode / code
  - Valid date and time
  - Flat and society details
  - How it works: "Visitor shows the passcode or SMS at the gate. Security verifies and allows entry."
- Mention: "The visitor will receive an SMS with the entry code. You'll get a notification when they arrive at the gate."

## Site Notes

- MyGate is India's largest gated community management platform — used in 25,000+ societies.
- Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- MyGate web version (mygate.com) may have limited features compared to the mobile app.
- If web version doesn't support pre-approval, inform user to use the MyGate app instead.
- Visitor gets an SMS with a passcode — they show it to security at the gate.
- Pre-approved visitors get faster entry — security can verify without calling the resident.
- For recurring entries (maid, cook, driver): set weekly schedule with specific days and time.
- MyGate also supports: parcel collection, amenity booking, maintenance payments.
- Security guards verify the passcode — if expired or invalid, the visitor must wait for resident approval.
- Session on web may expire quickly — work fast to complete registration.
- Some societies may not have MyGate web enabled — only app-based management.
- Use `confirm_action` for review before submitting. WAIT for user response before proceeding.
