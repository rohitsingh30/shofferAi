---
name: campus-shoes
description: Shop on Campus Shoes — browse, select size, buy running, training, and sports shoes, checkout, pay.
triggers:
  - campus shoes
  - buy campus shoes
  - order from campus
  - campus running shoes
  - campus sports shoes
  - buy shoes on campus
  - campus training shoes
  - campus sneakers
siteUrl: https://www.campusshoes.com
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "running shoes", "training shoes", "walking shoes", "sneakers", "slippers")
  - name: size
    required: false
    hint: Shoe size (UK 6, UK 7, UK 8, UK 9, UK 10)
  - name: gender
    required: false
    hint: Men, Women, or Kids
  - name: budget
    required: false
    hint: Max price (e.g. "under 2000", "budget 1.5k")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# Campus Sports Shoes Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Clarify Requirements
- Confirm what the user wants: running shoes, training shoes, walking shoes, casual sneakers, or slippers.
- Use `ask_user` to clarify: product type (running, training, walking, casual, gym), gender, size, color preference, budget range.
- Note any specific technology preferences: mesh upper, memory foam, lightweight, knitted.
- Ask about intended use: running, gym training, walking, daily wear, jogging.

### 2. Open Campus Shoes & Verify Login
- Open a NEW tab and navigate to `https://www.campusshoes.com`.
- Take snapshot. Verify logged in (profile icon or account name visible in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product.
- Take snapshot of search results page.
- Apply filters if relevant: gender, price range, color, category (Running, Training, Walking, Casual, Slippers), size, sort by popularity or price.
- Extract top 3-5 options with: product name, price, color, category, discount (if any).
- Use `ask_user` (input_type "choice") to present options. Format: "Product Name — ₹X,XXX (was ₹X,XXX) — Color — Category"
- If user wants to see more, scroll or refine filters.

### 4. View Product Details
- Click selected product.
- Take snapshot of product page.
- Extract: product name, style code, MRP, sale price, available sizes, available colors, material (mesh, knit, synthetic), sole type, weight, delivery date.
- If product has multiple colors, present via `ask_user` (input_type "choice").
- Present available sizes via `ask_user` (input_type "choice") with UK sizing.
- Check stock availability for selected size.
- Confirm with user: "Add [Product] (Size UK X, Color) at ₹X,XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Cart".
- Go to cart, take snapshot.
- Check for any active promo codes or combo offers (Campus often runs buy-more-save-more deals).
- Use `confirm_action` to present order summary:
  - Product: name, color, size, material
  - Price: MRP, discount, subtotal
  - Delivery charges and estimated delivery date
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Checkout" or "Proceed to Buy".
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, size, color, price, delivery, total
  - amount_inr: total amount (number)
  - description: "Campus Shoes order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product details (name, size, color), price paid, estimated delivery date.

## Site Notes

- Campus uses UK sizing for shoes. Always confirm UK size with the user before adding to cart.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- Campus is India's leading sports shoe brand — excellent value for money, most shoes under ₹3,000.
- Free delivery on most orders. COD (Cash on Delivery) widely available.
- Campus has a 7-day easy return/exchange policy — mention this to the user.
- Popular categories: Running (CAMP-FURY, CAMP-TORQUE), Training, Walking, Casual/Lifestyle.
- Campus shoes feature lightweight mesh uppers and memory foam insoles — highlight comfort features.
- Campus is extremely popular for affordable running and gym shoes — best in the ₹1,000-₹3,000 range.
- Campus frequently runs discount sales — check for active promo codes on the homepage banner.
- Size chart is available on product pages — Campus tends to run true to size.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
- Campus ships pan-India with delivery in 5-10 business days typically.
