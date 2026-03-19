---
name: bikewale-info
description: Research bikes on BikeWale — compare specifications, prices, mileage, reviews, find dealers, and check on-road price.
triggers:
  - bikewale
  - bike research
  - compare bikes
  - bike specs
  - bike price
  - bike mileage
  - bike review
  - bikewale compare
  - best bike under
  - bike on road price
  - two wheeler compare
  - which bike to buy
siteUrl: https://www.bikewale.com
requiresAuth: false
params:
  - name: bike_name
    required: false
    hint: Bike brand/model to research (e.g. "Royal Enfield Classic 350", "Honda SP 125", "KTM Duke 200")
  - name: budget
    required: false
    hint: Budget range (e.g. "under 1 lakh", "1-2 lakh", "2-5 lakh")
  - name: category
    required: false
    hint: Bike category (e.g. "commuter", "sports", "cruiser", "adventure", "scooter", "electric")
  - name: compare_with
    required: false
    hint: Bikes to compare (e.g. "Classic 350 vs Meteor 350", "Activa vs Jupiter vs Access")
  - name: city
    required: false
    hint: City for on-road price (e.g. "Delhi", "Mumbai", "Bangalore")
---

# BikeWale Bike Research

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Understand what the user wants to know:
  - Specific bike info (specs, price, reviews)?
  - Comparison between 2-3 bikes?
  - Best bikes in a budget range or category?
  - On-road price in a specific city?
  - Upcoming bike launches?
- Use `ask_user` to clarify if the query is vague (e.g. "which bike should I buy?" needs budget, usage, preference).
- Key questions: daily commute or weekend riding? City or highway? Experience level?

### 2. Open BikeWale in a NEW Tab
- Open a NEW tab and navigate to `https://www.bikewale.com`.
- Take snapshot. Set city if on-road price is needed.
- BikeWale does not strictly require login for research.
- If logged in, profile may show saved comparisons and shortlists.
- If login is needed for any feature, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search / Browse Bikes
- **Specific bike:** Search for the bike model. Navigate to its detail page.
- **Budget-based:** Use "Bikes by Budget" section (under 50K, 50K-1L, 1-2L, 2-5L, 5L+).
- **Category-based:** Browse by type: commuter, sports, cruiser, adventure, scooter, electric.
- **Comparison:** Navigate to the compare tool.
- Take snapshot of results/listing page.
- Extract relevant bikes: name, price (ex-showroom), engine CC, mileage, power, type.
- Present top 5-8 options via `ask_user` (input_type "choice"):
  - "[Brand] [Model] — [CC]cc — [Power]bhp — [Mileage]kmpl — ₹X.XX lakh (ex-showroom)"

### 4. Detailed Specifications
- Click on the selected bike. Take snapshot.
- Extract comprehensive specs:
  - Engine: CC, type (single/twin/parallel), cooling (air/liquid), fuel injection
  - Performance: power (bhp), torque (Nm), top speed
  - Mileage: ARAI rated and user-reported
  - Transmission: gears, type
  - Brakes: disc/drum, ABS (single/dual channel)
  - Suspension: front and rear type
  - Dimensions: weight, seat height, fuel tank capacity, ground clearance
  - Features: digital console, LED lights, Bluetooth, navigation, ride modes
  - Colors available
  - Price: ex-showroom (city-wise) and on-road estimate
- Present a clean summary to user.

### 5. Compare Bikes (if requested)
- Navigate to BikeWale compare tool.
- Add 2-3 bikes for head-to-head comparison.
- Take snapshot of comparison table.
- Extract and highlight key differences:
  - Price difference
  - Engine and performance comparison
  - Mileage comparison
  - Features one has that others don't
  - Weight and dimensions
  - Expert verdict / winner in each category
- Present comparison summary via `ask_user`:
  - Winner in performance, mileage, value-for-money, features.

### 6. On-Road Price & Dealer Info
- If user wants on-road price, select their city.
- Extract on-road price breakdown: ex-showroom + RTO + insurance + accessories + handling charges.
- Find nearest dealers with contact info.
- Use `ask_user` to ask if user wants to:
  - "Check EMI options"
  - "Find nearest dealer"
  - "Book a test ride"
  - "See used options for this model"

### 7. Review & Confirm (if booking test ride or dealer visit)
- Use `confirm_action` if user wants to book a test ride or get a dealer callback:
  - Bike: brand, model, variant, color preference
  - City and nearest dealer name/address
  - On-road price estimate
  - Test ride date preference
- Do NOT proceed unless user confirms.

### 8. Payment (if applicable)
- BikeWale is primarily research — no direct purchase.
- If booking a test ride or requesting dealer callback, there is typically no payment.
- If any booking fee is required:
- Use `collect_payment`:
  - summary: JSON with bike details, dealer, city, on-road price
  - amount_inr: booking amount (if any)
  - description: "BikeWale test ride / dealer booking"
- STOP and WAIT for payment confirmation.

### 9. Final Summary
- Take snapshot of the final research summary.
- Report: bike(s) researched, key specs, price (ex-showroom and on-road), comparison winner (if compared), nearest dealer, test ride booking (if done).
- Provide actionable recommendation based on user's needs.
- Mention: "Visit BikeWale for latest reviews, owner opinions, and upcoming launches."

## Site Notes

- BikeWale is India's leading bike research platform — specs, prices, reviews, comparisons for all two-wheelers.
- Chrome Profile 3 (rsinghtomar3011@gmail.com) may be logged in. Do NOT ask user for credentials.
- BikeWale is primarily a research/information site — actual purchase happens at the dealer.
- On-road price varies significantly by city due to RTO charges — always ask for city.
- User reviews and expert reviews are both available — expert reviews include video reviews.
- BikeWale has an EMI calculator — useful for showing monthly payment options.
- Popular comparisons: Classic 350 vs Meteor 350, Activa vs Jupiter, Duke 200 vs NS200, Pulsar vs Apache.
- Electric bikes section: Ather, Ola Electric, TVS iQube, Bajaj Chetak — growing fast.
- Upcoming bikes section shows unreleased models with expected prices and launch dates.
- Used bike prices also available — helpful for resale value estimation.
- Use `confirm_action` for test ride booking. WAIT for user response at each step.
