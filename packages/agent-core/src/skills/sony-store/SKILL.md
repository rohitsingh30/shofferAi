---
name: sony-store
description: Buy Sony products on Sony India — headphones, cameras, TVs, PS5, speakers, earbuds.
triggers:
  - sony
  - buy sony
  - sony store
  - order from sony
  - sony headphones
  - sony camera
  - sony tv
  - buy sony ps5
siteUrl: https://www.sony.co.in/
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "WH-1000XM5 headphones", "Sony A7 IV camera", "Bravia 65 inch TV", "PS5")
  - name: budget
    required: false
    hint: Max price (e.g. "under 30000", "budget 50k")
  - name: use_case
    required: false
    hint: Primary use (e.g. "music listening", "photography", "home theatre", "gaming")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, EMI)
---

# Sony India Store

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Clarify Requirements
- Confirm what the user wants to buy. If vague, use `ask_user` to clarify (product category — headphones/camera/TV/PS5/speaker, model, specs, budget).
- Note any specific requirements (ANC for headphones, sensor size for cameras, screen size for TVs, disc/digital for PS5).
- Recommend Sony series based on category: WH/WF (headphones/earbuds), Alpha (cameras), Bravia (TVs), SRS/HT (speakers/soundbars), PlayStation (gaming).

### 2. Open Sony Store & Verify Login
- Open a NEW tab and navigate to `https://store.sony.co.in/`.
- Take snapshot. Dismiss any cookie consent, notification prompts, or promotional banners.
- Verify logged in (account icon/name in top-right header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product, or navigate to the category (Headphones, Cameras, TVs, PlayStation, Speakers).
- Take snapshot of product listing page.
- Apply relevant filters if budget specified: price range, product type, features, rating.
- Extract top 3-5 options with: name, price, key specs (ANC/driver/resolution/sensor), color options, delivery info.
- Use `ask_user` (input_type "choice") to present options. Format: "Product Name — ₹X,XXX — Key Feature — Colors"
- If user wants to compare or see more options, scroll or go to next page.

### 4. View Product Details & Select Variant
- Click selected product.
- Take snapshot of product page.
- Extract: full name, price, MRP, discount %, key specs, bank offers, warranty, delivery date, included accessories.
- If product has color or edition variants, present them via `ask_user` (input_type "choice").
  - For cameras: body only vs kit lens options
  - For TVs: screen size variants (55/65/75/85 inch)
  - For PS5: Digital vs Disc Edition, bundle options
- Mention any active offers: "₹X cashback with HDFC card", "Bundle with extra controller", "No-cost EMI".
- Confirm with user: "Add [product] in [variant] at ₹X,XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Cart" or "Buy Now".
- Go to cart, take snapshot.
- Check for applicable coupon codes, bundle deals (accessories, extended warranty).
- Use `confirm_action` to present order summary:
  - Product name, variant/color, quantity
  - Included accessories/bundle items
  - Price, any discounts/offers applied
  - Warranty (standard + any extended)
  - Delivery date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, variant, price, delivery, warranty, accessories, total
  - amount_inr: total amount (number)
  - description: "Sony India store order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method on Sony store (UPI/card/COD/EMI as per user preference).
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product, variant, price paid, estimated delivery date, warranty details, included accessories.

## Site Notes

- Sony.co.in/store delivery: 3-7 business days. Free delivery on most products. Large items (TVs) may need installation scheduling.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Sony India store (store.sony.co.in) is separate from the info site (sony.co.in) — always navigate to the store for purchasing.
- Bank offers (cashback on HDFC, ICICI, SBI, Kotak) are very common — always check and mention.
- Sony Extended Warranty and Accidental Damage Protection available — present options during checkout.
- WH-1000XM5 and WF-1000XM5 are Sony's flagship ANC headphones/earbuds — recommend for premium audio.
- Alpha cameras: body-only vs kit options have significant price difference — clarify with user.
- Bravia TVs may require professional installation — Sony offers free installation in most cities.
- PS5 availability can be limited — if out of stock, inform user and suggest checking back or notify-me option.
- Sony products on official store come with official warranty — highlight advantage over grey market sellers.
- No-cost EMI available on products above ₹5,000 — always mention for high-value items like cameras and TVs.
- Sony Headphones Connect app enhances wireless audio products — mention post-purchase.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
