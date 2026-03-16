---
name: flipkart-shopping
description: Shop on Flipkart — search products, compare options, add to cart, checkout, pay.
triggers:
  - flipkart
  - order from flipkart
  - buy on flipkart
  - flipkart order
  - shop on flipkart
  - buy from flipkart
siteUrl: https://www.flipkart.com
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "iPhone 16", "Samsung TV 55 inch", "running shoes")
  - name: budget
    required: false
    hint: Max price (e.g. "under 20000", "budget 5k")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, EMI)
---

# Flipkart Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Clarify Requirements
- Confirm what the user wants to buy. If vague, use `ask_user` to clarify (brand preference, size, color, budget).
- Note any specific requirements (storage, RAM, size, color, etc.).

### 2. Open Flipkart & Verify Login
- Open a NEW tab and navigate to `https://www.flipkart.com`.
- Take snapshot. Close any login popup if it appears.
- Verify logged in (username in top header bar).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product.
- Take snapshot of search results page.
- Apply relevant filters if budget specified (price range), or if user mentioned specs (brand, rating 4+, etc.).
- Extract top 3-5 options with: name, price, rating, key specs, delivery date, any offers/discounts.
- Use `ask_user` (input_type "choice") to present options. Format: "Product Name — ₹X,XXX — ⭐ Rating — Key Spec"
- If user wants to see more, scroll or go to next page.

### 4. View Product Details
- Click selected product. Handle new tab if opened.
- Take snapshot of product page.
- Extract: full name, price, offers (bank discount, exchange), delivery date, seller info, warranty.
- If product has variants (color, storage, size), present them via `ask_user` (input_type "choice").
- Confirm with user: "Add [product] at ₹X,XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Cart".
- Go to cart, take snapshot.
- Use `confirm_action` to present order summary:
  - Product name, variant, quantity
  - Price, any discounts/offers applied
  - Delivery date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Place Order" in cart.
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, price, delivery, total
  - amount_inr: total amount (number)
  - description: "Flipkart order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product, price paid, estimated delivery date, seller.

## Site Notes

- Flipkart delivery: 1-7 days depending on product and location. Flipkart Plus may offer faster delivery.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- Flipkart often opens product pages in new tabs — handle tab switching.
- Bank offers (10% off on HDFC, etc.) are common — mention if applicable.
- SuperCoins may be redeemable — apply if available.
- EMI options available on cards — inform user if relevant.
- Exchange offers on phones/electronics — ask user if they have a device to exchange.
- Flipkart Plus members get free delivery and early access.
- Product prices may include "effective price" after bank offers — clarify actual vs effective.
- Seller matters for warranty/returns — prefer Flipkart-assured or RetailNet sellers.
- Login popup appears frequently — dismiss with X button.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
