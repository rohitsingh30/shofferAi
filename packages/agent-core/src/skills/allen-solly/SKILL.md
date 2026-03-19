---
name: allen-solly
description: Shop smart casual fashion on Allen Solly — browse shirts, chinos, dresses, work wear, casual wear for men and women, checkout, pay.
triggers:
  - allen solly
  - buy on allen solly
  - order from allen solly
  - allen solly shirt
  - allen solly shopping
  - allen solly dress
  - allen solly chinos
  - allen solly women
siteUrl: https://www.allensolly.com
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "slim fit chinos", "casual shirt", "women's dress", "blazer", "polo t-shirt")
  - name: gender
    required: false
    hint: Men, Women, or Boys/Girls (Allen Solly has all segments)
  - name: size
    required: false
    hint: Size preference (S, M, L, XL, XXL, or waist size like 30, 32, 34)
  - name: color
    required: false
    hint: Color preference (e.g. "navy", "khaki", "white", "pink", "olive")
  - name: budget
    required: false
    hint: Max price (e.g. "under 2000", "budget 3k")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, net banking)
---

# Allen Solly — Smart Casual Fashion

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What item to search for
2. **size** (type: "chip_bar", collapsed): Size — XS, S, M, L, XL, XXL
3. **budget** (type: "slider", collapsed): Budget range, min 200, max 10000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Clarify Requirements
- Confirm what the user wants: shirts, chinos, trousers, dresses, t-shirts, blazers, or accessories.
- Use `ask_user` to clarify: gender (men/women/kids), type, occasion (office casual, weekend, Friday dressing), fit, size, color, budget.
- Allen Solly is known as the pioneer of "Friday Dressing" in India — smart casual, colorful, youthful work wear.
- Carries both men's and women's lines — clarify gender upfront.

### 2. Open Allen Solly & Verify Login
- Open a NEW tab and navigate to `https://www.allensolly.com`.
- Take snapshot. Verify logged in (account icon or name in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product.
- Take snapshot of search results page.
- Apply filters: gender, category, price range, size, color, fit, fabric, pattern, discount.
- Allen Solly runs frequent offers (BOGO, flat discounts, end-of-season sale) — check active promotions.
- Extract top 3-5 options with: product name, price (MRP vs discounted), discount %, fabric, fit, color.
- Use `ask_user` (input_type "choice") to present options. Format: "Product Name — ₹X,XXX (XX% off) — Fabric — Fit"
- If user wants to see more, scroll or refine filters.

### 4. View Product & Select Variants
- Click selected product.
- Take snapshot of product page.
- Extract: product name, price, MRP, discount, fabric, fit type, pattern, available sizes, available colors, wash care, delivery date, return policy.
- If product has color variants, present via `ask_user` (input_type "choice").
- If size not provided, present available sizes via `ask_user` (input_type "choice").
- Check for bundle or combo offers (e.g., "Buy 3 for ₹X,XXX").
- Confirm with user: "Add [product] at ₹X,XXX to bag?"

### 5. Add to Bag & Review
- Click "Add to Bag".
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
  - description: "Allen Solly fashion order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product (name, size, color, fit), price paid, estimated delivery date, return window.

## Site Notes

- Allen Solly is an Aditya Birla brand known for smart casual and "Friday Dressing" — colorful, youthful office wear.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- Mid-range pricing (₹799 - ₹4,999 typically) — good balance of quality and affordability.
- Carries both men's and women's lines plus kids (Allen Solly Junior) — always clarify gender.
- Frequent promotions: BOGO (Buy 1 Get 1), flat percentage discounts, end-of-season sales.
- Free delivery usually above ₹999. Below that, ₹99-149 delivery charge.
- Return policy: 7-day easy returns. Items must be unworn with tags attached.
- COD available on most orders — mention if user prefers cash on delivery.
- Allen Solly chinos are a bestseller — recommend if user wants casual trousers.
- Sizes follow Indian standard sizing. Women's sizes available in XS-XXL and numerical (2, 4, 6, 8).
- Available on Myntra/Ajio too, but brand site may have exclusive combos and offers.
- Use `confirm_action` for bag review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
