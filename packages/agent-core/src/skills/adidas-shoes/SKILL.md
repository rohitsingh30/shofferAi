---
name: adidas-shoes
description: Shop on Adidas India — browse, select size, buy shoes, apparel, and accessories, checkout, pay.
triggers:
  - adidas
  - buy adidas shoes
  - order from adidas
  - adidas running shoes
  - adidas sneakers
  - buy shoes on adidas
  - adidas ultraboost
  - adidas india
siteUrl: https://www.adidas.co.in
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "Ultraboost", "Stan Smith", "running shoes", "Adizero", "track pants")
  - name: size
    required: false
    hint: Shoe size (UK 7, UK 8, UK 9) or clothing size (S, M, L, XL)
  - name: gender
    required: false
    hint: Men, Women, or Kids
  - name: budget
    required: false
    hint: Max price (e.g. "under 12000", "budget 8k")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# Adidas Shoes & Apparel Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Clarify Requirements
- Confirm what the user wants: shoes, apparel, or accessories.
- Use `ask_user` to clarify: product type (running, lifestyle, football, training, originals), gender, size, color preference, budget range.
- Note any specific model requests (Ultraboost, Stan Smith, Superstar, Gazelle, Samba, NMD, Adizero).
- Ask about intended use: daily wear, running, gym, football, casual streetwear.

### 2. Open Adidas India & Verify Login
- Open a NEW tab and navigate to `https://www.adidas.co.in`.
- Take snapshot. Verify logged in (profile icon or account name visible in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product.
- Take snapshot of search results page.
- Apply filters if relevant: gender, price range, color, category (Originals, Sportswear, Running, Football), size, sort by popularity or price.
- Extract top 3-5 options with: model name, price, color, category, available sizes.
- Use `ask_user` (input_type "choice") to present options. Format: "Model Name — ₹X,XXX — Color — Category"
- If user wants to see more, scroll or refine filters.

### 4. View Product Details
- Click selected product.
- Take snapshot of product page.
- Extract: model name, full price, sale price (if any), available sizes, available colors, product description, technology (Boost, Lightstrike, etc.), delivery date.
- If product has multiple colorways, present via `ask_user` (input_type "choice").
- Present available sizes via `ask_user` (input_type "choice") with UK sizing.
- Check stock availability for selected size.
- Confirm with user: "Add [Model] (Size UK X, Color) at ₹X,XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Bag".
- Go to cart, take snapshot.
- Check for any active promo codes or adiClub member discounts.
- Use `confirm_action` to present order summary:
  - Product: model name, color, size, category
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
  - description: "Adidas India order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product details (model, size, color), price paid, estimated delivery date.

## Site Notes

- Adidas India uses UK sizing for shoes. Always confirm UK size with the user before adding to cart.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- adiClub members get early access to drops and exclusive discounts — check if member pricing applies.
- Free delivery on most orders. Express delivery available at extra cost in select cities.
- Adidas has a 30-day return policy for unused items with original tags — mention this benefit.
- Popular lines: Ultraboost, Stan Smith, Superstar, Gazelle, Samba, NMD, Adizero, Forum.
- Adidas Originals = lifestyle/streetwear, Adidas Performance = sport-specific. Clarify with user.
- Boost technology is Adidas's premium cushioning — highlight on running shoes.
- Size guide is available on product pages — refer to it for accurate sizing.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
- End-of-season sales (EOSS) offer up to 50% off — check if any sale is active.
