---
name: haier-store
description: Buy Haier appliances on Haier India — ACs, washing machines, refrigerators, water heaters, deep freezers.
triggers:
  - haier
  - buy haier
  - haier store
  - order from haier
  - haier ac
  - haier washing machine
  - haier refrigerator
  - buy from haier india
  - haier appliance
siteUrl: https://www.haier.com/in/
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "1.5 ton split AC", "8kg front load washing machine", "345L double door refrigerator")
  - name: budget
    required: false
    hint: Max price (e.g. "under 40000", "budget 30k")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, EMI, net banking)
---

# Haier India Store

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Clarify Requirements
- Confirm what the user wants to buy. If vague, use `ask_user` to clarify (product category, capacity, type, budget).
- For ACs: ask tonnage (1/1.2/1.5/2 ton), type (split/window), inverter preference, energy rating, room size.
- For washing machines: ask capacity (kg), type (front load, top load), fully automatic vs semi-automatic.
- For refrigerators: ask capacity (liters), type (single door, double door, side-by-side, bottom mount), convertible.
- For water heaters: ask capacity (liters), type (instant, storage), gas vs electric.
- Note any specific requirements (color, smart features, Self-Clean technology, Frost-Free).

### 2. Open Haier Store & Verify Login
- Open a NEW tab and navigate to `https://www.haier.com/in/`.
- Take snapshot. Dismiss any cookie consent or promotional popups.
- Verify logged in (account/profile icon shows in header area).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar or navigate via product categories to find the appliance.
- Take snapshot of product listing page.
- Apply relevant filters: price range, capacity, type, energy rating, features, color.
- Extract top 3-5 options with: model name, price (MRP vs offer price), key specs, energy rating, standout features.
- Use `ask_user` (input_type "choice") to present options. Format: "Haier Model — ₹XX,XXX — Capacity — BEE ⭐ Rating — Key Feature"
- If user wants to see more, scroll or navigate to next page.

### 4. View Product Details
- Click selected product.
- Take snapshot of product page.
- Extract: full model name, price, MRP, discount %, bank offers, EMI options, warranty, delivery date, installation info.
- If product has variants (color, capacity), present them via `ask_user` (input_type "choice").
- Mention any active offers: "Save ₹X with bank card", "No-cost EMI from ₹X/month", "Free installation".
- Highlight Haier-specific technologies: Self-Clean (ACs), Twin Inverter, 1-Hour Wash, Convertible (refrigerators), Oceanus.
- Note energy rating (BEE stars) and annual energy consumption estimate.
- Confirm with user: "Add [product] at ₹X,XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Cart" or "Buy Now".
- Go to cart, take snapshot.
- Check for applicable coupons or promotional offers — apply if visible.
- Use `confirm_action` to present order summary:
  - Product name, model number, variant (color), quantity
  - Price, any discounts/offers applied, bank offers
  - Installation: included or extra cost, scheduling
  - Warranty: standard (comprehensive + compressor/motor) + extended options
  - Delivery date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Confirm pincode serviceability — Haier checks delivery availability by pincode.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, model, specs, price, installation, warranty, delivery, total
  - amount_inr: total amount (number)
  - description: "Haier India store order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method on haier.com (UPI/card/COD/EMI/net banking as per user preference).
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product, model number, price paid, estimated delivery date, installation schedule, warranty details.

## Site Notes

- Haier India delivery: 3-7 business days. Free delivery on most appliances.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Haier Self-Clean technology (ACs) is a key differentiator — auto-cleans evaporator, mention when comparing.
- Haier offers 10-year compressor warranty on many refrigerators and ACs — highlight this advantage.
- Bank offers and no-cost EMI are frequently available — check offer banners on product pages.
- Free standard installation for ACs, washing machines, and water heaters — always mention.
- Haier convertible refrigerators allow switching between fridge and freezer modes — mention if user needs flexibility.
- Haier Bottom Mount refrigerators are popular in premium range — suggest if user wants eye-level fresh food access.
- Pincode check is important — Haier may not service all remote locations for installation.
- Old appliance exchange may be offered on select products — ask user if they have an old unit.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
