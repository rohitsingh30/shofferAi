---
name: onlinepuja-temple
description: Book online puja at temples via OnlinePrasad or DevDarshan — virtual puja, prasad delivery, and temple donations across India.
triggers:
  - online puja booking
  - book puja online
  - temple puja booking
  - onlineprasad puja
  - devdarshan puja
  - book puja at temple
  - virtual puja
  - online temple puja
  - puja booking india
  - book havan online
  - temple prasad delivery
  - online darshan booking
siteUrl: https://www.onlineprasad.com
requiresAuth: true
params:
  - name: temple
    required: false
    hint: Temple name or location (e.g. "Siddhivinayak Mumbai", "Tirupati Balaji", "Vaishno Devi")
  - name: puja_type
    required: false
    hint: Type of puja (e.g. "Ganesh Puja", "Satyanarayan Katha", "Rudrabhishek", "Navgraha Shanti")
  - name: date
    required: false
    hint: Preferred date for puja (e.g. "next Tuesday", "2026-03-20")
  - name: prasad_delivery
    required: false
    hint: Whether to get prasad delivered to home (yes/no)
  - name: names
    required: false
    hint: Names for sankalp/prayer (e.g. "Rohit Tomar, family")
---

# Online Puja Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine what puja the user wants. Options:
  - **Specific temple puja** — user names a temple (e.g. Siddhivinayak, Tirupati, Mahakal).
  - **Specific puja type** — user names a puja (e.g. Satyanarayan Katha, Rudrabhishek, Navgraha Shanti).
  - **Occasion-based** — birthday, anniversary, new home, exam success, health recovery.
  - **Browse popular pujas** — show trending/popular options.
- Ask preferred date via `ask_user` if not specified.
- Ask for names for sankalp (prayer dedication) via `ask_user` (input_type "text"):
  - "Please provide the name(s) for the puja sankalp (e.g. your name or family members)"
- Ask if user wants prasad delivered to home via `ask_user` (input_type "choice"):
  - "Yes, deliver prasad to my address"
  - "No prasad delivery needed"
- If prasad delivery, ask for delivery address.

### 2. Open OnlinePrasad & Verify Login
- Open a NEW tab and navigate to `https://www.onlineprasad.com`.
- Take snapshot. Check if logged in (profile section in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Dismiss any pop-ups, notification prompts, or app install banners.
- If OnlinePrasad is unavailable, try DevDarshan at `https://www.devdarshan.com` as alternative.

### 3. Search & Select Puja
- If user specified a temple, search for that temple in the search bar.
- If user specified a puja type, search for that puja.
- If browsing, navigate to popular pujas or temple categories.
- Take snapshot of search results / puja listings.
- Present top 3-5 relevant pujas to user via `ask_user` (input_type "choice") with:
  - Puja name and temple
  - Price (₹)
  - Duration
  - Includes prasad delivery: yes/no
  - Available dates
- Let user select a puja.

### 4. Configure Puja Details
- Navigate to the selected puja page.
- Take snapshot of puja details page.
- Show user the full details:
  - Puja name, temple, and pandit details
  - Description of puja and its benefits
  - Price breakdown (puja fee + prasad delivery if applicable)
  - Available dates and time slots
- Select the preferred date and time slot.
- Enter names for sankalp/prayer.
- Enter gotra if asked (use `ask_user` to get from user).
- If prasad delivery, enter delivery address.
- Select any add-ons (extra offerings, special prasad, donation to temple).
- Take snapshot with all details filled.

### 5. Confirm Booking
- Use `confirm_action` with puja booking summary:
  - Puja name and temple
  - Date and time slot
  - Names for sankalp
  - Prasad delivery: yes/no (with address if yes)
  - Puja fee: ₹X,XXX
  - Prasad delivery fee: ₹X (if applicable)
  - Total: ₹X,XXX
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Payment
- Use `collect_payment`:
  - summary: JSON with puja_name, temple, date, time, sankalp_names, prasad_delivery, puja_fee, delivery_fee, total
  - amount_inr: total amount
  - description: "Online puja booking"
- STOP and WAIT for payment confirmation.

### 7. Complete Booking & Confirm
- Proceed with payment on the platform (UPI / card / net banking).
- Handle OTP via `ask_user` if needed.
- Take snapshot of booking confirmation page.
- Report to user: puja name, temple, date/time, booking ID, prasad delivery timeline if applicable.
- Mention: "You will receive a confirmation email with booking details. Video/photo of the puja may be shared on the scheduled date."

## Site Notes

- OnlinePrasad and DevDarshan are leading platforms for booking pujas at temples across India with prasad delivery.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in. Do NOT ask user for credentials.
- Puja prices vary widely — from ₹251 for basic pujas to ₹25,000+ for elaborate havans at major temples.
- Prasad delivery typically takes 5-7 business days after the puja is performed.
- Some pujas are date-specific (e.g. Navratri, Shivratri) — check availability for the requested date.
- Video or photo proof of puja completion is usually shared via email or WhatsApp.
- OnlinePrasad covers 100+ temples including Siddhivinayak, Tirupati, Vaishno Devi, Mahakal, Somnath, Kashi Vishwanath.
- Gotra is sometimes required for Vedic pujas — ask user if the form requires it.
- Refund policy varies by platform — typically no refund once puja date is confirmed.
- Use `confirm_action` for booking review, `collect_payment` for checkout. Always WAIT for user response.
