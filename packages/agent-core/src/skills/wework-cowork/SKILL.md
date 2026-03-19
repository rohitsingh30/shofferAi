---
name: wework-cowork
description: Book coworking space on WeWork India — day passes, hot desks, dedicated desks, private offices.
triggers:
  - wework
  - wework coworking
  - wework desk
  - wework office
  - wework day pass
  - wework booking
  - wework india
  - coworking wework
siteUrl: https://www.wework.co.in
requiresAuth: true
params:
  - name: city
    required: true
    hint: City or location (e.g. "Bangalore", "Mumbai BKC", "Gurgaon Cyber Hub")
  - name: plan_type
    required: false
    hint: Day pass, hot desk, dedicated desk, private office, meeting room (default "hot desk")
  - name: team_size
    required: false
    hint: Number of people (e.g. "just me", "team of 5", "10 people")
  - name: budget
    required: false
    hint: Monthly budget (e.g. "under 15000", "10k-25k per seat")
  - name: duration
    required: false
    hint: Duration (e.g. "1 day", "1 month", "6 months", "1 year")
---

# WeWork India Coworking Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm city/location, plan type, team size, budget, duration. Use `ask_user` for missing info.
- Clarify plan type: day pass (single day), hot desk (any available desk monthly), dedicated desk (fixed desk), private office (enclosed cabin for team).
- Ask about must-have amenities: meeting rooms, phone booths, high-speed internet, parking, cafeteria.
- Note preferred area (close to metro, specific business district).

### 2. Open WeWork India & Verify Login
- Open a NEW tab and navigate to `https://www.wework.co.in`.
- Take snapshot. Close any promotional popups, newsletter signups, or chat widgets.
- Verify logged in (profile icon, user name, or "My Account" visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search Locations
- Select city from the locations page or homepage dropdown.
- Browse available WeWork buildings in the selected city.
- If specific area mentioned, filter by that neighborhood.
- Look at available plan types for each location.
- Take snapshot of locations list.

### 4. Filter & Present Options
- Filter locations by plan type availability (day pass, hot desk, private office).
- Filter by amenities and capacity for team size.
- Extract top 5 locations: building name, address, available plans with pricing, amenities, nearby metro/landmark, building features (terrace, cafeteria, event space).
- Calculate monthly cost based on plan type and team size.
- Use `ask_user` (input_type "choice"): "WeWork Building Name — Area — Hot Desk ₹XX,XXX/month — [Parking, Cafeteria, Metro 5min] — Team capacity"

### 5. Plan Selection & Review
- Click selected location. Take snapshot of location detail page.
- Browse available plans and pricing: day pass, hot desk, dedicated desk, private cabin.
- Check included credits: meeting room hours, print credits, community events.
- Tour the space virtually via photos if available.
- Use `confirm_action` with booking summary:
  - WeWork location name and full address
  - Plan type and seat count
  - Price per seat per month (or day pass rate)
  - Contract duration and start date
  - Included amenities: WiFi speed, meeting room credits, print credits, mail handling
  - Common amenities: cafeteria, phone booths, wellness room, terrace, game zone
  - Access hours (24/7 or business hours)
  - Parking availability and cost
  - Community perks: events, networking, member discounts
  - Security deposit and payment terms
- Do NOT proceed unless user confirms.

### 6. Book & Payment
- Click "Book a Tour" or "Get Started" or "Book Now" button.
- Fill business/personal details from operator profile: name, company, email, phone, team size.
- Use `collect_payment`:
  - summary: JSON with location, plan type, seats, monthly cost, deposit, total first payment
  - amount_inr: first month + deposit (or day pass amount)
  - description: "WeWork India coworking booking"
- WAIT for payment confirmation.

### 7. Final Confirmation
- Complete booking on WeWork.
- Handle any verification or OTP via `ask_user` if needed.
- Take snapshot of confirmation.
- Report: booking/membership ID, location address, plan type, start date, monthly cost, access details, WeWork app download, community manager contact, building access instructions.

## Site Notes

- WeWork India is the largest flexible workspace provider with 50+ buildings across 7 cities.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) must be logged in. Do NOT ask user for credentials.
- WeWork pricing: day passes ₹500-1500, hot desks ₹8000-15000/month, dedicated desks ₹12000-25000/month, private offices ₹15000-40000/seat/month — varies by city.
- WeWork All Access pass allows using any WeWork location in India — great for frequent travelers.
- Meeting rooms are bookable by the hour (₹500-2000/hr) — 2-4 hours/month often included in plans.
- WeWork India operates independently from WeWork global — separate website and plans.
- Most locations offer 24/7 access for dedicated desk and private office plans. Hot desks may be business hours only.
- Parking is limited and may cost extra (₹2000-5000/month) — always check and mention.
- WeWork session cookies expire after ~30 days. Profile 3 should stay logged in.
- Use `confirm_action` for booking review, `collect_payment` for checkout. WAIT for user response.
