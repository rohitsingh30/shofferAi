---
name: agoda-hotel
description: Book hotels on Agoda — search worldwide destinations, compare deals, book rooms, pay.
triggers:
  - agoda hotel
  - book hotel agoda
  - agoda booking
  - agoda stay
  - agoda accommodation
  - hotel on agoda
  - agoda room
  - agoda deals
siteUrl: https://www.agoda.com
requiresAuth: true
params:
  - name: destination
    required: true
    hint: City or area (e.g. "Bangkok", "Goa", "Tokyo")
  - name: checkin
    required: true
    hint: Check-in date
  - name: checkout
    required: true
    hint: Check-out date
  - name: guests
    required: false
    hint: Number of adults and children
  - name: budget
    required: false
    hint: Budget per night
---

# Agoda Hotel Booking

Chrome profile: rsinghtomar3011@gmail.com. Operator Agoda account logged in.

## Steps

### Step 0: Collect booking details
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **destination** (type: "text", required): City or area name
2. **dates** (type: "calendar", required, mode: "range"): Check-in and check-out dates with shortcuts (This weekend, Next weekend)
3. **guests** (type: "stepper", required): Counters for Adults (default 2), Children (default 0), Rooms (default 1)
4. **budget** (type: "slider", collapsed): Per-night budget, min 500, max 30000, presets [1000, 2000, 5000, 10000]

**CRITICAL**: Do NOT open the browser without destination and dates. These are mandatory search fields.

### 1. Gather Requirements
- Check if user specified destination, dates, and guest count.
- If destination missing, use `ask_user` (input_type "freetext"): "Which city or area are you looking to stay in?"
- If dates missing, use `ask_user` (input_type "freetext"): "What are your check-in and check-out dates?"
- Default to 2 adults if guests not specified.
- Note preferences: budget, star rating, pool, breakfast, proximity.

### 2. Open Agoda
- Open a NEW tab and navigate to `https://www.agoda.com`.
- Take a snapshot to verify page loaded.
- Check if logged in (profile icon / "Hi, [Name]" visible).
- **If NOT logged in or session expired, STOP and tell user: "Agoda session expired, please re-login in Chrome Debug."**
- Do NOT ask user for credentials.

### 3. Verify Login & Search Hotels
- Take snapshot confirming Agoda homepage.
- Fill search: destination, check-in, check-out, guests/rooms.
- Click "SEARCH" button.
- Wait for results and take snapshot.
- Apply filters: price range, star rating, review score, amenities, free cancellation.
- Sort by user preference (recommended, price low-to-high, review score).

### 4. Select Hotel
- Take snapshot of search results.
- Present top 5 options using `ask_user` (input_type "choice"):
  - Hotel name, stars, review score, price/night, location, breakfast included?, free cancellation?
- User selects preferred hotel.
- Click on hotel for detail page.
- Take snapshot: photos, room types, reviews, location map.

### 5. Select Room Type
- Take snapshot of available rooms.
- Present room options using `ask_user` (input_type "choice"):
  - Room name, bed type, max guests, meal plan, cancellation policy, price
- User selects room.
- Click "Book Now" or "Reserve".
- Take snapshot of booking form.

### 6. Fill Details & Review
- Fill guest details from operator profile.
- Check for special requests or add-ons.
- Take snapshot of completed form.
- Use `confirm_action` to present booking summary:
  - Hotel, room, dates, nights, guests
  - Price: room rate, taxes, service fee, total
  - Cancellation policy and deadline
- Do NOT proceed unless user confirms.

### 7. Checkout & Payment
- Click proceed to payment.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with hotel, room, dates, nights, price breakdown, total
  - amount_inr: total in INR (number)
  - description: "Agoda hotel booking"
- STOP and WAIT for payment confirmation.
- Only proceed if payment confirmed.

### 8. Complete & Confirm
- Complete booking on Agoda.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: booking ID, hotel name, address, room, dates, total paid, cancellation policy.

## Site Notes

- Agoda often has the best prices for Southeast Asian hotels — good for Thailand, Bali, Vietnam.
- "Secret deals" and "Insider deals" offer additional discounts for logged-in users.
- AgodaCash rewards may be available on operator account.
- Operator Chrome Profile 3 is logged in. Do NOT ask user for phone or credentials.
- Agoda uses React — wait for dynamic content and price calculations to load.
- Session managed by cookies. If expired, operator re-logins in Chrome Debug.
- Prices may show in USD or local currency — ensure INR display for Indian users.
- "Pay at property" vs "Pay now" options — clarify with user.
- Some deals are non-refundable but cheaper — always mention cancellation terms.
- Use `confirm_action` for booking review (no money), `collect_payment` for actual payment.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
