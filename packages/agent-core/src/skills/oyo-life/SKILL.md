---
name: oyo-life
description: Book long-stay OYO Life apartments — monthly furnished rentals with zero deposit options.
triggers:
  - oyo life
  - oyo monthly
  - oyo long stay
  - oyo apartment
  - oyo furnished rental
  - oyo life booking
  - monthly rental oyo
  - oyo living
siteUrl: https://www.oyolife.in
requiresAuth: true
params:
  - name: city
    required: true
    hint: City or locality (e.g. "Bangalore", "Gurgaon Sector 48", "Pune Hinjewadi")
  - name: budget
    required: false
    hint: Monthly rent budget (e.g. "under 10000", "8k-15k")
  - name: occupancy
    required: false
    hint: Single, double, triple occupancy (default "single")
  - name: gender
    required: false
    hint: Male, female, or unisex
  - name: move_in
    required: false
    hint: Move-in date (e.g. "tomorrow", "next Monday", "March 25")
---

# OYO Life Long-Stay Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### Step 0: Collect booking details
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **destination** (type: "text", required): City or area name
2. **dates** (type: "calendar", required, mode: "range"): Check-in and check-out dates with shortcuts (This weekend, Next weekend)
3. **guests** (type: "stepper", required): Counters for Adults (default 2), Children (default 0), Rooms (default 1)
4. **budget** (type: "slider", collapsed): Per-night budget, min 500, max 30000, presets [1000, 2000, 5000, 10000]

**CRITICAL**: Do NOT open the browser without destination and dates. These are mandatory search fields.

### 1. Gather Requirements
- Confirm city/locality, budget, occupancy type, gender preference. Use `ask_user` for missing info.
- Note move-in date, expected duration of stay (months).
- Ask about preferences: AC, WiFi, meals, laundry, power backup, parking.
- Clarify: OYO Life is for 1+ month stays — not nightly hotel bookings. Redirect to oyo-hotel skill if short stay.

### 2. Open OYO Life & Verify Login
- Open a NEW tab and navigate to `https://www.oyolife.in`.
- Take snapshot. Close any app-install banners or promotional popups.
- Verify logged in (profile icon, phone number, or user name visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search Apartments
- Enter city or locality in search bar. Select from suggestions.
- Set occupancy type (single/double/triple) if filter available.
- Set gender preference filter if applicable.
- Apply budget filter if specified.
- Click "Search" or "Explore".
- Take snapshot of results page.

### 4. Filter & Present Options
- Apply amenity filters: AC, meals, WiFi, housekeeping, laundry.
- Sort by price or rating.
- Extract top 5 options: property name, locality, room type, rent/month, deposit, occupancy, rating, key amenities, distance from user's work area if mentioned.
- Highlight "Zero Deposit" or "Low Deposit" properties.
- Use `ask_user` (input_type "choice"): "OYO Life Property — Single Occupancy — ₹XX,XXX/month — Deposit ₹XX,XXX — Locality — [AC, Meals, WiFi]"

### 5. Room Selection & Review
- Click selected property. Take snapshot of detail page.
- Browse room types if multiple options (standard, deluxe, premium).
- Extract: full address, room photos, furniture list, common area amenities, house rules, meal plan details.
- Use `confirm_action` with booking summary:
  - Property name and full address
  - Room type and occupancy
  - Monthly rent (inclusive of what)
  - Security deposit amount
  - Move-in charges
  - Included services: meals (veg/non-veg, schedule), housekeeping (frequency), laundry
  - WiFi speed, AC availability
  - Lock-in period and notice period
  - House rules: guest policy, curfew, smoking
  - OYO Life managed services
- Do NOT proceed unless user confirms.

### 6. Book & Payment
- Click "Book Now" and proceed to checkout.
- Fill tenant details: name, phone, email, ID proof type from operator profile.
- Use `collect_payment`:
  - summary: JSON with property name, room type, monthly rent, deposit, move-in charges, total first payment
  - amount_inr: first month rent + deposit + move-in charges
  - description: "OYO Life monthly rental booking"
- WAIT for payment confirmation.

### 7. Final Confirmation
- Complete payment and booking on OYO Life.
- Handle OTP via `ask_user` if needed.
- Take snapshot of booking confirmation page.
- Report: booking ID, property name, full address, room number, move-in date, monthly rent, deposit paid, OYO Life support number, move-in instructions (key collection, check-in time).

## Site Notes

- OYO Life is OYO's long-stay brand — fully furnished apartments for 1+ month stays with zero/low deposit.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) must be logged in. Do NOT ask user for credentials.
- OYO Life operates in Bangalore, Gurgaon, Noida, Pune, Hyderabad, Chennai — primarily IT hubs.
- "Zero Deposit" is a major selling point but may have higher monthly rent — compare total cost over stay duration.
- Meals are included in many OYO Life properties (breakfast + dinner) — significant value add. Mention plan details.
- Lock-in is typically 1-3 months — shorter than traditional rentals. Always mention early exit penalty.
- OYO Life properties are managed end-to-end: maintenance, housekeeping, WiFi — tenants deal only with OYO.
- Rating 3.5+ on OYO Life is decent — similar to OYO hotels, ratings tend to skew lower.
- OYO Life may redirect to oyorooms.com for some listings — handle URL changes gracefully.
- Session cookies expire after ~30 days. Profile 3 should stay logged in.
- Use `confirm_action` for booking review, `collect_payment` for checkout. WAIT for user response.
