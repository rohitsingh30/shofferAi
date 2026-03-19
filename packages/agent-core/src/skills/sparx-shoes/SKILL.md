---
name: sparx-shoes
description: Shop Sparx shoes on Relaxo Footwear — browse, select size, buy sports shoes, sandals, slippers, checkout, pay.
triggers:
  - sparx
  - buy sparx shoes
  - order from sparx
  - sparx running shoes
  - sparx sports shoes
  - buy sparx sandals
  - sparx slippers
  - relaxo sparx
siteUrl: https://www.relaxofootwear.com/sparx
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "running shoes", "sports shoes", "sandals", "slippers", "flip-flops")
  - name: size
    required: false
    hint: Shoe size (UK 6, UK 7, UK 8, UK 9, UK 10)
  - name: gender
    required: false
    hint: Men, Women, Kids, or Boys/Girls
  - name: budget
    required: false
    hint: Max price (e.g. "under 1500", "budget 1k")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# Sparx Sports Shoes & Footwear Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What item to search for
2. **size** (type: "chip_bar", collapsed): Size — XS, S, M, L, XL, XXL
3. **budget** (type: "slider", collapsed): Budget range, min 200, max 10000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Clarify Requirements
- Confirm what the user wants: sports shoes, sandals, slippers, flip-flops, or school shoes.
- Use `ask_user` to clarify: product type (running, walking, casual, sandals, slippers, flip-flops), gender, size, color preference, budget range.
- Note that Sparx is a Relaxo brand — extremely affordable footwear.
- Ask about intended use: daily wear, jogging, walking, home, casual outings.

### 2. Open Relaxo/Sparx & Verify Login
- Open a NEW tab and navigate to `https://www.relaxofootwear.com/sparx`.
- If Sparx section is not directly accessible, navigate to `https://www.relaxofootwear.com` and find the Sparx brand section.
- Take snapshot. Verify logged in (profile icon or account name visible in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar or browse Sparx category to find products.
- Take snapshot of search results page.
- Apply filters if relevant: gender, price range, color, category (Sports Shoes, Sandals, Slippers, Flip-Flops), size.
- Extract top 3-5 options with: product name, style number, price, color, category.
- Use `ask_user` (input_type "choice") to present options. Format: "Sparx Style# — ₹X,XXX — Color — Category"
- If user wants to see more, scroll or refine filters.

### 4. View Product Details
- Click selected product.
- Take snapshot of product page.
- Extract: product name, style number, MRP, sale price, available sizes, available colors, material (EVA, PU, mesh), sole type, delivery date.
- If product has multiple colors, present via `ask_user` (input_type "choice").
- Present available sizes via `ask_user` (input_type "choice") with UK sizing.
- Check stock availability for selected size.
- Confirm with user: "Add Sparx [Style#] (Size UK X, Color) at ₹X,XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Cart".
- Go to cart, take snapshot.
- Check for any active promo codes or combo offers.
- Use `confirm_action` to present order summary:
  - Product: Sparx, style number, color, size, material
  - Price: MRP, discount, subtotal
  - Delivery charges and estimated delivery date
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Checkout" or "Proceed to Buy".
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, style, size, color, price, delivery, total
  - amount_inr: total amount (number)
  - description: "Sparx (Relaxo) footwear order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product details (style, size, color), price paid, estimated delivery date.

## Site Notes

- Sparx uses UK sizing for shoes. Always confirm UK size with the user before adding to cart.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- Sparx is Relaxo's sports/youth brand — extremely affordable, most products under ₹2,000.
- Relaxo Footwear also owns Flite and Bahamas brands — if user asks, can browse those too.
- Delivery typically 7-12 business days. COD available in most areas.
- Sparx is one of India's most popular budget sports shoe brands — strong in ₹500-₹2,000 segment.
- Sparx slippers and flip-flops are bestsellers — extremely lightweight EVA construction.
- Sparx sports shoes feature mesh uppers and phylon/EVA soles — decent quality for the price point.
- The Relaxo website may have limited online inventory compared to marketplace listings (Amazon, Flipkart).
- If product is unavailable on the official site, suggest checking Amazon or Flipkart for the same Sparx model.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
- Sparx has a pan-India retail presence — mention if user prefers offline purchase.
