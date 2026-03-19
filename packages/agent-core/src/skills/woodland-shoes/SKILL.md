---
name: woodland-shoes
description: Shop on Woodland India — browse, select size, buy outdoor shoes, boots, sandals, and apparel, checkout, pay.
triggers:
  - woodland
  - buy woodland shoes
  - order from woodland
  - woodland boots
  - woodland sandals
  - buy shoes on woodland
  - woodland outdoor shoes
  - woodland india
siteUrl: https://www.woodland.co.in
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "trekking boots", "outdoor shoes", "leather sandals", "casual shoes", "jacket")
  - name: size
    required: false
    hint: Shoe size (UK 7, UK 8, UK 9, Euro 41) or clothing size (S, M, L, XL)
  - name: gender
    required: false
    hint: Men, Women, or Kids
  - name: budget
    required: false
    hint: Max price (e.g. "under 5000", "budget 4k")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# Woodland Outdoor Shoes & Boots Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What item to search for
2. **size** (type: "chip_bar", collapsed): Size — XS, S, M, L, XL, XXL
3. **budget** (type: "slider", collapsed): Budget range, min 200, max 10000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Clarify Requirements
- Confirm what the user wants: outdoor shoes, boots, sandals, casual shoes, or apparel.
- Use `ask_user` to clarify: product type (trekking boots, casual shoes, leather sandals, sneakers), gender, size, color preference, budget range.
- Note any specific requirements: waterproof, leather, ankle-height boots, slip-on.
- Ask about intended use: trekking, daily wear, office casual, monsoon, outdoor adventure.

### 2. Open Woodland India & Verify Login
- Open a NEW tab and navigate to `https://www.woodland.co.in`.
- Take snapshot. Verify logged in (profile icon or account name visible in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product.
- Take snapshot of search results page.
- Apply filters if relevant: gender, price range, color (olive green, brown, black, tan), category (Shoes, Boots, Sandals, Sneakers), size.
- Extract top 3-5 options with: product name, price, color, material, type.
- Use `ask_user` (input_type "choice") to present options. Format: "Product Name — ₹X,XXX — Color — Material — Type"
- If user wants to see more, scroll or refine filters.

### 4. View Product Details
- Click selected product.
- Take snapshot of product page.
- Extract: product name, MRP, sale price, available sizes, available colors, material (leather, nubuck, suede), sole type, delivery date.
- If product has multiple colors, present via `ask_user` (input_type "choice").
- Present available sizes via `ask_user` (input_type "choice") with UK/Euro sizing.
- Check stock availability for selected size.
- Confirm with user: "Add [Product] (Size UK X, Color) at ₹X,XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Cart".
- Go to cart, take snapshot.
- Check for any active promo codes or seasonal discounts.
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
  - summary: JSON with product, size, color, material, price, delivery, total
  - amount_inr: total amount (number)
  - description: "Woodland India order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product details (name, size, color, material), price paid, estimated delivery date.

## Site Notes

- Woodland uses UK/Euro sizing. Always confirm size with the user. Woodland shoes tend to be slightly wider fit.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- Woodland is known for rugged outdoor footwear — genuine leather, waterproof options, durable soles.
- Free delivery on most orders. Delivery usually takes 5-10 business days depending on location.
- Woodland has a warranty on manufacturing defects — mention this to the user.
- Popular categories: G-Series (outdoor/trekking), Pro Planet (eco-friendly), casual leather shoes, sandals.
- Olive green and khaki are Woodland's signature colors — these are the most popular colorways.
- Woodland leather products improve with age — advise on leather care for long life.
- Woodland boots are excellent for monsoon season — waterproof and durable construction.
- COD (Cash on Delivery) is available on most orders — verify at checkout.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
