---
name: cleartrip-hotel
description: Book hotels on Cleartrip — search by destination, compare options, select room, fill details, pay.
triggers:
  - cleartrip hotel
  - book hotel cleartrip
  - hotel on cleartrip
  - cleartrip stay
  - cleartrip accommodation
  - hotel booking cleartrip
  - cleartrip room
  - cleartrip resort
siteUrl: https://www.cleartrip.com/hotels
requiresAuth: true
params:
  - name: destination
    required: true
    hint: City or area (e.g. "Goa", "Manali", "Mumbai Andheri")
  - name: checkin
    required: true
    hint: Check-in date (e.g. "March 25", "next Friday")
  - name: checkout
    required: true
    hint: Check-out date (e.g. "March 28", "Sunday")
  - name: guests
    required: false
    hint: Number of adults and children (e.g. "2 adults 1 child")
  - name: budget
    required: false
    hint: Budget per night (e.g. "under 3000 per night")
---

# Cleartrip Hotel Booking

Chrome profile: rsinghtomar3011@gmail.com. Operator Cleartrip account logged in.

## Steps

### Step 0: Collect booking details
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **destination** (type: "text", required): City or area name
2. **dates** (type: "calendar", required, mode: "range"): Check-in and check-out dates with shortcuts (This weekend, Next weekend)
3. **guests** (type: "stepper", required): Counters for Adults (default 2), Children (default 0), Rooms (default 1)
4. **budget** (type: "slider", collapsed): Per-night budget, min 500, max 30000, presets [1000, 2000, 5000, 10000]

**CRITICAL**: Do NOT open the browser without destination and dates. These are mandatory search fields.

### 1. Gather Requirements
- Check if user specified destination, check-in, check-out, and guests.
- If destination missing, use `ask_user` (input_type "freetext"): "Which city or area do you want to stay in?"
- If dates missing, use `ask_user` (input_type "freetext"): "What are your check-in and check-out dates?"
- If guests not specified, default to 2 adults, 0 children.
- Note any preferences: budget, star rating, amenities, location.

### 2. Open Cleartrip Hotels
- Open a NEW tab and navigate to `https://www.cleartrip.com/hotels`.
- Take a snapshot to verify page loaded.
- Check if logged in (profile icon / "My Trips" visible).
- **If NOT logged in or session expired, STOP and tell user: "Cleartrip session expired, please re-login in Chrome Debug."**
- Do NOT ask user for credentials.

### 3. Verify Login & Search Hotels
- Take snapshot confirming Cleartrip hotels page.
- Fill search form: destination, check-in date, check-out date, rooms, guests.
- Click "Search Hotels".
- Wait for results to load and take snapshot.
- Apply filters: price range, star rating, user rating, amenities as per user preferences.

### 4. Select Hotel
- Take snapshot of filtered results (top 5-10 hotels).
- Present top options to user using `ask_user` (input_type "choice"):
  - Hotel name, star rating, user rating, price/night, key amenities, distance from center
- User selects preferred hotel.
- Click on hotel to view details.
- Take snapshot of hotel page with room options, photos, reviews.

### 5. Select Room Type
- Take snapshot of available room types.
- Present room options using `ask_user` (input_type "choice"):
  - Room type, bed type, meal plan (room only / breakfast / all meals), cancellation policy, price
- User selects preferred room.
- Click "Book Now" or "Select Room" on chosen option.
- Take snapshot of booking form.

### 6. Fill Guest Details & Review
- Fill guest details (name, email, phone) from operator profile.
- Check for any special requests option.
- Take snapshot of completed form.
- Use `confirm_action` to present booking summary:
  - Hotel name, room type, dates, nights
  - Guests, meal plan, cancellation policy
  - Price breakdown: room charges, taxes, fees, total
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 7. Checkout & Payment
- Click proceed to payment.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with hotel, room, dates, nights, meal plan, taxes, total
  - amount_inr: total amount (number)
  - description: "Cleartrip hotel booking"
- STOP and WAIT for payment confirmation.
- Only proceed if payment confirmed.

### 8. Complete & Confirm
- Complete booking on Cleartrip.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of booking confirmation.
- Report: booking ID, hotel name, address, room type, dates, total paid, cancellation policy.

## Site Notes

- Cleartrip is owned by Flipkart — Flipkart SuperCoins may be usable.
- Free cancellation available on many hotels — highlight this to users.
- "CT Assured" hotels have verified quality — prefer these.
- Operator Chrome Profile 3 is logged in. Do NOT ask user for phone or credentials.
- Cleartrip uses React SPA — wait for search results to render.
- Session managed by cookies. If expired, operator re-logins in Chrome Debug.
- Prices are per night — multiply by nights for total, taxes extra.
- Couple-friendly filter available — use if user mentions it.
- Use `confirm_action` for booking review (no money), `collect_payment` for actual payment.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
- Check-in usually 12-2 PM, check-out 11 AM — varies by hotel.
