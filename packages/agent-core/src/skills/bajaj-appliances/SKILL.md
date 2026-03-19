---
name: bajaj-appliances
description: Buy Bajaj appliances on Bajaj Electricals — fans, heaters, coolers, kitchen appliances, water heaters, lighting.
triggers:
  - bajaj
  - buy bajaj
  - bajaj electricals
  - order from bajaj
  - bajaj fan
  - bajaj heater
  - bajaj mixer grinder
  - buy from bajaj electricals
  - bajaj cooler
  - bajaj water heater
siteUrl: https://www.bajajelectricals.com/
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "ceiling fan 1200mm", "room heater", "mixer grinder 750W", "geyser 15L", "tower fan")
  - name: budget
    required: false
    hint: Max price (e.g. "under 5000", "budget 3k")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, EMI, net banking)
---

# Bajaj Electricals Store

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Clarify Requirements
- Confirm what the user wants to buy. If vague, use `ask_user` to clarify (product category, specs, room/use case, budget).
- For fans: ask type (ceiling, table, pedestal, exhaust, tower), size (mm), BLDC/regular, remote control, decorative.
- For heaters: ask type (room heater, oil-filled radiator, fan heater, infrared), wattage, room size.
- For coolers: ask type (desert, personal, tower, window), tank capacity, room size.
- For kitchen appliances: ask type (mixer grinder, juicer, food processor, hand blender, OTG, induction cooktop), wattage, jars needed.
- For water heaters (geysers): ask capacity (liters), type (instant, storage), gas vs electric.
- Note any specific requirements (color, BEE star rating, BLDC motor, warranty needs).

### 2. Open Bajaj Electricals Store & Verify Login
- Open a NEW tab and navigate to `https://www.bajajelectricals.com/`.
- Take snapshot. Dismiss any cookie consent or promotional popups.
- Verify logged in (account/profile icon in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar or navigate via product categories.
- Take snapshot of product listing page.
- Apply relevant filters: price range, type, size/capacity, features, rating, energy efficiency.
- Extract top 3-5 options with: model name, price (MRP vs offer price), key specs, energy rating, customer reviews.
- Use `ask_user` (input_type "choice") to present options. Format: "Bajaj Model — ₹X,XXX — Key Spec — Feature — ⭐ Rating"
- If user wants to see more, scroll or go to next page.

### 4. View Product Details
- Click selected product.
- Take snapshot of product page.
- Extract: full model name, price, MRP, discount %, features, warranty, delivery date, key specifications.
- If product has variants (color, size), present them via `ask_user` (input_type "choice").
- Mention any active offers: "Save ₹X with bank card", "Combo deal", "Cashback offer".
- For fans: highlight air delivery (CMM), RPM, sweep size, BLDC energy savings, noise level.
- For kitchen appliances: highlight motor wattage, number of jars/attachments, overload protection.
- For water heaters: highlight tank material (glass-lined, stainless steel), ISI certification, safety features.
- Confirm with user: "Add [product] at ₹X,XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Cart" or "Buy Now".
- Go to cart, take snapshot.
- Check for applicable coupons, combo offers, or promo codes — apply if visible.
- Suggest combo deals if available (fan + light combo, mixer + attachments).
- Use `confirm_action` to present order summary:
  - Product name, model number, variant (color/size), quantity
  - Price, any discounts/offers applied
  - Installation: note if self-install or professional install needed
  - Warranty: standard Bajaj warranty
  - Delivery date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, model, specs, price, warranty, delivery, total
  - amount_inr: total amount (number)
  - description: "Bajaj Electricals store order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method on bajajelectricals.com (UPI/card/COD/EMI/net banking as per user preference).
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product, model number, price paid, estimated delivery date, warranty details.

## Site Notes

- Bajaj Electricals delivery: 3-7 business days. Free delivery on orders above a threshold (check site).
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Bajaj is one of India's oldest and most trusted electrical brands — emphasize reliability and widespread service network.
- Bajaj BLDC fans save up to 65% electricity vs regular fans — strongly recommend if user is upgrading.
- Bajaj mixer grinders dominate the budget segment — excellent value for money.
- ISI/BIS certification is important for safety — Bajaj products are ISI certified, mention this.
- Seasonal products: fans sell best March-June, heaters October-January, coolers April-July — availability may vary.
- Bajaj has a strong service network across India — easy to get repairs and spare parts even in small towns.
- Water heaters require professional installation for plumbing — inform user that installation is separate from delivery.
- Extended warranty may not be available on bajajelectricals.com — check and inform user.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
