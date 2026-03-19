---
name: reebok-shoes
description: Shop on Reebok India — browse, select size, buy shoes, apparel, and accessories, checkout, pay.
triggers:
  - reebok
  - buy reebok shoes
  - order from reebok
  - reebok running shoes
  - reebok sneakers
  - buy shoes on reebok
  - reebok india
  - reebok classic
siteUrl: https://www.reebok.co.in
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "Classic Leather", "running shoes", "Nano X", "training shoes", "t-shirt")
  - name: size
    required: false
    hint: Shoe size (UK 7, UK 8, UK 9) or clothing size (S, M, L, XL)
  - name: gender
    required: false
    hint: Men, Women, or Kids
  - name: budget
    required: false
    hint: Max price (e.g. "under 8000", "budget 5k")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# Reebok Shoes & Apparel Shopping

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
- Use `ask_user` to clarify: product type (running, training, classics, walking), gender, size, color preference, budget range.
- Note any specific model requests (Classic Leather, Club C, Nano X, Floatride, Zig Kinetica).
- Ask about intended use: CrossFit, running, gym, walking, casual/lifestyle.

### 2. Open Reebok India & Verify Login
- Open a NEW tab and navigate to `https://www.reebok.co.in`.
- Take snapshot. Verify logged in (profile icon or account name visible in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product.
- Take snapshot of search results page.
- Apply filters if relevant: gender, price range, color, category (Running, Training, Classics, Walking), size, sort by popularity or price.
- Extract top 3-5 options with: model name, price, color, category, discount (if any).
- Use `ask_user` (input_type "choice") to present options. Format: "Model Name — ₹X,XXX (was ₹X,XXX) — Color — Category"
- If user wants to see more, scroll or refine filters.

### 4. View Product Details
- Click selected product.
- Take snapshot of product page.
- Extract: model name, MRP, sale price, available sizes, available colors, product description, technology (Floatride Energy, Nano flex), delivery date.
- If product has multiple colorways, present via `ask_user` (input_type "choice").
- Present available sizes via `ask_user` (input_type "choice") with UK sizing.
- Check stock availability for selected size.
- Confirm with user: "Add [Model] (Size UK X, Color) at ₹X,XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Cart".
- Go to cart, take snapshot.
- Check for any active promo codes or clearance discounts.
- Use `confirm_action` to present order summary:
  - Product: model name, color, size, category
  - Price: MRP, discount, subtotal
  - Delivery charges and estimated delivery date
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Checkout".
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, model, size, color, price, delivery, total
  - amount_inr: total amount (number)
  - description: "Reebok India order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product details (model, size, color), price paid, estimated delivery date.

## Site Notes

- Reebok India uses UK sizing for shoes. Always confirm UK size with the user before adding to cart.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- Reebok frequently runs outlet sales — up to 50-60% off on past-season styles. Check for active promotions.
- Free delivery on orders above ₹2,499 typically. Below that, delivery charges apply.
- Reebok has a return/exchange policy — mention this to the user.
- Popular lines: Classic Leather, Club C 85, Nano X (CrossFit), Floatride Energy (running), Zig Kinetica.
- Reebok is strong in training/CrossFit — Nano series is the go-to for functional fitness.
- Reebok Classics are lifestyle staples — Club C and Classic Leather are heritage models.
- Reebok India often has bundle deals (buy 2 get extra discount) — check cart page for offers.
- Size guide is available on product pages — refer to it for accurate sizing.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
