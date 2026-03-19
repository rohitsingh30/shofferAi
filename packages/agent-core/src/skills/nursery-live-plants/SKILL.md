---
name: nursery-live-plants
description: Shop on NurseryLive — browse plants, seeds, pots, gardening tools, fertilizers, checkout, pay.
triggers:
  - nurserylive
  - nursery live
  - order from nurserylive
  - buy plants online
  - buy plants
  - order plants
  - nurserylive plants
  - buy seeds online
  - buy gardening supplies
siteUrl: https://www.nurserylive.com
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "money plant", "tulsi plant", "rose seeds", "ceramic pot", "fertilizer")
  - name: category
    required: false
    hint: Category (e.g. "indoor plants", "outdoor plants", "seeds", "pots", "gardening tools", "fertilizers")
  - name: purpose
    required: false
    hint: Purpose (e.g. "air purifying", "balcony garden", "kitchen garden", "gifting", "office desk")
  - name: budget
    required: false
    hint: Max price (e.g. "under 500", "budget 2000")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# NurseryLive Plants & Gardening Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Clarify Requirements
- Confirm what the user wants: specific plants, seeds, pots, or gardening supplies.
- Use `ask_user` to clarify: indoor vs outdoor, purpose (air purifying, decorative, kitchen garden, gifting), sunlight conditions (full sun, partial shade, low light), budget.
- Ask about pot preference: with pot or without, pot material (ceramic, plastic, terracotta).
- Note if user wants a combo/bundle (e.g. "set of 5 air purifying plants").

### 2. Open NurseryLive & Verify Login
- Open a NEW tab and navigate to `https://www.nurserylive.com`.
- Take snapshot. Verify logged in (account icon or name in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product or browse by category.
- Take snapshot of search results page.
- Apply filters: category, price range, plant type (indoor/outdoor), light requirement, maintenance level.
- Check delivery availability to user's pincode.
- Extract top 3-5 options with: name, price, pot included (yes/no), pot size, plant height, care level (easy/medium/hard), rating.
- Use `ask_user` (input_type "choice") to present options. Format: "Plant Name — ₹XXX — Pot: [Yes/No] — Height: X inches — Care: Easy — ⭐ Rating"
- If user wants combos, show available bundles with per-plant savings.

### 4. View Product Details
- Click selected product.
- Take snapshot of product page.
- Extract: full name (common + botanical), price, pot details (size, material, color), plant height, spread, sunlight needs, watering frequency, care instructions, delivery date.
- If product has size/pot variants, present them via `ask_user` (input_type "choice").
- Mention seasonal availability if applicable (some plants are seasonal).
- Confirm with user: "Add [plant name] at ₹XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Cart".
- If user wants multiple items, repeat search and add process for each item.
- Go to cart, take snapshot.
- Check for applicable coupons or bundle discounts.
- Apply best coupon if available.
- Use `confirm_action` to present order summary:
  - Items: name, quantity, pot details for each
  - Price: per item and subtotal
  - Delivery charges (free above certain amount)
  - Total amount
  - Special handling notes (live plants need careful packaging)
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Proceed to Checkout".
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with items, quantities, prices, delivery_charge, total
  - amount_inr: total amount (number)
  - description: "NurseryLive plants and gardening order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, items ordered, price paid, estimated delivery date, care tips for the plants ordered.

## Site Notes

- NurseryLive ships live plants across India — delivery takes 5-10 business days; plants are packed in special breathable packaging.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Plants may arrive slightly different from photos due to natural variation — inform user this is normal.
- Free delivery on orders above ₹499 typically; below that, shipping charges apply.
- Seasonal plants may be out of stock — check availability before presenting options.
- NurseryLive offers a replacement guarantee on dead-on-arrival plants (usually 7 days) — mention this.
- Combo packs and bundles offer better value (e.g. "Pack of 5 Air Purifiers" cheaper than buying individually).
- Some plants are not shipped to certain states due to agricultural regulations — verify pincode.
- Pots sold separately unless listed as "with pot" — clarify with user before ordering.
- Fertilizers and gardening tools have no shipping restrictions and arrive faster (3-5 days).
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
