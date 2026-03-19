---
name: jbl-audio
description: Buy JBL speakers, headphones, and earbuds on JBL India — browse, compare, buy.
triggers:
  - jbl
  - buy jbl
  - jbl speaker
  - jbl store
  - order from jbl
  - jbl headphones
  - jbl earbuds
  - jbl india
siteUrl: https://www.jbl.com/in/
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "JBL Flip 6", "JBL Tune 770NC headphones", "JBL PartyBox 310")
  - name: budget
    required: false
    hint: Max price (e.g. "under 5000", "budget 10k")
  - name: use_case
    required: false
    hint: Primary use (e.g. "outdoor speaker", "gym earbuds", "home theatre", "travel headphones")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, EMI)
---

# JBL India Store

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Clarify Requirements
- Confirm what the user wants to buy. If vague, use `ask_user` to clarify (speaker/headphones/earbuds/soundbar, use case, budget).
- Note any specific requirements (wireless/wired, ANC, waterproof rating, battery life, portability, color).
- Recommend JBL series based on use case: Flip/Charge/Xtreme (portable speakers), Tune/Live/Tour (headphones/earbuds), PartyBox (party speakers), Bar (soundbars).

### 2. Open JBL Store & Verify Login
- Open a NEW tab and navigate to `https://www.jbl.com/in/`.
- Take snapshot. Dismiss any cookie consent or promotional popups.
- Verify logged in (account icon/name in top-right header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Browse & Select Product
- Navigate to the product category (Speakers, Headphones, Earbuds, Soundbars, Accessories) or use search bar.
- Take snapshot of product listing page.
- Apply relevant filters if budget specified: price range, product type, features (ANC, waterproof, wireless).
- Extract top 3-5 options with: name, price, type, key features (ANC, IP rating, battery life, driver size), colors.
- Use `ask_user` (input_type "choice") to present options. Format: "Product Name — ₹X,XXX — ANC/IP67/20hr battery — Colors"
- If user wants to compare or see more options, scroll or go to next page.

### 4. View Product Details & Select Variant
- Click selected product.
- Take snapshot of product page.
- Extract: full name, price, MRP, discount %, key specs (driver size, frequency response, battery, IP rating, ANC, connectivity), warranty, delivery date.
- If product has color variants, present them via `ask_user` (input_type "choice").
- Mention any active offers: "₹X off on JBL.com", "Bank cashback", "Bundle with case".
- Confirm with user: "Add [product] in [color] at ₹X,XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Cart".
- Go to cart, take snapshot.
- Check for applicable coupon codes or bundle offers (carrying case, charging cable).
- Use `confirm_action` to present order summary:
  - Product name, color variant, quantity
  - Price, any discounts applied
  - Delivery date and charges
  - Warranty (1yr standard)
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, color, price, delivery, warranty, total
  - amount_inr: total amount (number)
  - description: "JBL India store order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method on JBL.com (UPI/card/COD/EMI as per user preference).
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product, color, price paid, estimated delivery date, warranty details.

## Site Notes

- JBL.com/in delivery: 3-7 business days. Free delivery on most products.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- JBL India store is powered by Harman — warranty and support is through Harman India.
- JBL.com prices may differ from Amazon/Flipkart — JBL store guarantees genuine products with official warranty.
- IP ratings matter: IP67 (waterproof/dustproof for outdoor), IPX4 (splash-proof for gym) — explain to user based on use case.
- ANC (Active Noise Cancellation) available on Live/Tour/Tune series headphones and earbuds — clarify if user needs it.
- PartyBox speakers are large/heavy — confirm delivery feasibility for user's location.
- Battery life varies significantly: earbuds 6-10hr, headphones 40-70hr, speakers 12-24hr — highlight based on product.
- JBL app compatibility: most wireless products work with JBL Headphones app for EQ customization — mention this.
- Refurbished/open-box products may be listed at discount — only recommend if user is budget-conscious.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
