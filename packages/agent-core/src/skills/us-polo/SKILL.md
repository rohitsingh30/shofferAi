---
name: us-polo
description: Shop casual fashion on US Polo Assn India — browse polos, t-shirts, jeans, casual shirts, sneakers, accessories, checkout, pay.
triggers:
  - us polo
  - us polo assn
  - uspa
  - buy on us polo
  - order from us polo
  - us polo shirt
  - uspa shopping
  - us polo t-shirt
siteUrl: https://www.uspoloassn.in
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "polo t-shirt", "slim fit jeans", "casual shirt", "sneakers", "hoodie")
  - name: gender
    required: false
    hint: Men, Women, or Kids (US Polo has all segments)
  - name: size
    required: false
    hint: Size preference (S, M, L, XL, XXL, or waist size like 30, 32, 34, or shoe size UK 8)
  - name: color
    required: false
    hint: Color preference (e.g. "navy", "red", "white", "olive", "grey")
  - name: budget
    required: false
    hint: Max price (e.g. "under 2000", "budget 3k")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, net banking)
---

# US Polo Assn India — Casual Fashion

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Clarify Requirements
- Confirm what the user wants: polos, t-shirts, shirts, jeans, trousers, shorts, jackets, sneakers, or accessories (caps, bags, wallets).
- Use `ask_user` to clarify: gender (men/women/kids), type, occasion (casual, sporty, weekend, college), fit (slim, regular, relaxed), size, color, budget.
- US Polo Assn is the official brand of the United States Polo Association — known for sporty-casual, preppy American style.
- Strong in polos, t-shirts, jeans, and denim — recommend these as core strengths.

### 2. Open US Polo Assn & Verify Login
- Open a NEW tab and navigate to `https://www.uspoloassn.in`.
- Take snapshot. Verify logged in (account icon or name in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product.
- Take snapshot of search results page.
- Apply filters: gender, category, price range, size, color, fit, fabric, pattern, discount.
- US Polo runs frequent offers (Buy 2 Get 1, flat discounts, seasonal sales) — check active promotions.
- Extract top 3-5 options with: product name, price (MRP vs discounted), discount %, fabric, fit, color.
- Use `ask_user` (input_type "choice") to present options. Format: "Product Name — ₹X,XXX (XX% off) — Fabric — Fit"
- If user wants to see more, scroll or refine filters.

### 4. View Product & Select Variants
- Click selected product.
- Take snapshot of product page.
- Extract: product name, price, MRP, discount, fabric, fit type, pattern, available sizes, available colors, wash care, delivery date, return policy.
- If product has color variants, present via `ask_user` (input_type "choice").
- If size not provided, present available sizes via `ask_user` (input_type "choice").
- Check for bundle or combo offers (e.g., "Buy 2 polos at ₹X,XXX").
- Confirm with user: "Add [product] at ₹X,XXX to bag?"

### 5. Add to Bag & Review
- Click "Add to Bag" or "Add to Cart".
- Go to bag/cart, take snapshot.
- Check for applicable coupon codes or active sale offers.
- Apply best coupon or offer available.
- Use `confirm_action` to present order summary:
  - Product: name, size, color, fit, fabric
  - Price: MRP, discount, coupon savings, final price
  - Delivery date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Proceed to Checkout".
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, size, color, price, coupon, delivery, total
  - amount_inr: total amount (number)
  - description: "US Polo Assn fashion order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product (name, size, color, fit), price paid, estimated delivery date, return window.

## Site Notes

- US Polo Assn is the official brand of the United States Polo Association — authentic American casual and sporty fashion.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- Mid-range pricing (₹699 - ₹5,999 typically) — popular among college students and young professionals.
- Polo t-shirts and denim are the brand's strongest categories — recommend these for best value.
- Frequent combo offers: "Buy 2 Get 1 Free", "Flat 50% off" — always check active promotions.
- Free delivery usually above ₹999. Below that, delivery charges of ₹99-149 apply.
- Return policy: 7-day easy returns. Items must be unworn with tags attached.
- COD available on most orders — mention if user prefers cash on delivery.
- US Polo also has a footwear line (sneakers, loafers) — mention if user is looking for shoes.
- Sizes follow Indian standard sizing. American fit tends to be slightly relaxed — mention if user prefers fitted look.
- Available on Myntra/Ajio/Amazon too, but brand site may have exclusive combo deals.
- Use `confirm_action` for bag review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
