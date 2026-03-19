---
name: urbancompany-salon
description: Book women's salon at home on Urban Company. Facial, waxing, manicure, pedicure, haircut, bridal makeup.
triggers:
  - salon at home
  - book salon
  - women salon at home
  - facial at home
  - waxing at home
  - manicure at home
  - pedicure at home
  - haircut at home
  - bridal makeup at home
  - urban company salon
  - urbanclap salon
  - beauty service at home
siteUrl: https://www.urbancompany.com
requiresAuth: true
params:
  - name: service
    required: true
    hint: Specific salon service (e.g. "facial", "full body waxing", "manicure pedicure", "bridal makeup", "haircut")
  - name: date
    required: false
    hint: Preferred date (e.g. "today", "tomorrow", "Saturday", "March 20")
  - name: time
    required: false
    hint: Preferred time slot (e.g. "morning", "2 PM", "evening")
---

# Urban Company — Women's Salon at Home

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine the exact salon service(s) needed. Common services:
  - **Facials**: fruit facial, gold facial, diamond facial, cleanup, de-tan
  - **Waxing**: full arms, full legs, underarms, full body, bikini
  - **Manicure & Pedicure**: classic, spa, gel, luxury
  - **Hair**: haircut, blow-dry, straightening, smoothening, hair color, hair spa
  - **Threading & Bleach**: eyebrows, upper lip, full face threading, face bleach
  - **Bridal**: pre-bridal packages, bridal makeup, mehendi
  - **Packages**: combos like "Facial + Wax + Mani-Pedi"
- If user says something vague like "salon", use `ask_user` to narrow down.
- Get preferred date and time slot. If not specified, ask.
- Ask if user wants a combo/package or individual services.

### 2. Open Urban Company & Verify Login
- Open a NEW tab and navigate to `https://www.urbancompany.com/salon-at-home-for-women`.
- Take snapshot. Verify location is set (city/area shown in top bar).
- If location not set or wrong, set it to user's area.
- Verify logged in (profile icon visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Browse & Select Services
- Browse the salon category page. Navigate to the specific service section.
- Take snapshot of available services/packages.
- Extract options with: service name, description, price, duration, rating, what's included.
- Packages are often better value than individual services — recommend if applicable.
- Use `ask_user` (input_type "choice") to pick service(s):
  - "Gold Facial — ₹XXX — 60 min — Includes cleansing, scrub, gold gel, mask, moisturizer"
  - "Full Body Wax (Rica) — ₹XXX — 90 min — Arms + legs + underarms + bikini line"
  - "Mani-Pedi Combo — ₹XXX — 75 min — Classic manicure + pedicure with polish"
- If user wants multiple services, add each to cart.

### 4. Review Cart & Confirm
- Take snapshot of cart with all selected services.
- Use `confirm_action` with booking summary:
  - Service(s) selected with individual prices
  - Package discount (if applicable)
  - Total price
  - Estimated total duration
  - Products/materials included (UC professionals bring their own kit)
  - Any add-ons recommended (e.g., wax strip upgrade, premium products)
- Do NOT proceed unless user confirms.

### 5. Select Date & Time
- Navigate to scheduling page.
- Choose preferred date from calendar.
- Choose time slot:
  - Morning: 8 AM — 12 PM
  - Afternoon: 12 PM — 4 PM
  - Evening: 4 PM — 8 PM
  - Or specific time if available.
- If preferred slot is full, show next available alternatives.
- Confirm slot with user via `ask_user`.

### 6. Payment & Book
- Fill/verify address if not already set.
- Use `collect_payment`:
  - summary: JSON with services, date, time_slot, duration, total
  - amount_inr: total amount
  - description: "Urban Company women's salon at home"
- WAIT for payment confirmation from user.

### 7. Confirm Booking
- Complete payment on Urban Company (UPI / card / net banking).
- Handle OTP via `ask_user` if needed.
- Take snapshot of booking confirmation page.
- Report to user: booking ID, service(s) booked, professional assigned (if shown), date, time slot, address, amount paid, estimated duration.
- Mention: "The beautician will arrive at your doorstep with all products and tools. You can track via the UC app."

## Site Notes

- Urban Company is India's leading home services platform. Women's salon is their most popular category.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in. Do NOT ask user for credentials.
- UC professionals bring their own products and tools — no need for user to arrange anything.
- All UC professionals are background-verified and trained (UC Safe certification).
- Ratings 4.5+ are excellent. Professionals below 4.0 are removed by UC.
- Prices are transparent and fixed — no haggling. Tips are optional (can be added in-app after service).
- Cancellation is free up to a few hours before the slot. After that, a cancellation fee applies.
- Peak pricing may apply on weekends, holidays, and evenings — inform user if prices seem higher.
- UC Plus membership gives extra discounts and priority booking — mention if user is a frequent booker.
- Bridal services should be booked well in advance (at least 1-2 weeks) — slots fill up fast.
- Combo packages (e.g., Facial + Wax + Mani-Pedi) are almost always cheaper than booking individually — recommend when possible.
- Use `confirm_action` for review, `collect_payment` for booking. Always WAIT for user response.
