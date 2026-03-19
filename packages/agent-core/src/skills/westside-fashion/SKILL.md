---
name: westside-fashion
description: Shop on Westside (Tata) — buy fashion, clothing, footwear, home furnishing, browse collections, checkout, pay.
triggers:
  - westside
  - buy from westside
  - order from westside
  - westside shopping
  - westside fashion
  - tata westside
  - westside clothing
  - westside online
siteUrl: https://www.westside.com
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "women's kurti", "men's casual shirt", "bed sheets", "handbag")
  - name: size
    required: false
    hint: Size preference (XS, S, M, L, XL, XXL)
  - name: budget
    required: false
    hint: Max price (e.g. "under 2000", "budget 1500")
  - name: gender
    required: false
    hint: Gender (men, women, kids)
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# Westside Fashion Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Clarify Requirements
- Confirm what the user wants: clothing (ethnic/western/fusion), footwear, accessories, home furnishing, beauty.
- Use `ask_user` to clarify: gender, occasion (casual, formal, festive), style preference, color, size, budget.
- Note any specific requirements (fabric, fit type, pattern, seasonal collection).

### 2. Open Westside & Verify Login
- Open a NEW tab and navigate to `https://www.westside.com`.
- Take snapshot. Verify logged in (user name or profile icon visible in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Westside online is powered by Tata CLiQ Palette / Tata Marketplace — the URL may redirect.

### 3. Search & Browse Products
- Use the search bar or browse categories (Women, Men, Kids, Home, Beauty).
- Take snapshot of search results or category page.
- Apply filters if relevant: price range, brand (Westside in-house brands: LOV, Nuon, Zuba, WES, Utsa), size, color, discount.
- Extract top 3-5 options with: brand/sub-brand, name, price, MRP, discount %, color, key details.
- Use `ask_user` (input_type "choice") to present options. Format: "Brand Name — ₹X,XXX (XX% off) — Color — Key Detail"
- If user wants to see more, scroll or browse different section.

### 4. View Product & Select Size
- Click selected product.
- Take snapshot of product page.
- Extract: brand, full name, price, MRP, discount, available sizes, colors, fabric, fit, care instructions, delivery date.
- If size not provided by user, present available sizes via `ask_user` (input_type "choice").
- Check size availability — suggest alternatives if selected size is out of stock.
- If product has color variants, present them via `ask_user` (input_type "choice").
- Select size and color by clicking the appropriate chips.
- Confirm with user: "Add [product] (Size [X], [Color]) at ₹X,XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Cart" or "Add to Bag".
- Go to cart, take snapshot.
- Check for applicable coupons or ongoing sale offers.
- Apply best coupon if available.
- Use `confirm_action` to present order summary:
  - Product: brand, name, size, color
  - Price, MRP, discount, coupon savings
  - Delivery date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Proceed to Checkout" or "Place Order".
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, brand, size, color, price, delivery, total
  - amount_inr: total amount (number)
  - description: "Westside fashion order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product (brand, name, size, color), price paid, estimated delivery date, return policy.

## Site Notes

- Westside delivery: 3-7 days depending on location. May be fulfilled via Tata CLiQ infrastructure.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- Westside is a Tata Group brand — known for quality, affordable fashion with in-house labels.
- Key Westside sub-brands: LOV (young women), Nuon (casual/street), Zuba (ethnic), WES (men's casual), Utsa (ethnic women), ETA (men's formal).
- Free delivery above ₹499 typically. Below that, delivery charges apply.
- Westside online may redirect to Tata CLiQ — follow the flow regardless of domain.
- Return/exchange within 15-30 days on most items (unworn, tags intact).
- Westside stores are popular for in-store experience — mention store locator if user prefers.
- Seasonal sales (EOSS, festive) offer significant discounts — check for active sale.
- WestStyleClub loyalty program — check for points or membership benefits.
- Home category includes bed linen, towels, cushions, decor — not just fashion.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
