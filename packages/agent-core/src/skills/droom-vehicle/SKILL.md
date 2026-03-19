---
name: droom-vehicle
description: Buy or sell vehicles on Droom — cars, bikes, scooters. Browse marketplace, compare prices, get ECO inspection, transact.
triggers:
  - droom
  - droom car
  - droom bike
  - buy bike droom
  - buy car droom
  - sell car droom
  - sell bike droom
  - droom scooter
  - droom vehicle
  - used bike online
  - buy second hand bike
  - droom marketplace
siteUrl: https://www.droom.in
requiresAuth: true
params:
  - name: action
    required: true
    hint: Buy or sell (e.g. "buy", "sell")
  - name: vehicle_type
    required: true
    hint: Type of vehicle (e.g. "car", "bike", "scooter", "bicycle")
  - name: brand_model
    required: false
    hint: Brand and model (e.g. "Royal Enfield Classic 350", "Maruti Swift", "Honda Activa")
  - name: budget
    required: false
    hint: Budget range (e.g. "50000-80000", "3-5 lakh")
  - name: city
    required: false
    hint: City (e.g. "Delhi", "Mumbai", "Pune", "Chennai")
---

# Droom Buy/Sell Vehicles

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine: is user buying or selling?
- **For buying:**
  - Vehicle type: car, bike, scooter, or bicycle
  - Budget range
  - Brand/model preference
  - Year range and condition (excellent, good, fair)
  - Fuel type (for cars: petrol/diesel/CNG/electric; for bikes: petrol/electric)
  - City for purchase
- **For selling:**
  - Vehicle type and brand/model/year/variant
  - KMs driven, condition, ownership details
  - Expected price (if any)
  - City where vehicle is located
- Use `ask_user` if key details are missing.

### 2. Open Droom in a NEW Tab
- Open a NEW tab and navigate to `https://www.droom.in`.
- Take snapshot. Set location/city if prompted.
- Verify logged in (profile icon or name visible in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3A. Browse & Filter (Buying)
- Navigate to the correct category: used cars / used bikes / used scooters.
- Apply filters: price range, brand, model, year, fuel type, KMs, city, seller type (dealer/individual).
- Sort by relevance, price, or popularity.
- Take snapshot of listings.
- Extract top 5-8 results: vehicle name, year, KMs, fuel, seller type, price, location, Droom trust score.
- Present via `ask_user` (input_type "choice"):
  - "[Year] [Brand] [Model] — [Fuel] — [KMs]km — ₹X.XX — [Seller type] — [City]"
- For bikes/scooters, also note engine CC and ownership.

### 3B. List Vehicle (Selling)
- Navigate to "Sell" section.
- Enter vehicle details step by step: type, brand, model, year, variant, fuel.
- Enter KMs driven, number of owners, condition description.
- Add registration number and city.
- Upload photos if the flow requires (note: cannot upload from browser automation — ask user to add photos later).
- Use Droom's Orange Book Value (OBV) to get fair market price.
- Take snapshot of valuation and listing preview.

### 4. View Details / Valuation
- **Buying:** Click on selected listing. Extract full details: specs, seller info, photos, Droom ECO inspection report (if available), pricing, history report.
- **Selling:** Review the OBV price estimate. Adjust listing price based on user preference.
- Take snapshot and present findings to user.
- Use `ask_user` to decide next step:
  - Buying: "Contact seller", "Book ECO inspection", "Buy with Droom assurance"
  - Selling: "List at suggested price", "Set custom price", "Get ECO certified first"

### 5. ECO Inspection / Droom Assurance
- If buyer or seller wants ECO inspection (Droom's 121-point vehicle check):
  - Navigate to ECO inspection booking.
  - Select vehicle type, city, date.
  - ECO inspection costs ₹199-999 depending on vehicle.
- For buying with assurance: Droom offers buyer protection with full refund guarantee.
- Take snapshot of inspection/assurance options.

### 6. Review & Confirm Transaction
- Use `confirm_action` to present summary:
  - **Buying:** Vehicle details, seller info, price, ECO score (if available), delivery/pickup method, buyer protection
  - **Selling:** Vehicle details, listing price, OBV value, listing duration, expected reach
  - Transaction charges or listing fees
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 7. Payment
- For buying: proceed to payment page.
- For selling: listing may be free or have a premium listing fee.
- Use `collect_payment`:
  - summary: JSON with vehicle details, transaction type, price, fees
  - amount_inr: purchase price or listing fee
  - description: "Droom vehicle transaction"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 8. Transaction Confirmation
- Complete payment or listing submission. Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- **Buying:** Report order ID, vehicle details, payment amount, delivery/pickup details, seller contact info.
- **Selling:** Report listing ID, listing URL, expected views, tips for faster sale.
- Mention: "Droom provides buyer protection and dispute resolution for marketplace transactions."
- Remind: "For buying — verify documents (RC, insurance, PUC) before taking delivery. For selling — keep documents ready for transfer."

## Site Notes

- Droom is India's largest online automobile marketplace — cars, bikes, scooters, bicycles, and commercial vehicles.
- Chrome Profile 3 (rsinghtomar3011@gmail.com) must be logged in. Do NOT ask user for credentials.
- If session expired, login transparently via OTP. OTP goes to operator phone.
- Droom is a marketplace (like OLX for vehicles) — connects buyers with dealers and individual sellers.
- Orange Book Value (OBV) is Droom's algorithmic fair price tool — use it for price guidance.
- ECO inspection (121-point check) gives trust score — highly recommended before purchase.
- Droom offers full-circle services: loan, insurance, RC transfer, extended warranty.
- Individual sellers list for free; dealers may have subscription plans.
- Buyer protection covers fraud, misrepresentation — but user should still verify physically.
- For bikes: popular brands are Royal Enfield, Honda, TVS, Bajaj, Yamaha, KTM.
- For scooters: Honda Activa, TVS Jupiter, Suzuki Access are most listed.
- Use `confirm_action` for transaction review, `collect_payment` for payment. WAIT for user response at each step.
