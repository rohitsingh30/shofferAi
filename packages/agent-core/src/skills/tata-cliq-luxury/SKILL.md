---
name: tata-cliq-luxury
description: Shop luxury fashion and beauty on Tata CLiQ Luxury — browse Gucci, Armani, Burberry, designer brands, add to bag, checkout, pay.
triggers:
  - tata cliq luxury
  - buy on tata cliq luxury
  - order from tata cliq luxury
  - luxury fashion shopping
  - buy gucci
  - buy armani
  - designer fashion india
  - tata cliq luxury order
siteUrl: https://luxury.tatacliq.com
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "Gucci belt", "Armani perfume", "Burberry scarf", "designer handbag")
  - name: brand
    required: false
    hint: Preferred luxury brand (e.g. "Gucci", "Armani", "Burberry", "Coach", "Hugo Boss")
  - name: size
    required: false
    hint: Size preference (S, M, L, XL, or shoe size like EU 42)
  - name: budget
    required: false
    hint: Max price (e.g. "under 50000", "budget 30k")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, net banking, EMI)
---

# Tata CLiQ Luxury Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Clarify Requirements
- Confirm what the user wants: clothing, accessories, perfume, beauty, footwear, or bags.
- Use `ask_user` to clarify: gender, brand preference, category, occasion (formal, casual, gifting), size, color, budget.
- Tata CLiQ Luxury carries international luxury brands (Gucci, Armani, Burberry, Coach, Hugo Boss, Jimmy Choo) — mention options if user is unsure.
- Note if user wants a specific collection or seasonal release.

### 2. Open Tata CLiQ Luxury & Verify Login
- Open a NEW tab and navigate to `https://luxury.tatacliq.com`.
- Take snapshot. Verify logged in (profile icon or account name in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product or brand.
- Take snapshot of search results page.
- Apply filters: brand, price range, category, color, size, discount.
- Tata CLiQ Luxury often features "New Arrivals" and "Bestsellers" — use these for recommendations.
- Extract top 3-5 options with: brand, name, price (MRP vs discounted), discount %, material.
- Use `ask_user` (input_type "choice") to present options. Format: "Brand — Product Name — ₹XX,XXX (XX% off)"
- If user wants to see more, scroll or refine filters.

### 4. View Product & Select Variants
- Click selected product.
- Take snapshot of product page.
- Extract: brand, full name, price, MRP, discount, available sizes, colors, material, authenticity guarantee, delivery date, return policy.
- If product has color/size variants, present via `ask_user` (input_type "choice").
- If size not provided, present available sizes via `ask_user` (input_type "choice").
- Highlight authenticity guarantee — Tata CLiQ Luxury guarantees 100% authentic products.
- Confirm with user: "Add [product] at ₹XX,XXX to bag?"

### 5. Add to Bag & Review
- Click "Add to Bag".
- Go to bag/cart, take snapshot.
- Check for applicable offers or coupon codes — luxury items sometimes have bank offers or EMI options.
- Use `confirm_action` to present order summary:
  - Product: brand, name, size, color, material
  - Price: MRP, discount, final price
  - Authenticity: guaranteed genuine
  - Delivery date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Proceed to Checkout".
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, brand, size, color, price, delivery, total
  - amount_inr: total amount (number)
  - description: "Tata CLiQ Luxury fashion order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product (brand, name, size, color), price paid, estimated delivery date, return window, authenticity certificate info.

## Site Notes

- Tata CLiQ Luxury guarantees 100% authenticity on all products — always mention this to user.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- Luxury items are higher priced — always confirm budget before proceeding.
- EMI options available on most items above ₹3,000 — mention if user asks about affordability.
- Free delivery on most luxury items. Some items may have express delivery options.
- Return policy varies by brand — typically 7-14 days for unused items with tags intact.
- Tata CLiQ Luxury runs seasonal sales (End of Season, Festive) — check if any sale is active.
- International brands may have size charts different from Indian sizing — suggest checking size guide.
- Gift wrapping may be available — ask user if this is a gift.
- Use `confirm_action` for bag review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
