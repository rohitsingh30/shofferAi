---
name: hostelworld-hostel
description: Book hostels on Hostelworld — international backpacker hostels, dorms and privates, worldwide coverage, traveller reviews.
triggers:
  - hostelworld
  - hostelworld hostel
  - book hostel hostelworld
  - hostelworld booking
  - international hostel
  - backpacker hostel abroad
  - hostelworld dorm
  - cheap hostel hostelworld
siteUrl: https://www.hostelworld.com
requiresAuth: true
params:
  - name: destination
    required: true
    hint: Destination city (e.g. "Bangkok", "Barcelona", "Tokyo", "London")
  - name: checkIn
    required: true
    hint: Check-in date (e.g. "April 5", "next Monday", "2026-04-10")
  - name: checkOut
    required: true
    hint: Check-out date (e.g. "April 8", "3 nights", "2026-04-13")
  - name: guests
    required: false
    hint: Number of guests (default 1)
  - name: roomType
    required: false
    hint: Room type (e.g. "dorm", "private room", "female dorm")
  - name: maxPrice
    required: false
    hint: Max price per night (e.g. "under 1500", "Rs 2000")
---

# Hostelworld Hostel Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Stay Requirements
- Confirm destination city, check-in date, check-out date. If any missing, use `ask_user`.
- Ask about room type: dorm (mixed/female-only), private room, apartment.
- Note number of guests.
- Ask about preferences: location (central/near station/beach), party hostel vs quiet, social atmosphere, breakfast included.
- Note budget per night if specified.
- Convert relative dates to actual dates. Calculate number of nights.

### 2. Open Hostelworld & Verify Login
- Open a NEW tab and navigate to `https://www.hostelworld.com`.
- Take snapshot. Dismiss any popups (app install, cookie consent, promotional banners, newsletter).
- Verify logged in (profile icon or "My Account" visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search Hostels
- Enter destination city in search bar.
- Set check-in and check-out dates.
- Set number of guests.
- Click "Search" or "Let's go".
- Take snapshot of search results.

### 4. Filter & Present Options
- Apply filters: room type (dorm/private), price range, rating (8+), facilities (WiFi, breakfast, lockers, kitchen), property type, distance from center.
- Sort by: rating, price, distance, or "Best" (Hostelworld's algorithm).
- Extract top 4-5 hostels with: hostel name, location/neighborhood, overall rating, atmosphere/cleanliness/staff ratings, price per night, room types available, key amenities.
- Note Hostelworld ratings: Overall, Atmosphere, Cleanliness, Facilities, Location, Security, Staff, Value.
- Use `ask_user` (input_type "choice") to present options. Format:
  "Lub d Bangkok Siam — Siam Square — Rating 9.2 — From Rs X,XXX/night (dorm) — WiFi, Breakfast, Pool"
- Add "Show more hostels" as last option.

### 5. Select Room Type
- Click selected hostel. Take snapshot of property page.
- Show hostel description, photos, location on map, top reviews.
- Extract room options: room name, type (dorm size / private), price per night, amenities per room.
- Use `ask_user` (input_type "choice") to present room options. Format:
  "8-Bed Mixed Dorm — Rs XXX/night — A/C, Locker, Ensuite Bath"
  "Private Double — Rs X,XXX/night — A/C, Attached Bath, Balcony"
- For dorms, price is per bed. For private, price is per room.

### 6. Review Booking
- Proceed to booking page. Take snapshot.
- Use `confirm_action` to present booking summary:
  - Hostel name, city, neighborhood
  - Room type selected
  - Check-in / Check-out dates, number of nights
  - Number of guests
  - Price per night (in local currency and INR)
  - Deposit amount (Hostelworld charges 10-15% deposit online, rest at hostel)
  - Remaining balance (to be paid at hostel)
  - Cancellation policy (free cancellation period)
  - Key amenities and house rules
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 7. Fill Guest Details & Payment
- Fill guest details: full name, email, phone, nationality, arrival time estimate.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with hostel, city, room type, dates, nights, guests, deposit amount, remaining balance, total
  - amount_inr: deposit amount in INR (number)
  - description: "Hostelworld hostel booking deposit"
- STOP and WAIT for payment confirmation.

### 8. Complete Booking & Confirm
- Complete deposit payment on Hostelworld (card/UPI).
- Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: booking reference, hostel name, city, room type, check-in/check-out dates, deposit paid, remaining balance due at hostel, cancellation deadline.
- Mention: "Carry valid passport/ID. Remaining balance is paid at the hostel. Free cancellation available until [deadline]. Download Hostelworld app for booking details."

## Site Notes

- Hostelworld is the world's leading hostel booking platform with 17,000+ properties in 170+ countries.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Hostelworld shows cookie consent, app-download banners, and promotional popups -- dismiss all immediately.
- Hostelworld uses a DEPOSIT model: 10-15% paid online at booking, remaining paid at the hostel in local currency.
- Prices are shown in local currency by default -- convert to INR for user clarity.
- Rating system is detailed: Overall, Atmosphere, Cleanliness, Facilities, Location, Security, Staff, Value for Money.
- "Hostelworld Recommends" badge indicates consistently high-rated properties -- prefer these.
- Free cancellation is usually available up to 24-48 hours before check-in for the deposit.
- Hostels in Europe/Southeast Asia fill up fast during peak season (Jun-Aug for Europe, Dec-Mar for SEA) -- book early.
- Check if breakfast is included -- many hostels offer free breakfast which adds value.
- Session can expire on idle -- if redirected to login, stop and inform user.
- Use `confirm_action` for booking review, `collect_payment` for deposit payment. WAIT for user response.
