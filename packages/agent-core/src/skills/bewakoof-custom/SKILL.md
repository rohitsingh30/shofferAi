---
name: bewakoof-custom
description: Design and order custom t-shirts on Bewakoof — upload your design, select style/color/size, checkout.
triggers:
  - bewakoof
  - bewakoof custom
  - custom t-shirt india
  - design t-shirt
  - bewakoof design
  - custom tee
  - bewakoof order
  - print t-shirt
  - personalized t-shirt
  - custom shirt india
siteUrl: https://www.bewakoof.com
requiresAuth: true
params:
  - name: design
    required: true
    hint: Design description or file (e.g. "upload my artwork", "text design", "custom graphic")
  - name: style
    required: false
    hint: T-shirt style (e.g. "oversized", "regular fit", "crop top", "polo")
  - name: color
    required: false
    hint: Base color (e.g. "black", "white", "navy", "maroon")
  - name: size
    required: false
    hint: Size (e.g. "S", "M", "L", "XL", "2XL")
  - name: gender
    required: false
    hint: Men's or women's (e.g. "men", "women", "unisex")
---

# Bewakoof Custom T-Shirts

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What item to search for
2. **size** (type: "chip_bar", collapsed): Size — XS, S, M, L, XL, XXL
3. **budget** (type: "slider", collapsed): Budget range, min 200, max 10000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Gather Requirements
- Confirm what the user wants to design. Use `ask_user` to clarify:
  - Design: upload artwork, text-based design, or describe what they want.
  - Style: oversized, regular fit, classic, crop top, full sleeve, half sleeve.
  - Gender: men's, women's, or unisex.
  - Color: base t-shirt color preference.
  - Size: S, M, L, XL, 2XL, 3XL.
  - Quantity: how many to order.
- Ask for the design file or text content via `ask_user`.
- Note placement preferences (front, back, pocket area).

### 2. Open Bewakoof & Verify Login
- Open a NEW tab and navigate to `https://www.bewakoof.com`.
- Take snapshot. Verify logged in (profile icon or name visible in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Dismiss any app-download banners or promotional popups.

### 3. Navigate to Customization
- Navigate to the custom/design section of Bewakoof (Customization or "Design Your Own" section).
- If not directly available, search for "custom t-shirt" or navigate via categories.
- Take snapshot of the customization landing page.
- Browse available base products:
  - Men's/Women's t-shirts, oversized tees, hoodies, sweatshirts.
- Extract options with: product name, style, base price, available colors.
- Use `ask_user` (input_type "choice") to present options:
  - "Men's Oversized Tee — Rs XXX — 10+ colors — 100% cotton"
  - "Women's Crop Top — Rs XXX — 8 colors — Cotton blend"
  - "Unisex Hoodie — Rs XXX — 6 colors — Fleece"

### 4. Design & Customize
- Select the product and enter the design editor.
- Upload user's design file or create text design.
- Take snapshot of the editor.
- Customize:
  - Place design on front, back, or both.
  - Adjust size, position, and rotation of the design.
  - Choose print area and technique if options available.
  - Add text overlay if user wants text with the design.
- Select base color from available palette via `ask_user` (input_type "choice").
- Select size via `ask_user` (input_type "choice"): S, M, L, XL, 2XL.
- Take snapshot of the final design preview.
- Confirm design looks correct with user.

### 5. Review Order
- Take snapshot of cart/order summary.
- Use `confirm_action` to present order details:
  - Product: style, color, size
  - Design: description, placement (front/back)
  - Quantity
  - Price: product base + customization fee
  - Delivery estimate and charges
  - Any coupons or Bewakoof Tribe discounts applied
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Check for coupons — Bewakoof frequently has codes (FIRST, TRIBE, seasonal).
- Apply best available coupon.
- Use `collect_payment`:
  - summary: JSON with product, design, size, color, quantity, price, total
  - amount_inr: total amount (number)
  - description: "Bewakoof custom t-shirt order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method (UPI, card, COD, wallet).
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product description, size, color, design details, total paid, estimated delivery date.
- Mention: "Custom orders may take 7-12 business days for production and delivery. Track via Bewakoof app or website."

## Site Notes

- Bewakoof is one of India's top online fashion brands. Known for trendy, affordable apparel.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Custom/design products have longer production times (7-12 days) vs regular inventory (3-5 days).
- Bewakoof Tribe membership: Rs 99/year for extra discounts, free shipping, early access. Apply if available.
- Prices are in INR. Most custom tees range Rs 499-999. Hoodies Rs 999-1499.
- Design file requirements: PNG with transparent background preferred. High resolution for best print quality.
- COD available but custom orders may be prepaid-only. Confirm at checkout.
- Free shipping above Rs 799 for Tribe members, Rs 999 for others.
- Size guide: Bewakoof sizes run slightly smaller than international brands. Recommend checking size chart.
- Oversized tees are very popular — most ordered style for custom designs.
- Return policy on custom products may be restricted — only for manufacturing defects, not design changes.
- Use `confirm_action` for order review, `collect_payment` for checkout. WAIT for user response.
