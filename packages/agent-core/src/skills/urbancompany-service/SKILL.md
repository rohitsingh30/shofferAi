---
name: urbancompany-service
description: Book home services on Urban Company — salon, cleaning, repairs, AC service, plumbing.
triggers:
  - urban company
  - urbanclap
  - book salon
  - salon at home
  - home cleaning
  - ac service
  - ac repair
  - book plumber
  - book electrician
  - home service
  - spa at home
  - book cleaning
siteUrl: https://www.urbancompany.com
requiresAuth: true
params:
  - name: service
    required: true
    hint: What service (e.g. "salon at home", "AC service", "deep cleaning", "plumber")
  - name: date
    required: false
    hint: Preferred date (e.g. "today", "tomorrow", "Saturday")
  - name: time
    required: false
    hint: Preferred time slot (e.g. "morning", "2 PM", "evening")
---

# Urban Company Home Services

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Clarify Service
- Determine exact service needed. Common categories:
  - **Salon**: haircut, facial, waxing, manicure, pedicure, bridal makeup
  - **Spa**: massage, body polishing, head massage
  - **Cleaning**: deep cleaning, bathroom cleaning, kitchen cleaning, sofa cleaning
  - **Repairs**: AC service/repair, electrician, plumber, carpenter
  - **Appliance**: washing machine repair, refrigerator repair, geyser repair
  - **Pest Control**: cockroach, termite, bed bugs
- If vague, use `ask_user` to narrow down.
- Get preferred date and time.

### 2. Open Urban Company
- Open a NEW tab and navigate to `https://www.urbancompany.com`.
- Take snapshot. Set location if prompted (user's city/area).
- Verify logged in (profile visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Select Service
- Use search bar or browse categories to find the service.
- Take snapshot of service page.
- Browse packages/options available:
  - Salon: different packages (basic, premium, luxury)
  - Cleaning: by room count or area size
  - Repairs: by appliance type/issue
- Extract options with: package name, services included, price, duration, rating.
- Use `ask_user` (input_type "choice"): "Package Name — ₹XXX — XX min — Includes: [services]"

### 4. Customize & Add to Cart
- Select package. Add any extras if user wants.
- If multiple services needed, add each to cart.
- Take snapshot of cart.
- Use `confirm_action`:
  - Service(s) selected with details
  - Price for each, total
  - Estimated duration
  - Any included products/materials
- Do NOT proceed unless user confirms.

### 5. Select Date & Time
- Choose preferred date from calendar.
- Choose time slot (morning 8-12, afternoon 12-4, evening 4-8).
- If preferred slot unavailable, show alternatives.
- Confirm slot with user.

### 6. Payment & Book
- Fill address if not already set.
- Use `collect_payment`:
  - summary: JSON with services, date, time, total
  - amount_inr: total
  - description: "Urban Company service"
- WAIT for payment confirmation.

### 7. Confirm Booking
- Complete payment. Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation.
- Report: booking ID, service(s), professional assigned (if shown), date, time slot, address, amount.
- Mention: "Professional will arrive at your doorstep. You can track via UC app."

## Site Notes

- Urban Company is India's #1 home services platform. Available in 40+ cities.
- Salon services: most popular category. Women's services > Men's.
- Prices are transparent — no haggling. Tips optional.
- UC Safe: all professionals are background-verified.
- Ratings: 4.5+ is excellent. Below 4.0 is rare — UC maintains quality.
- Cancellation: free up to a few hours before. After that, cancellation fee applies.
- Products/materials included in salon services (they bring their own kit).
- AC service: regular (gas check, cleaning) vs deep cleaning vs repair — clarify.
- Deep cleaning: price depends on BHK (1BHK/2BHK/3BHK) — ask apartment size.
- Payment: online only (UPI/card). No COD.
- Peak pricing may apply on weekends/holidays — inform user.
- UC Plus membership: extra discounts, priority booking.
- Use `confirm_action` for review, `collect_payment` for booking. WAIT for user response.
