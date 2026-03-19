---
name: gomechanic-car
description: Book car service or repair on GoMechanic — periodic service, AC repair, denting, battery, tyres.
triggers:
  - gomechanic
  - car service
  - car repair
  - book car service
  - car ac repair
  - car denting
  - car battery replacement
  - car tyre change
  - car wash
  - periodic car service
  - car maintenance
siteUrl: https://www.gomechanic.in
requiresAuth: true
params:
  - name: service_type
    required: true
    hint: What service (e.g. "periodic service", "AC repair", "denting & painting", "battery replacement", "tyre change")
  - name: car_model
    required: true
    hint: Car brand and model (e.g. "Maruti Swift 2020", "Hyundai Creta", "Honda City")
  - name: location
    required: false
    hint: City or area for service center (e.g. "Bangalore", "Gurgaon")
  - name: date
    required: false
    hint: Preferred date (e.g. "today", "tomorrow", "Saturday")
---

# GoMechanic Car Service

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm the exact car service or repair needed. Categories include:
  - **Periodic Service**: basic, standard, comprehensive (oil change, filter, inspection)
  - **AC Repair**: gas refill, AC compressor, condenser, cooling coil
  - **Denting & Painting**: scratch removal, bumper repair, full body paint
  - **Batteries**: replacement with warranty options (Amaron, Exide, etc.)
  - **Tyres**: replacement, alignment, balancing (MRF, Apollo, Bridgestone)
  - **Detailing**: car wash, ceramic coating, PPF, interior cleaning
  - **Custom Repair**: clutch, suspension, engine, brakes, SRS airbag
- If vague, use `ask_user` to narrow down service type.
- Get car brand, model, fuel type (petrol/diesel/CNG), and year if relevant.
- Ask for preferred date and pickup preference (free pickup & drop or self-drive).

### 2. Open GoMechanic in a NEW Tab
- Open a NEW tab and navigate to `https://www.gomechanic.in`.
- Take snapshot. Set city if prompted (Delhi NCR, Bangalore, Mumbai, etc.).
- Verify logged in (profile icon or name visible in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Select Car & Service
- Use the car selector to choose user's car brand, model, and fuel type.
- Navigate to the service category the user requested.
- Take snapshot of available service packages.
- Extract options: package name, services included, price, estimated time.
- Use `ask_user` (input_type "choice") to present packages:
  - "Package Name — Rs.XXX — Includes: [list of services] — Est. X hours"
- If user wants a custom repair, browse the custom repair section.

### 4. Select Workshop & Schedule
- Show available workshops/service centers near user's location.
- Extract: workshop name, rating, distance, estimated delivery time.
- Use `ask_user` (input_type "choice") for workshop selection.
- Select preferred date and time slot from available calendar.
- Choose pickup option: free pickup & drop or self-drive to workshop.
- Take snapshot of booking summary.

### 5. Review & Confirm
- Use `confirm_action` to present booking summary:
  - Car model and fuel type
  - Service package selected with details
  - Workshop name and address
  - Scheduled date and time
  - Pickup type (free pickup & drop / self-drive)
  - Total price with any discount codes applied
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Payment
- Proceed to payment page.
- Use `collect_payment`:
  - summary: JSON with car, service, workshop, date, total
  - amount_inr: total amount
  - description: "GoMechanic car service booking"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Booking Confirmation
- Complete payment. Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: booking ID, car details, service booked, workshop name & address, scheduled date/time, pickup details, amount paid.
- Mention: "Your car will be picked up on the scheduled date. Track status on GoMechanic app."

## Site Notes

- GoMechanic is India's leading car service platform. Available in 30+ cities.
- Chrome Profile 3 (rsinghtomar3011@gmail.com) must be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Car selection is mandatory before browsing services — GoMechanic prices vary by car model.
- Free pickup & drop is available in most cities — always offer this option.
- Periodic service: Basic (oil + filter) < Standard (+ air filter, AC filter) < Comprehensive (full inspection). Clarify with user.
- GoMechanic provides 1000km/1-month warranty on all services.
- Prices shown are all-inclusive (parts + labor + oil). No hidden charges.
- Payment: online (UPI, card, net banking) or partial advance + pay at workshop.
- Scheduling: same-day service available in some cities. Next-day is common.
- Denting/painting: price depends on panels affected — ask user which panels are damaged.
- Use `confirm_action` for booking review, `collect_payment` for payment. WAIT for user response at each step.
