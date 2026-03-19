---
name: haldiram-snacks
description: Order sweets, snacks, and dry fruits from Haldiram's online — namkeen, sweets, gift packs, delivery, pay.
triggers:
  - haldiram
  - haldirams
  - haldiram's
  - order from haldiram
  - haldiram sweets
  - haldiram namkeen
  - order namkeen
  - order sweets
  - indian sweets delivery
  - dry fruits order
siteUrl: https://www.haldirams.com
requiresAuth: true
params:
  - name: items
    required: true
    hint: What to order (e.g. "aloo bhujia", "rasgulla", "kaju katli", "dry fruits gift box") or just "sweets"
  - name: address
    required: false
    hint: Delivery address or pin code
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, wallet)
---

# Haldiram's Online Ordering

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Get Delivery Address
- BEFORE opening the browser, check if user provided an address.
- If not, use `ask_user` (input_type "freetext"): "What's your delivery address or pin code for Haldiram's delivery?"
- Haldiram's ships across India — delivery time varies by location (same-day in metros, 2-5 days elsewhere).

### 2. Open Haldiram's & Set Location
- Open a NEW tab and navigate to `https://www.haldirams.com`.
- Take snapshot. Verify logged in (account/profile icon in header).
- If location/pincode popup appears, enter the user's pin code or city to check delivery availability.
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Confirm delivery available to user's location and catalog visible.

### 3. Browse Catalog & Select Items
- If user named specific items (Aloo Bhujia, Kaju Katli, Soan Papdi, Rasgulla), search to find them.
- If generic request, present categories: Namkeen & Snacks, Sweets, Dry Fruits, Gift Packs, Ready to Eat, Frozen Foods, Beverages.
- Use `ask_user` (input_type "choice") to let user pick items.
- For namkeen/snacks:
  - Flavor/type: Aloo Bhujia, Moong Dal, Mixture, Sev — use `ask_user` (input_type "choice") with prices.
  - Size/weight: 150g, 350g, 1kg — use `ask_user` with prices.
- For sweets:
  - Type: Kaju Katli, Soan Papdi, Rasgulla, Gulab Jamun, Barfi — use `ask_user` with prices.
  - Pack size: 250g, 500g, 1kg — use `ask_user` (input_type "choice").
- For dry fruits:
  - Type: Almonds, Cashews, Pistachios, Mixed Dry Fruits — use `ask_user` with prices.
  - Regular vs Premium quality — use `ask_user`.
- For gift packs:
  - Present available festive/gift combos with contents and prices.
- Click "Add to Cart" after each item.
- Ask if user wants to add more items or gift wrapping.

### 4. Apply Offers
- Check for available coupons/offers on the cart page.
- Haldiram's runs festive season offers (Diwali, Holi, Rakhi) and bulk discounts — apply if beneficial.
- Take snapshot if discount applied.

### 5. Review Cart
- Open cart, take snapshot.
- Use `confirm_action` to present order summary:
  - Each item with variant/size and price
  - Gift wrapping (if selected)
  - Discounts applied (if any)
  - Subtotal, delivery fee, taxes, total
  - Estimated delivery time (same-day to 5 days depending on location)
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Fill in delivery address if not auto-populated.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with items, variants, sizes, prices, discount, delivery fee, total, estimated delivery
  - amount_inr: total amount (number)
  - description: "Haldiram's order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Place Order & Confirm
- Click "Place Order" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order number, items ordered, total paid, estimated delivery date, tracking info if available.

## Site Notes

- Haldiram's ships pan-India — same-day delivery in Delhi NCR, 2-5 days elsewhere.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- Haldiram's is one of India's largest snack brands — product range is extensive (500+ items).
- Gift packs are popular during festivals — suggest them around Diwali, Holi, Rakhi.
- Free delivery usually applies above ₹499-599 — inform user about minimum for free shipping.
- Sweets have limited shelf life (7-15 days) — mention this for perishable items.
- Dry fruits and namkeen have longer shelf life (3-6 months) — good for bulk orders.
- Haldiram's uses a standard e-commerce web stack — always use Playwright fill/type methods.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
