---
name: commonfloor-rental
description: Search rental properties on CommonFloor — PG, flats, houses with locality-based search and filters.
triggers:
  - commonfloor
  - commonfloor rental
  - commonfloor flat
  - rent on commonfloor
  - commonfloor pg
  - commonfloor house
  - commonfloor apartment
  - commonfloor search
siteUrl: https://www.commonfloor.com
requiresAuth: true
params:
  - name: city
    required: true
    hint: City or locality (e.g. "Bangalore", "HSR Layout", "Pune Kothrud")
  - name: property_type
    required: false
    hint: Flat, house, PG, villa (default "flat")
  - name: bedrooms
    required: false
    hint: Number of bedrooms (e.g. "1 BHK", "2 BHK", "3 BHK")
  - name: budget
    required: false
    hint: Monthly rent budget (e.g. "under 15000", "10k-20k")
  - name: furnishing
    required: false
    hint: Furnished, semi-furnished, or unfurnished
---

# CommonFloor Rental Search

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm city/locality, property type, BHK, budget. Use `ask_user` for missing info.
- Note preferences: furnishing, parking, bachelor-friendly, pet-friendly, vegetarian-only society.
- Ask about move-in date and preferred lease duration.
- Clarify if PG or independent flat — CommonFloor has both.

### 2. Open CommonFloor & Verify Login
- Open a NEW tab and navigate to `https://www.commonfloor.com`.
- Take snapshot. Close any popups, banners, or overlay modals.
- Verify logged in (profile icon or user name visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search Rentals
- Select "Rent" tab on the homepage.
- Enter city or locality in the search bar. Select from autocomplete dropdown.
- Set property type filter (apartment, house, PG).
- Set BHK filter if specified.
- Click "Search" to see results.
- Take snapshot of listings page.

### 4. Filter & Present Options
- Apply budget range filter if specified.
- Apply furnishing filter if user has preference.
- Filter by availability (immediate, within 15 days, within 30 days).
- Sort by "Recent" or "Price (Low to High)" based on preference.
- Extract top 5 rentals: society name, locality, BHK config, rent/month, deposit, carpet area, floor, furnishing, available from.
- Use `ask_user` (input_type "choice"): "Society Name — X BHK — ₹XX,XXX/month — Deposit ₹XX,XXX — Locality — Furnished"

### 5. Property Details & Review
- Click selected property. Take snapshot.
- Extract: full address, amenities, nearby schools/hospitals/metro, parking availability, water supply, power backup.
- Check tenant preferences (family/bachelor, veg/non-veg).
- Use `confirm_action` with rental summary:
  - Society name and full address
  - Configuration (BHK, sqft, floor, facing)
  - Monthly rent and maintenance
  - Security deposit amount
  - Furnishing details (list of furniture/appliances)
  - Lock-in period
  - Available from date
  - Owner/broker info
  - Tenant restrictions (bachelor, pets, food)
- Do NOT proceed unless user confirms interest.

### 6. Contact Owner & Payment
- Click "Contact Owner" or "Get Phone Number" button.
- Fill inquiry form with operator profile details if needed.
- Use `collect_payment`:
  - summary: JSON with property name, config, rent, deposit, locality, owner info
  - amount_inr: service fee amount
  - description: "CommonFloor rental search service"
- WAIT for payment confirmation.

### 7. Final Confirmation
- Take snapshot of contact confirmation or owner details revealed.
- Report: property name, full address, owner/agent name, phone number, rent, deposit, available date, next steps for site visit.
- Offer to shortlist more properties or compare options.

## Site Notes

- CommonFloor (now part of Quikr Realty) focuses on residential rentals, especially in Bangalore, Chennai, Pune, Hyderabad.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) must be logged in. Do NOT ask user for credentials.
- CommonFloor merged with Quikr — some redirects may happen. Handle gracefully.
- PG listings include single/double/triple sharing with meal options — extract sharing type and meal plan.
- Society reviews and ratings are a unique feature — mention society rating if available.
- "Verified" badge means CommonFloor has confirmed owner identity — prefer these listings.
- Deposit norms vary by city: Bangalore 10 months, Mumbai 3 months, Delhi 2 months — set user expectations.
- Brokerage: direct owner listings save 1 month rent vs broker listings — highlight owner listings.
- CommonFloor session may expire after ~14 days. Profile 3 should stay logged in.
- Use `confirm_action` for property review, `collect_payment` for service fee. WAIT for user response.
