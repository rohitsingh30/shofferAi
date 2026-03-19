---
name: lg-service
description: Book LG appliance service or repair on lg.com/in — AC, washing machine, refrigerator, TV, microwave repair.
triggers:
  - lg service
  - lg repair
  - lg ac service
  - lg washing machine repair
  - lg refrigerator repair
  - lg tv repair
  - book lg service
  - lg service center
  - lg appliance repair
siteUrl: https://www.lg.com/in/support/
requiresAuth: true
params:
  - name: appliance
    required: true
    hint: LG appliance (e.g. "LG 1.5 ton split AC", "LG 8kg washing machine", "LG 260L refrigerator", "LG 55 inch TV")
  - name: issue
    required: true
    hint: What needs repair (e.g. "not cooling", "making noise", "not spinning", "display not working", "installation")
  - name: location
    required: false
    hint: City or pincode (e.g. "Bangalore", "400001")
---

# LG Appliance Service & Repair

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm the LG appliance and issue. LG service covers:
  - **AC**: not cooling, gas leakage, compressor noise, installation, AMC
  - **Washing Machine**: not spinning, water not draining, drum noise, error codes, door lock issue
  - **Refrigerator**: not cooling, frost buildup, water leakage, compressor issue, ice maker
  - **TV**: no display, no sound, smart TV issues, screen damage, remote not working
  - **Microwave**: not heating, turntable stuck, sparking, display error
  - **Dishwasher**: not cleaning properly, water leakage, error codes
- Use `ask_user` to clarify: exact model number (on product label), purchase date, warranty status.
- Ask for specific symptoms or error codes displayed on the appliance.
- Get user's pincode or city for technician assignment.

### 2. Open LG Support in a NEW Tab
- Open a NEW tab and navigate to `https://www.lg.com/in/support/`.
- Take snapshot. Dismiss any popups or chat widgets.
- Verify logged in (LG account icon or profile visible).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Request Service
- Navigate to "Request a Repair" or "Book a Service" section.
- Select product category (AC, Washing Machine, Refrigerator, TV, etc.).
- Enter model number or select from dropdown.
- Describe the issue or select from predefined issue list.
- Take snapshot of service form.
- Fill in required details: product type, model, issue description, pincode.

### 4. Schedule Technician Visit
- LG primarily offers on-site service for appliances.
- Select preferred date from available calendar slots.
- Choose time slot: Morning (9 AM - 12 PM), Afternoon (12 PM - 3 PM), Evening (3 PM - 6 PM).
- Take snapshot of available slots.
- Use `ask_user` (input_type "choice") to pick date and time:
  - "Date -- Time Slot -- Availability status"
- Enter contact details and address for the visit.
- For TV/mobile: check if carry-in to service center is preferred over on-site.

### 5. Review & Confirm Service Request
- Take snapshot of service request summary.
- Use `confirm_action` to present:
  - Appliance: brand, model, category
  - Issue: problem description
  - Service Type: on-site / carry-in
  - Scheduled Date & Time: date and slot
  - Address: service location
  - Estimated Cost: free (in-warranty) or estimated visiting + repair charges
  - Warranty Status: in-warranty / out-of-warranty
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Payment (If Applicable)
- In-warranty service is free -- skip to confirmation.
- For out-of-warranty repairs:
- Use `collect_payment`:
  - summary: JSON with appliance, issue, service_type, date, estimated_cost
  - amount_inr: estimated service charge or visiting charge
  - description: "LG appliance service/repair booking"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.
- Note: full repair cost may be collected by technician after diagnosis.

### 7. Service Confirmation
- Submit service request. Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: service request number, appliance model, issue, scheduled date and time, address, estimated cost, warranty status.
- Mention: "LG technician will visit on the scheduled date. Keep your purchase invoice ready. Track status at lg.com/in/support."

## Site Notes

- LG India has 900+ service centers and 6000+ service engineers across India.
- Chrome Profile 3 (rsinghtomar3011@gmail.com) must be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- LG provides 1-year comprehensive warranty + up to 10 years on compressor (AC, fridge).
- For AC: gas refill is NOT covered under warranty. Installation charges apply for new AC.
- Model number is on the product nameplate (back/side of appliance). Help user locate it via `ask_user`.
- LG visiting charges for out-of-warranty: Rs 299-499, adjusted against repair bill.
- Parts availability: common parts available same-day. Rare parts may take 3-7 days -- technician will inform.
- LG offers AMC (Annual Maintenance Contract) for AC and washing machines -- mention if user is interested.
- On-site service is standard for large appliances. Small items (mobile, speakers) require carry-in.
- Use `confirm_action` for service review, `collect_payment` for paid service. WAIT for user response at each step.
