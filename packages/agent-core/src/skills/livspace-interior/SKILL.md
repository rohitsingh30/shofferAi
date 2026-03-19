---
name: livspace-interior
description: Book interior design consultation on Livspace — select room type, set budget, browse designs, schedule consultation with designer.
triggers:
  - livspace
  - interior design
  - home interior
  - livspace consultation
  - home renovation
  - modular kitchen
  - interior designer
  - livspace design
  - book interior consultation
siteUrl: https://www.livspace.com
requiresAuth: false
params:
  - name: city
    required: true
    hint: City (e.g. "Bangalore", "Mumbai", "Delhi", "Hyderabad", "Chennai", "Pune")
  - name: room_type
    required: false
    hint: Room to design — "full home", "kitchen", "bedroom", "living room", "bathroom", "wardrobe"
  - name: property_type
    required: false
    hint: Property type — "1 BHK", "2 BHK", "3 BHK", "4 BHK", "villa", "independent house"
  - name: budget
    required: false
    hint: Interior budget range (e.g. "3-5 lakhs", "8-10 lakhs", "15+ lakhs")
---

# Livspace Interior Design Consultation

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm city, room type, property type, and budget.
- If missing, use `ask_user` (input_type "freetext"): "Which city are you in? What rooms need design — full home, kitchen, bedroom? What's your property type and interior budget?"
- Ask for additional preferences:
  - Design style: modern, contemporary, traditional, minimalist, Scandinavian
  - Timeline: when do they want it completed?
  - Specific needs: modular kitchen, wardrobe, false ceiling, storage
  - Move-in status: empty house vs renovation of existing
- Note: Livspace works in Bangalore, Mumbai, Delhi NCR, Hyderabad, Chennai, Pune, Noida, Gurgaon, Kolkata.

### 2. Open Livspace in NEW Tab
- Open a NEW tab and navigate to `https://www.livspace.com`.
- Take snapshot. Dismiss any popups, cookie banners, or promotional overlays.
- If city selector appears, select the user's city.
- Verify logged in if an account exists (profile icon in top-right).
- If NOT logged in and login is needed, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Browse Design Inspirations
- Navigate to the design gallery or magazine section.
- Filter by room type: Kitchen / Bedroom / Living Room / Bathroom / Full Home.
- Filter by style: Modern / Contemporary / Traditional / Minimalist.
- Filter by BHK / property type if available.
- Take snapshot of design gallery.
- Extract top 5-6 design inspirations:
  - Design name / title
  - Room type and style
  - Estimated budget range
  - Designer name
  - Photo preview description
- Present via `ask_user` (input_type "choice"):
  "1) Modern Modular Kitchen — Glossy White — ₹3.5-5L — Clean lines, soft-close"
  "2) Contemporary 2BHK Full Home — Warm Wood Tones — ₹8-12L — Open layout"
  "3) Minimalist Bedroom — Pastel Theme — ₹2-3L — Built-in wardrobe"
  "Browse More Designs"
- Let user pick designs they like for reference.

### 4. Get Consultation Quote
- Navigate to "Get Free Estimate" or "Book Free Consultation".
- Enter project details in the form:
  - City
  - Property type / BHK
  - Rooms to design
  - Budget range
  - Move-in timeline
- If phone number or email is required, use operator profile details.
- Take snapshot of the estimate or quote page.
- Extract estimated cost breakdown:
  - Per room estimates
  - Package options (Essential / Premium / Luxe)
  - What's included: design, material, installation, warranty

### 5. Schedule Consultation
- Click "Book Free Consultation" or "Meet a Designer".
- View available consultation slots — take snapshot.
- Present options via `ask_user` (input_type "choice"):
  "1) Video Call — March 20, 11:00 AM — Designer: Priya Sharma"
  "2) In-Person at Livspace Experience Center — March 21, 2:00 PM"
  "3) Home Visit — March 22, 10:00 AM — Designer visits your home"
  "4) Choose another date"
- Select the user's preferred slot.

### 6. Review & Confirm Consultation
- Use `confirm_action`:
  - Consultation type: Video Call / In-Person / Home Visit
  - Date and time
  - Designer name (if assigned)
  - Location: home address / Livspace center address
  - Project scope: rooms, BHK, style preference
  - Budget range discussed
  - What to expect: designer will visit, take measurements, create 3D design in 7-10 days
  - Cost: Consultation is FREE. Design + execution starts from ₹X lakhs.
- Do NOT proceed unless user confirms.

### 7. Payment for Design Package (if applicable)
- If user decides to go ahead with a design package after consultation:
- Use `collect_payment`:
  - summary: JSON with package_name, rooms, estimated_cost, timeline, designer, inclusions
  - amount_inr: booking amount or first installment
  - description: "Livspace interior design booking"
- WAIT for payment confirmation.
- Only proceed if confirmed.

### 8. Final Confirmation with Snapshot
- Take snapshot of booking confirmation page.
- Report:
  - Consultation booked: date, time, type
  - Designer assigned (name, experience)
  - Rooms covered in the scope
  - Budget range agreed
  - Next steps: designer visit → measurements → 3D design → approval → execution
  - Timeline: typical 45-90 days from design approval to completion
- Mention: "Livspace offers a 10-year warranty on modular products. All designs are customized to your space. You can make unlimited revisions at the design stage before approving execution."

## Site Notes

- Livspace.com is India's largest home interior platform with end-to-end design and execution.
- Chrome Profile 3 (rsinghtomar3011@gmail.com) is used for browsing. Do NOT ask user for credentials.
- Livspace operates in: Bangalore, Mumbai, Delhi NCR, Hyderabad, Chennai, Pune, Noida, Gurgaon, Kolkata.
- Consultation is FREE — no payment until the user approves a design package.
- Pricing: Modular kitchen starts ~₹2-3L. Full 2BHK: ₹5-12L. Full 3BHK: ₹8-20L. Varies by city and materials.
- Livspace assigns a dedicated designer + project manager for each project.
- Execution timeline: 45-90 days for modular work; 90-120 days for full home renovation.
- 10-year warranty on modular products (kitchen cabinets, wardrobes). 1-year on civil/electrical work.
- Livspace website may push for phone number aggressively — fill with operator number if required.
- Experience Centers are showrooms where users can see materials and designs in person — recommend visiting.
- Payment is typically in 3-4 installments: booking → design approval → mid-execution → completion.
- Use `confirm_action` for review, `collect_payment` for package booking. WAIT for user response.
