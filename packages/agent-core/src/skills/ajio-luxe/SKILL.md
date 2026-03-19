---
name: ajio-luxe
description: Shop premium fashion on AJIO Luxe — browse designer brands, luxury clothing, shoes, accessories, add to bag, checkout, pay.
triggers:
  - ajio luxe
  - buy on ajio luxe
  - order from ajio luxe
  - ajio premium fashion
  - ajio luxe shopping
  - designer clothes ajio
  - premium brands ajio
  - ajio luxe order
siteUrl: https://www.ajio.com/luxe
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "Ralph Lauren polo", "Calvin Klein jeans", "Tommy Hilfiger jacket")
  - name: brand
    required: false
    hint: Preferred premium brand (e.g. "Ralph Lauren", "Calvin Klein", "Tommy Hilfiger", "Superdry", "Gant")
  - name: size
    required: false
    hint: Size preference (S, M, L, XL, or shoe size like UK 9)
  - name: budget
    required: false
    hint: Max price (e.g. "under 10000", "budget 15k")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, EMI)
---

# AJIO Luxe Premium Fashion Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What item to search for
2. **size** (type: "chip_bar", collapsed): Size — XS, S, M, L, XL, XXL
3. **budget** (type: "slider", collapsed): Budget range, min 200, max 10000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Clarify Requirements
- Confirm what the user wants: clothing, footwear, accessories, or a specific designer brand.
- Use `ask_user` to clarify: gender, type, brand preference, occasion (casual, formal, party), size, color, budget.
- AJIO Luxe carries premium international brands (Ralph Lauren, Calvin Klein, Tommy Hilfiger, Superdry, Gant, Hackett London, Emporio Armani) — mention options if user wants suggestions.
- Distinguish from regular AJIO — Luxe is the premium/designer section.

### 2. Open AJIO Luxe & Verify Login
- Open a NEW tab and navigate to `https://www.ajio.com/luxe`.
- Take snapshot. Verify logged in (profile icon or name in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product, or browse by brand within the Luxe section.
- Take snapshot of search results page.
- Apply filters: brand, price range, size, color, discount %, category, occasion.
- AJIO Luxe often has significant discounts on premium brands (30-60% off) — highlight savings.
- Extract top 3-5 options with: brand, name, price (MRP vs discounted), discount %, material, fit type.
- Use `ask_user` (input_type "choice") to present options. Format: "Brand — Product Name — ₹X,XXX (XX% off)"
- If user wants to see more, scroll or refine filters.

### 4. View Product & Select Variants
- Click selected product.
- Take snapshot of product page.
- Extract: brand, full name, price, MRP, discount, available sizes, colors, material, fit type, wash care, delivery date, return policy.
- If product has color variants, present via `ask_user` (input_type "choice").
- If size not provided, present available sizes via `ask_user` (input_type "choice").
- Check for additional coupon codes on product page (AJIO often shows extra discount codes for Luxe items).
- Confirm with user: "Add [product] at ₹X,XXX to bag?"

### 5. Add to Bag & Review
- Click "Add to Bag".
- Go to bag/cart, take snapshot.
- Check for applicable coupon codes — AJIO Luxe may have brand-specific or category-specific coupons.
- Apply the best coupon code available.
- Use `confirm_action` to present order summary:
  - Product: brand, name, size, color, fit, material
  - Price: MRP, discount, coupon savings, final price
  - Delivery date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Proceed to Checkout".
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, brand, size, color, price, coupon, delivery, total
  - amount_inr: total amount (number)
  - description: "AJIO Luxe premium fashion order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product (brand, name, size, color), price paid, coupon used, estimated delivery date, return window.

## Site Notes

- AJIO Luxe is the premium section of AJIO — carries international designer brands at Indian prices.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- AJIO Luxe often has 30-60% discounts on premium brands — always highlight savings vs MRP.
- Coupon codes may stack with existing discounts — check "Apply Coupon" section thoroughly.
- Free delivery usually above ₹799. Premium brands may have free delivery regardless.
- Return policy: 7-day easy returns on most items. Some premium items may have stricter return conditions.
- AJIO Luxe has a separate "Luxe Edit" section with curated collections — check for seasonal edits.
- Size charts for international brands follow international sizing — suggest checking size guide on product page.
- Reliance-backed platform — reliable delivery and genuine products guaranteed.
- EMI options available on higher-value purchases — mention if user is budget-conscious.
- Use `confirm_action` for bag review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
