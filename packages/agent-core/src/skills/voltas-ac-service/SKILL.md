---
name: voltas-ac-service
description: Book Voltas AC service — installation, repair, gas refill, AMC, deep cleaning for Voltas and Voltas Beko products.
triggers:
  - voltas service
  - voltas ac service
  - voltas ac repair
  - voltas installation
  - voltas gas refill
  - voltas ac not cooling
  - book voltas service
  - voltas ac cleaning
  - voltas beko service
siteUrl: https://www.voltas.com/customer-support
requiresAuth: true
params:
  - name: service_type
    required: true
    hint: What service (e.g. "AC installation", "AC repair", "gas refill", "deep cleaning", "AMC renewal")
  - name: model
    required: false
    hint: Voltas AC model (e.g. "Voltas 1.5 ton 5 star inverter split AC", "Voltas 1 ton window AC")
  - name: location
    required: false
    hint: City or pincode (e.g. "Mumbai", "110001")
---

# Voltas AC Service & Repair

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm the Voltas product and service needed. Voltas services include:
  - **Installation**: new AC installation, copper piping, wall drilling, stabilizer setup
  - **Repair**: not cooling, compressor issue, fan motor, PCB board, error codes
  - **Gas Refill**: refrigerant recharge (R32, R410A), gas leak detection and fix
  - **Deep Cleaning**: indoor unit jet wash, outdoor unit cleaning, filter cleaning
  - **AMC (Annual Maintenance Contract)**: periodic servicing, priority support, discounted repairs
  - **Uninstallation**: AC removal for shifting or replacement
- Use `ask_user` to clarify: AC type (split/window/cassette), tonnage, model number.
- Ask about the specific issue: when did it start, any error codes on display, unusual sounds.
- Get user's pincode or city for service area validation.
- Ask if AC is under warranty (typically 1 year comprehensive + 5 years compressor).

### 2. Open Voltas Support in a NEW Tab
- Open a NEW tab and navigate to `https://www.voltas.com/customer-support`.
- Take snapshot. Dismiss any popups.
- Verify logged in (user profile or account icon visible).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Register Service Request
- Navigate to "Service Request" or "Book a Service" section.
- Select product type: Air Conditioner (Split / Window / Cassette).
- Enter model number and serial number (use `ask_user` if user needs help finding these on the AC nameplate).
- Select service type: Installation / Repair / Gas Refill / Cleaning / AMC.
- Describe the issue or service needed.
- Enter pincode for service area coverage check.
- Take snapshot of service form.

### 4. Schedule Technician Visit
- Select preferred date from available calendar.
- Choose time slot: Morning (9 AM - 12 PM), Afternoon (12 PM - 3 PM), Evening (3 PM - 6 PM).
- Take snapshot of available slots.
- Use `ask_user` (input_type "choice") to present scheduling options:
  - "Date -- Time Slot -- Availability"
- Enter service address and contact details.
- Note: peak summer season (April-June) may have longer wait times -- inform user.

### 5. Review Service Details
- Take snapshot of complete service summary.
- Use `confirm_action` to present:
  - Product: Voltas AC model, type (split/window), tonnage
  - Service: type (installation/repair/gas refill/cleaning/AMC)
  - Issue Description: (for repairs)
  - Scheduled Date & Time: selected slot
  - Service Address: full address
  - Warranty Status: in-warranty (free) / out-of-warranty (charges apply)
  - Estimated Cost: visiting charge + estimated service cost
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Payment (If Applicable)
- In-warranty repair is free -- skip to confirmation.
- For paid services (gas refill, cleaning, AMC, out-of-warranty repair):
- Use `collect_payment`:
  - summary: JSON with product, service_type, date, estimated_cost
  - amount_inr: service charge or advance amount
  - description: "Voltas AC service booking"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.
- Note: final amount may vary after technician inspection.

### 7. Service Confirmation
- Submit service request. Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: service request number, AC model, service type, scheduled date and time, address, estimated charges, warranty status.
- Mention: "Voltas technician will visit on the scheduled date. Keep purchase invoice and warranty card ready. Helpline: 1800-266-4555 (toll-free)."

## Site Notes

- Voltas is India's #1 AC brand (Tata Group). Voltas Beko makes refrigerators and washing machines.
- Chrome Profile 3 (rsinghtomar3011@gmail.com) must be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Voltas warranty: 1 year comprehensive + 5 years compressor (some models 10 years on compressor).
- Gas refill is NOT covered under warranty unless there is a manufacturing defect causing the leak.
- Installation charges for new AC: Rs 1500-3000 depending on piping length and type (copper/aluminum).
- Deep cleaning cost: Rs 400-800 per AC unit. Recommended every 6 months.
- AMC plans: Rs 1500-3000/year per AC, includes 2-4 services, priority booking, discounted parts.
- Peak season (March-June): service slots fill fast. Book early. Technician may take 2-3 days.
- Model number is on the indoor unit nameplate (right side or bottom). Help user find it via `ask_user`.
- Use `confirm_action` for service review, `collect_payment` for paid services. WAIT for user response at each step.
