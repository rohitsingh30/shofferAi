---
name: bookmyshow-movie
description: Book movie tickets on BookMyShow — pick movie, cinema, showtime, seats, pay.
triggers:
  - bookmyshow
  - book movie
  - movie tickets
  - book movie tickets
  - cinema tickets
  - book show
  - movie booking
  - bms tickets
  - watch movie
siteUrl: https://in.bookmyshow.com
requiresAuth: true
params:
  - name: movie
    required: true
    hint: Movie name (e.g. "Pushpa 2", "Avengers", "latest Hindi movie")
  - name: city
    required: false
    hint: City (e.g. "Delhi", "Mumbai"). Auto-detected if already set on BMS.
  - name: date
    required: false
    hint: Preferred date (e.g. "today", "Saturday", "March 25")
  - name: seats
    required: false
    hint: Number of seats (default 2) and preference (e.g. "2 seats, premium")
---

# BookMyShow Movie Tickets

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Movie Details
- Confirm movie name. If user said "latest movie" or genre, will browse what's playing.
- Get: city (if not set), date preference, number of seats, seat class preference.
- Use `ask_user` for missing critical info (movie name at minimum).

### 2. Open BookMyShow & Set City
- Open a NEW tab and navigate to `https://in.bookmyshow.com`.
- Take snapshot. If city selection popup appears, select user's city.
- Verify logged in (profile icon in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Find Movie
- Search for the movie in the search bar, or browse "Now Showing" section.
- Take snapshot. Click the correct movie from results.
- If multiple formats (2D, 3D, IMAX, 4DX), present via `ask_user` (input_type "choice").
- If multiple languages, present via `ask_user`.

### 4. Select Cinema & Showtime
- Movie page shows cinemas with showtimes. Take snapshot.
- Filter by: date, time preference (morning/afternoon/evening/night), cinema proximity.
- Extract top 3-5 options: cinema name, distance, showtime(s), price range, format.
- Use `ask_user` (input_type "choice"): "PVR Saket — 7:00 PM — ₹350-600 — IMAX"
- Click selected showtime.

### 5. Select Seats
- Seat map appears. Take snapshot.
- Identify seat categories: Silver/Gold/Platinum/Recliner with prices.
- Present categories via `ask_user` (input_type "choice"): "Gold — ₹400/seat", "Platinum — ₹600/seat".
- Select best available seats in chosen category (prefer center, mid-rows).
- Take snapshot showing selected seats.

### 6. Review & Confirm
- Proceed to booking summary. Take snapshot.
- Use `confirm_action`:
  - Movie name, format, language
  - Cinema name, screen
  - Date and showtime
  - Seat numbers and category
  - Price per seat, convenience fee, total
- Do NOT proceed unless user confirms.

### 7. Payment
- Use `collect_payment`:
  - summary: JSON with movie, cinema, showtime, seats, total
  - amount_inr: total
  - description: "BookMyShow movie tickets"
- WAIT for payment confirmation.

### 8. Complete & Confirm
- Complete payment. Handle OTP via `ask_user` if needed.
- Take snapshot of ticket/confirmation.
- Report: booking ID, movie, cinema, screen, date, showtime, seat numbers, total paid, QR code info.
- Mention: "Show this booking at the cinema entrance. Arrive 15 minutes early."

## Site Notes

- BookMyShow is India's #1 movie ticket platform.
- Convenience fee: ₹30-75 per ticket — always included in total.
- Popular movies sell out fast — "Fast Filling" tag means hurry.
- "Sold Out" shows are not bookable — suggest alternative times.
- IMAX/4DX tickets are 2-3x more expensive than regular — clarify preference.
- Food combos may be offered during checkout — ask user if interested.
- BMS offers/coupons (bank discounts, "Buy 1 Get 1") — always check and mention.
- M-ticket (mobile ticket) is standard — no physical ticket needed.
- Cancellation: possible up to a few hours before show, partial refund.
- Recliner seats are premium but very popular — mention availability.
- Weekend/holiday shows have higher prices — inform user.
- Use `confirm_action` for review, `collect_payment` for checkout. WAIT for user response.
