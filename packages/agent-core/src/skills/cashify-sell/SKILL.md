---
name: cashify-sell
description: Sell old phone, laptop, tablet, or smartwatch on Cashify — get instant quote, schedule pickup, get paid.
triggers:
  - cashify
  - sell old phone
  - sell phone online
  - sell laptop
  - sell old laptop
  - sell tablet
  - sell old mobile
  - sell phone cashify
  - phone buyback
  - device trade in
siteUrl: https://www.cashify.in
requiresAuth: true
params:
  - name: device_type
    required: true
    hint: What to sell (e.g. "phone", "laptop", "tablet", "smartwatch", "gaming console")
  - name: brand_model
    required: true
    hint: Brand and model (e.g. "iPhone 14 Pro", "Samsung Galaxy S23", "MacBook Air M2", "iPad Pro 2022")
  - name: condition
    required: false
    hint: Device condition (e.g. "excellent", "good", "fair", "poor", "screen cracked")
---

# Cashify Sell Device

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm what device the user wants to sell:
  - **Phone**: brand, model, storage (64/128/256GB), color
  - **Laptop**: brand, model, RAM, storage, processor
  - **Tablet**: brand, model, storage, WiFi/Cellular
  - **Smartwatch**: brand, model, size
  - **Gaming Console**: brand, model, storage
- Ask about device condition:
  - **Excellent**: no scratches, fully functional, good battery
  - **Good**: minor scratches, fully functional
  - **Fair**: visible scratches, minor issues (battery degraded, button stuck)
  - **Poor**: cracked screen, major issues, but powers on
- Ask if device has:
  - Original charger and box
  - Warranty card/bill
  - Any accessories
- If vague, use `ask_user` to get exact model and condition.

### 2. Open Cashify in a NEW Tab
- Open a NEW tab and navigate to `https://www.cashify.in`.
- Take snapshot. Set city if prompted.
- Verify logged in (profile/name visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Get Device Quote
- Select device type (Sell Phone / Sell Laptop / etc.).
- Search for the exact brand and model.
- Select the correct variant (storage, RAM, color).
- Take snapshot of the device selection.
- Answer condition questions honestly based on user's description:
  - Screen condition (flawless, minor scratches, cracked)
  - Body condition (like new, minor dents, major damage)
  - Functional issues (all working, speaker issue, camera issue, etc.)
  - Accessories available (box, charger, bill)
- Take snapshot of the final quote.
- Extract: quoted price, any bonus offers, condition assessment.

### 4. Present Quote & Negotiate
- Use `ask_user` to present the quote:
  - "Cashify offers Rs.XXX for your [Device]. Condition: [assessed]. Includes: [any bonus]."
  - "Accept this quote or would you like to check other options?"
- If user thinks price is too low, mention alternatives (OLX for higher price but more effort).
- If user accepts, proceed to schedule pickup.

### 5. Schedule Pickup
- Select pickup date and time slot.
- Enter or verify pickup address.
- Take snapshot of scheduling page.
- Use `confirm_action` to present:
  - Device: brand, model, variant
  - Quoted price: Rs.XXX
  - Pickup date and time slot
  - Pickup address
  - Payment method (bank transfer / UPI)
  - Documents needed (ID proof for verification)
- Do NOT proceed unless user confirms.

### 6. Payment Details
- Enter user's payment details for receiving money.
- Use `ask_user` for bank account or UPI ID where payment should be sent.
- Use `collect_payment` (amount is what user RECEIVES, not pays):
  - summary: JSON with device, quote, pickup date, payment method
  - amount_inr: 0 (user receives money, not pays)
  - description: "Cashify device sale — user receives Rs.XXX"
- Note: For Cashify, user receives money. The `collect_payment` here is for tracking/confirmation only.
- STOP and WAIT for user confirmation.

### 7. Booking Confirmation
- Complete the booking.
- Take snapshot of confirmation page.
- Report: order ID, device details, quoted price, pickup date & time, pickup address, payment method, expected payment timeline.
- Mention: "Cashify executive will visit for pickup. They will inspect the device on-spot. If condition matches, you'll receive Rs.XXX via [payment method] within 24 hours. Keep your ID proof ready."

## Site Notes

- Cashify is India's largest re-commerce platform for selling used electronics.
- Chrome Profile 3 (rsinghtomar3011@gmail.com) must be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Cashify prices are typically 10-20% lower than OLX/private sale — but hassle-free with doorstep pickup.
- Quote accuracy: online quote is approximate. Final price confirmed after physical inspection at pickup.
- If device condition is worse than stated, price will be reduced on-spot. Inform user.
- iPhone resale values are highest. Samsung flagships hold value reasonably. Budget phones have low resale.
- Laptops: MacBooks get best prices. Windows laptops depreciate faster.
- Payment: instant bank transfer or UPI after device is picked up and verified. Takes up to 24 hours.
- Documents: user needs to show Aadhaar/PAN for verification at pickup. Mandatory.
- Cashify also offers exchange — trade old device + pay difference for new device.
- Pickup available in 50+ cities. Same-day pickup available in metros.
- Data erasure: Cashify performs factory reset. Advise user to backup and reset before pickup.
- Use `confirm_action` for booking review. WAIT for user response at each step.
