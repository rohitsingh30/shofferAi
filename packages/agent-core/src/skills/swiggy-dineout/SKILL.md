---
name: swiggy-dineout
description: Book a restaurant table via Swiggy Dineout — search restaurants, select date/time/guests, reserve, get confirmation.
triggers:
  - swiggy dineout
  - dineout
  - book restaurant
  - book table
  - restaurant reservation
  - table booking
  - reserve table
  - dining out
  - restaurant booking
  - dinner reservation
siteUrl: https://www.swiggy.com/dineout
requiresAuth: true
params:
  - name: restaurant
    required: false
    hint: Restaurant name or cuisine type (e.g. "Italian", "BBQ Nation", "fine dining")
  - name: date
    required: false
    hint: Date for reservation (e.g. "today", "tomorrow", "Saturday")
  - name: time
    required: false
    hint: Preferred time (e.g. "7 PM", "8:30 PM")
  - name: guests
    required: false
    hint: Number of guests (e.g. "2", "4", "6")
  - name: area
    required: false
    hint: Area or locality (e.g. "Koramangala", "Connaught Place")
---

# Swiggy Dineout — Restaurant Table Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Reservation Details
- BEFORE opening the browser, check what info user provided (restaurant, date, time, guests, area).
- If guests not provided, use `ask_user` (input_type "freetext"): "How many guests will be dining?"
- If date not provided, use `ask_user` (input_type "choice"): "When would you like to dine?" with options: Today, Tomorrow, or a specific date.
- If time not provided, use `ask_user` (input_type "freetext"): "What time would you prefer? (e.g. 7:00 PM, 8:30 PM)"
- If no restaurant or cuisine preference, use `ask_user` (input_type "freetext"): "Any restaurant or cuisine preference? (e.g. Italian, BBQ, fine dining, or a specific restaurant name)"

### 2. Open Swiggy Dineout & Set Location
- Open a NEW tab and navigate to `https://www.swiggy.com/dineout`.
- Take snapshot. Verify logged in (account icon in header).
- If location popup appears, type the user's area/city, wait for suggestions, click best match.
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Confirm location is set and restaurants are visible.

### 3. Search & Select Restaurant
- If user named a specific restaurant, search for it in the search bar.
- If user named a cuisine or preference, search and filter results.
- Apply filters if available: Cuisine, Rating, Price range, Offers.
- Present top 3-5 restaurant options to user with:
  - Restaurant name, cuisine type
  - Rating and reviews
  - Price for two
  - Dineout offers/discounts (e.g. "Flat 20% off", "Flat 50% off bill")
  - Distance/area
- Use `ask_user` (input_type "choice") to let user pick a restaurant.
- Open the restaurant page, take snapshot.

### 4. Select Time Slot & Book
- On the restaurant page, look for "Book a Table" or reservation section.
- Select the date, number of guests, and preferred time slot.
- If the exact time is unavailable, present nearby available slots to user.
- Use `ask_user` (input_type "choice") to let user pick from available time slots.
- Take snapshot showing selected reservation details.

### 5. Confirm Reservation Details
- Use `confirm_action` to present booking summary:
  - Restaurant name and address
  - Date and time
  - Number of guests
  - Dineout offer/discount applicable (e.g. "Flat 20% off total bill")
  - Any special terms (e.g. "Offer valid on food only, not alcohol")
  - Cancellation policy
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Payment for Reservation (if required)
- Some restaurants require a booking fee or pre-payment.
- If payment is required, use `collect_payment` to collect via Razorpay:
  - summary: JSON with restaurant, date, time, guests, offer, booking fee
  - amount_inr: booking fee amount (number)
  - description: "Swiggy Dineout table reservation"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.
- If no payment required, proceed directly to booking confirmation.

### 7. Complete Booking & Confirm
- Click "Confirm Booking" or equivalent.
- Handle OTP verification via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: booking ID, restaurant name and address, date, time, number of guests, offer applicable, cancellation policy, any booking reference number.

## Site Notes

- Swiggy Dineout offers discounts at partner restaurants (typically 10-50% off total bill).
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- Dineout offers are usually valid on food bill only — alcohol, taxes, and service charges may be excluded.
- Some restaurants require a minimum spend to avail the offer — inform user.
- Cancellation policy varies by restaurant — some allow free cancellation up to 1 hour before.
- Peak hours (7-9 PM weekends) fill up fast — suggest booking early.
- Swiggy Dineout uses React — always use Playwright fill/type methods.
- Some restaurants may not appear on Dineout — suggest Zomato or direct booking as alternative.
- Use `confirm_action` for reservation review, `collect_payment` only if booking fee is required.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
