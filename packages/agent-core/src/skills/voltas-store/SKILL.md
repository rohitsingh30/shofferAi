---
name: voltas-store
description: Buy Voltas ACs, coolers, air purifiers, and commercial cooling on Voltas India — Tata brand.
triggers:
  - voltas
  - buy voltas
  - voltas store
  - order from voltas
  - voltas ac
  - voltas cooler
  - voltas air conditioner
  - buy from voltas india
  - voltas split ac
siteUrl: https://www.voltas.com/
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "1.5 ton inverter split AC", "desert cooler 70L", "tower AC 2 ton", "air purifier")
  - name: budget
    required: false
    hint: Max price (e.g. "under 40000", "budget 35k")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, EMI, net banking)
---

# Voltas India Store

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Clarify Requirements
- Confirm what the user wants to buy. If vague, use `ask_user` to clarify (product type, capacity, room size, budget).
- For ACs: ask tonnage (0.8/1/1.2/1.5/2 ton), type (split/window/cassette), inverter vs fixed speed, energy rating, room size.
- For coolers: ask type (desert/personal/tower/window), tank capacity, room size.
- For air purifiers: ask room size, HEPA filter preference, specific concerns (dust, allergens, pollution).
- Note any specific requirements (color, WiFi control, adjustable inverter, copper condenser).
- Voltas vs Voltas Beko — clarify if user wants AC/cooler (Voltas) or home appliances (Voltas Beko is separate).

### 2. Open Voltas Store & Verify Login
- Open a NEW tab and navigate to `https://www.voltas.com/`.
- Take snapshot. Dismiss any cookie consent or promotional popups.
- Verify logged in (account/profile icon in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar or navigate via product categories (ACs, Coolers, Air Purifiers).
- Take snapshot of product listing page.
- Apply relevant filters: price range, tonnage/capacity, type, energy rating, inverter/fixed.
- Extract top 3-5 options with: model name, price (MRP vs offer price), tonnage/capacity, energy rating, key features.
- Use `ask_user` (input_type "choice") to present options. Format: "Voltas Model — ₹XX,XXX — Tonnage/Capacity — BEE ⭐ — Key Feature"
- If user wants to see more, scroll or go to next page.

### 4. View Product Details
- Click selected product.
- Take snapshot of product page.
- Extract: full model name, price, MRP, discount %, bank offers, EMI options, warranty, delivery date, installation details.
- If product has variants, present them via `ask_user` (input_type "choice").
- Mention any active offers: "Save ₹X with bank card", "No-cost EMI from ₹X/month", "Free installation".
- Highlight Voltas-specific features: Adjustable Inverter Compressor, 4-in-1 Convertible, Copper Condenser, Steady Cool.
- For coolers: mention Honeycomb cooling pads, ice chamber, auto-drain, motorized louvres.
- Note energy rating (BEE stars) and ISEER value for ACs.
- Confirm with user: "Add [product] at ₹X,XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Cart" or "Buy Now".
- Go to cart, take snapshot.
- Check for applicable coupons or promotional offers — apply if visible.
- Use `confirm_action` to present order summary:
  - Product name, model number, variant, quantity
  - Price, any discounts/offers applied, bank offers
  - Installation: included (free for ACs) or extra cost
  - Warranty: standard + compressor warranty + extended options
  - Delivery date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Confirm pincode serviceability — Voltas checks delivery and installation availability by pincode.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, model, specs, price, installation, warranty, delivery, total
  - amount_inr: total amount (number)
  - description: "Voltas India store order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method on voltas.com (UPI/card/COD/EMI/net banking as per user preference).
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product, model number, price paid, estimated delivery date, installation schedule, warranty details.

## Site Notes

- Voltas delivery: 3-7 business days for most products. Free delivery on ACs and large coolers.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Voltas is a Tata Group company — trusted brand, emphasize reliability when presenting options.
- Voltas is India's #1 AC brand by market share — mention this if user is comparing brands.
- Free standard installation for split ACs (includes basic piping up to 3 meters) — always mention.
- Copper condenser models are more durable and efficient — recommend over aluminium variants.
- Inverter ACs save 30-50% electricity vs fixed speed — calculate approximate annual savings for user.
- Energy rating (BEE stars) and ISEER value determine efficiency — always highlight for ACs.
- Voltas coolers are popular for budget cooling — suggest if user finds ACs too expensive.
- Seasonal demand: ACs often go out of stock in peak summer (April-June). Inform user about availability.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
