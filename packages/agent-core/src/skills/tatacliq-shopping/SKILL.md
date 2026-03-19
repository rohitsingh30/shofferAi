---
name: tatacliq-shopping
description: Shop on Tata CLiQ — buy electronics, fashion, luxury brands, redeem Tata Neu coins, checkout, pay.
triggers:
  - tata cliq
  - tatacliq
  - order from tata cliq
  - buy on tata cliq
  - tata cliq shopping
  - tata cliq luxury
  - buy electronics tata
  - shop tatacliq
siteUrl: https://www.tatacliq.com
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "wireless earbuds", "men's formal shirt", "smartwatch", "perfume")
  - name: brand
    required: false
    hint: Preferred brand (e.g. "Samsung", "Westside", "Sony", "Tommy Hilfiger")
  - name: budget
    required: false
    hint: Max price (e.g. "under 5000", "budget 3k")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, EMI, Tata Pay)
---

# Tata CLiQ Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What product to search for
2. **budget** (type: "slider", collapsed): Budget range, min 100, max 50000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Clarify Requirements
- Confirm what the user wants: electronics, fashion, luxury, or lifestyle products.
- Use `ask_user` to clarify: category, brand preference, budget, specific features needed.
- Ask if user has Tata Neu coins to redeem (can offset purchase price).
- Note that Tata CLiQ Luxury has premium brands — ask if user wants luxury or regular.

### 2. Open Tata CLiQ & Verify Login
- Open a NEW tab and navigate to `https://www.tatacliq.com`.
- Take snapshot. Verify logged in (profile icon or name in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product.
- Take snapshot of search results page.
- Apply filters: brand, price range, rating, discount, category.
- Check for CLiQ Cash or NeuCoins offers on products.
- Extract top 3-5 options with: brand, name, price (MRP vs discounted), rating, discount %, CLiQ Cash back.
- Use `ask_user` (input_type "choice") to present options. Format: "Brand Name — ₹X,XXX (XX% off) — ⭐ Rating — CLiQ Cash ₹XXX"
- If user wants to see more, scroll or adjust filters.

### 4. View Product Details
- Click selected product.
- Take snapshot of product page.
- Extract: brand, full name, price, MRP, discount, specifications, warranty, delivery date, seller, available offers.
- For electronics: highlight key specs (storage, RAM, display, battery, etc.).
- For fashion: note sizes, colors, material, fit type.
- If product has variants (color, size, storage), present via `ask_user` (input_type "choice").
- Check for bank offers and NeuCoins earning potential.
- Confirm with user: "Add [product] at ₹X,XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Cart".
- Go to cart, take snapshot.
- Check for applicable coupons or Tata CLiQ promotions.
- Apply NeuCoins if user wants to redeem them.
- Apply best coupon if available.
- Use `confirm_action` to present order summary:
  - Product: brand, name, variant, specs
  - Price: MRP, discount, coupon savings, NeuCoins redeemed, final price
  - CLiQ Cash earned on this purchase
  - Delivery date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Proceed to Pay".
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, brand, variant, price, NeuCoins, delivery, total
  - amount_inr: total amount (number)
  - description: "Tata CLiQ order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product details, price paid, NeuCoins earned, estimated delivery date, warranty info.

## Site Notes

- Tata CLiQ delivery: 2-7 days for most items. Electronics may take longer for remote areas.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- Tata Neu ecosystem: NeuCoins earned on purchases can be redeemed on Tata CLiQ, BigBasket, 1mg, etc.
- CLiQ Cash is Tata CLiQ's internal wallet — can be used for partial payment.
- Tata CLiQ Luxury (luxury.tatacliq.com) has premium brands like Hugo Boss, Coach, Michael Kors.
- Tata CLiQ Palette is their beauty section — good for premium cosmetics.
- Bank offers (HDFC, ICICI, SBI) frequently available — check and inform user.
- Free delivery on most orders. Some items have delivery charges for remote pincodes.
- EMI available on electronics above ₹3,000 — mention to user if relevant.
- Return policy: 7-30 days depending on category. Electronics typically 7 days, fashion 30 days.
- Tata Pay (UPI) offers extra NeuCoins — suggest if user has Tata Pay.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
