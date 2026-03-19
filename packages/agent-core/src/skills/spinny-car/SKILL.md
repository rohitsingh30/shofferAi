---
name: spinny-car
description: Buy a certified used car on Spinny — browse 200+ point inspected cars, free test drive, 5-day return, buy with confidence.
triggers:
  - spinny
  - spinny car
  - buy car spinny
  - spinny used car
  - certified used car
  - spinny test drive
  - spinny buy
  - pre-owned car spinny
  - spinny car price
  - spinny assured
siteUrl: https://www.spinny.com
requiresAuth: true
params:
  - name: budget
    required: false
    hint: Budget range (e.g. "3-6 lakh", "under 12 lakh")
  - name: car_preference
    required: false
    hint: Brand/model or type (e.g. "Maruti Baleno", "compact SUV", "automatic hatchback")
  - name: fuel_type
    required: false
    hint: Fuel preference (e.g. "petrol", "diesel", "CNG")
  - name: city
    required: false
    hint: City (e.g. "Delhi NCR", "Bangalore", "Hyderabad", "Mumbai")
  - name: year_range
    required: false
    hint: Preferred year range (e.g. "2019+", "2017-2021")
---

# Spinny Buy Certified Used Car

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Understand user's car buying needs:
  - Budget (min-max range in lakhs)
  - Preferred brand, model, or body type (hatchback, sedan, SUV, MUV)
  - Fuel type (petrol, diesel, CNG, electric)
  - Transmission (manual, automatic, AMT, CVT, DCT)
  - Year range preference
  - City for test drive and delivery
- Use `ask_user` to fill gaps — at minimum get budget and city.
- Ask about financing needs (full payment vs EMI).
- Ask about any must-have features (sunroof, alloy wheels, rear camera, etc.).

### 2. Open Spinny in a NEW Tab
- Open a NEW tab and navigate to `https://www.spinny.com`.
- Take snapshot. Set city if prompted (Spinny operates in Delhi NCR, Bangalore, Hyderabad, Mumbai, Pune).
- Verify logged in (profile icon or name in top-right).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Apply Filters
- Navigate to the buy section and apply filters:
  - Budget slider
  - Brand and model
  - Body type
  - Fuel type
  - Transmission
  - Year range
  - KMs driven
  - Number of owners
- Sort by: relevance, price low-high, price high-low, KMs driven, year.
- Take snapshot of filtered results.
- Extract top 5-8 cars: name, year, variant, fuel, transmission, KMs, owners, price, Spinny assured badge.
- Present via `ask_user` (input_type "choice"):
  - "[Year] [Brand] [Model] [Variant] — [Fuel] [Trans] — [KMs]km — [Owners] owner — ₹X.XX lakh — Spinny Assured ✓"

### 4. View Car Details
- Click selected car. Take snapshot.
- Extract comprehensive details:
  - Full specifications: engine cc, power, torque, mileage
  - Spinny 200-point inspection report score
  - Exterior rating, interior rating, mechanical rating, electrical rating
  - Registration date, insurance validity, ownership count
  - Service history highlights
  - Key features list (touchscreen, parking sensors, airbags, ABS, etc.)
  - Photo gallery — note any visible wear
  - Price breakdown: car price + documentation charges
  - EMI estimate: monthly EMI, down payment, tenure
- Use `ask_user` to let user decide:
  - "Book free test drive"
  - "Check EMI options in detail"
  - "Compare with another car"
  - "Proceed to buy this car"

### 5. Book Free Test Drive
- If user wants test drive, navigate to booking.
- Spinny offers: Spinny Hub visit or doorstep test drive.
- Select date and time slot from available options.
- Use `ask_user` (input_type "choice") for slot and location type.
- For doorstep: fill in home address.
- Take snapshot of test drive confirmation.

### 6. Review & Confirm Purchase
- Use `confirm_action` to present full summary:
  - Car: year, brand, model, variant, fuel, transmission, color
  - KMs driven, owners, registration state
  - Spinny inspection score
  - Car price
  - Documentation and transfer charges
  - Financing: EMI, down payment, tenure, interest rate (if applicable)
  - Total amount payable
  - Delivery timeline
  - Spinny promises: 5-day no-questions return, 1-year warranty, free RC transfer
- Do NOT proceed unless user confirms.

### 7. Payment
- Navigate to payment page.
- Use `collect_payment`:
  - summary: JSON with car, price, total, financing, delivery date
  - amount_inr: booking token or full amount
  - description: "Spinny certified used car purchase"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 8. Purchase Confirmation
- Complete payment. Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, car details, amount paid, delivery date, warranty coverage details.
- Mention: "Spinny provides 5-day money-back guarantee, 1-year warranty, and free RC transfer."
- Remind: "Keep Aadhaar, PAN, cancelled cheque, and address proof ready for documentation."

## Site Notes

- Spinny is a trusted certified used car platform operating in Delhi NCR, Bangalore, Hyderabad, Mumbai, Pune.
- Chrome Profile 3 (rsinghtomar3011@gmail.com) must be logged in. Do NOT ask user for credentials.
- If session expired, login transparently via OTP. OTP goes to operator phone.
- Every Spinny car undergoes 200-point inspection — results visible on listing page.
- Spinny Assured: fixed price, no hidden charges, 5-day return, 1-year warranty.
- Free doorstep test drive available in all operating cities — always suggest this.
- Financing: partnerships with major banks, EMI starting ~₹4,999/month for budget cars.
- Booking token is small (₹5,000-10,000) and refundable within return window.
- Spinny handles complete paperwork: RC transfer, insurance, loan closure (if previous loan exists).
- No negotiation on price — Spinny uses algorithm-based fair pricing.
- Use `confirm_action` for purchase review, `collect_payment` for payment. WAIT for user response at each step.
