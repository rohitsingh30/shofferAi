---
name: 91springboard-cowork
description: Book coworking on 91springboard — community-driven spaces with desks, offices, events, and networking.
triggers:
  - 91springboard
  - 91 springboard
  - springboard coworking
  - 91springboard desk
  - 91springboard office
  - 91springboard booking
  - 91springboard community
  - coworking 91springboard
siteUrl: https://www.91springboard.com
requiresAuth: true
params:
  - name: city
    required: true
    hint: City or location (e.g. "Delhi", "Bangalore HSR", "Gurgaon Udyog Vihar")
  - name: plan_type
    required: false
    hint: Hot desk, dedicated desk, private cabin, virtual office, meeting room (default "hot desk")
  - name: team_size
    required: false
    hint: Number of seats (e.g. "1", "team of 5", "12 people")
  - name: budget
    required: false
    hint: Budget per seat per month (e.g. "under 8000", "5k-12k")
  - name: duration
    required: false
    hint: Booking duration (e.g. "1 month", "3 months", "1 year")
---

# 91springboard Coworking Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm city/location, plan type, team size, budget, duration. Use `ask_user` for missing info.
- Clarify plan: hot desk (flexible seating), dedicated desk (fixed), private cabin (enclosed team space), virtual office (address + mail only), meeting room (hourly).
- Ask about community preferences: 91springboard is known for events and networking — mention this.
- Note if virtual office is needed (registered business address without physical desk).

### 2. Open 91springboard & Verify Login
- Open a NEW tab and navigate to `https://www.91springboard.com`.
- Take snapshot. Close any popups, event banners, or newsletter prompts.
- Verify logged in (profile icon, user name, or "My Account" visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search Locations
- Navigate to "Spaces" or "Locations" page.
- Select city from the available cities dropdown.
- Browse centres in the selected city.
- If specific area or landmark mentioned, find the nearest centre.
- Take snapshot of available spaces.

### 4. Filter & Present Options
- Filter by plan type (hot desk, dedicated, cabin, virtual office).
- Filter by team size capacity.
- Extract top 5 centres: centre name, address, available plans with pricing, capacity, community size (number of members), amenities, nearby metro, upcoming events.
- Highlight community features: member count, startups in residence, industry mix.
- Use `ask_user` (input_type "choice"): "91springboard Centre — Area — Hot Desk ₹X,XXX/month — 200+ members — [Events, Cafeteria, Parking, Metro nearby]"

### 5. Plan Selection & Review
- Click selected centre. Take snapshot of detail page.
- Browse plan options with detailed pricing.
- Check community features: events calendar, member directory, startup ecosystem.
- Check included benefits: meeting room credits, event access, mentorship sessions, investor connects.
- Use `confirm_action` with booking summary:
  - 91springboard centre name and full address
  - Plan type and seat count
  - Monthly rate per seat
  - Contract duration and start date
  - Included amenities: WiFi, meeting room hours, printing, tea/coffee, locker
  - Community benefits: weekly events, networking sessions, mentor hours, investor connects
  - Centre amenities: cafeteria, game zone, nap room, phone booths, terrace
  - Access hours (24/7 for most plans)
  - Security deposit (typically 1-2 months)
  - Lock-in period and notice period
  - Virtual office benefits (if applicable): business address, mail handling, GST registration
- Do NOT proceed unless user confirms.

### 6. Book & Payment
- Click "Book Now" or "Schedule Visit" or "Get Quote" button.
- Fill details: name, company, email, phone, team size, industry from operator profile.
- Use `collect_payment`:
  - summary: JSON with centre name, plan type, seats, monthly cost, deposit, contract duration, total first payment
  - amount_inr: first month rent + security deposit
  - description: "91springboard coworking booking"
- WAIT for payment confirmation.

### 7. Final Confirmation
- Complete booking on 91springboard.
- Handle any OTP or verification via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: membership ID, centre address, plan type, start date, monthly cost, deposit paid, community manager contact, 91springboard app/portal access, upcoming community events, onboarding details.

## Site Notes

- 91springboard is India's community-first coworking brand — 25+ centres, 20,000+ members, heavy focus on events and networking.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) must be logged in. Do NOT ask user for credentials.
- 91springboard differentiator: startup community, investor events, mentorship — not just a desk, it's an ecosystem.
- Pricing is competitive: hot desks ₹5000-9000/month, dedicated ₹7000-14000/month, cabins ₹10000-20000/seat/month.
- Virtual office plans (₹2000-4000/month) are popular for startups needing a registered address — mention if relevant.
- Community events: weekly happy hours, monthly demo days, quarterly investor meetups — significant value for startups.
- 91springboard may operate as "Innov8" in some locations (acquired by OYO, now independent again) — handle brand variations.
- Strong presence in Delhi NCR (8+ centres), Bangalore, Mumbai, Hyderabad, Pune, Gurgaon.
- Session cookies expire after ~21 days. Profile 3 should stay logged in.
- Use `confirm_action` for booking review, `collect_payment` for checkout. WAIT for user response.
