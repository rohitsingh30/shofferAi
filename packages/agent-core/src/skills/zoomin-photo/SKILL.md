---
name: zoomin-photo
description: Print photos and photobooks on Zoomin — upload photos, customize prints, select size/finish, order delivery.
triggers:
  - zoomin
  - print photos
  - photo print
  - photobook
  - photo book
  - print pictures
  - zoomin prints
  - canvas print
  - photo prints online
  - print my photos
siteUrl: https://www.zoomin.com
requiresAuth: true
params:
  - name: product_type
    required: true
    hint: What to print (e.g. "photo prints", "photobook", "canvas", "calendar", "mug")
  - name: photo_count
    required: false
    hint: Number of photos to print (e.g. "10 prints", "20 photos")
  - name: size
    required: false
    hint: Print size (e.g. "4x6", "5x7", "8x10", "A4", "square")
  - name: finish
    required: false
    hint: Finish type (e.g. "glossy", "matte", "lustre")
---

# Zoomin Photo Printing

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm what the user wants to print: individual photo prints, photobook, canvas, calendar, mug, or other product.
- If vague, use `ask_user` to clarify:
  - Product type (prints, photobook, canvas, calendar, etc.)
  - Number of photos
  - Size and finish preference
  - Any special occasion (birthday, wedding, anniversary)
- Ask how they will provide photos: upload from device, or link. Use `ask_user` if unclear.

### 2. Open Zoomin & Verify Login
- Open a NEW tab and navigate to `https://www.zoomin.com`.
- Take snapshot. Verify logged in (profile icon or name visible in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Dismiss any app-install banners or popup promotions.

### 3. Select Product Category
- Navigate to the appropriate product category:
  - **Photo Prints**: Prints section — choose size (4x6, 5x7, 8x10, etc.)
  - **Photobook**: Photobooks section — choose style (hardcover, softcover, layflat)
  - **Canvas**: Canvas prints — choose size and wrap type
  - **Calendar**: Calendars — wall or desk
  - **Mugs/Gifts**: Personalized gifts section
- Take snapshot of product options.
- Extract available options with: type, size, price, material/finish.
- Use `ask_user` (input_type "choice") to present options:
  - "4x6 Glossy Prints — Rs XXX for 25 prints"
  - "8x10 Canvas — Rs XXX — Gallery wrap"
  - "Hardcover Photobook 8x8 — Rs XXX — 20 pages"

### 4. Upload & Customize
- Start the product editor/creator.
- Guide user to upload photos. Use `ask_user` to confirm which photos to use.
- Take snapshot of the editor.
- For photobooks: select layout, arrange photos, add captions if user wants.
- For prints: confirm quantity per photo, size, and finish.
- For canvas: select crop/orientation, border style.
- Present customization summary via `ask_user` (input_type "choice") if multiple layout/design options.

### 5. Review Order
- Take snapshot of the order preview/summary.
- Use `confirm_action` to present order summary:
  - Product: type, size, finish, quantity
  - Photos: count, any customizations
  - Price per item and total
  - Delivery estimate
  - Any active offers/discounts applied
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Check for coupon codes or active offers — apply best available.
- Use `collect_payment`:
  - summary: JSON with product type, size, quantity, price, delivery, total
  - amount_inr: total amount (number)
  - description: "Zoomin photo print order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product type, quantity, total paid, estimated delivery date.
- Mention: "You will receive a tracking link via email/SMS once your prints are shipped."

## Site Notes

- Zoomin is India's leading photo printing platform. Ships across India in 5-10 business days.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Photo quality matters: recommend uploading high-resolution images (minimum 300 DPI for prints).
- Zoomin frequently runs offers — check homepage banners for active deals (50% off, BOGO, etc.).
- Photobooks: minimum 20 pages usually. More pages = higher price. Hardcover is premium.
- Canvas prints: gallery wrap (image wraps around edges) vs white/black border options.
- Free delivery above a certain threshold (usually Rs 499) — inform user if close to threshold.
- Zoomin app sometimes has exclusive discounts — but we use the web version.
- Payment options: UPI, cards, net banking, wallets. No COD for custom products.
- Processing time: 2-4 business days for printing + shipping time. Express not available on all products.
- Use `confirm_action` for order review, `collect_payment` for checkout. WAIT for user response.
