---
name: naturals-icecream
description: Order Natural's ice cream — sitaphal, tender coconut, mango, seasonal flavors, packs, delivery, pay.
triggers:
  - naturals ice cream
  - natural's ice cream
  - naturals order
  - order from naturals
  - naturals delivery
  - sitaphal ice cream
  - tender coconut ice cream
  - naturals icecream
  - fruit ice cream delivery
  - seasonal ice cream
siteUrl: https://www.naturalsicecream.in
requiresAuth: true
params:
  - name: items
    required: true
    hint: What to order (e.g. "sitaphal", "tender coconut", "mango ice cream") or just "ice cream"
  - name: address
    required: false
    hint: Delivery address or area name
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, wallet)
---

# Natural's Ice Cream Ordering

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### Step 0: Collect order preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **address** (type: "address", required): Ask for delivery address. Show saved addresses.
2. **cuisine** (type: "carousel", required): Show cuisine options as scrollable cards (🥘 Biryani, 🍕 Pizza, 🍔 Burger, 🍱 Thali, 🥡 Chinese, 🥞 South Indian, 🌯 Rolls, 🍰 Dessert). Allow typing specific restaurant/dish.
3. **dietary** (type: "chip_bar", collapsed): Dietary preferences — 🟢 Veg only, 🔴 Non-veg OK, Jain, No onion, No garlic.

**CRITICAL**: Do NOT open the browser until you have the delivery address. Without it, the site cannot show relevant restaurants.

### 1. Get Delivery Address
- BEFORE opening the browser, check if user provided an address.
- If not, use `ask_user` (input_type "freetext"): "What's your delivery address or area name for Natural's Ice Cream delivery?"
- Natural's delivers from nearby parlours — address determines the outlet.

### 2. Open Natural's Ice Cream & Set Location
- Open a NEW tab and navigate to `https://www.naturalsicecream.in`.
- Take snapshot. Verify logged in (account/profile icon in header).
- If location popup or city/area selector appears, select the correct city and enter the user's delivery address.
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Confirm nearest parlour assigned and flavor catalog visible.

### 3. Browse Flavors & Select Items
- If user named specific flavors (Sitaphal, Tender Coconut, Alphonso Mango, Roasted Almond), navigate to find them.
- If generic request, present categories: Signature Fruit Flavors, Classic Flavors, Premium Flavors, Packs & Tubs, Sundaes, Shakes.
- Use `ask_user` (input_type "choice") to let user pick items.
- For individual servings:
  - Flavor selection — present available flavors at the selected parlour (seasonal availability varies).
  - Size: Single scoop, Double scoop — use `ask_user` (input_type "choice") with prices.
  - Cup or cone — use `ask_user`.
- For packs/tubs:
  - Flavor: present available flavors — use `ask_user` (input_type "choice").
  - Size: 500ml, 750ml, 1L, Family Pack — use `ask_user` with prices.
- For sundaes and shakes:
  - Present available options with toppings and prices — use `ask_user`.
- Click "Add to Cart" after each item.
- Ask if user wants to add more flavors or upgrade to larger packs.

### 4. Apply Offers
- Check for available coupons/offers on the cart page.
- Natural's occasionally runs combo deals on packs — apply if beneficial.
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
  - description: "Natural's Ice Cream order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Place Order & Confirm
- Click "Place Order" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order number, items ordered, total paid, estimated delivery time.

## Site Notes

- Natural's Ice Cream delivery typically takes 30-45 minutes depending on distance.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- Natural's is famous for real-fruit ice cream — Sitaphal, Tender Coconut, and Alphonso Mango are signature flavors.
- Seasonal flavors: Alphonso Mango (April-June), Sitaphal (November-February), Strawberry (December-March).
- Natural's operates mainly in Mumbai, Pune, Bengaluru, Delhi, Hyderabad, and a few other cities.
- Packs/tubs are better value than individual scoops — suggest for families or gatherings.
- Ice cream is delivered in insulated packaging but should be consumed soon after delivery.
- Natural's uses a web ordering platform — always use Playwright fill/type methods.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
