---
name: stanza-living
description: Book student and working professional stays on Stanza Living — managed PG, co-living residences.
triggers:
  - stanza living
  - stanza
  - stanza pg
  - stanza room
  - stanza booking
  - stanza student
  - stanza coliving
  - stanza professional
siteUrl: https://www.stanzaliving.com
requiresAuth: true
params:
  - name: city
    required: true
    hint: City or locality (e.g. "Delhi", "Noida Sector 62", "Bangalore Koramangala")
  - name: budget
    required: false
    hint: Monthly rent budget (e.g. "under 10000", "7k-15k")
  - name: occupancy
    required: false
    hint: Single, double, triple occupancy (default "double")
  - name: gender
    required: false
    hint: Male or female
  - name: tenant_type
    required: false
    hint: Student or working professional
---

# Stanza Living Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm city/locality, occupancy preference, gender, budget. Use `ask_user` for missing info.
- Ask if student or working professional — Stanza has separate residences for each.
- Note move-in date and expected stay duration (semester-wise for students).
- Ask about meal preference (veg/non-veg), must-have amenities (AC, gym, study room).
- If student, ask about college/university name for proximity-based search.

### 2. Open Stanza Living & Verify Login
- Open a NEW tab and navigate to `https://www.stanzaliving.com`.
- Take snapshot. Close any promotional popups, chat widgets, or app-download banners.
- Verify logged in (profile icon, name, or "My Account" visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search Residences
- Select city from the homepage or navigation.
- Enter locality, landmark, or college name in search bar. Select from suggestions.
- Choose tenant type: "Student" or "Young Professional" if filter available.
- Apply gender filter (male/female residence).
- Click "Search" or "Explore Residences".
- Take snapshot of results page.

### 4. Filter & Present Options
- Apply budget range filter if specified.
- Filter by occupancy type: single, double, triple.
- Filter by amenities: AC, meals, gym, WiFi, study room, laundry.
- Sort by price or distance from college/office.
- Extract top 5 options: residence name, locality, occupancy type, rent/month, deposit, included meals, amenities, Stanza rating, distance from landmark.
- Use `ask_user` (input_type "choice"): "Stanza Residence Name — Double Occupancy — ₹XX,XXX/month — Meals Included — Locality — [AC, Gym, WiFi]"

### 5. Residence Details & Review
- Click selected residence. Take snapshot of detail page.
- Extract: full address, room photos, common areas, dining area, study zone, recreation.
- Check meal plan: number of meals/day, veg/non-veg options, meal timings.
- Check Stanza Living's managed services: biometric entry, CCTV, warden, laundry schedule.
- Use `confirm_action` with booking summary:
  - Residence name and full address
  - Room type and occupancy (single/double/triple)
  - Monthly rent and what it includes
  - Security deposit amount
  - One-time registration/move-in fee
  - Meal plan: meals per day, veg/non-veg, timings
  - Included services: housekeeping, WiFi, laundry, power backup
  - Common amenities: gym, study room, recreation, terrace
  - Security: biometric, CCTV, warden
  - Lock-in period and refund policy
  - House rules: curfew timing, guest policy, alcohol policy
- Do NOT proceed unless user confirms.

### 6. Book & Payment
- Click "Book Now" or "Reserve Bed" button.
- Fill tenant details: name, phone, email, ID proof, college/company from operator profile.
- Use `collect_payment`:
  - summary: JSON with residence name, room type, rent, deposit, registration fee, meal plan, total
  - amount_inr: first month rent + deposit + registration fee
  - description: "Stanza Living residence booking"
- WAIT for payment confirmation.

### 7. Final Confirmation
- Complete booking on Stanza Living.
- Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: booking ID, residence name, full address, room/bed number, move-in date, monthly rent, deposit paid, meal plan, warden contact, Stanza app download, move-in checklist.

## Site Notes

- Stanza Living is India's largest managed accommodation provider for students and young professionals with 75,000+ beds.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) must be logged in. Do NOT ask user for credentials.
- Stanza has two distinct segments: "Student Housing" (near colleges) and "Professional Housing" (near IT hubs) — route correctly.
- All residences include meals (3 meals/day typically), WiFi, housekeeping — this is standard, not premium.
- Stanza's "Resident App" is central to the experience: meal booking, maintenance, events, community — mention it.
- Deposit is typically 1 month rent — significantly lower than market. Highlight this benefit.
- Lock-in is usually 3-6 months for professionals, semester-based for students — clarify early exit penalty.
- Stanza operates in 24+ cities: Delhi NCR, Bangalore, Pune, Hyderabad, Chennai, Jaipur, Indore, and more.
- Session cookies on Stanza Living expire after ~21 days. Profile 3 should stay logged in.
- Use `confirm_action` for booking review, `collect_payment` for checkout. WAIT for user response.
