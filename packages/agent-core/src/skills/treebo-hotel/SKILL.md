---
name: treebo-hotel
description: Book budget hotels on Treebo — search by city/dates, compare quality-assured properties, select room, pay.
triggers:
  - treebo
  - treebo hotel
  - book treebo
  - treebo room
  - treebo stay
  - treebo budget hotel
  - treebo booking
  - treebo accommodation
siteUrl: https://www.treebo.com
requiresAuth: true
params:
  - name: city
    required: true
    hint: City or area (e.g. "Bangalore", "Pune", "near Jaipur railway station")
  - name: checkin
    required: true
    hint: Check-in date (e.g. "March 25", "tomorrow")
  - name: checkout
    required: true
    hint: Check-out date (e.g. "March 27", "day after tomorrow")
  - name: guests
    required: false
    hint: Number of guests and rooms (default 1 room, 2 adults)
  - name: budget
    required: false
    hint: Max price per night (e.g. "under 1500", "below 2500")
---

# Treebo Hotel Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Stay Details
- Confirm city/area, check-in date, check-out date. If any missing, use `ask_user`.
- Ask about budget range per night.
- Note any preferences: couple-friendly, near specific landmark, AC, WiFi, parking, breakfast.
- Note number of rooms and guests.
- Convert relative dates to actual dates.

### 2. Open Treebo & Verify Login
- Open a NEW tab and navigate to `https://www.treebo.com`.
- Take snapshot. Close any app-install banners or promotional popups.
- Verify logged in (profile name or icon visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search Hotels
- Enter city or area in search field, select from autocomplete.
- Set check-in date using date picker.
- Set check-out date using date picker.
- Set rooms and guests count.
- Click "Search" button.
- Take snapshot of results page.

### 4. Filter & Present Options
- Apply filters: price range (budget), rating (3.5+), amenities (AC, WiFi, breakfast, parking).
- Sort by: "Price Low to High" for budget, "Rating" for quality.
- Extract top 4-5 hotels with: name, Treebo category (Treebo / Treebo Trend / Treebo Tryst), rating, price/night, locality, key amenities, breakfast included.
- Check for Treebo offers or first-booking discounts.
- Use `ask_user` (input_type "choice") to present options. Format:
  "Treebo Trend Royal Orchid — ₹X,XXX/night — Rating 4.1/5 — [AC, WiFi, Breakfast, Parking] — MG Road, Bangalore"
- Add "Show more results" as last option.

### 5. Select Room Type
- Click selected hotel. Take snapshot of detail page.
- Browse room types: Standard, Deluxe, Suite (availability varies by property).
- Extract: room name, bed type (single/double/twin), amenities, cancellation policy, price.
- Check if complimentary breakfast is included.
- View hotel photos and guest reviews.
- Use `ask_user` (input_type "choice") to present room options.

### 6. Review Booking
- Proceed to booking summary. Take snapshot.
- Use `confirm_action` to present booking details:
  - Hotel name and Treebo category
  - Address and locality
  - Room type and bed configuration
  - Check-in / Check-out dates, number of nights
  - Amenities: AC, WiFi, TV, breakfast, parking, power backup, daily housekeeping
  - Price breakdown: room rate x nights, taxes (GST), Treebo service fee, discount, total
  - Cancellation policy (free cancellation deadline or non-refundable)
  - Check-in time (usually 12 PM) / Check-out time (usually 11 AM)
  - Treebo quality guarantee details
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 7. Fill Guest Details & Payment
- Fill guest details: first name, last name, email, phone.
- Add special requests: early check-in, late check-out, extra bed, ground floor preference.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with hotel, room type, dates, nights, price breakdown, total
  - amount_inr: total amount (number)
  - description: "Treebo hotel booking"
- STOP and WAIT for payment confirmation.

### 8. Complete Booking & Confirm
- Complete payment on Treebo (UPI/card/netbanking/wallet).
- Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: booking ID, hotel name, address, room type, dates, number of nights, total paid, cancellation deadline, check-in instructions.
- Mention: "Carry valid photo ID at check-in. Treebo guarantees clean rooms, fresh linen, and working amenities. Contact hotel directly for early check-in requests."

## Site Notes

- Treebo is India's leading quality-assured budget hotel chain, operating in 100+ cities with standardized quality.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Treebo categories: Treebo (budget, ₹800-1500), Treebo Trend (mid-range, ₹1500-3000), Treebo Tryst (premium, ₹3000+).
- Every Treebo property undergoes quality audits — guaranteed clean rooms, fresh linen, free WiFi, complimentary breakfast (on most).
- "Treebo Quality Guarantee" means if the room does not meet standards, user gets a refund or room upgrade.
- Couple-friendly hotels are explicitly tagged — important for young couples traveling without marriage certificate.
- Pay at Hotel available on select properties — mention if user prefers deferred payment.
- GST on hotels: 12% for tariff ₹1,000-7,500/night, 18% above ₹7,500/night. Budget Treebo stays are usually 12%.
- Cancellation: most Treebo hotels offer free cancellation up to 24 hours before check-in. Non-refundable rates are ~10-15% cheaper.
- Treebo properties are franchised — quality can vary slightly between locations. Check reviews before recommending.
- Session can expire if idle — if redirected to login, stop and inform user.
- Use `confirm_action` for booking review, `collect_payment` for checkout. WAIT for user response.
