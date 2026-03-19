---
name: smartworks-cowork
description: Book coworking on Smartworks — managed offices, flex desks, enterprise solutions across India.
triggers:
  - smartworks
  - smartworks coworking
  - smartworks office
  - smartworks desk
  - smartworks booking
  - smartworks managed office
  - smartworks flex
  - coworking smartworks
siteUrl: https://www.smartworksoffice.com
requiresAuth: true
params:
  - name: city
    required: true
    hint: City or location (e.g. "Bangalore", "Noida Sector 125", "Gurgaon Golf Course Road")
  - name: plan_type
    required: false
    hint: Flex desk, dedicated desk, private office, managed office (default "flex desk")
  - name: team_size
    required: false
    hint: Number of seats (e.g. "just me", "team of 15", "50 people")
  - name: budget
    required: false
    hint: Budget per seat per month (e.g. "under 10000", "8k-15k")
  - name: duration
    required: false
    hint: Commitment period (e.g. "3 months", "6 months", "1 year")
---

# Smartworks Coworking Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm city/location, plan type, team size, budget, duration. Use `ask_user` for missing info.
- Clarify plan type: flex desk (shared, monthly), dedicated desk (fixed seat), private office (enclosed for team), managed office (customized floor/wing for 50+ teams).
- Ask about preferences: near metro, parking, 24/7 access, cafeteria, gym.
- Note if enterprise/managed office — Smartworks specializes in larger teams.

### 2. Open Smartworks & Verify Login
- Open a NEW tab and navigate to `https://www.smartworksoffice.com`.
- Take snapshot. Close any popups, chat widgets, or newsletter signups.
- Verify logged in (profile icon or account section visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search Locations
- Navigate to "Locations" or "Coworking Spaces" section.
- Select city from the available cities list.
- Browse centres in the selected city.
- If specific area mentioned, look for centres in that neighborhood.
- Take snapshot of available centres.

### 4. Filter & Present Options
- Filter by plan type availability (flex, dedicated, private, managed).
- Filter by capacity for team size requirements.
- Extract top 5 centres: centre name, address, available plans with pricing, total capacity, amenities, building grade (Grade A/B), nearby metro/landmark.
- Highlight centres with specific features: terrace, gym, creche, game zone.
- Use `ask_user` (input_type "choice"): "Smartworks Centre — Area — Flex Desk ₹X,XXX/month — Grade A Building — [Gym, Cafeteria, Parking, Metro 5min]"

### 5. Plan Selection & Review
- Click selected centre. Take snapshot of detail page.
- Browse plan options: flex desk, dedicated, private cabin (2-20 seats), managed office (20-500 seats).
- Check inclusions: WiFi, meeting room hours, print credits, reception services, mail handling.
- Review virtual tour or photos of the space.
- Use `confirm_action` with booking summary:
  - Smartworks centre name and full address
  - Plan type and seat count
  - Monthly rate per seat
  - Contract duration and start date
  - Included amenities: high-speed WiFi, meeting room credits, printing, tea/coffee
  - Centre amenities: cafeteria, gym, game zone, terrace, phone booths, creche
  - Building grade and features (parking floors, lobby, elevators)
  - Access hours (typically 24/7 for dedicated and above)
  - Security deposit (usually 2-3 months for long-term)
  - Lock-in period and exit notice terms
  - IT infrastructure: LAN ports, video conferencing, AV equipment
- Do NOT proceed unless user confirms.

### 6. Book & Payment
- Click "Get Quote" or "Book Now" or "Schedule Visit" button.
- Fill business details: company name, contact person, email, phone, team size, GST number.
- For smaller plans, proceed directly. For managed offices, schedule a site visit first.
- Use `collect_payment`:
  - summary: JSON with centre name, plan type, seats, monthly cost, deposit, contract duration, total first payment
  - amount_inr: first month + security deposit
  - description: "Smartworks coworking space booking"
- WAIT for payment confirmation.

### 7. Final Confirmation
- Complete booking or tour scheduling on Smartworks.
- Handle any verification via `ask_user` if needed.
- Take snapshot of confirmation.
- Report: booking/inquiry ID, centre address, plan type, start date, monthly cost, deposit paid, community manager contact, access instructions, onboarding next steps.

## Site Notes

- Smartworks is India's second-largest coworking provider — 40+ centres across 12 cities, strong in enterprise/managed offices.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) must be logged in. Do NOT ask user for credentials.
- Smartworks differentiator: Grade A buildings with premium amenities (gym, creche, game zone) — positioned premium.
- Pricing: flex desks ₹7000-12000/month, dedicated ₹10000-18000/month, private offices ₹12000-25000/seat/month — city dependent.
- Managed offices for 50+ teams are Smartworks' core business — customized buildout, dedicated floors, branded reception.
- Most Smartworks centres offer 24/7 access, biometric entry, CCTV — enterprise-grade security.
- Smartworks may require site visits before finalizing large deals — the "Book" flow may be an inquiry rather than instant booking.
- Strong presence in Bangalore, Delhi NCR (Gurgaon, Noida), Pune, Hyderabad, Chennai, Mumbai.
- Session cookies expire after ~21 days. Profile 3 should stay logged in.
- Use `confirm_action` for booking review, `collect_payment` for checkout. WAIT for user response.
