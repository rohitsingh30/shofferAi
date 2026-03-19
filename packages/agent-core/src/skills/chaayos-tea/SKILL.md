---
name: chaayos-tea
description: Order chai and snacks from Chaayos — custom chai, combos, maggi, sandwiches, delivery, pay.
triggers:
  - chaayos
  - chaayos order
  - order chai
  - chai delivery
  - order from chaayos
  - chaayos tea
  - chaayos chai
  - custom chai
  - tea delivery
  - chaayos snacks
siteUrl: https://www.chaayos.com
requiresAuth: true
params:
  - name: items
    required: true
    hint: What to order (e.g. "masala chai", "chai and samosa", "maggi combo") or just "chai"
  - name: address
    required: false
    hint: Delivery address or area name
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, wallet)
---

# Chaayos Ordering

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Get Delivery Address
- BEFORE opening the browser, check if user provided an address.
- If not, use `ask_user` (input_type "freetext"): "What's your delivery address or area name for Chaayos delivery?"
- Chaayos delivers only from nearby outlets — address determines the store.

### 2. Open Chaayos & Set Location
- Open a NEW tab and navigate to `https://www.chaayos.com`.
- Take snapshot. Verify logged in (account/profile icon in header).
- If location popup or address selector appears, type the user's address, wait for suggestions, click best match.
- Select "Delivery" mode if prompted (vs Takeaway/Dine-in).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Confirm nearest outlet assigned and menu visible.

### 3. Browse Menu & Customize Chai
- If user named specific items (Masala Chai, Kulhad Chai, Tandoori Chai), navigate to find them.
- If generic request, present menu categories: Chai, Snacks, Maggi, Sandwiches, All Day Meals, Combos, Beverages.
- Use `ask_user` (input_type "choice") to let user pick items.
- For chai, handle customization (Chaayos signature "Meri Wali Chai"):
  - Base: Regular, Strong, Extra Strong — use `ask_user` (input_type "choice").
  - Sweetness: Less Sweet, Regular, Extra Sweet — use `ask_user`.
  - Add-ons: Ginger, Cardamom, Tulsi, Lemongrass, Cinnamon — use `ask_user` (input_type "choice").
  - Size: Regular, Large — use `ask_user` with prices.
- For snacks (samosa, bun maska, maggi, sandwiches):
  - Present available options with prices — use `ask_user` (input_type "choice").
  - Handle variants (e.g., Maggi: Classic, Cheese, Masala).
- For combos:
  - Chai + Snack combos are good value — present available combos with prices.
- Click "Add to Cart" after each item.
- Ask if user wants to add more items (desserts, cold beverages, extra chai).

### 4. Apply Offers
- Check for available coupons/offers on the cart page.
- Chaayos runs frequent combo deals and loyalty rewards — apply if beneficial.
- Take snapshot if discount applied.

### 5. Review Cart
- Open cart, take snapshot.
- Use `confirm_action` to present order summary:
  - Each item with customizations and price
  - Chai details (strength, sweetness, add-ons)
  - Discounts applied (if any)
  - Subtotal, delivery fee, taxes, total
  - Estimated delivery time (usually 20-35 minutes)
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify delivery address is correct.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with items, chai customizations, snacks, prices, discount, delivery fee, total, estimated time
  - amount_inr: total amount (number)
  - description: "Chaayos chai order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Place Order & Confirm
- Click "Place Order" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order number, items ordered, total paid, estimated delivery time.

## Site Notes

- Chaayos delivery typically takes 20-35 minutes depending on distance and time of day.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- Chaayos signature feature is "Meri Wali Chai" — full customization of strength, sweetness, and add-ons.
- Chaayos operates mainly in Delhi NCR, Mumbai, Noida, Gurgaon, Chandigarh, and a few other cities.
- Chai + Snack combos are typically 15-20% cheaper than ordering separately — suggest combos.
- Chaayos has a loyalty program (Chai Coins) — operator account may have rewards to redeem.
- Peak hours (morning 8-10am, evening 4-6pm) may have longer delivery times.
- Chaayos uses a modern web stack — always use Playwright fill/type methods.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
