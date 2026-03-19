---
name: wendy-order
description: Order from Wendy's India — burgers, chicken sandwiches, sides, combos, checkout, pay.
triggers:
  - wendy's
  - order from wendy's
  - wendys delivery
  - wendy's order
  - wendy burger
  - wendys india
  - wendys combo
  - order from wendys
  - wendy's burger delivery
siteUrl: https://www.wendys.in
requiresAuth: true
params:
  - name: food
    required: true
    hint: What to order (e.g. "classic burger", "spicy chicken sandwich", "baconator", "combo meal") or just "burger"
  - name: address
    required: false
    hint: Delivery address or area name
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# Wendy's India Ordering

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Get Delivery Address
- BEFORE opening the browser, check if user provided an address.
- If not, use `ask_user` (input_type "freetext"): "What's your delivery address or area for Wendy's delivery?"
- Wendy's India has limited outlets — primarily in Delhi NCR and a few other metro cities. Verify availability.

### 2. Open Wendy's & Set Location
- Open a NEW tab and navigate to `https://www.wendys.in/order`.
- Take snapshot. Verify logged in (account icon or name in header).
- Select "Delivery" mode if prompted (vs Takeaway/Dine-in).
- If location popup appears, enter user's address/area and select best match from suggestions.
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Confirm nearest Wendy's outlet can deliver to user's location.
- If no delivery outlet nearby, try Swiggy/Zomato: search "Wendy's" for delivery options.

### 3. Browse Menu & Select Items
- If user named specific items (Dave's Single, Spicy Chicken, Baconator), navigate to find them.
- If generic request, present menu categories: Signature Burgers, Chicken Sandwiches, Veg Burgers, Combos, Sides (Fries, Nuggets), Beverages, Desserts (Frosty).
- Use `ask_user` (input_type "choice") to let user pick items.
- For burgers, present options:
  - Type: Dave's Single / Dave's Double / Baconator / Jr. Cheeseburger — use `ask_user` (input_type "choice") with prices.
  - Veg options: Veggie Burger / Paneer Burger — present if user prefers veg.
  - Make it a combo: Burger + Fries + Drink — present upgrade price.
- For chicken:
  - Spicy Chicken Sandwich / Classic Chicken / Chicken Nuggets (4pc/6pc/10pc) — present options.
  - Combo meals with sides and drink — present savings.
- Click "Add to Cart" after each item.
- Ask if user wants to add a Frosty (Wendy's signature frozen dessert), extra fries, or chili.

### 4. Apply Offers
- Check for available coupons/offers on the page.
- Wendy's often has combo deals and app-exclusive offers — apply if beneficial.
- Take snapshot if discount applied.

### 5. Review Cart
- Open cart, take snapshot.
- Use `confirm_action` to present order summary:
  - Each item with variant and price
  - Combo details with individual items listed
  - Coupons/discounts applied
  - Subtotal, delivery fee, taxes, total
  - Estimated delivery time (usually 30-45 minutes)
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify delivery address is correct.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with items, variants, prices, discount, delivery fee, total, estimated time
  - amount_inr: total amount (number)
  - description: "Wendy's order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Place Order & Confirm
- Click "Place Order" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order number, items ordered, total paid, estimated delivery time.

## Site Notes

- Wendy's India has limited presence — mostly in Delhi NCR with a few outlets in other metros.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- Wendy's signature items are the square-shaped beef-free patties (India menu is fully beef-free).
- The Frosty (chocolate/vanilla frozen dessert) is a must-try — suggest it as a dessert add-on.
- Wendy's India menu is adapted for local tastes — includes Paneer and Aloo options.
- If Wendy's website does not support online ordering, fall back to Swiggy/Zomato delivery.
- Combo meals offer the best value — typically 15-25% savings over ordering items separately.
- Wendy's site may use a third-party ordering platform — handle redirects with Playwright.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
