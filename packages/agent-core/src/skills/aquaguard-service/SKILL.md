---
name: aquaguard-service
description: Book Aquaguard/Eureka Forbes water purifier service — AMC, filter change, repair, installation, annual maintenance.
triggers:
  - aquaguard service
  - aquaguard repair
  - eureka forbes service
  - aquaguard filter change
  - aquaguard amc
  - book aquaguard service
  - aquaguard purifier repair
  - eureka forbes amc
  - aquaguard ro service
siteUrl: https://www.eurekaforbes.com/service
requiresAuth: true
params:
  - name: service_type
    required: true
    hint: What service (e.g. "filter change", "AMC renewal", "repair", "installation", "annual maintenance")
  - name: model
    required: false
    hint: Aquaguard model (e.g. "Aquaguard Aura", "Aquaguard Glory", "Aquaguard Enhance", "Dr. Aquaguard")
  - name: location
    required: false
    hint: City or pincode (e.g. "Chennai", "400001")
---

# Aquaguard / Eureka Forbes Water Purifier Service

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm the Aquaguard/Eureka Forbes model and service needed. Services include:
  - **Filter Change**: sediment filter, carbon block, RO membrane, UV lamp, mineral cartridge
  - **AMC (Annual Maintenance Contract)**: comprehensive (parts + labor), basic (labor only)
  - **Annual Service**: preventive maintenance, filter cleaning, TDS check, sanitization
  - **Repair**: leaking, no water flow, bad taste, motor issue, auto-flush not working, error light
  - **Installation**: new purifier plumbing, wall mount, tank connection
  - **Uninstallation**: removal for shifting or replacement
- Use `ask_user` to clarify: model name, purchase date, last service date, AMC status.
- Ask about the issue: when started, water quality change, any indicator lights blinking.
- Get user's pincode or city for technician availability.
- Note: Aquaguard recommends servicing every 6 months for optimal performance.

### 2. Open Eureka Forbes Support in a NEW Tab
- Open a NEW tab and navigate to `https://www.eurekaforbes.com/service`.
- Take snapshot. Dismiss any popups, chat bots, or promotional overlays.
- Verify logged in (profile icon or "My Account" visible in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Register Service Request
- Navigate to "Book a Service" or "Request Service" section.
- Select product category: Water Purifier.
- Enter product model and serial number (use `ask_user` if user needs help locating on the unit).
- Select service type: Repair / AMC / Filter Change / Installation / Annual Service.
- Describe the issue if it is a repair request.
- Enter pincode to validate service coverage.
- Take snapshot of service form after filling.

### 4. Select Service Plan or Spare Parts
- If AMC: show available AMC plans with comparison.
  - **Comprehensive AMC**: all parts + labor + unlimited visits (Rs 3000-5000/year).
  - **Basic AMC**: labor only, parts extra (Rs 1500-2500/year).
  - **Premium AMC**: parts + labor + priority + extended hours (Rs 4000-6000/year).
  - Use `ask_user` (input_type "choice"): "Plan Name -- Rs.XXX/year -- Covers: [details]"
- If filter change: show compatible filter kits and individual filters.
  - Extract: filter name, price, compatible models, replacement frequency.
  - Use `ask_user` (input_type "choice"): "Filter/Kit -- Rs.XXX -- For: [model] -- Replace every: X months"
- Schedule technician visit: pick preferred date and time slot.
- Take snapshot of scheduling calendar.

### 5. Review & Confirm
- Take snapshot of service request summary.
- Use `confirm_action` to present:
  - Purifier: brand (Aquaguard), model, serial number
  - Service Type: filter change / AMC / repair / installation
  - Plan/Parts: selected AMC plan or filter kit details
  - Scheduled Date & Time: technician visit
  - Address: service location
  - Cost Breakdown: AMC/filter cost + visiting charge (if any)
  - Warranty/AMC Status: active warranty / active AMC / expired
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Payment
- Use `collect_payment`:
  - summary: JSON with purifier_model, service_type, plan_or_parts, date, total_cost
  - amount_inr: total amount
  - description: "Aquaguard/Eureka Forbes purifier service"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.
- Note: for repairs without AMC, visiting charge collected upfront; repair cost after diagnosis.

### 7. Service Confirmation
- Complete booking. Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: service request number, purifier model, service type, AMC/plan details (if applicable), scheduled date and time, address, amount paid.
- Mention: "Eureka Forbes technician will visit on the scheduled date. Keep purifier powered on and accessible. Helpline: 1860-266-1177."

## Site Notes

- Eureka Forbes (Aquaguard) is India's most trusted water purifier brand with 9000+ service engineers.
- Chrome Profile 3 (rsinghtomar3011@gmail.com) must be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Aquaguard models use proprietary filters -- only genuine Eureka Forbes parts should be used.
- AMC is strongly recommended: without AMC, visiting charge is Rs 350-500 per visit, parts at MRP.
- RO membrane replacement cost: Rs 1500-2500 depending on model. Recommended every 12-18 months.
- Eureka Forbes has its own technician network (not third-party) -- ensures service quality.
- Service response time: 24-48 hours in metros, 48-72 hours in smaller cities.
- TDS meter reading helps diagnose membrane condition -- ask user to check TDS of purified water if possible.
- Aquaguard SmartGuard models have IoT features: auto-service alerts, filter life indicators -- check in app.
- Use `confirm_action` for service review, `collect_payment` for payment. WAIT for user response at each step.
