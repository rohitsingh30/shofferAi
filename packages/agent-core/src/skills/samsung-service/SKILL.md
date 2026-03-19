---
name: samsung-service
description: Book Samsung device service or repair on samsung.com — phone, TV, refrigerator, washing machine, AC repair.
triggers:
  - samsung service
  - samsung repair
  - samsung service center
  - book samsung repair
  - samsung phone repair
  - samsung tv repair
  - samsung washing machine repair
  - samsung ac service
  - samsung refrigerator repair
siteUrl: https://www.samsung.com/in/support/
requiresAuth: true
params:
  - name: device
    required: true
    hint: Samsung device (e.g. "Galaxy S24 Ultra", "55 inch Samsung TV", "Samsung washing machine", "Samsung AC")
  - name: issue
    required: true
    hint: What needs service (e.g. "screen cracked", "not cooling", "display issue", "making noise", "installation")
  - name: location
    required: false
    hint: City or pincode for service center (e.g. "Bangalore", "110001")
---

# Samsung Device Service & Repair

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm the Samsung product and issue. Samsung service covers:
  - **Mobile**: screen repair, battery replacement, charging port, water damage, software issues
  - **TV**: display panel issue, no picture, sound problem, smart TV software, wall mount installation
  - **Refrigerator**: not cooling, ice maker issue, compressor problem, water leakage
  - **Washing Machine**: not spinning, water drain issue, drum noise, error codes
  - **AC**: not cooling, gas refill, installation, unusual noise, water leakage
  - **Microwave/Oven**: not heating, turntable issue, display malfunction
- Use `ask_user` to clarify: exact model (check back label), purchase date, warranty status.
- Ask for the specific problem in detail (error code if displayed).
- Get user's pincode or city for service center assignment.

### 2. Open Samsung Support in a NEW Tab
- Open a NEW tab and navigate to `https://www.samsung.com/in/support/`.
- Take snapshot. Dismiss any popups or chat bot widgets.
- Verify logged in (Samsung account profile icon visible in top-right).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Register Product & Select Service
- Navigate to "Request Service" or "Book a Repair" section.
- Select product category (Mobile, TV, Refrigerator, Washing Machine, AC, etc.).
- Enter model number or select from product list.
- Choose issue category and describe the problem.
- Take snapshot of service options.
- Extract: service type (carry-in, on-site, pickup), estimated cost (if shown), turnaround time.
- Use `ask_user` (input_type "choice") to present service options:
  - "Service Type -- Carry-in to service center / On-site (technician visits) / Pickup & Drop"
- For in-warranty products, service is typically free -- confirm warranty status.

### 4. Select Service Center or Schedule Visit
- For carry-in: show nearest Samsung service centers based on pincode.
  - Extract: center name, address, phone, working hours, distance.
  - Use `ask_user` (input_type "choice") to pick center.
- For on-site: select preferred date and time slot from calendar.
  - Morning (9-12), Afternoon (12-3), Evening (3-6) slots typically available.
- For pickup: enter address for pickup scheduling.
- Take snapshot of scheduling page.

### 5. Enter Details & Confirm
- Fill in contact details, address, and device details as required.
- Enter IMEI/serial number if prompted (use `ask_user` to collect from user).
- Take snapshot of service request summary.
- Use `confirm_action` to present:
  - Device: model, category
  - Issue: description
  - Service Type: carry-in / on-site / pickup
  - Service Center: name, address (for carry-in)
  - Scheduled Date & Time: (for on-site/pickup)
  - Estimated Cost: free (in-warranty) or estimated amount
  - Turnaround: estimated days
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Payment (If Applicable)
- For in-warranty service, no payment needed -- skip to confirmation.
- For out-of-warranty or paid service:
- Use `collect_payment`:
  - summary: JSON with device, issue, service_type, center, date, estimated_cost
  - amount_inr: estimated service charge
  - description: "Samsung device service/repair booking"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Service Confirmation
- Submit service request. Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: service request number, device, issue, service type, service center (if carry-in), scheduled date/time, estimated cost, estimated turnaround.
- Mention: "Track your service request at samsung.com/in/support or via Samsung Members app. Keep your invoice handy."

## Site Notes

- Samsung India provides service via 3000+ authorized service centers across India.
- Chrome Profile 3 (rsinghtomar3011@gmail.com) must be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Samsung provides 1-year standard warranty on all products. Extended warranty available via Samsung Care+.
- In-warranty repairs are free. Out-of-warranty: cost depends on parts + labor.
- Mobile screen repairs use genuine Samsung parts. AMOLED screens are expensive -- always quote estimate.
- For large appliances (TV, fridge, washing machine, AC), on-site service is standard -- technician visits home.
- Samsung charges a "visiting charge" (Rs 299-499) for out-of-warranty on-site visits, adjusted against repair bill.
- Model number is usually on the back panel or in Settings > About Phone. Help user find it via `ask_user`.
- Service turnaround: mobile 1-3 days (carry-in), appliances 1-2 days (on-site, if parts available).
- Use `confirm_action` for service review, `collect_payment` for paid repairs. WAIT for user response at each step.
