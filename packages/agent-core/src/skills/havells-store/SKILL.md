---
name: havells-store
description: Buy Havells products on Havells India — fans, lights, water heaters, switches, wires, kitchen appliances, water purifiers.
triggers:
  - havells
  - buy havells
  - havells store
  - order from havells
  - havells fan
  - havells lights
  - havells water heater
  - buy from havells india
  - havells geyser
  - havells water purifier
siteUrl: https://www.havells.com/
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "ceiling fan 1200mm BLDC", "LED panel light 18W", "water heater 25L", "RO water purifier")
  - name: budget
    required: false
    hint: Max price (e.g. "under 5000", "budget 3k")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, EMI, net banking)
---

# Havells India Store

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Clarify Requirements
- Confirm what the user wants to buy. If vague, use `ask_user` to clarify (product category, specs, use case, budget).
- For fans: ask type (ceiling, table, pedestal, exhaust, decorative), size (mm), BLDC preference, color, remote control.
- For lights: ask type (LED bulb, tube light, panel light, downlight, strip light, decorative), wattage, color temp (warm/cool/daylight), quantity.
- For water heaters: ask capacity (1/3/6/10/15/25L), type (instant, storage), gas vs electric, material (glass-lined, stainless steel).
- For water purifiers: ask type (RO, RO+UV, RO+UV+UF), storage capacity, TDS level of source water.
- For kitchen appliances: ask type (mixer grinder, toaster, coffee maker, OTG, induction cooktop).
- For switchgear/wires: ask type (switches, MCB, wiring), specifications needed.
- Note any specific requirements (color, premium/standard range, IoT-enabled).

### 2. Open Havells Store & Verify Login
- Open a NEW tab and navigate to `https://www.havells.com/`.
- Take snapshot. Dismiss any cookie consent or promotional popups.
- Verify logged in (My Account/profile icon in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar or navigate via product categories.
- Take snapshot of product listing page.
- Apply relevant filters: price range, type, size/capacity, features, color, energy efficiency.
- Extract top 3-5 options with: model name, price (MRP vs offer price), key specs, features, design highlights.
- Use `ask_user` (input_type "choice") to present options. Format: "Havells Model — ₹X,XXX — Key Spec — Feature — Color Options"
- If user wants to see more, scroll or go to next page.

### 4. View Product Details
- Click selected product.
- Take snapshot of product page.
- Extract: full model name, price, MRP, discount %, features, warranty, delivery date, key specifications.
- If product has variants (color, finish, size), present them via `ask_user` (input_type "choice").
- Mention any active offers: "Save ₹X with bank card", "Combo offer", "Seasonal discount".
- For fans: highlight air delivery (CMM), RPM, sweep, BLDC energy savings (up to 65%), noise level, design aesthetics.
- For lights: highlight lumens, CRI (Color Rendering Index), lifespan (hours), energy efficiency.
- For water heaters: highlight heating time, tank material, safety features (temperature cutoff, pressure release).
- For water purifiers: highlight purification stages, TDS range, storage, filter life, maintenance cost.
- Confirm with user: "Add [product] at ₹X,XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Cart" or "Buy Now".
- Go to cart, take snapshot.
- Check for applicable coupons, combo offers, or promo codes — apply if visible.
- Suggest related products if relevant (fan + LED light, water purifier + spare filters).
- Use `confirm_action` to present order summary:
  - Product name, model number, variant (color/size), quantity
  - Price, any discounts/offers applied
  - Installation: note if professional install required (water purifier, water heater)
  - Warranty: standard Havells warranty
  - Delivery date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Check pincode serviceability for delivery.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, model, specs, price, warranty, delivery, total
  - amount_inr: total amount (number)
  - description: "Havells India store order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method on havells.com (UPI/card/COD/EMI/net banking as per user preference).
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product, model number, price paid, estimated delivery date, warranty details, installation info if applicable.

## Site Notes

- Havells delivery: 3-7 business days. Free delivery on orders above a threshold (varies by product).
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Havells is one of India's top electrical brands — strong in fans, lighting, and switchgear. Emphasize quality and safety.
- Havells decorative fans (Stealth, Equs, Carnesia) are premium — beautiful designs at higher price points. Suggest if aesthetics matter.
- Havells BLDC fans consume only 28-35W vs 75W for regular fans — calculate annual savings for the user.
- Havells water purifiers require AMC for filter replacement — inform user of annual maintenance cost (typically ₹2,000-4,000).
- Water heaters need professional plumbing installation — separate from delivery. Inform user upfront.
- Havells has an extensive service network across India — mention for post-sale support confidence.
- LED lights have 2-year warranty typically — Havells LED quality is trusted, mention long lifespan (25,000+ hours).
- Havells switchgear and wiring products are B2B-focused — if user asks, guide to appropriate products.
- Seasonal demand: fans peak in summer, water heaters in winter — availability and pricing may vary.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
