---
name: igp-gifts
description: Send gifts online via IGP — cakes, flowers, hampers, personalized gifts delivered to any address in India.
triggers:
  - igp
  - igp gifts
  - send gift
  - send cake
  - send flowers
  - gift delivery
  - online gift
  - birthday gift delivery
  - anniversary gift
  - send hamper
siteUrl: https://www.igp.com
requiresAuth: true
params:
  - name: giftType
    required: true
    hint: Type of gift (e.g. "cake", "flowers", "hamper", "personalized mug", "chocolate box")
  - name: occasion
    required: false
    hint: Occasion (e.g. "birthday", "anniversary", "Diwali", "Valentine's Day", "housewarming")
  - name: deliveryCity
    required: true
    hint: Delivery city or pincode (e.g. "Delhi", "Mumbai", "110001")
  - name: deliveryDate
    required: false
    hint: Delivery date (e.g. "tomorrow", "March 25", "same day")
  - name: budget
    required: false
    hint: Budget range (e.g. "under 1000", "500-2000", "premium")
  - name: recipientName
    required: false
    hint: Recipient's name for the delivery
---

# IGP Online Gift Delivery

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm gift type and delivery city. If any required param is missing, use `ask_user`.
- Get occasion, delivery date, budget, and recipient name if not provided.
- Note any customization requests (message on cake, personalization text, add-on items).
- Default delivery date to "earliest available" if not specified.

### 2. Open IGP & Verify Login
- Open a NEW tab and navigate to `https://www.igp.com`.
- Take snapshot. Dismiss any promotional popups, newsletter signup, or offer banners.
- Verify logged in (account icon or name visible in header).
- If NOT logged in, login transparently using Google sign-in or email. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search Gifts
- Use the search bar or navigate to the appropriate category (e.g. `/cakes`, `/flowers`, `/gift-hampers`).
- Set delivery city/pincode in the location selector.
- Apply filters: occasion, price range, delivery type (same-day, midnight, standard).
- Take snapshot of search results.

### 4. Present Top Options
- Extract 4-6 top gifts with: name, price, rating, delivery options (same-day/express/standard), weight/size, and thumbnail description.
- Note any ongoing offers or combo deals.
- Use `ask_user` (input_type "choice") to present options. Format:
  "Red Velvet Cake (1 kg) — ₹899 — Same-day delivery — 4.6★ (230 reviews)"
- Add "Show more results" as last option.

### 5. View Gift Details & Customize
- Click selected gift. Take snapshot of product detail page.
- Extract: full description, available sizes/variants, add-ons (balloons, candles, greeting card), personalization options.
- If variants exist (size, flavor, color), use `ask_user` (input_type "choice"):
  "Half kg — ₹599"
  "1 kg — ₹899"
  "2 kg — ₹1,499"
- If personalization available (message on cake, photo upload, custom text), ask user via `ask_user`.
- Add any requested add-ons to cart.

### 6. Fill Delivery Details
- Proceed to checkout. Take snapshot.
- Fill delivery address: recipient name, full address, city, pincode, phone number.
- Use `ask_user` for recipient's address and phone if not already known.
- Select delivery date and time slot (morning, afternoon, evening, midnight if available).
- Add gift message/greeting card text if user wants.

### 7. Review & Confirm
- Take snapshot of order summary.
- Use `confirm_action` to present full order summary:
  - Gift name, size/variant
  - Personalization/message details
  - Recipient name and delivery address
  - Delivery date and time slot
  - Price breakdown: item cost, delivery charge, add-ons, discount, total
- Do NOT proceed unless user confirms.

### 8. Payment
- Use `collect_payment`:
  - summary: JSON with gift name, variant, recipient, delivery date, address, price breakdown, total
  - amount_inr: total amount (number)
  - description: "IGP gift delivery"
- STOP and WAIT for payment confirmation.

### 9. Complete Order & Confirm
- Complete payment on IGP. Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, gift name, recipient, delivery address, delivery date/time, total paid, tracking link if available.
- Mention: "You will receive delivery confirmation via email/SMS. IGP provides photo proof of delivery for most orders."

## Site Notes

- IGP (Indian Gifts Portal) is one of India's largest online gifting platforms with pan-India delivery.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Same-day delivery is available in 350+ cities — check availability for the pincode before promising.
- Midnight delivery (11:30 PM - 12:30 AM) costs extra ₹200-400 and is popular for birthdays.
- Cakes are delivered fresh from local bakeries — flavor/design may vary slightly from photos.
- Personalized gifts (mugs, cushions, photo frames) take 1-2 extra days for preparation.
- IGP provides "photo proof of delivery" for cakes and flowers — mention this to the user.
- Delivery charges vary by city and speed: standard ₹0-99, express ₹149-249, midnight ₹249-399.
- Festival seasons (Diwali, Rakhi, Valentine's) have surge pricing and limited slots — book early.
- If delivery fails (recipient not available), IGP attempts redelivery next day.
- Use `confirm_action` for order review, `collect_payment` for checkout. WAIT for user response.
