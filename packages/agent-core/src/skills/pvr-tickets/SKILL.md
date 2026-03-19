---
name: pvr-tickets
description: Book PVR INOX movie tickets on pvrcinemas.com — select movie, cinema, showtime, seats, food combos, and pay.
triggers:
  - pvr
  - pvr tickets
  - pvr movie
  - pvr inox
  - book pvr
  - pvr cinema
  - pvr showtime
  - pvr booking
  - pvr seats
  - inox tickets
  - movie at pvr
siteUrl: https://www.pvrcinemas.com
requiresAuth: true
params:
  - name: movie
    required: true
    hint: Movie name (e.g. "Pushpa 2", "Avengers", "latest Hindi movie")
  - name: city
    required: false
    hint: City (e.g. "Delhi", "Mumbai", "Bangalore"). Auto-detected from profile.
  - name: date
    required: false
    hint: Preferred date (e.g. "today", "tomorrow", "Saturday", "March 25")
  - name: seats
    required: false
    hint: Number of seats (default 2) and preference (e.g. "2 seats, recliner")
  - name: format
    required: false
    hint: Preferred format (e.g. "2D", "3D", "IMAX", "4DX", "ICE", "P[XL]")
---

# PVR INOX Movie Tickets

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect booking preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **what** (type: "text", required): Movie name, event, or "what's showing"
2. **date** (type: "chip_bar"): Today, Tomorrow, This Weekend
3. **tickets** (type: "stepper"): Number of tickets, counter with default 2, min 1, max 10

**CRITICAL**: Do NOT open the browser without knowing what to book.
### 1. Gather Movie Details
- Confirm movie name. If user said "latest movie" or just a genre, will browse current listings.
- Get city (if not auto-detected), date preference, number of seats, seat class, format.
- Use `ask_user` for missing critical info (movie name at minimum).
- Default to 2 seats if not specified.

### 2. Open PVR & Set City
- Open a NEW tab and navigate to `https://www.pvrcinemas.com`.
- Take snapshot. If city selection modal appears, select the user's city.
- Dismiss any promotional popups, offer banners, or app download prompts.
- Verify logged in (profile name or icon in top-right header).
- If NOT logged in, login transparently via Google sign-in or phone+OTP. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Find Movie
- Search for the movie using the search bar or browse "Now Showing" section.
- Take snapshot. Click the correct movie from results.
- If multiple formats (2D, 3D, IMAX, 4DX, ICE, P[XL], ScreenX), present via `ask_user` (input_type "choice").
- If multiple languages available, present via `ask_user`.

### 4. Select Cinema & Showtime
- Movie detail page shows cinemas with showtimes for the selected date. Take snapshot.
- Use date picker to select preferred date if not already set.
- Extract top 4-5 cinema options: cinema name (PVR/INOX), mall/location, showtimes, format, price range.
- Use `ask_user` (input_type "choice") to present options. Format:
  "PVR Director's Cut, Ambience Mall — 7:30 PM — IMAX 3D — ₹500-1200"
- Click selected showtime.

### 5. Select Seats
- Seat map loads. Take snapshot.
- Identify seat categories: Classic, Prime, Premium, Recliner, Luxe.
- Present categories with pricing via `ask_user` (input_type "choice"):
  "Classic — ₹280/seat"
  "Prime — ₹400/seat"
  "Recliner — ₹800/seat"
  "Luxe — ₹1,200/seat"
- Select best available seats in chosen category (prefer center, mid-rows for best view).
- Take snapshot showing selected seats with seat numbers.

### 6. Food & Beverages (Optional)
- PVR shows F&B add-on page. Take snapshot.
- Ask user via `ask_user`: "Would you like to add popcorn/drinks? Or skip?"
- If yes, present top combos via `ask_user` (input_type "choice"):
  "Large Popcorn + 2 Cokes — ₹650"
  "Cheese Nachos + Pepsi — ₹450"
  "Skip food"

### 7. Review & Confirm
- Proceed to booking summary. Take snapshot.
- Use `confirm_action`:
  - Movie name, language, format
  - Cinema name (PVR/INOX), screen number, location
  - Date and showtime
  - Seat numbers and category
  - Food add-ons (if any)
  - Price per seat, food total, internet handling fee, GST, total
- Do NOT proceed unless user confirms.

### 8. Payment
- Use `collect_payment`:
  - summary: JSON with movie, cinema, showtime, seats, food, format, price breakdown, total
  - amount_inr: total amount (number)
  - description: "PVR INOX movie tickets"
- STOP and WAIT for payment confirmation.

### 9. Complete Booking & Confirm
- Complete payment on PVR. Handle OTP via `ask_user` if needed.
- Take snapshot of e-ticket/confirmation page.
- Report: booking ID, movie, cinema, screen, date, showtime, seat numbers, format, food orders, total paid.
- Mention: "Show the e-ticket QR code at PVR entrance. Collect food at the counter. Arrive 15 minutes early."

## Site Notes

- PVR INOX is India's largest cinema chain (merged PVR + INOX). Website covers all PVR and INOX screens.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Internet handling fee: ₹35-60 per ticket + 18% GST — always include in total shown to user.
- PVR has premium formats: IMAX, 4DX, ICE (Immersive Cinema Experience), P[XL], ScreenX — all significantly pricier.
- "Director's Cut" cinemas are ultra-premium with in-seat dining — prices start ₹1,000+.
- PVR Privilege loyalty points may apply — check if logged-in account has rewards balance.
- Food pre-ordering saves queue time at the cinema — suggest it as a convenience.
- Cancellation: PVR allows refund up to 20 minutes before showtime (minus convenience fee).
- Weekend/holiday shows fill fast — if "Fast Filling" tag is visible, urge quick confirmation.
- PVR app offers exclusive discounts — but website booking works fine for our flow.
- Use `confirm_action` for booking review, `collect_payment` for checkout. WAIT for user response.
