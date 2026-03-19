---
name: faasos-wraps
description: Order wraps and rice bowls from Faasos (EatSure) — wraps, biryanis, bowls, customize, delivery, pay.
triggers:
  - faasos
  - eatsure
  - faasos order
  - order from faasos
  - faasos wraps
  - faasos delivery
  - eatsure order
  - order wraps
  - faasos biryani
  - rice bowl delivery
siteUrl: https://www.eatsure.com
requiresAuth: true
params:
  - name: items
    required: true
    hint: What to order (e.g. "chicken wrap", "veg biryani", "rice bowl") or just "wraps" or "food"
  - name: address
    required: false
    hint: Delivery address or area name
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, wallet)
---

# Faasos (EatSure) Ordering

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Get Delivery Address
- BEFORE opening the browser, check if user provided an address.
- If not, use `ask_user` (input_type "freetext"): "What's your delivery address or area name for Faasos/EatSure delivery?"
- Faasos operates under the EatSure brand and delivers from nearby cloud kitchens.

### 2. Open EatSure & Set Location
- Open a NEW tab and navigate to `https://www.eatsure.com`.
- Take snapshot. Verify logged in (account/profile icon in header).
- If location popup or address selector appears, type the user's address, wait for suggestions, click best match.
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Confirm delivery available to user's area.
- Look for "Faasos" brand within EatSure — EatSure hosts multiple brands (Faasos, Behrouz, Oven Story, etc.).

### 3. Navigate to Faasos Menu
- On the EatSure homepage, find and click on "Faasos — Wraps, Rolls & Shawarmas" brand.
- If Faasos is not visible, search for "Faasos" in the search bar.
- Take snapshot confirming Faasos menu is visible.

### 4. Browse Menu & Select Items
- If user named specific items (Chicken Tikka Wrap, Classic Veg Wrap, Biryani), navigate to find them.
- If generic request, present menu categories: Wraps & Rolls, Rice & Biryanis, Bowls, Combos, Sides, Beverages, Desserts.
- Use `ask_user` (input_type "choice") to let user pick items.
- For wraps/rolls:
  - Type: Classic Veg, Paneer Tikka, Chicken Tikka, Egg, Shawarma — use `ask_user` (input_type "choice") with prices.
  - Size: Regular, Large/Double — use `ask_user` with prices if available.
  - Customization: extra cheese, sauces — present options.
- For biryanis/bowls:
  - Type: Veg Biryani, Chicken Biryani, Egg Rice Bowl — use `ask_user` with prices.
  - Raita or sides — use `ask_user`.
- For combos:
  - Present combo deals (wrap + drink, wrap + side) — use `ask_user` with prices.
  - Combos offer better value — inform user.
- Click "Add to Cart" after each item.
- Ask if user wants to add items from other EatSure brands (Behrouz Biryani, Oven Story Pizza).

### 5. Apply Offers
- Check for available coupons/offers on the cart page.
- EatSure/Faasos frequently runs BOGO deals and combo discounts — apply if beneficial.
- Take snapshot if discount applied.

### 6. Review Cart
- Open cart, take snapshot.
- Use `confirm_action` to present order summary:
  - Each item with variant/size and price
  - Customizations (if any)
  - Discounts applied (if any)
  - Subtotal, delivery fee, platform fee, taxes, total
  - Estimated delivery time (usually 25-40 minutes)
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 7. Checkout & Payment
- Proceed to checkout.
- Verify delivery address is correct.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with items, variants, customizations, prices, discount, delivery fee, total, estimated time
  - amount_inr: total amount (number)
  - description: "Faasos/EatSure food order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 8. Place Order & Confirm
- Click "Place Order" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order number, items ordered, total paid, estimated delivery time, tracking link if visible.

## Site Notes

- Faasos/EatSure delivery typically takes 25-40 minutes from their cloud kitchens.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- Faasos now operates under EatSure — the website is eatsure.com, but the Faasos brand menu is inside it.
- EatSure hosts multiple brands (Faasos, Behrouz Biryani, Oven Story Pizza, Firangi Bake) — user can mix from multiple brands in one order.
- Faasos wraps are the signature item — Classic Chicken Wrap and Paneer Tikka Wrap are bestsellers.
- EatSure operates in most major Indian cities (Mumbai, Delhi, Bengaluru, Hyderabad, Pune, Chennai, etc.).
- BOGO (Buy One Get One) offers on wraps are common — always check before ordering.
- EatSure uses a modern React-based SPA — always use Playwright fill/type methods.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
