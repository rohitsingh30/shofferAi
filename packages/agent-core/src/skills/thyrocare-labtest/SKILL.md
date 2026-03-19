---
name: thyrocare-labtest
description: Book lab tests at home via Thyrocare — select tests or packages, schedule home collection, pay online.
triggers:
  - thyrocare
  - book lab test
  - blood test home
  - thyrocare test
  - lab test at home
  - health checkup
  - book blood test
  - thyrocare package
  - home sample collection
siteUrl: https://www.thyrocare.com
requiresAuth: true
params:
  - name: tests
    required: true
    hint: Test name(s) or package (e.g. "thyroid profile", "CBC", "Aarogyam C package", "HbA1c", "full body checkup")
  - name: date
    required: false
    hint: Preferred date for sample collection (e.g. "tomorrow", "March 20")
  - name: time
    required: false
    hint: Preferred time slot (e.g. "7am-9am", "morning")
---

# Thyrocare Lab Test Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Understand Requirements
- Determine: specific test(s) or health checkup package?
- If specific tests: get test names (e.g. TSH, CBC, HbA1c, lipid profile, liver function).
- If package: suggest popular ones (Aarogyam B/C/D, Full Body Checkup).
- Use `ask_user` if unclear: "Do you want specific tests or a full health checkup package?"
- Ask about number of family members if multiple people need testing.
- Get preferred date and morning time slot (fasting required for most tests).

### 2. Open Thyrocare & Verify Login
- Open a NEW tab and navigate to `https://www.thyrocare.com`.
- Take snapshot. Verify logged in (check for user profile or account section).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Enter pincode to check service availability in the area.

### 3. Select Tests or Package
- If specific tests:
  - Search each test in the search bar. Take snapshot.
  - Add individual tests to cart.
  - Show price for each test.
  - Suggest: "A package with these tests included might be cheaper — want me to check?"
- If package:
  - Navigate to packages/health checkup section.
  - Take snapshot of available packages.
  - Extract top 5 packages: name, number of tests included, key tests covered, price.
  - Use `ask_user` (input_type "choice"):
    "Package Name — XX tests — Covers: [key tests] — ₹XXX"
  - Popular packages: Aarogyam B (₹699, 58 tests), Aarogyam C (₹999, 72 tests), Aarogyam D (₹1599, 89 tests).
- Click selected package/tests for full test list.

### 4. Schedule Collection
- Select date for home sample collection.
- Morning slots preferred (fasting tests require empty stomach).
- Available time slots are typically: 7AM-9AM, 9AM-11AM.
- Use `ask_user` (input_type "choice") to pick date and time slot.
- Fill patient details: name, age, gender, phone, email.
- Fill address for home collection: full address, landmark, pincode.
- If multiple family members, add each member's details.

### 5. Review & Confirm
- Use `confirm_action`:
  - Package/test name(s)
  - Number of tests included
  - Key tests listed
  - Patient name(s)
  - Collection address
  - Date and time slot
  - Fasting requirement: "12 hours fasting required — no food after [time]"
  - Total amount
  - Report delivery: "Digital reports in 24-48 hours"
- Do NOT proceed unless user confirms.

### 6. Payment & Book
- Use `collect_payment`:
  - summary: JSON with package/tests, patient names, date, time, address, amount
  - amount_inr: total amount
  - description: "Thyrocare lab test booking"
- WAIT for payment confirmation.

### 7. Confirm Booking
- Complete payment. Handle OTP via `ask_user` if needed.
- Take snapshot of booking confirmation.
- Report: booking ID, tests/package name, patient name(s), collection date and time, address.
- Remind:
  - "Fast for 12 hours before collection — plain water is okay."
  - "Keep Aadhaar/ID ready — phlebotomist may ask for verification."
  - "Reports will be sent to your email and available on Thyrocare portal in 24-48 hours."
- Mention: "Phlebotomist will call 30 minutes before arrival."

## Site Notes

- Thyrocare is India's largest diagnostic chain — affordable packages, home collection across 2000+ cities.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Session may expire after 30 days — if login wall appears, ask user to re-login manually in Chrome Debug.
- Aarogyam packages are Thyrocare's signature offering — best value for comprehensive checkups.
- Home collection: phlebotomist visits home, collects blood/urine samples. Professional and safe.
- Fasting: most blood tests require 10-12 hours fasting. Morning 7-9AM slots are ideal.
- Reports: digital reports in 24-48 hours via email and Thyrocare portal. Hard copy available on request.
- Thyrocare prices are among the lowest in India — significantly cheaper than hospital labs.
- Group bookings (family/office) get additional discounts — ask if multiple members need testing.
- Sample is sent to Thyrocare's centralized NABL-accredited lab — quality is standardized.
- Certain tests (glucose tolerance, treadmill) require visit to Thyrocare center — not available at home.
- Use `confirm_action` for review, `collect_payment` for booking. WAIT for user response.
