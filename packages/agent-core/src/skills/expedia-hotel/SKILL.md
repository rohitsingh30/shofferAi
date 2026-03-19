---
name: expedia-hotel
description: Book international hotels on Expedia India — search destinations worldwide, compare, book, pay.
triggers:
  - expedia hotel
  - book hotel expedia
  - expedia international hotel
  - expedia stay abroad
  - expedia accommodation
  - hotel booking expedia
  - expedia resort
  - expedia india hotel
siteUrl: https://www.expedia.co.in/Hotels
requiresAuth: true
params:
  - name: destination
    required: true
    hint: City or area worldwide (e.g. "Paris", "London", "Bali", "New York")
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
    hint: Budget per night in INR or local currency
---

# Expedia Hotel Booking (International)

Chrome profile: rsinghtomar3011@gmail.com. Operator Expedia account logged in.

## Steps

### 1. Gather Requirements
- Check if user specified destination, check-in, check-out dates.
- If destination missing, use `ask_user` (input_type "freetext"): "Which city/country do you want to book a hotel in?"
- If dates missing, use `ask_user` (input_type "freetext"): "What are your check-in and check-out dates?"
- If guests not specified, default to 2 adults.
- Note preferences: budget, star rating, neighborhood, amenities, hotel chain.

### 2. Open Expedia India
- Open a NEW tab and navigate to `https://www.expedia.co.in/Hotels`.
- Take a snapshot to verify page loaded.
- Check if logged in (profile/account icon visible).
- **If NOT logged in or session expired, STOP and tell user: "Expedia session expired, please re-login in Chrome Debug."**
- Do NOT ask user for credentials.

### 3. Verify Login & Search Hotels
- Take snapshot confirming Expedia Hotels page.
- Fill search: destination, check-in, check-out, rooms, travellers.
- Click "Search".
- Wait for results and take snapshot.
- Apply filters: price, star rating, guest rating, amenities, free cancellation.

### 4. Select Hotel
- Take snapshot of search results.
- Present top 5 options using `ask_user` (input_type "choice"):
  - Hotel name, star rating, guest rating, price/night (INR), location, key amenities
  - Note if free cancellation available
- User selects preferred hotel.
- Click on hotel for detail page.
- Take snapshot of hotel page: photos, room types, reviews, map.

### 5. Select Room Type
- Take snapshot of room options.
- Present room types using `ask_user` (input_type "choice"):
  - Room type, bed config, meal plan, cancellation policy, price per night
- User selects preferred room.
- Click "Reserve" or "Book" on selected room.
- Take snapshot of booking form.

### 6. Fill Details & Review
- Fill traveller details from operator profile (name, email, phone).
- Note any special requests section.
- Take snapshot of completed booking details.
- Use `confirm_action` to present booking summary:
  - Hotel name, address, room type, dates, nights
  - Price breakdown: room rate x nights, taxes & fees, total in INR
  - Cancellation policy, meal plan
- Do NOT proceed unless user confirms.

### 7. Checkout & Payment
- Click proceed to payment.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with hotel, room, dates, nights, price breakdown, total INR
  - amount_inr: total amount in INR (number)
  - description: "Expedia international hotel booking"
- STOP and WAIT for payment confirmation.
- Only proceed if payment confirmed.

### 8. Complete & Confirm
- Complete booking on Expedia.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of booking confirmation.
- Report: booking ID/itinerary number, hotel, address, room, dates, total paid, cancellation deadline.

## Site Notes

- Expedia.co.in shows prices in INR — no currency confusion for Indian users.
- International hotels may charge in local currency — final INR amount at payment.
- Free cancellation available on many hotels — highlight this benefit.
- Expedia rewards (One Key) may be available on operator account.
- Operator Chrome Profile 3 is logged in. Do NOT ask user for phone or credentials.
- Expedia uses React/Next.js — wait for search results to fully render.
- Session managed by cookies. If expired, operator re-logins in Chrome Debug.
- Prices shown may be "pay at property" or "pay now" — clarify to user.
- Bundle deals (hotel + flight) may save money — mention if relevant.
- Use `confirm_action` for booking review (no money), `collect_payment` for actual payment.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
