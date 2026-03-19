---
name: bata-shoes
description: Shop on Bata India — buy shoes, sandals, floaters, sneakers, formal shoes, browse collections, checkout, pay.
triggers:
  - bata
  - buy bata shoes
  - order from bata
  - bata shopping
  - bata sandals
  - buy shoes bata
  - bata footwear
  - bata online
siteUrl: https://www.bata.in
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "men's formal shoes", "women's sandals", "kids' school shoes", "sneakers", "floaters")
  - name: size
    required: false
    hint: Shoe size (e.g. "UK 8", "UK 6", "EU 42", or just the number)
  - name: budget
    required: false
    hint: Max price (e.g. "under 2000", "budget 1000")
  - name: gender
    required: false
    hint: Gender (men, women, kids)
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# Bata Shoes Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Clarify Requirements
- Confirm what the user wants: type of footwear (formal, casual, sports, sandals, floaters, school shoes), gender, occasion.
- Use `ask_user` to clarify: shoe size (UK/EU), width preference, color, material (leather, synthetic, canvas), budget.
- Note any specific requirements (waterproof, orthopedic, non-slip, specific brand within Bata).

### 2. Open Bata & Verify Login
- Open a NEW tab and navigate to `https://www.bata.in`.
- Take snapshot. Verify logged in (user name or account icon visible in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar or navigate to appropriate category (Men, Women, Kids, Brands).
- Take snapshot of search results or category page.
- Apply filters if relevant: price range, size, color, brand (Bata, Hush Puppies, Power, North Star, Weinbrenner), type, material.
- Extract top 3-5 options with: brand, name, price, MRP, discount %, color, material, key features.
- Use `ask_user` (input_type "choice") to present options. Format: "Brand Name — ₹X,XXX (XX% off) — Color — Material — Type"
- If user wants to see more, scroll or refine filters.

### 4. View Product & Select Size
- Click selected product.
- Take snapshot of product page.
- Extract: brand, full name, price, MRP, discount, available sizes, colors, material, sole type, closure type, occasion, care instructions.
- If size not provided by user, present available sizes via `ask_user` (input_type "choice").
- Check if selected size is available. If not, suggest closest available size.
- If product has color variants, present them via `ask_user` (input_type "choice").
- Refer to size chart — Bata uses UK sizing. Mention if conversion from EU/US is needed.
- Confirm with user: "Add [brand] [name] (Size UK [X], [Color]) at ₹X,XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Cart".
- Go to cart, take snapshot.
- Check for applicable offers, combo deals (e.g. "Buy 2 at X% off"), or seasonal sale discounts.
- Apply coupon if available.
- Use `confirm_action` to present order summary:
  - Product: brand, name, size, color, material
  - Price, MRP, discount, coupon savings
  - Delivery date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Proceed to Checkout" or "Place Order".
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, brand, size, color, price, delivery, total
  - amount_inr: total amount (number)
  - description: "Bata footwear order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product (brand, name, size, color), price paid, estimated delivery date, return policy.

## Site Notes

- Bata delivery: 3-7 days depending on location. Metro cities get faster delivery.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- Bata is India's most recognized footwear brand — operates multiple brands under one roof.
- Bata brands: Bata (everyday), Hush Puppies (premium casual), Power (sports), North Star (casual), Weinbrenner (outdoor), Comfit (comfort).
- Bata uses UK sizing — always confirm size with user. Size chart is on product page.
- Free delivery above ₹499 typically. Below that, shipping charges apply.
- Return/exchange within 30 days on Bata.in — must be unworn with original packaging and tags.
- COD (Cash on Delivery) available on most orders — popular option for footwear.
- Bata stores available for exchange — mention that in-store exchange is possible if size does not fit.
- Bata Comfit range is good for people needing arch support or comfort features — suggest if relevant.
- School shoes category is very popular — Bata is the go-to for kids' school footwear.
- Bata frequently runs seasonal sales and clearance events — check for active offers.
- Power brand is for sports/athleisure — suggest if user wants running or gym shoes.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
