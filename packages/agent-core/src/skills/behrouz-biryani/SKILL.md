---
name: behrouz-biryani
description: Order biryani from Behrouz Biryani (via EatSure/Swiggy) — royal biryanis, kebabs, sides, checkout, pay.
triggers:
  - behrouz biryani
  - order from behrouz
  - behrouz delivery
  - biryani delivery
  - royal biryani
  - order biryani
  - behrouz biryani order
  - dum biryani
  - lucknowi biryani
siteUrl: https://www.eatsure.com/behrouz-biryani
requiresAuth: true
params:
  - name: food
    required: true
    hint: What to order (e.g. "dum biryani", "murgh biryani", "kebab platter") or just "biryani"
  - name: address
    required: false
    hint: Delivery address or area name
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# Behrouz Biryani Ordering

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Get Delivery Address
- BEFORE opening the browser, check if user provided an address.
- If not, use `ask_user` (input_type "freetext"): "What's your delivery address or area for Behrouz Biryani delivery?"
- Behrouz is available via EatSure and Swiggy — address determines outlet availability.

### 2. Open EatSure & Set Location
- Open a NEW tab and navigate to `https://www.eatsure.com/behrouz-biryani`.
- Take snapshot. Verify logged in (account icon or name in header).
- If location popup appears, enter user's address/area and select best match from suggestions.
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Confirm Behrouz Biryani outlet is available at the delivery location.
- If not available, check Swiggy as a fallback: navigate to `https://www.swiggy.com` and search for "Behrouz Biryani".

### 3. Browse Menu & Select Items
- If user named specific items (Dum Biryani, Murgh Makhani Biryani, Kebab Platter), navigate to find them.
- If generic request, present menu categories: Royal Biryanis, Premium Biryanis, Kebab Platters, Breads & Sides, Desserts, Beverages.
- Use `ask_user` (input_type "choice") to let user pick items.
- For biryanis, present portion options:
  - Regular / Large — use `ask_user` (input_type "choice") with prices.
  - Add-ons: extra raita, salan, kebab on side — present with prices.
- For kebab platters, handle options:
  - Seekh Kebab, Galouti Kebab, Murgh Malai Kebab — use `ask_user`.
  - Combo upgrades (biryani + kebab + dessert) — present with prices.
- Click "Add to Cart" after each item.
- Ask if user wants to add desserts (Shahi Tukda, Gulab Jamun) or beverages.

### 4. Apply Offers
- Check for available coupons/offers on the page.
- EatSure often has first-order discounts and combo deals — apply if beneficial.
- Take snapshot if discount applied.

### 5. Review Cart
- Open cart, take snapshot.
- Use `confirm_action` to present order summary:
  - Each item with size/variant and price
  - Coupons/discounts applied
  - Subtotal, delivery fee, taxes, total
  - Estimated delivery time (usually 30-50 minutes)
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify delivery address is correct.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with items, prices, discount, delivery fee, total, estimated time
  - amount_inr: total amount (number)
  - description: "Behrouz Biryani order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Place Order & Confirm
- Click "Place Order" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order number, items ordered, total paid, estimated delivery time.

## Site Notes

- Behrouz Biryani is a cloud kitchen brand — delivery only, no dine-in.
- Operator Chrome Profile 3 should be logged in to EatSure/Swiggy. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- Behrouz specializes in Lucknowi-style dum biryanis — the signature is slow-cooked layered rice and meat.
- Regular biryani serves 1 person, Large serves 2 — always clarify with user.
- EatSure bundles Behrouz with other brands (Faasos, Oven Story) — user can add items from other brands in same cart.
- Minimum order value is usually around 149-199 for free delivery.
- Behrouz packaging is premium (sealed handi pots) — mention this if user asks about quality.
- EatSure uses a modern React-based site — always use Playwright fill/type methods.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
