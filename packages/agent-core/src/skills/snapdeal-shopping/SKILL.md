---
name: snapdeal-shopping
description: Shop on Snapdeal — search budget products, compare deals, add to cart, checkout, pay.
triggers:
  - snapdeal
  - order from snapdeal
  - buy on snapdeal
  - snapdeal shopping
  - buy cheap products
  - budget shopping snapdeal
  - snapdeal order
  - shop on snapdeal
siteUrl: https://www.snapdeal.com
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "bedsheets", "kitchen organizer", "phone cover", "saree")
  - name: budget
    required: false
    hint: Max price (e.g. "under 500", "budget 300")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, wallet)
---

# Snapdeal Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What product to search for
2. **budget** (type: "slider", collapsed): Budget range, min 100, max 50000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Clarify Requirements
- Confirm what the user wants to buy. If vague, use `ask_user` to clarify (category, brand preference, color, size, budget).
- Note any specific requirements (material, pattern, quantity, etc.).
- Snapdeal is best for budget/value products — set expectations accordingly.

### 2. Open Snapdeal & Verify Login
- Open a NEW tab and navigate to `https://www.snapdeal.com`.
- Take snapshot. Verify logged in (user name or email visible in top header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product.
- Take snapshot of search results page.
- Apply filters if relevant: price range (budget), brand, discount %, customer rating (4+), availability.
- Extract top 3-5 options with: name, price, MRP, discount %, rating, seller, delivery estimate.
- Use `ask_user` (input_type "choice") to present options. Format: "Product Name — ₹XXX (XX% off MRP ₹X,XXX) — ⭐ Rating"
- If user wants to see more, scroll or go to next page.

### 4. View Product Details
- Click selected product.
- Take snapshot of product page.
- Extract: full name, price, MRP, discount, seller name, seller rating, delivery date, return policy, specifications.
- If product has variants (color, size, pack), present them via `ask_user` (input_type "choice").
- Confirm with user: "Add [product] at ₹XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Cart".
- Go to cart, take snapshot.
- Check for any applicable offers or combo deals.
- Use `confirm_action` to present order summary:
  - Product name, variant, quantity
  - Price, MRP, discount applied
  - Delivery date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Place Order" or "Proceed to Pay" in cart.
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, price, delivery, total
  - amount_inr: total amount (number)
  - description: "Snapdeal order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product, price paid, estimated delivery date, seller name.

## Site Notes

- Snapdeal delivery: 3-10 days depending on seller and location. Remote pincodes may take longer.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- Snapdeal is a value marketplace — prices are lower but delivery can be slower than Amazon/Flipkart.
- COD (Cash on Delivery) is widely available on Snapdeal — mention if user prefers.
- Seller ratings matter a lot — prefer sellers with 4+ rating and high fulfillment %.
- Free delivery on many items above ₹150-200. Below that, shipping charges apply.
- Return/replacement policy varies by seller — always check before confirming.
- Snapdeal Gold subscription offers extra discounts and free shipping — apply if available.
- Snapdeal often has deals on home, kitchen, fashion accessories, and daily essentials.
- Product images may not always match actual item — set expectations for budget products.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
