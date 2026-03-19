---
name: urbancompany-repair
description: Book AC service, repair, or installation on Urban Company. Regular service, deep clean, gas refill, by brand and type.
triggers:
  - ac service
  - ac repair
  - ac cleaning
  - ac gas refill
  - ac installation
  - book ac service
  - urban company ac
  - urbanclap ac repair
  - split ac service
  - window ac service
  - ac not cooling
  - ac deep clean
siteUrl: https://www.urbancompany.com
requiresAuth: true
params:
  - name: service_type
    required: true
    hint: Type of AC service (e.g. "regular service", "deep clean", "gas refill", "repair", "installation", "uninstallation")
  - name: ac_type
    required: false
    hint: AC type (e.g. "split AC", "window AC", "cassette AC")
  - name: brand
    required: false
    hint: AC brand (e.g. "Voltas", "Daikin", "LG", "Samsung", "Blue Star", "Hitachi")
  - name: quantity
    required: false
    hint: Number of ACs (e.g. "1", "2", "3")
  - name: date
    required: false
    hint: Preferred date (e.g. "today", "tomorrow", "Saturday")
  - name: time
    required: false
    hint: Preferred time slot (e.g. "morning", "2 PM", "evening")
---

# Urban Company — AC Service & Repair

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect service details
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **service** (type: "text", required): What service is needed
2. **address** (type: "address", required): Service location. Show saved addresses.
3. **date** (type: "calendar", collapsed, mode: "single"): Preferred date

**CRITICAL**: Do NOT open the browser without knowing the service type and address.
### 1. Gather Requirements
- Determine the exact AC service needed. Available services:
  - **Regular Service (Power Jet)**: foam cleaning of filters, condenser — routine maintenance
  - **Deep Clean**: full disassembly, chemical wash of indoor unit, coil cleaning — thorough
  - **Gas Refill (Top-up)**: refrigerant top-up when AC not cooling properly
  - **Gas Refill (Complete)**: full gas replacement with leak check
  - **Repair**: diagnose and fix specific issues (compressor, PCB, fan motor, capacitor, etc.)
  - **Installation**: new AC installation with piping, bracket, drainage
  - **Uninstallation**: remove and disconnect AC unit
- Get AC details:
  - AC type: split AC, window AC, cassette AC
  - Brand (optional but helps): Voltas, Daikin, LG, Samsung, Blue Star, Hitachi, Carrier, etc.
  - Tonnage (optional): 1 ton, 1.5 ton, 2 ton
  - Number of ACs to service
- Get preferred date and time.
- Use `ask_user` for any missing details.

### 2. Open Urban Company & Verify Login
- Open a NEW tab and navigate to `https://www.urbancompany.com/ac-service-repair`.
- Take snapshot. Verify location is set (city/area visible).
- If location not set or wrong, update to user's area.
- Verify logged in (profile icon visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Browse & Select Service
- Navigate to AC service category. Select split AC or window AC.
- Take snapshot of available services.
- Extract options with: service name, description, price, duration, rating, what's included, warranty.
- Common options:
  - "Split AC Regular Service — ₹XXX — 45-60 min — Power jet foam wash, filter clean, gas pressure check"
  - "Split AC Deep Clean — ₹XXX — 90 min — Full disassembly, chemical wash, drainage clean"
  - "Gas Refill (Top-up) — ₹XXXX — 45 min — Up to 600g refrigerant, leak check"
  - "AC Repair — ₹XXX inspection + parts — Diagnose issue, fix/replace faulty component"
  - "AC Installation — ₹XXXX — 2-3 hrs — Includes bracket, piping up to 3 ft, drainage"
- For multiple ACs, check if per-unit or combo pricing applies.
- Use `ask_user` (input_type "choice") to pick service.
- Add extras if needed (e.g., stabilizer installation, extra piping, additional unit).

### 4. Review Cart & Confirm
- Take snapshot of cart with selected service(s).
- Use `confirm_action` with booking summary:
  - Service type (regular / deep clean / gas refill / repair / installation)
  - AC type and brand
  - Number of units
  - What's included in the service
  - Duration estimate
  - Warranty on service (UC typically offers 30-day warranty)
  - Spare parts: charged extra at actuals (for repairs)
  - Total price
- Do NOT proceed unless user confirms.

### 5. Select Date & Time
- Navigate to scheduling page.
- Choose preferred date from calendar.
- Choose time slot:
  - Morning: 8 AM — 12 PM
  - Afternoon: 12 PM — 4 PM
  - Evening: 4 PM — 7 PM
- AC services are in high demand during summer (March-June) — slots may fill fast.
- If preferred slot unavailable, show alternatives.
- Confirm slot with user via `ask_user`.

### 6. Payment & Book
- Fill/verify address if not already set.
- Use `collect_payment`:
  - summary: JSON with service_type, ac_type, brand, quantity, date, time_slot, warranty, total
  - amount_inr: total amount
  - description: "Urban Company AC service/repair"
- WAIT for payment confirmation from user.

### 7. Confirm Booking
- Complete payment (UPI / card / net banking).
- Handle OTP via `ask_user` if needed.
- Take snapshot of booking confirmation page.
- Report to user: booking ID, service booked, AC type/brand, date, time slot, professional assigned (if shown), address, amount paid, warranty period.
- Mention: "The technician will arrive with tools and basic supplies. For repairs, spare parts cost extra and will be quoted before replacement. Track via UC app."

## Site Notes

- Urban Company is India's leading AC service platform — technicians are trained and background-verified.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in. Do NOT ask user for credentials.
- AC service demand peaks in summer (March-June) — book 2-3 days in advance for preferred slots.
- Regular service (power jet) is recommended every 3-4 months. Deep clean once a year.
- Gas refill is needed only if AC is not cooling — regular service usually suffices.
- Repair jobs: UC charges an inspection fee + spare parts at actuals. Technician quotes parts cost before replacing.
- UC offers 30-day warranty on services — mention for user's assurance.
- Split AC services are more common and slightly costlier than window AC services.
- Installation pricing varies by piping length — standard 3 ft included, extra piping charged per foot.
- Cancellation is free up to a few hours before the slot. After that, cancellation fee applies.
- Peak pricing may apply during summer weekends — weekday bookings can be cheaper.
- Use `confirm_action` for review, `collect_payment` for booking. Always WAIT for user response.
