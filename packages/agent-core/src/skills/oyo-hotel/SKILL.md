---
name: oyo-hotel
description: Book budget hotels and rooms on OYO — search, compare, book and pay.
triggers:
  - oyo
  - oyo hotel
  - oyo room
  - book oyo
  - oyo booking
  - cheap hotel
  - budget hotel
  - oyo stay
siteUrl: https://www.oyorooms.com
requiresAuth: true
params:
  - name: city
    required: true
    hint: City or area (e.g. "Delhi", "near railway station Jaipur")
  - name: checkin
    required: true
    hint: Check-in date
  - name: checkout
    required: true
    hint: Check-out date
  - name: budget
    required: false
    hint: Max price per night (e.g. "under 1000", "below 2000")
---

# OYO Hotel Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### Step 0: Collect booking details
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **destination** (type: "text", required): City or area name
2. **dates** (type: "calendar", required, mode: "range"): Check-in and check-out dates with shortcuts (This weekend, Next weekend)
3. **guests** (type: "stepper", required): Counters for Adults (default 2), Children (default 0), Rooms (default 1)
4. **budget** (type: "slider", collapsed): Per-night budget, min 500, max 30000, presets [1000, 2000, 5000, 10000]

**CRITICAL**: Do NOT open the browser without destination and dates. These are mandatory search fields.

### 1. Gather Details
- Confirm city, check-in, check-out. Use `ask_user` for missing info.
- Note budget, preferences (couple-friendly, AC, WiFi, parking).
- Convert relative dates to actual dates.

### 2. Open OYO & Verify Login
- Open a NEW tab and navigate to `https://www.oyorooms.com`.
- Take snapshot. Close any app-install banners.
- Verify logged in (profile/name visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search Hotels
- Enter city/location in search bar. Select from suggestions.
- Set dates using date picker.
- Set guest/room count if needed.
- Click "Search".
- Take snapshot of results.

### 4. Filter & Present Options
- Apply price filter if budget given. Filter by rating 3.5+.
- Sort by "Price" for budget or "Rating" for quality.
- Extract top 3-5 options: name, price/night, rating, distance from center, key amenities, photos description.
- Use `ask_user` (input_type "choice"): "OYO Hotel Name — ₹XXX/night — ⭐ X.X — [AC, WiFi, TV]"

### 5. Select Room & Review
- Click selected hotel. Take snapshot.
- Browse room options if multiple types available.
- Use `confirm_action` with booking summary:
  - Hotel name and address
  - Room type, amenities
  - Dates, nights
  - Price breakdown: room, taxes, fees, total
  - Cancellation policy
  - Check-in/out times
- Do NOT proceed unless user confirms.

### 6. Checkout & Payment
- Fill guest details from operator profile.
- Use `collect_payment`:
  - summary: JSON with hotel, room, dates, total
  - amount_inr: total
  - description: "OYO hotel booking"
- WAIT for payment confirmation.

### 7. Confirm Booking
- Complete payment. Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation.
- Report: booking ID, hotel name, address, room, dates, amount, check-in instructions.

## Site Notes

- OYO specializes in budget stays: ₹500-3000/night range.
- "OYO Wizard" members get extra discounts — check if applicable.
- Couple-friendly hotels explicitly tagged — important filter.
- OYO has hourly bookings in some cities — clarify if user wants full night.
- Ratings on OYO tend to be lower than Booking.com — 3.5+ is decent.
- Pay at Hotel (PAH) available on some properties — mention as option.
- Cancellation policies vary: free cancellation, partial refund, or non-refundable.
- OYO properties can be inconsistent — recommend 4.0+ rated ones.
- Use `confirm_action` for review, `collect_payment` for checkout. WAIT for user response.
