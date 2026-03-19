---
name: nobroker-rental
description: Search rental apartments on NoBroker — filter by BHK, budget, locality, shortlist properties, contact owners directly.
triggers:
  - nobroker
  - rental apartment
  - rent flat
  - nobroker rental
  - apartment for rent
  - house for rent
  - flat on nobroker
  - rent house nobroker
  - find rental
siteUrl: https://www.nobroker.in
requiresAuth: true
params:
  - name: city
    required: true
    hint: City to search in (e.g. "Bangalore", "Mumbai", "Pune", "Chennai", "Hyderabad", "Delhi")
  - name: locality
    required: true
    hint: Preferred locality or area (e.g. "Koramangala", "Bandra", "Whitefield")
  - name: bhk
    required: false
    hint: BHK type — "1 BHK", "2 BHK", "3 BHK", "4 BHK"
  - name: budget_max
    required: false
    hint: Maximum monthly rent budget (e.g. "25000", "40000")
  - name: furnishing
    required: false
    hint: Furnishing preference — "furnished", "semi-furnished", "unfurnished"
---

# NoBroker Rental Search

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Search Requirements
- Confirm city, locality/area, BHK type, and budget range.
- If missing, use `ask_user` (input_type "freetext"): "Which city and locality are you looking to rent in? What's your budget and BHK preference?"
- Ask for additional preferences: furnishing, parking, pet-friendly, bachelor-friendly, family-only.
- Ask preferred move-in date.
- Note: NoBroker operates in Bangalore, Mumbai, Pune, Chennai, Hyderabad, Delhi NCR only.

### 2. Open NoBroker & Verify Login
- Open a NEW tab and navigate to `https://www.nobroker.in`.
- Take snapshot. Dismiss any popups, app download prompts, or cookie banners.
- Verify logged in (profile icon or name visible in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Select the correct city if a city selector appears.

### 3. Set Search Filters
- Navigate to the rent section: click "Rent" tab or go to nobroker.in/property/rent/.
- Enter locality in the search bar — select from autocomplete suggestions.
- Apply filters:
  - BHK: 1 BHK / 2 BHK / 3 BHK / 4+ BHK
  - Budget: set min-max range
  - Furnishing: Furnished / Semi-Furnished / Unfurnished
  - Available from: immediate / within 15 days / within 30 days
  - Additional: parking, non-veg allowed, gated community, pet-friendly
- Click "Search" or apply filters.
- Take snapshot of search results.

### 4. Browse & Shortlist Properties
- Extract top 5-8 properties from results:
  - Property name / society name
  - BHK type and area (sq ft)
  - Monthly rent and deposit
  - Furnishing status
  - Floor number and total floors
  - Age of property
  - Available from date
  - Key amenities (parking, gym, pool, security)
  - Photo count
- Present via `ask_user` (input_type "choice"):
  "1) 2BHK in Prestige Shantiniketan, Whitefield — ₹28,000/mo — Semi-Furnished — 1100 sqft"
  "2) 2BHK in Brigade Gateway, Rajajinagar — ₹32,000/mo — Furnished — 1250 sqft"
  "3) 2BHK in Sobha Dream Acres, Balagere — ₹22,000/mo — Unfurnished — 950 sqft"
  "View More Properties"
- Allow user to select one or more for detailed view.

### 5. View Property Details
- Click on the selected property to open its detail page.
- Take snapshot of the property page.
- Extract detailed information:
  - Full address and landmark
  - Owner name (NoBroker shows verified owner details)
  - Rent, deposit, maintenance charges
  - Detailed amenities list
  - House rules (bachelor, pets, non-veg, water/power backup)
  - Photos (count and quality)
  - Nearby facilities (metro, school, hospital, market)
- Present full details via `ask_user`.
- Ask: "Would you like to contact this owner, shortlist it, or view more properties?"

### 6. Contact Owner
- If user wants to contact, click "Get Owner Details" or "Contact Owner".
- NoBroker may require a plan/payment for owner contact details.
- Use `confirm_action`:
  - Property: name, BHK, locality
  - Monthly rent and deposit
  - Owner contact action
  - NoBroker plan required (if any): Free (limited contacts) / MoneyBack / Relax / Premium
  - Plan cost (if applicable)
- Do NOT proceed unless user confirms.

### 7. Payment for Plan (if required)
- If NoBroker requires a paid plan for owner contact:
- Use `collect_payment`:
  - summary: JSON with property, plan_name, plan_features, plan_cost
  - amount_inr: plan cost
  - description: "NoBroker rental plan"
- WAIT for payment confirmation.
- If user opts for free tier, proceed with limited contacts.

### 8. Final Confirmation with Snapshot
- Take snapshot of owner contact details or shortlisted properties.
- Report:
  - Properties shortlisted (list with key details)
  - Owner contact details shared (if plan purchased)
  - Next steps: schedule visits, negotiate rent, verify documents
- Mention: "Always visit the property in person before finalizing. Check society rules, water supply, and power backup. Insist on a registered rental agreement."

## Site Notes

- NoBroker is India's largest no-brokerage rental platform — connects tenants directly with owners.
- Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- NoBroker operates in: Bangalore, Mumbai, Pune, Chennai, Hyderabad, Delhi NCR. Other cities not supported.
- Free plan gives limited owner contacts (2-3). Paid plans (₹999-₹4,999) give unlimited contacts + services.
- NoBroker frequently shows app download popups — dismiss them immediately.
- Property listings may be outdated — always confirm availability before visiting.
- Deposit in Bangalore is typically 10 months rent. Mumbai: 2-3 months. Other cities: 2-6 months.
- NoBroker also offers packers & movers, painting, cleaning — mention if user is relocating.
- Always verify owner identity and property documents before paying any deposit.
- Use `confirm_action` for review, `collect_payment` for payment. WAIT for user response.
