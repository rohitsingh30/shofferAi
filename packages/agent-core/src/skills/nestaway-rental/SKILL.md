---
name: nestaway-rental
description: Find managed rental homes on NestAway — furnished flats, PG, shared rooms with zero brokerage.
triggers:
  - nestaway
  - nestaway rental
  - nestaway flat
  - nestaway pg
  - nestaway furnished
  - nestaway room
  - managed rental
  - zero brokerage rental
siteUrl: https://www.nestaway.com
requiresAuth: true
params:
  - name: city
    required: true
    hint: City or locality (e.g. "Bangalore", "Koramangala", "Pune Hinjewadi")
  - name: property_type
    required: false
    hint: Private room, shared room, full flat (default "private room")
  - name: budget
    required: false
    hint: Monthly rent budget (e.g. "under 12000", "8k-15k")
  - name: occupancy
    required: false
    hint: Single, double, triple sharing (for shared rooms)
  - name: gender
    required: false
    hint: Male, female, or co-living (for shared/PG)
---

# NestAway Rental Search

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm city/locality, property type (private room, shared room, full flat). Use `ask_user` for missing info.
- Note budget, gender preference, occupancy type, move-in date.
- Ask about food preference (veg/non-veg), work location for commute estimation.
- Clarify: NestAway specializes in managed furnished rentals — set expectations accordingly.

### 2. Open NestAway & Verify Login
- Open a NEW tab and navigate to `https://www.nestaway.com`.
- Take snapshot. Close any app-download banners or popups.
- Verify logged in (profile icon, user name, or "My Account" visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search Properties
- Select city from the homepage or header dropdown.
- Enter locality or area in search bar. Select from suggestions.
- Choose property type: "Room", "Shared Room", or "Entire House".
- Apply gender filter if applicable (male/female/unisex).
- Click "Search" or apply filters.
- Take snapshot of results.

### 4. Filter & Present Options
- Apply budget range filter if specified.
- Filter by furnishing level (fully furnished is default on NestAway).
- Filter by amenities: WiFi, AC, washing machine, meals, housekeeping.
- Sort by price or relevance.
- Extract top 5 options: house name/ID, locality, room type, rent/month, deposit, sharing type, amenities included, available from.
- Use `ask_user` (input_type "choice"): "NestAway House ID — Private Room — ₹XX,XXX/month — Deposit ₹XX,XXX — Locality — [WiFi, AC, Meals]"

### 5. Property Details & Review
- Click selected property. Take snapshot of detail page.
- Extract: full address, room photos, common area photos, house rules, included amenities, nearby landmarks, flatmate profiles (if shared).
- Check NestAway-managed services: maintenance, housekeeping schedule, WiFi speed.
- Use `confirm_action` with rental summary:
  - House name/ID and full address
  - Room type (private/shared) and occupancy
  - Monthly rent and what it includes
  - Security deposit (typically 2 months on NestAway)
  - Move-in charges (one-time setup fee)
  - Amenities: WiFi, AC, furnished items list
  - Meals plan (if available)
  - House rules: guest policy, noise hours, smoking
  - Lock-in period (typically 3-6 months)
  - NestAway managed services included
- Do NOT proceed unless user confirms interest.

### 6. Book & Payment
- Click "Book Now" or "Schedule Visit" button.
- Fill tenant details from operator profile.
- Use `collect_payment`:
  - summary: JSON with house ID, room type, rent, deposit, move-in charges, locality
  - amount_inr: first month rent + deposit + move-in charge total
  - description: "NestAway managed rental booking"
- WAIT for payment confirmation.

### 7. Final Confirmation
- Complete booking on NestAway.
- Take snapshot of booking confirmation.
- Report: booking ID, house address, room details, move-in date, rent, deposit paid, NestAway support contact, next steps (key pickup, move-in process).

## Site Notes

- NestAway is India's largest managed rental platform — zero brokerage, fully managed properties.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) must be logged in. Do NOT ask user for credentials.
- All NestAway properties are fully furnished with bed, wardrobe, WiFi — this is their USP.
- Deposit is typically 2 months rent (much lower than Bangalore's standard 10 months) — highlight this benefit.
- Lock-in period is usually 3-6 months — early exit incurs deposit forfeiture. Always mention.
- NestAway charges a one-time move-in/setup fee (₹2000-5000) — include in total cost calculation.
- Maintenance and repairs are handled by NestAway — tenants don't deal with landlords directly.
- NestAway operates primarily in Bangalore, Pune, Chennai, Hyderabad, Delhi NCR, Mumbai.
- Session cookies on NestAway expire after ~21 days. Profile 3 should stay logged in.
- Use `confirm_action` for booking review, `collect_payment` for checkout. WAIT for user response.
