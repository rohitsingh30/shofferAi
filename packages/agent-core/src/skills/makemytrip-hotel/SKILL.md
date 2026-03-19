---
name: makemytrip-hotel
description: Book hotels on MakeMyTrip — search by city/dates/budget, compare options, book and pay.
triggers:
  - makemytrip hotel
  - mmt hotel
  - book hotel on makemytrip
  - makemytrip booking
  - hotel on mmt
  - makemytrip stay
  - mmt room booking
siteUrl: https://www.makemytrip.com
requiresAuth: true
params:
  - name: city
    required: true
    hint: Destination city (e.g. "Goa", "Jaipur", "Manali")
  - name: checkin
    required: true
    hint: Check-in date (e.g. "March 22", "this Friday")
  - name: checkout
    required: true
    hint: Check-out date (e.g. "March 24", "Sunday")
  - name: budget
    required: false
    hint: Max price per night (e.g. "under 3000", "budget 5k")
  - name: guests
    required: false
    hint: Number of guests and rooms (default 2 adults, 1 room)
---

# MakeMyTrip Hotel Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Booking Details
- Confirm city, check-in date, check-out date. If any missing, use `ask_user`.
- Note budget, guest count, room preferences (AC, couple-friendly, pool, etc.).
- Convert relative dates to actual dates (e.g. "this weekend" → specific dates).

### 2. Open MakeMyTrip & Verify Login
- Open a NEW tab and navigate to `https://www.makemytrip.com/hotels`.
- Take snapshot. Close any app-install or login popup.
- Verify logged in (profile icon or name in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search Hotels
- Click on the "City" field and type the destination city. Select from suggestions.
- Set check-in and check-out dates using the date picker.
- Set rooms and guests if non-default.
- Click "Search" button.
- Take snapshot of results page.

### 4. Filter & Present Options
- Apply filters: price range (if budget given), rating 4+, user ratings 3.5+.
- Sort by "Price (Low to High)" if budget-conscious, or "User Rating (High to Low)" for quality.
- Extract top 3-5 hotels with: name, star rating, user rating, price/night, total price, location, key amenities (WiFi, breakfast, pool).
- Check for MMT offers/discounts (bank offers, MMT wallet cashback).
- Use `ask_user` (input_type "choice") to present options. Format: "Hotel Name ⭐X — ₹X,XXX/night — Rating X.X — [key amenity]"

### 5. Select Room Type
- Click selected hotel. Take snapshot of hotel detail page.
- Browse room options (Standard, Deluxe, Suite, etc.).
- Extract: room type, bed type, cancellation policy, breakfast included, price.
- Use `ask_user` (input_type "choice") to present room options.
- Mention if free cancellation is available — important for user confidence.

### 6. Review Booking
- Proceed to booking page. Take snapshot.
- Use `confirm_action` to present booking summary:
  - Hotel name, star rating, address
  - Room type, bed type
  - Check-in / Check-out dates, nights
  - Price breakdown: room charge, taxes, fees, discounts
  - Total amount
  - Cancellation policy
  - Any included meals/amenities
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 7. Fill Guest Details & Payment
- Fill guest details: name, email, phone from operator profile.
- Special requests if user mentioned any (early check-in, extra bed, etc.).
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with hotel, room, dates, price breakdown, total
  - amount_inr: total amount (number)
  - description: "MakeMyTrip hotel booking"
- STOP and WAIT for payment confirmation.

### 8. Complete Booking & Confirm
- Complete payment on MakeMyTrip (UPI/card/netbanking).
- Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: booking ID, hotel name, address, room type, dates, total paid, cancellation policy, check-in time.

## Site Notes

- MakeMyTrip is India's largest OTA. Wide hotel inventory across all cities.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- MMT often shows aggressive popups (app install, login) — dismiss all.
- "MMT Assured" properties are verified for quality — prefer these.
- Bank offers: 10-15% off with HDFC, ICICI, etc. — always check and mention.
- MMT wallet/cashback offers stack with bank offers sometimes.
- Free cancellation is a major selling point — always mention policy.
- Couple-friendly hotels are tagged — relevant if user mentions "for couple".
- Prices shown may be "per night" or "total" — clarify to avoid confusion.
- Taxes (GST 12-18%) are additional — always show total inclusive of taxes.
- Early check-in / late check-out can often be requested — ask if relevant.
- Use `confirm_action` for booking review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
