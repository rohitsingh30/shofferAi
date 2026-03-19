---
name: shaadisaga-venue
description: Search and book wedding venues on ShaadiSaga — filter by city, budget, guest capacity, venue type.
triggers:
  - shaadisaga
  - shaadi saga
  - wedding venue
  - banquet hall
  - marriage hall
  - wedding venue booking
  - shaadisaga venue
  - find banquet
  - book wedding venue
  - reception venue
siteUrl: https://www.shaadisaga.com
requiresAuth: true
params:
  - name: city
    required: true
    hint: City (e.g. "Delhi", "Mumbai", "Bangalore", "Jaipur")
  - name: guestCount
    required: false
    hint: Expected number of guests (e.g. "200", "500", "1000+")
  - name: budget
    required: false
    hint: Budget per plate or total budget (e.g. "₹1500/plate", "under 10 lakhs total")
  - name: venueType
    required: false
    hint: Type of venue (e.g. "banquet hall", "farmhouse", "resort", "hotel", "lawn")
  - name: weddingDate
    required: false
    hint: Wedding date or month (e.g. "December 2026", "March 15 2027")
---

# ShaadiSaga Wedding Venue Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm city is provided. If missing, use `ask_user` to ask.
- Get guest count estimate, budget range, venue type preference (banquet, farmhouse, resort, lawn, hotel).
- Note wedding date, event type (wedding, reception, engagement, mehendi), and any special requirements (valet parking, DJ, in-house decor).
- Use `ask_user` for missing info. City is required at minimum.

### 2. Open ShaadiSaga & Verify Login
- Open a NEW tab and navigate to `https://www.shaadisaga.com`.
- Take snapshot. Dismiss any promotional popups or app download banners.
- Verify logged in (profile icon visible in header/navigation).
- If NOT logged in, login transparently using Google sign-in. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search Venues
- Navigate to wedding venues section for the selected city (e.g. `/wedding-venues/Delhi`).
- Apply filters: guest capacity, budget range, venue type, locality if specified.
- Sort by relevance or price as appropriate.
- Take snapshot of search results page.

### 4. Present Top Options
- Extract 4-6 top venues with: name, locality, guest capacity, price per plate, veg/non-veg pricing, rating, reviews count, venue type.
- Note any "Featured" or "Top Rated" badges.
- Use `ask_user` (input_type "choice") to present options. Format:
  "Venue Name — Locality — Up to 500 guests — ₹1,800/plate (veg) — 4.5★ (85 reviews)"
- Add "Show more results" as last option.

### 5. View Venue Details
- Click selected venue. Take snapshot of venue detail page.
- Extract: full photo gallery count, pricing details (veg/non-veg/plate, room charges, decor packages), amenities (parking, AC, DJ, catering), availability calendar, cancellation policy.
- Present venue packages or pricing tiers via `ask_user` (input_type "choice"):
  "Veg Package — ₹1,800/plate — 300 pax min"
  "Non-Veg Package — ₹2,200/plate — 300 pax min"
  "Premium Package — ₹2,800/plate — includes decor + DJ"
- Mention key amenities and any restrictions (no outside DJ, alcohol corkage, etc.).

### 6. Check Availability & Book
- Click "Check Availability" or "Send Enquiry" for the selected date.
- Fill in event date, event type, guest count, and contact details if prompted.
- Take snapshot of availability confirmation or booking form.
- Use `confirm_action` to present booking summary:
  - Venue name and address
  - Event date and type
  - Guest count and package selected
  - Price per plate, estimated total
  - Advance amount required
  - Cancellation/refund policy
  - Key inclusions and restrictions
- Do NOT proceed unless user confirms.

### 7. Payment
- Use `collect_payment`:
  - summary: JSON with venue name, date, package, guest count, price/plate, advance amount, total estimate
  - amount_inr: advance amount (number)
  - description: "ShaadiSaga venue booking advance"
- STOP and WAIT for payment confirmation.

### 8. Complete Booking & Confirm
- Complete the advance payment on ShaadiSaga.
- Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: booking/inquiry ID, venue name, address, event date, package, advance paid, remaining balance, venue manager contact.
- Mention: "Visit the venue in person before the event to finalize decor and food menu. The venue will call you within 24 hours."

## Site Notes

- ShaadiSaga is a popular Indian wedding venue and vendor discovery platform.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Prices shown are "starting from" — final price depends on guest count, menu, and add-ons.
- Most venues require 25-50% advance to block the date, with remaining due before the event.
- Guest capacity listed is maximum — actual pricing depends on minimum guarantee (usually 200-300 pax).
- Veg pricing is always lower than non-veg — clarify preference early.
- Peak wedding season (Oct-Feb) means higher prices and limited availability — book 3-6 months ahead.
- Some venues have "no outside caterer" policy — in-house catering is mandatory.
- Alcohol/corkage charges are separate and can be significant — always ask.
- ShaadiSaga may redirect to venue's own booking page — handle tab switching if needed.
- Use `confirm_action` for booking review, `collect_payment` for checkout. WAIT for user response.
