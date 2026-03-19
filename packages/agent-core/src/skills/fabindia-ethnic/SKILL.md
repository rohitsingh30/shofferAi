---
name: fabindia-ethnic
description: Shop on FabIndia — buy ethnic wear, kurtas, sarees, home decor, organic food, browse collections, checkout, pay.
triggers:
  - fabindia
  - buy from fabindia
  - order from fabindia
  - fabindia shopping
  - buy kurta fabindia
  - ethnic wear fabindia
  - fabindia home decor
  - fabindia saree
siteUrl: https://www.fabindia.com
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "men's cotton kurta", "block print saree", "ceramic mugs", "organic honey")
  - name: size
    required: false
    hint: Size preference (XS, S, M, L, XL, XXL)
  - name: budget
    required: false
    hint: Max price (e.g. "under 3000", "budget 2000")
  - name: gender
    required: false
    hint: Gender (men, women, unisex, kids)
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# FabIndia Ethnic & Home Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Clarify Requirements
- Confirm what the user wants: clothing (ethnic/western/fusion), home decor, furniture, organic food, personal care.
- Use `ask_user` to clarify: gender, occasion (festive, casual, office), fabric preference (cotton, silk, linen), color, size, budget.
- Note any specific requirements (hand block print, hand woven, organic, specific craft tradition).

### 2. Open FabIndia & Verify Login
- Open a NEW tab and navigate to `https://www.fabindia.com`.
- Take snapshot. Verify logged in (user name or account icon visible in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar or navigate to appropriate category (Women/Men/Home/Food).
- Take snapshot of search results or collection page.
- Apply filters if relevant: price range, category, fabric, color, size, occasion, craft type.
- Extract top 3-5 options with: name, price, fabric, color, craft technique, key details.
- Use `ask_user` (input_type "choice") to present options. Format: "Product Name — ₹X,XXX — Fabric — Color — Craft Technique"
- If user wants to see more, scroll or browse different collection.

### 4. View Product Details
- Click selected product.
- Take snapshot of product page.
- Extract: name, price, MRP, fabric composition, craft origin (e.g. Bagru block print, Chanderi weave), available sizes, colors, care instructions, product story.
- If product has size variants, present available sizes via `ask_user` (input_type "choice").
- If product has color variants, present them via `ask_user` (input_type "choice").
- Check size chart — FabIndia sizing can differ from standard. Suggest checking measurements.
- Confirm with user: "Add [product] (Size [X]) at ₹X,XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Cart" or "Add to Bag".
- Go to cart, take snapshot.
- Check for active offers, festive sale discounts, or loyalty points.
- Use `confirm_action` to present order summary:
  - Product: name, fabric, size, color, craft
  - Price, MRP, discount (if any)
  - Delivery date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Proceed to Checkout".
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Check if gift wrapping is available — offer via `ask_user` if user may want it.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, fabric, size, color, price, delivery, total
  - amount_inr: total amount (number)
  - description: "FabIndia order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product details (name, size, color, fabric), price paid, estimated delivery date, care instructions.

## Site Notes

- FabIndia delivery: 5-10 days depending on location. Handcrafted items may take longer.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- FabIndia is known for handcrafted, artisanal products — each piece supports Indian craft traditions.
- Fabrics are primarily natural: cotton, silk, linen, wool. Mention fabric care (handwash, dry clean).
- FabIndia sizing tends to run loose/relaxed — recommend checking size chart on product page.
- Free delivery on orders above ₹999 typically. Below that, delivery charges apply.
- Return/exchange within 15 days on most items (unworn, tags intact). Food items are non-returnable.
- FabIndia has organic food, personal care, and home fragrance — not just clothing.
- Festive collections (Diwali, Holi, Eid) are popular — check seasonal collections.
- Store pickup may be available — FabIndia has 300+ stores across India.
- Gift wrapping available on most items — suitable for gifting occasions.
- FabIndia Experience Centers offer a wider range — mention if user is near one.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
