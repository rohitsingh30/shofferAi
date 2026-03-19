---
name: purplle-beauty
description: Buy beauty and skincare products on Purplle — search, compare, apply offers, add to bag, checkout and pay.
triggers:
  - purplle
  - buy on purplle
  - purplle beauty
  - purplle skincare
  - order from purplle
  - buy skincare online
  - purplle makeup
  - purplle cosmetics
siteUrl: https://www.purplle.com
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "sunscreen SPF 50", "face wash for oily skin", "lipstick", "serum")
  - name: brand
    required: false
    hint: Preferred brand (e.g. "Minimalist", "Good Vibes", "Mamaearth", "Plum")
  - name: skin_type
    required: false
    hint: Skin type or concern (e.g. "oily", "dry", "acne-prone", "sensitive", "anti-aging")
  - name: budget
    required: false
    hint: Budget range (e.g. "under 500", "under 1000")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, wallet)
---

# Purplle Beauty & Skincare Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What product to search for
2. **budget** (type: "slider", collapsed): Budget range, min 100, max 50000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Gather Requirements
- Confirm what the user wants to buy. Use `ask_user` to clarify:
  - Category: Skincare, makeup, haircare, fragrance, personal care, bath & body.
  - Specific product type: moisturizer, serum, sunscreen, foundation, lipstick, shampoo, etc.
  - Skin type/concern: oily, dry, combination, sensitive, acne-prone, pigmentation, anti-aging.
  - Brand preference: Minimalist, Mamaearth, Plum, Good Vibes, Dot & Key, Cetaphil, etc.
  - Budget range.
- If user is unsure, recommend based on concern:
  - Acne → Salicylic acid face wash, niacinamide serum
  - Dry skin → Hyaluronic acid serum, ceramide moisturizer
  - Pigmentation → Vitamin C serum, alpha arbutin
  - Anti-aging → Retinol serum, peptide cream

### 2. Open Purplle & Verify Login
- Open a NEW tab and navigate to `https://www.purplle.com`.
- Take snapshot. Verify logged in (profile icon or name visible in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Dismiss any promotional popups, app-install banners, or notification prompts.

### 3. Search & Browse Products
- Use the search bar to search for the product.
- Take snapshot of search results page.
- Apply filters: brand, price range, rating (4+ stars), discount, skin type, concern.
- Sort by relevance, popularity, or price as per user preference.
- Extract top 4-6 options with: brand, name, size, price (MRP vs discounted), rating, review count, discount %, key ingredients.
- Use `ask_user` (input_type "choice") to present options:
  - "Minimalist 10% Niacinamide Serum — 30ml — ₹XXX (XX% off) — ⭐ 4.X (X,XXX reviews)"
  - "Mamaearth Vitamin C Face Wash — 150ml — ₹XXX (XX% off) — ⭐ 4.X"
  - "Plum Green Tea Moisturizer — 50ml — ₹XXX — ⭐ 4.X — For oily skin"
- If user wants to compare, present side-by-side details of 2-3 products.

### 4. View Product Details
- Click on selected product.
- Take snapshot of product page.
- Extract detailed information:
  - Brand, full name, size/volume
  - Price, MRP, discount percentage
  - Key ingredients list and their benefits
  - Skin type suitability
  - Rating, number of reviews, review highlights
  - Shade/variant options (for makeup)
  - Size variants (30ml, 50ml, 100ml)
  - How to use instructions
  - Shelf life / expiry
  - Return policy
- If product has shade variants (lipstick, foundation), present top shades via `ask_user` (input_type "choice").
- If product has size variants, present options with prices.
- Mention active offers: "Buy 2 get 1 free", "Extra 10% off with code", "Combo deal available".
- Confirm with user: "Add [product] at ₹XXX to bag?"

### 5. Add to Bag & Review
- Click "Add to Bag".
- Go to bag/cart, take snapshot.
- Check for applicable coupons and offers:
  - Site-wide coupons (e.g. "FLAT20" for 20% off)
  - Combo offers (buy 2 from same brand, get discount)
  - Free product with purchase
  - Bank offers
- Apply the best coupon/offer.
- Use `confirm_action` to present order summary:
  - Product: brand, name, size/shade
  - Price: MRP, discount, coupon savings, final price
  - Free gifts or samples if any
  - Delivery: estimated date and charges
  - Free delivery threshold (typically ₹399 or ₹499)
  - Total amount
- If order is below free delivery threshold, suggest adding another item.
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Review final amount with delivery charges.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, brand, size, shade, price, coupon, delivery, total
  - amount_inr: total amount (number)
  - description: "Purplle beauty order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method (UPI/card/COD/wallet).
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product (brand, name, size, shade), price paid, coupon applied, estimated delivery date, free samples if any.
- Mention: "Check your email for order confirmation and tracking details."

## Site Notes

- Purplle delivery: 3-7 business days. Free delivery above ₹399 (threshold may vary).
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Purplle has aggressive discounting — always check for coupons before checkout. Common codes: FLAT20, PURPLLE15, NEW200.
- Purplle Elite membership: extra discounts and free delivery — apply if available.
- Purplle's "Beauty Advice" section has product recommendations by skin type — use for suggestions.
- Combo/bundle deals are very common — "Buy 2 Get 1", "Buy 3 at ₹999" — mention if applicable.
- Many products have detailed ingredient lists — useful for users with allergies or preferences (paraben-free, sulfate-free, cruelty-free).
- Shade matching for makeup: Purplle provides shade descriptions and user photos in reviews — use for guidance.
- COD available on most orders with a small convenience fee (₹30-50).
- Return policy: 15-day easy return for most products. Opened products may not be returnable.
- Purplle vs Nykaa: Purplle often has lower prices and more aggressive offers — mention savings if user compares.
- Use `confirm_action` for bag review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
