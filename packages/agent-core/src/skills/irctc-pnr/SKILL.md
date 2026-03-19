---
name: irctc-pnr
description: Check PNR status on IRCTC — enter PNR number, view booking status, berth allocation, coach details.
triggers:
  - pnr status
  - check pnr
  - irctc pnr
  - pnr enquiry
  - train pnr
  - pnr check
  - my train status
  - booking status irctc
siteUrl: https://www.irctc.co.in
requiresAuth: true
params:
  - name: pnr_number
    required: true
    hint: 10-digit PNR number from the booking ticket (e.g. "8234567890")
---

# IRCTC PNR Status Check

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather PNR Number
- Confirm the 10-digit PNR number from the user.
- If not provided, use `ask_user` (input_type "freetext"): "Please share your 10-digit PNR number."
- Validate the PNR is exactly 10 digits. If not, ask again.
- Ask if they want to check for a specific passenger (if group booking).

### 2. Open IRCTC & Verify Login
- Open a NEW tab and navigate to `https://www.irctc.co.in/nget/train-search`.
- Take snapshot. Dismiss any popups/alerts/overlays.
- Verify logged in (username visible in top navigation bar).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- IRCTC CAPTCHA may appear — handle it or ask user to solve via `ask_user`.

### 3. Navigate to PNR Status Page
- Click on "PNR Status" or "PNR Enquiry" link in the navigation menu.
- If not visible, navigate directly to `https://www.irctc.co.in/nget/pnr-enquiry`.
- Take snapshot to confirm PNR input page is loaded.
- If redirected to login page, handle login first.

### 4. Enter PNR & Search
- Click on the PNR input field.
- Type the 10-digit PNR number.
- Handle CAPTCHA if present — attempt auto-solve or use `ask_user` to request CAPTCHA text.
- Click "Submit" / "Get Status" button.
- Take snapshot of results page.
- Wait for results to load completely (may take a few seconds on slow IRCTC servers).

### 5. Extract & Present Status
- Extract all PNR details from the results:
  - Train number and name
  - Journey date
  - From station → To station (with station codes)
  - Boarding point and destination
  - Class of travel
  - Chart status (Prepared / Not Prepared)
  - For each passenger:
    - Booking status (CNF/RAC/WL with number)
    - Current status (CNF/RAC/WL with number)
    - Coach and berth number (if chart prepared)
    - Berth type (Lower/Middle/Upper/Side Lower/Side Upper)
- Take snapshot of complete PNR details.

### 6. Present Results to User
- Use `ask_user` (input_type "choice") to present findings clearly:
  - "Train: 12952 Mumbai Rajdhani | Date: 25-Mar-2026"
  - "Route: NDLS → BCT | Class: 3AC"
  - "Passenger 1: CNF — S5/32 (Lower Berth)"
  - "Passenger 2: RAC 3 — Waiting for confirmation"
  - "Chart Status: Not Prepared"
- Provide options: "Check another PNR", "Done"
- If status is WL, inform estimated confirmation chances based on WL number.
- If status is RAC, explain that travel is allowed but berth may be shared.
- If chart prepared, mention coach/berth details are final.

### 7. Final Confirmation
- Take snapshot of the final PNR status page.
- Report complete summary:
  - PNR number
  - Train details (number, name, date)
  - Route (from → to)
  - Each passenger's current status with berth details
  - Chart status
  - Important reminders (carry valid ID, reach station 30 min early)
- Mention: "PNR status updates until chart preparation (4-6 hours before departure)."

## Site Notes

- IRCTC is the ONLY official source for PNR status. Third-party sites may have stale data.
- Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- CAPTCHA is almost always required on IRCTC — may need user help via `ask_user`.
- PNR status changes frequently — WL tickets can confirm as passengers cancel.
- Chart preparation happens 4-6 hours before departure. Before that, berth numbers are not final.
- IRCTC site is notoriously slow during peak hours (10-11 AM Tatkal window) — be patient with retries.
- Session expires frequently on IRCTC — if redirected to login, re-authenticate transparently.
- WL/1-10 has good chances of confirmation for most routes. WL/50+ is unlikely.
- RAC passengers are guaranteed to travel — they get a shared berth on the train.
- PNR is valid only for the specific train and date — cannot be used for other journeys.
- Use `ask_user` for presenting results and choices. WAIT for user response before proceeding.
