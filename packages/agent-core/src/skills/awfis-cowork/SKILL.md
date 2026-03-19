---
name: awfis-cowork
description: Book coworking on Awfis — meeting rooms, hot desks, dedicated desks, private cabins across India.
triggers:
  - awfis
  - awfis coworking
  - awfis desk
  - awfis meeting room
  - awfis office
  - awfis booking
  - awfis cabin
  - coworking awfis
siteUrl: https://www.awfis.com
requiresAuth: true
params:
  - name: city
    required: true
    hint: City or location (e.g. "Bangalore", "Delhi Connaught Place", "Mumbai Lower Parel")
  - name: plan_type
    required: false
    hint: Day pass, hot desk, dedicated desk, private cabin, meeting room (default "hot desk")
  - name: team_size
    required: false
    hint: Number of seats needed (e.g. "1", "team of 8", "20 people")
  - name: budget
    required: false
    hint: Budget per seat per month (e.g. "under 8000", "5k-12k")
  - name: duration
    required: false
    hint: Booking duration (e.g. "1 day", "3 months", "1 year")
---

# Awfis Coworking Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm city/location, plan type, team size, budget, duration. Use `ask_user` for missing info.
- Clarify: day pass (walk-in), hot desk (flexible), dedicated desk (fixed), private cabin (team office), meeting room (hourly).
- Ask about preferences: near metro, parking needed, 24/7 access, specific business district.
- Note if meeting room booking — ask for date, time, duration, attendee count.

### 2. Open Awfis & Verify Login
- Open a NEW tab and navigate to `https://www.awfis.com`.
- Take snapshot. Close any promotional banners, popups, or chat widgets.
- Verify logged in (profile icon, user name, or account section visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search Locations
- Navigate to "Coworking Spaces" or "Locations" section.
- Select city from dropdown or filter.
- If specific area/locality mentioned, search for that area.
- Filter by plan type: flexi desk, dedicated, private cabin, meeting room.
- Click "Search" or browse available centres.
- Take snapshot of results.

### 4. Filter & Present Options
- Filter by plan type availability and budget range.
- Filter by amenities: high-speed WiFi, parking, cafeteria, printer, locker.
- Filter by capacity for team/meeting room requirements.
- Extract top 5 locations: centre name, address, available plans with pricing, amenities, capacity, nearby metro/landmark, building rating.
- Use `ask_user` (input_type "choice"): "Awfis Centre Name — Area — Hot Desk ₹X,XXX/month — [WiFi, Parking, Cafeteria, Metro 2min]"

### 5. Plan Selection & Review
- Click selected centre. Take snapshot of detail page.
- Browse all available plans and pricing tiers.
- Check inclusions: WiFi speed, meeting room credits, print pages, tea/coffee, locker.
- Check for Awfis Pass (multi-location access) if user travels between cities.
- Use `confirm_action` with booking summary:
  - Awfis centre name and full address
  - Plan type and seat count
  - Monthly rate per seat (or hourly rate for meeting room)
  - Contract duration and start date
  - Included amenities: WiFi, meeting room hours, print credits, tea/coffee
  - Centre amenities: cafeteria, breakout zone, phone booths, locker, parking
  - Access hours (24/7 or 8am-8pm)
  - Parking availability and charges
  - Security deposit and advance payment terms
  - Cancellation/exit policy and notice period
- Do NOT proceed unless user confirms.

### 6. Book & Payment
- Click "Book Now" or "Enquire" or "Reserve" button.
- Fill details from operator profile: name, company, email, phone, GST (if applicable).
- For meeting rooms, select date, time slot, and duration.
- Use `collect_payment`:
  - summary: JSON with centre name, plan type, seats, duration, monthly cost, deposit, total
  - amount_inr: first month + deposit (or meeting room booking amount)
  - description: "Awfis coworking space booking"
- WAIT for payment confirmation.

### 7. Final Confirmation
- Complete booking on Awfis.
- Handle any OTP or verification via `ask_user` if needed.
- Take snapshot of booking confirmation.
- Report: booking/membership ID, centre address, plan type, start date, monthly cost, access card details, Awfis app download, centre manager contact, building entry instructions.

## Site Notes

- Awfis is India's largest flexible workspace provider by number of centres — 100+ locations across 16 cities.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) must be logged in. Do NOT ask user for credentials.
- Awfis pricing is generally 20-30% lower than WeWork — positioned as value coworking. Hot desks ₹5000-10000/month.
- "Awfis Pass" is their multi-location product — use any Awfis centre in India. Great for sales teams and travelers.
- Meeting rooms are bookable by the hour (₹300-1000/hr) with video conferencing equipment — popular product.
- Awfis has both managed offices (for 20+ teams) and flex desks — clarify user needs.
- Some centres are in tier-2 cities (Jaipur, Chandigarh, Kochi) where WeWork doesn't operate — Awfis advantage.
- Parking varies by centre — some include it, others charge ₹1500-3000/month extra. Always check.
- Awfis session cookies expire after ~21 days. Profile 3 should stay logged in.
- Use `confirm_action` for booking review, `collect_payment` for checkout. WAIT for user response.
