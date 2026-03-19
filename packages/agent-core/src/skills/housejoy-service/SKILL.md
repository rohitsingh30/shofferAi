---
name: housejoy-service
description: Book home services on Housejoy — plumber, electrician, cleaning, painting, pest control, carpentry.
triggers:
  - housejoy
  - book plumber on housejoy
  - book electrician on housejoy
  - housejoy cleaning
  - housejoy painting
  - home repair housejoy
  - housejoy pest control
  - housejoy carpenter
  - housejoy handyman
  - housejoy service
siteUrl: https://www.housejoy.in
requiresAuth: true
params:
  - name: service
    required: true
    hint: What service (e.g. "plumber", "electrician", "deep cleaning", "painting", "pest control", "carpenter")
  - name: issue
    required: false
    hint: Specific issue or requirement (e.g. "leaking tap", "fan installation", "3BHK deep cleaning")
  - name: date
    required: false
    hint: Preferred date (e.g. "today", "tomorrow", "this weekend")
  - name: time
    required: false
    hint: Preferred time slot (e.g. "morning", "afternoon", "2 PM")
---

# Housejoy Home Services

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect service details
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **service** (type: "text", required): What service is needed
2. **address** (type: "address", required): Service location. Show saved addresses.
3. **date** (type: "calendar", collapsed, mode: "single"): Preferred date

**CRITICAL**: Do NOT open the browser without knowing the service type and address.
### 1. Gather Requirements
- Determine the exact home service needed. Categories:
  - **Plumber**: leaking taps, pipe repair, basin/sink installation, toilet repair, water tank cleaning
  - **Electrician**: fan/light installation, wiring, switchboard, MCB/fuse, inverter/UPS
  - **Cleaning**: deep cleaning (by BHK), bathroom cleaning, kitchen cleaning, sofa/carpet cleaning
  - **Painting**: interior/exterior, single wall, full room, waterproofing
  - **Pest Control**: cockroach, termite, bed bugs, mosquito, rat
  - **Carpenter**: furniture repair, door/window fixing, wardrobe installation, assembly
  - **Appliance Repair**: AC, washing machine, refrigerator, microwave, geyser
- If vague, use `ask_user` to narrow down service and specific issue.
- For cleaning and painting, ask BHK size (1BHK/2BHK/3BHK) or area in sq ft.
- Get preferred date and time slot.

### 2. Open Housejoy in a NEW Tab
- Open a NEW tab and navigate to `https://www.housejoy.in`.
- Take snapshot. Select city if prompted (Bangalore, Mumbai, Delhi NCR, Hyderabad, Chennai, Pune).
- Verify logged in (user name or phone visible in header/menu).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Browse & Select Service
- Navigate to the appropriate service category from homepage or menu.
- Take snapshot of available services and sub-services.
- Browse packages/options:
  - Plumber/Electrician: list of common issues with fixed prices
  - Cleaning: packages by BHK or room type
  - Painting: by room count or wall area
  - Pest Control: by bug type and home size
- Extract options: service name, description, price, estimated duration.
- Use `ask_user` (input_type "choice") to present options:
  - "Service Name — Rs.XXX — Duration: X hrs — Includes: [details]"

### 4. Add to Cart & Customize
- Select chosen service/package.
- Add any additional sub-services if user wants multiple jobs done.
- Take snapshot of cart/summary.
- Enter address if prompted.
- Use `confirm_action` to present order summary:
  - Service(s) selected with descriptions
  - Price for each item
  - Total amount
  - Estimated duration
  - Address
- Do NOT proceed unless user confirms.

### 5. Schedule Appointment
- Select preferred date from available dates.
- Select time slot (morning, afternoon, evening — specific slots vary by city).
- If preferred slot unavailable, show alternatives via `ask_user`.
- Confirm date and time with user.
- Take snapshot of scheduled booking page.

### 6. Payment
- Proceed to payment.
- Use `collect_payment`:
  - summary: JSON with services, date, time, address, total
  - amount_inr: total amount
  - description: "Housejoy home service booking"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Booking Confirmation
- Complete payment. Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: booking ID, service(s) booked, professional name (if assigned), scheduled date & time, address, amount paid.
- Mention: "Professional will arrive at your home. Track status on Housejoy app or website."

## Site Notes

- Housejoy is a popular home services marketplace in India. Available in major metros.
- Chrome Profile 3 (rsinghtomar3011@gmail.com) must be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Prices are mostly fixed — no haggling. Displayed prices include labor; parts may be extra.
- Plumber/Electrician: visiting charge is typically Rs.99-149. Additional charges for parts/materials.
- Cleaning: prices scale by BHK size. Deep cleaning takes 3-6 hours depending on home size.
- Painting: Housejoy uses branded paints (Asian Paints, Berger). Price includes paint + labor.
- Professionals are trained and background-verified.
- Cancellation: free if done before professional is assigned. After assignment, fee may apply.
- Warranty: 30-day service warranty on most services.
- Payment: online (UPI, card, wallet) or cash after service for some categories.
- Peak demand: weekends and holidays. Book 1-2 days in advance for best availability.
- Use `confirm_action` for booking review, `collect_payment` for payment. WAIT for user response at each step.
