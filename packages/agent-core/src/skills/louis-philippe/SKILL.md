---
name: louis-philippe
description: Shop premium men's fashion on Louis Philippe — browse formal shirts, suits, trousers, blazers, casual wear, accessories, checkout, pay.
triggers:
  - louis philippe
  - buy on louis philippe
  - order from louis philippe
  - louis philippe shirt
  - louis philippe suit
  - louis philippe formal
  - louis philippe shopping
  - louis philippe blazer
siteUrl: https://www.louisphilippe.com
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "premium formal shirt", "wool-blend suit", "Italian cotton shirt", "blazer", "chinos")
  - name: size
    required: false
    hint: Size preference (38, 40, 42, 44 for shirts/suits, S, M, L, XL, or waist size 30, 32, 34)
  - name: color
    required: false
    hint: Color preference (e.g. "white", "powder blue", "charcoal", "navy", "wine")
  - name: fit
    required: false
    hint: Fit preference (slim, regular, tailored, comfort)
  - name: budget
    required: false
    hint: Max price (e.g. "under 5000", "budget 8k")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, net banking, EMI)
---

# Louis Philippe — Premium Men's Fashion

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What item to search for
2. **size** (type: "chip_bar", collapsed): Size — XS, S, M, L, XL, XXL
3. **budget** (type: "slider", collapsed): Budget range, min 200, max 10000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Clarify Requirements
- Confirm what the user wants: formal shirts, suits, blazers, trousers, casual shirts, polos, accessories (ties, belts, wallets), or footwear.
- Use `ask_user` to clarify: occasion (boardroom, wedding, formal event, smart casual), fit (slim, regular, tailored), fabric preference (Egyptian cotton, Italian cotton, linen, wool blend), size, color, budget.
- Louis Philippe is the most premium brand in Aditya Birla's portfolio — positioned as the pinnacle of Indian formalwear.
- Sub-brands: LP Luxure (ultra-premium), LP Sport (casual), LP Athwork (athleisure) — ask user which segment.

### 2. Open Louis Philippe & Verify Login
- Open a NEW tab and navigate to `https://www.louisphilippe.com`.
- Take snapshot. Verify logged in (account icon or name in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product.
- Take snapshot of search results page.
- Apply filters: category, price range, size, color, fit, fabric, pattern, occasion, collar type, sleeve type.
- Louis Philippe occasionally runs offers but discounts are less aggressive than Peter England — focus on quality.
- Extract top 3-5 options with: product name, collection (LP/Luxure/Sport), price (MRP vs discounted), fabric, fit, pattern.
- Use `ask_user` (input_type "choice") to present options. Format: "Product Name — ₹X,XXX (XX% off) — Fabric — Fit — Collection"
- If user wants to see more, scroll or change filters.

### 4. View Product & Select Variants
- Click selected product.
- Take snapshot of product page.
- Extract: product name, collection, price, MRP, discount, fabric (origin, weave), fit type, pattern, collar type, cuff style, available sizes, available colors, wash care, delivery date, return policy.
- If product has color variants, present via `ask_user` (input_type "choice").
- If size not provided, present available sizes via `ask_user` (input_type "choice").
- Louis Philippe provides detailed fabric stories (Egyptian cotton, Italian weave) — share with user for premium feel.
- Check for any active offers or loyalty benefits.
- Confirm with user: "Add [product] at ₹X,XXX to bag?"

### 5. Add to Bag & Review
- Click "Add to Bag".
- Go to bag/cart, take snapshot.
- Check for applicable coupon codes or promotional offers.
- Apply best coupon or offer available.
- Use `confirm_action` to present order summary:
  - Product: name, collection, size, color, fit, fabric
  - Price: MRP, discount, coupon savings, final price
  - Delivery date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Proceed to Checkout".
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, collection, size, color, fit, price, coupon, delivery, total
  - amount_inr: total amount (number)
  - description: "Louis Philippe premium fashion order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product (name, collection, size, color, fit), price paid, estimated delivery date, return window.

## Site Notes

- Louis Philippe is Aditya Birla's most premium menswear brand — known for exquisite fabrics and superior craftsmanship.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- Premium pricing (₹1,999 - ₹24,999 typically) — positioned for executives and discerning professionals.
- LP Luxure collection uses imported Italian and Egyptian fabrics — highlight for luxury-seekers.
- Offers are less frequent than budget brands — focus on quality and fabric story rather than discounts.
- Free delivery usually above ₹999. Express delivery may be available in metro cities.
- Return policy: 7-day easy returns. Items must be unworn with tags attached.
- COD available on most orders — mention if user prefers cash on delivery.
- Suit and blazer sizing is detailed (36-48 chest). Always recommend checking the detailed size guide.
- Louis Philippe stores offer free alterations — online orders can be altered at nearest store.
- Use `confirm_action` for bag review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
