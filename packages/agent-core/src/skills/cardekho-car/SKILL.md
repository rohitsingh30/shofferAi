---
name: cardekho-car
description: Research and buy new or used cars on CarDekho — compare specs, check prices, calculate EMI, find dealers, book test drive.
triggers:
  - cardekho
  - car dekho
  - cardekho car
  - cardekho price
  - new car price
  - used car cardekho
  - cardekho compare
  - cardekho EMI
  - best car to buy
  - car dekho review
  - cardekho on road price
  - cardekho used car
siteUrl: https://www.cardekho.com
requiresAuth: true
params:
  - name: car_name
    required: false
    hint: Car brand/model (e.g. "Tata Nexon", "Hyundai Creta", "Maruti Brezza", "Kia Seltos")
  - name: budget
    required: false
    hint: Budget range (e.g. "under 10 lakh", "8-12 lakh", "15-25 lakh")
  - name: new_or_used
    required: false
    hint: New car or used car (e.g. "new", "used", "both")
  - name: category
    required: false
    hint: Car segment (e.g. "hatchback", "SUV", "sedan", "electric", "luxury")
  - name: city
    required: false
    hint: City for pricing (e.g. "Delhi", "Mumbai", "Bangalore", "Jaipur")
---

# CarDekho Car Research & Purchase

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Understand what the user needs:
  - Research or buy? New or used car?
  - Specific car model or open to suggestions?
  - Budget range (important for both new and used)
  - Segment preference: hatchback, sedan, compact SUV, mid-size SUV, MUV, electric
  - Fuel type: petrol, diesel, CNG, hybrid, electric
  - Transmission: manual, automatic (AT/AMT/CVT/DCT)
  - Key priorities: mileage, safety, features, space, brand
  - City for on-road pricing and dealers
- Use `ask_user` to fill gaps. Minimum needed: budget or car name, and city.

### 2. Open CarDekho in a NEW Tab
- Open a NEW tab and navigate to `https://www.cardekho.com`.
- Take snapshot. Set city if prompted.
- Verify logged in (profile icon or user name visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse
- **New cars:** Navigate to new cars section, apply filters (budget, segment, fuel, brand).
- **Used cars:** Navigate to used cars section, apply filters (budget, year, KMs, owners, certified).
- **Specific car:** Search by name, go to model page.
- Take snapshot of results.
- Extract top 5-8 options:
  - New: name, price range, engine options, mileage, key features, rating
  - Used: name, year, variant, KMs, owners, price, seller type, CarDekho certified badge
- Present via `ask_user` (input_type "choice"):
  - New: "[Brand] [Model] — ₹X.XX - ₹X.XX lakh — [Engine] — [Mileage]kmpl — Rating X.X/5"
  - Used: "[Year] [Brand] [Model] [Variant] — [KMs]km — ₹X.XX lakh — [Certified/Non-certified]"

### 4. Detailed Information
- Click selected car. Take snapshot.
- **For new cars:** Extract:
  - All variants with prices
  - Engine specs: CC, power, torque, fuel type
  - Mileage: ARAI and real-world
  - Transmission options
  - Safety: NCAP rating, airbags, ABS, ESC, ADAS
  - Features: infotainment, connectivity, comfort, convenience
  - Dimensions, boot space, ground clearance
  - Colors with images
  - Pros and cons from expert review
  - User ratings breakdown
- **For used cars:** Extract:
  - Full specs and condition report
  - Inspection score (if CarDekho certified)
  - Ownership and service history
  - Insurance status
  - Photos
  - Price vs market value assessment
- Present comprehensive summary to user.

### 5. Compare Cars / EMI Calculator
- **Compare:** Use CarDekho compare tool for 2-3 cars.
  - Take snapshot of comparison table.
  - Highlight winners in: price, performance, mileage, safety, features, space.
- **EMI Calculator:**
  - Select variant and city.
  - Input: down payment, loan tenure (1-7 years), interest rate.
  - Extract: monthly EMI, total interest, total payable, on-road price breakdown.
  - Present: "₹XX,XXX/month for X years | Down payment ₹X lakh | On-road ₹XX.XX lakh in [City]"
- Use `ask_user` for next step: "Book test drive", "Find dealer", "See offers", "Proceed to buy (used)".

### 6. Book Test Drive / Connect with Dealer
- For new cars: book test drive or get dealer callback.
- For used cars: schedule viewing or initiate purchase.
- Fill in name, phone, preferred date.
- Select nearest dealer/hub from list.
- Take snapshot of booking confirmation.

### 7. Review & Confirm
- Use `confirm_action` to present summary:
  - Car details: brand, model, variant, fuel, transmission
  - Price: ex-showroom (new) or listing price (used)
  - On-road price in city (new) or total cost (used)
  - EMI details if financing
  - Dealer/seller info and location
  - Test drive / viewing date
  - For used: CarDekho warranty and return policy
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 8. Payment (for used car purchase or booking)
- For used cars on CarDekho: proceed to payment for booking token.
- For new cars: dealer handles payment (CarDekho only facilitates lead).
- Use `collect_payment`:
  - summary: JSON with car details, price, EMI, dealer/seller, city
  - amount_inr: booking token or purchase amount
  - description: "CarDekho car booking"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 9. Confirmation
- Complete booking. Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: booking ID, car details, amount paid (if any), test drive/delivery date, dealer/seller contact.
- For new cars: "Dealer will contact you to finalize. Negotiate on accessories and insurance at dealer."
- For used cars: "Verify documents before completing purchase. CarDekho certified cars come with warranty."
- Remind: "Keep budget for RTO, insurance, and accessories (new) or RC transfer (used)."

## Site Notes

- CarDekho is India's largest auto portal — 9Cr+ monthly visitors, new and used cars, reviews, videos.
- Chrome Profile 3 (rsinghtomar3011@gmail.com) must be logged in. Do NOT ask user for credentials.
- If session expired, login transparently via OTP. OTP goes to operator phone.
- CarDekho has both new car research and used car marketplace (CarDekho certified + dealer + individual).
- CarDekho certified used cars have 200+ point inspection, warranty, and return policy.
- On-road price = ex-showroom + RTO + insurance + TCS (1% above ₹10L) + accessories.
- CarDekho may generate leads to dealers who will call — inform user about expected callbacks.
- User reviews are rated on: mileage, comfort, performance, maintenance, safety, features.
- CarDekho gaadi store: physical retail for used cars in select cities.
- EMI calculator accounts for processing fee (1-2%) — very accurate estimates.
- Popular research queries: "best SUV under 15 lakh", "best mileage car", "safest car in India".
- Use `confirm_action` for booking review, `collect_payment` for payment. WAIT for user response at each step.
