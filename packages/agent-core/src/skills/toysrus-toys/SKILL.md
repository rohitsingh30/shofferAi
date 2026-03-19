---
name: toysrus-toys
description: Buy toys on Toys"R"Us India — browse by age, category, brand, add to cart, checkout, pay.
triggers:
  - toysrus
  - toys r us
  - toys"r"us
  - order from toysrus
  - buy toys online
  - toysrus order
  - kids toys india
  - toys r us india
siteUrl: https://www.toysrus.co.in
requiresAuth: true
params:
  - name: items
    required: true
    hint: What to buy (e.g. "LEGO set for 8 year old", "Barbie doll", "Hot Wheels track")
  - name: age_group
    required: false
    hint: Child's age (e.g. "3-5 years", "8-10 years", "toddler")
  - name: budget
    required: false
    hint: Max price (e.g. "under 2000", "budget 5000")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, wallet)
---

# Toys"R"Us India Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm what the user wants to buy. If vague, use `ask_user` to clarify (toy type, age range, brand, budget).
- Ask about the occasion if relevant (birthday, festival, return gift).
- If age not provided, ask via `ask_user` (input_type "freetext"): "What is the child's age? This helps pick age-appropriate toys."
- Note any brand preferences (LEGO, Barbie, Hot Wheels, Nerf, Fisher-Price, etc.).

### 2. Open Toys"R"Us in a NEW Tab & Verify Login
- Open a NEW tab and navigate to `https://www.toysrus.co.in`.
- Take snapshot. Close any popup/banner if it appears.
- Verify logged in (account icon or name in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Browse & Search Toys
- Use the search bar to search for the requested toy.
- Take snapshot of results page.
- Apply filters: age group, price range if budget specified, brand, category (action figures, dolls, building sets, board games, etc.).
- Extract top 3-5 options with: toy name, brand, price, age recommendation, rating.
- Use `ask_user` (input_type "choice") to present options. Format: "Toy Name — ₹X,XXX — Brand — Age: X-X years"
- If user wants more options, scroll or navigate to next page.

### 4. View Product Details
- Click selected toy.
- Take snapshot of product detail page.
- Extract: full name, brand, price, age recommendation, description, dimensions, delivery estimate, stock status.
- If product has variants (color, edition, size), present them via `ask_user` (input_type "choice").
- Check if gift wrapping is available — mention to user.
- Confirm: "Add [toy name] at ₹X,XXX to cart?"

### 5. Add to Cart & Check Offers
- Click "Add to Cart" or "Buy Now".
- Check for active offers (combo deals, buy 2 get 1, festive discounts).
- Apply best available coupon/offer.
- If user wants multiple toys, repeat steps 3-5 for each item.

### 6. Review Cart
- Open cart, take snapshot.
- Use `confirm_action` to present order summary:
  - Each item with name, brand, and price
  - Discount/coupon applied
  - Subtotal, delivery charges, total savings, total
  - Estimated delivery date
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 7. Checkout & Payment
- Proceed to checkout.
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with items, prices, discount, delivery charge, total
  - amount_inr: total amount (number)
  - description: "Toys R Us India order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 8. Place Order & Confirm
- Complete payment flow on site.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order number, items ordered, total paid, estimated delivery date.

## Site Notes

- Toys"R"Us India operates as an e-commerce site — inventory may differ from global TRU stores.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- Age recommendations are printed on toys — always match to the child's age for safety.
- Delivery typically 3-7 business days across India. Metro cities may get faster delivery.
- Free shipping usually above ₹499-999 depending on promotions.
- LEGO sets have age ratings and piece counts — always mention both.
- Festive seasons (Diwali, Christmas) see heavy discounts — check for active sales.
- COD may be available — but prefer online payment for faster processing.
- Some premium/imported toys may have longer delivery times — check individual product pages.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
