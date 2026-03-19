---
name: nike-shoes
description: Shop on Nike India — browse, select size, buy shoes, apparel, and accessories, checkout, pay.
triggers:
  - nike
  - buy nike shoes
  - order from nike
  - nike running shoes
  - nike sneakers
  - buy shoes on nike
  - nike apparel
  - nike india
siteUrl: https://www.nike.com/in
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "Air Max 90", "running shoes", "Jordan 1", "Dri-FIT t-shirt")
  - name: size
    required: false
    hint: Shoe size (UK 7, UK 8, UK 9) or clothing size (S, M, L, XL)
  - name: gender
    required: false
    hint: Men, Women, or Kids
  - name: budget
    required: false
    hint: Max price (e.g. "under 10000", "budget 8k")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# Nike Shoes & Apparel Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What item to search for
2. **size** (type: "chip_bar", collapsed): Size — XS, S, M, L, XL, XXL
3. **budget** (type: "slider", collapsed): Budget range, min 200, max 10000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Clarify Requirements
- Confirm what the user wants: shoes, apparel, or accessories.
- Use `ask_user` to clarify: product type (running, lifestyle, basketball, training), gender, size, color preference, budget range.
- Note any specific model requests (Air Max, Air Force 1, Jordan, Pegasus, Dunk, etc.).
- Ask about intended use: daily wear, running, gym training, casual.

### 2. Open Nike India & Verify Login
- Open a NEW tab and navigate to `https://www.nike.com/in`.
- Take snapshot. Verify logged in (profile icon or "Hi, [Name]" visible in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product.
- Take snapshot of search results page.
- Apply filters if relevant: gender, price range, color, brand line (Jordan, Nike Sportswear, Nike Running), size, sort by relevance or price.
- Extract top 3-5 options with: model name, price, color, available sizes, product type.
- Use `ask_user` (input_type "choice") to present options. Format: "Model Name — ₹X,XXX — Color — Category"
- If user wants to see more, scroll or load next page.

### 4. View Product Details
- Click selected product.
- Take snapshot of product page.
- Extract: model name, full price, sale price (if any), available sizes, available colors, product description, delivery date.
- If product has multiple colorways, present via `ask_user` (input_type "choice").
- Present available sizes via `ask_user` (input_type "choice") with UK sizing.
- Check if product is in stock for selected size.
- Confirm with user: "Add [Model] (Size UK X, Color) at ₹X,XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Bag".
- Go to cart, take snapshot.
- Check for any active promo codes or member discounts.
- Use `confirm_action` to present order summary:
  - Product: model name, color, size
  - Price: MRP, discount (if any), subtotal
  - Delivery charges and estimated delivery date
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Checkout".
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, model, size, color, price, delivery, total
  - amount_inr: total amount (number)
  - description: "Nike India order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product details (model, size, color), price paid, estimated delivery date.

## Site Notes

- Nike India uses UK sizing for shoes. Always confirm UK size with the user before adding to cart.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- Nike Member pricing gives additional discounts on select items — check if member-exclusive prices apply.
- Free delivery on orders above ₹2,495 typically. Below that, delivery charges of ₹495 apply.
- Nike has a 30-day return policy for unworn items — mention this to the user.
- Popular lines: Air Max, Air Force 1, Dunk, Jordan, Pegasus, Vomero, React, ZoomX.
- Nike drops limited editions frequently — if item is "Sold Out", suggest similar alternatives.
- Size guide is available on product pages — refer to it for accurate sizing.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
- COD may not be available on all orders — verify at checkout.
