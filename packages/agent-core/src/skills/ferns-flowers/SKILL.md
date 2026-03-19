---
name: ferns-flowers
description: Order flowers, cakes, and gifts from Ferns N Petals — select arrangement, set delivery date, recipient address, checkout, pay.
triggers:
  - ferns n petals
  - fnp
  - order flowers
  - flower delivery
  - send flowers
  - order cake
  - birthday cake delivery
  - send bouquet
  - ferns and petals
  - gift delivery
siteUrl: https://www.fnp.com
requiresAuth: true
params:
  - name: item
    required: true
    hint: What to order (e.g. "red roses bouquet", "chocolate cake 1kg", "birthday flowers")
  - name: recipient_address
    required: false
    hint: Recipient's delivery address and city
  - name: delivery_date
    required: false
    hint: When to deliver (e.g. "tomorrow", "March 20", "today evening")
---

# Ferns N Petals Ordering

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Get Delivery Details
- BEFORE opening the browser, gather required information.
- If user did not provide a recipient address, use `ask_user` (input_type "freetext"): "What's the recipient's delivery address and city?"
- If user did not provide a delivery date, use `ask_user` (input_type "freetext"): "When should this be delivered? (e.g. tomorrow, March 20, today by 8 PM)"
- If user did not provide recipient name, use `ask_user` (input_type "freetext"): "What's the recipient's name?"

### 2. Open FNP & Set Location
- Open a NEW tab and navigate to `https://www.fnp.com`.
- Take snapshot. Verify logged in (account/profile icon in header).
- If city/location selector appears, select the recipient's city from the list.
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Confirm city set and products visible.

### 3. Search & Select Product
- If user named a specific product (e.g. "red roses", "chocolate cake"), search for it.
- Take snapshot of results.
- Present top 3-5 options to user with:
  - Product name and image description
  - Price
  - Size/weight options
  - Delivery type (standard, midnight, fixed-time)
- Use `ask_user` (input_type "choice") to let user pick.
- Open the product page, take snapshot.
- Handle product customization:
  - Size/weight (e.g. 500g, 1kg, 2kg for cakes; 12, 24, 50 roses for bouquets) — use `ask_user`.
  - Add-ons (chocolate box, teddy bear, greeting card, candles) — present options.
  - Eggless option for cakes — use `ask_user` if applicable.
- Select delivery date and time slot from available options.

### 4. Add-ons & Combos
- FNP shows recommended combos (flowers + cake, flowers + chocolate).
- Present combo options if relevant and ask user.
- Add greeting card message if user wants — use `ask_user` (input_type "freetext").

### 5. Review Order
- Go to cart, take snapshot.
- Use `confirm_action` to present order summary:
  - Product name with size/weight
  - Add-ons with prices
  - Recipient name and address
  - Delivery date and time slot
  - Subtotal, delivery charges, total
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Fill in recipient details: name, address, phone (ask user for recipient phone via `ask_user`).
- Fill in sender details from operator profile.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, size, add-ons, recipient, delivery date/time, total
  - amount_inr: total amount (number)
  - description: "Ferns N Petals order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Place Order & Confirm
- Click "Place Order" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order number, product, recipient, delivery date/time, total paid.

## Site Notes

- FNP delivers across 500+ cities in India — check city availability first.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- Delivery types: Standard (daytime), Midnight (11 PM - 12 AM), Fixed Time (specific slot), Same Day.
- Same-day delivery requires ordering before cutoff (usually 3-4 PM).
- Midnight delivery is popular for birthdays — costs extra (₹200-400).
- Cakes are perishable — eggless option costs ₹50-100 extra.
- FNP also sells plants, personalized gifts, hampers — not just flowers and cakes.
- Product images are representative — actual arrangement may vary slightly.
- FNP uses a React-based SPA — always use Playwright fill/type methods.
- Use `confirm_action` for order review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
