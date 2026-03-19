---
name: urbancompany-pest
description: Book pest control on Urban Company — cockroach, termite, bed bugs, mosquito, rat control for homes.
triggers:
  - pest control
  - cockroach control
  - termite treatment
  - bed bugs treatment
  - mosquito control
  - rat control
  - pest control urban company
  - book pest control
  - home pest control
  - insect control
siteUrl: https://www.urbancompany.com
requiresAuth: true
params:
  - name: pest_type
    required: true
    hint: Type of pest (e.g. "cockroach", "termite", "bed bugs", "mosquito", "rat", "ant", "general pest")
  - name: home_size
    required: true
    hint: Home size (e.g. "1BHK", "2BHK", "3BHK", "1RK", "independent house")
  - name: date
    required: false
    hint: Preferred date (e.g. "today", "tomorrow", "this weekend")
  - name: time
    required: false
    hint: Preferred time slot (e.g. "morning", "afternoon", "evening")
---

# Urban Company Pest Control

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Identify the pest problem. Common types:
  - **Cockroach**: gel treatment (odorless, no evacuation) or spray treatment
  - **Termite**: drilling + chemical treatment for walls/furniture, pre/post-construction
  - **Bed Bugs**: spray treatment, may need multiple sessions
  - **Mosquito**: spray for indoor areas, larvicide for stagnant water
  - **Rat/Rodent**: bait stations, trapping, sealing entry points
  - **Ant**: gel/spray treatment
  - **General Pest**: combined cockroach + ant + spider treatment
- If user says "pest control" without specifying, use `ask_user` to determine pest type.
- Ask home size: 1RK, 1BHK, 2BHK, 3BHK, or independent house/villa.
- Ask about specific areas affected (kitchen, bathroom, entire house).
- Get preferred date and time.
- Ask if user has children or pets — affects treatment type recommendation.

### 2. Open Urban Company in a NEW Tab
- Open a NEW tab and navigate to `https://www.urbancompany.com`.
- Take snapshot. Set location/city if prompted.
- Verify logged in (profile visible in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Navigate to Pest Control
- Search for "pest control" or navigate via Home Services > Pest Control.
- Take snapshot of pest control category page.
- Select the specific pest type (cockroach, termite, bed bugs, etc.).
- Browse available packages for the selected pest and home size.
- Extract options: package name, treatment type, warranty period, price, number of sessions.
- Use `ask_user` (input_type "choice") to present packages:
  - "Package Name — Rs.XXX — Treatment: [type] — Warranty: X months — Sessions: X"

### 4. Select Package & Customize
- Select chosen package.
- If user wants multiple pest treatments (e.g. cockroach + termite), add both.
- Review any add-ons (extra rooms, garden/outdoor treatment).
- Take snapshot of cart.
- Use `confirm_action` to present booking summary:
  - Pest type and treatment method
  - Home size (BHK)
  - Package name and details
  - Number of sessions included
  - Warranty period
  - Total price
  - Preparation instructions (e.g. "cover food items", "keep pets away for 2 hrs")
- Do NOT proceed unless user confirms.

### 5. Schedule Appointment
- Select preferred date from available calendar.
- Select time slot (morning, afternoon, evening).
- If preferred slot unavailable, show alternatives via `ask_user`.
- Confirm scheduling with user.
- Take snapshot of scheduled booking.

### 6. Payment
- Proceed to payment.
- Use `collect_payment`:
  - summary: JSON with pest type, treatment, home size, sessions, warranty, date, total
  - amount_inr: total amount
  - description: "Urban Company pest control booking"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Booking Confirmation
- Complete payment. Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: booking ID, pest treatment type, professional name (if assigned), scheduled date & time, home size, warranty period, number of sessions, amount paid.
- Mention: "Professional will arrive with all chemicals and equipment. Treatment takes 30-90 min depending on home size. Keep children and pets away during treatment."

## Site Notes

- Urban Company pest control is available in 40+ Indian cities.
- Chrome Profile 3 (rsinghtomar3011@gmail.com) must be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Cockroach gel treatment: most popular, odorless, safe for kids/pets, no evacuation needed. Rs.600-1500 by BHK.
- Termite treatment: more expensive (Rs.2000-8000+), requires drilling. Warranty 1-5 years.
- Bed bugs: may need 2-3 sessions at 15-day intervals. First session kills adults, followups kill hatched eggs.
- General pest control: covers cockroach + ant + spider. Good starting option.
- Prices scale by BHK — 1BHK is cheapest, 3BHK/villa most expensive.
- UC professionals use government-approved chemicals. Safe for residential use.
- Warranty: if pests return within warranty period, free re-treatment.
- Preparation: user should cover food items, water sources. Keep pets away for 2-3 hours post-treatment.
- Best time: morning or afternoon. Treatment works better when home is relatively empty.
- Use `confirm_action` for booking review, `collect_payment` for payment. WAIT for user response at each step.
