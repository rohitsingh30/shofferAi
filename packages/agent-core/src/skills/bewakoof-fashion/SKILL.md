---
name: bewakoof-fashion
description: Shop on Bewakoof — buy trendy casual wear, t-shirts, hoodies, joggers, oversized fits, checkout, pay.
triggers:
  - bewakoof
  - order from bewakoof
  - buy on bewakoof
  - bewakoof shopping
  - buy t-shirts online
  - buy hoodies
  - buy joggers
  - bewakoof fashion
siteUrl: https://www.bewakoof.com
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "oversized t-shirt", "hoodie for men", "joggers", "graphic tee")
  - name: size
    required: false
    hint: Size preference (S, M, L, XL, 2XL, 3XL)
  - name: fit
    required: false
    hint: Fit preference (e.g. "oversized", "regular", "slim fit")
  - name: budget
    required: false
    hint: Max price (e.g. "under 1000", "budget 500")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# Bewakoof Fashion Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Clarify Requirements
- Confirm what the user wants: t-shirts, hoodies, joggers, sweatshirts, shorts, backpacks, phone cases.
- Use `ask_user` to clarify: gender, type, fit (oversized, regular, slim), color, graphic/plain, size, budget.
- Bewakoof is known for quirky graphic tees and trendy casual wear — mention if user is browsing.
- Ask about collection preference if relevant (Marvel, Disney, anime, minimalist).

### 2. Open Bewakoof & Verify Login
- Open a NEW tab and navigate to `https://www.bewakoof.com`.
- Take snapshot. Verify logged in (profile icon or name in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product.
- Take snapshot of search results page.
- Apply filters: gender, category, size, color, price range, rating, discount, fit type, sleeve type.
- Check for "Tribe" membership offers or active sale discounts.
- Extract top 3-5 options with: name, price (MRP vs discounted), design/graphic, fit type, rating, discount %.
- Use `ask_user` (input_type "choice") to present options. Format: "Product Name — ₹XXX (XX% off) — Fit Type — ⭐ Rating"
- Describe the graphic/design briefly since visuals matter for Bewakoof products.

### 4. View Product & Select Variants
- Click selected product.
- Take snapshot of product page.
- Extract: full name, price, MRP, discount, available sizes, colors, fabric, fit type, GSM weight, wash care, rating, review count.
- Present available sizes via `ask_user` (input_type "choice") if not already provided.
- If product has color variants, present via `ask_user` (input_type "choice").
- Check size chart — Bewakoof sizing runs specific, mention if oversized vs regular.
- Note fabric weight (GSM) — higher GSM means thicker, better quality.
- Confirm with user: "Add [product] at ₹XXX to bag?"

### 5. Add to Bag & Review
- Click "Add to Bag".
- Go to bag/cart, take snapshot.
- Check for applicable coupon codes (Bewakoof frequently has "Buy 2 at ₹999" type deals).
- Check if adding another item unlocks a combo offer.
- Apply best coupon if available.
- Use `confirm_action` to present order summary:
  - Product: name, size, color, fit, fabric
  - Price: MRP, discount, coupon savings, final price
  - Combo deal: if applicable, show savings
  - Delivery date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Proceed to Checkout".
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, size, color, fit, price, coupon, delivery, total
  - amount_inr: total amount (number)
  - description: "Bewakoof fashion order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product details (name, size, color, fit), price paid, coupon used, estimated delivery date, return window.

## Site Notes

- Bewakoof delivery: 3-7 days for metro cities, up to 10 days for tier-2/3 cities.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- Bewakoof Tribe membership (₹99/year) gives free shipping, early access, extra discounts — check if account has it.
- Free delivery above ₹499 for Tribe members, ₹799 for non-members.
- Combo deals are Bewakoof's specialty — "Buy 2 for ₹999", "Buy 3 for ₹1299" — always check.
- GSM weight matters: 180 GSM is standard tee, 240+ GSM is premium heavyweight.
- Oversized fit is Bewakoof's top seller — clarify fit preference to avoid sizing issues.
- Licensed collections (Marvel, DC, Disney, anime) are popular — suggest if user likes pop culture.
- 15-day easy return policy on most items. Non-returnable: innerwear, customized items.
- Bewakoof has its own brand — no third-party sellers, consistent quality.
- Size chart: Bewakoof oversized runs big. Regular fit is true to size. Check measurements.
- Use `confirm_action` for bag review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
