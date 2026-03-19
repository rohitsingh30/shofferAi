---
name: iservice-apple
description: Book Apple device repair at iService or Apple Authorized Service Provider — iPhone, iPad, Mac, Apple Watch repair.
triggers:
  - iservice
  - apple repair
  - iphone repair
  - mac repair
  - apple service center
  - iphone screen repair
  - macbook repair
  - apple authorized service
  - ipad repair
  - apple watch repair
siteUrl: https://www.iservice.co.in
requiresAuth: true
params:
  - name: device
    required: true
    hint: Apple device (e.g. "iPhone 15 Pro", "MacBook Air M2", "iPad Pro", "Apple Watch Series 9")
  - name: issue
    required: true
    hint: What needs repair (e.g. "cracked screen", "battery replacement", "not charging", "water damage")
  - name: location
    required: false
    hint: City or area for service center (e.g. "Bangalore", "Mumbai", "Delhi")
---

# iService Apple Authorized Repair

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm the Apple device and the issue. Common repair categories:
  - **Screen Repair**: cracked display, touch not working, OLED burn-in
  - **Battery Replacement**: degraded battery, battery health below 80%, swollen battery
  - **Charging Issues**: lightning/USB-C port not working, wireless charging failure
  - **Water Damage**: liquid contact indicator triggered, corrosion repair
  - **Camera/Speaker**: camera blur, mic not working, speaker distortion
  - **Logic Board**: software crash, boot loop, no power, data recovery
  - **Mac Specific**: keyboard, trackpad, hinge, SSD upgrade, RAM (older models)
- Use `ask_user` to clarify device model, storage capacity, and exact issue if vague.
- Ask if device is under AppleCare+ or manufacturer warranty.
- Get preferred city/location for service center visit.

### 2. Open iService in a NEW Tab
- Open a NEW tab and navigate to `https://www.iservice.co.in`.
- Take snapshot. Dismiss any popups or chat widgets.
- Verify logged in (account or profile section visible).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Select Device & Issue
- Navigate to the repair booking section.
- Select device category (iPhone, iPad, Mac, Apple Watch).
- Select specific model from the list.
- Choose the issue/repair type from available options.
- Take snapshot of repair options and pricing.
- Extract: repair type, estimated cost, turnaround time, warranty on repair.
- Use `ask_user` (input_type "choice") to present options:
  - "Repair Type -- Rs.XXX -- Turnaround: X days -- Warranty: X months on repair"
- If multiple issues, add each to the repair request.

### 4. Select Service Center & Schedule
- Show available service centers in user's city.
- Extract: center name, address, rating, availability.
- Use `ask_user` (input_type "choice") for center selection.
- Select preferred date and time slot from availability calendar.
- Note if pickup/drop service is available in the area.
- Take snapshot of appointment summary.

### 5. Review & Confirm Appointment
- Use `confirm_action` to present booking summary:
  - Device: model, storage, color
  - Issue: description of repair needed
  - Service Center: name, address
  - Appointment: date, time
  - Estimated Cost: repair price (may vary after diagnosis)
  - Turnaround: estimated days
  - Pickup/Drop: if applicable
- Do NOT proceed unless user confirms. If cancelled, ask what to change.
- Note: "Final price confirmed after physical diagnosis at service center."

### 6. Payment (Advance/Booking Fee)
- If advance payment or booking fee is required, proceed to payment.
- Use `collect_payment`:
  - summary: JSON with device, issue, service_center, date, estimated_cost
  - amount_inr: booking/advance amount
  - description: "iService Apple device repair booking"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.
- If no advance required, skip to confirmation.

### 7. Booking Confirmation
- Complete booking. Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: booking/ticket ID, device, repair type, service center name and address, appointment date and time, estimated cost, estimated turnaround time.
- Mention: "Please bring your device and a valid ID to the service center. Backup your data before handing over the device."

## Site Notes

- iService is one of India's largest Apple Authorized Service Providers with centers in major cities.
- Chrome Profile 3 (rsinghtomar3011@gmail.com) must be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Repair prices shown are estimates -- final price is confirmed after physical diagnosis at the service center.
- AppleCare+ or in-warranty devices may get free or reduced-cost repairs -- ask user about warranty status.
- Screen repair on iPhones uses genuine Apple parts with 90-day warranty on the repair.
- Mac repairs (logic board, display) can be expensive -- always inform user of estimated cost range before booking.
- Data backup is critical -- remind user to back up via iCloud or iTunes before handing over the device.
- Some repairs (battery, screen) are same-day. Complex repairs (logic board, water damage) take 3-7 days.
- Pickup and drop service available in select cities for an additional fee.
- Use `confirm_action` for booking review, `collect_payment` for advance/booking fee. WAIT for user response at each step.
