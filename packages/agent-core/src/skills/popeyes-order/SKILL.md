---
name: popeyes-order
description: Order from Popeyes India — Louisiana-style chicken, biscuits, sides, combos, checkout, pay.
triggers:
  - popeyes
  - order from popeyes
  - popeyes delivery
  - popeyes order
  - popeyes chicken
  - louisiana chicken
  - popeyes india
  - chicken sandwich popeyes
  - fried chicken popeyes
siteUrl: https://www.popeyes.in
requiresAuth: true
params:
  - name: food
    required: true
    hint: What to order (e.g. "chicken sandwich", "chicken tenders", "spicy bucket", "biscuits") or just "chicken"
  - name: address
    required: false
    hint: Delivery address or area name
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# Popeyes India Ordering

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
- If not, use `ask_user` (input_type "freetext"): "What's your delivery address or area for Popeyes delivery?"
- Popeyes India is relatively new — available in Bangalore, Delhi NCR, Mumbai, Chennai, Hyderabad. Verify coverage.

### 2. Open Popeyes & Set Location
- Open a NEW tab and navigate to `https://www.popeyes.in/order`.
- Take snapshot. Verify logged in (account icon or name in header).
- Select "Delivery" mode if prompted (vs Dine-in/Takeaway).
- If location popup appears, enter user's address/area and select best match from suggestions.
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Confirm nearest Popeyes outlet can deliver to user's location.
- If no delivery outlet nearby, try Swiggy/Zomato: search "Popeyes" for delivery options.

### 3. Browse Menu & Select Items
- If user named specific items (Chicken Sandwich, Chicken Tenders, Popcorn Shrimp), navigate to find them.
- If generic request, present menu categories: Chicken Sandwiches, Chicken Tenders, Bone-In Chicken, Combos, Sides (Cajun Fries, Coleslaw, Mashed Potatoes, Biscuits), Beverages, Desserts.
- Use `ask_user` (input_type "choice") to let user pick items.
- For chicken, present options:
  - Style: Classic / Spicy — use `ask_user` (input_type "choice").
  - Piece count: 1pc / 2pc / 3pc / Bucket (6pc / 8pc / 12pc) — present with prices.
  - Bone-in vs Tenders vs Sandwich — use `ask_user`.
- For combos:
  - Solo Combos (main + side + drink) — present options with prices.
  - Family Meals (bucket + sides + biscuits + drinks for 3-5 people) — present with savings.
  - Box Meals (value combos) — highlight for budget-conscious users.
- Click "Add to Cart" after each item.
- Ask if user wants to add Biscuits (Popeyes' signature buttery biscuits), Cajun Fries, or Apple Pie.

### 4. Apply Offers
- Check for available coupons/offers on the page.
- Popeyes often has introductory offers and combo deals — apply if beneficial.
- Take snapshot if discount applied.

### 5. Review Cart
- Open cart, take snapshot.
- Use `confirm_action` to present order summary:
  - Each item with variant, spice level, and price
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
  - description: "Popeyes order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Place Order & Confirm
- Click "Place Order" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order number, items ordered, total paid, estimated delivery time.

## Site Notes

- Popeyes India launched in 2022 and is expanding — currently in 6+ metro cities with limited outlets.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- Popeyes' signature is Louisiana-style crispy chicken marinated for 12 hours — highlight this USP.
- The Chicken Sandwich is the star item globally — strongly recommend for first-time orderers.
- Biscuits are a Popeyes signature side — flaky, buttery, and unique to the brand in India.
- Popeyes India menu is localized — includes Veg Burger and Paneer options alongside chicken.
- If the Popeyes website does not support online ordering, fall back to Swiggy/Zomato delivery.
- Popeyes spice levels: Classic (mild) and Spicy (Louisiana hot) — always clarify preference.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
