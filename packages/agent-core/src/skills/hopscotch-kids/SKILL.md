---
name: hopscotch-kids
description: Buy kids clothing on Hopscotch — browse by age, gender, category, add to cart, checkout, pay.
triggers:
  - hopscotch
  - hopscotch kids
  - buy kids clothes
  - kids clothing online
  - order from hopscotch
  - children clothing
  - kids fashion
  - hopscotch order
siteUrl: https://www.hopscotch.in
requiresAuth: true
params:
  - name: items
    required: true
    hint: What to buy (e.g. "girls dress 3-4 years", "boys t-shirt size 5-6", "baby romper 0-6 months")
  - name: age_group
    required: false
    hint: Child's age (e.g. "2-3 years", "6-8 years", "newborn")
  - name: gender
    required: false
    hint: Boy, girl, or unisex
  - name: budget
    required: false
    hint: Max price (e.g. "under 500", "budget 1000")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, wallet)
---

# Hopscotch Kids Clothing

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm what the user wants to buy. If vague, use `ask_user` to clarify (clothing type, age, gender, size, budget).
- Note any specific preferences (brand, color, pattern, material).
- If age/gender not provided, ask via `ask_user` (input_type "freetext"): "What is the child's age and gender?"

### 2. Open Hopscotch in a NEW Tab & Verify Login
- Open a NEW tab and navigate to `https://www.hopscotch.in`.
- Take snapshot. Close any popup/banner if it appears.
- Verify logged in (account icon or name in top header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the requested clothing item.
- Take snapshot of results page.
- Apply filters: age group, gender, price range if budget specified, category.
- Extract top 3-5 options with: product name, price (MRP vs sale), size range, brand, rating.
- Use `ask_user` (input_type "choice") to present options. Format: "Product Name — ₹X,XXX — Age Range — Brand"
- If user wants more options, scroll or go to next page.

### 4. View Product Details & Select Size
- Click selected product.
- Take snapshot of product detail page.
- Extract: full name, price, available sizes, material, wash care, delivery estimate.
- If multiple sizes available, present them via `ask_user` (input_type "choice").
- For clothing, ALWAYS confirm size with user before adding to cart.
- Confirm: "Add [product] size [X] at ₹X,XXX to cart?"

### 5. Add to Cart & Apply Offers
- Click "Add to Cart" or "Add to Bag".
- Check for available coupons or sale offers — Hopscotch frequently runs flash sales.
- Apply best available coupon/discount code.
- If user wants multiple items, repeat steps 3-5 for each item.

### 6. Review Cart
- Open cart, take snapshot.
- Use `confirm_action` to present order summary:
  - Each item with name, size, color, and price
  - Discount/coupon applied
  - Subtotal, delivery charges, total savings, total
  - Estimated delivery date
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 7. Checkout & Payment
- Proceed to checkout.
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with items, sizes, prices, discount, delivery charge, total
  - amount_inr: total amount (number)
  - description: "Hopscotch kids clothing order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 8. Place Order & Confirm
- Complete payment flow on site.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order number, items ordered with sizes, total paid, estimated delivery date.

## Site Notes

- Hopscotch is a kids-focused fashion platform — sizes are mapped by age (0-3m, 3-6m, 6-12m, 1-2y, 2-3y, etc.).
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- Hopscotch runs heavy flash sales (up to 70% off) — always check active offers before checkout.
- Free delivery usually above ₹500. Below that, delivery charges ₹50-99.
- Return/exchange policy is 15 days for most items — mention if buying gifts.
- Size chart varies by brand — always check individual product size chart.
- Hopscotch curates from multiple brands — quality and sizing may vary between brands.
- COD available but may have extra charges — prefer online payment.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
