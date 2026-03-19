---
name: dineout-table
description: Book a restaurant table on Dineout (now part of Swiggy) — search restaurants, select time slot, reserve.
triggers:
  - dineout table
  - book restaurant table
  - dineout reservation
  - restaurant booking dineout
  - book table dineout
  - dineout restaurant
  - table reservation
  - swiggy dineout table
siteUrl: https://www.swiggy.com/dineout
requiresAuth: true
params:
  - name: cuisine
    required: false
    hint: Cuisine preference (e.g. "Italian", "North Indian", "Chinese")
  - name: city
    required: true
    hint: City (e.g. "Mumbai", "Delhi", "Bangalore")
  - name: date
    required: false
    hint: Reservation date (e.g. "today", "tomorrow evening", "Saturday")
  - name: time
    required: false
    hint: Preferred time (e.g. "7 PM", "lunch 1 PM")
  - name: guests
    required: false
    hint: Number of guests (e.g. "4 people", "2 adults 2 kids")
---

# Dineout Restaurant Table Booking

Chrome profile: rsinghtomar3011@gmail.com. Operator Swiggy/Dineout account logged in.

## Steps

### 1. Gather Requirements
- Check if user specified restaurant type, date, time, and guest count.
- If city missing, use `ask_user` (input_type "freetext"): "Which city are you looking to dine in?"
- If date/time missing, use `ask_user` (input_type "freetext"): "When do you want to dine? (date and preferred time)"
- If guests missing, use `ask_user` (input_type "freetext"): "How many guests?"
- Note preferences: cuisine, area/locality, budget, ambience, special occasion.

### 2. Open Dineout on Swiggy
- Open a NEW tab and navigate to `https://www.swiggy.com/dineout`.
- Take a snapshot to verify page loaded.
- Check if logged in (profile icon / account visible).
- **If NOT logged in or session expired, STOP and tell user: "Swiggy/Dineout session expired, please re-login in Chrome Debug."**
- Do NOT ask user for credentials.
- Set city if not already correct.

### 3. Verify Login & Search Restaurants
- Take snapshot confirming Dineout page.
- Search or browse by: cuisine, locality, type (casual dining, fine dining, cafe).
- Apply filters: cuisine, area, budget (per person), rating, offers/discounts.
- Take snapshot of restaurant listings.

### 4. Select Restaurant
- Present top 5 restaurants using `ask_user` (input_type "choice"):
  - Restaurant name, cuisine, area, rating, cost for two, available offers/discounts
- User selects preferred restaurant.
- Click on restaurant for detail page.
- Take snapshot: menu, photos, reviews, available time slots.

### 5. Select Time Slot & Book
- Take snapshot of available booking slots for user's date.
- Present available time slots using `ask_user` (input_type "choice"):
  - Time slots with availability status
  - Any special meal deals (set menus, buffets)
- User selects time slot.
- Enter number of guests.
- Fill booking details: name, phone, email from operator profile.
- Any special requests (birthday, anniversary, high chair, window seat).
- Take snapshot of booking form.

### 6. Review Reservation
- Use `confirm_action` to present reservation summary:
  - Restaurant name, address, cuisine
  - Date, time, number of guests
  - Any pre-booking amount or offers applied
  - Cancellation policy
- Do NOT proceed unless user confirms.

### 7. Confirm Reservation
- If Dineout requires pre-payment or deposit:
  - Use `collect_payment` to collect via Razorpay:
    - summary: JSON with restaurant, date, time, guests, deposit amount
    - amount_inr: deposit amount (number)
    - description: "Dineout table reservation"
  - STOP and WAIT for payment confirmation.
- If no pre-payment needed, click "Confirm Booking".
- Take snapshot of confirmation page.
- Report: booking ID, restaurant name, address, date, time, guests, any offers, what to expect.

## Site Notes

- Dineout is now part of Swiggy — accessible at swiggy.com/dineout.
- Many restaurants offer 10-50% discount on total bill via Dineout.
- Dineout Gold/Pro members get extra discounts — check if operator has membership.
- Pre-booking is usually FREE — restaurant billing is at the venue.
- Some premium restaurants may require a deposit — handle via collect_payment.
- Operator Chrome Profile 3 is logged in. Do NOT ask user for phone or credentials.
- Session managed by Swiggy cookies. If expired, operator re-logins in Chrome Debug.
- Cancellation should be done 1-2 hours before the slot to avoid penalty.
- Weekends and evenings fill up fast — book early for popular restaurants.
- Use `confirm_action` for reservation review, `collect_payment` only if deposit needed.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
