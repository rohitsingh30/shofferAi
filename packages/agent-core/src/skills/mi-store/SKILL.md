---
name: mi-store
description: Buy Xiaomi/Redmi products on mi.com — phones, TVs, smart home devices, accessories.
triggers:
  - xiaomi
  - mi store
  - buy xiaomi
  - buy redmi
  - redmi phone
  - mi india
  - xiaomi store
  - order from mi
siteUrl: https://www.mi.com/in
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "Redmi Note 14 Pro+", "Xiaomi 55 inch TV", "Mi Robot Vacuum")
  - name: budget
    required: false
    hint: Max price (e.g. "under 20000", "budget 15k")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, EMI)
---

# Xiaomi India Store (mi.com)

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Clarify Requirements
- Confirm what the user wants to buy. If vague, use `ask_user` to clarify (product category — phone/TV/smart home, model, specs, budget).
- Note any specific requirements (RAM, storage, screen size, color).

### 2. Open Mi Store & Verify Login
- Open a NEW tab and navigate to `https://www.mi.com/in`.
- Take snapshot. Dismiss any app-download banners or promotional popups.
- Verify logged in (Mi Account icon shows profile/name in top-right header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product, or navigate to the category (Phones, TV, Smart Home, Lifestyle).
- Take snapshot of search results or category page.
- Apply relevant filters if budget specified (price range, brand — Xiaomi vs Redmi vs POCO).
- Extract top 3-5 options with: name, price (MRP vs sale price), key specs, colors, delivery info.
- Use `ask_user` (input_type "choice") to present options. Format: "Product Name — ₹X,XXX — Key Specs — Colors"
- If user wants to see more, scroll or go to next page.

### 4. View Product Details & Select Variant
- Click selected product.
- Take snapshot of product page.
- Extract: full name, price, MRP, discount %, bank offers, exchange value, EMI options, delivery date, warranty.
- If product has variants (RAM/storage, color, size for TVs), present them via `ask_user` (input_type "choice").
- Mention any active offers: "₹X off with SBI card", "Exchange up to ₹X", "Coupon: SAVE500".
- Confirm with user: "Add [product variant] at ₹X,XXX to cart?"

### 5. Add to Cart & Review
- Click "Buy Now" or "Add to Cart".
- Go to cart, take snapshot.
- Check for applicable coupon codes — apply if available.
- Use `confirm_action` to present order summary:
  - Product name, variant (RAM/storage/color/size), quantity
  - Price, any discounts/coupons applied, exchange value
  - Delivery date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, variant, price, delivery, offers, total
  - amount_inr: total amount (number)
  - description: "Xiaomi India store order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method on mi.com (UPI/card/COD/EMI as per user preference).
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product, variant, price paid, estimated delivery date, warranty details.

## Site Notes

- Mi.com/in delivery: 2-5 business days. Free delivery on most products above ₹500.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Flash sales are common for new launches — "Add to Cart" button appears only during sale window. If out of stock, inform user of next sale date.
- Mi.com often has exclusive colors and combos not available on Amazon/Flipkart — highlight these.
- Bank offers (instant discount on HDFC, SBI, ICICI) are frequent — always check and mention.
- Exchange offers available on phones — ask user if they have a device to exchange. Mi accepts most brands.
- Mi Protect (extended warranty/screen protection) offered during checkout — inform user of options and cost.
- Combo offers: phone + case, phone + earbuds bundles may be available — mention if applicable.
- POCO and Redmi products are also sold on mi.com — clarify brand if user says "Xiaomi phone" generically.
- No-cost EMI available on products above ₹5,000 — mention EMI options for higher-value items.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
