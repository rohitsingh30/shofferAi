---
name: swiggy-instamart
description: Order groceries from Swiggy Instamart with 15-30 minute delivery.
triggers:
  - swiggy instamart
  - instamart
  - swiggy grocery
  - order from swiggy instamart
  - order from instamart
siteUrl: https://www.swiggy.com/instamart
requiresAuth: true
params:
  - name: items
    required: true
    hint: List of items to order
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# Swiggy Instamart Grocery Ordering

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Open Swiggy Instamart & Set Location
- Open a NEW tab and navigate to `https://www.swiggy.com/instamart`.
- Take snapshot. Verify logged in (account icon in header).
- If address not set, use the location selector to search for user's delivery address.
- If NOT logged in, login transparently using operator credentials via `fill_saved_credential`. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Confirm location set and products visible.

### 2. Find & Add Items
For each requested item:
- Search in search bar.
- Take snapshot of results.
- Identify correct product (brand, size, quantity).
- If multiple variants, use `ask_user` (input_type "choice").
- Click "Add" to cart.
- Repeat for all items.

### 3. Review & Checkout
- Open cart, take snapshot.
- Use `confirm_action` to present order summary with total price.
- Select payment method.
- Fill payment details via `fill_saved_credential`.
- Handle payment OTP if needed via `ask_user`.

### 4. Order Confirmation
- Take snapshot of confirmation page.
- Report: order number, items ordered, total paid, estimated delivery time.

## Site Notes

- Swiggy Instamart delivery: 15-30 minutes.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- Products may be out of stock — suggest alternatives.
- Swiggy One membership may offer discounts.
- Minimum order value may apply for free delivery.
