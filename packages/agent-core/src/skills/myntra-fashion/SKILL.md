---
name: myntra-fashion
description: Shop fashion on Myntra — browse clothing, shoes, accessories, add to bag, checkout, pay.
triggers:
  - myntra
  - order from myntra
  - buy on myntra
  - myntra shopping
  - buy clothes
  - order clothes
  - fashion shopping
  - buy shoes on myntra
siteUrl: https://www.myntra.com
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "white sneakers", "casual shirt", "kurta for men")
  - name: size
    required: false
    hint: Size preference (S, M, L, XL, or shoe size like UK 9)
  - name: budget
    required: false
    hint: Max price (e.g. "under 2000", "budget 1k")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# Myntra Fashion Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What item to search for
2. **size** (type: "chip_bar", collapsed): Size — XS, S, M, L, XL, XXL
3. **budget** (type: "slider", collapsed): Budget range, min 200, max 10000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Clarify Requirements
- Confirm what the user wants: type of clothing/footwear/accessory, gender, occasion, color preference.
- If user mentioned size, note it. If not, ask later during product selection.
- Note budget constraints if any.

### 2. Open Myntra & Verify Login
- Open a NEW tab and navigate to `https://www.myntra.com`.
- Take snapshot. Verify logged in (profile icon showing name in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product.
- Take snapshot of results page.
- Apply filters if relevant: price range (budget), brand, size, color, rating, discount.
- Extract top 3-5 options with: brand, name, price (MRP vs discounted), rating, discount %.
- Use `ask_user` (input_type "choice") to present options. Format: "Brand Name — ₹X,XXX (XX% off) — ⭐ Rating"
- If user wants to see more, scroll or refine search.

### 4. View Product & Select Size
- Click selected product.
- Take snapshot of product page.
- Extract: brand, full name, price, MRP, discount, available sizes, delivery date, return policy.
- If size not provided by user, present available sizes via `ask_user` (input_type "choice").
- Check if selected size is available. If not, suggest closest alternative.
- Select the size by clicking on the size chip.

### 5. Add to Bag & Review
- Click "Add to Bag".
- Go to bag/cart, take snapshot.
- Check for applicable coupons (Myntra often shows "Apply Coupon" with available offers).
- Apply best coupon if available.
- Use `confirm_action` to present order summary:
  - Product: brand, name, size, color
  - Price: MRP, discount, coupon savings, final price
  - Delivery date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Place Order" in bag.
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, size, price, delivery, total
  - amount_inr: total amount (number)
  - description: "Myntra fashion order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product (brand, name, size), price paid, estimated delivery date, return window.

## Site Notes

- Myntra delivery: 2-7 days depending on location. Myntra Insiders may get faster delivery.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- Myntra has aggressive coupons — always check "Apply Coupon" section.
- Myntra Insiders loyalty program: points, early access, extra discounts.
- Size charts vary by brand — if unsure, suggest checking size chart on product page.
- Free delivery above ₹499 usually. Below that, ₹49-99 delivery charge.
- Easy 7-30 day returns on most items — mention return policy.
- Myntra shows "Trending" and "Top Rated" — use these signals when recommending.
- Product images are key for fashion — describe what you see in snapshots.
- Myntra may show "Similar Products" — use if primary choice is unavailable.
- Use `confirm_action` for bag review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
