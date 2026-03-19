---
name: indian-terrain
description: Shop men's casual and smart casual wear on Indian Terrain — browse shirts, trousers, jackets, polos, add to bag, checkout, pay.
triggers:
  - indian terrain
  - buy on indian terrain
  - order from indian terrain
  - indian terrain shirt
  - indian terrain shopping
  - indian terrain clothes
  - indian terrain polo
  - indian terrain trousers
siteUrl: https://www.indianterrain.com
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "casual shirt", "chino trousers", "polo t-shirt", "linen jacket", "shorts")
  - name: size
    required: false
    hint: Size preference (S, M, L, XL, XXL, or waist size like 32, 34)
  - name: color
    required: false
    hint: Color preference (e.g. "navy blue", "white", "olive", "light pink")
  - name: budget
    required: false
    hint: Max price (e.g. "under 2000", "budget 3k")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, net banking)
---

# Indian Terrain — Men's Casual & Smart Casual Wear

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What item to search for
2. **size** (type: "chip_bar", collapsed): Size — XS, S, M, L, XL, XXL
3. **budget** (type: "slider", collapsed): Budget range, min 200, max 10000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Clarify Requirements
- Confirm what the user wants: shirts, trousers, polos, t-shirts, jackets, shorts, or accessories.
- Use `ask_user` to clarify: type of clothing, fit (slim, regular, relaxed), occasion (casual, smart casual, weekend), size, color preference, budget.
- Indian Terrain specializes in men's casual and smart casual wear with a relaxed, resort-inspired aesthetic — position accordingly.
- Also carries Indian Terrain Boy for kids — mention if user is shopping for children.

### 2. Open Indian Terrain & Verify Login
- Open a NEW tab and navigate to `https://www.indianterrain.com`.
- Take snapshot. Verify logged in (account icon or name in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product.
- Take snapshot of search results page.
- Apply filters: category, price range, size, color, fit, fabric, sleeve length.
- Indian Terrain frequently runs offers (Buy 2 Get 1, flat discounts) — check active promotions.
- Extract top 3-5 options with: product name, price (MRP vs discounted), discount %, fabric, fit, color.
- Use `ask_user` (input_type "choice") to present options. Format: "Product Name — ₹X,XXX (XX% off) — Fabric — Fit"
- If user wants to see more, scroll or refine filters.

### 4. View Product & Select Variants
- Click selected product.
- Take snapshot of product page.
- Extract: product name, price, MRP, discount, fabric, fit type, pattern, available sizes, available colors, wash care, delivery date, return policy.
- If product has color variants, present via `ask_user` (input_type "choice").
- If size not provided, present available sizes via `ask_user` (input_type "choice").
- Check for combo offers (e.g., "Buy 2 shirts at ₹X,XXX").
- Confirm with user: "Add [product] at ₹X,XXX to bag?"

### 5. Add to Bag & Review
- Click "Add to Bag" or "Add to Cart".
- Go to bag/cart, take snapshot.
- Check for applicable coupon codes or ongoing sale offers.
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
  - description: "Indian Terrain fashion order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product (name, size, color, fit), price paid, estimated delivery date, return window.

## Site Notes

- Indian Terrain is a popular Indian menswear brand known for relaxed, casual, and smart-casual clothing.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- Prices are mid-range (₹800 - ₹5,000 typically) — good value for branded casual wear.
- Frequent combo offers: "Buy 2 Get 1 Free", "Flat 40% off" — always check active promotions.
- Free delivery usually above ₹999. Below that, delivery charges apply.
- Return policy: 7-day easy returns on most items in original condition with tags.
- COD available on most orders — mention if user prefers cash on delivery.
- Indian Terrain has a loyalty program — check if any loyalty points or rewards apply.
- Sizes follow Indian standard sizing. Slim fit tends to run tight — suggest going one size up if unsure.
- Use `confirm_action` for bag review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
