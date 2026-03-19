---
name: wedmegood-wedding
description: Find and book wedding vendors on WedMeGood — photographers, venues, decorators, makeup artists, caterers.
triggers:
  - wedmegood
  - wedding vendor
  - wedding photographer
  - wedding venue
  - wedding decorator
  - wedding planner
  - find wedding vendor
  - book wedding vendor
  - wedding makeup artist
  - wedding caterer
siteUrl: https://www.wedmegood.com
requiresAuth: true
params:
  - name: vendorType
    required: true
    hint: Type of vendor (e.g. "photographer", "venue", "decorator", "makeup artist", "caterer", "planner")
  - name: city
    required: true
    hint: City (e.g. "Delhi", "Mumbai", "Jaipur", "Bangalore")
  - name: budget
    required: false
    hint: Budget range (e.g. "under 1 lakh", "2-5 lakhs", "premium")
  - name: weddingDate
    required: false
    hint: Wedding date or month (e.g. "December 2026", "Feb 15 2027")
---

# WedMeGood Wedding Vendors

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm vendor type (photographer, venue, decorator, makeup artist, caterer, planner, etc.).
- Get city. If not specified, use `ask_user` to ask.
- Note budget range, wedding date, and any specific style preferences (traditional, contemporary, destination).
- Use `ask_user` for any missing critical info (vendor type and city are required).

### 2. Open WedMeGood & Verify Login
- Open a NEW tab and navigate to `https://www.wedmegood.com`.
- Take snapshot. Dismiss any app-download or promotional popups.
- Verify logged in (profile icon or name visible in header).
- If NOT logged in, login transparently using Google sign-in. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search Vendors
- Navigate to the appropriate vendor category page (e.g. `/vendors/wedding-photographers/Delhi-NCR/`).
- Set city filter if not already set from URL.
- Apply budget filter if user specified a range.
- Apply any style/sub-category filters (e.g. candid photography, farmhouse venue).
- Take snapshot of search results.

### 4. Present Top Options
- Extract 4-6 top vendors with: name, rating, reviews count, starting price, location, portfolio highlights.
- Check for WedMeGood "Trusted" or "Featured" badges.
- Use `ask_user` (input_type "choice") to present options. Format:
  "Vendor Name — 4.8★ (120 reviews) — Starts ₹X,XX,XXX — Location — Trusted Badge"
- Add "Show more results" as last option.

### 5. View Vendor Profile
- Click selected vendor. Take snapshot of vendor profile page.
- Extract: full portfolio (photo count), detailed pricing/packages, availability, services included, past wedding albums.
- Present a summary of the vendor's packages via `ask_user` (input_type "choice"):
  "Basic Package — ₹80,000 — 1 day, 200 photos"
  "Premium Package — ₹1,50,000 — 2 days, 500 photos + video"
- If vendor has reviews, mention top review highlights.

### 6. Check Availability & Confirm
- Click "Check Availability" or "Send Message" for the selected vendor/package.
- Fill in wedding date, event type, guest count if prompted.
- Take snapshot of availability response or booking form.
- Use `confirm_action` to present booking summary:
  - Vendor name and type
  - Selected package and inclusions
  - City and venue (if applicable)
  - Wedding date
  - Total price / advance amount
  - Cancellation/refund policy
- Do NOT proceed unless user confirms.

### 7. Payment
- Use `collect_payment`:
  - summary: JSON with vendor name, package, date, city, total/advance amount
  - amount_inr: advance or total amount (number)
  - description: "WedMeGood vendor booking"
- STOP and WAIT for payment confirmation.

### 8. Complete Booking & Confirm
- Complete the booking/advance payment on WedMeGood.
- Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: booking/inquiry ID, vendor name, package, date, amount paid, vendor contact details.
- Mention: "The vendor will contact you within 24 hours to finalize details. Save the vendor's direct number."

## Site Notes

- WedMeGood is India's leading wedding planning platform with 100K+ vendors across cities.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Vendor prices on WedMeGood are "starting from" — actual quote may vary based on requirements.
- "Trusted" badge means WedMeGood has verified the vendor — prefer these when possible.
- Many vendors require an advance (10-30%) to confirm the date — remaining is paid closer to event.
- Reviews are verified — check for recency and relevance (same city, similar budget).
- WedMeGood may show popups for app download or login — dismiss all immediately.
- Peak wedding season (Nov-Feb) has higher prices and lower availability — book early.
- Some vendors list on multiple platforms — WedMeGood pricing may include platform commission.
- Use `confirm_action` for booking review, `collect_payment` for checkout. WAIT for user response.
