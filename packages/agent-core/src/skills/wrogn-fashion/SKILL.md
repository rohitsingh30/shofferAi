---
name: wrogn-fashion
description: Buy Virat Kohli's Wrogn fashion on wrogn.com — browse casual wear, streetwear, active wear, select size, checkout, pay.
triggers:
  - wrogn
  - buy wrogn
  - order from wrogn
  - wrogn fashion
  - virat kohli brand
  - wrogn t-shirt
  - wrogn clothing
  - buy streetwear
siteUrl: https://www.wrogn.com
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "casual t-shirt", "joggers", "hoodie", "shirt", "jacket")
  - name: size
    required: false
    hint: Size preference (S, M, L, XL, XXL)
  - name: color
    required: false
    hint: Color preference (e.g. "black", "white", "navy blue", "olive")
  - name: budget
    required: false
    hint: Max price (e.g. "under 1500", "budget 2000")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# Wrogn Fashion Shopping (Virat Kohli Brand)

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What item to search for
2. **size** (type: "chip_bar", collapsed): Size — XS, S, M, L, XL, XXL
3. **budget** (type: "slider", collapsed): Budget range, min 200, max 10000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Gather Requirements
- Confirm what the user wants: t-shirts, shirts, joggers, jeans, hoodies, jackets, or accessories.
- Use `ask_user` to clarify: style preference (casual, streetwear, active), color preference, occasion (daily, gym, going out).
- Note size preference. Wrogn uses standard sizing (S to XXL).
- Note budget — Wrogn is mid-premium pricing (Rs 500-3000 range).
- Ask if user has a sub-brand preference: WROGN (casual), WROGN ACTIVE (sportswear), WROGN YOUTH (younger styles).

### 2. Open Wrogn & Verify Login
- Open a NEW tab and navigate to `https://www.wrogn.com`.
- Take snapshot. Verify logged in (account icon or profile visible in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar or navigate by category (T-Shirts, Shirts, Bottoms, Winterwear, Active).
- Take snapshot of results/category page.
- Apply filters if relevant: size, color, price range, category, discount.
- Sort by popularity or new arrivals unless user specifies price sorting.
- Extract top 3-5 options with: product name, sub-brand, color, price (MRP vs discounted), discount %.
- Use `ask_user` (input_type "choice") to present options. Format: "WROGN [Product] — [Color] — Rs X,XXX (XX% off) — [Sub-brand]"
- If user wants to see more, scroll or explore other categories.

### 4. View Product & Select Size
- Click selected product.
- Take snapshot of product page.
- Extract: full name, sub-brand, color options, price, MRP, discount, available sizes, fabric, fit type (slim, regular, relaxed), wash care, delivery date.
- If size not provided by user, present available sizes via `ask_user` (input_type "choice").
- If multiple colors available, present color options via `ask_user` if user has not specified.
- Check size availability. If preferred size is sold out, suggest alternatives.
- Describe the style and design from the snapshot.

### 5. Add to Cart & Review
- Click "Add to Cart" or "Add to Bag".
- Go to cart, take snapshot.
- Check for applicable coupons and ongoing offers (seasonal sales, new user discounts).
- Apply best coupon if available.
- Use `confirm_action` to present order summary:
  - Product: name, sub-brand, color, size, fit
  - Price: MRP, discount, coupon savings, final price
  - Delivery date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, color, size, price, delivery, total
  - amount_inr: total amount (number)
  - description: "Wrogn fashion order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product (name, sub-brand, color, size, fit), price paid, estimated delivery date.

## Site Notes

- Wrogn delivery: 3-7 days depending on location. Free shipping above Rs 999 usually.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Wrogn is Virat Kohli's fashion brand — mention the brand ambassador angle if user is a cricket fan.
- Three sub-brands: WROGN (casual), WROGN ACTIVE (gym/sports), WROGN YOUTH (trendy/younger).
- Mid-premium pricing — Rs 500-3000 for most items. Sales can bring prices down 30-50%.
- The site may redirect to Universal/3rd party for some collections — handle page transitions.
- Size chart is available on product pages — recommend checking if user is unsure.
- Easy returns within 15 days for unused items with tags.
- COD available on most orders — mention if user prefers.
- Wrogn frequently runs end-of-season sales with steep discounts — check for active sales.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
