---
name: croma-electronics
description: Shop on Croma — buy electronics, appliances, gadgets, compare specs, buy with installation, checkout, pay.
triggers:
  - croma
  - order from croma
  - buy on croma
  - croma electronics
  - buy appliance
  - buy laptop croma
  - buy tv croma
  - croma shopping
siteUrl: https://www.croma.com
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "washing machine 7kg", "laptop for coding", "65 inch TV", "air conditioner 1.5 ton")
  - name: brand
    required: false
    hint: Preferred brand (e.g. "Samsung", "LG", "Apple", "Sony", "HP")
  - name: budget
    required: false
    hint: Max price (e.g. "under 50000", "budget 30k")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, EMI, Croma gift card)
---

# Croma Electronics Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What product to search for
2. **budget** (type: "slider", collapsed): Budget range, min 100, max 50000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Clarify Requirements
- Confirm what the user wants: smartphones, laptops, TVs, appliances (AC, washing machine, refrigerator), audio, wearables.
- Use `ask_user` to clarify: brand preference, key specs needed, size/capacity, budget.
- For appliances: ask room size (AC tonnage), family size (washing machine capacity), energy rating preference.
- Ask about installation needs — Croma offers professional installation for appliances.

### 2. Open Croma & Verify Login
- Open a NEW tab and navigate to `https://www.croma.com`.
- Take snapshot. Verify logged in (profile icon or name in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product.
- Take snapshot of search results page.
- Apply filters: brand, price range, rating, features (for TVs: resolution, smart TV; for laptops: RAM, SSD, processor).
- Check for Croma-exclusive offers or bundles.
- Extract top 3-5 options with: brand, name, price (MRP vs offer price), key specs, rating, EMI option.
- Use `ask_user` with `input_type: "carousel"` to present options. Extract the REAL image URL from each product's `<img>` tag on the page. Format:
  ```json
  {
    "input_type": "carousel",
    "cards": [
      {"id": "1", "label": "Brand Model", "subtitle": "₹XX,XXX · EMI ₹X,XXX/mo · Key Spec", "image": "https://media-ik.croma.com/prod/real-image...", "badge": "⭐ 4.3"}
    ]
  }
  ```
- If user wants to compare, present a side-by-side comparison of shortlisted products.

### 4. View Product & Compare
- Click selected product.
- Take snapshot of product page.
- Extract: brand, model, full specs, price, MRP, discount, bank offers, EMI options, warranty, delivery date, installation details.
- For appliances: note energy rating (BEE stars), capacity, inverter/non-inverter, installation charges.
- For electronics: note processor, RAM, storage, display, battery.
- If product has variants (color, storage, capacity), present via `ask_user` with `input_type: "chip_bar"`:
  ```json
  {"input_type": "chip_bar", "options": ["128 GB", "256 GB", "512 GB"]}
  ```
  Use separate chip_bar calls for each variant type (e.g., one for color, one for storage).
- Check if extended warranty is available — inform user of options and pricing.
- Confirm with user: "Add [product] at ₹XX,XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Cart".
- Go to cart, take snapshot.
- Check for applicable coupons, bank offers, exchange offers.
- Add extended warranty if user opted for it.
- Apply best available offer/coupon.
- Use `confirm_action` to present order summary:
  - Product: brand, model, key specs
  - Price: MRP, discount, bank offer, exchange value (if any), final price
  - Extended warranty: cost if added
  - Installation: included or extra cost, scheduling info
  - EMI: monthly amount if applicable
  - Delivery date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Proceed to Checkout".
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Schedule installation if applicable (Croma offers date/time slot selection for appliances).
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, specs, price, warranty, installation, EMI, delivery, total
  - amount_inr: total amount (number)
  - description: "Croma electronics order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product details, price paid, warranty info, installation schedule, estimated delivery date.

## Site Notes

- Croma delivery: 2-5 days for small electronics, 5-10 days for large appliances (includes installation scheduling).
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- Croma is a Tata enterprise — NeuCoins may be earned/redeemed on purchases.
- Professional installation is Croma's differentiator for appliances — always mention availability.
- Extended warranty (Croma Assured) available on most electronics — present options with pricing.
- Bank offers (HDFC, ICICI, SBI credit cards) frequently available — check and inform.
- No-cost EMI available on many products — calculate and present monthly amounts.
- Exchange offers on phones, TVs, laptops — ask user if they have a device to exchange.
- Croma has physical stores — store pickup available in select cities for same-day collection.
- Energy rating (BEE stars) is important for appliances — always mention for ACs, fridges, washing machines.
- Demo/installation is free for most appliances above ₹10,000.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
