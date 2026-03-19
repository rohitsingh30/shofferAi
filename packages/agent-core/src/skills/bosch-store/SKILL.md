---
name: bosch-store
description: Buy Bosch home appliances on Bosch India — washing machines, dishwashers, refrigerators, dryers, ovens, cooktops.
triggers:
  - bosch
  - buy bosch
  - bosch store
  - order from bosch
  - bosch washing machine
  - bosch dishwasher
  - bosch refrigerator
  - buy from bosch india
  - bosch appliance
siteUrl: https://www.boschindia.com/
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "8kg front load washing machine", "13 place setting dishwasher", "frost free refrigerator 350L")
  - name: budget
    required: false
    hint: Max price (e.g. "under 50000", "budget 40k")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, EMI, net banking)
---

# Bosch India Store

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Clarify Requirements
- Confirm what the user wants to buy. If vague, use `ask_user` to clarify (product category, capacity, features, budget).
- For washing machines: ask capacity (kg), type (front load — Bosch specializes in front load), wash programs needed, dryer combo.
- For dishwashers: ask place settings (8/12/13/14), freestanding vs built-in, half-load option.
- For refrigerators: ask capacity (liters), type (double door, bottom mount, side-by-side), VitaFresh preference.
- For ovens: ask type (built-in, microwave combo, steam oven), capacity.
- For cooktops: ask type (gas, induction, electric), number of burners, built-in vs freestanding.
- Note any specific requirements (color, energy rating, noise level, smart connectivity via Home Connect).

### 2. Open Bosch Store & Verify Login
- Open a NEW tab and navigate to `https://www.boschindia.com/`.
- Take snapshot. Dismiss any cookie consent or promotional popups or newsletter modals.
- Verify logged in (MyBosch account icon/profile in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar or navigate via product categories to find the appliance.
- Take snapshot of product listing page.
- Apply relevant filters: price range, capacity, type, energy rating, features, color.
- Extract top 3-5 options with: model name, price (MRP vs offer price), key specs, energy rating, highlights.
- Use `ask_user` (input_type "choice") to present options. Format: "Bosch Model — ₹XX,XXX — Capacity — Key Feature — BEE ⭐"
- If user wants to compare models, use Bosch's built-in comparison feature if available.

### 4. View Product Details
- Click selected product.
- Take snapshot of product page.
- Extract: full model name, price, MRP, discount %, bank offers, EMI options, warranty, delivery date, installation info.
- If product has variants (color — typically white/silver/black), present via `ask_user` (input_type "choice").
- Mention any active offers: "Save ₹X with bank card", "No-cost EMI from ₹X/month", "Free installation".
- Highlight Bosch-specific technologies: EcoSilence Drive, ActiveWater, AntiVibration, VarioSpeed, VitaFresh, Home Connect.
- Note energy rating and noise level (dB) — Bosch is known for quiet operation.
- Confirm with user: "Add [product] at ₹XX,XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Cart" or "Buy Now".
- Go to cart, take snapshot.
- Check for applicable coupons or promotional offers — apply if visible.
- Use `confirm_action` to present order summary:
  - Product name, model number, variant (color), quantity
  - Price, any discounts/offers applied, bank offers
  - Installation: included (free for most appliances) or extra cost
  - Warranty: standard Bosch warranty (2 years comprehensive + 10/12 years motor)
  - Delivery date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Confirm pincode serviceability — Bosch checks delivery and installation availability by pincode.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, model, specs, price, installation, warranty, delivery, total
  - amount_inr: total amount (number)
  - description: "Bosch India store order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method on boschindia.com (UPI/card/COD/EMI/net banking as per user preference).
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product, model number, price paid, estimated delivery date, installation schedule, warranty details.

## Site Notes

- Bosch India delivery: 5-10 business days for most appliances. Free delivery on most products.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Bosch is a premium German brand — products are higher-priced but known for durability and quiet operation.
- Bosch front-load washing machines dominate their lineup — they are market leaders in this segment in India.
- EcoSilence Drive motor comes with 10-year warranty — a major selling point, always mention.
- Bosch dishwashers are growing fast in India — explain water/time savings if user is considering first dishwasher purchase.
- Home Connect app allows remote control of smart appliances — mention for WiFi-enabled models.
- Free standard installation for washing machines, dishwashers, and built-in appliances — always mention.
- Bosch built-in kitchen range (ovens, cooktops, chimneys) available — suggest if user is doing kitchen remodel.
- Noise level is a Bosch differentiator — their machines operate at 46-65 dB vs industry 55-75 dB. Highlight this.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
