---
name: baskin-robbins
description: Order ice cream from Baskin Robbins India — flavors, sundaes, cakes, packs, delivery, pay.
triggers:
  - baskin robbins
  - baskin-robbins
  - order ice cream
  - ice cream delivery
  - baskin robbins order
  - order from baskin robbins
  - ice cream cake
  - ice cream pack
  - sundae delivery
  - br ice cream
siteUrl: https://www.baskinrobbinsindia.com
requiresAuth: true
params:
  - name: items
    required: true
    hint: What to order (e.g. "chocolate ice cream", "ice cream cake", "family pack") or just "ice cream"
  - name: address
    required: false
    hint: Delivery address or area name
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, wallet)
---

# Baskin Robbins India Ordering

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Get Delivery Address
- BEFORE opening the browser, check if user provided an address.
- If not, use `ask_user` (input_type "freetext"): "What's your delivery address or area name for Baskin Robbins delivery?"
- Baskin Robbins delivers only from nearby stores — address determines the outlet.

### 2. Open Baskin Robbins & Set Location
- Open a NEW tab and navigate to `https://www.baskinrobbinsindia.com`.
- Take snapshot. Verify logged in (account/profile icon in header).
- If location popup or address selector appears, type the user's address, wait for suggestions, click best match.
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Confirm nearest store assigned and menu/catalog visible.

### 3. Browse Menu & Select Items
- If user named specific items (Mississippi Mud, Pralines n Cream, Gold Medal Ribbon), navigate to find them.
- If generic request, present menu categories: Ice Cream Scoops, Sundaes, Milkshakes, Ice Cream Cakes, Packs & Tubs, Combos.
- Use `ask_user` (input_type "choice") to let user pick items.
- For scoops, handle:
  - Flavor selection — present available flavors from the store (seasonal flavors may vary).
  - Size: Single, Double, Triple scoop — use `ask_user` (input_type "choice") with prices.
  - Cone or Cup — use `ask_user`.
- For cakes, handle:
  - Cake flavor and design — use `ask_user` (input_type "choice") with available options.
  - Size: 500g, 750g, 1kg, 2kg — use `ask_user` with prices.
- For packs/tubs:
  - Flavor and size: 500ml, 750ml, 1L — use `ask_user` with prices.
- Click "Add to Cart" after each item.
- Ask if user wants to add more items (toppings, waffles, brownies, beverages).

### 4. Apply Offers
- Check for available coupons/offers on the cart page.
- Baskin Robbins frequently runs combo offers and seasonal deals — apply if beneficial.
- Take snapshot if discount applied.

### 5. Review Cart
- Open cart, take snapshot.
- Use `confirm_action` to present order summary:
  - Each item with flavor, size/variant, and price
  - Discounts applied (if any)
  - Subtotal, delivery fee, taxes, total
  - Estimated delivery time (usually 30-45 minutes)
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify delivery address is correct.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with items, flavors, sizes, prices, discount, delivery fee, total, estimated time
  - amount_inr: total amount (number)
  - description: "Baskin Robbins ice cream order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Place Order & Confirm
- Click "Place Order" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order number, items ordered, total paid, estimated delivery time.

## Site Notes

- Baskin Robbins India delivery typically takes 30-45 minutes depending on distance and traffic.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- Baskin Robbins has 31 flavors but availability varies by store — always check what the local store offers.
- Ice cream cakes require advance ordering (2-4 hours lead time) — inform user if ordering a cake.
- Seasonal flavors (mango, strawberry) may only be available in specific months.
- Minimum order value for delivery is usually around ₹150-200.
- Baskin Robbins uses a modern web stack — always use Playwright fill/type methods.
- Packs and tubs are better value than individual scoops — suggest for families.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
