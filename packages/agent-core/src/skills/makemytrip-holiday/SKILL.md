---
name: makemytrip-holiday
description: Book holiday packages on MakeMyTrip — flights+hotel combos, domestic/international tours, customizable and group packages.
triggers:
  - makemytrip holiday
  - mmt holiday
  - makemytrip holiday package
  - mmt tour package
  - makemytrip vacation
  - book holiday on makemytrip
  - mmt flight hotel combo
  - makemytrip international package
siteUrl: https://www.makemytrip.com
requiresAuth: true
params:
  - name: destination
    required: true
    hint: Destination (e.g. "Goa", "Dubai", "Maldives", "Kerala", "Europe")
  - name: departureCity
    required: true
    hint: Departure city (e.g. "Mumbai", "Delhi", "Bangalore", "Kolkata")
  - name: travelDate
    required: true
    hint: Travel date or month (e.g. "April 15", "May 2026", "next month")
  - name: travellers
    required: false
    hint: Number of travellers (e.g. "2 adults", "couple", "family of 4 with 1 child")
  - name: nights
    required: false
    hint: Number of nights (e.g. "3 nights", "5N/6D", "1 week")
  - name: budget
    required: false
    hint: Budget per person in INR (e.g. "under 50000", "30-40K", "luxury")
---

# MakeMyTrip Holiday Package Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Holiday Requirements
- Confirm destination, departure city, travel date/month. If any missing, use `ask_user`.
- Ask about package type: flight+hotel combo, group tour, customizable, honeymoon, family, adventure.
- Note number of travellers (adults, children with ages, infants).
- Note preferred duration (nights), budget per person, hotel star rating preference.
- Ask about specific interests: beach, adventure, sightseeing, relaxation, nightlife, shopping.
- Convert relative dates to actual dates.

### 2. Open MakeMyTrip Holidays & Verify Login
- Open a NEW tab and navigate to `https://www.makemytrip.com/holidays-india/` (domestic) or `https://www.makemytrip.com/holidays-international/` (international).
- Take snapshot. Close any popups (app install, login, promotional banners, chat widgets).
- Verify logged in (profile icon or name visible in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search Holiday Packages
- Search for destination or browse destination-specific holiday page.
- Set departure city, travel dates/month.
- Set number of travellers.
- Filter by duration if specified.
- Click "Search" or browse available packages.
- Take snapshot of package listings.

### 4. Filter & Present Options
- Apply filters: budget range, duration, package type (flight+hotel/guided tour/customizable), hotel star rating (3/4/5 star), theme (honeymoon/family/adventure).
- Sort by price, popularity, or rating.
- Extract top 4-5 packages with: package name, duration (nights/days), flights included, hotel name & star rating, meals, sightseeing, transfers, price per person.
- Check for MMT SuperSaver deals and bank offers.
- Use `ask_user` (input_type "choice") to present options. Format:
  "Goa Beach Getaway 3N/4D — Flights+4* Resort+Breakfast+Transfers — Rs XX,XXX/person"
- Add "Customize a package" and "Show more" as options.

### 5. Review Package Details
- Click selected package. Take snapshot of full itinerary.
- Present day-by-day itinerary highlights.
- Note: hotel name, room type, star rating, meal plan, included sightseeing/activities, transfers, free time.
- Show what is included vs excluded clearly.
- Use `ask_user` to confirm or ask about upgrades (room upgrade, extra activities, premium hotel, travel insurance).

### 6. Customize Package (if requested)
- If user wants modifications: change hotel, add/remove activities, extend duration, upgrade room.
- MMT allows customization on many packages -- adjust and take snapshot of updated package.
- Show price difference for modifications.
- Confirm final package with user via `ask_user`.

### 7. Review & Confirm Booking
- Proceed to booking page. Take snapshot.
- Use `confirm_action` to present booking summary:
  - Package name, destination
  - Duration (nights/days)
  - Departure city, travel dates
  - Flight details (airline, times) if included
  - Hotel details (name, star rating, room type)
  - Inclusions: flights, transfers, meals, sightseeing, insurance
  - Exclusions: items NOT included
  - Price breakdown: per person, flight cost, hotel cost, activities, taxes, discount
  - Grand total for all travellers
  - Cancellation/refund policy
  - Payment terms
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 8. Fill Traveller Details & Payment
- Fill traveller details: full name (as on ID/passport), date of birth, gender, passport number (international), contact email, phone.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with package, destination, dates, travellers, flights, hotel, inclusions, price breakdown, total
  - amount_inr: total amount or advance payment (number)
  - description: "MakeMyTrip holiday package"
- STOP and WAIT for payment confirmation.

### 9. Complete Booking & Confirm
- Complete payment on MakeMyTrip (UPI/card/netbanking/EMI/MMT wallet).
- Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: booking reference ID, package name, destination, dates, flights, hotel, travellers, total paid, balance due (if partial).
- Mention: "MakeMyTrip will send detailed vouchers via email. Carry printouts of hotel and flight confirmations. Ensure passport validity of 6+ months for international trips."

## Site Notes

- MakeMyTrip is India's largest OTA, offering extensive holiday packages for both domestic and international destinations.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- MMT shows aggressive popups on load (app download, login, holiday offers) -- dismiss all immediately.
- "MMT Luxe" packages offer premium stays at luxury properties -- mention for high-budget users.
- Bank offers (HDFC, ICICI, Axis, SBI) give 10-15% instant discount or EMI options -- always check.
- Flight+Hotel combos are often 20-30% cheaper than booking separately -- highlight this saving.
- Customizable packages let users mix hotels, activities, and durations -- powerful feature for picky travellers.
- EMI options (0% EMI on select banks) are available for high-value packages -- mention if user asks.
- Prices are per person on twin sharing. Single supplement charges apply for solo travellers.
- MMT wallet (MyWallet) balance can be applied at checkout -- check and mention.
- Holiday packages may require advance payment (25-50%) with balance due before travel -- clarify terms.
- Session can expire if idle too long -- if redirected to login, stop and inform user.
- Use `confirm_action` for booking review, `collect_payment` for payment. WAIT for user response.
