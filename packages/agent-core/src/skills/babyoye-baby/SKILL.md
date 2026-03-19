---
name: babyoye-baby
description: Buy baby products on Babyoye/FirstCry — diapers, baby food, gear, clothes, toys, checkout, pay.
triggers:
  - babyoye
  - baby oye
  - order from babyoye
  - babyoye order
  - buy baby products online
  - baby gear
  - baby stroller
  - baby essentials
siteUrl: https://www.babyoye.com
requiresAuth: true
params:
  - name: items
    required: true
    hint: What to buy (e.g. "baby stroller", "Pampers diapers Large", "baby feeding bottle set")
  - name: age_group
    required: false
    hint: Baby's age (e.g. "0-6 months", "1-2 years", "newborn")
  - name: address
    required: false
    hint: Delivery address or pincode
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, wallet)
---

# Babyoye Baby Products Ordering

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm what the user wants to buy. If vague, use `ask_user` to clarify (product type, brand preference, baby's age/weight).
- Note specific needs: for diapers — size and pack count; for food — stage/age; for gear — weight limit, type.
- If baby's age not provided, ask via `ask_user` (input_type "freetext"): "How old is the baby? This helps pick the right size/stage."

### 2. Open Babyoye in a NEW Tab & Verify Login
- Open a NEW tab and navigate to `https://www.babyoye.com`.
- Take snapshot. Note: Babyoye redirects to FirstCry for most products — handle the redirect.
- If pincode popup appears, enter user's pincode and confirm.
- Verify logged in (account/profile icon in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Select Products
For each item the user requested:
- Use the search bar to search for the item.
- Take snapshot of results.
- Check brand, size, age group, price, availability, and ratings.
- If multiple variants, present top 3-5 options:
  - Brand, product name, size/age range
  - Price (MRP vs sale price), discount percentage
  - Ratings and review count
- Use `ask_user` (input_type "choice") to let user pick.
- For diapers: confirm size (NB, S, M, L, XL, XXL) and pack count.
- For baby food: confirm stage/age and flavor.
- For gear (strollers, car seats): confirm weight range and features.
- Click "Add to Cart". Adjust quantity if user specified.
- If out of stock, inform user and suggest alternatives.
- Repeat for all items.

### 4. Apply Offers & Coupons
- Check for available coupons/offers on the cart page.
- Babyoye/FirstCry frequently runs combo offers and bulk discounts.
- Apply best available coupon automatically.
- Mention any combo deals (e.g. "Buy 2 Get 1 Free" on diapers).

### 5. Review Cart
- Open cart, take snapshot.
- Use `confirm_action` to present order summary:
  - Each item with brand, size, variant, quantity, and price
  - Discount/coupon applied
  - Subtotal, delivery charges, total savings, total
  - Estimated delivery date
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify delivery address is correct. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with items, prices, discount, delivery charge, total, estimated delivery
  - amount_inr: total amount (number)
  - description: "Babyoye baby products order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Place Order & Confirm
- Click "Place Order" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order number, items ordered with sizes, total paid, estimated delivery date.

## Site Notes

- Babyoye often redirects to FirstCry — both share inventory. Handle redirects gracefully.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- Babyoye/FirstCry runs frequent sales (50-80% off) — always check for active offers before checkout.
- Free delivery usually above ₹299-499 depending on product category.
- Diaper sizes: NB (up to 5kg), S (4-8kg), M (7-12kg), L (9-14kg), XL (12-17kg), XXL (15-25kg).
- Baby food stages: Stage 1 (6m+), Stage 2 (8m+), Stage 3 (10m+), Stage 4 (12m+).
- COD available but charges ₹49-99 extra — prefer online payment.
- 15-30 day return policy on most items. No returns on diapers/food once opened.
- Product authenticity guaranteed — all major brands (Pampers, Huggies, Cerelac, Chicco, Graco).
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
