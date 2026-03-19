---
name: nykaa-man
description: Buy men's grooming products on Nykaa Man — beard care, skincare, perfume, haircare, add to cart, checkout, pay.
triggers:
  - nykaa man
  - nykaa men
  - buy men's grooming
  - men's skincare
  - buy beard oil
  - men's perfume online
  - buy aftershave
  - nykaa man grooming
siteUrl: https://www.nykaaman.com
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "beard oil", "men's face wash", "perfume for men", "hair wax")
  - name: brand
    required: false
    hint: Preferred brand (e.g. "Beardo", "Bombay Shaving Company", "Park Avenue", "Ustraa")
  - name: concern
    required: false
    hint: Grooming concern (e.g. "beard growth", "oily skin", "dandruff", "body odor")
  - name: budget
    required: false
    hint: Max price (e.g. "under 1000", "budget 500")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, wallet)
---

# Nykaa Man — Men's Grooming Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm what the user wants: beard care, skincare, haircare, fragrance/perfume, bath & body, or shaving.
- Use `ask_user` to clarify: specific product type, brand preference, skin/hair concern, fragrance notes preference.
- Note budget constraints — men's grooming ranges from budget (Rs 200) to premium (Rs 5000+).
- If fragrance, ask about preferred notes (woody, citrus, aqua, musky) and occasion (daily, formal, date night).

### 2. Open Nykaa Man & Verify Login
- Open a NEW tab and navigate to `https://www.nykaaman.com`.
- Take snapshot. Verify logged in (profile icon or account name visible in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product.
- Take snapshot of search results page.
- Apply filters if relevant: brand, price range, rating (4+ stars), discount, category.
- Sort by popularity or relevance unless user specifies price sorting.
- Extract top 3-5 options with: brand, product name, size, price (MRP vs discounted), rating, review count, discount %.
- Use `ask_user` (input_type "choice") to present options. Format: "Brand [Product] [Size] — Rs XXX (XX% off) — Rating X.X (X reviews)"
- If user wants to see more, scroll or refine filters.

### 4. View Product Details
- Click selected product.
- Take snapshot of product page.
- Extract: brand, full name, price, MRP, discount, size/variant options, key ingredients, fragrance notes (for perfumes), rating, review highlights, suitable for (skin/hair type).
- If product has size variants (50ml, 100ml, 200ml), present options with prices via `ask_user` (input_type "choice").
- If fragrance, extract top/middle/base notes and describe the scent profile.
- Check for combo offers (beard kit, grooming set) and inform user.
- Confirm with user: "Add [product] at Rs XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Bag".
- Go to bag/cart, take snapshot.
- Check for applicable coupons and Nykaa Man offers (combo deals, free samples, bank offers).
- Apply best coupon if available.
- Use `confirm_action` to present order summary:
  - Product: brand, name, size/variant
  - Price: MRP, discount, coupon savings, final price
  - Free samples or gifts if any
  - Delivery date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, brand, size, price, delivery, total
  - amount_inr: total amount (number)
  - description: "Nykaa Man grooming order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product (brand, name, size), price paid, estimated delivery date, free samples if any.

## Site Notes

- Nykaa Man delivery: 2-7 days depending on location. Free delivery above Rs 350 usually.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Nykaa Man is the men's grooming vertical of Nykaa — separate site from Nykaa Beauty.
- Popular brands: Beardo, Bombay Shaving Company, Ustraa, Man Arden, Park Avenue, Wild Stone.
- Beard care is a top category — beard oil, wax, wash, growth serum are popular searches.
- Fragrance section is strong — present perfume notes (top/middle/base) when recommending.
- Nykaa Privé loyalty points may apply if the account is Privé — check and apply.
- Combo kits (beard kit, skincare routine set) often offer 20-30% savings over individual items.
- COD available on most orders — mention if user prefers.
- Return policy: 15 days for unused/unopened products; fragrances may be non-returnable.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
