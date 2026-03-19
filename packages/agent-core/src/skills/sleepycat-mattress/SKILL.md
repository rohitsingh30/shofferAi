---
name: sleepycat-mattress
description: Shop on SleepyCat — browse mattresses, select size/type, check trial offer, checkout, pay.
triggers:
  - sleepycat
  - order from sleepycat
  - buy on sleepycat
  - buy mattress
  - buy mattress online
  - sleepycat mattress
  - order mattress
  - buy bed mattress
  - sleepycat pillow
siteUrl: https://www.sleepycat.in
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "queen mattress", "king size mattress", "pillow", "mattress protector")
  - name: size
    required: false
    hint: Bed size (e.g. "single", "double", "queen", "king", "custom")
  - name: type
    required: false
    hint: Mattress type (e.g. "memory foam", "latex", "orthopedic", "hybrid")
  - name: budget
    required: false
    hint: Max price (e.g. "under 15000", "budget 20k")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, EMI)
---

# SleepyCat Mattress Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Clarify Requirements
- Confirm what the user wants: mattress type, bed size, firmness preference.
- Use `ask_user` to clarify: size (single/double/queen/king), type (memory foam, latex, orthopedic, hybrid), firmness (soft/medium/firm), budget range.
- Ask about any specific needs: back pain relief, cooling gel, waterproof protector.
- Note if user wants accessories too (pillows, protectors, bedsheets).

### 2. Open SleepyCat & Verify Login
- Open a NEW tab and navigate to `https://www.sleepycat.in`.
- Take snapshot. Verify logged in (account icon or name in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Browse & Select Product
- Navigate to the relevant category (mattresses, pillows, accessories).
- Take snapshot of product listing page.
- SleepyCat has a focused product line — extract all available options with: name, type, size options, price range, firmness level, key features.
- Use `ask_user` (input_type "choice") to present options. Format: "Product Name — Type — Firmness — ₹XX,XXX — Key Feature (e.g. cooling gel, orthopedic)"
- If user is unsure, suggest based on their needs (back pain → orthopedic, hot sleeper → cooling gel).

### 4. View Product Details & Select Size
- Click selected product.
- Take snapshot of product page.
- Extract: full name, type, all available sizes with prices, thickness, materials used, firmness rating, trial period, warranty, delivery date.
- Present size options via `ask_user` (input_type "choice"): "Single 72x36 — ₹X,XXX | Double 72x48 — ₹X,XXX | Queen 78x60 — ₹XX,XXX | King 78x72 — ₹XX,XXX"
- Highlight the 100-night free trial offer.
- Confirm with user: "Add [product] [size] at ₹XX,XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Cart" with selected size.
- Go to cart, take snapshot.
- Check for applicable discount codes or combo offers (mattress + pillow bundles).
- Apply best coupon if available.
- Use `confirm_action` to present order summary:
  - Product: name, type, size, thickness, firmness
  - Price: MRP, discount, coupon savings, final price
  - Trial: 100-night free trial details
  - Warranty: period and coverage
  - Delivery date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Proceed to Checkout".
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, type, size, thickness, price, trial_period, warranty, delivery, total
  - amount_inr: total amount (number)
  - description: "SleepyCat mattress order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product details, size, price paid, estimated delivery date, trial period info, warranty details.

## Site Notes

- SleepyCat offers a 100-night free trial on mattresses — the mattress arrives vacuum-packed and needs 24-48 hours to fully expand.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Free delivery across India on all mattresses; delivery typically takes 5-10 business days.
- SleepyCat mattresses come with a 10-year warranty — mention this to the user.
- EMI options available — useful for premium mattresses above ₹10,000.
- The mattress arrives compressed in a box ("bed in a box") — inform user about unboxing and expansion time.
- SleepyCat has a limited product range — if user wants something not available, suggest alternatives.
- No return on pillows and protectors after opening — clarify before ordering accessories.
- Custom sizes may be available on request — check product page for custom size options.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
