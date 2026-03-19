---
name: meesho-shopping
description: Shop on Meesho — browse affordable products, compare sellers, buy clothing, home decor, accessories at lowest prices.
triggers:
  - meesho
  - order from meesho
  - buy on meesho
  - meesho shopping
  - cheap shopping
  - buy affordable clothes
  - meesho order
  - budget shopping
siteUrl: https://www.meesho.com
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "women's kurti", "phone case", "bed sheets", "earrings")
  - name: size
    required: false
    hint: Size preference (S, M, L, XL, Free Size)
  - name: budget
    required: false
    hint: Max price (e.g. "under 500", "budget 300")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# Meesho Affordable Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What item to search for
2. **size** (type: "chip_bar", collapsed): Size — XS, S, M, L, XL, XXL
3. **budget** (type: "slider", collapsed): Budget range, min 200, max 10000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Clarify Requirements
- Confirm what the user wants: clothing, home decor, accessories, electronics accessories, kitchen items.
- Use `ask_user` to clarify: category, gender (if clothing), size, color preference, budget.
- Note that Meesho is best for budget/value shopping — set expectations on quality vs price.

### 2. Open Meesho & Verify Login
- Open a NEW tab and navigate to `https://www.meesho.com`.
- Take snapshot. Verify logged in (profile icon or name in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product.
- Take snapshot of search results page.
- Apply filters: price range, rating (4+ stars is important on Meesho), color, size, delivery speed.
- Sort by rating or popularity — on Meesho, seller quality varies significantly.
- Extract top 3-5 options with: name, price, rating, review count, delivery date, seller rating.
- Use `ask_user` (input_type "choice") to present options. Format: "Product Name — ₹XXX — ⭐ Rating (X reviews) — Delivery by DATE"
- Prioritize products with high ratings (4+) and many reviews — quality signal on Meesho.

### 4. View Product Details
- Click selected product.
- Take snapshot of product page.
- Extract: name, price, material, available sizes/colors, rating, review count, seller name, seller rating, delivery date, return policy.
- Read top user reviews — summarize quality feedback for the user.
- If product has size variants, present via `ask_user` (input_type "choice").
- If product has color variants, present via `ask_user` (input_type "choice").
- Warn user if seller rating is below 3.5 — suggest alternative seller/product.
- Confirm with user: "Add [product] at ₹XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Cart" or "Buy Now".
- Go to cart, take snapshot.
- Check for any applicable offers or free delivery promotions.
- Use `confirm_action` to present order summary:
  - Product: name, size, color, material
  - Price: amount, any discounts
  - Seller: name, rating
  - Delivery date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Place Order" or "Proceed".
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, size, color, seller, price, delivery, total
  - amount_inr: total amount (number)
  - description: "Meesho order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product details, seller name, price paid, estimated delivery date, return window.

## Site Notes

- Meesho delivery: 4-8 days for most items. Delivery times vary by seller location.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- Meesho is a marketplace — quality varies hugely between sellers. Always check seller rating and reviews.
- Free delivery on most items (included in price). COD may have a small charge.
- Return policy: 7-day easy returns on most items. Meesho handles returns directly.
- Meesho photos can be misleading — read reviews with photos for actual product appearance.
- Price is the main draw — products are often 50-80% cheaper than branded alternatives.
- Meesho is best for: women's ethnic wear, home textiles, phone accessories, costume jewelry.
- COD is very popular on Meesho — user may prefer it for trust reasons.
- Check "Meesho Mall" section for slightly higher quality, verified sellers.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
