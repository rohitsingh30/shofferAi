---
name: zoomcar-rental
description: Rent a self-drive car on Zoomcar — search by city/dates, filter by car type, compare options, book and pay.
triggers:
  - zoomcar
  - rent a car
  - zoomcar rental
  - self drive car
  - car rental
  - zoomcar booking
  - rent car on zoomcar
  - self drive rental
  - car hire
siteUrl: https://www.zoomcar.com
requiresAuth: true
params:
  - name: city
    required: true
    hint: Pickup city (e.g. "Bangalore", "Delhi", "Mumbai", "Goa")
  - name: pickupDate
    required: true
    hint: Pickup date and time (e.g. "March 25 10 AM", "tomorrow morning", "Friday 6 PM")
  - name: dropoffDate
    required: true
    hint: Return date and time (e.g. "March 27 10 AM", "Sunday evening")
  - name: carType
    required: false
    hint: Car type preference (e.g. "Hatchback", "Sedan", "SUV", "Luxury")
  - name: transmission
    required: false
    hint: Transmission preference (e.g. "Automatic", "Manual"). Default any.
---

# Zoomcar Self-Drive Car Rental

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Rental Details
- Confirm city, pickup date/time, return date/time. If any missing, use `ask_user`.
- Note car type preference: Hatchback, Sedan, SUV, Premium, Luxury.
- Note transmission preference: Automatic or Manual.
- Ask about fuel type preference if relevant (Petrol, Diesel, Electric).
- Calculate rental duration in days/hours for price comparison.
- Default to city center pickup if location not specified.

### 2. Open Zoomcar & Verify Login
- Open a NEW tab and navigate to `https://www.zoomcar.com/`.
- Take snapshot. Dismiss any popups (app download, offers, location prompt).
- Verify logged in (profile icon or name visible in header/menu).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search Cars
- Select or confirm the city.
- Set pickup date and time using date/time picker.
- Set return date and time using date/time picker.
- Click "Search" / "Find Cars" button.
- Take snapshot of available cars list.

### 4. Filter & Present Options
- Apply filters: car type (Hatchback/Sedan/SUV), transmission (Auto/Manual), fuel type, seats.
- Sort by price (low to high) or rating.
- Extract top 4-5 cars with: car name, model, type, transmission, fuel, seats, rating, total price, per-day price, km limit, excess km charge.
- Check for Zoomcar offers or coupon codes.
- Use `ask_user` (input_type "choice") to present options. Format:
  "Hyundai i20 — Hatchback — Manual — Petrol — Rs X,XXX total (X days) — Rating 4.3 — 300 km free"
  "Maruti Swift Dzire — Sedan — Auto — Rs X,XXX total — Rating 4.1 — 400 km free"
- Add "Show more cars" as last option.

### 5. View Car Details
- Click selected car. Take snapshot of car detail page.
- Check: pickup location options, car photos, features, reviews, km allowance, fuel policy (same-to-same), damage policy, late return charges.
- Select preferred pickup hub/location.
- Use `ask_user` if multiple pickup locations available.

### 6. Review Booking
- Proceed to booking/checkout page. Take snapshot.
- Use `confirm_action` to present rental summary:
  - Car: name, model, type, transmission, fuel
  - Pickup: location, date, time
  - Return: location, date, time
  - Duration: X days Y hours
  - Km allowance and excess charge per km
  - Price breakdown: base rental, GST, refundable security deposit, insurance, any add-ons
  - Total payable now (rental + deposit)
  - Fuel policy (same-to-same)
  - Cancellation policy
  - Documents required (DL, Aadhaar)
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 7. Fill Details & Payment
- Fill renter details: name, email, phone, driving license number.
- Upload DL photo if required (or confirm already uploaded).
- Add-ons: extra km pack, FASTag for tolls, child seat -- skip unless user requests.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with car, pickup/return, duration, km limit, price breakdown, total
  - amount_inr: total amount including deposit (number)
  - description: "Zoomcar self-drive rental"
- STOP and WAIT for payment confirmation.

### 8. Complete Booking & Confirm
- Complete payment on Zoomcar (UPI/card/netbanking).
- Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: booking ID, car name and model, pickup location and address, pickup/return date-time, total paid, deposit amount (refundable), km limit, fuel policy.
- Mention: "Carry original Driving License + Aadhaar at pickup. Return with same fuel level. Check car for existing damage before driving."

## Site Notes

- Zoomcar is India's largest self-drive car rental platform. Available in 45+ cities.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Zoomcar shows app-download and promotional popups -- dismiss all immediately.
- Security deposit (Rs 2,000-5,000) is refundable after trip if no damage. Mention clearly.
- Km allowance varies by car and package -- excess km charges Rs 9-15/km. Clarify upfront.
- Fuel policy: pick up and return with same fuel level. Fuel cost is on the renter.
- Late return charges are steep (Rs 200-500/hr) -- warn user to return on time.
- Minimum age: 21 years with valid Driving License. International DL accepted for foreign users.
- Car condition: take photos at pickup to document pre-existing damage. Essential for deposit refund.
- Zoomcar Host: some cars are from private owners. Quality may vary -- check ratings.
- Toll charges are extra and renter's responsibility. FASTag add-on available on some cars.
- Cancellation: free up to 24 hours before pickup. 50% charge within 24 hours. No refund within 6 hours.
- Use `confirm_action` for booking review, `collect_payment` for payment. WAIT for user response.
