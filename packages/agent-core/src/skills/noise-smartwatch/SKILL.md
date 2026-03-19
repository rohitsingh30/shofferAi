---
name: noise-smartwatch
description: Shop on Noise (gonoise.com) — buy smartwatches, earbuds, audio accessories, browse collections, checkout, pay.
triggers:
  - noise
  - buy noise smartwatch
  - order from noise
  - noise earbuds
  - gonoise
  - noise shopping
  - buy smartwatch noise
  - noise headphones
siteUrl: https://www.gonoise.com
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "smartwatch with calling", "wireless earbuds", "fitness band")
  - name: budget
    required: false
    hint: Max price (e.g. "under 3000", "budget 2000")
  - name: color
    required: false
    hint: Color preference (e.g. "black", "rose gold", "olive green")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# Noise Smartwatch & Audio Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What product to search for
2. **budget** (type: "slider", collapsed): Budget range, min 100, max 50000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Clarify Requirements
- Confirm what the user wants: smartwatch, earbuds, headphones, or accessories.
- Use `ask_user` to clarify: primary use (fitness tracking, calling, music, daily wear), display preference (AMOLED, round/square), features (GPS, SpO2, calling, ANC).
- Note any specific requirements (strap type, battery life, water resistance, dial size, gender preference).

### 2. Open Noise & Verify Login
- Open a NEW tab and navigate to `https://www.gonoise.com`.
- Take snapshot. Verify logged in (account icon or user name visible in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product type or specific model.
- Take snapshot of search results or category page.
- Apply filters if relevant: price range, category (smartwatches, earbuds), features (Bluetooth calling, AMOLED, GPS).
- Extract top 3-5 options with: model name, price, MRP, discount, key features (display type, calling, battery life, sensors).
- Use `ask_user` (input_type "choice") to present options. Format: "Noise Model — ₹X,XXX (XX% off) — Display Type — Battery X days — Key Feature"
- If user wants to see more, scroll or browse different category.

### 4. View Product Details
- Click selected product.
- Take snapshot of product page.
- Extract: model name, price, MRP, discount, color/strap options, display specs, battery life, sensors (SpO2, heart rate, GPS), water resistance rating, Bluetooth calling support.
- If product has color/strap variants, present them via `ask_user` (input_type "choice").
- Highlight Noise-specific features: Noise Health Suite, Tru Sync, InstaCharge, NoiseFit app compatibility.
- Confirm with user: "Add Noise [model] ([color]) at ₹X,XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Cart".
- Go to cart, take snapshot.
- Check for coupon codes, bundle deals (watch + strap combo), or ongoing sale offers.
- Apply coupon if available.
- Use `confirm_action` to present order summary:
  - Product: model name, color/strap
  - Price, MRP, discount, coupon savings
  - Delivery date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Checkout" or "Buy Now".
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, color, price, delivery, total
  - amount_inr: total amount (number)
  - description: "Noise order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product (model, color), price paid, estimated delivery date, warranty period.

## Site Notes

- Noise delivery: 3-7 days depending on location. Metro cities typically get faster delivery.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- Noise is India's leading smartwatch brand — best known for affordable smartwatches with calling.
- Most Noise smartwatches have 1-year warranty. Extended warranty may be available.
- Noise ColorFit = smartwatch line, Noise Buds = TWS earbuds, Noise Air Buds = premium TWS.
- Bluetooth calling is a key differentiator — most mid-range Noise watches support it.
- AMOLED displays are on premium models — highlight if user wants better display quality.
- NoiseFit app is required for full smartwatch features — mention to user.
- Free delivery on most orders. COD available on select products.
- Interchangeable straps available — mention if user wants to customize.
- IP67/IP68 ratings are common — important for fitness/swimming use.
- Noise frequently runs sales during festivals — check for active offers.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
