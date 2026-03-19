---
name: rapido-bike
description: Book a Rapido bike taxi — set pickup and drop, estimate fare, confirm ride, track.
triggers:
  - rapido
  - rapido bike
  - bike taxi
  - rapido ride
  - book rapido
  - rapido bike taxi
  - rapido cab
  - two wheeler ride
siteUrl: https://www.rapido.bike
requiresAuth: true
params:
  - name: pickup
    required: true
    hint: Pickup location (e.g. "Koramangala", "Hitech City", "Anna Nagar")
  - name: drop
    required: true
    hint: Drop location (e.g. "MG Road", "Gachibowli", "T Nagar")
  - name: rideType
    required: false
    hint: Ride type (Bike, Auto, Cab). Default Bike.
---

# Rapido Bike Taxi Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Ride Details
- Confirm pickup location and drop location. If any missing, use `ask_user`.
- Ask for ride type preference: Bike (cheapest), Auto, or Cab.
- Note any time preference (ride now or schedule for later).
- If scheduling, confirm exact date and time.
- Ask if user has any promo code to apply.

### 2. Open Rapido & Verify Login
- Open a NEW tab and navigate to `https://www.rapido.bike`.
- Take snapshot. Close any app-install banners or promotional popups.
- Verify logged in (profile icon or phone number visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Note: Rapido primarily works as a mobile app. The web version may have limited functionality.

### 3. Set Pickup Location
- Click on pickup location field.
- Type the pickup address, select from autocomplete suggestions.
- If exact address not found, try nearby landmark or pin on map.
- Take snapshot to verify location pin is correct.

### 4. Set Drop Location
- Click on drop location field.
- Type the drop address, select from autocomplete suggestions.
- Take snapshot to verify route and estimated distance.

### 5. Select Ride Type & View Estimate
- View available ride options: Bike, Auto, Cab.
- Extract for each: estimated fare, estimated time of arrival (ETA), estimated trip duration.
- Check for surge pricing indicators.
- Use `ask_user` (input_type "choice") to present options. Format:
  "Bike — ₹XX — ETA 3 min — Trip ~20 min"
  "Auto — ₹XXX — ETA 5 min — Trip ~25 min"
  "Cab — ₹XXX — ETA 8 min — Trip ~20 min"
- Mention if any coupon or offer is applicable.

### 6. Apply Promo Code (if any)
- If user has a promo code, apply it before confirming.
- Show discounted fare after applying promo.
- If promo is invalid or expired, inform user and proceed with regular fare.

### 7. Review & Confirm Ride
- Use `confirm_action` to present ride summary:
  - Ride type (Bike/Auto/Cab)
  - Pickup location (full address)
  - Drop location (full address)
  - Estimated distance
  - Estimated trip duration
  - Fare estimate (base fare, distance charges, surge if any, promo discount, total)
  - Payment method
  - ETA of captain/driver
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 8. Book Ride & Payment
- Click "Confirm Booking" or equivalent button.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with ride type, pickup, drop, distance, fare estimate
  - amount_inr: estimated fare (number)
  - description: "Rapido ride booking"
- STOP and WAIT for payment confirmation.

### 9. Track & Confirm
- After booking, take snapshot of captain assignment screen.
- Report: captain name, vehicle number, OTP (if assigned), ETA.
- If captain not assigned after 2 minutes, inform user and offer to retry.
- Take snapshot of ride confirmation.
- Mention: "Share ride OTP only with the assigned captain. Track ride in real-time."

## Site Notes

- Rapido is India's largest bike taxi platform, also offering auto and cab services across major cities.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Rapido's web interface may redirect to app download — try to use the web booking flow if available.
- Bike rides require a helmet — Rapido captains carry an extra helmet for the rider.
- Surge pricing applies during rain, peak hours (8-10 AM, 6-9 PM), and high-demand events.
- Rapido Bike is the cheapest option (typically ₹30-100 for 5-10 km). Auto is mid-range. Cab is premium.
- Cash payment is supported on Rapido — but prefer UPI/wallet for seamless experience.
- Cancellation within 2 minutes is usually free. After captain assignment, cancellation fee may apply.
- Rapido operates in 100+ Indian cities — strongest in Bangalore, Hyderabad, Chennai, Delhi NCR.
- Session can expire if idle — if redirected to login, stop and inform user.
- Use `confirm_action` for ride review, `collect_payment` for payment. WAIT for user response.
