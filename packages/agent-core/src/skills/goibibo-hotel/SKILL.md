---
name: goibibo-hotel
description: Book hotels on Goibibo — search by city/dates, filter by price/rating, compare options, book and pay.
triggers:
  - goibibo hotel
  - book hotel on goibibo
  - goibibo hotel booking
  - goibibo stay
  - goibibo room
  - hotel on goibibo
  - goibibo accommodation
  - cheap hotel goibibo
siteUrl: https://www.goibibo.com
requiresAuth: true
params:
  - name: city
    required: true
    hint: Destination city (e.g. "Goa", "Jaipur", "Shimla", "Ooty")
  - name: checkin
    required: true
    hint: Check-in date (e.g. "March 22", "this Friday", "2026-04-05")
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

# Goibibo Hotel Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### Step 0: Collect booking details
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **destination** (type: "text", required): City or area name
2. **dates** (type: "calendar", required, mode: "range"): Check-in and check-out dates with shortcuts (This weekend, Next weekend)
3. **guests** (type: "stepper", required): Counters for Adults (default 2), Children (default 0), Rooms (default 1)
4. **budget** (type: "slider", collapsed): Per-night budget, min 500, max 30000, presets [1000, 2000, 5000, 10000]

**CRITICAL**: Do NOT open the browser without destination and dates. These are mandatory search fields.

### 1. Gather Booking Details
- Confirm city, check-in date, check-out date. If any missing, use `ask_user`.
- Note budget preference, guest count, room preferences (AC, pool, couple-friendly).
- Convert relative dates to actual dates.
- Default to 2 adults, 1 room if not specified.

### 2. Open Goibibo & Verify Login
- Open a NEW tab and navigate to `https://www.goibibo.com/hotels/`.
- Take snapshot. Dismiss any popups (app install, login, promotional banners).
- Verify logged in (profile name/icon in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search Hotels
- Click city/destination field, type the city name, select from autocomplete suggestions.
- Set check-in and check-out dates using date picker.
- Set rooms and guests if non-default.
- Click "Search Hotels" button.
- Take snapshot of search results.

### 4. Filter & Present Options
- Apply filters: price range (if budget given), star rating 3+, user rating "Very Good" or above.
- Sort by "Price (Low to High)" for budget, "Rating (High to Low)" for quality.
- Extract top 3-5 hotels with: name, star rating, user rating, price/night, total price, locality, key amenities (WiFi, breakfast, pool, parking).
- Check for Goibibo goCash+ offers, bank discounts.
- Use `ask_user` (input_type "choice") to present options. Format:
  "Hotel Name -- X-star -- Rs X,XXX/night -- Rating X.X -- Location -- [Free Breakfast]"
- Add "Show more results" as last option.

### 5. Select Room Type
- Click selected hotel. Take snapshot of hotel detail page.
- Browse room options (Standard, Deluxe, Suite, etc.).
- Extract: room type, bed config, cancellation policy, breakfast included, price, any special offers.
- Use `ask_user` (input_type "choice") to present room options.
- Highlight free cancellation if available.

### 6. Review Booking
- Proceed to booking/checkout page. Take snapshot.
- Use `confirm_action` to present booking summary:
  - Hotel name, star rating, full address
  - Room type, bed configuration
  - Check-in / Check-out dates, number of nights
  - Price breakdown: room charge, taxes (GST), fees, discounts, goCash applied
  - Total amount payable
  - Cancellation policy
  - Included meals/amenities
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 7. Fill Guest Details & Payment
- Fill guest details: name, email, phone from operator profile.
- Add special requests if user mentioned any (early check-in, extra bed, ground floor).
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with hotel, room, dates, price breakdown, total
  - amount_inr: total amount (number)
  - description: "Goibibo hotel booking"
- STOP and WAIT for payment confirmation.

### 8. Complete Booking & Confirm
- Complete payment on Goibibo (UPI/card/netbanking/Goibibo wallet).
- Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: booking ID, hotel name, address, room type, dates, total paid, cancellation policy, check-in/check-out time.
- Mention goCash earned for future bookings if applicable.

## Site Notes

- Goibibo is a MakeMyTrip group company. Large hotel inventory across India.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Goibibo shows promotional popups and app-install banners -- dismiss all immediately.
- goCash+ is Goibibo's reward system -- can be used for discounts on future bookings.
- Bank offers (HDFC, ICICI, SBI) often provide 10-15% instant discount -- always check.
- "Price Match Guarantee" -- Goibibo matches lower prices found elsewhere. Mention if relevant.
- GST on hotels: 0% (under Rs 1000), 12% (Rs 1000-7500), 18% (above Rs 7500) per night.
- Couple-friendly hotels are tagged -- relevant if user mentions "for couple" or "with partner".
- Free cancellation is shown with a green tag -- always mention the cancellation policy.
- Goibibo sometimes bundles flight+hotel deals ("GoStays") -- mention if user also needs flights.
- Session can time out -- if redirected to login, stop and inform user.
- Use `confirm_action` for booking review, `collect_payment` for checkout. WAIT for user response.
