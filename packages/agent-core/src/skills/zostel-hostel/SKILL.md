---
name: zostel-hostel
description: Book hostel beds or private rooms on Zostel — backpacker hostels across India, dorms and privates, community stays.
triggers:
  - zostel
  - zostel hostel
  - book hostel zostel
  - zostel booking
  - zostel dorm
  - backpacker hostel india
  - zostel bed
  - budget stay zostel
siteUrl: https://www.zostel.com
requiresAuth: true
params:
  - name: destination
    required: true
    hint: Destination city or town (e.g. "Manali", "Goa", "Varanasi", "Rishikesh")
  - name: checkIn
    required: true
    hint: Check-in date (e.g. "March 25", "next Friday", "2026-04-10")
  - name: checkOut
    required: true
    hint: Check-out date (e.g. "March 28", "3 nights", "2026-04-13")
  - name: guests
    required: false
    hint: Number of guests (default 1)
  - name: roomType
    required: false
    hint: Room type preference (e.g. "dorm bed", "private room", "female dorm", "mixed dorm")
---

# Zostel Hostel Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### Step 0: Collect booking details
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **destination** (type: "text", required): City or area name
2. **dates** (type: "calendar", required, mode: "range"): Check-in and check-out dates with shortcuts (This weekend, Next weekend)
3. **guests** (type: "stepper", required): Counters for Adults (default 2), Children (default 0), Rooms (default 1)
4. **budget** (type: "slider", collapsed): Per-night budget, min 500, max 30000, presets [1000, 2000, 5000, 10000]

**CRITICAL**: Do NOT open the browser without destination and dates. These are mandatory search fields.

### 1. Gather Stay Requirements
- Confirm destination, check-in date, check-out date. If any missing, use `ask_user`.
- Ask about room type: mixed dorm, female-only dorm, private room, Zostel Plus (premium).
- Note number of guests and beds needed.
- Ask about preferences: common area importance, rooftop, mountain view, near beach.
- Convert relative dates to actual dates. Calculate number of nights.
- Default to 1 guest if not specified.

### 2. Open Zostel & Verify Login
- Open a NEW tab and navigate to `https://www.zostel.com`.
- Take snapshot. Dismiss any popups (app install, newsletter, promotional banners).
- Verify logged in (profile icon or name visible in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search Hostels
- Use the search or browse by destination.
- Enter destination city/town.
- Set check-in and check-out dates.
- Set number of guests.
- Click "Search" or navigate to the destination page.
- Take snapshot of available hostels/properties.

### 4. Select Property & Present Options
- If multiple Zostel properties in the destination, present all options.
- Extract: property name, location description, rating, amenities, starting price per night.
- Differentiate between Zostel (budget) and Zostel Plus/Zostel Homes (premium).
- Use `ask_user` (input_type "choice") to present options. Format:
  "Zostel Manali — Old Manali, River View — Rating 4.5 — From Rs XXX/night (dorm)"
- If only one property, proceed to room selection.

### 5. Select Room Type
- Click selected property. Take snapshot of room options.
- Extract room types with: room name, type (dorm bed/private), capacity, amenities, price per night.
- Note: mixed dorm, female dorm, 4-bed dorm, 6-bed dorm, private double, private triple.
- Use `ask_user` (input_type "choice") to present room options. Format:
  "Mixed Dorm (6-bed) — Rs XXX/night/bed — Locker, WiFi, Common Bath"
  "Private Room — Rs X,XXX/night — Attached Bath, Mountain View"
- For dorms, price is per bed per night. For private rooms, price is per room per night.

### 6. Review Booking
- Proceed to booking page. Take snapshot.
- Use `confirm_action` to present booking summary:
  - Property name, location
  - Room type selected
  - Check-in / Check-out dates, number of nights
  - Number of guests / beds
  - Price per night
  - Subtotal, taxes (GST), service fee
  - Total amount
  - House rules (check-in time, check-out time, quiet hours)
  - Cancellation policy
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 7. Fill Guest Details & Payment
- Fill guest details: full name, email, phone, special requests.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with property, destination, room type, dates, nights, guests, price breakdown, total
  - amount_inr: total amount (number)
  - description: "Zostel hostel booking"
- STOP and WAIT for payment confirmation.

### 8. Complete Booking & Confirm
- Complete payment on Zostel (UPI/card/netbanking).
- Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: booking ID, property name, destination, room type, check-in/check-out dates, number of nights, total paid.
- Mention: "Check-in is typically 2 PM, check-out by 11 AM. Carry valid photo ID. Download Zostel app for booking details."

## Site Notes

- Zostel is India's largest hostel chain with 50+ properties across backpacker destinations.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Zostel shows app-download prompts and newsletter popups -- dismiss all immediately.
- "Zostel Plus" and "Zostel Homes" are premium properties with better amenities -- mention if available at destination.
- Dorm beds come with personal locker, reading light, and charging point. Bedding is provided.
- Common areas are a big draw (rooftop cafes, bonfires, game rooms) -- mention these amenities.
- Zostel has a strong community vibe -- group activities, movie nights, treks are often organized.
- Weekend bookings (Fri-Sun) sell out fast at popular destinations (Goa, Manali, Rishikesh) -- book early.
- Cancellation policy is usually free cancellation up to 24-48 hours before check-in.
- Prices vary significantly by season: peak (Oct-Mar for mountains, Nov-Feb for beaches) vs off-peak.
- GST (12%) is applicable on hostel stays -- include in total shown to user.
- Session can expire on idle -- if redirected to login, stop and inform user.
- Use `confirm_action` for booking review, `collect_payment` for payment. WAIT for user response.
