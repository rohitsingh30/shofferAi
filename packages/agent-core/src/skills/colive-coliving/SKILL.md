---
name: colive-coliving
description: Book coliving spaces on CoLive — shared apartments, private rooms with community amenities.
triggers:
  - colive
  - colive coliving
  - colive apartment
  - colive room
  - colive booking
  - colive shared
  - coliving space
  - colive bangalore
siteUrl: https://www.colive.com
requiresAuth: true
params:
  - name: city
    required: true
    hint: City or locality (e.g. "Bangalore", "Whitefield", "Hyderabad Gachibowli")
  - name: budget
    required: false
    hint: Monthly rent budget (e.g. "under 12000", "8k-18k")
  - name: room_type
    required: false
    hint: Single, double, triple sharing, or studio (default "single")
  - name: gender
    required: false
    hint: Male, female, or co-living
  - name: move_in
    required: false
    hint: Preferred move-in date
---

# CoLive Coliving Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm city/locality, room type, gender preference, budget. Use `ask_user` for missing info.
- Note move-in date and expected stay duration.
- Ask about must-have amenities: AC, meals, gym, laundry, parking, gaming zone.
- Clarify: CoLive is a tech-enabled coliving brand — all properties are fully furnished and managed.

### 2. Open CoLive & Verify Login
- Open a NEW tab and navigate to `https://www.colive.com`.
- Take snapshot. Close any promotional popups or banners.
- Verify logged in (profile icon or user name in header/navigation).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search Properties
- Select city from dropdown or enter locality in search bar.
- Apply room type filter: single, double, triple, studio.
- Apply gender filter if applicable.
- Set budget range if specified.
- Click "Search" or "Explore Properties".
- Take snapshot of results.

### 4. Filter & Present Options
- Filter by amenities: AC, meals, gym, WiFi, power backup, housekeeping.
- Filter by proximity to tech parks (Whitefield, Electronic City, Manyata) if user mentions work location.
- Sort by price or popularity.
- Extract top 5 options: property name, locality, room type, rent/month, deposit, amenities, community features, rating.
- Use `ask_user` (input_type "choice"): "CoLive Property Name — Single Room — ₹XX,XXX/month — Deposit ₹XX,XXX — Locality — [AC, Gym, Meals, WiFi]"

### 5. Property Details & Review
- Click selected property. Take snapshot of detail page.
- Extract: full address, room photos, common areas (lounge, gym, terrace, gaming), furniture list, nearby landmarks.
- Check community events and social features — CoLive's differentiator.
- Use `confirm_action` with booking summary:
  - Property name and full address
  - Room type and sharing configuration
  - Monthly rent and what it includes
  - Security deposit (typically 1-2 months)
  - One-time move-in/registration fee
  - Included services: housekeeping, WiFi, meals (if applicable), laundry
  - Community amenities: gym, lounge, gaming, events
  - Lock-in period and notice period
  - House rules: guest policy, curfew, noise policy
  - CoLive app features (maintenance requests, community chat)
- Do NOT proceed unless user confirms.

### 6. Book & Payment
- Click "Book Now" or "Reserve" button.
- Fill tenant details: name, phone, email, work details from operator profile.
- Use `collect_payment`:
  - summary: JSON with property name, room type, rent, deposit, move-in fee, total first payment
  - amount_inr: first month rent + deposit + registration fee
  - description: "CoLive coliving space booking"
- WAIT for payment confirmation.

### 7. Final Confirmation
- Complete booking and payment on CoLive.
- Handle OTP via `ask_user` if needed.
- Take snapshot of booking confirmation.
- Report: booking ID, property name, full address, room number, move-in date, monthly rent, deposit paid, CoLive support contact, move-in instructions, CoLive app download link.

## Site Notes

- CoLive is a Bangalore-based coliving startup with 5000+ beds across Bangalore, Hyderabad, Chennai, Pune.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) must be logged in. Do NOT ask user for credentials.
- CoLive heavily focuses on the community aspect — events, movie nights, game tournaments. Mention this to users.
- All properties are fully furnished with bed, wardrobe, study table, WiFi, housekeeping — no setup needed.
- Deposit is typically 1-2 months (lower than traditional Bangalore rentals) — highlight this advantage.
- CoLive has a proprietary app for maintenance requests, rent payments, community features — mention app.
- Meal plans may or may not be included — varies by property. Always check and mention.
- Lock-in period is usually 3 months with 1 month notice — shorter than NestAway or traditional rentals.
- CoLive properties are concentrated near IT corridors: Whitefield, Electronic City, Marathahalli, ORR.
- Session cookies expire after ~14 days. Profile 3 should stay logged in.
- Use `confirm_action` for booking review, `collect_payment` for checkout. WAIT for user response.
