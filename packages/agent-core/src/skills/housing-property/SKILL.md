---
name: housing-property
description: Search and shortlist properties on Housing.com — buy or rent flats, houses, plots with filters.
triggers:
  - housing.com
  - housing property
  - buy flat housing
  - rent flat housing
  - housing.com search
  - property search housing
  - housing apartment
  - housing rent
siteUrl: https://housing.com
requiresAuth: true
params:
  - name: city
    required: true
    hint: City or locality (e.g. "Bangalore", "Whitefield Bangalore", "Mumbai Andheri")
  - name: type
    required: true
    hint: Buy or Rent (e.g. "rent", "buy")
  - name: property_type
    required: false
    hint: Flat, house, villa, plot, PG (default "flat")
  - name: budget
    required: false
    hint: Budget range (e.g. "under 20000/month", "50L-1Cr")
  - name: bedrooms
    required: false
    hint: Number of bedrooms (e.g. "2 BHK", "3 BHK")
---

# Housing.com Property Search

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm city/locality, buy or rent, property type, budget, BHK. Use `ask_user` for missing info.
- Note preferences: furnished/semi-furnished, parking, pet-friendly, floor preference, nearby metro.
- Convert relative terms: "near office in Whitefield" means Whitefield locality.
- If buying, ask possession timeline (ready-to-move vs under-construction).

### 2. Open Housing.com & Verify Login
- Open a NEW tab and navigate to `https://housing.com`.
- Take snapshot. Close any app-install banners or popups.
- Verify logged in (profile icon or name visible in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search Properties
- Select "Buy" or "Rent" tab based on user request.
- Enter city/locality in the search bar. Select from autocomplete suggestions.
- Apply BHK filter if specified.
- Apply budget range filter if specified.
- Click "Search" or press Enter.
- Take snapshot of results page.

### 4. Filter & Present Options
- Apply filters: property type (apartment, villa, plot), furnishing status, availability (ready-to-move, under-construction).
- Sort by "Relevance" or "Price (Low to High)" based on user preference.
- Extract top 5 properties: name/society, locality, price, BHK config, carpet area (sqft), floor, furnishing, age of property, photos description.
- Highlight verified listings and Housing Edge properties.
- Use `ask_user` (input_type "choice"): "Society Name — X BHK — ₹XX,XXX/month — Sqft — Furnished — Locality"

### 5. Property Details & Shortlist
- Click selected property. Take snapshot of detail page.
- Extract: full address, amenities (gym, pool, parking, security), nearby landmarks, owner/builder info, possession date.
- Show floor plan if available.
- Use `confirm_action` with property summary:
  - Property name and full address
  - Configuration (BHK, sqft, floor)
  - Price and maintenance charges
  - Furnishing details
  - Amenities list
  - Owner/agent contact info
  - For rent: deposit amount, lock-in period
  - For buy: possession date, registration charges estimate
- Do NOT proceed unless user confirms interest.

### 6. Schedule Visit / Contact Owner
- Click "Contact Owner" or "Schedule Visit" button.
- Fill details from operator profile if needed.
- Use `collect_payment`:
  - summary: JSON with property name, config, price, locality, owner details
  - amount_inr: service fee amount
  - description: "Housing.com property shortlisting service"
- WAIT for payment confirmation.

### 7. Final Confirmation
- Take snapshot of contact/visit confirmation.
- Report: property name, full address, owner/agent name, phone, scheduled visit time if applicable, next steps.
- Offer to search more properties or shortlist additional options.

## Site Notes

- Housing.com is India's leading property platform with 1M+ listings across 40+ cities.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) must be logged in. Do NOT ask user for credentials.
- "Housing Edge" properties are verified with real photos and accurate info — prefer these.
- Prices on Housing.com: rent shown as monthly, buy shown as total or per-sqft — clarify to user.
- Brokerage: some listings are broker-free (direct owner), others charge 1-2 months rent as brokerage.
- Furnished vs semi-furnished vs unfurnished significantly affects rent — always mention status.
- Security deposit for rentals is typically 2-10 months rent depending on city — always extract and mention.
- Housing.com session cookies expire after ~30 days. Profile 3 should stay logged in.
- RERA registered properties are legally safer for buying — check and mention RERA ID if present.
- Use `confirm_action` for property review, `collect_payment` for service fee. WAIT for user response.
