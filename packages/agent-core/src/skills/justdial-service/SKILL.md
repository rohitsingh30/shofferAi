---
name: justdial-service
description: Find local services on JustDial — search businesses, compare ratings, get quotes, call or book.
triggers:
  - justdial
  - just dial
  - find service near me
  - local service provider
  - find plumber near me
  - find electrician near me
  - justdial search
  - best service near me
  - local business search
  - service provider ratings
siteUrl: https://www.justdial.com
requiresAuth: false
params:
  - name: service
    required: true
    hint: What service or business (e.g. "plumber", "packers and movers", "car mechanic", "caterer", "pest control")
  - name: location
    required: true
    hint: City or area (e.g. "Koramangala Bangalore", "Andheri Mumbai", "Delhi")
  - name: budget
    required: false
    hint: Budget range if applicable (e.g. "affordable", "under 5000")
---

# JustDial Local Services

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Understand what service or business the user is looking for:
  - **Home Services**: plumber, electrician, carpenter, painter, pest control
  - **Moving**: packers and movers, tempo/truck on rent
  - **Events**: caterers, decorators, DJ, tent house, photographers
  - **Auto**: car repair, car wash, towing, driving school
  - **Health**: doctors, hospitals, diagnostic labs, pharmacies
  - **Education**: tuitions, coaching centers, play schools
  - **Professional**: CA, lawyer, interior designer, architect
  - **Other**: courier, travel agent, pet shop, gym, salon
- Get the user's city and locality/area for accurate results.
- Ask for any preferences: budget range, rating threshold, specific needs.
- If vague, use `ask_user` to clarify the service type and area.

### 2. Open JustDial in a NEW Tab
- Open a NEW tab and navigate to `https://www.justdial.com`.
- Take snapshot. Set city if prompted.
- JustDial does not strictly require login for searching.
- If login is needed for booking/contacting, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search for Service
- Use the search bar to search for the service in the specified area.
  - Format: "[service] in [location]" (e.g. "plumbers in Koramangala Bangalore").
- Take snapshot of search results.
- Apply filters if needed: rating (4+), verified, distance, price range.
- Extract top 5-7 results with: business name, rating, number of reviews, address, phone, years in business, price range (if shown).
- Use `ask_user` (input_type "choice") to present options:
  - "Business Name — Rating X.X (Y reviews) — Area — Est. Price: Rs.XXX — Verified"

### 4. View Details & Compare
- Click on user's selected business for detailed view.
- Take snapshot of business profile.
- Extract: full address, phone numbers, services offered, photos, reviews summary, operating hours, payment modes accepted.
- Read top 2-3 reviews to assess quality.
- Summarize findings to user.
- If user wants to compare, go back and show another option.
- Use `ask_user`: "Shall I help you contact this business or compare with another?"

### 5. Contact or Get Quote
- Based on user preference:
  - **Call**: provide the phone number for user to call directly
  - **Send Enquiry**: fill out JustDial's enquiry form with user's requirements
  - **Get Quote**: request quotes from top 3-4 businesses for comparison
- For enquiry/quote, use `ask_user` to get user's specific requirements message.
- Take snapshot of enquiry form if filling one.
- Use `confirm_action` to present:
  - Selected business name and rating
  - Contact method (call/enquiry/quote)
  - User's requirement message
  - Business address and operating hours
- Do NOT send enquiry unless user confirms.

### 6. Submit & Confirm
- Submit the enquiry or quote request.
- Take snapshot of confirmation.
- If booking directly (some services support instant booking on JustDial):
  - Use `collect_payment`:
    - summary: JSON with service, business, date, amount
    - amount_inr: booking amount
    - description: "JustDial service booking"
  - STOP and WAIT for payment confirmation.
- Report: business name, phone number, address, rating, enquiry status.
- Mention: "Business will contact you shortly. You can also call them directly at [phone]."

### 7. Final Summary
- Take snapshot of final state.
- Provide a summary with all shortlisted businesses, contact info, and ratings.
- If multiple quotes requested, mention: "You'll receive quotes from X businesses. Compare and choose the best."

## Site Notes

- JustDial is India's largest local search and business listing platform.
- Chrome Profile 3 (rsinghtomar3011@gmail.com) may be used but login is not strictly required for search.
- Do NOT ask user for credentials if login is needed. Login transparently.
- JustDial shows phone numbers but may require login to view full number. Handle this seamlessly.
- Ratings: 4.0+ is good, 4.5+ is excellent. Prioritize verified businesses with more reviews.
- JustDial Best Deal: sends enquiry to multiple businesses — user gets multiple callbacks.
- Be aware: JustDial listings may include paid promotions at the top. Look for genuine ratings.
- Phone numbers shown may be JustDial relay numbers — they forward to the actual business.
- Price estimates on JustDial are approximate. Actual quotes may differ.
- For packers & movers: always recommend getting 3+ quotes before deciding.
- JustDial also has a "JD Mart" for B2B — ensure you are on the consumer services section.
- Use `confirm_action` before sending any enquiry. WAIT for user response at each step.
