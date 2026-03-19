---
name: chumbak-decor
description: Shop on Chumbak — browse quirky home decor, mugs, bags, accessories, furniture, checkout, pay.
triggers:
  - chumbak
  - order from chumbak
  - buy on chumbak
  - chumbak decor
  - chumbak mug
  - quirky home decor
  - chumbak bag
  - buy decor chumbak
  - chumbak accessories
siteUrl: https://www.chumbak.com
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "coffee mug", "tote bag", "wall clock", "cushion cover", "backpack")
  - name: category
    required: false
    hint: Category (e.g. "home decor", "kitchen", "bags", "accessories", "furniture", "gifting")
  - name: style
    required: false
    hint: Style/theme (e.g. "quirky", "floral", "Indian motif", "minimal", "colorful")
  - name: budget
    required: false
    hint: Max price (e.g. "under 1000", "budget 3000")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# Chumbak Quirky Decor & Accessories Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What product to search for
2. **budget** (type: "slider", collapsed): Budget range, min 100, max 50000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Clarify Requirements
- Confirm what the user wants: product type, purpose (self-use, gifting, home styling).
- Use `ask_user` to clarify: category (home decor, kitchen & dining, bags, accessories, furniture), style (quirky, floral, Indian motif, bohemian, minimal), color preference, budget.
- Ask about purpose: personal purchase, gift for someone (birthday, housewarming, festival), office use.
- Note if user wants a themed collection or individual pieces.

### 2. Open Chumbak & Verify Login
- Open a NEW tab and navigate to `https://www.chumbak.com`.
- Take snapshot. Verify logged in (account icon or user name in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar or navigate to categories (Home, Kitchen, Bags, Accessories, Furniture).
- Take snapshot of product listing page.
- Apply filters: category, price range, color, collection, bestsellers, new arrivals.
- Extract top 3-5 options with: name, design/pattern, price, material, color, rating.
- Use `ask_user` (input_type "choice") to present options. Format: "Product Name — Design — ₹XXX — Material — Color — ⭐ Rating"
- Highlight Chumbak's signature quirky Indian designs.

### 4. View Product Details
- Click selected product.
- Take snapshot of product page.
- Extract: full name, design name/pattern, price, MRP, discount, material, dimensions, color options, care instructions, delivery date.
- If product has color/design variants, present them via `ask_user` (input_type "choice").
- Check if the product is part of a collection (matching items available: e.g. matching mug + coaster + tray).
- If gifting, check for gift wrapping option.
- Confirm with user: "Add [product] at ₹XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Cart".
- If user wants multiple items, repeat search and add for each.
- Go to cart, take snapshot.
- Check for applicable promo codes, seasonal sales, or bundle offers.
- Apply best coupon if available.
- Use `confirm_action` to present order summary:
  - Items: name, design, color, quantity for each
  - Price: per item, discount, subtotal
  - Gift wrapping: if selected
  - Delivery charges and estimated date
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Proceed to Checkout".
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with items, designs, prices, gift_wrapping, delivery_charge, total
  - amount_inr: total amount (number)
  - description: "Chumbak decor and accessories order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, items ordered with designs, price paid, estimated delivery date.

## Site Notes

- Chumbak is known for quirky, colorful, India-inspired designs — emphasize the unique aesthetic when presenting options.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Delivery typically takes 5-10 business days across India; express delivery available in select cities.
- Free shipping on orders above ₹999 usually; below that, shipping charges of ₹99-149 apply.
- Chumbak products make excellent gifts — mention gift wrapping and themed gift sets.
- Chumbak has physical stores in malls across major cities — mention store pickup if user prefers.
- Collections are themed (e.g. "Tropical", "Mughal", "Bohemian") — if user likes one item, suggest matching pieces.
- Return policy: 15-day easy returns on most items in original condition with tags.
- Seasonal collections (Diwali gifting, Christmas) sell out fast — check stock availability.
- Bags and accessories have separate size guides — present dimensions clearly for backpacks and totes.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
