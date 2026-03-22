---
name: bigbasket-puja
description: Order puja items and samagri from BigBasket — incense, diyas, flowers, camphor, turmeric, and complete puja kits for festivals and rituals.
triggers:
  - bigbasket puja items
  - order puja samagri
  - buy puja items online
  - bigbasket puja kit
  - order incense agarbatti
  - buy diyas online
  - puja samagri delivery
  - bigbasket pooja items
  - festival puja items
  - buy camphor flowers puja
  - havan samagri order
  - bigbasket spiritual items
siteUrl: https://www.bigbasket.com
requiresAuth: true
params:
  - name: items
    required: false
    hint: Specific puja items needed (e.g. "agarbatti, diyas, camphor, kumkum, flowers, coconut")
  - name: occasion
    required: false
    hint: Occasion for puja (e.g. "Diwali", "Ganesh Chaturthi", "Navratri", "daily puja", "housewarming")
  - name: delivery_address
    required: true
    hint: Delivery address or saved address label
  - name: delivery_slot
    required: false
    hint: Preferred delivery time (e.g. "morning", "evening", "express")
---

# BigBasket Puja Items Order

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### Step 0: Confirm delivery address & phone
**ALWAYS show the address picker** — even if the user mentioned a location like "Tellapur" or "Koramangala". An area name is NOT a complete delivery address (missing flat/building, street, pincode, phone). The user must pick a saved address or enter a full one. The address widget collects flat/building, street, city, pincode, AND contact phone — all critical for delivery.

- If address is missing → call `ask_user` with `input_type: "address"`, question: "What's your delivery address or area name?". Show saved addresses if available.
- **Only skip** if the user provided a FULL address with building/flat, street, city, pincode, AND phone number.
- **Do NOT ask for items** — extract them from the user's message. If truly missing, handoff anyway and let the browser agent figure it out.
- **Do NOT show product cards, prices, or images** — the cloud LLM has no access to the site's catalog. Only the browser agent can fetch real product data.

**CRITICAL**: Do NOT open the browser until you have a complete delivery address with phone. Without a delivery location, BigBasket shows ZERO products.

### 1. Gather Requirements
- Determine what puja items the user needs. Options:
  - **Specific items** — user lists individual items (agarbatti, diyas, camphor, etc.).
  - **Complete puja kit** — pre-assembled kits for specific pujas or festivals.
  - **Occasion-based** — items for Diwali, Navratri, Ganesh Chaturthi, Satyanarayan Katha, etc.
  - **Daily puja essentials** — regular items for daily worship.
- If user is unsure, offer common categories via `ask_user` (input_type "choice"):
  - "Daily Puja Essentials — agarbatti, diyas, camphor, kumkum, haldi"
  - "Festival Puja Kit — complete kit for specific festival"
  - "Havan Samagri — items for havan/yagna"
  - "Flowers & Garlands — fresh flowers for puja"
  - "Custom List — I will tell you exactly what I need"
- Ask for delivery address via `ask_user` if not provided or not saved.
- Ask for preferred delivery slot via `ask_user` (input_type "choice"):
  - "Express delivery (1-2 hours)"
  - "Morning slot (6 AM - 12 PM)"
  - "Afternoon slot (12 PM - 6 PM)"
  - "Evening slot (6 PM - 10 PM)"

### 2. Open BigBasket & Verify Login
- Open a NEW tab and navigate to `https://www.bigbasket.com`.
- Take snapshot. Check if logged in (account name or "My Account" showing user details).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Dismiss any app-install banners, location prompts, or notification pop-ups.
- Set delivery location/pincode if prompted.

### 3. Search & Add Puja Items
- If ordering a puja kit, search for "puja kit" or the specific festival kit.
- If ordering individual items, search for each item one by one.
- For each item/search:
  - Take snapshot of search results.
  - Present top 2-3 options to user via `ask_user` (input_type "choice") with:
    - Product name and brand
    - Quantity/weight
    - Price (₹)
    - Rating
    - Delivery availability
  - Add selected item to cart.
- Repeat for all requested items.
- If an item is out of stock, inform user and suggest alternatives.
- Navigate to puja/spiritual category if browsing: Puja Needs section.
- Take snapshot after adding all items to cart.

### 4. Review Cart
- Navigate to cart page.
- Take snapshot of complete cart.
- Present cart summary to user:
  - List of all items with quantities and prices
  - Subtotal
  - Delivery fee (if any)
  - Any available offers or coupons
- Ask if user wants to add or remove anything via `ask_user`.
- Apply any relevant coupon codes if available.
- Take snapshot of final cart.

### 5. Confirm Order
- Proceed to checkout.
- Select/confirm delivery address.
- Select delivery slot.
- Take snapshot of order summary page.
- Use `confirm_action` with order summary:
  - Items list with quantities and prices
  - Subtotal: ₹X,XXX
  - Delivery fee: ₹X
  - Discount/coupon: -₹X (if any)
  - Total: ₹X,XXX
  - Delivery slot: selected time
  - Delivery address: confirmed address
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Payment
- Use `collect_payment`:
  - summary: JSON with items_count, subtotal, delivery_fee, discount, total, delivery_slot, delivery_address
  - amount_inr: total order amount
  - description: "BigBasket puja items order"
- STOP and WAIT for payment confirmation.

### 7. Complete Order & Confirm
- Select payment method on BigBasket (UPI / card / net banking / BigBasket wallet).
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report to user: order ID, items ordered, total amount, delivery slot, estimated delivery time.
- Mention: "You can track your order in the BigBasket app or website under My Orders."

## Site Notes

- BigBasket has a dedicated Puja Needs / Pooja Essentials category with 500+ spiritual items.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in to BigBasket. Do NOT ask user for credentials.
- Fresh flowers and garlands have limited shelf life — confirm delivery date matches puja date.
- Express delivery (1-2 hours) is available in metro cities; standard delivery is next-day in most areas.
- BigBasket offers pre-assembled puja kits during festivals (Diwali, Navratri, Ganesh Chaturthi) — these are good value bundles.
- Minimum order value may apply for free delivery — check and inform user if additional items are needed.
- Puja items are available under categories: Agarbatti & Dhoop, Diyas & Candles, Camphor, Puja Oil, Kumkum & Sindoor, Flowers.
- BigBasket also delivers fresh coconuts, betel leaves, and seasonal puja flowers.
- Some items may be city-specific (e.g. fresh flowers available only in select cities).
- Use `confirm_action` for order review, `collect_payment` for checkout. Always WAIT for user response.
