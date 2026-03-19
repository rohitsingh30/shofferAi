---
name: reliance-digital
description: Shop on Reliance Digital — buy electronics, appliances, gadgets, compare specs, checkout with installation, pay.
triggers:
  - reliance digital
  - order from reliance digital
  - buy on reliance digital
  - reliance digital shopping
  - buy electronics reliance
  - reliance digital order
  - buy appliance reliance
  - jio mart electronics
siteUrl: https://www.reliancedigital.in
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "Samsung 55 inch TV", "washing machine", "laptop under 50000", "air conditioner 1.5 ton")
  - name: budget
    required: false
    hint: Max price (e.g. "under 30000", "budget 50k")
  - name: installation
    required: false
    hint: Whether installation is needed (e.g. "yes need installation", "no")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, EMI, Jio Finance)
---

# Reliance Digital Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What product to search for
2. **budget** (type: "slider", collapsed): Budget range, min 100, max 50000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Clarify Requirements
- Confirm what the user wants: product type, brand preference, specifications (size, capacity, storage, etc.).
- Use `ask_user` to clarify: budget, required features, installation needs, room/space dimensions if relevant.
- Note any specific requirements (energy rating, inverter technology, smart features, warranty extension).

### 2. Open Reliance Digital & Verify Login
- Open a NEW tab and navigate to `https://www.reliancedigital.in`.
- Take snapshot. Verify logged in (user name or profile icon visible in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Set delivery pincode if prompted — use `ask_user` to get pincode.

### 3. Search & Browse Products
- Use the search bar to search for the product.
- Take snapshot of search results page.
- Apply filters if relevant: price range, brand, rating, features (energy star, smart TV, inverter, etc.), availability.
- Extract top 3-5 options with: brand, model name, price, MRP, discount, rating, key specs, EMI option.
- Use `ask_user` (input_type "choice") to present options. Format: "Brand Model — ₹XX,XXX (XX% off) — ⭐ Rating — Key Spec — EMI from ₹XXX/mo"
- If user wants to see more, scroll or refine filters.

### 4. View Product Details
- Click selected product.
- Take snapshot of product page.
- Extract: brand, full model name, price, MRP, discount, key specifications, energy rating, warranty, delivery date, installation availability.
- If product has variants (color, storage, capacity), present them via `ask_user` (input_type "choice").
- Check if installation is available and included — inform user.
- Check EMI options — present no-cost EMI if available.
- Confirm with user: "Add [product] at ₹XX,XXX to cart? Installation: [Yes/No/Included]"

### 5. Add to Cart & Review
- Click "Add to Cart".
- Go to cart, take snapshot.
- Add extended warranty if user wants (present via `ask_user`).
- Add installation service if applicable and not included.
- Check for bank offers, exchange offers, or combo deals.
- Use `confirm_action` to present order summary:
  - Product: brand, model, key specs
  - Price, MRP, discount, bank offers
  - Installation charges (if any)
  - Extended warranty (if added)
  - Delivery/installation date
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Proceed to Checkout".
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Schedule installation if applicable — present available slots via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, specs, price, installation, warranty, delivery, total
  - amount_inr: total amount (number)
  - description: "Reliance Digital order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product details, price paid, estimated delivery date, installation date/slot, warranty info.

## Site Notes

- Reliance Digital delivery: 2-7 days for most items. Large appliances may take 5-10 days with installation.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- Reliance Digital offers free installation on many large appliances (ACs, washing machines, TVs).
- Jio members may get additional discounts — check and apply if available.
- No-cost EMI available on many products via major credit cards — always check and mention.
- Extended warranty (ResQ) is available on most electronics — present as option but do not push.
- Bank offers (HDFC, SBI, ICICI, etc.) are common — mention applicable discount.
- Exchange offers on TVs, phones, laptops — ask user if they have a device to exchange.
- Reliance Digital has physical stores — mention store pickup if available at user's location.
- Energy star ratings matter for ACs, fridges, washing machines — highlight for user.
- Demo/installation scheduling happens during checkout for large appliances.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
