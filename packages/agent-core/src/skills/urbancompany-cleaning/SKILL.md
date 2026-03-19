---
name: urbancompany-cleaning
description: Book home deep cleaning on Urban Company. Full home, bathroom, kitchen, sofa — by BHK size and schedule.
triggers:
  - home cleaning
  - deep cleaning
  - book cleaning
  - house cleaning
  - bathroom cleaning
  - kitchen cleaning
  - sofa cleaning
  - urban company cleaning
  - urbanclap cleaning
  - full home cleaning
  - carpet cleaning
  - cleaning service at home
siteUrl: https://www.urbancompany.com
requiresAuth: true
params:
  - name: cleaning_type
    required: true
    hint: Type of cleaning (e.g. "full home deep cleaning", "bathroom cleaning", "kitchen cleaning", "sofa cleaning", "carpet cleaning")
  - name: bhk
    required: false
    hint: Apartment size for full home cleaning (e.g. "1 BHK", "2 BHK", "3 BHK", "4 BHK")
  - name: date
    required: false
    hint: Preferred date (e.g. "today", "tomorrow", "Saturday", "March 20")
  - name: time
    required: false
    hint: Preferred time slot (e.g. "morning", "10 AM", "afternoon")
---

# Urban Company — Home Deep Cleaning

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine the exact cleaning service needed. Available types:
  - **Full Home Deep Cleaning**: by BHK size (1/2/3/4 BHK) — covers all rooms, bathrooms, kitchen, balcony
  - **Bathroom Deep Cleaning**: per bathroom — tiles, fixtures, drain, mirrors
  - **Kitchen Deep Cleaning**: chimney, gas stove, cabinets, countertops, sink, tiles
  - **Sofa Cleaning**: by seating capacity (3-seater, 5-seater, L-shape, etc.)
  - **Carpet Cleaning**: by size (small, medium, large)
  - **Move-in/Move-out Cleaning**: full vacant home cleaning before moving
  - **Mattress Cleaning**: single, double, king size
- For full home cleaning: get BHK size (1 BHK, 2 BHK, 3 BHK, etc.).
- For sofa/carpet: get size/seating capacity.
- Get preferred date and time.
- Use `ask_user` for any missing details.

### 2. Open Urban Company & Verify Login
- Open a NEW tab and navigate to `https://www.urbancompany.com/home-deep-cleaning`.
- Take snapshot. Verify location is set (city/area visible).
- If location not set or wrong, update to user's area.
- Verify logged in (profile icon visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Browse & Select Service
- Navigate to the relevant cleaning category.
- Take snapshot of available packages.
- For full home cleaning, select BHK size to see pricing.
- Extract options with: package name, what's included, price, duration, team size, rating.
- Common packages:
  - "1 BHK Deep Cleaning — ₹XXXX — 4-5 hrs — 2 professionals — Includes: rooms, bathroom, kitchen, balcony"
  - "2 BHK Deep Cleaning — ₹XXXX — 5-6 hrs — 2-3 professionals"
  - "Bathroom Cleaning (per unit) — ₹XXX — 1-2 hrs — 1 professional"
  - "Kitchen Cleaning — ₹XXXX — 2-3 hrs — 1-2 professionals"
- Use `ask_user` (input_type "choice") to pick the package.
- Add any extras (e.g., additional bathroom, balcony add-on, fridge cleaning).

### 4. Review Cart & Confirm
- Take snapshot of cart with selected services.
- Use `confirm_action` with booking summary:
  - Cleaning type and BHK/size
  - What's included (rooms covered, specific items cleaned)
  - Number of professionals
  - Estimated duration
  - Materials: UC brings all cleaning supplies and equipment
  - Add-ons selected
  - Total price
- Do NOT proceed unless user confirms.

### 5. Select Date & Time
- Navigate to scheduling page.
- Choose preferred date from calendar.
- Choose time slot (morning/afternoon — cleaning services usually start early).
- Note: deep cleaning requires a large time block (4-8 hours for full home).
- If preferred slot unavailable, show alternatives.
- Confirm slot with user via `ask_user`.

### 6. Payment & Book
- Fill/verify address if not already set.
- Use `collect_payment`:
  - summary: JSON with cleaning_type, bhk_size, services_included, date, time_slot, duration, professionals, total
  - amount_inr: total amount
  - description: "Urban Company home deep cleaning"
- WAIT for payment confirmation from user.

### 7. Confirm Booking
- Complete payment (UPI / card / net banking).
- Handle OTP via `ask_user` if needed.
- Take snapshot of booking confirmation page.
- Report to user: booking ID, cleaning type, BHK/size, date, time slot, number of professionals, estimated duration, address, amount paid.
- Mention: "Cleaning team will arrive with all supplies and equipment. Please ensure water and electricity are available. You can track via the UC app."

## Site Notes

- Urban Company deep cleaning is India's most trusted home cleaning service — available in 40+ cities.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in. Do NOT ask user for credentials.
- Full home deep cleaning price depends heavily on BHK size — always ask apartment size first.
- UC cleaning teams bring all supplies and equipment (vacuum, mops, chemicals) — user doesn't need anything.
- Deep cleaning takes 4-8 hours depending on home size — user should plan for the full duration.
- Morning slots (8-10 AM start) are most popular and fill up faster — book early for preferred slots.
- UC offers post-construction/renovation cleaning as a separate premium service — ask if relevant.
- Bathroom and kitchen cleaning can be booked individually or as add-ons to full home cleaning.
- Sofa cleaning uses foam/shampoo method — sofa takes 2-3 hours to dry after cleaning.
- Cancellation is free up to a few hours before the slot. After that, cancellation fee applies.
- Peak pricing on weekends and holidays — weekday bookings are usually cheaper and more available.
- Use `confirm_action` for review, `collect_payment` for booking. Always WAIT for user response.
