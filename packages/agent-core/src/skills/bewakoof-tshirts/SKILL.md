---
name: bewakoof-tshirts
description: Buy graphic tees, oversized t-shirts, and casual wear on Bewakoof — browse designs, select size, add to cart, checkout, pay.
triggers:
  - bewakoof
  - buy bewakoof tshirt
  - graphic tees
  - order bewakoof
  - cool t-shirts online
  - oversized tshirt
  - bewakoof shopping
  - buy casual wear
siteUrl: https://www.bewakoof.com
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "graphic t-shirt", "oversized tee", "joggers", "hoodie", "anime tshirt")
  - name: size
    required: false
    hint: Size preference (XS, S, M, L, XL, XXL, 3XL)
  - name: theme
    required: false
    hint: Design theme (e.g. "anime", "Marvel", "minimalist", "typography", "pop culture")
  - name: budget
    required: false
    hint: Max price (e.g. "under 500", "budget 800")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, wallet)
---

# Bewakoof Graphic Tees & Casual Wear Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What item to search for
2. **size** (type: "chip_bar", collapsed): Size — XS, S, M, L, XL, XXL
3. **budget** (type: "slider", collapsed): Budget range, min 200, max 10000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Gather Requirements
- Confirm what the user wants: graphic t-shirt, oversized tee, hoodie, joggers, shorts, or accessories.
- Use `ask_user` to clarify: gender (men/women), preferred design theme (anime, Marvel, DC, minimalist, typography, pop culture, abstract), color preference, fit (regular, oversized, slim).
- Note size preference. Bewakoof uses standard Indian sizing (XS to 3XL).
- Note budget — Bewakoof is budget-friendly (Rs 200-1500 range).

### 2. Open Bewakoof & Verify Login
- Open a NEW tab and navigate to `https://www.bewakoof.com`.
- Take snapshot. Verify logged in (profile icon or username visible in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product (e.g. "anime graphic tee men").
- Take snapshot of search results page.
- Apply filters if relevant: size, color, price range, fit type (oversized, regular), brand collection, rating.
- Sort by popularity or "new arrivals" unless user specifies otherwise.
- Extract top 3-5 options with: design name, color, price (MRP vs discounted), fit type, rating.
- Use `ask_user` (input_type "choice") to present options. Format: "[Design Name] — [Color] — Rs XXX (XX% off) — [Fit] — Rating X.X"
- Describe the graphic/design visible in the snapshot since design is key for this category.
- If user wants to see more, scroll or refine search.

### 4. View Product & Select Size
- Click selected product.
- Take snapshot of product page.
- Extract: design name, color, price, MRP, discount, available sizes, fit type (oversized, regular), fabric composition, wash care, delivery date.
- If size not provided by user, present available sizes via `ask_user` (input_type "choice").
- Describe the design from the snapshot — print placement, colors, graphic style.
- Check size availability. If preferred size is sold out, suggest next available.
- Mention size chart if user is unsure about fit.

### 5. Add to Cart & Review
- Click "Add to Bag" or "Add to Cart".
- Go to cart, take snapshot.
- Check for applicable coupons (Bewakoof runs frequent discount codes and Tribe membership offers).
- Check for "Buy 2 for Rs X" or "Buy 3 for Rs Y" combo offers — very common on Bewakoof.
- Apply best coupon/offer if available.
- Use `confirm_action` to present order summary:
  - Product: design name, color, size, fit type
  - Price: MRP, discount, coupon savings, combo deal if applied, final price
  - Delivery date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, design, color, size, price, delivery, total
  - amount_inr: total amount (number)
  - description: "Bewakoof fashion order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product (design name, color, size, fit), price paid, estimated delivery date.

## Site Notes

- Bewakoof delivery: 4-7 days standard, 2-3 days for Tribe members. Free delivery above Rs 499 usually.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Bewakoof Tribe membership (Rs 99/6 months) offers free shipping, early access, extra discounts — check if account has Tribe.
- Combo deals are the norm on Bewakoof (Buy 2 for Rs 999, Buy 3 for Rs 1299) — always check and suggest to user.
- Design and print quality are the main USP — describe graphics in detail from snapshots.
- Oversized t-shirts are their bestselling category — sizing runs large by design.
- Licensed collections (Marvel, DC, Disney, anime) are popular — ask user if they have a franchise preference.
- Size exchange is free within 15 days — mention this to reduce size anxiety.
- COD available on most orders with a small additional charge (Rs 30-50).
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
