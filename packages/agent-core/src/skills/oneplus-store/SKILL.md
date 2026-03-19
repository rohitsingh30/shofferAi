---
name: oneplus-store
description: Buy OnePlus products on OnePlus India — phones, earbuds, watches, accessories.
triggers:
  - oneplus
  - buy oneplus
  - oneplus store
  - order from oneplus
  - oneplus phone
  - buy oneplus buds
  - oneplus india
  - oneplus order
siteUrl: https://www.oneplus.in/
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "OnePlus 13", "OnePlus Buds Pro 3", "OnePlus Watch 2")
  - name: budget
    required: false
    hint: Max price (e.g. "under 40000", "budget 25k")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, EMI)
---

# OnePlus India Store

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Clarify Requirements
- Confirm what the user wants to buy. If vague, use `ask_user` to clarify (product type, model, RAM/storage variant, color, budget).
- Note any specific requirements (RAM, storage, color preference).

### 2. Open OnePlus Store & Verify Login
- Open a NEW tab and navigate to `https://www.oneplus.in/`.
- Take snapshot. Dismiss any promotional popups or notification prompts.
- Verify logged in (OnePlus account icon/profile name in top-right header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar or navigate to the product category page (Phones, Earbuds, Wearables, Accessories).
- Take snapshot of product listing page.
- Extract available models with: name, price, key specs (processor, RAM, battery, camera), colors available.
- Use `ask_user` (input_type "choice") to present options. Format: "Product Name — ₹X,XXX — Key Specs — Colors"
- If user already knows the exact model, navigate directly to its product page.

### 4. View Product Details & Select Variant
- Click selected product.
- Take snapshot of product page.
- Extract: full name, price, MRP, discount %, bank offers, exchange bonus, EMI options, delivery date.
- If product has variants (RAM/storage combos, colors), present them via `ask_user` (input_type "choice").
  - Format: "12GB+256GB — ₹X,XXX", "16GB+512GB — ₹X,XXX"
- Mention any active offers: "₹X,XXX off with HDFC card", "Exchange bonus up to ₹X,XXX", "No-cost EMI".
- Confirm with user: "Add [product variant] at ₹X,XXX to cart?"

### 5. Add to Cart & Review
- Click "Buy Now" or "Add to Cart".
- Go to cart, take snapshot.
- Check for applicable coupon codes or Red Cable Club benefits.
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
  - description: "OnePlus India store order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method on OnePlus.in (UPI/card/COD/EMI as per user preference).
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product, variant, price paid, estimated delivery date, warranty details.

## Site Notes

- OnePlus.in delivery: 2-5 business days. Free delivery on all products.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- OnePlus Red Cable Club members get priority delivery, extended warranty, and exclusive offers — check membership.
- Bank offers (instant discount on HDFC, ICICI, SBI) are very common during launches — always check and mention.
- Exchange offers available on phones — ask user if they have a device to exchange. OnePlus accepts most brands.
- OnePlus Care (extended warranty) may be offered during checkout — inform user of the option.
- Student discount program available — ask if user qualifies for education pricing.
- Flash sales: New launches may have limited stock with "Add to Cart" available only during sale windows.
- No-cost EMI available on most phones above ₹15,000 — always mention EMI options.
- OnePlus.in exclusive colors may not be available on Amazon/Flipkart — highlight store-exclusive variants.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
