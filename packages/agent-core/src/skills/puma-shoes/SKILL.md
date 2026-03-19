---
name: puma-shoes
description: Shop on Puma India — browse, select size, buy shoes, apparel, and accessories, checkout, pay.
triggers:
  - puma
  - buy puma shoes
  - order from puma
  - puma running shoes
  - puma sneakers
  - buy shoes on puma
  - puma india
  - puma slippers
siteUrl: https://in.puma.com
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "RS-X", "running shoes", "Suede Classic", "slippers", "track jacket")
  - name: size
    required: false
    hint: Shoe size (UK 7, UK 8, UK 9) or clothing size (S, M, L, XL)
  - name: gender
    required: false
    hint: Men, Women, or Kids
  - name: budget
    required: false
    hint: Max price (e.g. "under 6000", "budget 4k")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# Puma Shoes & Apparel Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What item to search for
2. **size** (type: "chip_bar", collapsed): Size — XS, S, M, L, XL, XXL
3. **budget** (type: "slider", collapsed): Budget range, min 200, max 10000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Clarify Requirements
- Confirm what the user wants: shoes, apparel, slippers, or accessories.
- Use `ask_user` to clarify: product type (running, motorsport, lifestyle, training), gender, size, color preference, budget range.
- Note any specific model requests (RS-X, Suede Classic, Rider, Softride, NITRO, Palermo).
- Ask about intended use: daily wear, running, gym, casual, motorsport fan gear.

### 2. Open Puma India & Verify Login
- Open a NEW tab and navigate to `https://in.puma.com`.
- Take snapshot. Verify logged in (profile icon or account name visible in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product.
- Take snapshot of search results page.
- Apply filters if relevant: gender, price range, color, category (Running, Motorsport, Sportstyle, Training), size, sort by popularity or price.
- Extract top 3-5 options with: model name, price, color, category, discount (if any).
- Use `ask_user` (input_type "choice") to present options. Format: "Model Name — ₹X,XXX (was ₹X,XXX) — Color — Category"
- If user wants to see more, scroll or refine filters.

### 4. View Product Details
- Click selected product.
- Take snapshot of product page.
- Extract: model name, MRP, sale price, available sizes, available colors, product description, technology (NITRO, Softride, ProFoam), delivery date.
- If product has multiple colorways, present via `ask_user` (input_type "choice").
- Present available sizes via `ask_user` (input_type "choice") with UK sizing.
- Check stock availability for selected size.
- Confirm with user: "Add [Model] (Size UK X, Color) at ₹X,XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Cart".
- Go to cart, take snapshot.
- Check for any active promo codes or offers (Puma frequently runs site-wide sales).
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
  - description: "Puma India order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product details (model, size, color), price paid, estimated delivery date.

## Site Notes

- Puma India uses UK sizing for shoes. Always confirm UK size with the user before adding to cart.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- Puma runs frequent sales — often 40-60% off on older models. Check for active promotions.
- Free delivery on orders above ₹2,490 typically. Below that, delivery charges may apply.
- Puma has a 30-day return policy for unworn items with tags — mention this to the user.
- Popular lines: RS-X, Suede Classic, Rider, Softride, NITRO running, Palermo, Motorsport (Ferrari, BMW, Mercedes).
- Puma Motorsport is a unique differentiator — Ferrari, BMW, and Mercedes-AMG licensed products.
- NITRO technology is Puma's premium running foam — highlight on performance shoes.
- Puma slippers and flip-flops are very popular in India — often under ₹1,000.
- Size guide is available on product pages — refer to it for accurate sizing.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
