---
name: ajio-fashion
description: Shop on AJIO — browse fashion, clothing, shoes, accessories from top brands, apply coupons, checkout, pay.
triggers:
  - ajio
  - order from ajio
  - buy on ajio
  - ajio fashion
  - ajio shopping
  - buy clothes on ajio
  - shop ajio
  - ajio order
siteUrl: https://www.ajio.com
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "men's polo t-shirt", "women's ethnic wear", "sneakers", "handbag")
  - name: brand
    required: false
    hint: Preferred brand (e.g. "Levis", "Nike", "USPA", "Avaasa")
  - name: size
    required: false
    hint: Size preference (S, M, L, XL, or shoe size like UK 9)
  - name: budget
    required: false
    hint: Max price (e.g. "under 2000", "budget 1k")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, wallet)
---

# AJIO Fashion Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What item to search for
2. **size** (type: "chip_bar", collapsed): Size — XS, S, M, L, XL, XXL
3. **budget** (type: "slider", collapsed): Budget range, min 200, max 10000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Clarify Requirements
- Confirm what the user wants: clothing, footwear, accessories, or ethnic wear.
- Use `ask_user` to clarify: gender, type, brand preference, occasion (casual, formal, ethnic), size, color, budget.
- AJIO has strong Reliance-brand exclusives (Avaasa, Performax, Teamspirit) — mention if user wants affordable options.

### 2. Open AJIO & Verify Login
- Open a NEW tab and navigate to `https://www.ajio.com`.
- Take snapshot. Verify logged in (profile icon or name in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product.
- Take snapshot of search results page.
- Apply filters: brand, price range, size, color, discount %, rating, occasion.
- AJIO is known for heavy discounts — sort by discount or look for "AJIO Exclusive" deals.
- Extract top 3-5 options with: brand, name, price (MRP vs discounted), discount %, rating.
- Use `ask_user` with `input_type: "carousel"` to present options. Extract the REAL image URL from each product's `<img>` tag on the page. Format:
  ```json
  {
    "input_type": "carousel",
    "cards": [
      {"id": "1", "label": "Brand Name", "subtitle": "₹X,XXX · MRP ₹Y,YYY", "image": "https://assets.ajio.com/medias/real-image...", "badge": "XX% off"}
    ]
  }
  ```
- If user wants to see more, scroll or refine filters.

### 4. View Product & Select Variants
- Click selected product.
- Take snapshot of product page.
- Extract: brand, full name, price, MRP, discount, available sizes, colors, material, fit type, delivery date, return policy.
- If product has color variants, present via `ask_user` with `input_type: "chip_bar"`:
  ```json
  {"input_type": "chip_bar", "options": ["Black", "Navy Blue", "Olive Green", "White"]}
  ```
- If size not provided, present available sizes via `ask_user` with `input_type: "chip_bar"`:
  ```json
  {"input_type": "chip_bar", "options": ["XS", "S", "M", "L", "XL", "XXL"]}
  ```
  Only include sizes that are actually in stock on the product page.
- Check for additional coupon codes visible on product page (AJIO often shows "Extra XX% off with code").
- Confirm with user: "Add [product] at ₹X,XXX to bag?"

### 5. Add to Bag & Review
- Click "Add to Bag".
- Go to bag/cart, take snapshot.
- Check for applicable coupon codes — AJIO aggressively promotes coupons (e.g., "AJIONEW", "BIGBRAND").
- Apply the best coupon code available.
- Use `confirm_action` to present order summary:
  - Product: brand, name, size, color, fit
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
  - description: "AJIO fashion order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product (brand, name, size, color), price paid, coupon used, estimated delivery date, return window.

## Site Notes

- AJIO delivery: 3-7 days for metro cities, up to 10 days for smaller towns.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- AJIO is known for massive discounts (50-80% off) — always look for coupon codes.
- AJIO Exclusive brands (Avaasa, Performax, Teamspirit, Netplay) offer best value.
- Coupon stacking: AJIO often allows discount + coupon — maximize savings.
- Free delivery usually above ₹799. Below that, ₹99 delivery charge.
- AJIO Luxe section has premium brands — mention if user wants high-end.
- Return policy: 7-day easy returns on most items. Some items are non-returnable (innerwear, swimwear).
- Reliance Jio integration: JioMart wallet payments may offer cashback.
- AJIO has frequent "All Stars Sale" and "Big Bold Sale" — check if any sale is active.
- Use `confirm_action` for bag review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
