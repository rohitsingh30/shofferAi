---
name: porter-moving
description: Book mini-truck, tempo, or packers & movers on Porter — local shifting, goods transport, intercity moving.
triggers:
  - porter
  - book porter
  - mini truck
  - tempo booking
  - packers and movers
  - house shifting
  - goods transport
  - moving truck
  - porter delivery
  - furniture moving
  - bike transport
siteUrl: https://porter.in
requiresAuth: true
params:
  - name: service_type
    required: true
    hint: What you need (e.g. "mini truck", "2-wheeler delivery", "packers and movers", "intercity transport")
  - name: pickup
    required: true
    hint: Pickup address or area (e.g. "Koramangala, Bangalore", "my home address")
  - name: drop
    required: true
    hint: Drop address or area (e.g. "Whitefield, Bangalore", "new apartment HSR Layout")
  - name: items
    required: false
    hint: What you are moving (e.g. "1BHK furniture", "sofa + fridge", "10 cartons", "bike")
---

# Porter Moving & Transport

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm what the user needs to transport/move:
  - **Mini Truck / Tempo**: single item or few items within city (fridge, sofa, mattress, cartons)
  - **2-Wheeler Delivery**: small packages, documents
  - **Packers & Movers**: full house shifting (1BHK/2BHK/3BHK) — packing, loading, transport, unloading
  - **Intercity Transport**: goods or household items between cities
  - **Bike Transport**: motorcycle/scooter relocation
- Get pickup address and drop address.
- Ask about items to move: type, quantity, approximate weight/size.
- For packers & movers: ask BHK size, floor number, lift availability.
- Get preferred date and time.
- If vague, use `ask_user` to clarify.

### 2. Open Porter in a NEW Tab
- Open a NEW tab and navigate to `https://porter.in`.
- Take snapshot. Ensure city is set correctly.
- Verify logged in (phone number or profile visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Enter Trip Details
- Select vehicle type based on items:
  - **Tata Ace / Mini Truck**: up to 750 kg (small furniture, few cartons)
  - **Pickup 8ft**: up to 1200 kg (1BHK items, large appliances)
  - **3-Wheeler**: up to 500 kg (medium loads)
- Enter pickup location.
- Enter drop location.
- Take snapshot of the fare estimate page.
- Extract: vehicle type, estimated fare, distance, estimated time.

### 4. Select Vehicle & Add-ons
- If multiple vehicle options available, present via `ask_user` (input_type "choice"):
  - "Vehicle Type — Rs.XXX — Capacity: X kg — ETA: X min"
- Ask about loading/unloading help:
  - 1 helper: for light items
  - 2 helpers: for heavy items (fridge, sofa, washing machine)
- For packers & movers: select full-service package.
- Take snapshot of selected options.

### 5. Confirm Trip Details
- Use `confirm_action` to present booking summary:
  - Pickup address
  - Drop address
  - Vehicle type and capacity
  - Items to transport (as described by user)
  - Helpers included (if any)
  - Estimated fare (base + helpers + toll if applicable)
  - Estimated pickup time
  - Payment mode
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Payment
- Proceed to booking.
- Use `collect_payment`:
  - summary: JSON with pickup, drop, vehicle, items, helpers, fare
  - amount_inr: estimated total
  - description: "Porter transport booking"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Booking Confirmation
- Complete payment. Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: booking ID, driver name & phone (if assigned), vehicle number, pickup address & ETA, drop address, estimated fare, items, helpers.
- Mention: "Driver will arrive at pickup location. Track live on Porter app. Call driver for coordination."

## Site Notes

- Porter is India's largest intra-city logistics platform. Available in 15+ cities.
- Chrome Profile 3 (rsinghtomar3011@gmail.com) must be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Fare is distance-based with a base minimum. Toll charges extra if applicable.
- Helpers cost Rs.80-150 per helper. Essential for heavy items — always recommend.
- Mini truck (Tata Ace) is the most common vehicle. Good for 1BHK shifting within city.
- Packers & Movers: full service includes packing material, loading, transport, unloading, unpacking. Premium pricing.
- Payment: online (UPI, card) or cash to driver. Online payment may have small discount.
- Surge pricing during peak hours (month-end, weekends) — inform user.
- Driver arrival: typically 30-60 minutes. Immediate booking is standard; advance booking also available.
- Porter drivers are verified with DL and vehicle registration checks.
- Insurance: basic goods protection included. Declare high-value items for extra coverage.
- Floor charges: if no lift, per-floor charges apply for heavy items.
- Use `confirm_action` for booking review, `collect_payment` for payment. WAIT for user response at each step.
