---
name: bhagat-halwai
description: Order sweets and snacks from local sweet shops via Swiggy or Zomato — mithai, namkeen, chaat, delivery, pay.
triggers:
  - bhagat halwai
  - sweet shop order
  - order mithai
  - mithai delivery
  - local sweets delivery
  - order from sweet shop
  - halwai order
  - indian sweets
  - sweets from swiggy
  - sweets from zomato
siteUrl: https://www.swiggy.com
requiresAuth: true
params:
  - name: items
    required: true
    hint: What to order (e.g. "gulab jamun", "samosa", "kaju katli", "rasgulla") or just "sweets"
  - name: shop_name
    required: false
    hint: Preferred sweet shop name (e.g. "Bhagat Halwai", "Bikanervala", "Aggarwal Sweets")
  - name: address
    required: false
    hint: Delivery address or area name
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, wallet)
---

# Local Sweet Shop Ordering (via Swiggy/Zomato)

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Get Delivery Address & Shop Preference
- BEFORE opening the browser, check if user provided an address and preferred sweet shop.
- If no address, use `ask_user` (input_type "freetext"): "What's your delivery address or area name?"
- If no shop preference, use `ask_user` (input_type "freetext"): "Any preferred sweet shop? (e.g. Bhagat Halwai, Bikanervala, Aggarwal Sweets, or any nearby sweet shop)"
- Delivery is via Swiggy or Zomato — whichever has the shop and better offers.

### 2. Open Swiggy/Zomato & Set Location
- Open a NEW tab and navigate to `https://www.swiggy.com` (primary) or `https://www.zomato.com` (fallback).
- Take snapshot. Verify logged in (account/profile icon in header).
- If location popup appears, type the user's address, wait for suggestions, click best match.
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Confirm location is set and search is available.

### 3. Find Sweet Shop
- Search for the user's preferred sweet shop name in the search bar.
- If no preference, search for "sweets" or "mithai" to find nearby sweet shops.
- Present top 3-5 sweet shops with ratings, delivery time, and price range.
- Use `ask_user` (input_type "choice") to let user pick a shop.
- Click on the selected shop to open its menu.

### 4. Browse Menu & Select Items
- If user named specific items (Gulab Jamun, Samosa, Kaju Katli, Chaat), find them in the menu.
- If generic request, present menu categories: Sweets/Mithai, Namkeen/Snacks, Chaat, Combos, Beverages.
- Use `ask_user` (input_type "choice") to let user pick items.
- For sweets:
  - Type: Kaju Katli, Rasgulla, Gulab Jamun, Soan Papdi, Barfi — use `ask_user` with prices.
  - Quantity: per piece, per plate, per kg — use `ask_user` (input_type "choice") with prices.
- For snacks:
  - Type: Samosa, Kachori, Aloo Tikki, Pav Bhaji — use `ask_user` with prices.
  - Quantity options — use `ask_user`.
- Click "Add" for each item.
- Ask if user wants to add more items from the same shop.

### 5. Apply Offers
- Check for available coupons/offers on the cart page.
- Swiggy/Zomato frequently run discount codes — apply best available coupon.
- Take snapshot if discount applied.

### 6. Review Cart
- Open cart, take snapshot.
- Use `confirm_action` to present order summary:
  - Shop name
  - Each item with quantity and price
  - Discounts applied (if any)
  - Subtotal, delivery fee, platform fee, taxes, total
  - Estimated delivery time (usually 25-40 minutes)
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 7. Checkout & Payment
- Proceed to checkout.
- Verify delivery address is correct.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with shop name, items, quantities, prices, discount, delivery fee, total, estimated time
  - amount_inr: total amount (number)
  - description: "Sweet shop order via Swiggy/Zomato"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 8. Place Order & Confirm
- Click "Place Order" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order number, shop name, items ordered, total paid, estimated delivery time, live tracking link if visible.

## Site Notes

- Sweet shop delivery via Swiggy/Zomato typically takes 25-40 minutes.
- Operator Chrome Profile 3 should be logged in to Swiggy/Zomato. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- Sweet shops on Swiggy/Zomato vary by city and area — popular chains include Bikanervala, Haldiram's, Bhagat Halwai, Aggarwal Sweets.
- Sweets are often priced per piece or per plate — clarify quantity with user before adding.
- Festival seasons (Diwali, Holi, Rakhi) may have special menus and higher demand — expect longer delivery times.
- Some shops have minimum order values on delivery platforms — check before proceeding.
- Swiggy/Zomato use React-based SPAs — always use Playwright fill/type methods.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
