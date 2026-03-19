---
name: shopclues-shopping
description: Shop on ShopClues — search budget products, compare prices, add to cart, checkout, pay.
triggers:
  - shopclues
  - order from shopclues
  - buy on shopclues
  - shopclues shopping
  - shopclues order
  - budget shopping shopclues
  - cheap products shopclues
  - shop on shopclues
siteUrl: https://www.shopclues.com
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "mobile cover", "wall sticker", "kitchen set", "curtains")
  - name: budget
    required: false
    hint: Max price (e.g. "under 300", "budget 200")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, wallet)
---

# ShopClues Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What product to search for
2. **budget** (type: "slider", collapsed): Budget range, min 100, max 50000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Clarify Requirements
- Confirm what the user wants to buy. If vague, use `ask_user` to clarify (category, color, size, material, budget).
- Note any specific requirements (quantity, pattern, dimensions, etc.).
- ShopClues specializes in ultra-budget products — set expectations for quality/delivery times.

### 2. Open ShopClues & Verify Login
- Open a NEW tab and navigate to `https://www.shopclues.com`.
- Take snapshot. Verify logged in (user name visible in top header or account section).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product.
- Take snapshot of search results page.
- Apply filters if relevant: price range (budget), brand, discount %, rating, availability.
- Extract top 3-5 options with: name, price, MRP, discount %, rating, seller, delivery estimate.
- Use `ask_user` (input_type "choice") to present options. Format: "Product Name — ₹XXX (XX% off) — ⭐ Rating — Seller"
- If user wants to see more, scroll or navigate to next page.

### 4. View Product Details
- Click selected product.
- Take snapshot of product page.
- Extract: full name, price, MRP, discount, seller name, seller rating, delivery date, return policy, product specs.
- If product has variants (color, size, pack size), present them via `ask_user` (input_type "choice").
- Check seller reliability — warn user if seller has low rating.
- Confirm with user: "Add [product] at ₹XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Cart".
- Go to cart, take snapshot.
- Check for ShopClues coupons or cashback offers.
- Use `confirm_action` to present order summary:
  - Product name, variant, quantity
  - Price, MRP, discount, coupon savings
  - Delivery date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Place Order" or "Proceed to Checkout".
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, price, delivery, total
  - amount_inr: total amount (number)
  - description: "ShopClues order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product, price paid, estimated delivery date, seller name.

## Site Notes

- ShopClues delivery: 5-15 days depending on seller and location. Expect longer delivery for budget items.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- ShopClues is an ultra-budget marketplace — products can be very cheap but quality varies.
- COD available on most items — mention as an option to user.
- Seller ratings are critical on ShopClues — always check and prefer sellers with 3.5+ rating.
- ShopClues Surety products come with quality guarantee — prefer these when available.
- Free shipping thresholds vary by seller — check shipping charges before confirming.
- Return policy varies by seller (7-15 days typically) — always verify before checkout.
- ShopClues has daily deals and "9 to 99 store" — check for extra savings.
- CluesBucks cashback may be available — apply if present in user account.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
