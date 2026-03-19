---
name: whirlpool-service
description: Book Whirlpool appliance service or repair — AC, washing machine, refrigerator, microwave, water purifier repair.
triggers:
  - whirlpool service
  - whirlpool repair
  - whirlpool ac service
  - whirlpool washing machine repair
  - whirlpool refrigerator repair
  - whirlpool service center
  - book whirlpool repair
  - whirlpool appliance service
  - whirlpool ac repair
siteUrl: https://www.whirlpoolindia.com/support
requiresAuth: true
params:
  - name: appliance
    required: true
    hint: Whirlpool appliance (e.g. "Whirlpool 1.5 ton AC", "Whirlpool 7kg washing machine", "Whirlpool 265L fridge")
  - name: issue
    required: true
    hint: What needs repair (e.g. "not cooling", "not spinning", "leaking water", "error code", "installation")
  - name: location
    required: false
    hint: City or pincode (e.g. "Delhi", "560001")
---

# Whirlpool Appliance Service & Repair

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm the Whirlpool appliance and issue. Service categories:
  - **AC**: not cooling, gas refill, compressor noise, installation, uninstallation, AMC
  - **Washing Machine**: not spinning, water drain issue, drum noise, error codes (E1, F5, etc.), door lock
  - **Refrigerator**: not cooling, over-cooling, frost buildup, compressor noise, water dispenser issue
  - **Microwave**: not heating, sparking, turntable not rotating, keypad issue
  - **Water Purifier**: low water flow, bad taste, filter change, UV/RO membrane replacement
  - **Dishwasher**: not cleaning, drainage issue, error codes
- Use `ask_user` to clarify: model number (on sticker), purchase date, warranty status.
- Ask user to describe the issue in detail. Note any error codes displayed.
- Get user's pincode or city for technician assignment.

### 2. Open Whirlpool Support in a NEW Tab
- Open a NEW tab and navigate to `https://www.whirlpoolindia.com/support`.
- Take snapshot. Dismiss any promotional popups or chat widgets.
- Verify logged in (account icon or "My Account" visible).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Register Service Request
- Navigate to "Service Request" or "Book a Service" section.
- Select product category (AC, Washing Machine, Refrigerator, Microwave, etc.).
- Enter model number and serial number (use `ask_user` if user needs help locating these).
- Select issue type from dropdown or describe the problem.
- Enter pincode for service area validation.
- Take snapshot of service request form.

### 4. Schedule Service Visit
- Whirlpool offers on-site service for most appliances.
- Select preferred date from available slots on the calendar.
- Choose time slot: Morning (9 AM - 12 PM), Afternoon (12 PM - 4 PM), Evening (4 PM - 7 PM).
- Take snapshot of scheduling options.
- Use `ask_user` (input_type "choice") to pick preferred slot:
  - "Date -- Time Slot -- Available"
- Enter service address and contact number.
- For small appliances: check if carry-in option is available at nearest service center.

### 5. Review & Confirm
- Take snapshot of complete service request summary.
- Use `confirm_action` to present:
  - Appliance: model, category, serial number
  - Issue: problem description and error code (if any)
  - Service Type: on-site / carry-in
  - Scheduled Date & Time: selected slot
  - Address: service location
  - Warranty Status: in-warranty (free) / out-of-warranty (charges apply)
  - Estimated Cost: visiting charge + estimated repair (for out-of-warranty)
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Payment (If Applicable)
- In-warranty service is free -- skip to confirmation.
- For out-of-warranty:
- Use `collect_payment`:
  - summary: JSON with appliance, issue, service_date, estimated_cost
  - amount_inr: visiting charge or advance amount
  - description: "Whirlpool appliance service/repair"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.
- Note: final repair cost determined after technician diagnosis.

### 7. Service Confirmation
- Submit service request. Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: service request/ticket number, appliance model, issue, scheduled date and time, service center (if carry-in), address, warranty status, estimated charges.
- Mention: "Whirlpool technician will visit on the scheduled date. Keep purchase invoice and warranty card ready."

## Site Notes

- Whirlpool India has 500+ service centers and authorized service partners across India.
- Chrome Profile 3 (rsinghtomar3011@gmail.com) must be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Whirlpool provides 1-year comprehensive warranty. Some products have extended compressor warranty (up to 10 years).
- Out-of-warranty visiting charge: Rs 350-500 depending on product and city. Adjusted against repair bill.
- Model and serial number are on the product nameplate sticker. Help user locate via `ask_user`.
- AC gas refill and installation are NOT covered under standard warranty.
- Whirlpool customer care number: 1800-208-1800 (toll-free) -- mention as backup if online booking fails.
- Common error codes: E1 (water supply), F5 (lid lock), CF (communication fault) -- note these for technician.
- Parts: genuine Whirlpool parts used. Common parts same-day. Special order parts take 3-5 days.
- Use `confirm_action` for service review, `collect_payment` for paid services. WAIT for user response at each step.
