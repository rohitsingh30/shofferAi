---
name: skechers-shoes
description: Shop on Skechers India — browse, select size, buy comfort shoes, walking shoes, performance footwear, checkout, pay.
triggers:
  - skechers
  - buy skechers shoes
  - order from skechers
  - skechers walking shoes
  - skechers go walk
  - buy shoes on skechers
  - skechers india
  - skechers comfort shoes
siteUrl: https://www.skechers.in
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "Go Walk", "D'Lites", "Arch Fit", "walking shoes", "slip-ons")
  - name: size
    required: false
    hint: Shoe size (UK 6, UK 7, UK 8, UK 9, UK 10)
  - name: gender
    required: false
    hint: Men, Women, or Kids
  - name: budget
    required: false
    hint: Max price (e.g. "under 7000", "budget 5k")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# Skechers Comfort Shoes Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What item to search for
2. **size** (type: "chip_bar", collapsed): Size — XS, S, M, L, XL, XXL
3. **budget** (type: "slider", collapsed): Budget range, min 200, max 10000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Clarify Requirements
- Confirm what the user wants: walking shoes, slip-ons, performance shoes, casual sneakers, or sandals.
- Use `ask_user` to clarify: product type (walking, running, casual, work, slip-on), gender, size, color preference, budget range.
- Note any specific technology preferences: Go Walk, Arch Fit, Max Cushioning, D'Lites, Hands Free Slip-ins.
- Ask about intended use: daily walking, office, casual wear, light running, standing all day.

### 2. Open Skechers India & Verify Login
- Open a NEW tab and navigate to `https://www.skechers.in`.
- Take snapshot. Verify logged in (profile icon or account name visible in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product.
- Take snapshot of search results page.
- Apply filters if relevant: gender, price range, color, category (Walking, Running, Casual, Work, Slip-ons), technology (Arch Fit, Go Walk, Max Cushioning), size.
- Extract top 3-5 options with: model name, technology, price, color, width options.
- Use `ask_user` (input_type "choice") to present options. Format: "Model Name — Technology — ₹X,XXX — Color"
- If user wants to see more, scroll or refine filters.

### 4. View Product Details
- Click selected product.
- Take snapshot of product page.
- Extract: model name, technology (Arch Fit, Air-Cooled Memory Foam, etc.), MRP, sale price, available sizes, available colors, width (regular/wide), delivery date.
- If product has multiple colors, present via `ask_user` (input_type "choice").
- Present available sizes via `ask_user` (input_type "choice") with UK sizing.
- Check if wide-fit option is available — Skechers offers wide widths on many models.
- Confirm with user: "Add [Model] (Size UK X, Color) at ₹X,XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Bag" or "Add to Cart".
- Go to cart, take snapshot.
- Check for any active promo codes or member discounts.
- Use `confirm_action` to present order summary:
  - Product: model name, technology, color, size, width
  - Price: MRP, discount, subtotal
  - Delivery charges and estimated delivery date
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Checkout".
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, model, technology, size, color, price, delivery, total
  - amount_inr: total amount (number)
  - description: "Skechers India order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product details (model, technology, size, color), price paid, estimated delivery date.

## Site Notes

- Skechers uses UK sizing for shoes in India. Always confirm UK size with the user before adding to cart.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- Skechers is the comfort shoe leader — Air-Cooled Memory Foam insoles are standard on most models.
- Free delivery on orders above ₹2,499 typically. Standard delivery 5-7 business days.
- Skechers has a 15-day return policy — items must be unworn with original packaging.
- Popular technologies: Arch Fit (podiatrist-certified), Go Walk (lightweight walking), Max Cushioning, Hands Free Slip-ins, Hyper Burst.
- Skechers Hands Free Slip-ins are a unique innovation — heel collapses for easy entry, then springs back.
- D'Lites is Skechers' iconic chunky sneaker — very popular for casual/fashion wear.
- Skechers offers wide-fit options on many models — important for users with broader feet.
- Skechers Go Walk is the bestselling walking shoe line in India — recommend for daily walkers.
- Skechers has 200+ exclusive stores in India — suggest store visit for try-on if user is unsure about size.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
