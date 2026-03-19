---
name: trivago-compare
description: Compare hotel prices across booking sites on Trivago — find cheapest deal, redirect to best site, book.
triggers:
  - trivago compare
  - compare hotel prices
  - trivago hotel
  - cheapest hotel deal
  - trivago search
  - hotel price comparison
  - trivago find hotel
  - best hotel price
siteUrl: https://www.trivago.in
requiresAuth: false
params:
  - name: destination
    required: true
    hint: City or area (e.g. "Jaipur", "Shimla", "Dubai")
  - name: checkin
    required: true
    hint: Check-in date
  - name: checkout
    required: true
    hint: Check-out date
  - name: guests
    required: false
    hint: Number of guests
  - name: budget
    required: false
    hint: Maximum budget per night
---

# Trivago Hotel Price Comparison

Chrome profile: rsinghtomar3011@gmail.com. No login required for Trivago (aggregator).

## Steps

### 1. Gather Requirements
- Check if user specified destination, dates, and preferences.
- If destination missing, use `ask_user` (input_type "freetext"): "Which city or area do you want to find the best hotel deal for?"
- If dates missing, use `ask_user` (input_type "freetext"): "What are your check-in and check-out dates?"
- Default to 2 adults if not specified.
- Note: budget, star rating, amenities, location preferences.

### 2. Open Trivago
- Open a NEW tab and navigate to `https://www.trivago.in`.
- Take a snapshot to verify page loaded.
- Trivago does not require login — it's a price comparison aggregator.
- Accept cookies/popups if shown.

### 3. Search Hotels
- Fill search: destination, check-in, check-out, rooms, guests.
- Click search.
- Wait for results to load with prices from multiple sites.
- Take snapshot of results.
- Apply filters: price range, star rating, distance, guest rating, amenities.
- Sort by user preference (price, rating, distance).

### 4. Compare & Select Hotel
- Take snapshot of top results showing prices from different sites.
- Present top 5 hotels using `ask_user` (input_type "choice"):
  - Hotel name, stars, rating, cheapest price, which site offers it, other site prices
- User selects preferred hotel.
- Click on hotel for detail view.
- Take snapshot showing all deal sources with prices.

### 5. Compare Deals for Selected Hotel
- Take snapshot of all available deals (Booking.com, MakeMyTrip, Agoda, etc.).
- Present price comparison using `ask_user` (input_type "choice"):
  - Each booking site: price, free cancellation?, breakfast included?, payment terms
  - Highlight the cheapest and best-value options
- User selects preferred booking site/deal.
- Click "View Deal" to redirect to the booking site.

### 6. Complete Booking on Redirect Site
- Take snapshot of the redirected booking site.
- Check if logged in on the redirected site.
- If not logged in, inform user which site we're on and check Chrome Debug sessions.
- Fill booking details: dates (pre-filled from Trivago), guest info from operator profile.
- Take snapshot of booking summary.
- Use `confirm_action` to present final booking summary:
  - Hotel, room type, dates, nights
  - Price from this booking site, taxes, total
  - Cancellation policy, meal plan
- Do NOT proceed unless user confirms.

### 7. Checkout & Payment
- Click proceed to payment on the booking site.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with hotel, booking site, room, dates, price breakdown, total
  - amount_inr: total amount (number)
  - description: "Hotel booking via Trivago comparison"
- STOP and WAIT for payment confirmation.
- Only proceed if payment confirmed.

### 8. Complete & Confirm
- Complete booking on the redirected site.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: booking ID, hotel, booking site used, room, dates, total paid, savings vs other sites.

## Site Notes

- Trivago is a price aggregator — it compares prices but does NOT book directly.
- Clicking "View Deal" redirects to the actual booking site (Booking.com, MakeMyTrip, etc.).
- The cheapest deal may not always be the best — consider cancellation policy and meal plans.
- No login needed on Trivago itself, but login may be needed on the redirected booking site.
- Operator Chrome Profile 3 may be logged in on common booking sites.
- Trivago uses React — wait for price comparisons to fully load (can take a few seconds).
- Prices shown on Trivago may differ slightly on the booking site — verify before confirming.
- "Our recommendation" badge means Trivago's best value pick — not always cheapest.
- Use `confirm_action` for booking review (no money), `collect_payment` for actual payment.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
- Always report how much user saved vs other booking sites.
