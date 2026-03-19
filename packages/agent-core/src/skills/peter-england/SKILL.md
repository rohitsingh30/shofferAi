---
name: peter-england
description: Shop men's formal and semi-formal wear on Peter England — browse formal shirts, trousers, suits, blazers, add to bag, checkout, pay.
triggers:
  - peter england
  - buy on peter england
  - order from peter england
  - peter england shirt
  - peter england formal
  - peter england shopping
  - peter england suit
  - peter england trousers
siteUrl: https://www.peterengland.com
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "formal white shirt", "black trousers", "blazer", "suit", "linen shirt")
  - name: size
    required: false
    hint: Size preference (38, 40, 42, 44 for shirts/suits, or S, M, L, XL, or waist size 30, 32, 34)
  - name: color
    required: false
    hint: Color preference (e.g. "white", "light blue", "charcoal grey", "navy")
  - name: fit
    required: false
    hint: Fit preference (slim, regular, super slim, comfort)
  - name: budget
    required: false
    hint: Max price (e.g. "under 1500", "budget 2k")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, net banking)
---

# Peter England — Men's Formal & Semi-Formal Wear

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What item to search for
2. **size** (type: "chip_bar", collapsed): Size — XS, S, M, L, XL, XXL
3. **budget** (type: "slider", collapsed): Budget range, min 200, max 10000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Clarify Requirements
- Confirm what the user wants: formal shirts, trousers, blazers, suits, ties, casual shirts, t-shirts, or accessories.
- Use `ask_user` to clarify: occasion (office, interview, wedding, formal event), fit (slim, regular, super slim), fabric (cotton, linen, poly-blend), size, color, budget.
- Peter England is Aditya Birla's most affordable formal brand — ideal for office wear and first-job professionals.
- Also carries Peter England Elite (premium range) and casual line — ask user which segment.

### 2. Open Peter England & Verify Login
- Open a NEW tab and navigate to `https://www.peterengland.com`.
- Take snapshot. Verify logged in (account icon or name in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product.
- Take snapshot of search results page.
- Apply filters: category, price range, size, color, fit, fabric, sleeve type, pattern, occasion.
- Peter England runs frequent offers (Buy 2 at ₹999, flat 50% off) — check active promotions.
- Extract top 3-5 options with: product name, price (MRP vs discounted), discount %, fabric, fit, pattern.
- Use `ask_user` (input_type "choice") to present options. Format: "Product Name — ₹X,XXX (XX% off) — Fabric — Fit"
- If user wants to see more, scroll or change filters.

### 4. View Product & Select Variants
- Click selected product.
- Take snapshot of product page.
- Extract: product name, price, MRP, discount, fabric, fit type, pattern, collar type, sleeve type, available sizes, available colors, wash care, delivery date, return policy.
- If product has color variants, present via `ask_user` (input_type "choice").
- If size not provided, present available sizes via `ask_user` (input_type "choice").
- For formal shirts, note collar size and sleeve length if mentioned.
- Check for bundle offers (e.g., "Buy 2 shirts at ₹X,XXX").
- Confirm with user: "Add [product] at ₹X,XXX to bag?"

### 5. Add to Bag & Review
- Click "Add to Bag".
- Go to bag/cart, take snapshot.
- Check for applicable coupon codes or active sale offers.
- Apply best coupon or offer available.
- Use `confirm_action` to present order summary:
  - Product: name, size, color, fit, fabric, pattern
  - Price: MRP, discount, coupon savings, final price
  - Delivery date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Proceed to Checkout".
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, size, color, fit, price, coupon, delivery, total
  - amount_inr: total amount (number)
  - description: "Peter England fashion order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product (name, size, color, fit), price paid, estimated delivery date, return window.

## Site Notes

- Peter England is India's largest menswear brand by Aditya Birla Fashion — known for affordable formal wear.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- Very affordable pricing (₹499 - ₹3,999 typically) — excellent value for formal and office wear.
- Frequent combo/bundle offers: "2 for ₹999", "3 for ₹1,499" — always check active promotions.
- Free delivery usually above ₹999. Below that, ₹99-149 delivery charge.
- Return policy: 7-day easy returns. Items must be unworn with tags attached.
- COD available on most orders — mention if user prefers cash on delivery.
- Peter England Elite is the premium sub-brand — prices slightly higher, better fabrics.
- Sizes follow Indian standard (38, 40, 42 for shirts). Slim fit runs tight — suggest checking size chart.
- Peter England is available on Myntra/Ajio too, but the brand site may have exclusive offers.
- Use `confirm_action` for bag review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
