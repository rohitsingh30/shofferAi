---
name: confirmtkt-train
description: Check train availability and confirmation prediction on ConfirmTkt — analyze waitlist chances, PNR status, alternate trains.
triggers:
  - confirmtkt
  - confirm tkt
  - train confirmation chance
  - train prediction
  - waitlist confirmation
  - pnr prediction
  - confirmtkt train
  - train availability check
siteUrl: https://www.confirmtkt.com
requiresAuth: true
params:
  - name: from
    required: true
    hint: Departure station/city (e.g. "New Delhi", "NDLS", "Mumbai")
  - name: to
    required: true
    hint: Arrival station/city (e.g. "Jaipur", "Varanasi", "Bangalore")
  - name: date
    required: true
    hint: Travel date (e.g. "March 25", "next Friday")
  - name: class
    required: false
    hint: Travel class (e.g. "Sleeper", "3AC", "2AC", "1AC")
  - name: pnr
    required: false
    hint: PNR number to check status/prediction (10-digit number)
---

# ConfirmTkt Train Availability & Prediction

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Details
- Determine what user wants: (a) check train availability with confirmation prediction, or (b) check PNR status prediction.
- If checking availability: confirm from station, to station, date, class. Use `ask_user` for missing info.
- If checking PNR: confirm the 10-digit PNR number. Use `ask_user` if missing.
- Note any specific train preference (Rajdhani, Shatabdi, specific train number).
- Convert relative dates to actual dates.

### 2. Open ConfirmTkt & Verify Login
- Open a NEW tab and navigate to `https://www.confirmtkt.com`.
- Take snapshot. Close any app-install banners or popups.
- Verify logged in (profile or name visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3A. Search Trains (Availability Check)
- Enter "From" station, select from autocomplete.
- Enter "To" station, select from autocomplete.
- Select travel date.
- Click "Search Trains" or "Check Availability".
- Take snapshot of results.

### 3B. Check PNR Status (PNR Check)
- Navigate to PNR status section.
- Enter the 10-digit PNR number.
- Click "Check PNR Status".
- Take snapshot of results.

### 4. Analyze & Present Results (Availability)
- For each train, extract: train number, name, departure/arrival time, duration, availability per class.
- **Key feature**: ConfirmTkt shows **confirmation probability** for waitlisted tickets (e.g. "85% chance of confirmation").
- Extract confirmation predictions: percentage, historical data, current booking trend.
- Color code: Green (high chance 70%+), Yellow (moderate 40-70%), Red (low <40%).
- Present top 5 trains via `ask_user` (input_type "choice"). Format:
  "12952 Rajdhani — Dep 4:25 PM — 3AC: WL/12 — 🟢 92% confirmation chance — ₹1,855"
  "12302 Howrah Raj — Dep 5:00 PM — 3AC: Available 23 — ₹1,780"
- Prioritize trains with "Available" status, then high confirmation probability WL tickets.

### 5. Analyze & Present Results (PNR)
- Extract PNR details: train number, name, date, class, boarding, destination.
- For each passenger: booking status (WL/RAC/CNF), current status, confirmation prediction percentage.
- Show chart movement history if available.
- Use `ask_user` to present PNR analysis:
  - "Your ticket WL/15 has 78% chance of confirming. Historical data shows similar tickets confirm 3-5 days before journey."
  - Recommend: hold, cancel, or book alternate.

### 6. Recommend Action
- Based on analysis, provide clear recommendation:
  - **If Available**: "Seats available — book directly on IRCTC now."
  - **If WL with high chance (70%+)**: "Good chances of confirmation. Recommend booking and monitoring."
  - **If WL with low chance (<40%)**: "Low confirmation chance. Consider alternate trains or Tatkal."
  - **If RAC**: "RAC tickets always travel. You'll share a berth but guaranteed to board."
- If user wants to book, suggest switching to the `irctc-train` skill.
- Use `ask_user` to confirm what user wants to do next.

### 7. Alternate Suggestions
- If primary train has poor availability, show alternatives:
  - Alternate trains on same route with better availability.
  - Alternate dates (day before/after) with confirmed seats.
  - Tatkal availability (if booking opens next day).
  - Different class with better availability (e.g. Sleeper instead of 3AC).
- Present via `ask_user` (input_type "choice").

### 8. Summary & Confirm
- Use `confirm_action` to present final analysis summary:
  - Route: From → To
  - Date
  - Best train recommendation with confirmation probability
  - Alternate options ranked
  - Action plan: book now, wait and monitor, or switch to Tatkal
- Take snapshot of the analysis page.
- If user wants to proceed with booking, redirect to `irctc-train` skill with pre-filled details.
- Report: analysis summary, recommended train, confirmation chances, next steps.

## Site Notes

- ConfirmTkt is India's leading train prediction platform — specializes in waitlist confirmation probability using ML models.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- ConfirmTkt does NOT book tickets directly — it provides analysis and predictions. Actual booking happens on IRCTC.
- Confirmation predictions are based on historical data, cancellation patterns, and quota utilization.
- Predictions are most accurate 5-7 days before journey — too early and the model has less data.
- WL (Waitlist) movement depends on cancellations. Tatkal tickets released one day before contribute to clearance.
- RAC (Reservation Against Cancellation) tickets ALWAYS allow travel — they just share a berth.
- ConfirmTkt also shows "Alternate Trains" and "Alternate Dates" for better availability options.
- The platform shows IRCTC availability in real-time — data is refreshed every few minutes.
- Peak seasons (Diwali, Christmas, summer holidays) have lower confirmation rates — warn users accordingly.
- Session can expire if idle — if redirected to home, stop and inform user.
- Use `confirm_action` for analysis summary. This skill does NOT use `collect_payment` as no booking happens here.
