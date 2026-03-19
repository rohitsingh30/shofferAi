---
name: carwale-info
description: Research cars on CarWale — compare specifications, prices, reviews, calculate EMI, find dealers, check on-road price.
triggers:
  - carwale
  - car research
  - compare cars
  - car specs
  - car price check
  - car review
  - carwale compare
  - best car under
  - car on road price
  - car EMI calculator
  - which car to buy
  - new car research
siteUrl: https://www.carwale.com
requiresAuth: false
params:
  - name: car_name
    required: false
    hint: Car brand/model (e.g. "Maruti Swift", "Hyundai Creta", "Tata Nexon", "MG Hector")
  - name: budget
    required: false
    hint: Budget range (e.g. "under 8 lakh", "10-15 lakh", "20-30 lakh")
  - name: category
    required: false
    hint: Car type (e.g. "hatchback", "sedan", "SUV", "MUV", "luxury", "electric")
  - name: compare_with
    required: false
    hint: Cars to compare (e.g. "Creta vs Seltos vs Nexon", "Swift vs Baleno vs i20")
  - name: city
    required: false
    hint: City for on-road price (e.g. "Delhi", "Mumbai", "Bangalore", "Chennai")
---

# CarWale Car Research

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Understand what the user wants:
  - Research a specific car (specs, price, reviews)?
  - Compare 2-3 cars head to head?
  - Find best cars in a budget range or segment?
  - On-road price in a specific city?
  - EMI calculation for a particular car?
  - Expert or user reviews?
- Use `ask_user` if query is vague: "What matters most — comfort, mileage, performance, safety, or space?"
- Get city for on-road pricing if relevant.

### 2. Open CarWale in a NEW Tab
- Open a NEW tab and navigate to `https://www.carwale.com`.
- Take snapshot. Set city if on-road price is needed.
- CarWale does not strictly require login for research.
- If logged in, user may have saved comparisons and shortlists.
- If login is needed, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search / Browse Cars
- **Specific car:** Search for the model. Navigate to its detail page.
- **Budget-based:** Use "Cars by Budget" (under 5L, 5-10L, 10-15L, 15-20L, 20-30L, 30L+).
- **Segment-based:** Browse by type: hatchback, sedan, SUV, MUV, luxury, electric.
- **Comparison:** Navigate to compare tool.
- Take snapshot of results.
- Extract relevant cars: name, price range (ex-showroom), engine options, mileage, key features.
- Present top 5-8 via `ask_user` (input_type "choice"):
  - "[Brand] [Model] — ₹X.XX - ₹X.XX lakh — [Engine options] — [Mileage]kmpl — [Segment]"

### 4. Detailed Specifications & Variants
- Click selected car. Take snapshot.
- Extract full specs:
  - Variants: list all with price, engine, transmission
  - Engine: CC, type (turbo/NA), fuel (petrol/diesel/CNG/electric)
  - Performance: power (bhp), torque (Nm)
  - Mileage: ARAI certified and real-world estimates
  - Transmission: manual, AMT, CVT, DCT, AT — number of gears
  - Safety: NCAP rating, airbags count, ABS, ESC, TPMS, ISOFIX, hill assist
  - Features: touchscreen size, Apple CarPlay/Android Auto, sunroof, ventilated seats, ADAS, 360 camera
  - Dimensions: length, width, height, wheelbase, boot space, ground clearance
  - Colors available with photos
- Present variant comparison if multiple variants exist.
- Use `ask_user` for variant selection if user wants specific pricing.

### 5. Compare Cars (if requested)
- Navigate to CarWale compare tool.
- Add 2-3 cars for comparison.
- Take snapshot of comparison table.
- Highlight key differences:
  - Price difference
  - Engine and performance
  - Mileage (city/highway)
  - Safety rating and features
  - Space (boot, legroom)
  - Feature advantages per car
  - Maintenance cost estimates
- Present comparison via `ask_user`:
  - Winner by category: performance, mileage, safety, features, value-for-money.

### 6. EMI Calculator & On-Road Price
- Navigate to EMI calculator for selected car variant.
- Calculate EMI with different parameters:
  - Loan amount (ex-showroom minus down payment)
  - Interest rate (typical 8-12%)
  - Tenure (1-7 years)
- Extract on-road price for user's city: ex-showroom + road tax + insurance + TCS + handling.
- Present: "On-road price in [City]: ₹XX.XX lakh | EMI: ₹XX,XXX/mo (at X% for X years with ₹X lakh down payment)"
- Use `ask_user` to ask next steps: "Book test drive?", "Find dealer?", "Check used car prices?"

### 7. Review & Confirm (if booking test drive)
- Use `confirm_action` if user wants test ride or dealer callback:
  - Car: brand, model, variant, fuel type, transmission
  - City and nearest dealer name
  - On-road price estimate
  - EMI estimate
  - Test drive date preference
- Do NOT proceed unless user confirms.

### 8. Payment (if applicable)
- CarWale is primarily research — no direct purchase on the platform.
- If any booking fee or deposit is collected for test drive:
- Use `collect_payment`:
  - summary: JSON with car details, dealer, city, on-road price, EMI
  - amount_inr: booking amount (if any)
  - description: "CarWale car booking / test drive"
- STOP and WAIT for payment confirmation.

### 9. Final Summary
- Take snapshot of research summary.
- Report: car(s) researched, recommended variant, on-road price, EMI, comparison results, dealer info.
- Provide clear recommendation based on user priorities.
- Mention: "Visit CarWale for latest news, upcoming launches, and detailed video reviews."

## Site Notes

- CarWale is India's leading car research platform — owned by CarTrade Tech (same group as CarTrade, Shriram Automall).
- Chrome Profile 3 (rsinghtomar3011@gmail.com) may be logged in. Do NOT ask user for credentials.
- CarWale is a research/comparison platform — actual purchase happens at the authorized dealer.
- On-road price varies by city due to road tax (1-20% depending on state) — always ask for city.
- CarWale has both expert reviews (detailed, video) and user reviews (ratings and opinions).
- EMI calculator is very accurate — includes processing fees and insurance in some calculations.
- Variant comparison is critical: same model can range from ₹6L to ₹12L depending on variant.
- Safety ratings (Global NCAP / Bharat NCAP) are important — highlight if available.
- Used car section on CarWale shows resale value trends — useful for long-term value.
- Upcoming cars section shows expected launches with estimated pricing.
- CarWale may redirect to OEM sites for booking — handle gracefully.
- Use `confirm_action` for test drive booking. WAIT for user response at each step.
