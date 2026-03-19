---
name: airbnb-stay
description: Book homestay, apartment, or experience on Airbnb — search by location/dates/guests, filter, compare listings, book and pay.
triggers:
  - airbnb
  - book airbnb
  - airbnb stay
  - airbnb homestay
  - airbnb apartment
  - airbnb booking
  - homestay on airbnb
  - airbnb villa
  - airbnb experience
  - vacation rental
siteUrl: https://www.airbnb.co.in
requiresAuth: true
params:
  - name: location
    required: true
    hint: Destination (e.g. "Goa", "Manali", "Paris", "Bali", "Coorg")
  - name: checkin
    required: true
    hint: Check-in date (e.g. "March 22", "this Friday", "2026-04-05")
  - name: checkout
    required: true
    hint: Check-out date (e.g. "March 25", "Monday", "3 nights")
  - name: guests
    required: false
    hint: Number of guests (default 2 adults)
  - name: propertyType
    required: false
    hint: Property type preference (e.g. "Entire place", "Private room", "Villa", "Treehouse")
  - name: budget
    required: false
    hint: Max price per night (e.g. "under 5000", "budget 10k")
---

# Airbnb Stay Booking

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
- Confirm location, check-in date, check-out date. If any missing, use `ask_user`.
- Note guest count, property type preference (entire place, private room, shared room).
- Note budget, amenity preferences (WiFi, pool, kitchen, AC, parking, pet-friendly).
- Convert relative dates to actual dates.
- Default to 2 adults if not specified.

### 2. Open Airbnb & Verify Login
- Open a NEW tab and navigate to `https://www.airbnb.co.in/`.
- Take snapshot. Dismiss any popups (cookie consent, translation prompt, sign-in banner).
- Verify logged in (profile avatar visible in top-right).
- If NOT logged in, login transparently via Google (rsinghtomar3011@gmail.com). Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search Listings
- Click the search bar ("Where are you going?").
- Type location, select from suggestions.
- Set check-in and check-out dates.
- Set number of guests.
- Click "Search" button.
- Take snapshot of search results.

### 4. Filter & Present Options
- Apply filters: price range (if budget given), property type, instant book, superhost, amenities.
- For "Entire place" filter, click and select. Same for "Superhost" toggle.
- Extract top 4-5 listings with: title, property type, bedrooms/beds/baths, rating, reviews count, price/night, total price, superhost badge, key amenities.
- Check for weekly/monthly discount if stay is 7+ or 28+ days.
- Use `ask_user` (input_type "choice") to present options. Format:
  "Cozy Villa with Pool — Entire place — 2 BR/2 Bath — Rating 4.9 (120 reviews) — Rs X,XXX/night — Superhost"
- Add "Show more listings" as last option.

### 5. View Listing Details
- Click selected listing. Take snapshot of listing page.
- Review: photos, description, house rules, amenities list, location on map, host info, cancellation policy.
- Check reviews for red flags (cleanliness, accuracy of photos, location issues).
- Present key details to user via message. Ask if they want to proceed or see another option.

### 6. Review Booking
- Click "Reserve" button. Take snapshot of booking page.
- Use `confirm_action` to present booking summary:
  - Property: title, type, location
  - Host: name, superhost status
  - Check-in / Check-out dates, number of nights
  - Guests
  - Price breakdown: nightly rate x nights, cleaning fee, service fee, taxes
  - Total amount
  - Cancellation policy (Flexible/Moderate/Strict)
  - House rules highlights (check-in time, no smoking, no parties, etc.)
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 7. Payment
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with property, host, dates, guests, price breakdown, total
  - amount_inr: total amount (number)
  - description: "Airbnb stay booking"
- STOP and WAIT for payment confirmation.

### 8. Complete Booking & Confirm
- Complete payment on Airbnb (credit/debit card, UPI, netbanking).
- Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: confirmation code, property name, host name, address (shown after booking), dates, total paid, cancellation policy.
- Mention: "Check Airbnb messages for host's check-in instructions. Download offline directions to the property."

## Site Notes

- Airbnb is the global leader in homestays and vacation rentals. Strong inventory in India and worldwide.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Airbnb shows cookie consent and translation popups -- dismiss immediately.
- Superhost badge means high-rated, experienced host -- prefer these for reliability.
- "Instant Book" listings confirm immediately. Others require host approval (can take 24 hrs).
- Airbnb service fee is typically 14-16% of subtotal -- always include in total shown to user.
- Cleaning fee varies by property (Rs 500-5000) and is one-time, not per night.
- Cancellation policies: Flexible (free up to 24 hrs before), Moderate (5 days), Strict (14 days).
- Long-stay discounts: many hosts offer 10-20% weekly and 30-50% monthly discounts.
- Address is only revealed after booking is confirmed -- inform user beforehand.
- Currency is auto-detected. For India, prices show in INR. Verify before presenting.
- Photos may not match reality -- check recent reviews for accuracy comments.
- House rules are binding -- mention no-smoking, no-party rules if applicable.
- Use `confirm_action` for booking review, `collect_payment` for payment. WAIT for user response.
