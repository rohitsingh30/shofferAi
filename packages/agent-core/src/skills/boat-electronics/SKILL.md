---
name: boat-electronics
description: Shop on boAt — buy earbuds, headphones, speakers, smartwatches, cables, browse collections, checkout, pay.
triggers:
  - boat
  - buy boat earbuds
  - order from boat
  - boat headphones
  - boat speaker
  - boat shopping
  - buy earbuds boat
  - boat smartwatch
siteUrl: https://www.boat-lifestyle.com
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "wireless earbuds", "bluetooth speaker", "headphones with ANC", "smartwatch")
  - name: budget
    required: false
    hint: Max price (e.g. "under 2000", "budget 1500")
  - name: color
    required: false
    hint: Color preference (e.g. "black", "white", "blue")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# boAt Electronics Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Clarify Requirements
- Confirm what the user wants: earbuds, headphones (over-ear/on-ear), speakers, smartwatch, cables/chargers.
- Use `ask_user` to clarify: use case (gym, commute, gaming, calls), ANC preference, battery life needs, budget.
- Note any specific requirements (wireless/wired, water resistance, bass preference, mic quality).

### 2. Open boAt & Verify Login
- Open a NEW tab and navigate to `https://www.boat-lifestyle.com`.
- Take snapshot. Verify logged in (account icon or name visible in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product category or specific model.
- Take snapshot of search results or category page.
- Apply filters if relevant: price range, category (earbuds, headphones, speakers), features (ANC, water resistance).
- Extract top 3-5 options with: model name, price, MRP, discount, key features (ANC, battery life, driver size, IP rating).
- Use `ask_user` (input_type "choice") to present options. Format: "boAt Model — ₹X,XXX (XX% off) — Battery Xh — Key Feature"
- If user wants to see more, scroll or browse different category.

### 4. View Product Details
- Click selected product.
- Take snapshot of product page.
- Extract: model name, price, MRP, discount, color options, key specs (driver size, frequency, battery, charging time, water resistance, ANC level).
- If product has color variants, present them via `ask_user` (input_type "choice").
- Highlight standout features: BEAST mode for gaming, ENx ANC, ASAP charge, IWP (Insta Wake N' Pair).
- Confirm with user: "Add boAt [model] ([color]) at ₹X,XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Cart".
- Go to cart, take snapshot.
- Check for coupon codes or bundle offers (boAt often has combos: earbuds + case).
- Apply coupon if available.
- Use `confirm_action` to present order summary:
  - Product: model name, color
  - Price, MRP, discount, coupon savings
  - Delivery date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Checkout" or "Buy Now".
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, color, price, delivery, total
  - amount_inr: total amount (number)
  - description: "boAt order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product (model, color), price paid, estimated delivery date, warranty period.

## Site Notes

- boAt delivery: 3-7 days depending on location. Metro cities get faster delivery.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- boAt is India's #1 audio brand — products are affordable with decent quality for the price.
- Most boAt products have 1-year warranty. Register on boAt website for warranty claims.
- boAt frequently runs flash sales and offers — check for active promotions.
- Free delivery on orders above ₹500 typically. Below that, small shipping charge.
- boAt Airdopes = TWS earbuds, Rockerz = wireless headphones/neckbands, Stone = speakers.
- BEAST mode (low latency) is important for gamers — mention if product supports it.
- IPX4/IPX5 water resistance is common — important for gym/outdoor use.
- ASAP charge feature: 10 min charge = hours of playback — highlight if available.
- COD available on most products — mention if user prefers.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
