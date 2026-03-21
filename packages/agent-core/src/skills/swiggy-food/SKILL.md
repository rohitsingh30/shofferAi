---
name: swiggy-food
description: Order food delivery from Swiggy — browse restaurants, select dishes, checkout, pay.
triggers:
  - swiggy
  - order food
  - food delivery
  - order from swiggy
  - swiggy food
  - hungry
  - dinner from swiggy
  - lunch from swiggy
  - order dinner
  - order lunch
  - order breakfast
siteUrl: https://www.swiggy.com
requiresAuth: true
params:
  - name: food
    required: true
    hint: What to order (e.g. "biryani", "pizza", "butter chicken") or restaurant name
  - name: address
    required: false
    hint: Delivery address or area name
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# Swiggy Food Ordering

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### Step 0: Confirm delivery address & order preferences
**ALWAYS show the address picker** — even if the user mentioned a location like "Tellapur" or "Koramangala". An area name is NOT a complete delivery address (missing flat/building, street, pincode). The user must pick a saved address or enter a full one.

Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **address** (type: "address", required): Confirm delivery address. Show saved addresses. If the user mentioned an area, pre-fill it:
   ```json
   {"saved": [{"label": "Home", "value": "C-502, Honer Aquantis, Tellapur"}, {"label": "Office", "value": "T-Hub, Raidurg, Hyderabad"}]}
   ```
2. **cuisine** (type: "carousel", required): Show cuisine options as scrollable cards (🥘 Biryani, 🍕 Pizza, 🍔 Burger, 🍱 Thali, 🥡 Chinese, 🥞 South Indian, 🌯 Rolls, 🍰 Dessert). Allow typing specific restaurant/dish.
3. **dietary** (type: "chip_bar", collapsed): Dietary preferences — 🟢 Veg only, 🔴 Non-veg OK, Jain, No onion, No garlic.

- **Only skip the address picker** if the user provided a FULL address with building/flat, street, city, and pincode (e.g. "E111, Ridgewood Estate, DLF Garden City, Pune 411032").

**CRITICAL**: Do NOT open the browser until you have a complete delivery address. Without it, Swiggy cannot show relevant restaurants.

### 1. Gather ALL Requirements Upfront
- BEFORE opening the browser, check what the user already provided: food/dish, delivery address, payment preference.
- If ANY info is missing, use ONE SINGLE `ask_user` call to collect ALL missing info at once.
  Example: "I need a couple of details to order from Swiggy:\n• Delivery address or area name\n• Any payment preference? (UPI, card, COD — default: UPI)"
- Do NOT ask questions one at a time. Batch everything into a single prompt.
- If user provided both food and address already, skip straight to Step 2.

### 2. Open Swiggy & Set Location
- Open a NEW tab and navigate to `https://www.swiggy.com`.
- Take snapshot. Verify logged in (account icon in header).
- If location popup appears, type the user's address, wait for suggestions, click best match.
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Confirm location set and restaurants visible.

### 3. Find Restaurant & Dishes
- If user named a specific restaurant, search for it in the search bar.
- If user named a dish/cuisine, search for it and present top 3-5 restaurant options.
- Use `ask_user` with `input_type: "carousel"` to let user pick a restaurant. Extract the REAL image URL from each restaurant's `<img>` tag on the page. Format:
  ```json
  {
    "input_type": "carousel",
    "cards": [
      {"id": "1", "label": "Restaurant Name", "subtitle": "₹300 for two · North Indian, Mughlai", "image": "https://media-assets.swiggy.com/real-image...", "badge": "⭐ 4.3"}
    ]
  }
  ```
- Open the restaurant page, take snapshot.
- Browse the menu. Find the requested dish(es).
- If multiple variants/sizes, use `ask_user` with `input_type: "chip_bar"`:
  ```json
  {"input_type": "chip_bar", "options": ["Half — ₹180", "Full — ₹320", "Family Pack — ₹550"]}
  ```
- Click "Add" for each item. Handle customization popups (size, toppings, spice level) by asking user.

### 4. Review Cart
- Open cart, take snapshot.
- Use `confirm_action` to present order summary:
  - Restaurant name
  - Each item with quantity and price
  - Subtotal, delivery fee, taxes, total
  - Estimated delivery time
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 5. Checkout & Payment
- Proceed to checkout.
- Verify delivery address is correct.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with restaurant, items, prices, delivery fee, total, estimated time
  - amount_inr: total amount (number)
  - description: "Swiggy food order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 6. Place Order & Confirm
- Click "Place Order" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order number, restaurant, items, total paid, estimated delivery time.

## Site Notes

- Swiggy food delivery: 25-45 minutes typically.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- Swiggy One membership may offer free delivery and discounts.
- Restaurants may be closed outside operating hours — check availability.
- Surge pricing may apply during peak hours — inform user.
- Minimum order value may apply per restaurant.
- Some items may be unavailable — suggest alternatives.
- Swiggy uses React — always use Playwright fill/type methods.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
