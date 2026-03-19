---
name: magicbricks-property
description: Search property on MagicBricks — filter by type, budget, location, view details, contact owner/agent.
triggers:
  - magicbricks
  - magicbricks property
  - property on magicbricks
  - flat on magicbricks
  - magicbricks rent
  - magicbricks buy
  - search property magicbricks
  - magicbricks flat
  - house magicbricks
siteUrl: https://www.magicbricks.com
requiresAuth: true
params:
  - name: transaction_type
    required: true
    hint: "buy" or "rent"
  - name: city
    required: true
    hint: City to search in (e.g. "Bangalore", "Mumbai", "Delhi", "Pune", "Hyderabad")
  - name: locality
    required: true
    hint: Preferred locality or area (e.g. "Indiranagar", "Powai", "Dwarka")
  - name: property_type
    required: false
    hint: Property type — "apartment", "villa", "plot", "independent house", "penthouse"
  - name: bhk
    required: false
    hint: BHK type — "1 BHK", "2 BHK", "3 BHK", "4 BHK"
  - name: budget_max
    required: false
    hint: Maximum budget (e.g. "1 crore" for buy; "35000" for rent)
---

# MagicBricks Property Search

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Search Requirements
- Confirm: buy or rent, city, locality, property type, BHK, budget.
- If missing, use `ask_user` (input_type "freetext"): "Are you looking to buy or rent? Which city and area? What BHK and budget?"
- Ask for additional preferences:
  - Ready to move vs under construction
  - Furnishing: furnished, semi-furnished, unfurnished
  - Posted by: owner / builder / agent
  - Floor preference, facing, vastu compliance
  - Society amenities: gym, pool, clubhouse, security

### 2. Open MagicBricks & Verify Login
- Open a NEW tab and navigate to `https://www.magicbricks.com`.
- Take snapshot. Dismiss any popups, app install banners, or newsletter prompts.
- Verify logged in (user name or profile icon visible in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Set Search Filters
- Select "Buy" or "Rent" tab at the top.
- Enter city name in the location field.
- Enter locality/area — select from dropdown suggestions.
- Set property type: Flat / House / Villa / Plot / Penthouse.
- Set BHK: 1 BHK / 2 BHK / 3 BHK / 4+ BHK.
- Set budget range using the budget slider or min-max inputs.
- Apply additional filters:
  - Possession status: Ready to Move / Under Construction
  - Furnishing: Furnished / Semi-Furnished / Unfurnished
  - Listed by: Owner / Builder / Agent
  - Floor: Low (0-4) / Mid (5-10) / High (11+)
  - Area: sq ft range
  - Age: New / 1-5 years / 5-10 years / 10+ years
- Click "Search".
- Take snapshot of search results page.

### 4. Browse & Shortlist Properties
- Extract top 5-8 listings:
  - Property title and project name
  - BHK and area (sq ft)
  - Price (total or monthly rent) and price per sq ft
  - Location with proximity to landmarks
  - Furnishing status
  - Floor and total floors
  - Possession status (ready / under construction with date)
  - Listed by (owner / builder / agent)
  - MagicBricks TrustScore (if available)
  - Photo count
- Present via `ask_user` (input_type "choice"):
  "1) 2BHK in Mantri Serenity, Kanakapura Rd — ₹75L — 1150 sqft — Ready — Owner"
  "2) 2BHK in Purva Atmosphere, Thanisandra — ₹68L — 1050 sqft — 2024 — Builder"
  "3) 2BHK in Prestige Ferns Residency, HAL — ₹85L — 1200 sqft — Resale — Agent"
  "View More"
- Allow user to select properties for detailed view.

### 5. View Property Details
- Click on selected property listing.
- Take snapshot of property detail page.
- Extract full details:
  - Complete address and map
  - Price breakdown and EMI estimate
  - Builder/developer details and reputation
  - Floor plan availability
  - Full amenities list (society + unit level)
  - Connectivity: metro, bus, highway, airport, IT parks
  - Neighbourhood insights: schools, hospitals, malls
  - RERA registration number
  - Contact person details
  - Similar properties and price trends in the locality
- Present to user via `ask_user`.
- Ask: "Would you like to contact the seller, shortlist this, or see more options?"

### 6. Contact Seller & Confirm
- If user wants to contact, click "Contact Owner" / "Get Phone" / "Request Callback".
- Use `confirm_action`:
  - Property: title, BHK, area, location
  - Price and price per sq ft
  - Contact person: owner / builder / agent
  - Action: get phone number or request callback
  - MagicBricks may require login or premium for some contacts
- Do NOT proceed unless user confirms.

### 7. Final Confirmation with Snapshot
- Take snapshot of contact details page or shortlist summary.
- Report:
  - Properties shortlisted with key details
  - Contacts initiated
  - Price range summary for the searched area
  - Locality insights (price trends, upcoming infrastructure)
- Mention: "Verify RERA registration before any payment. Visit properties in person. Check for clear title, approved plan, and OC/CC. Never pay token amount without legal verification."

## Site Notes

- MagicBricks.com is one of India's top real estate portals with pan-India coverage.
- Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- MagicBricks has both owner and agent listings — filter by "Owner" to avoid brokerage.
- MagicBricks TrustScore indicates listing quality — prefer higher-scored listings.
- The site uses aggressive popups and banners — dismiss them quickly to avoid UI obstruction.
- EMI calculator is available on property pages — useful for budget planning.
- Price trends and locality insights are available — use them to advise the user.
- MagicBricks may require paid plans for some premium features (unlimited contacts, priority listing).
- Session timeout is moderate — re-login if redirected to the login page.
- RERA verification is critical — MagicBricks shows RERA ID on registered projects.
- Brokerage in India is typically 1-2 months rent (rental) or 1-2% of sale price (buy).
- Use `confirm_action` for review and contact actions. WAIT for user response before proceeding.
