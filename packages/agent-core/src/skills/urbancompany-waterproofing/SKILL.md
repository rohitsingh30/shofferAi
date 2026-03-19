---
name: urbancompany-waterproofing
description: Book waterproofing service on Urban Company — terrace, bathroom, external wall, balcony waterproofing with warranty.
triggers:
  - waterproofing
  - waterproof terrace
  - roof waterproofing
  - urban company waterproofing
  - wall waterproofing
  - bathroom waterproofing
  - terrace leakage
  - wall seepage
  - roof leakage
  - damp wall fix
siteUrl: https://www.urbancompany.com
requiresAuth: true
params:
  - name: area
    required: true
    hint: Area to waterproof (e.g. "terrace", "bathroom", "external wall", "balcony", "basement")
  - name: size
    required: false
    hint: Approximate area size (e.g. "500 sq ft terrace", "200 sq ft", "1 bathroom")
  - name: issue
    required: false
    hint: Current issue (e.g. "leakage during rain", "damp patches", "seepage on wall", "water pooling")
  - name: urgency
    required: false
    hint: Timeline (e.g. "before monsoon", "ASAP", "this month", "next week")
---

# Urban Company Waterproofing Service

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm what needs waterproofing. Use `ask_user` to clarify:
  - **Area**: Terrace/roof, bathroom, external walls, balcony, basement, internal walls with seepage.
  - **Current issue**: Active leakage, damp patches, seepage, water pooling, paint peeling due to dampness.
  - **Approximate size**: Square footage or room dimensions.
  - **Building type**: Apartment, independent house, commercial.
  - **Floor**: Top floor (terrace access), middle floor (wall seepage), ground floor (basement).
  - **Urgency**: Before monsoon season, ASAP, or planned maintenance.
- If user is unsure about the type of waterproofing needed, explain options and recommend based on the issue described.

### 2. Open Urban Company & Verify Login
- Open a NEW tab and navigate to `https://www.urbancompany.com`.
- Take snapshot. Verify logged in (profile icon or name visible).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Set location if prompted (user's city/area). Use `ask_user` for address if not set.

### 3. Navigate to Waterproofing Services
- Navigate to Waterproofing section (Home Services > Waterproofing or search "waterproofing").
- Take snapshot of waterproofing services page.
- Browse available waterproofing packages:
  - **Terrace Waterproofing**: Entire terrace/roof coating — prevents rain leakage
  - **Bathroom Waterproofing**: Shower area, floor, wall junction — prevents seepage
  - **External Wall Waterproofing**: Exterior wall coating — prevents rain seepage
  - **Balcony Waterproofing**: Open balcony floor and wall base
  - **Internal Wall Treatment**: Damp wall treatment — anti-seepage coating
  - **Expansion Joint Treatment**: Cracks between slabs — targeted waterproofing
- Extract options with: service name, scope, price range (per sq ft or flat rate), warranty, estimated duration.
- Use `ask_user` (input_type "choice") to present relevant options:
  - "Terrace Waterproofing — Rs XX/sq ft — 5-year warranty — 2-3 days"
  - "Bathroom Waterproofing — Rs X,XXX flat — 3-year warranty — 1-2 days"
  - "External Wall Coating — Rs XX/sq ft — 5-year warranty — 2-4 days"

### 4. Configure Service Details
- Select the chosen service.
- Provide area details:
  - Approximate size in sq ft (or help user estimate based on room dimensions).
  - Current condition of the surface (cracks, pooling areas, existing coatings).
  - Access constraints (scaffolding needed for external walls, furniture to move).
- UC may present treatment options:
  - **Standard**: Basic waterproof coating (2-3 year warranty)
  - **Premium**: Multi-layer treatment with primer + membrane + top coat (5-7 year warranty)
  - **Comprehensive**: Full treatment with crack repair + waterproofing + anti-fungal (7-10 year warranty)
- Present via `ask_user` (input_type "choice"):
  - "Standard Treatment — Rs XX,XXX — 3-year warranty — Basic coating"
  - "Premium Treatment — Rs XX,XXX — 5-year warranty — Multi-layer membrane"
  - "Comprehensive — Rs XX,XXX — 7-year warranty — Full crack repair + waterproofing"
- Take snapshot of selected service configuration.
- Use `confirm_action` to present service summary:
  - Area: type, approximate size
  - Treatment: type, materials, layers
  - Warranty: duration, what's covered
  - Estimated duration
  - Price estimate (final after site inspection)
  - Includes: labor, materials, cleanup
- Do NOT proceed unless user confirms.

### 5. Schedule Site Inspection
- UC waterproofing usually requires a site inspection before work begins.
- Select preferred date for inspection via `ask_user` (input_type "choice"):
  - Available dates and time slots
- Confirm schedule with user.
- Inform user: "A UC waterproofing expert will inspect the area, assess the damage, and provide a final quote before work begins."

### 6. Payment & Book
- Verify address is correct.
- Use `collect_payment`:
  - summary: JSON with area, treatment type, estimated size, warranty, estimated price, inspection date
  - amount_inr: booking/advance amount (number)
  - description: "Urban Company waterproofing service"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.
- Note: UC typically charges a booking advance, with the full amount finalized after site inspection.

### 7. Confirm Booking
- Complete payment. Handle OTP via `ask_user` if needed.
- Take snapshot of booking confirmation page.
- Report: booking ID, service type, area, treatment plan, warranty, inspection date, estimated total, payment structure.
- Mention: "A waterproofing expert will visit on [date] to inspect and finalize the quote. Work will begin [X days] after inspection. Please ensure the area is accessible and cleared of loose items. UC provides a [X]-year warranty against leakage."

## Site Notes

- Urban Company waterproofing is available in major Indian metros. Best booked before monsoon season (May-June).
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Waterproofing is a high-value service (Rs 5,000-50,000+ depending on area size). Site inspection is critical.
- Terrace waterproofing: most common request. Price Rs 30-80/sq ft depending on treatment type and city.
- Bathroom waterproofing: usually flat-rate packages. Does not require breaking tiles in most modern methods.
- UC uses branded waterproofing materials: Dr. Fixit, Asian Paints SmartCare, Pidilite, SikaWrap.
- Warranty is key: always confirm warranty duration and what it covers (leakage, seepage, peeling).
- Site inspection is usually free — expert checks cracks, slope, drainage, existing coatings, and recommends treatment.
- Duration: bathroom 1-2 days, terrace 2-5 days, external walls 3-7 days (depending on size and scaffolding).
- Best time to waterproof: before monsoon. During active leakage, UC can do emergency patch work first.
- Payment: advance at booking (Rs 500-2000), balance after site inspection finalizes quote, final balance after completion.
- UC provides before/after photos and a warranty certificate after job completion.
- Use `confirm_action` for service review, `collect_payment` for booking. WAIT for user response.
