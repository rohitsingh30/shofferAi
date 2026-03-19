---
name: 99acres-property
description: Search property to buy or rent on 99acres — filter by type, budget, location, compare listings, contact owner/builder.
triggers:
  - 99acres
  - buy property
  - buy flat
  - property search
  - 99acres property
  - apartment buy
  - house for sale
  - rent on 99acres
  - real estate search
siteUrl: https://www.99acres.com
requiresAuth: true
params:
  - name: transaction_type
    required: true
    hint: "buy" or "rent"
  - name: city
    required: true
    hint: City to search in (e.g. "Bangalore", "Mumbai", "Gurgaon", "Noida")
  - name: locality
    required: true
    hint: Preferred locality or area (e.g. "Whitefield", "Bandra West", "Sector 50")
  - name: property_type
    required: false
    hint: Property type — "apartment", "villa", "plot", "independent house", "builder floor"
  - name: bhk
    required: false
    hint: BHK type — "1 BHK", "2 BHK", "3 BHK", "4 BHK"
  - name: budget_max
    required: false
    hint: Maximum budget (e.g. "80 lakhs", "1.5 crore" for buy; "30000" for rent)
---

# 99acres Property Search

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Search Requirements
- Confirm: buy or rent, city, locality, property type, BHK, budget range.
- If missing, use `ask_user` (input_type "freetext"): "Are you looking to buy or rent? Which city and locality? What's your budget and BHK preference?"
- Ask for additional preferences:
  - New construction vs resale
  - Ready to move vs under construction
  - Preferred floor (for apartments)
  - Parking, amenities requirements
  - Builder preference (if any)

### 2. Open 99acres & Verify Login
- Open a NEW tab and navigate to `https://www.99acres.com`.
- Take snapshot. Dismiss any popups, subscription prompts, or cookie notices.
- Verify logged in (profile name or icon in top-right).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Select correct city if prompted.

### 3. Set Search Filters
- Select transaction type: Buy / Rent.
- Enter locality in the search bar — select from autocomplete.
- Set property type: Apartment / Villa / Plot / Builder Floor / Independent House.
- Set BHK: 1 BHK / 2 BHK / 3 BHK / 4 BHK+.
- Set budget range (min - max).
- Apply additional filters:
  - Possession: Ready to Move / Under Construction / New Launch
  - Furnishing: Furnished / Semi-Furnished / Unfurnished
  - Posted by: Owner / Builder / Dealer
  - Area: min-max sq ft
  - Amenities: parking, gym, pool, garden
- Click "Search" or apply.
- Take snapshot of search results.

### 4. Browse & Compare Properties
- Extract top 5-8 properties:
  - Property title and society/project name
  - BHK type and carpet/super area (sq ft)
  - Price (total for buy / monthly for rent) and price per sq ft
  - Location and landmark
  - Floor number and facing
  - Age of property / possession date
  - Builder/owner name
  - Amenities highlights
  - RERA registered (yes/no)
  - Photo count
- Present via `ask_user` (input_type "choice"):
  "1) 3BHK in DLF The Crest, Sector 54 — ₹2.1 Cr — 2100 sqft — Ready to Move"
  "2) 3BHK in Godrej Summit, Sector 104 — ₹1.5 Cr — 1800 sqft — Under Construction"
  "3) 3BHK in Bestech Park View, Sector 66 — ₹1.8 Cr — 1950 sqft — Resale"
  "View More Properties"
- Let user select for detailed view or comparison.

### 5. View Property Details
- Click on selected property.
- Take snapshot of property detail page.
- Extract comprehensive details:
  - Full address and map location
  - Detailed price breakdown (base price, parking, PLC, registration, stamp duty)
  - Builder info and track record
  - Floor plan details
  - Society/project amenities (full list)
  - Connectivity (metro, highway, airport distance)
  - RERA number and status
  - Posted date and broker/owner details
  - Similar properties in the area
- Present details via `ask_user`.
- Ask: "Would you like to contact the owner/builder, compare with another property, or view more?"

### 6. Contact Owner/Builder
- If user wants to contact, click "Contact" or "Get Phone Number".
- Use `confirm_action`:
  - Property: title, BHK, area, location
  - Price: total / rent amount
  - Contact: owner / builder / dealer name
  - Action: request callback or get phone number
  - Note: 99acres may charge for premium contacts
- Do NOT proceed unless user confirms.

### 7. Final Confirmation with Snapshot
- Take snapshot of contact confirmation or shortlisted properties.
- Report:
  - Properties viewed and shortlisted (with key details)
  - Contacts requested
  - Price comparison summary
  - Recommendations based on user criteria
- Mention: "Always verify RERA registration before buying. Visit the site in person. Check builder's delivery track record. Get legal verification of property documents before paying any advance."

## Site Notes

- 99acres.com is one of India's largest real estate portals with listings across all cities.
- Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- 99acres shows listings from owners, builders, and dealers — prefer "owner" listings to avoid brokerage.
- Property prices on the portal are indicative — actual prices may be negotiable (5-10% for resale).
- RERA (Real Estate Regulatory Authority) registration is mandatory for projects — always check.
- Under construction: verify RERA, check builder reputation, ask for OC (Occupation Certificate) timeline.
- Stamp duty and registration charges are additional (5-7% of property value in most states).
- 99acres may show premium/featured listings at the top — these are paid promotions, not necessarily best value.
- Session may timeout — re-login if the page redirects to login.
- Carpet area vs super built-up area: carpet is actual usable area (~70% of super built-up). Always ask for carpet area.
- Use `confirm_action` for review, `collect_payment` for premium contacts if needed. WAIT for user response.
