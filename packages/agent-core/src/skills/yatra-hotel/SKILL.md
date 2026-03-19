---
name: yatra-hotel
description: Book hotels on Yatra.com — search by city/dates, compare properties, select room, fill details, pay.
triggers:
  - yatra hotel
  - yatra booking
  - book hotel yatra
  - yatra stay
  - yatra room
  - yatra accommodation
  - hotel on yatra
  - yatra hotel booking
siteUrl: https://www.yatra.com
requiresAuth: true
params:
  - name: city
    required: true
    hint: City or area (e.g. "Goa", "Jaipur", "near Delhi airport")
  - name: checkin
    required: true
    hint: Check-in date (e.g. "March 25", "next Friday")
  - name: checkout
    required: true
    hint: Check-out date (e.g. "March 27", "next Sunday")
  - name: guests
    required: false
    hint: Number of guests and rooms (default 1 room, 2 adults)
  - name: budget
    required: false
    hint: Budget range per night (e.g. "under 3000", "5000-10000")
  - name: starRating
    required: false
    hint: Preferred star rating (e.g. "3 star", "4-5 star")
---

# Yatra Hotel Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### Step 0: Collect booking details
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **destination** (type: "text", required): City or area name
2. **dates** (type: "calendar", required, mode: "range"): Check-in and check-out dates with shortcuts (This weekend, Next weekend)
3. **guests** (type: "stepper", required): Counters for Adults (default 2), Children (default 0), Rooms (default 1)
4. **budget** (type: "slider", collapsed): Per-night budget, min 500, max 30000, presets [1000, 2000, 5000, 10000]

**CRITICAL**: Do NOT open the browser without destination and dates. These are mandatory search fields.

### 1. Gather Stay Details
- Confirm city/area, check-in date, check-out date. If any missing, use `ask_user`.
- Ask about budget preference, star rating, and any specific requirements (pool, gym, breakfast, near landmark).
- Note number of rooms and guests.
- Ask if user prefers a specific locality/area within the city.
- Convert relative dates to actual dates.

### 2. Open Yatra & Verify Login
- Open a NEW tab and navigate to `https://www.yatra.com/hotels`.
- Take snapshot. Close any popups, app-install banners, or promotional overlays.
- Verify logged in (profile name or icon visible in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search Hotels
- Enter city/area in search field, select from autocomplete suggestions.
- Set check-in date using date picker.
- Set check-out date using date picker.
- Set rooms and guests count.
- Click "Search Hotels" button.
- Take snapshot of results page.

### 4. Filter & Present Options
- Apply filters: star rating, price range, user rating (3.5+), locality, amenities (breakfast, WiFi, pool).
- Sort by: "Price Low to High" for budget, "User Rating" for quality, "Popularity" for safe picks.
- Extract top 4-5 hotels with: name, star rating, user rating, price/night, locality, key amenities, breakfast included.
- Check for Yatra eCash offers or bank discounts.
- Use `ask_user` (input_type "choice") to present options. Format:
  "Hotel Grand Palace (4⭐) — ₹X,XXX/night — Rating 4.3/5 — [Breakfast, Pool, WiFi] — Baga Beach, Goa"
- Add "Show more results" as last option.

### 5. Select Room Type
- Click selected hotel. Take snapshot of hotel detail page.
- Browse available room types: Standard, Deluxe, Suite, etc.
- Extract for each: room name, bed type, size, amenities, cancellation policy, price.
- Check if breakfast is included or add-on.
- Use `ask_user` (input_type "choice") to present room options.

### 6. Review Booking
- Proceed to booking review. Take snapshot.
- Use `confirm_action` to present booking summary:
  - Hotel name, star rating, user rating
  - Address and locality
  - Room type and bed configuration
  - Check-in / Check-out dates, number of nights
  - Amenities included
  - Price breakdown: room rate x nights, taxes (GST), Yatra service fee, discount/eCash, total
  - Cancellation policy (free until date X, or non-refundable)
  - Check-in / Check-out times
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 7. Fill Guest Details & Payment
- Fill guest details: first name, last name, email, phone number.
- Add any special requests (early check-in, extra bed, ground floor, etc.).
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with hotel, room, dates, nights, price breakdown, total
  - amount_inr: total amount (number)
  - description: "Yatra hotel booking"
- STOP and WAIT for payment confirmation.

### 8. Complete Booking & Confirm
- Complete payment on Yatra (UPI/card/netbanking/wallet).
- Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: booking ID, hotel name, address, room type, dates, number of nights, total paid, cancellation deadline.
- Mention: "Carry valid photo ID at check-in. Check-in time is usually 2 PM, check-out 12 PM."

## Site Notes

- Yatra.com is one of India's leading OTAs for hotels, competing with MakeMyTrip and Goibibo.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Yatra eCash is their loyalty currency — check for eCash offers that reduce the effective price.
- "Pay at Hotel" option available on select properties — mention if user prefers not paying upfront.
- Yatra often bundles hotel + flight deals — mention if user also needs flights.
- GST on hotels: 12% for tariff ₹1,000-7,500/night, 18% for tariff above ₹7,500/night.
- "Yatra Assured" hotels are quality-verified with guaranteed service standards — prefer these.
- Photos on listing pages may not match reality for budget hotels — suggest 4+ rated properties.
- Cancellation policies vary: free cancellation (most common), partial refund, or non-refundable (cheapest).
- Yatra shows "TripAdvisor" ratings alongside their own — cross-reference for reliability.
- Session can expire if idle — if redirected to login, stop and inform user.
- Use `confirm_action` for booking review, `collect_payment` for checkout. WAIT for user response.
