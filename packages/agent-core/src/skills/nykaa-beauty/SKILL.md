---
name: nykaa-beauty
description: Shop on Nykaa — search beauty, skincare, cosmetics, haircare products, add to bag, checkout, pay.
triggers:
  - nykaa
  - order from nykaa
  - buy on nykaa
  - nykaa beauty
  - buy cosmetics
  - buy skincare
  - order makeup
  - buy beauty products
siteUrl: https://www.nykaa.com
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "moisturizer for dry skin", "MAC lipstick", "sunscreen SPF 50")
  - name: brand
    required: false
    hint: Preferred brand (e.g. "Maybelline", "Lakme", "The Ordinary")
  - name: skin_type
    required: false
    hint: Skin type or concern (e.g. "oily skin", "acne-prone", "anti-aging")
  - name: budget
    required: false
    hint: Max price (e.g. "under 1000", "budget 500")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, wallet)
---

# Nykaa Beauty Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Clarify Requirements
- Confirm what the user wants: skincare, makeup, haircare, fragrance, or personal care.
- If vague, use `ask_user` to clarify brand preference, skin type/concern, shade, budget.
- Note any specific requirements (SPF level, shade name, ingredient preferences like "paraben-free").

### 2. Open Nykaa & Verify Login
- Open a NEW tab and navigate to `https://www.nykaa.com`.
- Take snapshot. Verify logged in (profile icon or name visible in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product.
- Take snapshot of search results page.
- Apply filters if relevant: brand, price range, rating (4+ stars), discount, skin type, concern.
- Sort by relevance or popularity unless user specifies price sorting.
- Extract top 3-5 options with: brand, name, price (MRP vs discounted), rating, review count, discount %.
- Use `ask_user` (input_type "choice") to present options. Format: "Brand Name — ₹X,XXX (XX% off) — ⭐ Rating (X reviews)"
- If user wants to see more, scroll or refine filters.

### 4. View Product Details
- Click selected product.
- Take snapshot of product page.
- Extract: brand, full name, price, MRP, discount, shade/variant options, size options, ingredients, rating, review highlights.
- If product has shade variants (lipstick, foundation), present top shades via `ask_user` (input_type "choice").
- If product has size variants (30ml, 50ml, 100ml), present sizes via `ask_user` (input_type "choice").
- Check for combos or offers (Buy 2 Get 1, etc.) and inform user.
- Confirm with user: "Add [product] at ₹X,XXX to bag?"

### 5. Add to Bag & Review
- Click "Add to Bag".
- Go to bag/cart, take snapshot.
- Check for applicable coupons or Nykaa offers (free gifts, combo deals).
- Apply best coupon if available.
- Use `confirm_action` to present order summary:
  - Product: brand, name, shade/variant, size
  - Price: MRP, discount, coupon savings, final price
  - Free gifts or samples if any
  - Delivery date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Proceed" in bag.
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, shade, size, price, delivery, total
  - amount_inr: total amount (number)
  - description: "Nykaa beauty order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product (brand, name, shade, size), price paid, estimated delivery date, free samples if any.

## Site Notes

- Nykaa delivery: 2-7 days depending on location. Express delivery available in select cities.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- Nykaa has frequent sales (Pink Friday, Hot Pink Sale) — check for active offers.
- Free delivery above ₹299 on Nykaa Beauty, ₹499 on Nykaa Fashion.
- Nykaa Privé loyalty: cashback points, birthday offers — apply if available.
- Shade matching is critical for makeup — describe shade names and show swatches from snapshots.
- "Bestseller" and "Editor's Pick" badges are good signals for recommendations.
- Check ingredient list for user concerns (paraben-free, cruelty-free, vegan).
- Nykaa often bundles free samples with orders — mention if visible.
- Return policy varies by category: beauty products often non-returnable after opening.
- Use `confirm_action` for bag review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
