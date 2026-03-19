---
name: thomascook-holiday
description: Book holiday packages on Thomas Cook India — international/domestic tour packages, flights+hotel combos, guided tours, custom itineraries.
triggers:
  - thomas cook holiday
  - thomas cook tour
  - book holiday on thomas cook
  - thomas cook package
  - thomas cook vacation
  - thomascook holiday
  - thomas cook international tour
  - thomas cook india trip
siteUrl: https://www.thomascook.in
requiresAuth: true
params:
  - name: destination
    required: true
    hint: Destination (e.g. "Switzerland", "Bali", "Kerala", "Europe")
  - name: departureCity
    required: true
    hint: Departure city (e.g. "Mumbai", "Delhi", "Bangalore")
  - name: travelMonth
    required: true
    hint: Travel month or dates (e.g. "April 2026", "June first week", "2026-05-15")
  - name: travellers
    required: false
    hint: Number of travellers and type (e.g. "2 adults 1 child", "couple", "family of 4")
  - name: budget
    required: false
    hint: Budget per person in INR (e.g. "under 80000", "1-1.5 lakh")
  - name: packageType
    required: false
    hint: Package type preference (e.g. "group tour", "customizable", "honeymoon", "family")
---

# Thomas Cook India Holiday Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Holiday Requirements
- Confirm destination, departure city, travel month. If any missing, use `ask_user`.
- Ask about trip type: group tour vs customizable, honeymoon vs family vs adventure.
- Note number of travellers (adults, children with ages, infants).
- Note budget preference per person if specified.
- Ask about visa requirements -- Thomas Cook offers visa services for international trips.
- Convert relative dates to specific month/dates.

### 2. Open Thomas Cook & Verify Login
- Open a NEW tab and navigate to `https://www.thomascook.in/holidays`.
- Take snapshot. Dismiss any popups (enquiry forms, chat widgets, promotional banners).
- Verify logged in (profile name or "My Account" visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search Holiday Packages
- Select destination from search/browse interface.
- Set departure city.
- Set travel month or date range.
- Set number of travellers.
- Click "Search" or browse destination packages page.
- Take snapshot of package listings.

### 4. Filter & Present Options
- Apply filters: budget range, duration (nights), package type (group/customizable), theme (honeymoon/adventure/family).
- Sort by price or popularity based on user preference.
- Extract top 4-5 packages with: package name, duration (nights/days), inclusions (flights, hotels, meals, sightseeing), cities covered, price per person, star rating.
- Note what is included: flights, visa, insurance, meals (breakfast/all meals), transfers, sightseeing.
- Use `ask_user` (input_type "choice") to present options. Format:
  "Swiss Delight 6N/7D — Zurich-Interlaken-Lucerne — Flights+4* Hotels+Breakfast+Transfers — Rs X,XX,XXX/person"
- Add "Show more packages" as last option.

### 5. Review Package Details
- Click selected package. Take snapshot of detailed itinerary.
- Present day-by-day itinerary highlights to user.
- Note: hotel names and star ratings, meal plan, sightseeing included vs optional, free time.
- Use `ask_user` to confirm or ask about optional add-ons (room upgrade, extra excursions, travel insurance).

### 6. Review & Confirm Booking
- Proceed to booking page. Take snapshot.
- Use `confirm_action` to present booking summary:
  - Package name, destination
  - Duration (nights/days)
  - Departure city, departure date
  - Cities covered, day-by-day overview
  - Hotel details (name, star rating, room type)
  - Inclusions: flights, transfers, meals, sightseeing, visa, insurance
  - Exclusions: items NOT included
  - Price breakdown: per person cost, total for all travellers, taxes, service charges
  - Grand total
  - Cancellation/refund policy
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 7. Fill Traveller Details & Payment
- Fill traveller details: full name (as on passport for international), date of birth, gender, passport number and expiry (international), contact email, phone.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with package, destination, dates, travellers, inclusions, price breakdown, total
  - amount_inr: total amount or advance payment amount (number)
  - description: "Thomas Cook holiday package"
- STOP and WAIT for payment confirmation.

### 8. Complete Booking & Confirm
- Complete payment on Thomas Cook (UPI/card/netbanking/EMI).
- Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: booking reference ID, package name, destination, dates, travellers, total paid, balance due (if partial payment).
- Mention: "Thomas Cook will send detailed itinerary via email. Ensure passport validity of 6+ months for international trips."

## Site Notes

- Thomas Cook India is a premier travel company for international and domestic holiday packages with 140+ years legacy.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Thomas Cook shows enquiry popups and chat widgets frequently -- dismiss all immediately.
- Packages often require advance payment (25-50%) with balance due 30 days before departure -- clarify payment terms.
- Thomas Cook offers visa assistance for international destinations -- mention if relevant.
- Group tours have fixed departure dates -- check availability before committing. Customizable packages are flexible.
- EMI options available on many packages via bank partnerships -- mention if user asks about payment flexibility.
- Travel insurance is usually optional but strongly recommended for international trips -- ask user preference.
- Prices are per person on twin sharing basis. Single supplement charges apply for solo travellers.
- Thomas Cook has physical offices for document submission (passport, visa) -- share nearest office if needed.
- Session may expire during long browsing -- if redirected to login, stop and inform user.
- Use `confirm_action` for booking review, `collect_payment` for payment. WAIT for user response.
