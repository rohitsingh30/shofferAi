---
name: hometown-decor
description: Shop on HomeTown — browse home decor, furniture, kitchenware, furnishings, checkout, pay.
triggers:
  - hometown
  - order from hometown
  - buy on hometown
  - hometown furniture
  - hometown decor
  - buy decor online
  - hometown home decor
  - buy furnishings
  - hometown kitchenware
siteUrl: https://www.hometown.in
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "sofa set", "wall shelf", "curtains", "dinner set", "bed with storage")
  - name: category
    required: false
    hint: Category (e.g. "furniture", "decor", "kitchen", "furnishings", "lighting")
  - name: style
    required: false
    hint: Style preference (e.g. "modern", "ethnic", "contemporary", "classic")
  - name: budget
    required: false
    hint: Max price (e.g. "under 10000", "budget 25k")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, EMI)
---

# HomeTown Home Decor & Furniture Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What product to search for
2. **budget** (type: "slider", collapsed): Budget range, min 100, max 50000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Clarify Requirements
- Confirm what the user wants: product type, category, room it is for.
- Use `ask_user` to clarify: style (modern, ethnic, contemporary, classic), material, color preference, budget range.
- Ask about room dimensions or space constraints if relevant (furniture items).
- Check if user wants a complete set or individual pieces.

### 2. Open HomeTown & Verify Login
- Open a NEW tab and navigate to `https://www.hometown.in`.
- Take snapshot. Verify logged in (account icon or user name in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product or navigate to the relevant category.
- Take snapshot of search results page.
- Apply filters: category, price range, brand, color, material, rating, discount.
- Check delivery availability by entering user's pincode.
- Extract top 3-5 options with: name, brand, price (MRP vs sale price), material, dimensions (if furniture), rating, discount %.
- Use `ask_user` (input_type "choice") to present options. Format: "Product Name — Brand — Material — ₹XX,XXX (XX% off) — ⭐ Rating"
- If user wants to see more, scroll or refine search filters.

### 4. View Product Details
- Click selected product.
- Take snapshot of product page.
- Extract: full name, brand, price, MRP, discount, material, dimensions, color, weight, warranty, delivery date, return policy.
- Check pincode-based delivery availability and estimated date.
- If product has color or size variants, present them via `ask_user` (input_type "choice").
- Confirm with user: "Add [product] at ₹XX,XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Cart".
- Go to cart, take snapshot.
- Check for applicable coupons or ongoing sale offers.
- Apply best coupon if available.
- Use `confirm_action` to present order summary:
  - Product: name, brand, material, color, dimensions
  - Price: MRP, discount, coupon savings, final price
  - Delivery date and charges
  - Assembly: included or extra (for furniture)
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Proceed to Checkout".
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, brand, material, price, delivery, total
  - amount_inr: total amount (number)
  - description: "HomeTown order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product details, price paid, estimated delivery date, assembly info if applicable.

## Site Notes

- HomeTown is part of the Future Group and carries a wide range: furniture, decor, kitchenware, furnishings, bath accessories.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Delivery times vary: decor/kitchen items 5-10 days, furniture 10-25 days depending on location.
- HomeTown has physical stores in many cities — mention store pickup option if available for user's pincode.
- Free delivery on orders above a certain threshold (typically ₹999) — check at checkout.
- EMI options available on furniture above ₹3,000 — mention to user if relevant.
- Assembly service may be available for furniture items — check product page details.
- Return policy: 7-15 days depending on product category; no returns on personalized items.
- HomeTown frequently runs "End of Season" and festival sales — check for active promotions.
- Pincode check is important — some large furniture items have limited delivery areas.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
