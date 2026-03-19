---
name: cars24-sell
description: Sell your used car on Cars24 — enter car details, get instant valuation, schedule free inspection at home.
triggers:
  - cars24 sell
  - sell car
  - sell my car
  - cars24 valuation
  - car valuation
  - sell used car
  - car resale value
  - sell old car
  - cars24 inspection
  - sell car online
siteUrl: https://www.cars24.com
requiresAuth: true
params:
  - name: car_brand
    required: true
    hint: Car brand (e.g. "Maruti", "Hyundai", "Honda", "Tata")
  - name: car_model
    required: true
    hint: Car model (e.g. "Swift", "Creta", "City", "Nexon")
  - name: year
    required: true
    hint: Manufacturing year (e.g. "2019", "2021")
  - name: variant
    required: false
    hint: Variant and fuel type (e.g. "VXI Petrol", "SX Diesel", "ZX AT")
  - name: kms_driven
    required: false
    hint: Approximate kilometers driven (e.g. "35000", "60000")
  - name: city
    required: false
    hint: City for inspection (e.g. "Delhi", "Mumbai", "Bangalore")
---

# Cars24 Sell Car

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm the car details: brand, model, manufacturing year, variant (fuel type + trim).
- Ask for approximate kilometers driven and the city where the car is located.
- Get current ownership details: first owner, second owner, etc.
- Ask about any major accidents, insurance status, and number of owners.
- If user is unsure about variant, use `ask_user` to narrow down (e.g. "Is it petrol or diesel? Manual or automatic?").
- Get preferred inspection date and time slot if user has a preference.

### 2. Open Cars24 in a NEW Tab
- Open a NEW tab and navigate to `https://www.cars24.com/sell-car/`.
- Take snapshot. Verify the page loaded correctly.
- Verify logged in (profile icon or phone number visible in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Enter Car Details
- Use the car selector to choose brand, model, year, and variant step by step.
- Cars24 uses a guided flow — follow each step:
  1. Select brand (e.g. Maruti Suzuki)
  2. Select model (e.g. Swift)
  3. Select year (e.g. 2019)
  4. Select variant (e.g. VXI 1.2 Petrol)
- Enter kilometers driven.
- Enter RTO/registration city.
- Select ownership: 1st owner, 2nd owner, etc.
- Take snapshot after entering all details.

### 4. Get Valuation
- Submit the car details to get instant price estimate.
- Take snapshot of the valuation result.
- Extract: estimated price range (min-max), factors affecting price.
- Present to user via `ask_user`:
  - "Your [Year] [Brand] [Model] [Variant] with [KMs] km is valued at ₹X.XX - ₹X.XX lakh on Cars24."
  - "Would you like to schedule a free inspection for a final offer?"
- If user wants to adjust details (different variant, corrected KMs), go back and re-enter.

### 5. Schedule Inspection
- If user agrees to proceed, navigate to inspection scheduling.
- Select city and area for inspection.
- Cars24 offers free home inspection — select preferred date and time slot.
- Extract available slots and present via `ask_user` (input_type "choice"):
  - "Date — Time Slot — Location type (Home/Hub)"
- Fill in contact details (name, phone, address for home inspection).
- Take snapshot of the scheduling summary.

### 6. Review & Confirm Inspection
- Use `confirm_action` to present inspection booking summary:
  - Car: brand, model, year, variant, KMs driven
  - Estimated valuation range
  - Inspection type: home or hub visit
  - Scheduled date and time
  - Address for inspection
  - Contact number
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 7. Payment (Service Fee)
- Cars24 inspection is typically free, but if any booking deposit or service fee is required:
- Use `collect_payment`:
  - summary: JSON with car details, inspection date, location, valuation range
  - amount_inr: deposit/fee amount (often ₹0 for inspection)
  - description: "Cars24 car sell inspection booking"
- STOP and WAIT for payment confirmation. If no fee, skip this step.

### 8. Booking Confirmation
- Submit the inspection booking.
- Take snapshot of confirmation page.
- Report: booking ID, car details, estimated valuation, inspection date/time, inspection address, contact number.
- Mention: "A Cars24 expert will visit for inspection. Final offer is given after physical inspection."
- Remind: "Keep RC, insurance copy, and car keys ready for inspection day."

## Site Notes

- Cars24 is India's largest used car platform. Available in 200+ cities for selling.
- Chrome Profile 3 (rsinghtomar3011@gmail.com) must be logged in. Do NOT ask user for credentials.
- If session expired, login transparently via OTP. OTP goes to operator phone.
- Cars24 sell flow: Enter details → Get instant estimate → Schedule inspection → Get final offer → Get paid.
- Inspection is FREE at home. Cars24 sends an evaluator with an OBD scanner.
- Final price may differ from online estimate based on physical condition, scratches, dents, tyre health.
- Payment to seller happens within 24-48 hours after accepting the final offer.
- RC transfer is handled by Cars24 — they manage all paperwork.
- Cars24 deducts a commission (typically 2-4%) from the sale price.
- User needs: RC copy, insurance copy, PAN card, address proof, car keys, and any spare keys.
- If the car has a loan, Cars24 handles foreclosure — ask user about loan status upfront.
- Use `confirm_action` for inspection review. WAIT for user response at each step.
