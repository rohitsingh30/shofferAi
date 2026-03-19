---
name: paytm-movies
description: Book movie tickets on Paytm Movies — select movie, showtime, seats, pay.
triggers:
  - paytm movies
  - book movie paytm
  - movie tickets paytm
  - paytm cinema
  - paytm movie booking
  - watch movie paytm
  - paytm show tickets
  - paytm film tickets
siteUrl: https://paytm.com/movies
requiresAuth: true
params:
  - name: movie
    required: false
    hint: Movie name (e.g. "Pushpa 2", "Singham Again")
  - name: city
    required: false
    hint: City for the movie (e.g. "Mumbai", "Delhi")
  - name: date
    required: false
    hint: Preferred date (e.g. "today", "tomorrow", "Saturday")
  - name: seats
    required: false
    hint: Number of seats and preference (e.g. "2 seats, prefer back row")
---

# Paytm Movies Ticket Booking

Chrome profile: rsinghtomar3011@gmail.com. Operator Paytm account logged in.

## Steps


### Step 0: Collect booking preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **what** (type: "text", required): Movie name, event, or "what's showing"
2. **date** (type: "chip_bar"): Today, Tomorrow, This Weekend
3. **tickets** (type: "stepper"): Number of tickets, counter with default 2, min 1, max 10

**CRITICAL**: Do NOT open the browser without knowing what to book.
### 1. Gather Requirements
- Check if user specified movie name, city, date, and number of seats.
- If movie not specified, use `ask_user` (input_type "freetext"): "Which movie do you want to watch?"
- If city not specified, use `ask_user` (input_type "freetext"): "Which city are you in?"
- If date not specified, use `ask_user` (input_type "choice") with options: "Today", "Tomorrow", or specific dates.
- If seats not specified, use `ask_user` (input_type "freetext"): "How many seats do you need?"

### 2. Open Paytm Movies
- Open a NEW tab and navigate to `https://paytm.com/movies`.
- Take a snapshot to verify page loaded.
- Check if logged in (profile icon visible with account name).
- **If NOT logged in or session expired, STOP and tell user: "Paytm session expired, please re-login in Chrome Debug."**
- Do NOT ask user for credentials.
- Set city if prompted or if default city is wrong.

### 3. Verify Login & Select Movie
- Take snapshot confirming Paytm Movies page with correct city.
- Search for the requested movie or browse "Now Showing" section.
- Take snapshot of movie listing.
- If movie not found, inform user and show what's currently playing.
- Click on the selected movie to see showtimes.
- Take snapshot of movie details page (rating, language, format options).

### 4. Select Showtime & Cinema
- Filter by date (user's preferred date).
- Take snapshot of available cinemas and showtimes.
- Present options using `ask_user` (input_type "choice"):
  - Cinema name, showtime, format (2D/3D/IMAX), price range
- User selects preferred showtime.
- Click on the selected showtime.
- Take snapshot of seat map.

### 5. Select Seats
- Take snapshot of seat layout showing available/occupied seats.
- Present seating categories using `ask_user` (input_type "choice"):
  - Category (Recliner, Premium, Classic, etc.), price per seat
- Select the requested number of seats in user's preferred area.
- If specific seats are requested, select those. Otherwise, pick best available.
- Take snapshot showing selected seats highlighted.
- Use `confirm_action` to present booking summary:
  - Movie, cinema, date, showtime, format
  - Seats: numbers, category, price each
  - Convenience fee, total amount
- Do NOT proceed unless user confirms.

### 6. Checkout & Payment
- Click proceed to payment.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with movie, cinema, showtime, seats, category, convenience fee, total
  - amount_inr: total amount including fees (number)
  - description: "Paytm Movies ticket booking"
- STOP and WAIT for payment confirmation.
- Only proceed if payment confirmed. If cancelled, ask what to change.

### 7. Complete & Confirm
- Complete the booking on Paytm.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of booking confirmation page.
- Report: booking ID, movie, cinema, date, showtime, seat numbers, total paid, QR/barcode for entry.

## Site Notes

- Paytm Movies shows currently running + advance booking movies.
- Seat maps update in real-time — seats can get booked while browsing.
- Convenience fee (Rs 30-50 per ticket) is added at checkout — include in total.
- Operator Chrome Profile 3 is logged in. Do NOT ask user for phone or credentials.
- Paytm website uses React — wait for seat map to fully load before selecting.
- Session managed by cookies. If expired, operator re-logins in Chrome Debug.
- Cashback offers may be available via Paytm Wallet — mention if visible.
- IMAX/3D tickets cost more — clarify format preference with user.
- Tickets are non-refundable after booking — make sure user confirms.
- Use `confirm_action` for booking review (no money), `collect_payment` for actual payment.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
- Movie showtimes vary by city — always confirm city first.
