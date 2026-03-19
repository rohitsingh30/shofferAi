---
name: lg-store
description: Buy LG appliances on LG India — TVs, ACs, refrigerators, washing machines, microwaves, air purifiers.
triggers:
  - lg
  - buy lg
  - lg store
  - order from lg
  - lg tv
  - lg ac
  - lg refrigerator
  - lg washing machine
  - buy from lg india
siteUrl: https://www.lg.com/in/
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "55 inch OLED TV", "1.5 ton split AC", "668L refrigerator", "8kg front load washing machine")
  - name: budget
    required: false
    hint: Max price (e.g. "under 60000", "budget 40k")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, EMI, net banking)
---

# LG India Store

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What product to search for
2. **budget** (type: "slider", collapsed): Budget range, min 100, max 50000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Clarify Requirements
- Confirm what the user wants to buy. If vague, use `ask_user` to clarify (product category, model, size/capacity, budget).
- For TVs: ask screen size (32/43/55/65/75/86 inch), display tech (OLED, QNED, NanoCell, UHD), smart TV features.
- For ACs: ask tonnage (1/1.5/2 ton), type (split/window), inverter preference, energy rating.
- For refrigerators: ask capacity (liters), type (single door, double door, side-by-side, french door), inverter.
- For washing machines: ask capacity (kg), type (front load, top load), inverter.
- Note any specific requirements (color, energy star rating, WiFi/ThinQ enabled).

### 2. Open LG Store & Verify Login
- Open a NEW tab and navigate to `https://www.lg.com/in/`.
- Take snapshot. Dismiss any cookie consent or promotional popups.
- Verify logged in (LG account icon shows profile/name in top-right header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product category and specifications.
- Take snapshot of search results page.
- Apply relevant filters: price range, capacity/size, energy rating, features, inverter technology.
- Extract top 3-5 options with: model name, price (MRP vs offer price), key specs, energy rating, ThinQ compatibility.
- Use `ask_user` (input_type "choice") to present options. Format: "LG Model — ₹XX,XXX — Key Spec — BEE ⭐ Rating"
- If user wants to see more, scroll or go to next page.

### 4. View Product Details
- Click selected product.
- Take snapshot of product page.
- Extract: full model name, price, MRP, discount %, bank offers, EMI options, warranty period, delivery date, installation details.
- If product has variants (color, capacity), present them via `ask_user` (input_type "choice").
- Mention any active offers: "Save ₹X with HDFC card", "No-cost EMI from ₹X/month", "Free installation included".
- Note energy rating (BEE stars) — important for ACs, refrigerators, washing machines.
- Confirm with user: "Add [product] at ₹X,XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Cart" or "Buy Now".
- Go to cart, take snapshot.
- Check for applicable coupons or promo codes — apply if visible.
- Use `confirm_action` to present order summary:
  - Product name, model number, variant (color/capacity), quantity
  - Price, any discounts/offers applied, bank offers
  - Installation: included or extra cost
  - Warranty: standard + extended options
  - Delivery date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Schedule installation if applicable (LG offers professional installation for ACs, washing machines).
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, model, specs, price, installation, warranty, delivery, total
  - amount_inr: total amount (number)
  - description: "LG India store order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method on lg.com (UPI/card/COD/EMI/net banking as per user preference).
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product, model number, price paid, estimated delivery date, installation schedule, warranty details.

## Site Notes

- LG India delivery: 3-7 business days for most products. Free delivery on appliances above ₹10,000.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- LG ThinQ app compatibility — mention for WiFi-enabled products (smart ACs, washing machines, refrigerators).
- Bank offers (HDFC, SBI, ICICI card cashback) are frequently available — always check and mention.
- No-cost EMI available on most products above ₹10,000 — calculate and present monthly amounts.
- LG offers free standard installation for ACs, washing machines, and dishwashers — always mention.
- Extended warranty (LG Care+) available on most appliances — present options with pricing during checkout.
- Energy rating (BEE stars) is critical for ACs and refrigerators — always highlight 5-star vs 3-star savings.
- LG OLED TVs may have long waitlists for popular models — inform user if stock is limited.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
