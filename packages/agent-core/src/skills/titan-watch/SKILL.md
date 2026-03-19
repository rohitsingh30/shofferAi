---
name: titan-watch
description: Shop on Titan — buy watches from Titan, Fastrack, Sonata, Titan Smart, browse collections, checkout, pay.
triggers:
  - titan watch
  - buy titan watch
  - order from titan
  - titan shopping
  - fastrack watch
  - sonata watch
  - buy watch titan
  - titan.co.in
siteUrl: https://www.titan.co.in
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "men's analog watch", "Fastrack casual watch", "Titan smartwatch", "Sonata budget watch")
  - name: brand
    required: false
    hint: Brand preference (Titan, Fastrack, Sonata, Titan Smart, Raga)
  - name: budget
    required: false
    hint: Max price (e.g. "under 5000", "budget 3000")
  - name: gender
    required: false
    hint: Gender (men, women, unisex)
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, EMI)
---

# Titan Watch Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What product to search for
2. **budget** (type: "slider", collapsed): Budget range, min 100, max 50000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Clarify Requirements
- Confirm what the user wants: brand (Titan, Fastrack, Sonata), type (analog, digital, smart), gender, occasion (formal, casual, sports).
- Use `ask_user` to clarify: dial shape preference (round, square), strap type (leather, metal, silicone), color, budget.
- Note any specific requirements (water resistance, chronograph, date display, luminous).

### 2. Open Titan & Verify Login
- Open a NEW tab and navigate to `https://www.titan.co.in`.
- Take snapshot. Verify logged in (user name or account icon visible in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar or navigate to the appropriate brand section (Titan/Fastrack/Sonata).
- Take snapshot of search results or collection page.
- Apply filters if relevant: price range, brand, gender, strap type, dial shape, collection, features.
- Extract top 3-5 options with: brand, model/collection name, price, dial color, strap type, key features.
- Use `ask_user` (input_type "choice") to present options. Format: "Brand Collection — ₹X,XXX — Dial Color — Strap Type — Key Feature"
- If user wants to see more, scroll or browse different collection.

### 4. View Product Details
- Click selected product.
- Take snapshot of product page.
- Extract: brand, collection, model number, price, MRP, discount, dial details, strap material, case diameter, water resistance, movement type (quartz/automatic), weight, warranty.
- If product has strap/color variants, present them via `ask_user` (input_type "choice").
- Highlight collection story if relevant (Titan Edge = ultra-slim, Titan Raga = women's, Fastrack Reflex = fitness).
- Confirm with user: "Add [brand] [model] at ₹X,XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Cart" or "Buy Now".
- Go to cart, take snapshot.
- Check for active offers, engraving options, or gift wrapping.
- Use `confirm_action` to present order summary:
  - Product: brand, collection, model number, strap
  - Price, MRP, discount
  - Delivery date and charges
  - Gift wrapping (if requested)
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Proceed to Checkout".
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, brand, collection, price, delivery, total
  - amount_inr: total amount (number)
  - description: "Titan watch order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product (brand, collection, model), price paid, estimated delivery date, warranty period.

## Site Notes

- Titan delivery: 3-7 days depending on location. Personalized/engraved watches may take longer.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- Titan is India's most trusted watch brand — Tata Group company. Operates Fastrack, Sonata, Titan Smart sub-brands.
- Fastrack targets youth/casual (₹1,000-5,000), Sonata is budget (₹500-3,000), Titan is premium (₹3,000-50,000+).
- Titan Raga is the women's premium collection — suggest for women's watches.
- Titan Edge is the world's slimmest watch collection — suggest for minimalist taste.
- Free delivery on most orders above ₹500. Gift wrapping and engraving available on select models.
- All Titan watches come with 2-year manufacturer warranty. International warranty on select models.
- EMI options available on higher-priced watches — mention if product is above ₹5,000.
- Titan has 800+ service centers across India — easy after-sales service.
- Encircle program: Titan loyalty program — check for points or membership benefits.
- Exchange offer may be available for old watches — ask user if interested.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
