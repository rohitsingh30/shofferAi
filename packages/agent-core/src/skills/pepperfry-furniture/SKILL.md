---
name: pepperfry-furniture
description: Shop on Pepperfry — browse furniture, home decor, mattresses, check delivery, checkout, pay.
triggers:
  - pepperfry
  - order from pepperfry
  - buy on pepperfry
  - buy furniture
  - order furniture online
  - pepperfry furniture
  - buy sofa
  - buy bed online
siteUrl: https://www.pepperfry.com
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "king size bed", "3-seater sofa", "study table", "bookshelf")
  - name: room
    required: false
    hint: Room type (e.g. "bedroom", "living room", "study", "dining")
  - name: material
    required: false
    hint: Material preference (e.g. "solid wood", "engineered wood", "metal", "fabric")
  - name: budget
    required: false
    hint: Max price (e.g. "under 20000", "budget 15k")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, EMI)
---

# Pepperfry Furniture Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Clarify Requirements
- Confirm what the user wants: furniture type, room it is for, dimensions if relevant.
- Use `ask_user` to clarify: material (solid wood, engineered wood, metal), color/finish, style (modern, traditional, minimalist), budget.
- Note space constraints if user mentions them (e.g. "small room", specific dimensions).

### 2. Open Pepperfry & Verify Login
- Open a NEW tab and navigate to `https://www.pepperfry.com`.
- Take snapshot. Verify logged in (profile icon or name in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product.
- Take snapshot of search results page.
- Apply filters: material, price range, brand, color, style, rating, discount.
- Check delivery availability by entering user's pincode if known.
- Extract top 3-5 options with: name, brand, price (MRP vs discounted), material, dimensions, rating, discount %.
- Use `ask_user` (input_type "choice") to present options. Format: "Brand Name — Material — ₹XX,XXX (XX% off) — ⭐ Rating — Dimensions"
- If user wants to see more, scroll or refine filters.

### 4. View Product Details
- Click selected product.
- Take snapshot of product page.
- Extract: full name, brand, price, MRP, discount, material, finish, dimensions (L x W x H), weight, warranty, assembly required (yes/no), delivery date.
- Check pincode-based delivery availability and estimated date.
- If product has color/finish variants, present them via `ask_user` (input_type "choice").
- Confirm with user: "Add [product] at ₹XX,XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Cart".
- Go to cart, take snapshot.
- Check for applicable coupons (Pepperfry frequently offers coupon codes).
- Apply best coupon if available.
- Use `confirm_action` to present order summary:
  - Product: name, brand, material, finish, dimensions
  - Price: MRP, discount, coupon savings, final price
  - Assembly: included or extra cost
  - Delivery date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Proceed to Checkout".
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, material, dimensions, price, delivery, assembly, total
  - amount_inr: total amount (number)
  - description: "Pepperfry furniture order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product details, price paid, estimated delivery date, assembly details.

## Site Notes

- Pepperfry delivery: 7-21 days for furniture (varies by product and location). Decor items ship faster (3-7 days).
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- Pepperfry offers free assembly on many furniture items — check and inform user.
- Pincode check is critical — some large furniture items are not deliverable to all areas.
- EMI options available on most furniture above ₹3,000 — mention to user if relevant.
- Pepperfry's "Woodcraft" store has premium solid wood furniture.
- Dimensions matter a lot for furniture — always present L x W x H clearly.
- Return/replacement policy varies: 7-day return on most items, no return on customized.
- Pepperfry Studio visits available in select cities for in-person viewing.
- Installation charges may apply separately for certain products.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
