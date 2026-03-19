---
name: mad-over-donuts
description: Order donuts and beverages from Mad Over Donuts — classic donuts, premium donuts, boxes, combos, checkout, pay.
triggers:
  - mad over donuts
  - order from mad over donuts
  - mad over donuts delivery
  - donut delivery
  - order donuts
  - mod donuts
  - mad over donuts order
  - donut box
  - donuts near me
siteUrl: https://www.madoverdonuts.com
requiresAuth: true
params:
  - name: food
    required: true
    hint: What to order (e.g. "chocolate donut", "donut box of 6", "assorted donuts") or just "donuts"
  - name: address
    required: false
    hint: Delivery address or area name
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# Mad Over Donuts Ordering

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
- If not, use `ask_user` (input_type "freetext"): "What's your delivery address or area for Mad Over Donuts delivery?"
- Mad Over Donuts operates primarily in Mumbai, Delhi NCR, Bangalore, Pune, Hyderabad — verify city coverage.

### 2. Open Mad Over Donuts & Set Location
- Open a NEW tab and navigate to `https://www.madoverdonuts.com`.
- Take snapshot. Verify logged in (account icon or name in header).
- If location popup appears, enter user's address/area and select best match from suggestions.
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Confirm Mad Over Donuts delivers to the user's location.
- If not available on own site, try Swiggy/Zomato: search "Mad Over Donuts" for delivery options.

### 3. Browse Menu & Select Items
- If user named specific items (Chocolate Truffle, Boston Cream, Nutella Donut), navigate to find them.
- If generic request, present menu categories: Classic Donuts, Premium Donuts, Filled Donuts, Donut Boxes (6/12), Beverages (Coffee, Milkshakes), Combos.
- Use `ask_user` (input_type "choice") to let user pick items.
- For individual donuts, present popular options:
  - Classic: Glazed, Chocolate, Cinnamon Sugar — use `ask_user` (input_type "choice") with prices.
  - Premium: Nutella, Red Velvet, Lotus Biscoff, Tiramisu — present with prices.
  - Filled: Boston Cream, Blueberry, Strawberry Jam — present with prices.
- For boxes:
  - Box of 6 / Box of 12 — use `ask_user` with prices.
  - Assorted (MOD picks) vs Custom (user picks each donut) — use `ask_user`.
  - If custom box, let user pick each donut: cycle through choices until box is full.
- For combos:
  - Donut + Coffee combos — present with savings.
  - Party Boxes (12+ donuts) for events — present options.
- Click "Add to Cart" after each selection.
- Ask if user wants to add beverages: Cold Coffee, Hot Chocolate, Milkshakes.

### 4. Apply Offers
- Check for available coupons/offers on the page.
- MOD often has buy-X-get-Y deals on donut boxes — apply if beneficial.
- Take snapshot if discount applied.

### 5. Review Cart
- Open cart, take snapshot.
- Use `confirm_action` to present order summary:
  - Each donut with flavor and price (or box with flavors listed)
  - Beverages with prices
  - Coupons/discounts applied
  - Subtotal, delivery fee, taxes, total
  - Estimated delivery time (usually 30-50 minutes)
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify delivery address is correct.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with items, flavors, box details, prices, discount, delivery fee, total, estimated time
  - amount_inr: total amount (number)
  - description: "Mad Over Donuts order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Place Order & Confirm
- Click "Place Order" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order number, items ordered, total paid, estimated delivery time.

## Site Notes

- Mad Over Donuts (MOD) is India's largest donut chain — operates in 5+ metro cities.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- MOD's bestsellers are Chocolate Truffle, Nutella, and Boston Cream — suggest these for first-timers.
- Box of 6 and Box of 12 offer better per-donut pricing — recommend for gifting or parties.
- Premium donuts (Biscoff, Tiramisu) cost 30-50% more than classics — inform user before adding.
- MOD donuts are best consumed within 4-6 hours of delivery — mention for freshness.
- If Mad Over Donuts website is unavailable, fall back to Swiggy/Zomato search for "Mad Over Donuts".
- MOD site may use Shopify or a custom platform — handle accordingly with Playwright.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
