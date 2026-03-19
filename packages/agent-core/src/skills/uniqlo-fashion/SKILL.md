---
name: uniqlo-fashion
description: Buy Uniqlo basics and essentials on uniqlo.com/in — browse LifeWear, select size and color, add to cart, checkout, pay.
triggers:
  - uniqlo
  - buy from uniqlo
  - order uniqlo
  - uniqlo india
  - uniqlo clothing
  - uniqlo basics
  - buy uniqlo t-shirt
  - uniqlo online shopping
siteUrl: https://www.uniqlo.com/in/en/
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "AIRism t-shirt", "Heattech innerwear", "Ultra Light Down", "linen shirt", "chinos")
  - name: size
    required: false
    hint: Size preference (XS, S, M, L, XL, XXL, or numeric like 28, 30, 32 for bottoms)
  - name: gender
    required: false
    hint: Category (men, women, kids, baby)
  - name: budget
    required: false
    hint: Max price (e.g. "under 2000", "budget 3000")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, net banking)
---

# Uniqlo Fashion Shopping (India)

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm what the user wants: basics (t-shirts, shirts, bottoms), innerwear (AIRism, Heattech), outerwear (Ultra Light Down, fleece), or activewear.
- Use `ask_user` to clarify: gender (men, women, kids), specific technology line (AIRism, Heattech, Ultra Light Down, DRY-EX), color preference, fabric preference.
- Note size preference. Uniqlo uses Asian sizing — tends to run slightly smaller than Western brands.
- Note budget — Uniqlo is value-for-quality pricing (Rs 500-5000 range).
- Ask about occasion: daily basics, layering, sports, or office wear.

### 2. Open Uniqlo India & Verify Login
- Open a NEW tab and navigate to `https://www.uniqlo.com/in/en/`.
- Take snapshot. Verify logged in (account icon or profile name visible in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product (e.g. "men AIRism cotton crew neck").
- Take snapshot of search results page.
- Apply filters if relevant: size, color, price, category, material, technology (AIRism, Heattech).
- Sort by recommended or new arrivals unless user specifies price sorting.
- Extract top 3-5 options with: product name, technology line, color options count, price, material.
- Use `ask_user` (input_type "choice") to present options. Format: "Uniqlo [Product] — Rs X,XXX — [Technology] — [Material] — [X colors available]"
- If user wants to see more, scroll or browse by category.

### 4. View Product & Select Size/Color
- Click selected product.
- Take snapshot of product page.
- Extract: full name, technology line (AIRism, Heattech, etc.), price, available colors (all swatches), available sizes, material composition, product features, care instructions, reviews.
- If color not chosen, present available colors via `ask_user` (input_type "choice"). Uniqlo typically offers 5-15 colors per basic item.
- If size not provided by user, present available sizes via `ask_user` (input_type "choice").
- Check size availability. Inform user if specific size+color combo is sold out.
- Highlight Uniqlo technology features (AIRism = cooling, Heattech = warming, DRY-EX = quick dry, etc.).
- Mention if item can be altered (hem length for pants — Uniqlo offers in-store alteration).

### 5. Add to Cart & Review
- Click "Add to Cart".
- Go to cart, take snapshot.
- Check for any limited-time price reductions (Uniqlo does weekly "Limited Offers" instead of coupons).
- Use `confirm_action` to present order summary:
  - Product: name, technology, color, size, material
  - Price: per item, any limited offer discount, final price
  - Delivery date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, technology, color, size, price, delivery, total
  - amount_inr: total amount (number)
  - description: "Uniqlo fashion order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product (name, technology, color, size), price paid, estimated delivery date, return policy.

## Site Notes

- Uniqlo India delivery: 3-7 business days. Free delivery above Rs 990. Standard delivery charge Rs 190.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Uniqlo does NOT do coupon codes — they use "Limited Offers" (weekly price reductions on select items). Check the Limited Offers section.
- Uniqlo sizing runs slightly smaller than Western brands — recommend sizing up if user is between sizes.
- Technology lines are key differentiators: AIRism (breathable/cooling), Heattech (heat-retaining), Ultra Light Down (packable warmth), DRY-EX (sports quick-dry).
- Uniqlo basics come in many colors (10-15 per style) — help user narrow down.
- "LifeWear" is Uniqlo's brand philosophy — simple, high-quality everyday clothing.
- No COD on Uniqlo India — prepaid only (card, UPI, net banking).
- Returns within 30 days of purchase — items must be unworn, unwashed, with tags. Free returns.
- Uniqlo website is clean and fast-loading — snapshots are reliable.
- Hem alteration available for pants at Uniqlo stores — mention if user buys bottoms and lives near a store.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
