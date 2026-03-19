---
name: printful-merch
description: Create custom merchandise on Printful — t-shirts, hoodies, hats, print-on-demand products with your design.
triggers:
  - printful
  - custom merch
  - print on demand
  - custom t-shirt
  - custom hoodie
  - custom merchandise
  - merch design
  - printful order
  - custom sweatshirt
  - design t-shirt
siteUrl: https://www.printful.com
requiresAuth: true
params:
  - name: product_type
    required: true
    hint: What to create (e.g. "t-shirt", "hoodie", "hat", "tote bag", "poster", "phone case")
  - name: design
    required: true
    hint: Design description or file (e.g. "upload my logo", "text saying 'Hello World'", "custom artwork")
  - name: quantity
    required: false
    hint: Number of items (e.g. "1", "10", "50")
  - name: size
    required: false
    hint: Size (e.g. "M", "L", "XL", "one size")
  - name: color
    required: false
    hint: Product base color (e.g. "black", "white", "navy blue")
---

# Printful Custom Merchandise

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm what the user wants to create. Use `ask_user` to clarify:
  - Product type: t-shirt, hoodie, sweatshirt, hat, tote bag, mug, poster, sticker, phone case, etc.
  - Design: upload artwork file, text-based design, or describe desired design.
  - Quantity: single item or bulk order.
  - Size(s) and color(s) needed.
  - Printing technique preference if any (DTG, embroidery, sublimation).
- Ask for design file or text content via `ask_user`.
- Note any special requirements (back print, sleeve print, specific placement).

### 2. Open Printful & Verify Login
- Open a NEW tab and navigate to `https://www.printful.com`.
- Take snapshot. Verify logged in (dashboard or profile icon visible).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Navigate to the product catalog or order creation page.

### 3. Select Product & Variant
- Browse the product catalog for the selected product type.
- Take snapshot of available products.
- Filter by category (apparel, accessories, home, etc.).
- Extract options with: product name, brand (Bella+Canvas, Gildan, etc.), base price, available colors, print areas.
- Use `ask_user` (input_type "choice") to present top options:
  - "Bella+Canvas 3001 Unisex Tee — $XX — DTG print — 40+ colors"
  - "Gildan 18500 Hoodie — $XX — DTG print — 20+ colors"
  - "Yupoong 6245CM Dad Hat — $XX — Embroidery — 10+ colors"
- After product selection, present color options via `ask_user` (input_type "choice").
- Select size(s) via `ask_user` (input_type "choice"): S, M, L, XL, 2XL, etc.

### 4. Upload Design & Customize
- Enter the product mockup generator/designer.
- Upload the user's design file or create text-based design.
- Take snapshot of the design editor.
- Position the design on the product:
  - Front, back, or both sides.
  - Adjust placement, size, and rotation.
  - For embroidery: choose thread colors.
- Take snapshot of the mockup preview (front and back if applicable).
- Present the mockup to user and confirm placement is correct via `ask_user`.

### 5. Review Order
- Take snapshot of the order summary.
- Use `confirm_action` to present order details:
  - Product: name, brand, color
  - Size(s): selected sizes and quantities
  - Design: description, print technique, placement (front/back)
  - Price per item, quantity, subtotal
  - Shipping cost and estimated delivery
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Enter shipping address via `ask_user` if not saved.
- Select shipping method (standard, express).
- Use `collect_payment`:
  - summary: JSON with product, design, size, color, quantity, price, shipping, total
  - amount_inr: total amount converted to INR (number)
  - description: "Printful custom merch order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Submit the order on Printful.
- Handle any verification steps via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product, design details, sizes, quantity, total paid, estimated production time, shipping estimate.
- Mention: "Production takes 2-5 business days. You will receive tracking info once shipped."

## Site Notes

- Printful is a global print-on-demand platform. Ships worldwide. Production in US, EU, and other facilities.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. 2FA/OTP goes to operator.
- Prices are in USD — convert to INR for the user when presenting costs.
- Print techniques: DTG (direct-to-garment) for detailed designs, embroidery for logos/text, sublimation for all-over prints.
- Minimum order: 1 item. No minimum for print-on-demand. Bulk discounts available for 25+ items.
- Design file requirements: PNG with transparent background recommended. 300 DPI minimum. Max print area varies by product.
- Bella+Canvas 3001 is the most popular t-shirt blank — soft, quality fit. Gildan is budget-friendly.
- Production time: 2-5 business days. Shipping to India: 7-20 business days (standard), 5-10 (express).
- Embroidery has a setup fee for the first item but looks premium. Limited to simpler designs (no gradients).
- Printful offers a mockup generator — use it to show the user how the product will look before ordering.
- Returns/reprints: Printful reprints or refunds for manufacturing defects. No returns for buyer's remorse on custom items.
- Use `confirm_action` for order review, `collect_payment` for checkout. WAIT for user response.
