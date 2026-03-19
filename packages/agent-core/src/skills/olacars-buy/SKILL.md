---
name: olacars-buy
description: Buy a used car on Ola Cars — browse certified pre-owned cars, inspect, finance, and buy with doorstep delivery.
triggers:
  - ola cars
  - olacars
  - ola cars buy
  - buy car ola
  - ola used car
  - ola pre-owned car
  - ola cars certified
  - buy second hand car ola
  - ola car finance
  - ola cars delivery
siteUrl: https://www.olacars.com
requiresAuth: true
params:
  - name: budget
    required: false
    hint: Budget range (e.g. "4-6 lakh", "under 10 lakh")
  - name: car_preference
    required: false
    hint: Preferred brand/model or type (e.g. "Hyundai i20", "SUV", "automatic sedan")
  - name: fuel_type
    required: false
    hint: Fuel preference (e.g. "petrol", "diesel", "CNG")
  - name: city
    required: false
    hint: City for purchase/delivery (e.g. "Bangalore", "Delhi", "Mumbai")
  - name: financing
    required: false
    hint: Need financing? (e.g. "yes EMI", "no full payment", "check EMI options")
---

# Ola Cars Buy Used Car

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Understand what the user wants:
  - Budget range (min-max in lakhs)
  - Brand/model preference or body type (hatchback, sedan, SUV)
  - Fuel type (petrol, diesel, CNG)
  - Transmission (manual, automatic)
  - Year preference (e.g. 2018+)
  - City for delivery
- Use `ask_user` if key details are missing (at least budget and city).
- Ask if user needs financing (EMI) or will pay full amount.
- Ask if user wants home test drive or hub visit.

### 2. Open Ola Cars in a NEW Tab
- Open a NEW tab and navigate to `https://www.olacars.com`.
- Take snapshot. Set city/location if prompted.
- Verify logged in (profile icon or name visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Filter
- Apply filters based on user requirements:
  - Price range
  - Brand and model
  - Fuel type
  - Body type
  - Year range
  - Transmission
  - KMs driven
- Take snapshot of search results.
- Extract top 5-8 listings: car name, year, variant, fuel, KMs, price, EMI estimate, location.
- Present via `ask_user` (input_type "choice"):
  - "[Year] [Brand] [Model] — [Fuel] [Transmission] — [KMs]km — ₹X.XX lakh"
- If user wants to see more or different options, adjust filters.

### 4. View Car Details & Inspection Report
- Click selected car listing. Take snapshot.
- Extract:
  - Full specifications (engine, power, mileage, features)
  - Ola Cars inspection report (200+ checkpoints)
  - Exterior and interior condition rating
  - Ownership history and registration details
  - Insurance status and validity
  - Service history (if available)
  - Photos gallery highlights
  - EMI calculator: down payment, tenure options, interest rate
- Present details to user and ask next step:
  - "Book free home test drive"
  - "Check financing options"
  - "See similar cars"
  - "Proceed to buy"

### 5. Book Test Drive
- If user wants test drive, schedule one.
- Select: home test drive (doorstep) or hub visit.
- Choose date and preferred time slot from available options.
- Use `ask_user` (input_type "choice") for slot selection.
- Fill in address for home test drive.
- Take snapshot of test drive booking confirmation.

### 6. Review & Confirm Purchase
- Use `confirm_action` to present full purchase summary:
  - Car: year, brand, model, variant, fuel, transmission
  - KMs driven, number of owners
  - Ola Cars inspection score
  - Car price
  - Financing details: EMI, down payment, tenure, rate (if applicable)
  - RC transfer charges
  - Insurance transfer
  - Total cost breakdown
  - Delivery type and estimated date
  - Warranty and return policy
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 7. Payment
- Navigate to payment / booking deposit page.
- Use `collect_payment`:
  - summary: JSON with car details, total cost, financing info, delivery date
  - amount_inr: booking deposit or full amount
  - description: "Ola Cars used car purchase"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 8. Purchase Confirmation
- Complete payment. Handle OTP via `ask_user` if needed.
- Take snapshot of purchase confirmation page.
- Report: booking/order ID, car details, amount paid, expected delivery date, warranty details.
- Mention: "Ola Cars provides doorstep delivery, free RC transfer, and warranty coverage."
- Remind: "Keep Aadhaar, PAN card, and address proof ready for documentation."

## Site Notes

- Ola Cars is a certified pre-owned car platform by Ola, available in major Indian cities.
- Chrome Profile 3 (rsinghtomar3011@gmail.com) must be logged in. Do NOT ask user for credentials.
- If session expired, login transparently via OTP. OTP goes to operator phone.
- All cars undergo 200+ point inspection before listing — Ola Cars certifies quality.
- Free home test drive available in supported cities — always offer this option.
- Financing: tie-ups with multiple banks, up to 100% funding, competitive interest rates.
- Booking deposit is typically refundable if user changes mind within the return window.
- Ola Cars handles all paperwork: RC transfer, insurance, hypothecation removal.
- 5-day return policy and warranty on engine and transmission (check city availability).
- Doorstep delivery available — car delivered to user's home with all documents.
- No hidden charges — price shown is all-inclusive except RTO and insurance transfer.
- Use `confirm_action` for purchase review, `collect_payment` for payment. WAIT for user response.
