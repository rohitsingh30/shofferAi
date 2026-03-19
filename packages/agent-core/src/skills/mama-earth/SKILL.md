---
name: mama-earth
description: Buy natural skincare and haircare on Mamaearth — browse toxin-free products, select variants, add to cart, checkout, pay.
triggers:
  - mamaearth
  - mama earth
  - buy mamaearth
  - order mamaearth
  - natural skincare
  - toxin free products
  - mamaearth face wash
  - buy natural haircare
siteUrl: https://mamaearth.in
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "Vitamin C face wash", "onion hair oil", "ubtan face mask", "baby shampoo")
  - name: skin_type
    required: false
    hint: Skin or hair type (e.g. "oily skin", "dry hair", "sensitive skin", "combination")
  - name: concern
    required: false
    hint: Specific concern (e.g. "dark spots", "hair fall", "acne", "anti-aging")
  - name: budget
    required: false
    hint: Max price (e.g. "under 500", "budget 1000")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, wallet)
---

# Mamaearth Natural Skincare & Haircare Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What product to search for
2. **budget** (type: "slider", collapsed): Budget range, min 100, max 50000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Gather Requirements
- Confirm what the user wants: skincare (face wash, serum, moisturizer, sunscreen), haircare (shampoo, oil, conditioner), baby care, or body care.
- Use `ask_user` to clarify: specific concern (acne, pigmentation, hair fall, dryness), skin/hair type, ingredient preference.
- Note budget constraints and any allergies or sensitivities.
- Mamaearth has range-based collections (Vitamin C, Tea Tree, Onion, Ubtan) — ask which range if user is unsure.

### 2. Open Mamaearth & Verify Login
- Open a NEW tab and navigate to `https://mamaearth.in`.
- Take snapshot. Verify logged in (profile icon or account name visible in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product.
- Take snapshot of search results page.
- Apply filters if relevant: category, concern, price range, rating, bestsellers.
- Extract top 3-5 options with: product name, range (Vitamin C, Onion, etc.), size, price (MRP vs discounted), rating, key ingredients.
- Use `ask_user` (input_type "choice") to present options. Format: "Mamaearth [Range] [Product] [Size] — Rs XXX (XX% off) — Rating X.X — Key: [ingredients]"
- If user wants to see more, scroll or refine search.

### 4. View Product Details
- Click selected product.
- Take snapshot of product page.
- Extract: full name, range, price, MRP, discount, size/variant options, key ingredients, Made Safe certified badge, rating, reviews count, suitable for (skin/hair type).
- If product has size variants (50ml, 100ml, 250ml), present sizes with prices via `ask_user` (input_type "choice").
- Check for combo offers (buy 2 at discount, range kits) and inform user.
- Highlight "Made Safe" certification and toxin-free claims.
- Confirm with user: "Add [product] at Rs XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Cart".
- Go to cart, take snapshot.
- Check for applicable coupons and Mamaearth offers (combo discounts, free product on minimum spend).
- Apply best coupon if available.
- Use `confirm_action` to present order summary:
  - Product: name, range, size, key ingredients
  - Price: MRP, discount, coupon savings, final price
  - Free gifts or samples if any
  - Delivery date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout page.
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, range, size, price, delivery, total
  - amount_inr: total amount (number)
  - description: "Mamaearth order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product (name, range, size), price paid, estimated delivery date, free samples if any.

## Site Notes

- Mamaearth delivery: 3-7 days depending on location. Free delivery above Rs 399 usually.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Mamaearth products are "Made Safe" certified — highlight this when presenting products.
- All products claim to be toxin-free (no parabens, SLS, mineral oil) — mention this for health-conscious users.
- Mamaearth frequently runs BOGO and combo deals — always check before checkout.
- Popular ranges: Vitamin C (brightening), Onion (hair fall), Tea Tree (acne), Ubtan (glow), Rice (hydration).
- Baby care is a strong category — if user asks for baby products, navigate to baby section.
- COD available on most orders — mention if user prefers.
- Return policy: 15 days from delivery for unused/unopened products.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
