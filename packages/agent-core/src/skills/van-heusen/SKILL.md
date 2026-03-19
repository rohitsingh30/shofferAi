---
name: van-heusen
description: Shop formal and casual wear on Van Heusen — browse formal shirts, suits, trousers, casual wear, innerwear for men and women, checkout, pay.
triggers:
  - van heusen
  - buy on van heusen
  - order from van heusen
  - van heusen shirt
  - van heusen suit
  - van heusen formal
  - van heusen shopping
  - van heusen women
siteUrl: https://www.vanheusen.com
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "formal white shirt", "slim fit suit", "casual polo", "women's blouse", "blazer")
  - name: gender
    required: false
    hint: Men or Women (Van Heusen has both lines)
  - name: size
    required: false
    hint: Size preference (38, 40, 42, 44 for shirts/suits, S, M, L, XL, or waist size 30, 32, 34)
  - name: color
    required: false
    hint: Color preference (e.g. "white", "light blue", "charcoal", "navy", "black")
  - name: fit
    required: false
    hint: Fit preference (slim, regular, ultra slim, tailored)
  - name: budget
    required: false
    hint: Max price (e.g. "under 3000", "budget 5k")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, net banking)
---

# Van Heusen — Formal & Casual Wear

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Clarify Requirements
- Confirm what the user wants: formal shirts, suits, blazers, trousers, casual wear, innerwear, or accessories.
- Use `ask_user` to clarify: gender (men/women), occasion (office, interview, formal event, casual), fit (slim, regular, ultra slim, tailored), fabric (cotton, linen, wrinkle-free), size, color, budget.
- Van Heusen is a premium formal brand under Aditya Birla — positioned above Peter England, below Louis Philippe.
- Also has Van Heusen Woman, Van Heusen Innerwear, and Van Heusen Athleisure lines.

### 2. Open Van Heusen & Verify Login
- Open a NEW tab and navigate to `https://www.vanheusen.com`.
- Take snapshot. Verify logged in (account icon or name in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product.
- Take snapshot of search results page.
- Apply filters: gender, category, price range, size, color, fit, fabric, pattern, occasion.
- Van Heusen runs seasonal offers and bundle deals — check active promotions.
- Extract top 3-5 options with: product name, price (MRP vs discounted), discount %, fabric, fit, pattern.
- Use `ask_user` (input_type "choice") to present options. Format: "Product Name — ₹X,XXX (XX% off) — Fabric — Fit"
- If user wants to see more, scroll or change filters.

### 4. View Product & Select Variants
- Click selected product.
- Take snapshot of product page.
- Extract: product name, price, MRP, discount, fabric, fit type, pattern, collar type, available sizes, available colors, wash care, delivery date, return policy.
- If product has color variants, present via `ask_user` (input_type "choice").
- If size not provided, present available sizes via `ask_user` (input_type "choice").
- Van Heusen has detailed size guides — suggest checking if user is unsure about fit.
- Check for combo/bundle offers.
- Confirm with user: "Add [product] at ₹X,XXX to bag?"

### 5. Add to Bag & Review
- Click "Add to Bag".
- Go to bag/cart, take snapshot.
- Check for applicable coupon codes or active promotions.
- Apply best coupon or offer available.
- Use `confirm_action` to present order summary:
  - Product: name, size, color, fit, fabric, pattern
  - Price: MRP, discount, coupon savings, final price
  - Delivery date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Proceed to Checkout".
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, size, color, fit, price, coupon, delivery, total
  - amount_inr: total amount (number)
  - description: "Van Heusen fashion order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product (name, size, color, fit), price paid, estimated delivery date, return window.

## Site Notes

- Van Heusen is a premium Aditya Birla brand — positioned for professionals who want quality formal and business wear.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- Premium mid-range pricing (₹1,299 - ₹12,999 typically) — higher quality than Peter England, more accessible than Louis Philippe.
- Van Heusen Flex and Wrinkle-Free lines are popular — mention for busy professionals.
- Frequent bundle offers: "Buy 2 at ₹X,XXX", "Flat 40% off" — always check promotions.
- Free delivery usually above ₹999. Below that, delivery charges apply.
- Return policy: 7-day easy returns. Items must be unworn with tags attached.
- COD available on most orders — mention if user prefers cash on delivery.
- Van Heusen Woman line has office-appropriate western wear — mention for women shoppers.
- Suit sizing: 36-46 (chest in inches). Always recommend checking the size guide for suits and blazers.
- Use `confirm_action` for bag review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
