---
name: booking-hotel
description: Search and book hotels on Booking.com — compare prices, select rooms, fill guest details, handle payment.
triggers:
  - book hotel
  - hotel booking
  - booking.com
  - find hotel
  - hotel in
  - stay in
  - accommodation
  - book a room
  - reserve hotel
  - hotel for
  - find a stay
  - need a hotel
  - hotel near
  - resort in
  - homestay in
siteUrl: https://www.booking.com
requiresAuth: true
params:
  - name: destination
    required: true
    hint: City or area name (e.g. "Goa", "Mumbai", "Paris")
  - name: checkin
    required: true
    hint: Check-in date (YYYY-MM-DD or "tomorrow", "this weekend", "March 20")
  - name: checkout
    required: true
    hint: Check-out date (YYYY-MM-DD or duration "2 nights", "3 days")
  - name: guests
    required: false
    hint: Number of guests (default 2 adults)
  - name: budget
    required: false
    hint: Max price per night in INR (e.g. "under 4000", "budget 5k")
---

# Booking.com Hotel Booking

Today's date: use JavaScript `new Date().toISOString().split('T')[0]` to resolve "tomorrow", "this weekend", etc.
Chrome profile: rsinghtomar3011@gmail.com (Genius Level 1 member).

## Steps

### 1. Gather ALL Requirements Upfront
- Check what the user already provided: destination, check-in date, check-out date, guests, budget.
- If ANY required params are missing, use ONE SINGLE `ask_user` call to collect ALL missing info at once.
  Example (if destination + dates missing): "I need a few details to search for hotels:\n• Destination (city or area, e.g. Goa, Mumbai)\n• Check-in date (e.g. 22 March)\n• Check-out date (e.g. 24 March)\n• Number of guests (default: 2 adults)\n• Max budget per night (optional, e.g. under ₹4000)"
- Do NOT ask one question at a time. Ask everything in a single prompt.
- Default guests to 2 adults if not specified. Skip budget filtering if not specified.
- Parse natural dates: "this weekend" = upcoming Saturday + Sunday, "tomorrow" = next day.

### 2. Navigate & Dismiss Popups
- Open a NEW tab and navigate to `https://www.booking.com`
- Take a snapshot to see the landing page.
- A "Genius — Sign in, save money" popup WILL appear. Click the X/close button (aria-label="Dismiss sign-in info") to dismiss.
- A cookie consent banner may appear. Click "Accept" (id="onetrust-accept-btn-handler").
- Verify you can see the search bar. Take a snapshot.

### 3. Verify Authentication
- Look at the top-right header for a profile avatar/name.
- If signed in: proceed (Genius discounts active).
- If NOT signed in: Click "Sign in" → "Continue with Google" → select rsinghtomar3011@gmail.com.
- If CAPTCHA or 2FA appears, use `ask_user`: "Please complete sign-in in the browser. Type 'done' when finished."
- **If you see a login page or wrong account, STOP and tell the user: "Session expired, please re-login in Chrome Debug."**

### 4. Search Hotels
- Navigate directly to search URL:
  `https://www.booking.com/searchresults.html?ss={destination}&checkin={checkin}&checkout={checkout}&group_adults={guests}&no_rooms=1&group_children=0`
- Take a snapshot. Dismiss any popups (sign-in info, cookies, map overlay).
- Verify property cards are visible (`data-testid="property-card"`).

### 5. Present Top Options
- Extract 3-5 best hotels with: name (`data-testid="title"`), price (`data-testid="price-and-discounted-price"`), review score, location, free cancellation, Genius discount.
- Use `ask_user` (input_type "choice") to present options. Format: "Hotel Name — ₹X,XXX/night — Rating — Location"
- Add "Show more results" as last option.

### 6. View Hotel Details
- Click selected hotel's "See availability" link.
- Handle new tab if opened. Dismiss popups.
- Extract room options: type, bed config, price, inclusions, cancellation policy.
- Use `ask_user` (input_type "choice") for room selection.

### 7. Start Booking
- Click "I'll reserve" button for the selected room.
- Fill empty required fields:
  - First name, last name: from userContext.name
  - Email: from userContext.email
  - Phone: use `fill_saved_credential`
- Click "Next: Final details" to proceed.

### 8. Payment
- Extract total amount, breakdown (room, taxes, fees).
- Use `confirm_action`: "Complete hotel booking payment" with full details.
- If declined, stop and report cancellation.
- For saved card: fill CVV only via `fill_saved_credential`.
- For new card: fill all fields via `fill_saved_credential`.
- Click "Complete Booking".
- If 3DS/OTP appears: use `ask_user` (input_type "otp") for bank verification.

### 9. Confirm Booking
- Take snapshot. Look for confirmation page.
- Extract: confirmation number, hotel name, dates, total paid, cancellation policy.
- Report full details to user.
- If booking failed, report error and suggest next steps.

## Site Notes

- Genius popup appears on EVERY fresh page load — dismiss immediately.
- Cookie consent: `#onetrust-accept-btn-handler`.
- Chrome profile (rsinghtomar3011@gmail.com) preserves login across runs.
- Signed-in users get Genius discounts (10%+ off).
- Currency shows based on IP geolocation (usually INR from India).
- Stable selectors: `[data-testid="property-card"]`, `[data-testid="title"]`, `[data-testid="price-and-discounted-price"]`.
- Hotel detail page may open in new tab — handle tab switching.
- Saved cards only need CVV.
- Free cancellation shown in green text near price.
- Some hotels show "Pay at property" — prefer if no card added.
- Watch for hidden fees (resort, cleaning) at checkout.
- If sold out at checkout, go back and pick another.
- 3DS/OTP verification in iframe — wait for load.
- Reserve button says "I'll reserve" (not "Reserve").
- "Next: Final details" (not "Continue").
