---
name: sotc-holiday
description: Book group tours on SOTC — international packages, fixed departures, guided tours, flights+hotels+sightseeing combos.
triggers:
  - sotc holiday
  - sotc tour
  - book holiday on sotc
  - sotc package
  - sotc group tour
  - sotc international tour
  - sotc travel package
  - sotc vacation
siteUrl: https://www.sotc.in
requiresAuth: true
params:
  - name: destination
    required: true
    hint: Destination (e.g. "Europe", "Dubai", "Bali", "Rajasthan")
  - name: departureCity
    required: true
    hint: Departure city (e.g. "Mumbai", "Delhi", "Bangalore", "Chennai")
  - name: travelMonth
    required: true
    hint: Travel month or date range (e.g. "May 2026", "June-July", "2026-04-20")
  - name: travellers
    required: false
    hint: Number of travellers (e.g. "2 adults", "couple", "family of 4 with 2 kids")
  - name: budget
    required: false
    hint: Budget per person in INR (e.g. "under 1 lakh", "1.5-2 lakh")
  - name: tourType
    required: false
    hint: Tour type (e.g. "group tour", "customizable", "honeymoon", "adventure", "luxury")
---

# SOTC Holiday Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Holiday Requirements
- Confirm destination, departure city, travel month. If any missing, use `ask_user`.
- Ask about tour type: group tour (fixed departure) vs customizable, honeymoon vs family vs adventure vs luxury.
- Note number of travellers (adults, children with ages, senior citizens).
- Note budget preference per person if specified.
- Ask about specific interests: cultural, adventure, beach, shopping, wildlife.
- Convert relative dates to specific month/dates.

### 2. Open SOTC & Verify Login
- Open a NEW tab and navigate to `https://www.sotc.in/holidays`.
- Take snapshot. Dismiss any popups (enquiry forms, chat widgets, WhatsApp prompts, offer banners).
- Verify logged in (profile or "My Account" visible in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search Holiday Packages
- Use destination search or browse by region (Europe, Southeast Asia, etc.).
- Set departure city.
- Set travel month or date range.
- Set number of travellers.
- Click "Search" or browse the destination packages page.
- Take snapshot of package listings.

### 4. Filter & Present Options
- Apply filters: budget range, duration (nights), tour type (group/customizable), theme (honeymoon/adventure/luxury), departure dates.
- Sort by price, popularity, or departure date.
- Extract top 4-5 packages with: tour name, duration (nights/days), cities covered, inclusions (flights, hotels, meals, sightseeing), departure date, price per person.
- Note SOTC specialities: tour manager accompanies group, all transfers included, no hidden costs.
- Use `ask_user` (input_type "choice") to present options. Format:
  "Enchanting Europe 8N/9D — Paris-Zurich-Rome — Flights+4* Hotels+Meals+Sightseeing — Dep Apr 15 — Rs X,XX,XXX/person"
- Add "Show more packages" as last option.

### 5. Review Package Details
- Click selected package. Take snapshot of detailed itinerary.
- Present day-by-day itinerary highlights to user.
- Note: hotel names and star ratings, meal plan (breakfast/half board/full board), included excursions, optional tours with pricing.
- Use `ask_user` to confirm package or ask about upgrades (room type, optional excursions, insurance).

### 6. Check Fixed Departure Dates
- SOTC group tours have fixed departure dates. Present available departure dates.
- Use `ask_user` (input_type "choice") to let user pick departure date.
- Note group size limits -- some tours sell out fast.

### 7. Review & Confirm Booking
- Proceed to booking page. Take snapshot.
- Use `confirm_action` to present booking summary:
  - Tour name, destination, duration
  - Departure city and date
  - Cities covered, day-by-day overview
  - Hotel details (name, star rating, room type)
  - Inclusions: flights, transfers, meals, sightseeing, tour manager, visa (if applicable)
  - Exclusions: items NOT included
  - Optional add-ons selected
  - Price breakdown: per person cost, total for all travellers, taxes, GST
  - Grand total
  - Payment schedule (advance + balance due date)
  - Cancellation/refund policy
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 8. Fill Traveller Details & Payment
- Fill traveller details: full name (as on passport for international), date of birth, gender, passport number and expiry (international), contact email, phone.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with tour name, destination, departure date, travellers, inclusions, price breakdown, total
  - amount_inr: advance payment amount (number)
  - description: "SOTC holiday package"
- STOP and WAIT for payment confirmation.

### 9. Complete Booking & Confirm
- Complete payment on SOTC (UPI/card/netbanking/EMI).
- Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: booking reference ID, tour name, destination, departure date, travellers, amount paid, balance due date.
- Mention: "SOTC will send detailed itinerary and documents checklist via email. Ensure passport has 6+ months validity for international trips."

## Site Notes

- SOTC (a Thomas Cook group company) is India's leading outbound tour operator with 70+ years of experience.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- SOTC shows enquiry popups, WhatsApp chat widgets, and callback forms -- dismiss all immediately.
- Group tours have fixed departure dates with limited seats -- check availability early.
- SOTC requires advance payment (25-50%) to confirm booking; balance is due 30-45 days before departure.
- "SOTC Signature" tours are premium small-group experiences with higher-end hotels and exclusive access.
- Visa processing for international tours is often handled by SOTC -- confirm inclusion in package.
- EMI options (0% EMI on select banks) available for package payments -- mention if user asks.
- Prices are per person on twin sharing basis. Single occupancy supplement applies for solo travellers.
- SOTC has 100+ offices across India for in-person document submission and consultation.
- Session may expire during long browsing -- if redirected to login, stop and inform user.
- Use `confirm_action` for booking review, `collect_payment` for payment. WAIT for user response.
