---
name: quikr-service
description: Find local services on Quikr — search home services, compare providers, get quotes, contact or book.
triggers:
  - quikr
  - quikr services
  - find service on quikr
  - quikr home services
  - quikr plumber
  - quikr electrician
  - quikr packers movers
  - quikr repair
  - local service quikr
  - quikr cleaning
siteUrl: https://www.quikr.com
requiresAuth: true
params:
  - name: service
    required: true
    hint: What service (e.g. "plumber", "electrician", "packers and movers", "home cleaning", "AC repair", "interior designer")
  - name: location
    required: true
    hint: City or area (e.g. "Bangalore", "Mumbai Andheri West", "Hyderabad Gachibowli")
  - name: budget
    required: false
    hint: Budget range (e.g. "under 1000", "budget 5000", "affordable")
---

# Quikr Local Services

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine what service the user needs. Quikr covers:
  - **Home Services**: plumber, electrician, carpenter, painter, pest control, cleaning
  - **Packers & Movers**: local and intercity house/office shifting
  - **Repairs**: AC, washing machine, refrigerator, TV, laptop, phone
  - **Beauty & Wellness**: salon at home, spa, makeup, mehndi
  - **Events**: catering, decoration, photography, DJ, tent house
  - **Education**: home tutors, coaching classes, online courses
  - **Home Improvement**: interior design, modular kitchen, false ceiling, waterproofing
  - **Vehicle Services**: car repair, car wash, bike service, towing
  - **Professional**: CA, lawyer, astrologer, visa consultant
- Get location (city + area) for relevant local results.
- Ask for specific requirements, preferred budget, and urgency.
- If vague, use `ask_user` to clarify service and preferences.

### 2. Open Quikr in a NEW Tab
- Open a NEW tab and navigate to `https://www.quikr.com`.
- Take snapshot. Set city if prompted.
- Verify logged in (profile or user icon visible in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search for Service Providers
- Navigate to the appropriate services section.
- Search for the service in the specified area.
- Take snapshot of search results.
- Apply filters: rating, verified, distance, price range, experience.
- Extract top 5-7 results: provider name, rating, reviews count, services offered, price range, location, years of experience, verified badge.
- Use `ask_user` (input_type "choice") to present options:
  - "Provider Name — Rating X.X (Y reviews) — Area — Price: Rs.XXX onwards — Verified/Unverified"

### 4. View Provider Details
- Click on selected provider for full profile.
- Take snapshot of provider page.
- Extract: full service list, detailed pricing, portfolio/photos, customer reviews, operating hours, certifications.
- Summarize top 2-3 reviews for user.
- If user wants to compare, go back and view another provider.
- Use `ask_user`: "Would you like to contact this provider, get a quote, or compare with others?"

### 5. Get Quote or Contact
- Based on user's choice:
  - **Get Quote**: fill Quikr's enquiry form with user's requirements
  - **Call**: provide provider's phone number
  - **Chat**: initiate Quikr chat with provider
  - **Book Directly**: if instant booking available, proceed to booking
- For quote/enquiry, use `ask_user` to get user's detailed requirement message.
- Take snapshot of enquiry/quote form.
- Use `confirm_action` to present:
  - Selected provider name and rating
  - Service requested
  - User's requirement details
  - Contact method chosen
  - Estimated price range
- Do NOT send enquiry unless user confirms.

### 6. Submit & Book
- Submit enquiry or initiate booking.
- If direct booking with payment:
  - Use `collect_payment`:
    - summary: JSON with service, provider, date, amount
    - amount_inr: booking/advance amount
    - description: "Quikr service booking"
  - STOP and WAIT for payment confirmation.
- Handle OTP or verification via `ask_user` if needed.
- Take snapshot of confirmation.

### 7. Final Summary
- Take snapshot of final state.
- Report: provider name, contact number, rating, service requested, enquiry status, estimated cost.
- If multiple quotes requested: "You'll receive responses from X providers. Compare quotes and reviews before choosing."
- Mention: "Provider will contact you shortly. For Quikr-verified providers, service quality is assured. Always confirm pricing before service starts."

## Site Notes

- Quikr is one of India's largest classifieds and services marketplace.
- Chrome Profile 3 (rsinghtomar3011@gmail.com) must be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Quikr has both professional service providers and individual freelancers — quality varies.
- QuikrAssured/Verified providers have background checks and quality guarantees — prefer these.
- Ratings: 4.0+ with 10+ reviews is reliable. Be cautious with new profiles or very few reviews.
- Quikr sometimes shows inflated review counts — cross-check with actual review text.
- Price ranges are estimates. Always confirm final price with provider before service.
- For packers & movers: Quikr aggregates quotes from multiple providers — helpful for comparison.
- Quikr may show sponsored listings at top — these are paid placements, not necessarily best quality.
- Service availability varies by city. Tier-1 cities have best coverage.
- Payment: most services are pay-after-service. Advance booking available for some categories.
- Use `confirm_action` before sending any enquiry or booking. WAIT for user response at each step.
