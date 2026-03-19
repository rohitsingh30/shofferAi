---
name: urbancompany-painting
description: Book home painting service on Urban Company — select room size, paint type, color, schedule painters, pay.
triggers:
  - home painting
  - house painting
  - wall painting
  - urban company painting
  - paint my room
  - room painting
  - house paint service
  - interior painting
  - paint walls
  - book painter
siteUrl: https://www.urbancompany.com
requiresAuth: true
params:
  - name: rooms
    required: true
    hint: Number and type of rooms (e.g. "1 bedroom", "2BHK full house", "living room", "kitchen")
  - name: paint_type
    required: false
    hint: Paint type preference (e.g. "standard", "premium", "luxury", "Asian Paints Royale")
  - name: color
    required: false
    hint: Color preference (e.g. "white", "light blue", "cream", "undecided")
  - name: service_type
    required: false
    hint: Service type (e.g. "fresh painting", "repainting", "texture painting", "waterproofing + painting")
---

# Urban Company Home Painting

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect service details
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **service** (type: "text", required): What service is needed
2. **address** (type: "address", required): Service location. Show saved addresses.
3. **date** (type: "calendar", collapsed, mode: "single"): Preferred date

**CRITICAL**: Do NOT open the browser without knowing the service type and address.
### 1. Gather Requirements
- Confirm what the user needs painted. Use `ask_user` to clarify:
  - **Scope**: Single room, multiple rooms, full house (1BHK/2BHK/3BHK), specific walls only.
  - **Service type**: Fresh painting (new construction), repainting (existing walls), texture/design painting.
  - **Paint type**: Standard (economy), premium (mid-range), luxury (top brands like Asian Paints Royale, Berger Silk).
  - **Color preference**: specific colors, or want consultation/color suggestions.
  - **Timeline**: when they want the work done (this week, next week, specific date).
  - **Special requirements**: ceiling painting, wood/door painting, exterior walls.
- If user is unsure about paint type, explain the tiers and price difference.

### 2. Open Urban Company & Verify Login
- Open a NEW tab and navigate to `https://www.urbancompany.com`.
- Take snapshot. Verify logged in (profile icon or name visible).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Set location if prompted (user's city/area). Use `ask_user` for address if not set.

### 3. Navigate to Painting Services
- Navigate to Painting section (Home Services > Painting or search "painting").
- Take snapshot of painting services page.
- Browse available painting packages:
  - **Fresh Painting**: New walls, putty + primer + paint (2-3 coats)
  - **Repainting**: Existing walls, sanding + primer + paint (2 coats)
  - **Texture Painting**: Decorative textures, accent walls
  - **Waterproofing + Painting**: Damp walls, waterproof coating + paint
- Packages are typically priced by room/BHK size:
  - 1 Room, 1BHK, 2BHK, 3BHK, 4BHK, Custom
- Extract options with: package name, scope, paint brand/type, estimated price, duration, what's included.
- Use `ask_user` (input_type "choice") to present options:
  - "1 Room Repainting (Standard) — Rs X,XXX — Asian Paints Tractor — 1-2 days"
  - "1 Room Repainting (Premium) — Rs X,XXX — Asian Paints Royale — 1-2 days"
  - "2BHK Full House (Premium) — Rs XX,XXX — Berger Silk — 4-5 days"

### 4. Customize Package
- Select the chosen package.
- Configure details:
  - **Room dimensions**: UC may ask for approximate room size (sq ft or wall measurements).
  - **Paint color**: Browse color palette. Present popular shades via `ask_user` (input_type "choice"):
    - "Classic White / Off-White"
    - "Light Cream / Ivory"
    - "Light Blue / Sky Blue"
    - "Light Grey / Silver"
    - "Custom color (share shade card number)"
  - **Ceiling**: Include ceiling painting? (additional cost)
  - **Doors/Windows**: Wood painting needed? (additional cost)
- Take snapshot of customized package.
- Use `confirm_action` to present detailed quote:
  - Service: type (repaint/fresh/texture), rooms/scope
  - Paint: brand, type, color(s)
  - Includes: putty, primer, paint coats, labor, cleanup
  - Estimated duration
  - Price breakdown: base price, add-ons (ceiling, doors), total
  - Warranty: paint warranty period
- Do NOT proceed unless user confirms.

### 5. Schedule Consultation / Start Date
- UC painting usually starts with a site visit/consultation by a painting expert.
- Select preferred date for site visit or painting start via `ask_user` (input_type "choice"):
  - Available dates and time slots
- If site visit required first, inform user: "A UC painting expert will visit your home first to assess walls and finalize the quote."
- Confirm schedule with user.

### 6. Payment & Book
- Verify address is correct for the service visit.
- Use `collect_payment`:
  - summary: JSON with service type, rooms, paint brand, colors, duration, includes, total estimate
  - amount_inr: booking amount or total (number)
  - description: "Urban Company home painting service"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.
- Note: UC may charge an advance booking amount, with balance due after completion.

### 7. Confirm Booking
- Complete payment. Handle OTP via `ask_user` if needed.
- Take snapshot of booking confirmation page.
- Report: booking ID, service type, rooms, paint details, scheduled date, estimated duration, total cost, payment structure (advance + balance).
- Mention: "A painting expert will visit on [date] to assess and finalize. Painting will take [X] days. UC provides a post-service warranty on the paint job. Please clear furniture from walls before the team arrives."

## Site Notes

- Urban Company painting is available in major Indian cities (Delhi NCR, Mumbai, Bangalore, Hyderabad, etc.).
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Painting is a high-value service (Rs 5,000-50,000+). UC provides detailed quotes after site visit.
- Paint brands on UC: Asian Paints (most popular), Berger, Nerolac, Dulux. Premium brands cost 2-3x more.
- Standard paint: Tractor Emulsion (economy). Premium: Royale/Apcolite. Luxury: Royale Aspira/Berger Silk Glamor.
- UC warranty: 1-3 years depending on package. Covers peeling, cracking, discoloration.
- Site visit is usually free — expert assesses wall condition, dampness, measurements, and finalizes quote.
- Duration: 1 room = 1-2 days, 2BHK = 3-5 days, 3BHK = 5-7 days. Depends on wall condition.
- UC painters clean up after work — drop cloths, dust removal, furniture rearrangement.
- Texture painting is decorative (accent walls, designs) and costs significantly more — clarify user's expectation.
- Payment: advance at booking (10-30%), balance after completion and inspection by user.
- Use `confirm_action` for quote review, `collect_payment` for booking. WAIT for user response.
