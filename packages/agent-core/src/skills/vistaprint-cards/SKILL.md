---
name: vistaprint-cards
description: Order business cards or invitations on Vistaprint — choose design, customize text, select paper/finish, order and pay.
triggers:
  - vistaprint
  - order business cards
  - business cards online
  - vistaprint business cards
  - print business cards
  - order visiting cards
  - vistaprint invitations
  - custom business cards
siteUrl: https://www.vistaprint.in
requiresAuth: true
params:
  - name: card_type
    required: true
    hint: Type of card (e.g. "business cards", "wedding invitations", "thank you cards", "visiting cards")
  - name: quantity
    required: false
    hint: Number of cards (e.g. "100", "250", "500")
  - name: details
    required: false
    hint: Text to print — name, title, company, phone, email, etc.
  - name: budget
    required: false
    hint: Budget range (e.g. "under 500", "under 1000")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, net banking, COD)
---

# Vistaprint Business Cards / Invitations

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm what the user needs: business cards, visiting cards, wedding invitations, thank you cards, or other.
- For business cards, use `ask_user` to collect details:
  - Full name
  - Job title / designation
  - Company name
  - Phone number(s)
  - Email address
  - Website (optional)
  - Company address (optional)
  - Logo (ask if they have one to upload)
- For invitations, collect event details (names, date, venue, RSVP info).
- Ask for quantity preference if not specified.
- Ask for any design preferences (minimalist, colorful, classic, modern).

### 2. Open Vistaprint & Verify Login
- Open a NEW tab and navigate to `https://www.vistaprint.in`.
- Take snapshot. Verify logged in (account icon or name visible).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Dismiss any promotional popups or banners.

### 3. Browse Designs
- Navigate to the correct category (Business Cards / Invitations / etc.).
- Take snapshot of design templates page.
- Apply filters: category, style (modern, classic, creative), industry if applicable.
- Browse available design templates.
- Extract top 4-6 designs with: template name/style, preview description, starting price.
- Use `ask_user` (input_type "choice") to present design options:
  - "Modern Minimalist — clean lines, white background — from ₹XXX"
  - "Classic Corporate — traditional layout, dark theme — from ₹XXX"
  - "Creative Bold — colorful, unique design — from ₹XXX"
  - "Premium Gold — metallic accents, luxury feel — from ₹XXX"
- Take snapshot of each shortlisted design for user review.

### 4. Customize Design
- Click on selected design template.
- Take snapshot of design editor.
- Enter all text details collected in Step 1:
  - Name, title, company, contact info.
  - Upload logo if user has provided one.
- Adjust text formatting if needed (font size, alignment).
- Take snapshot showing the customized design preview.
- Present preview to user via `ask_user`: "Here is your card design. Would you like any changes?"
- Make any requested modifications (font, color, layout, text changes).
- Take final snapshot of completed design.

### 5. Select Paper & Finish
- Navigate to paper/finish options.
- Take snapshot of paper options.
- Use `ask_user` (input_type "choice") to present paper/finish options:
  - "Standard Matte — classic non-glossy finish — ₹XXX for [qty]"
  - "Premium Glossy — shiny professional finish — ₹XXX for [qty]"
  - "Recycled / Eco-friendly — sustainable option — ₹XXX for [qty]"
  - "Thick Premium — 400 GSM heavy stock — ₹XXX for [qty]"
  - "Soft Touch — velvety texture — ₹XXX for [qty]"
- Select quantity: present options (100, 250, 500, 1000) with prices.
- Select any add-ons: rounded corners, spot UV, double-sided printing.

### 6. Review & Confirm Order
- Navigate to cart/order review.
- Take snapshot of order summary.
- Use `confirm_action` to present order summary:
  - Product: card type and design name
  - Details: name, title, company on the card
  - Paper: selected finish and GSM
  - Quantity: number of cards
  - Add-ons: rounded corners, UV, etc.
  - Delivery: estimated delivery date
  - Subtotal, any discount/coupon, shipping, total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 7. Checkout & Payment
- Proceed to checkout.
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Apply any coupon codes if visible (Vistaprint often has 20-50% off coupons).
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with card type, design, paper, quantity, delivery date, total
  - amount_inr: total amount (number)
  - description: "Vistaprint order — business cards"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 8. Complete Order & Confirm
- Select payment method on Vistaprint (UPI/card/net banking).
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, card type, quantity, paper finish, total paid, estimated delivery date, tracking info if available.

## Site Notes

- Vistaprint delivery: 5-10 business days for standard, 3-5 for express. Prices vary by speed.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Vistaprint frequently offers 30-50% discount coupons — always check for active promotions before checkout.
- Design editor can be complex — take snapshots at each step so user can see progress.
- Logo upload: accepts PNG, JPG, SVG. High resolution (300 DPI) recommended.
- Double-sided cards cost more but look professional — suggest if budget allows.
- Vistaprint has a "Design for you" service — mention if user struggles with customization.
- Free standard shipping above certain order value — check current threshold.
- Use `confirm_action` for order review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
