---
name: bigcinemas-tickets
description: Book movie tickets at Cinepolis cinemas via their website — select movie, location, showtime, seats, and pay.
triggers:
  - cinepolis
  - cinepolis tickets
  - cinepolis movie
  - book cinepolis
  - cinepolis booking
  - cinepolis showtime
  - cinepolis movie tickets
  - big cinemas
  - cinepolis seats
  - movie at cinepolis
siteUrl: https://www.cinepolisindia.com
requiresAuth: true
params:
  - name: movie
    required: true
    hint: Movie name (e.g. "Pushpa 2", "Avengers", "latest Hindi movie")
  - name: city
    required: false
    hint: City (e.g. "Delhi", "Mumbai", "Pune"). Auto-detected if already set.
  - name: date
    required: false
    hint: Preferred date (e.g. "today", "Saturday", "March 25")
  - name: seats
    required: false
    hint: Number of seats (default 2) and preference (e.g. "2 seats, VIP")
  - name: format
    required: false
    hint: Preferred format (e.g. "2D", "3D", "4DX", "IMAX")
---

# Cinepolis Movie Tickets

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect booking preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **what** (type: "text", required): Movie name, event, or "what's showing"
2. **date** (type: "chip_bar"): Today, Tomorrow, This Weekend
3. **tickets** (type: "stepper"): Number of tickets, counter with default 2, min 1, max 10

**CRITICAL**: Do NOT open the browser without knowing what to book.
### 1. Gather Movie Details
- Confirm movie name. If user said "latest movie" or genre, will browse what is playing.
- Get city (if not set), date preference, number of seats, format preference (2D/3D/4DX).
- Use `ask_user` for missing critical info (movie name at minimum).
- Default seats to 2 if not specified.

### 2. Open Cinepolis & Set Location
- Open a NEW tab and navigate to `https://www.cinepolisindia.com`.
- Take snapshot. If city/location selection popup appears, select the user's city.
- Dismiss any promotional popups, app download banners, or cookie consent.
- Verify logged in (profile icon or name in header/navigation).
- If NOT logged in, login transparently using Google sign-in or email. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Find Movie & Showtimes
- Search for the movie using the search functionality or browse "Now Showing" section.
- Take snapshot. Click the correct movie from results.
- If multiple formats available (2D, 3D, 4DX, MX4D), present via `ask_user` (input_type "choice").
- If multiple languages, present via `ask_user`.
- Select the preferred date.

### 4. Select Cinema & Showtime
- View available cinemas and showtimes. Take snapshot.
- Extract top 3-5 options: cinema name, location/mall, showtime(s), format, price range.
- Use `ask_user` (input_type "choice") to present options. Format:
  "Cinepolis Viviana Mall, Thane — 7:15 PM — 4DX — ₹400-700"
- Click the selected showtime.

### 5. Select Seats
- Seat layout appears. Take snapshot.
- Identify seat categories with prices: Classic, Premium, VIP, Recliner, Luxe.
- Present categories via `ask_user` (input_type "choice"):
  "Classic — ₹250/seat"
  "Premium — ₹350/seat"
  "VIP Recliner — ₹600/seat"
- Select best available seats in chosen category (prefer center rows).
- Take snapshot showing selected seats and seat numbers.

### 6. Review & Confirm
- Proceed to booking summary. Take snapshot.
- Use `confirm_action`:
  - Movie name, format, language
  - Cinema name, screen number
  - Date and showtime
  - Seat numbers and category
  - Price per seat, internet handling fee, GST, total
- Do NOT proceed unless user confirms.

### 7. Payment
- Use `collect_payment`:
  - summary: JSON with movie, cinema, showtime, seats, format, price breakdown, total
  - amount_inr: total amount (number)
  - description: "Cinepolis movie tickets"
- STOP and WAIT for payment confirmation.

### 8. Complete Booking & Confirm
- Complete payment on Cinepolis. Handle OTP via `ask_user` if needed.
- Take snapshot of booking confirmation/ticket page.
- Report: booking ID, movie, cinema, screen, date, showtime, seat numbers, format, total paid.
- Mention: "Show the e-ticket QR code at the cinema entrance. Arrive 15 minutes before showtime."

## Site Notes

- Cinepolis is one of the largest cinema chains in India with presence in malls across major cities.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Internet handling fee: ₹25-50 per ticket, plus GST — always included in the total shown to user.
- 4DX and MX4D tickets are significantly more expensive (2-3x regular) — clarify user preference.
- Cinepolis "VIP" and "Macro XE" are premium large-format screens — mention if available.
- Food combos may be offered during checkout — ask user if they want to add popcorn/drinks.
- Cancellation: typically not allowed after booking on Cinepolis — warn user before confirming.
- Weekend and holiday pricing is higher than weekday — mention the difference if applicable.
- Cinepolis website may load slowly — wait for full page load before taking snapshots.
- Recliner seats are very popular and sell out fast — suggest booking early for prime shows.
- Use `confirm_action` for booking review, `collect_payment` for checkout. WAIT for user response.
