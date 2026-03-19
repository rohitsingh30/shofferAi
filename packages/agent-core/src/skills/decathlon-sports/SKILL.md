---
name: decathlon-sports
description: Shop on Decathlon — buy sports equipment, clothing, shoes, accessories for any sport, checkout, pay.
triggers:
  - decathlon
  - order from decathlon
  - buy on decathlon
  - buy sports equipment
  - decathlon sports
  - buy sports shoes
  - buy gym equipment
  - buy cycling gear
siteUrl: https://www.decathlon.in
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "running shoes", "yoga mat", "cricket bat", "cycling shorts")
  - name: sport
    required: false
    hint: Sport type (e.g. "running", "cycling", "swimming", "gym", "cricket", "badminton")
  - name: size
    required: false
    hint: Size preference (S, M, L, XL, or shoe size like UK 9)
  - name: budget
    required: false
    hint: Max price (e.g. "under 3000", "budget 2k")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# Decathlon Sports Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Clarify Requirements
- Confirm what the user wants: sport type, equipment vs clothing vs footwear, intended use level (beginner, intermediate, pro).
- Use `ask_user` to clarify: specific sport, gender, size, color preference, budget.
- Note any specific requirements (waterproof, breathable, weight capacity, etc.).

### 2. Open Decathlon & Verify Login
- Open a NEW tab and navigate to `https://www.decathlon.in`.
- Take snapshot. Verify logged in (profile icon or name visible in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product.
- Take snapshot of search results page.
- Apply filters if relevant: sport, price range, brand (Decathlon own brands: Domyos, Kipsta, Quechua, Kalenji, etc.), size, color, rating.
- Extract top 3-5 options with: brand, name, price, sport category, rating, review count, key features.
- Use `ask_user` (input_type "choice") to present options. Format: "Brand Name — ₹X,XXX — ⭐ Rating (X reviews) — Key Feature"
- If user wants to see more, scroll or refine filters.

### 4. View Product Details
- Click selected product.
- Take snapshot of product page.
- Extract: brand, full name, price, sport, available sizes/colors, weight, material, key features, user rating, delivery date.
- If product has size variants, present available sizes via `ask_user` (input_type "choice").
- If product has color variants, present colors via `ask_user` (input_type "choice").
- Check store pickup availability if user prefers (Decathlon has many physical stores).
- Confirm with user: "Add [product] at ₹X,XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Cart".
- Go to cart, take snapshot.
- Check for any active offers or bundle deals.
- Use `confirm_action` to present order summary:
  - Product: brand, name, sport, size, color
  - Price: amount, any discounts
  - Delivery date and charges (or store pickup option)
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Checkout" or "Proceed to Buy".
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Offer store pickup as alternative if available.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, sport, size, color, price, delivery, total
  - amount_inr: total amount (number)
  - description: "Decathlon sports order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product details (brand, size, color), price paid, estimated delivery date, store pickup info if chosen.

## Site Notes

- Decathlon delivery: 2-7 days for most items. Heavy equipment may take longer.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- Decathlon primarily sells own brands (Domyos, Kipsta, Quechua, Kalenji, Btwin, Artengo, Inesis) — very affordable.
- Free delivery above ₹999 typically. Below that, delivery charges apply.
- Store pickup is free and often available same-day — suggest if user is near a Decathlon store.
- 365-day return/exchange policy on most products — highlight this benefit.
- Decathlon products are sport-specific — filter by sport for best results.
- Size guides are available on product pages — refer to them for clothing and footwear.
- Decathlon workshops and sports events — mention if relevant to user's interest.
- Product reviews are very detailed on Decathlon — use rating and review count as quality signals.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
