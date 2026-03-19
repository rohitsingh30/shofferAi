---
name: samsung-store
description: Buy Samsung products on Samsung India — phones, TVs, appliances, tablets, wearables.
triggers:
  - samsung
  - buy samsung
  - samsung store
  - order from samsung
  - samsung phone
  - samsung tv
  - buy from samsung store
  - samsung india
siteUrl: https://www.samsung.com/in/
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "Galaxy S25 Ultra", "55 inch QLED TV", "Galaxy Watch 7")
  - name: budget
    required: false
    hint: Max price (e.g. "under 50000", "budget 30k")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, EMI, Samsung Finance+)
---

# Samsung India Store

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Clarify Requirements
- Confirm what the user wants to buy. If vague, use `ask_user` to clarify (product category, model, color, storage, budget).
- Note any specific requirements (RAM, storage, screen size, color, variant).

### 2. Open Samsung Store & Verify Login
- Open a NEW tab and navigate to `https://www.samsung.com/in/`.
- Take snapshot. Dismiss any cookie consent or promotional popups.
- Verify logged in (Samsung account icon shows profile/name in top-right).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product.
- Take snapshot of search results page.
- Apply relevant filters if budget specified (price range). Filter by category if needed (phones, TVs, etc.).
- Extract top 3-5 options with: name, price (MRP vs offer price), key specs, color options, any bank offers.
- Use `ask_user` (input_type "choice") to present options. Format: "Product Name — ₹X,XXX — Key Spec — Color"
- If user wants to see more, scroll or go to next page.

### 4. View Product Details
- Click selected product.
- Take snapshot of product page.
- Extract: full name, price, MRP, discount %, bank offers, exchange bonus, delivery date, EMI options, warranty.
- If product has variants (color, storage, RAM), present them via `ask_user` (input_type "choice").
- Mention any active offers: "Save ₹X with HDFC card", "Exchange bonus up to ₹X", "No-cost EMI available".
- Confirm with user: "Add [product] at ₹X,XXX to cart?"

### 5. Add to Cart & Review
- Click "Buy Now" or "Add to Cart".
- Go to cart, take snapshot.
- Check for applicable coupons or promo codes — apply if visible.
- Use `confirm_action` to present order summary:
  - Product name, variant (color/storage), quantity
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
  - description: "Samsung India store order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method on Samsung.com (UPI/card/COD/EMI/Samsung Finance+ as per user preference).
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product, variant, price paid, estimated delivery date, warranty details.

## Site Notes

- Samsung.com/in delivery: 2-5 business days for most products. Free delivery on most items.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Samsung frequently shows "Notify Me" instead of "Buy Now" for out-of-stock items — inform user if unavailable.
- Bank offers (cashback on HDFC, ICICI, SBI cards) are very common — always check and mention.
- Samsung Finance+ offers no-cost EMI and instant approval — mention if user interested in EMI.
- Exchange offers available on phones and some appliances — ask user if they have a device to exchange.
- Samsung Care+ (extended warranty) is offered during checkout — inform user of the option and cost.
- Products may have "Samsung Exclusive" colors only available on samsung.com — highlight these.
- Student/corporate discounts may apply — check if any active education offers.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
