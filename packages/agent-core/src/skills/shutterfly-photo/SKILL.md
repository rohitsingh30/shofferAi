---
name: shutterfly-photo
description: Create personalized photo gifts on Shutterfly — mugs, calendars, prints, cards, blankets, phone cases.
triggers:
  - shutterfly
  - photo gift
  - photo mug
  - personalized gift
  - photo calendar
  - custom mug
  - photo blanket
  - shutterfly gift
  - photo card
  - personalized mug
siteUrl: https://www.shutterfly.com
requiresAuth: true
params:
  - name: product_type
    required: true
    hint: What to create (e.g. "mug", "calendar", "photo book", "blanket", "phone case", "card")
  - name: occasion
    required: false
    hint: Occasion or theme (e.g. "birthday", "wedding", "Christmas", "baby shower")
  - name: recipient
    required: false
    hint: Who it's for (e.g. "mom", "friend", "partner")
  - name: photo_count
    required: false
    hint: Number of photos to use (e.g. "5 photos", "1 photo")
---

# Shutterfly Photo Gifts

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm what the user wants to create. Use `ask_user` to clarify:
  - Product type: mug, calendar, photobook, blanket, phone case, card, canvas, puzzle, etc.
  - Occasion: birthday, wedding, holiday, baby, graduation, thank you, etc.
  - Number of photos they want to use.
  - Any text/message to include on the product.
  - Recipient details if it is a gift.
- Note any style preferences (modern, classic, funny, elegant).

### 2. Open Shutterfly & Verify Login
- Open a NEW tab and navigate to `https://www.shutterfly.com`.
- Take snapshot. Verify logged in (profile/account name visible in top nav).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Dismiss any promotional popups or newsletter signup modals.

### 3. Browse Product Category
- Navigate to the relevant product category:
  - **Mugs**: Home & Gifts > Mugs — ceramic, travel, color-changing
  - **Calendars**: Calendars > Wall, Desk, Poster
  - **Photo Books**: Photo Books > hardcover, softcover, layflat
  - **Blankets**: Home & Gifts > Blankets — fleece, sherpa, woven
  - **Cards**: Cards & Stationery > greeting, holiday, thank you
  - **Phone Cases**: Tech > phone cases by model
- Take snapshot of product listing.
- Extract options with: product name, size, material, starting price, rating.
- Use `ask_user` (input_type "choice") to present top 3-5 designs:
  - "Classic Collage Mug — $XX — 11 oz ceramic — Fits 6 photos"
  - "Rustic Calendar — $XX — 12x12 wall — 12 months"

### 4. Customize Product
- Select the chosen product and enter the editor.
- Guide user to upload photos. Use `ask_user` to confirm selections.
- Take snapshot of the editor workspace.
- Customize the product:
  - Arrange photos in the template layout.
  - Add text/captions if user requested.
  - Choose background color or pattern.
  - Select product options (mug size, calendar start month, blanket size).
- If multiple design templates available, present top options via `ask_user` (input_type "choice").
- Take snapshot of the finished design preview.

### 5. Review Design & Order
- Take snapshot of order preview showing final product.
- Use `confirm_action` to present order summary:
  - Product: type, size, material, design template
  - Photos used: count
  - Custom text: if any
  - Price: base price, any add-ons
  - Quantity
  - Estimated delivery date
  - Active promotions or free shipping offers
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Add to cart and proceed to checkout.
- Verify/select shipping address. Add new address if needed via `ask_user`.
- Select shipping speed (standard, expedited, rush).
- Check for promo codes — Shutterfly always has active codes. Apply best available.
- Use `collect_payment`:
  - summary: JSON with product, design, quantity, price, shipping, total
  - amount_inr: total amount converted to INR (number)
  - description: "Shutterfly photo gift order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Complete payment flow on Shutterfly.
- Handle any verification steps via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product description, quantity, total paid, shipping method, estimated delivery date.
- Mention: "You will receive tracking info via email once your item ships."

## Site Notes

- Shutterfly is a US-based photo gift platform. International shipping available but takes 2-4 weeks to India.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP/2FA goes to operator.
- Shutterfly ALWAYS has promo codes active (40-50% off, free shipping). Check banner and apply codes before checkout.
- Prices are in USD — convert to INR for the user when presenting costs.
- Photo upload: high-resolution photos recommended. Shutterfly warns if photo quality is too low for the print size.
- Mugs: 11 oz (standard) and 15 oz (large). Dishwasher safe. Ceramic or travel options.
- Photo books: hardcover starts ~$30. Softcover cheaper. Layflat pages best for panoramic photos.
- Calendars: wall calendars start month is customizable. Desk calendars available too.
- Blankets: fleece (lightweight), sherpa (warm), woven (premium). Sizes from throw to queen.
- Free shipping thresholds change with promotions — always check current offers.
- Rush production available for last-minute gifts (1-2 business days production).
- Use `confirm_action` for design review, `collect_payment` for checkout. WAIT for user response.
