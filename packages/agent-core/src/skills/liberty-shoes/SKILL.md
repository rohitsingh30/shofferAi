---
name: liberty-shoes
description: Shop on Liberty Shoes — browse, select size, buy formal, casual, kids, and sports shoes, checkout, pay.
triggers:
  - liberty shoes
  - buy liberty shoes
  - order from liberty
  - liberty formal shoes
  - liberty casual shoes
  - buy shoes on liberty
  - liberty kids shoes
  - liberty school shoes
siteUrl: https://www.libertyshoes.com
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "formal shoes", "school shoes", "sandals", "loafers", "slippers")
  - name: size
    required: false
    hint: Shoe size (UK 6, UK 7, UK 8, UK 9)
  - name: gender
    required: false
    hint: Men, Women, Kids, or Boys/Girls
  - name: budget
    required: false
    hint: Max price (e.g. "under 3000", "budget 2k")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# Liberty Shoes Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What item to search for
2. **size** (type: "chip_bar", collapsed): Size — XS, S, M, L, XL, XXL
3. **budget** (type: "slider", collapsed): Budget range, min 200, max 10000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Clarify Requirements
- Confirm what the user wants: formal shoes, casual shoes, sports shoes, sandals, school shoes, or slippers.
- Use `ask_user` to clarify: product type (formal, casual, sports, sandals, school), gender/age group (men, women, boys, girls), size, color preference, budget range.
- Note any specific brand preferences within Liberty: Healers, Gliders, Force 10, Fortune, Coolers, Warrior.
- Ask about intended use: office/formal, daily wear, school, sports, home.

### 2. Open Liberty Shoes & Verify Login
- Open a NEW tab and navigate to `https://www.libertyshoes.com`.
- Take snapshot. Verify logged in (profile icon or account name visible in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product.
- Take snapshot of search results page.
- Apply filters if relevant: gender, price range, color, category (Formal, Casual, Sports, Sandals, School), brand (Healers, Gliders, Force 10), size.
- Extract top 3-5 options with: product name, sub-brand, price, color, category.
- Use `ask_user` (input_type "choice") to present options. Format: "Sub-brand — Product Name — ₹X,XXX — Color — Category"
- If user wants to see more, scroll or refine filters.

### 4. View Product Details
- Click selected product.
- Take snapshot of product page.
- Extract: product name, sub-brand, MRP, sale price, available sizes, available colors, material, sole type, delivery date.
- If product has multiple colors, present via `ask_user` (input_type "choice").
- Present available sizes via `ask_user` (input_type "choice") with UK sizing.
- Check stock availability for selected size.
- Confirm with user: "Add [Product] (Size UK X, Color) at ₹X,XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Cart".
- Go to cart, take snapshot.
- Check for any active promo codes or bundle offers.
- Use `confirm_action` to present order summary:
  - Product: sub-brand, name, color, size, material
  - Price: MRP, discount, subtotal
  - Delivery charges and estimated delivery date
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Checkout" or "Proceed to Buy".
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, sub-brand, size, color, price, delivery, total
  - amount_inr: total amount (number)
  - description: "Liberty Shoes order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product details (sub-brand, name, size, color), price paid, estimated delivery date.

## Site Notes

- Liberty uses UK sizing for all footwear. Always confirm size with the user before adding to cart.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- Liberty has multiple sub-brands: Healers (comfort), Gliders (women), Force 10 (sports), Fortune (formal), Coolers (sandals), Warrior (kids).
- Liberty is one of India's oldest footwear brands — excellent value for money, especially under ₹3,000.
- Free delivery on orders above a threshold (typically ₹999). COD available on most orders.
- Liberty school shoes are a major category — black formal shoes for boys and girls, velcro options for young kids.
- Liberty formal shoes are very popular for office wear — leather options at affordable prices.
- Return/exchange policy varies — check product page for specific terms.
- Liberty has 400+ retail stores across India — mention store locator if user prefers try-before-buy.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
- Liberty products are budget-friendly — most shoes are under ₹5,000.
