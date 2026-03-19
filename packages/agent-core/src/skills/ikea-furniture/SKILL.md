---
name: ikea-furniture
description: Shop on IKEA India — browse furniture, home decor, kitchenware, check delivery, assembly options, checkout, pay.
triggers:
  - ikea
  - order from ikea
  - buy on ikea
  - ikea furniture
  - ikea india
  - buy furniture ikea
  - ikea home decor
  - ikea shopping
siteUrl: https://www.ikea.com/in/en/
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "desk for home office", "wardrobe", "bookshelf KALLAX", "dining table 4 seater")
  - name: room
    required: false
    hint: Room type (e.g. "bedroom", "living room", "kitchen", "home office", "kids room")
  - name: style
    required: false
    hint: Style preference (e.g. "minimalist", "Scandinavian", "modern", "compact")
  - name: budget
    required: false
    hint: Max price (e.g. "under 15000", "budget 10k")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, EMI)
---

# IKEA India Furniture Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Clarify Requirements
- Confirm what the user wants: furniture, storage, decor, textiles, kitchenware, lighting.
- Use `ask_user` to clarify: room, dimensions/space available, style, color preference, budget.
- Ask about assembly preference — IKEA products are mostly self-assembly, but assembly service is available.
- If user knows the IKEA product name/series (e.g., KALLAX, MALM, BILLY), search directly.

### 2. Open IKEA & Verify Login
- Open a NEW tab and navigate to `https://www.ikea.com/in/en/`.
- Take snapshot. Verify logged in (profile/IKEA Family icon in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Set delivery location/pincode if prompted — enter user's pincode.

### 3. Search & Browse Products
- Use the search bar to search for the product or browse by room/category.
- Take snapshot of search results page.
- Apply filters: price range, color, material, size, rating, category.
- Check delivery availability to user's pincode (IKEA India has limited delivery zones).
- Extract top 3-5 options with: product name, series, price, dimensions, material, rating, color options.
- Use `ask_user` (input_type "choice") to present options. Format: "PRODUCT NAME (Series) — ₹X,XXX — Dimensions — Material — ⭐ Rating"
- IKEA room inspiration pages can help — suggest browsing if user is unsure.

### 4. View Product Details
- Click selected product.
- Take snapshot of product page.
- Extract: product name, series, price, dimensions (L x W x H), material, weight, color/finish options, package details, assembly info, delivery availability.
- Check if product is available for delivery to user's pincode. If not, suggest alternatives or store pickup.
- If product has color/size variants, present via `ask_user` (input_type "choice").
- Note package count (IKEA products sometimes come in multiple packages).
- Mention if IKEA Family membership offers a discount on this product.
- Confirm with user: "Add [product] at ₹X,XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to bag".
- Go to shopping bag, take snapshot.
- Check for any active offers or IKEA Family discounts.
- Check assembly service availability and cost — present to user if relevant.
- Use `confirm_action` to present order summary:
  - Product: name, series, color, dimensions
  - Price: amount, any IKEA Family discount
  - Assembly service: cost if added, or note self-assembly
  - Delivery date, delivery charges (IKEA delivery can be significant)
  - Total amount (product + delivery + assembly if applicable)
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Proceed to Checkout".
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Select delivery method (home delivery, Click & Collect from store).
- Add assembly service if user wants it.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, dimensions, price, delivery, assembly, total
  - amount_inr: total amount (number)
  - description: "IKEA India order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product details, price paid, delivery date, assembly date (if booked), store pickup details (if chosen).

## Site Notes

- IKEA delivery: 3-14 days depending on product size and location. Large furniture takes longer.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- IKEA India currently delivers to limited cities (Hyderabad, Mumbai, Pune, Bangalore, Delhi NCR, etc.) — check pincode first.
- Delivery charges are significant for large items (₹149-4999 depending on order size/value).
- Click & Collect available from IKEA stores — free, but user must pick up.
- Assembly service available for most furniture (₹199-2999 depending on complexity) — always offer.
- IKEA Family membership gives discounts, free tea/coffee at store, and special offers.
- IKEA products are flat-packed — inform user about self-assembly if they decline assembly service.
- Product names are Swedish — use the product name and series together (e.g., "KALLAX Shelf unit").
- IKEA room planners available online for kitchen, wardrobe, PAX system — mention if relevant.
- Stock availability can vary — check availability before confirming.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
