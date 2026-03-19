---
name: whirlpool-store
description: Buy Whirlpool appliances on Whirlpool India — refrigerators, washing machines, ACs, microwaves, water purifiers.
triggers:
  - whirlpool
  - buy whirlpool
  - whirlpool store
  - order from whirlpool
  - whirlpool refrigerator
  - whirlpool washing machine
  - whirlpool ac
  - buy from whirlpool india
  - whirlpool microwave
siteUrl: https://www.whirlpoolindia.com/
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "340L double door refrigerator", "7.5kg top load washing machine", "1.5 ton inverter AC")
  - name: budget
    required: false
    hint: Max price (e.g. "under 35000", "budget 25k")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, EMI, net banking)
---

# Whirlpool India Store

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Clarify Requirements
- Confirm what the user wants to buy. If vague, use `ask_user` to clarify (product category, capacity, type, budget).
- For refrigerators: ask capacity (liters), type (single door, double door, triple door, side-by-side), frost-free vs direct cool.
- For washing machines: ask capacity (kg), type (front load, top load), automatic vs semi-automatic.
- For ACs: ask tonnage (1/1.2/1.5/2 ton), type (split/window), inverter preference, energy rating.
- For microwaves: ask type (solo, grill, convection), capacity (liters).
- Note any specific requirements (color, energy rating, 6th Sense technology, IntelliSense).

### 2. Open Whirlpool Store & Verify Login
- Open a NEW tab and navigate to `https://www.whirlpoolindia.com/`.
- Take snapshot. Dismiss any cookie consent or promotional popups.
- Verify logged in (account icon shows profile/name in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar or navigate via product categories to find the appliance.
- Take snapshot of product listing page.
- Apply relevant filters: price range, capacity, type, energy rating, color, technology features.
- Extract top 3-5 options with: model name, price (MRP vs offer price), key specs, energy rating, technology highlights.
- Use `ask_user` (input_type "choice") to present options. Format: "Whirlpool Model — ₹XX,XXX — Capacity — BEE ⭐ Rating — Key Feature"
- If user wants to see more, scroll or go to next page.

### 4. View Product Details
- Click selected product.
- Take snapshot of product page.
- Extract: full model name, price, MRP, discount %, bank offers, EMI options, warranty, delivery date, installation info.
- If product has color variants, present them via `ask_user` (input_type "choice").
- Mention any active offers: "Save ₹X with bank card", "No-cost EMI available", "Free installation".
- Highlight Whirlpool-specific technologies: 6th Sense, IntelliSense, IntelliFresh, StainWash, 3D Cool.
- Note energy rating (BEE stars) and annual energy consumption.
- Confirm with user: "Add [product] at ₹X,XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Cart" or "Buy Now".
- Go to cart, take snapshot.
- Check for applicable coupons or promo codes — apply if visible.
- Use `confirm_action` to present order summary:
  - Product name, model number, variant (color), quantity
  - Price, any discounts/offers applied, bank offers
  - Installation: included or extra cost
  - Warranty: standard (manufacturer) + extended options
  - Delivery date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Confirm pincode serviceability — Whirlpool checks delivery availability by pincode.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, model, specs, price, installation, warranty, delivery, total
  - amount_inr: total amount (number)
  - description: "Whirlpool India store order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method on whirlpoolindia.com (UPI/card/COD/EMI/net banking as per user preference).
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product, model number, price paid, estimated delivery date, installation details, warranty info.

## Site Notes

- Whirlpool India delivery: 3-7 business days. Free delivery available on most appliances.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Whirlpool 6th Sense technology is their premium feature — auto-adjusts settings based on load. Always mention when available.
- Bank offers and no-cost EMI are frequently available — check offer banners on product pages.
- Free standard installation for ACs, washing machines, and water purifiers — always mention.
- Extended warranty available on most appliances — present options during checkout.
- Energy rating (BEE stars) is critical — highlight annual electricity cost savings for 5-star models.
- Whirlpool semi-automatic washing machines are very popular in budget range — suggest if user is price-sensitive.
- Pincode check is mandatory before purchase — Whirlpool may not deliver to all locations.
- Old appliance exchange/buyback may be offered — ask user if they have an old unit to trade in.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
