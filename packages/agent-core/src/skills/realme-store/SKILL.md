---
name: realme-store
description: Buy Realme products on Realme India — phones, AIoT devices, earbuds, accessories.
triggers:
  - realme
  - buy realme
  - realme store
  - order from realme
  - realme phone
  - realme india
  - realme buds
  - buy from realme
siteUrl: https://www.realme.com/in/
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "Realme GT 7 Pro", "Realme Buds Air 6 Pro", "Realme Pad 2")
  - name: budget
    required: false
    hint: Max price (e.g. "under 25000", "budget 15k")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, EMI)
---

# Realme India Store

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What product to search for
2. **budget** (type: "slider", collapsed): Budget range, min 100, max 50000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Clarify Requirements
- Confirm what the user wants to buy. If vague, use `ask_user` to clarify (product type — phone/earbuds/tablet/AIoT, model, specs, budget).
- Note any specific requirements (RAM, storage, color preference, use case).

### 2. Open Realme Store & Verify Login
- Open a NEW tab and navigate to `https://www.realme.com/in/`.
- Take snapshot. Dismiss any promotional banners or app-download popups.
- Verify logged in (account icon shows profile name in top-right header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Browse & Select Product
- Navigate to the product category (Smartphones, Audio, Wearables, AIoT, Accessories) or use search.
- Take snapshot of product listing page.
- Extract available models with: name, price, key specs (processor, RAM, camera, battery), colors.
- Use `ask_user` (input_type "choice") to present options. Format: "Product Name — ₹X,XXX — Key Specs — Colors"
- If user already knows the exact model, navigate directly to its page.

### 4. View Product Details & Select Variant
- Click selected product.
- Take snapshot of product page.
- Extract: full name, price, MRP, discount %, bank offers, exchange bonus, delivery date, warranty.
- If product has variants (RAM/storage combos, colors), present them via `ask_user` (input_type "choice").
  - Format: "8GB+128GB Marble Black — ₹X,XXX", "8GB+256GB Crystal Blue — ₹X,XXX"
- Mention any active offers: "₹X off with ICICI card", "Exchange up to ₹X", "Coupon code available".
- Confirm with user: "Add [product variant] at ₹X,XXX to cart?"

### 5. Add to Cart & Review
- Click "Buy Now" or "Add to Cart".
- Go to cart, take snapshot.
- Check for applicable coupon codes or bundle offers.
- Use `confirm_action` to present order summary:
  - Product name, variant (RAM/storage/color), quantity
  - Price, any discounts/offers applied, exchange value
  - Delivery date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, variant, price, delivery, offers, total
  - amount_inr: total amount (number)
  - description: "Realme India store order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method on realme.com (UPI/card/COD/EMI as per user preference).
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product, variant, price paid, estimated delivery date, warranty details.

## Site Notes

- Realme.com/in delivery: 2-5 business days. Free delivery on most products.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Flash sales are very common on Realme — new launches sell out fast. If "Out of Stock" or "Notify Me", inform user of next sale date.
- Realme store often has exclusive colors and early access not available on Flipkart/Amazon — highlight exclusives.
- Bank offers (instant discount on HDFC, SBI, ICICI) are frequent during sale events — always check and mention.
- Exchange offers available on phones — ask user if they have a device to exchange.
- Realme.com may redirect to Flipkart for some products — handle the redirect and continue on Flipkart if needed.
- Combo offers: phone + earbuds, phone + case bundles may be available at discount — mention if applicable.
- Realme TechLife products (smart bulbs, scales, etc.) are in the AIoT category — clarify if user asks for smart home products.
- No-cost EMI available on phones above ₹10,000 — mention EMI options.
- Realme UI updates and software support duration varies by model — mention if user asks about longevity.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
