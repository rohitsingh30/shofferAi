---
name: max-fashion
description: Shop on Max Fashion India — buy affordable clothing, footwear, accessories for the whole family, checkout, pay.
triggers:
  - max fashion
  - buy from max
  - order from max fashion
  - max fashion shopping
  - max clothing
  - buy clothes max
  - max fashion india
  - max online shopping
siteUrl: https://www.maxfashion.in
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "men's t-shirt", "kids' dress", "women's jeans", "casual shoes")
  - name: size
    required: false
    hint: Size preference (XS, S, M, L, XL, XXL, or shoe size)
  - name: budget
    required: false
    hint: Max price (e.g. "under 1000", "budget 500")
  - name: gender
    required: false
    hint: Gender/age group (men, women, boys, girls, infants)
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# Max Fashion Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Clarify Requirements
- Confirm what the user wants: clothing, footwear, accessories, innerwear, or sleepwear.
- Use `ask_user` to clarify: gender/age group (men, women, boys, girls, infants), occasion (casual, ethnic, party), style, color, size, budget.
- Note any specific requirements (fabric type, pattern, fit, seasonal needs).

### 2. Open Max Fashion & Verify Login
- Open a NEW tab and navigate to `https://www.maxfashion.in`.
- Take snapshot. Verify logged in (user name or account icon visible in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar or navigate to appropriate category (Women, Men, Boys, Girls, Infants).
- Take snapshot of search results or category page.
- Apply filters if relevant: price range, category, size, color, pattern, discount, new arrivals.
- Extract top 3-5 options with: name, price, MRP, discount %, color, key details (fabric, fit).
- Use `ask_user` (input_type "choice") to present options. Format: "Product Name — ₹XXX (XX% off) — Color — Fabric/Fit"
- Max is known for value — most items are under ₹1,500. Highlight deals and combos.
- If user wants to see more, scroll or browse different section.

### 4. View Product & Select Size
- Click selected product.
- Take snapshot of product page.
- Extract: full name, price, MRP, discount, available sizes, colors, fabric composition, fit type, care instructions, delivery date.
- If size not provided by user, present available sizes via `ask_user` (input_type "choice").
- Check size availability. Suggest alternatives if selected size is out of stock.
- If product has color variants, present them via `ask_user` (input_type "choice").
- Select size and color.
- Confirm with user: "Add [product] (Size [X], [Color]) at ₹XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Cart" or "Add to Bag".
- Go to cart, take snapshot.
- Check for combo offers (Max frequently has "Buy 2 Get 1 Free", "3 for ₹999" deals).
- Suggest adding more items if combo offer is available and user may benefit.
- Apply coupon if available.
- Use `confirm_action` to present order summary:
  - Product(s): name, size, color
  - Price per item, combo discount (if any)
  - Delivery date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Proceed to Checkout" or "Place Order".
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product(s), sizes, prices, combo deal, delivery, total
  - amount_inr: total amount (number)
  - description: "Max Fashion order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product(s) (name, size, color), price paid, combo deal applied, estimated delivery date.

## Site Notes

- Max Fashion delivery: 3-7 days depending on location. Tier 2/3 cities may take longer.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- Max Fashion (Landmark Group) is one of India's largest value fashion retailers — prices are very competitive.
- Combo offers are Max's strength: "Buy 2 Get 1 Free", "3 for ₹999" — always check and suggest.
- Free delivery above ₹499 typically. Below that, delivery charges of ₹49-99.
- Return/exchange within 15 days on most items (unworn, tags intact, original packaging).
- Max has a strong kids' collection — popular for children's clothing at affordable prices.
- COD (Cash on Delivery) available on most orders — mention if user prefers.
- Max Privilege Card holders get extra discounts — check if account has membership.
- Seasonal sales (EOSS) offer up to 50-70% off — check for active sale period.
- Max stores are available for in-store pickup in some cities — mention if relevant.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
