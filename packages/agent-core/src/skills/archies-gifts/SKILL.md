---
name: archies-gifts
description: Buy greeting cards, gifts, and personalized items on Archies Online — cards, mugs, cushions, photo frames for every occasion.
triggers:
  - archies
  - archies online
  - greeting card
  - buy greeting card
  - archies gift
  - personalized gift
  - buy card online
  - archies delivery
  - archies birthday card
  - gift card archies
siteUrl: https://www.archiesonline.com
requiresAuth: true
params:
  - name: productType
    required: true
    hint: Type of product (e.g. "greeting card", "mug", "cushion", "photo frame", "soft toy", "gift hamper")
  - name: occasion
    required: false
    hint: Occasion (e.g. "birthday", "anniversary", "Valentine's Day", "Mother's Day", "thank you")
  - name: deliveryCity
    required: false
    hint: Delivery city or pincode (e.g. "Delhi", "Mumbai", "110001")
  - name: budget
    required: false
    hint: Budget range (e.g. "under 500", "500-1500", "premium")
  - name: personalization
    required: false
    hint: Personalization details (e.g. "name: Rohit", "photo upload", "custom message")
---

# Archies Online Gifts & Cards

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm product type (greeting card, mug, cushion, photo frame, soft toy, gift hamper). Use `ask_user` if missing.
- Get occasion, budget, and any personalization preferences (custom name, photo, message).
- Note delivery address if physical delivery is needed (some items are e-cards).
- If user wants a greeting card, clarify: physical card or e-card.

### 2. Open Archies & Verify Login
- Open a NEW tab and navigate to `https://www.archiesonline.com`.
- Take snapshot. Dismiss any promotional popups, sale banners, or newsletter signup modals.
- Verify logged in (account icon or name visible in header).
- If NOT logged in, login transparently using Google or email sign-in. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Browse & Search Products
- Use the search bar to search for the product type and occasion (e.g. "birthday mug", "anniversary card").
- Alternatively navigate through category menu: Cards, Gifts, Flowers, Cakes, Personalized.
- Apply filters: price range, occasion, product type, personalized vs. ready-made.
- Take snapshot of product listing page.

### 4. Present Top Options
- Extract 4-6 products with: name, price, rating (if available), description snippet, personalization availability.
- Note any sale/discount pricing (MRP vs. sale price).
- Use `ask_user` (input_type "choice") to present options. Format:
  "Personalized Birthday Mug — ₹399 (MRP ₹599) — Add name + photo — 4.3★"
- Add "Show more results" as last option.

### 5. View Product & Customize
- Click selected product. Take snapshot of product detail page.
- Extract: full description, available variants (color, size), personalization fields, delivery estimate.
- If personalization is available, collect details via `ask_user`:
  - Name/text to print
  - Photo to upload (provide upload instructions)
  - Custom message for greeting card
- Select variant (color, size) if applicable via `ask_user` (input_type "choice").
- Add to cart.

### 6. Fill Delivery Details
- Proceed to checkout. Take snapshot.
- Fill shipping address: recipient name, address line 1, address line 2, city, state, pincode, phone.
- Use `ask_user` for recipient's full address if not already known.
- Select delivery speed if options available (standard, express).
- Add gift wrapping if offered and user wants it.

### 7. Review & Confirm
- Take snapshot of order summary.
- Use `confirm_action` to present order details:
  - Product name and customization details
  - Recipient name and delivery address
  - Delivery estimate
  - Price breakdown: item cost, personalization charge, delivery charge, gift wrapping, discount, total
- Do NOT proceed unless user confirms.

### 8. Payment
- Use `collect_payment`:
  - summary: JSON with product name, customization, recipient, delivery address, delivery estimate, total
  - amount_inr: total amount (number)
  - description: "Archies Online order"
- STOP and WAIT for payment confirmation.

### 9. Complete Order & Confirm
- Complete payment on Archies Online. Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product name, personalization details, recipient, delivery address, estimated delivery date, total paid.
- Mention: "You will receive order tracking via email. Personalized items typically take 2-3 extra business days."

## Site Notes

- Archies is India's iconic greeting card and gift brand, now with a strong online presence.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Personalized items (mugs, cushions, frames) take 2-5 business days extra for production.
- Standard delivery: 5-7 business days for most cities. Express: 2-3 business days (extra charge).
- Archies frequently runs sales (40-60% off) — always check if current products have sale pricing.
- Physical greeting cards come with envelope — e-cards are instant but less personal.
- Minimum order for free shipping is usually ₹499 — add a small item to cross the threshold if close.
- Gift wrapping is available for ₹50-100 extra — worth suggesting for gift purchases.
- Photo personalization requires high-resolution image — warn user if they need to upload.
- Return/exchange: 7 days for non-personalized items. Personalized items are non-returnable.
- Use `confirm_action` for order review, `collect_payment` for checkout. WAIT for user response.
