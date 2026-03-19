---
name: forest-essentials
description: Buy luxury Ayurvedic beauty products on Forest Essentials — browse skincare, haircare, body care, select variants, checkout, pay.
triggers:
  - forest essentials
  - buy forest essentials
  - order forest essentials
  - luxury ayurvedic beauty
  - ayurvedic skincare
  - forest essentials face cream
  - luxury Indian beauty
  - buy ayurvedic products
siteUrl: https://www.forestessentialsindia.com
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "night cream", "kumkumadi oil", "soundarya serum", "jasmine body oil")
  - name: skin_type
    required: false
    hint: Skin type (e.g. "dry skin", "oily skin", "mature skin", "sensitive")
  - name: concern
    required: false
    hint: Specific concern (e.g. "anti-aging", "brightening", "hydration", "pigmentation")
  - name: budget
    required: false
    hint: Max price (e.g. "under 3000", "budget 5000")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, net banking)
---

# Forest Essentials Luxury Ayurvedic Beauty Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What product to search for
2. **budget** (type: "slider", collapsed): Budget range, min 100, max 50000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Gather Requirements
- Confirm what the user wants: skincare (creams, serums, oils, cleansers), haircare (oils, shampoos), body care (lotions, oils, soaps), or gifting.
- Use `ask_user` to clarify: specific skin concern (anti-aging, brightening, hydration), skin type, preferred ingredients (kumkumadi, saffron, sandalwood).
- Note budget — Forest Essentials is premium/luxury pricing (Rs 500-5000+ per item).
- Ask if this is a gift — Forest Essentials has curated gift boxes.

### 2. Open Forest Essentials & Verify Login
- Open a NEW tab and navigate to `https://www.forestessentialsindia.com`.
- Take snapshot. Verify logged in (account icon or name visible in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar or navigate by category (Skin Care, Hair Care, Body Care, Gifting).
- Take snapshot of results/category page.
- Apply filters if relevant: category, concern, price range, bestsellers.
- Extract top 3-5 options with: product name, collection, size, price, key Ayurvedic ingredients, bestseller badge if any.
- Use `ask_user` (input_type "choice") to present options. Format: "Forest Essentials [Product] [Size] — Rs X,XXX — Key: [Ayurvedic ingredients]"
- If user wants to see more, scroll or explore related categories.

### 4. View Product Details
- Click selected product.
- Take snapshot of product page.
- Extract: full name, collection, price, size options, Ayurvedic ingredients, how to use, suitable skin type, product description, reviews.
- If product has size variants (25ml, 50ml, 130ml), present options with prices via `ask_user` (input_type "choice").
- Highlight key Ayurvedic ingredients and their benefits (e.g. Kumkumadi for brightening, Sandalwood for soothing).
- Check for gift wrapping options if user mentioned gifting.
- Confirm with user: "Add [product] at Rs X,XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Cart" or "Add to Bag".
- Go to cart, take snapshot.
- Check for applicable offers (free samples, complimentary gift wrapping, minimum purchase offers).
- Apply any available promotion codes.
- Use `confirm_action` to present order summary:
  - Product: name, collection, size, key ingredients
  - Price: per item, any discounts, gift wrapping charge if added
  - Complimentary samples if included
  - Delivery date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, collection, size, price, delivery, total
  - amount_inr: total amount (number)
  - description: "Forest Essentials luxury beauty order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product (name, collection, size), price paid, estimated delivery date, samples included if any.

## Site Notes

- Forest Essentials delivery: 3-7 business days. Free shipping above Rs 1000 usually.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Forest Essentials is a luxury brand — prices start at Rs 500 and go up to Rs 10,000+. Set expectations with user.
- Bestsellers: Soundarya Radiance Cream, Kumkumadi Thailam, Jasmine Body Oil, Rasa Cleansers.
- Products use traditional Ayurvedic recipes with modern formulations — highlight heritage when presenting.
- Gift boxes and curated sets offer better value — suggest if user is buying multiple items or gifting.
- Complimentary samples are often included with orders — mention if visible during checkout.
- No COD on most orders — prepaid payment required.
- Returns accepted within 7 days for unused/unopened products only.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
