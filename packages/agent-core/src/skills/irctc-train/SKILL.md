---
name: irctc-train
description: Book train tickets on IRCTC — search trains, select class, book seats, pay.
triggers:
  - irctc
  - book train
  - train ticket
  - train booking
  - irctc booking
  - book train ticket
  - railway ticket
  - book rail ticket
  - train reservation
siteUrl: https://www.irctc.co.in
requiresAuth: true
params:
  - name: from
    required: true
    hint: Departure station/city (e.g. "New Delhi", "NDLS", "Mumbai Central")
  - name: to
    required: true
    hint: Arrival station/city (e.g. "Jaipur", "JP", "Varanasi")
  - name: date
    required: true
    hint: Travel date (e.g. "March 25", "next Friday")
  - name: class
    required: false
    hint: Travel class (e.g. "Sleeper", "3AC", "2AC", "1AC", "General")
  - name: quota
    required: false
    hint: Quota (default General). Options: General, Tatkal, Ladies, Senior Citizen.
---

# IRCTC Train Ticket Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### Step 0: Collect journey details
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **from** (type: "text", required): From station name or code
2. **to** (type: "text", required): To station name or code
3. **date** (type: "calendar", required, mode: "single"): Journey date. IRCTC opens bookings 120 days ahead.
4. **class** (type: "chip_bar", required): SL, 3A, 2A, 1A, CC, EC
5. **quota** (type: "chip_bar", collapsed): General (default), Tatkal, Ladies

**CRITICAL**: Do NOT open the browser without from, to, date, and class.

### 1. Gather Travel Details
- Confirm: from station, to station, travel date, class preference.
- If missing, use `ask_user`. Convert relative dates to actual.
- Note: quota (General/Tatkal), number of passengers, berth preference (lower/middle/upper/side).
- Tatkal bookings open at 10 AM (AC) / 11 AM (non-AC) one day before journey.

### 2. Open IRCTC & Verify Login
- Open a NEW tab and navigate to `https://www.irctc.co.in/nget/train-search`.
- Take snapshot. Dismiss any popups/alerts.
- Verify logged in (username in top bar).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- IRCTC CAPTCHA may appear — handle it or ask user to solve via `ask_user`.

### 3. Search Trains
- Enter From station (type and select from autocomplete).
- Enter To station.
- Select travel date from date picker.
- Select class (default "All Classes" or user preference).
- Select quota.
- Click "Search" / "Find Trains".
- Take snapshot of train list.

### 4. Select Train
- Extract trains with: train number, name, departure time, arrival time, duration, days of running.
- Check availability for each: available/RAC/waitlist/not available per class.
- Present top options via `ask_user` (input_type "choice"):
  "12952 Rajdhani — Dep 4:25 PM — Arr 10:15 AM — 3AC: Available 45 — ₹1,855"
- Prefer trains with "Available" status over WL (waitlist).
- Mention if Tatkal quota has better availability.

### 5. Select Class & Berth
- Click selected train and class.
- If berth preference matters, note it (lower berth for elderly, etc.).
- Check if "Confirm" availability or WL — inform user of WL chances.

### 6. Fill Passenger Details
- Enter passenger details: name, age, gender, berth preference, ID type.
- For multiple passengers, fill each.
- If user has saved passengers in IRCTC, use those.
- Mobile number and email from operator profile.
- Take snapshot of filled form.

### 7. Review & Confirm
- Use `confirm_action`:
  - Train: number, name, date
  - From → To (station names and codes)
  - Departure → Arrival time
  - Class, quota
  - Passenger(s): name, age, berth
  - Fare: base fare, GST, total per passenger, grand total
  - PNR status expectation (confirmed/RAC/WL)
- Do NOT proceed unless user confirms.

### 8. Payment
- Use `collect_payment`:
  - summary: JSON with train, route, date, class, passengers, total
  - amount_inr: total
  - description: "IRCTC train ticket"
- WAIT for payment confirmation.

### 9. Complete & Confirm
- Complete payment (UPI/card/netbanking/IRCTC wallet).
- Handle OTP/CAPTCHA via `ask_user` if needed.
- Take snapshot of booking confirmation.
- Report: PNR number, train number & name, date, class, coach/seat (if confirmed), passengers, total paid.
- Mention: "Save PNR number. Check status at indianrail.gov.in. Carry valid ID proof."

## Site Notes

- IRCTC is the ONLY official platform for Indian Railways ticket booking.
- CAPTCHA is almost always required — may need user help via `ask_user`.
- Booking window: 120 days in advance for general quota.
- Tatkal: opens 10 AM (AC classes) / 11 AM (non-AC) one day before journey. Very competitive.
- WL (Waitlist): tickets may confirm as people cancel. WL/1-10 has good chances.
- RAC (Reservation Against Cancellation): guaranteed to travel but may share berth.
- Classes: 1AC > 2AC > 3AC > Sleeper > Second Sitting. Price decreases accordingly.
- Train running status varies by season — check on journey day.
- Food can be ordered via IRCTC eCatering during the journey.
- Senior citizen discount: 40% (men 60+), 50% (women 58+) on base fare.
- Children under 5: free (no berth). 5-12: half fare.
- IRCTC site can be slow during peak hours (10-11 AM for Tatkal) — be patient.
- Use `confirm_action` for review, `collect_payment` for payment. WAIT for user response.
