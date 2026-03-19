---
name: urbancompany-appliance
description: Book washing machine, refrigerator, AC, geyser, or microwave repair on Urban Company.
triggers:
  - washing machine repair
  - fridge repair
  - refrigerator repair
  - ac repair
  - ac service
  - geyser repair
  - microwave repair
  - appliance repair
  - appliance repair urban company
  - washing machine not working
  - fridge not cooling
  - ac not cooling
siteUrl: https://www.urbancompany.com
requiresAuth: true
params:
  - name: appliance
    required: true
    hint: Which appliance (e.g. "washing machine", "refrigerator", "AC", "geyser", "microwave", "chimney")
  - name: issue
    required: false
    hint: What's wrong (e.g. "not spinning", "not cooling", "water leaking", "making noise", "not heating")
  - name: brand
    required: false
    hint: Appliance brand (e.g. "Samsung", "LG", "Whirlpool", "Daikin", "Voltas")
  - name: date
    required: false
    hint: Preferred date (e.g. "today", "tomorrow", "ASAP")
---

# Urban Company Appliance Repair

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect service details
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **service** (type: "text", required): What service is needed
2. **address** (type: "address", required): Service location. Show saved addresses.
3. **date** (type: "calendar", collapsed, mode: "single"): Preferred date

**CRITICAL**: Do NOT open the browser without knowing the service type and address.
### 1. Gather Requirements
- Identify the appliance and issue:
  - **Washing Machine**: not spinning, not draining, leaking, noise, drum issue, display error, door lock
  - **Refrigerator**: not cooling, overcooling, ice buildup, water leaking, compressor noise, thermostat
  - **AC (Split/Window)**: not cooling, gas refill, water leaking, compressor issue, noise, regular service
  - **Geyser**: not heating, leaking, thermostat issue, element replacement
  - **Microwave**: not heating, turntable not rotating, sparking, display issue
  - **Chimney**: suction issue, cleaning, motor problem, auto-clean not working
- Ask appliance brand and model if user knows.
- Ask appliance type: top-load vs front-load (washing machine), split vs window (AC), instant vs storage (geyser).
- Is it under warranty? If yes, suggest contacting brand service center instead.
- Get preferred date and time.
- If vague, use `ask_user` to narrow down.

### 2. Open Urban Company in a NEW Tab
- Open a NEW tab and navigate to `https://www.urbancompany.com`.
- Take snapshot. Set location/city if prompted.
- Verify logged in (profile visible in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Navigate to Appliance Repair
- Search for the specific appliance repair (e.g. "washing machine repair") or browse via categories.
- Take snapshot of the appliance repair page.
- Select the appliance type and sub-type (e.g. "Front Load Washing Machine" or "Split AC").
- Browse available services:
  - **Inspection/Diagnosis**: technician visits, diagnoses, quotes repair cost
  - **Common repairs**: pre-priced packages for known issues
  - **Service/Maintenance**: regular servicing (AC gas top-up, deep cleaning, etc.)
- Extract options: service name, description, price, rating.
- Use `ask_user` (input_type "choice") to present services:
  - "Service Name — Rs.XXX — Includes: [details] — Warranty: X days"

### 4. Select Service & Review
- Select chosen service.
- Add any additional services if needed (e.g. AC gas refill + deep cleaning).
- Take snapshot of cart.
- Use `confirm_action` to present booking summary:
  - Appliance type and brand
  - Issue reported
  - Service selected with details
  - Price (inspection charge / fixed price / estimate)
  - Warranty on repair
  - Any spare parts that may be needed (cost separate)
  - Note: "Final cost may vary if additional parts are needed"
- Do NOT proceed unless user confirms.

### 5. Schedule Appointment
- Select preferred date from available dates.
- Select time slot (typically 2-hour windows: 8-10 AM, 10-12 PM, 12-2 PM, 2-4 PM, 4-6 PM, 6-8 PM).
- If preferred slot unavailable, show alternatives via `ask_user`.
- Enter or verify home address.
- Confirm schedule with user.
- Take snapshot of final booking page.

### 6. Payment
- Proceed to payment.
- Use `collect_payment`:
  - summary: JSON with appliance, issue, service, date, time, price
  - amount_inr: service charge amount
  - description: "Urban Company appliance repair"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Booking Confirmation
- Complete payment. Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: booking ID, appliance & issue, service booked, technician name (if assigned), scheduled date & time, address, amount paid, warranty details.
- Mention: "Technician will arrive with basic tools and common spare parts. If additional parts are needed, they will quote on-site. Repair warranty covers the fix for X days."

## Site Notes

- Urban Company appliance repair covers all major brands and appliance types.
- Chrome Profile 3 (rsinghtomar3011@gmail.com) must be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- AC service: most popular. Regular service (Rs.500-800) vs deep cleaning (Rs.700-1200) vs gas refill (Rs.1500-2500). Clarify what user needs.
- Washing machine: front-load repairs are typically more expensive than top-load.
- Inspection charge (Rs.99-199) is usually applicable and adjusted against repair cost.
- Spare parts are charged separately at MRP. Technician carries common parts; rare parts may need a second visit.
- UC provides 30-day warranty on service and 6-month warranty on spare parts.
- If appliance is under manufacturer warranty, advise user to contact the brand's authorized service center instead.
- Technicians are trained on multiple brands. Brand-specific expertise varies.
- Payment: inspection charge online, remaining (parts + labor) can be paid after service.
- Same-day booking available in most cities for morning requests.
- Use `confirm_action` for booking review, `collect_payment` for payment. WAIT for user response at each step.
