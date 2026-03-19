---
name: floweraura-flowers
description: Order flowers and cakes on FlowerAura — same-day delivery, bouquets, combos, personalized gifts for all occasions.
triggers:
  - floweraura
  - order flowers
  - flower delivery
  - send bouquet
  - floweraura cake
  - same day flowers
  - birthday flowers
  - anniversary flowers
  - flower arrangement
  - floweraura delivery
siteUrl: https://www.floweraura.com
requiresAuth: true
params:
  - name: productType
    required: true
    hint: Type of product (e.g. "flowers", "cake", "combo", "plants", "personalized gift")
  - name: occasion
    required: false
    hint: Occasion (e.g. "birthday", "anniversary", "Valentine's", "congratulations", "sympathy")
  - name: deliveryCity
    required: true
    hint: Delivery city or pincode (e.g. "Delhi", "Bangalore", "400001")
  - name: deliveryDate
    required: false
    hint: Delivery date (e.g. "today", "tomorrow", "March 25")
  - name: budget
    required: false
    hint: Budget range (e.g. "under 800", "1000-2000", "premium")
---

# FlowerAura Flowers & Cakes Delivery

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm product type (flowers, cake, combo, plants) and delivery city. Use `ask_user` if missing.
- Get occasion, delivery date, budget, and any color/flower preferences (roses, lilies, orchids, mixed).
- Note if user wants a combo (flowers + cake, flowers + chocolate, etc.).
- Default delivery date to "earliest available" if not specified.

### 2. Open FlowerAura & Verify Login
- Open a NEW tab and navigate to `https://www.floweraura.com`.
- Take snapshot. Dismiss any popups (offers, newsletter signup, app download).
- Verify logged in (account/profile icon in header).
- If NOT logged in, login transparently using Google or email. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Set Location & Search
- Set delivery pincode/city in the location selector on the homepage.
- Navigate to the appropriate category (e.g. `/flowers`, `/cakes`, `/combos`) or use search bar.
- Apply filters: occasion, price range, flower type, delivery type (same-day, fixed-time, midnight).
- Sort by popularity or price as per user preference.
- Take snapshot of product listing page.

### 4. Present Top Options
- Extract 4-6 top products with: name, price, rating, reviews, delivery options, size/quantity description.
- Note any active offers or discount codes.
- Use `ask_user` (input_type "choice") to present options. Format:
  "Red Roses Bouquet (12 stems) — ₹749 — Same-day delivery — 4.7★ (450 reviews)"
- Add "Show more results" as last option.

### 5. View Product & Select Variant
- Click selected product. Take snapshot of product detail page.
- Extract: full description, available sizes/variants, add-ons (vase, chocolate, teddy, greeting card), delivery slots.
- If variants exist (bouquet size, cake weight, color), present via `ask_user` (input_type "choice"):
  "Standard (12 roses) — ₹749"
  "Premium (24 roses) — ₹1,199"
  "Luxury (50 roses) — ₹2,499"
- Offer add-ons: "Add chocolate box — ₹299", "Add teddy bear — ₹399".

### 6. Fill Delivery Details
- Proceed to checkout. Take snapshot.
- Fill recipient details: name, address, city, pincode, phone number.
- Use `ask_user` for recipient's full address and phone if not known.
- Select delivery date and preferred time slot:
  - Standard (9 AM - 8 PM)
  - Fixed-time (2-hour window, extra charge)
  - Midnight (11 PM - 12 AM, extra charge)
  - Early morning (6 AM - 9 AM, extra charge)
- Add gift message or greeting card text if user wants.

### 7. Review & Confirm
- Take snapshot of order summary page.
- Use `confirm_action` to present full order summary:
  - Product name and variant/size
  - Add-ons included
  - Recipient name and delivery address
  - Delivery date and time slot
  - Gift message text
  - Price breakdown: item, add-ons, delivery charge, discount, total
- Do NOT proceed unless user confirms.

### 8. Payment
- Use `collect_payment`:
  - summary: JSON with product, variant, add-ons, recipient, delivery date/slot, address, total
  - amount_inr: total amount (number)
  - description: "FlowerAura delivery order"
- STOP and WAIT for payment confirmation.

### 9. Complete Order & Confirm
- Complete payment on FlowerAura. Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product name, recipient, delivery address, delivery date/time slot, total paid.
- Mention: "FlowerAura sends photo confirmation upon delivery. Track your order on the website or app."

## Site Notes

- FlowerAura is one of India's top online florists delivering to 500+ cities.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Same-day delivery available if ordered before 5 PM in most metro cities.
- Midnight delivery (11 PM - 12 AM) is very popular for birthdays — costs ₹200-350 extra.
- Fixed-time delivery guarantees a 2-hour window — costs ₹150-250 extra over standard.
- Flowers are sourced locally — exact shades and arrangement may vary slightly from photos.
- Combos (flowers + cake, flowers + chocolate) offer better value than buying separately.
- Delivery charges: standard ₹0-99 for metro cities, ₹99-199 for tier-2 cities.
- FlowerAura provides photo proof of delivery — reassure user they will get confirmation.
- Festival/Valentine's season has surge pricing (20-50% higher) and limited slots — order early.
- Use `confirm_action` for order review, `collect_payment` for checkout. WAIT for user response.
