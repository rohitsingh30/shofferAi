---
name: ixigo-train
description: Book train tickets or check PNR on ixigo — search trains, predict confirmation chances, compare options, book and pay.
triggers:
  - ixigo train
  - book train on ixigo
  - ixigo train booking
  - ixigo rail ticket
  - train on ixigo
  - ixigo pnr
  - ixigo train search
  - ixigo railway booking
siteUrl: https://www.ixigo.com
requiresAuth: true
params:
  - name: from
    required: true
    hint: Departure station or city (e.g. "New Delhi", "NDLS", "Mumbai Central")
  - name: to
    required: true
    hint: Arrival station or city (e.g. "Jaipur", "Varanasi", "Kolkata")
  - name: date
    required: true
    hint: Travel date (e.g. "March 25", "next Friday", "2026-04-10")
  - name: class
    required: false
    hint: Travel class (e.g. "Sleeper", "3AC", "2AC", "1AC"). Default All Classes.
  - name: quota
    required: false
    hint: Quota (General, Tatkal, Ladies). Default General.
  - name: pnr
    required: false
    hint: PNR number for status check (10-digit number). If provided, skip to PNR check.
---

# ixigo Train Booking & PNR Check

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Travel Details or PNR
- If user provided a PNR number, skip to Step 2b (PNR Check).
- Otherwise confirm: from station, to station, travel date. If any missing, use `ask_user`.
- Note class preference (Sleeper/3AC/2AC/1AC), quota (General/Tatkal), number of passengers, berth preference.
- Tatkal bookings open at 10 AM (AC) / 11 AM (non-AC) one day before journey.
- Convert relative dates to actual dates.

### 2a. Open ixigo Trains & Verify Login
- Open a NEW tab and navigate to `https://www.ixigo.com/trains`.
- Take snapshot. Dismiss any popups (app install, login, offers).
- Verify logged in (profile icon or name in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 2b. PNR Status Check (if PNR provided)
- Open a NEW tab and navigate to `https://www.ixigo.com/pnr-status/`.
- Enter the PNR number in the search field.
- Click "Check PNR Status".
- Take snapshot of results.
- Report: train number, name, date, class, current status for each passenger (CNF/RAC/WL), chart status.
- ixigo shows confirmation prediction percentage -- report this too.
- Task complete after reporting PNR status. No further steps needed.

### 3. Search Trains
- Enter From station (type and select from autocomplete).
- Enter To station.
- Select travel date from date picker.
- Select class if specified.
- Click "Search Trains".
- Take snapshot of train list.

### 4. Select Train
- Extract trains with: train number, name, departure time, arrival time, duration, days of running.
- Check availability for each: available/RAC/waitlist count per class.
- ixigo shows "Confirmation Chances" (high/medium/low) for waitlisted tickets -- include this.
- Present top options via `ask_user` (input_type "choice"):
  "12952 Rajdhani — Dep 4:25 PM — Arr 10:15 AM — 3AC: Available 45 — Rs 1,855 — Confirm: High"
- Prefer trains with "Available" or "RAC" status over deep WL.
- Mention Tatkal availability if relevant.

### 5. Select Class & Review Availability
- Click selected train. Take snapshot of class options.
- Present available classes with prices via `ask_user` (input_type "choice").
- Show seat availability, confirmation prediction, and fare for each class.
- If waitlisted, ixigo predicts confirmation chances -- share percentage with user.

### 6. Fill Passenger Details
- Enter passenger details: name, age, gender, berth preference (lower/middle/upper/side), ID type.
- For multiple passengers, fill each.
- Mobile number and email from operator profile.
- Take snapshot of filled form.

### 7. Review & Confirm
- Use `confirm_action` to present booking summary:
  - Train: number, name, date
  - From -> To (station names and codes)
  - Departure -> Arrival time, duration
  - Class, quota
  - Passenger(s): name, age, berth preference
  - Fare: base fare, reservation charge, superfast charge, GST, total
  - Confirmation prediction (if WL)
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 8. Payment
- Use `collect_payment`:
  - summary: JSON with train, route, date, class, passengers, fare breakdown, total
  - amount_inr: total amount (number)
  - description: "ixigo train booking"
- STOP and WAIT for payment confirmation.

### 9. Complete & Confirm
- Complete payment on ixigo (UPI/card/netbanking).
- Handle OTP via `ask_user` if needed.
- Take snapshot of booking confirmation.
- Report: PNR number, train number & name, date, class, coach/berth (if confirmed), passengers, total paid.
- Mention: "Save PNR number. Check live status on ixigo app. Carry valid photo ID."

## Site Notes

- ixigo Trains is one of India's most popular train booking apps with unique AI-powered confirmation prediction.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- ixigo shows confirmation probability percentage for waitlisted tickets -- this is a key differentiator, always share it.
- PNR status check is free and does not require login -- but login is needed for booking.
- ixigo aggregates data from IRCTC -- actual booking goes through IRCTC backend, so IRCTC CAPTCHA may appear.
- Tatkal: opens 10 AM (AC) / 11 AM (non-AC) one day before journey. Very competitive, book immediately when window opens.
- WL (Waitlist) tickets may confirm as people cancel. ixigo prediction helps decide whether to book WL.
- Classes: 1AC > 2AC > 3AC > Sleeper > Second Sitting. Price decreases accordingly.
- Senior citizen discount: 40% (men 60+), 50% (women 58+) on base fare.
- ixigo shows alternate trains and date suggestions if selected train has poor availability.
- Session can time out -- if redirected to login, stop and inform user.
- Use `confirm_action` for booking review, `collect_payment` for payment. WAIT for user response.
