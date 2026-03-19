---
name: zomato-dineout
description: Book a restaurant table on Zomato — search restaurants, select date/time/guests, reserve.
triggers:
  - zomato dineout
  - book restaurant table
  - restaurant reservation
  - table booking
  - book table zomato
  - dineout booking
  - restaurant booking
  - reserve table
  - dinner reservation
  - zomato table booking
siteUrl: https://www.zomato.com
requiresAuth: true
params:
  - name: restaurant
    required: false
    hint: Restaurant name or cuisine type (e.g. "Bukhara", "Italian restaurant", "rooftop cafe")
  - name: location
    required: true
    hint: Area or locality (e.g. "Connaught Place", "Koramangala", "Bandra")
  - name: guests
    required: false
    hint: Number of guests (default 2)
  - name: date_time
    required: false
    hint: Preferred date and time (e.g. "tonight 8 PM", "Saturday lunch", "tomorrow 7:30 PM")
---

# Zomato Dineout Table Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Reservation Details
- Confirm restaurant name or cuisine preference.
- Get: location/area, number of guests, preferred date and time, any special occasion or seating preference.
- Use `ask_user` for missing critical info (location at minimum).
- Ask: "Any cuisine preference or specific restaurant in mind?"

### 2. Open Zomato & Set Location
- **CRITICAL**: Zomato homepage (`zomato.com`) is app-only — it shows NO restaurants, only "Download the app" prompts. You MUST bypass it.
- Open a NEW tab and navigate directly to the **city restaurants page**: `https://www.zomato.com/{city}/restaurants`
  - Use `ncr` for Delhi/NCR, `bangalore` for Bangalore, `mumbai` for Mumbai, etc.
- Take snapshot. Verify logged in (profile icon in header).
- If location popup appears, type the user's area, wait for suggestions, click best match.
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Navigate to Dining Out Section
- Click on "Dining Out" or "Book a Table" section (not "Delivery").
- Apply filters: Cuisine type, locality, "Book a Table" availability, rating, cost for two.
- If user named a specific restaurant, search for it directly.
- Take snapshot. Extract top 3-5 restaurants with: name, cuisine, rating, cost for two, location, dining offers (e.g. "Flat 20% off").
- Use `ask_user` (input_type "choice") to let user pick:
  "Bukhara, ITC Maurya — North Indian — 4.8★ — ₹6,000 for two — Flat 15% off via Zomato"

### 4. Select Date, Time & Guests
- Open the restaurant page. Click "Book a Table" button. Take snapshot.
- Select number of guests from the picker.
- Select date from available dates.
- Available time slots appear. Present via `ask_user` (input_type "choice"):
  "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM"
- Click the selected time slot.

### 5. Select Dining Offers (if available)
- Zomato often shows dining offers: "Flat 20% off total bill", "Buy 1 Get 1 on drinks", "15% off via HDFC".
- Take snapshot. Present best offers via `ask_user` (input_type "choice").
- Select the best applicable offer.

### 6. Review & Confirm Reservation
- Booking summary appears. Take snapshot.
- Use `confirm_action`:
  - Restaurant name and address
  - Cuisine type
  - Date and time
  - Number of guests
  - Dining offer applied (if any)
  - Any special instructions
  - Cancellation policy
- Do NOT proceed unless user confirms.

### 7. Complete Reservation
- Click "Confirm Booking" or equivalent.
- Handle phone verification OTP via `ask_user` if needed.
- Take snapshot of booking confirmation.
- Report: booking ID, restaurant name, address, date, time, guests, offer applied, confirmation status.
- Mention: "Table reserved! Show this confirmation at the restaurant. Arrive on time — most restaurants hold tables for 15 minutes only."

### 8. Special Requests (Optional)
- Ask user: "Any special requests? (birthday cake, window seating, high chair for kids, dietary needs)"
- If yes, note them in the reservation or inform user to call the restaurant directly.

## Site Notes

- **BYPASS HOMEPAGE**: `zomato.com` is app-only (shows "Download the app"). Always navigate to `zomato.com/{city}/restaurants` to access the full web experience, then click "Dining Out" tab.
- Zomato Dining Out/Dineout was acquired by Zomato — table booking is integrated into the main Zomato app/site.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator's phone.
- Dining offers (Flat 10-25% off) are a major draw — always check and apply the best one.
- Not all restaurants support online table booking — some only show "Call" option. Inform user if so.
- Peak hours (7-9 PM weekends) may have limited availability — suggest booking in advance.
- "Gold" membership offers extra perks at select restaurants — check if active on operator's account.
- Restaurant ratings on Zomato: 4.0+ is good, 4.5+ is excellent. Below 3.5 is risky — warn user.
- Cost for two is an estimate — actual bill depends on what's ordered.
- Cancellation: most bookings can be cancelled for free up to 1-2 hours before the reservation.
- No payment is collected at booking time — payment happens at the restaurant. Use `confirm_action` only, no `collect_payment`.
- Some premium restaurants require a deposit — inform user if this appears during booking.
