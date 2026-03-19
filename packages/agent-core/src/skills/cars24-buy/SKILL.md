---
name: cars24-buy
description: Buy a used car on Cars24 — search, filter, compare, book test drive, apply for financing, purchase.
triggers:
  - cars24 buy
  - buy used car
  - cars24
  - second hand car
  - buy car cars24
  - used car near me
  - pre-owned car
  - certified used car
  - buy old car
  - cars24 car
siteUrl: https://www.cars24.com
requiresAuth: true
params:
  - name: budget
    required: false
    hint: Budget range (e.g. "3-5 lakh", "under 8 lakh", "10 lakh max")
  - name: car_type
    required: false
    hint: Preferred brand/model or body type (e.g. "Maruti Swift", "SUV", "Honda City", "hatchback")
  - name: fuel_type
    required: false
    hint: Fuel preference (e.g. "petrol", "diesel", "CNG", "electric")
  - name: city
    required: false
    hint: City for purchase (e.g. "Delhi", "Mumbai", "Bangalore", "Hyderabad")
  - name: year_range
    required: false
    hint: Preferred year range (e.g. "2018 or newer", "2019-2022")
---

# Cars24 Buy Used Car

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Understand what kind of car the user wants to buy:
  - Budget range (min-max in lakhs)
  - Brand/model preference or body type (hatchback, sedan, SUV, MUV)
  - Fuel type preference (petrol, diesel, CNG, electric)
  - Transmission preference (manual, automatic)
  - Year range (how old is acceptable)
  - City for purchase/delivery
- Use `ask_user` for any missing critical details (at minimum: budget and city).
- Ask if they need car loan/financing.

### 2. Open Cars24 in a NEW Tab
- Open a NEW tab and navigate to `https://www.cars24.com/buy-used-cars/`.
- Take snapshot. Set city if prompted.
- Verify logged in (profile icon or phone number visible in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Filter Cars
- Apply filters based on user preferences:
  - Budget range slider
  - Brand and model
  - Fuel type
  - Body type
  - Year range
  - Transmission type
  - KMs driven range
- Take snapshot of filtered results.
- Extract top 5-8 cars with: name, year, variant, fuel, KMs driven, price, EMI estimate, location.
- Present options via `ask_user` (input_type "choice"):
  - "[Year] [Brand] [Model] [Variant] — [Fuel] — [KMs]km — ₹X.XX lakh — EMI ₹XX,XXX/mo"
- If too few results, suggest relaxing filters.

### 4. View Car Details
- Click on the selected car. Take snapshot.
- Extract detailed information:
  - Full specs: engine, mileage, power, seats
  - Condition report: exterior, interior, engine, electrical (Cars24 inspection score)
  - Ownership history: number of owners, registration date
  - Insurance validity
  - Photos (mention key photos visible)
  - EMI options: down payment, tenure, interest rate
- Present summary to user and ask if they want to:
  - Book a test drive
  - Check EMI options
  - See more cars
  - Proceed to buy

### 5. Book Test Drive
- If user wants a test drive, navigate to test drive booking.
- Select preferred date and time slot.
- Cars24 offers: hub visit or home test drive (select cities).
- Use `ask_user` (input_type "choice") for slot selection.
- Fill in address if home test drive.
- Take snapshot of booking summary.

### 6. Review & Confirm Purchase
- Use `confirm_action` to present purchase summary:
  - Car: year, brand, model, variant, fuel, transmission
  - KMs driven and ownership history
  - Cars24 inspection score / condition report
  - Price (ex-showroom equivalent)
  - Financing: EMI amount, down payment, tenure, interest rate (if applicable)
  - RC transfer and insurance transfer charges
  - Total on-road cost
  - Delivery timeline estimate
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 7. Payment
- Proceed to payment or booking token page.
- Use `collect_payment`:
  - summary: JSON with car details, price, EMI info, delivery timeline
  - amount_inr: booking token or full amount
  - description: "Cars24 used car purchase"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 8. Purchase Confirmation
- Complete payment. Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: booking ID, car details, amount paid, delivery date, RC transfer status.
- Mention: "Cars24 provides 7-day money-back guarantee and 6-month warranty."
- Remind: "Keep Aadhaar, PAN, and address proof ready for RC transfer documentation."

## Site Notes

- Cars24 is India's largest used car marketplace with 200+ quality checkpoints per car.
- Chrome Profile 3 (rsinghtomar3011@gmail.com) must be logged in. Do NOT ask user for credentials.
- If session expired, login transparently via OTP. OTP goes to operator phone.
- Cars24 provides: 7-day money-back guarantee, 6-month warranty, free RC transfer.
- All cars are refurbished — no direct seller contact. Cars24 owns the inventory.
- Financing available: up to 100% on-road funding, 9-14% interest, 1-5 year tenure.
- Booking token is typically ₹2,000-5,000 (refundable). Full payment later.
- Home delivery available in select cities (Delhi NCR, Mumbai, Bangalore, etc.).
- Cars24 handles RC transfer, insurance transfer, and all paperwork.
- Prices are fixed — no negotiation. But check for seasonal offers and exchange bonuses.
- Test drive: hub visit is free. Home test drive may have a small fee in some cities.
- Compare multiple cars before deciding — use the compare feature if available.
- Use `confirm_action` for purchase review, `collect_payment` for payment. WAIT for user response.
