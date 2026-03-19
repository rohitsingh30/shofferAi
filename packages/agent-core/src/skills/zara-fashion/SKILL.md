---
name: zara-fashion
description: Buy Zara fashion on zara.com/in — browse clothing, shoes, accessories, select size, add to bag, checkout, pay.
triggers:
  - zara
  - buy from zara
  - order zara
  - zara india
  - zara clothing
  - zara fashion
  - zara online shopping
  - buy zara dress
siteUrl: https://www.zara.com/in/
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "blazer", "linen trousers", "summer dress", "leather jacket", "heels")
  - name: size
    required: false
    hint: Size preference (XS, S, M, L, XL, or EU size like 38, 40, 42)
  - name: gender
    required: false
    hint: Category (men, women, kids)
  - name: budget
    required: false
    hint: Max price (e.g. "under 3000", "budget 5000")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, net banking)
---

# Zara Fashion Shopping (India)

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm what the user wants: clothing (tops, bottoms, dresses, outerwear, suits), shoes, accessories (bags, jewelry, belts), or perfume.
- Use `ask_user` to clarify: gender (men, women, kids), occasion (casual, formal, party, work), style preference (classic, trendy, minimal), color preference.
- Note size preference. Zara uses EU sizing — help convert if user mentions Indian/US/UK sizes.
- Note budget — Zara is mid-premium (Rs 1000-10,000 range for clothing).

### 2. Open Zara India & Verify Login
- Open a NEW tab and navigate to `https://www.zara.com/in/`.
- Take snapshot. Verify logged in (account icon or profile name visible in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product (e.g. "men blazer", "women summer dress").
- Take snapshot of search results page.
- Zara's search is visual-heavy — describe items from snapshots as design names may be generic.
- Apply filters if relevant: size, color, price.
- Extract top 3-5 options with: product name, color, price, material highlights.
- Use `ask_user` (input_type "choice") to present options. Format: "Zara [Product Name] — [Color] — Rs X,XXX — [Material/Style note]"
- Zara product names are often generic (e.g. "TEXTURED WEAVE SHIRT") — add visual description from snapshot.
- If user wants to see more, scroll or refine search.

### 4. View Product & Select Size/Color
- Click selected product.
- Take snapshot of product page.
- Extract: full name, price, available colors (swatches), available sizes (EU sizing), material composition, care instructions, product description.
- If color not chosen, present available colors via `ask_user` (input_type "choice").
- If size not provided by user, present available sizes via `ask_user` (input_type "choice").
- Check size availability. Zara items sell out quickly — inform user if size is limited.
- Mention material composition (e.g. "100% linen", "cotton blend") — important for Zara shoppers.
- Describe the fit and style from the product images.

### 5. Add to Bag & Review
- Click "Add to Bag".
- Go to shopping bag, take snapshot.
- Zara rarely has coupon codes — focus on any seasonal sale pricing already applied.
- Use `confirm_action` to present order summary:
  - Product: name, color, size, material
  - Price: per item, any sale discount, final price
  - Delivery date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, color, size, price, delivery, total
  - amount_inr: total amount (number)
  - description: "Zara fashion order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product (name, color, size), price paid, estimated delivery date, return policy.

## Site Notes

- Zara India delivery: 2-5 business days for metro cities, up to 7 days elsewhere. Delivery charge Rs 290, free above Rs 2990.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Zara uses EU sizing exclusively — XS=EU 34, S=EU 36, M=EU 38, L=EU 40, XL=EU 42. Always mention size chart.
- Zara does NOT do coupon codes or discount codes — prices are fixed. Sales happen seasonally (End of Season Sale).
- Zara items sell out FAST — if user finds something they like, encourage quick decision.
- The Zara website is very image-heavy and interactive — pages may take time to fully load. Wait before snapping.
- No COD on Zara India — prepaid only (card, UPI, net banking, wallets).
- Returns within 30 days of shipment confirmation — items must be unworn with tags. Free returns.
- Zara JOIN LIFE collection uses sustainable materials — mention if user cares about sustainability.
- Product descriptions on Zara are minimal — rely on visual description from snapshots.
- Use `confirm_action` for bag review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
