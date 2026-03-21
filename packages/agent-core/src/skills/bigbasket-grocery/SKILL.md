---
name: bigbasket-grocery
description: Order groceries from BigBasket — search products, add to cart, schedule delivery, pay.
triggers:
  - bigbasket
  - big basket
  - order from bigbasket
  - bigbasket grocery
  - bb grocery
  - bigbasket order
  - buy groceries from bigbasket
  - get groceries on bigbasket
  - bigbasket delivery
  - order vegetables from bigbasket
  - bigbasket fruits and veggies
  - grocery delivery bigbasket
  - need things from bigbasket
  - bb order groceries
siteUrl: https://www.bigbasket.com
requiresAuth: true
params:
  - name: items
    required: true
    hint: List of items to order (e.g. "rice 5kg, dal, cooking oil")
  - name: address
    required: false
    hint: Delivery address or area name
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, wallet)
---

# BigBasket Grocery Ordering

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### Step 0: Confirm delivery address & phone
**ALWAYS show the address picker** — even if the user mentioned a location like "Tellapur" or "Koramangala". An area name is NOT a complete delivery address (missing flat/building, street, pincode, phone). The user must pick a saved address or enter a full one. The address widget collects flat/building, street, city, pincode, AND contact phone — all critical for delivery.

- Call `ask_user` with `input_type: "address"`. Show saved addresses. If the user mentioned an area, pre-fill it in the question:
  ```json
  {"input_type": "address", "question": "Confirm your delivery address and phone:", "saved": <use the saved addresses from the system prompt>}
  ```
- **Only skip** if the user provided a FULL address with building/flat, street, city, pincode, AND phone number.
- **Do NOT ask for items** — extract them from the user's message. If truly missing, handoff anyway and let the browser agent figure it out.
- **Do NOT show product cards, prices, or images** — the cloud LLM has no access to BigBasket's catalog. Only the browser agent can fetch real product data.

**CRITICAL**: Do NOT open the browser until you have a complete delivery address with phone. Without a delivery location, BigBasket shows ZERO products and opens a location-select popup immediately.

### 1. Open BigBasket & Dismiss Location Popup
- Open a NEW tab and navigate to `https://www.bigbasket.com`.
- Take snapshot immediately.
- **Location popup auto-appears**: BigBasket shows a `menu "Delivery in 10 mins Select Location"` overlay with text "Select a location for delivery" and "Choose your address location to see product availability and delivery options".
- Find `textbox "Search for area or street name"` inside the popup.
- Type the user's area/locality (e.g. "Tellapur" or "Koramangala").
- Wait for location suggestions to appear, click the best match.
- Take snapshot to verify the popup closed and products are now visible.

### 3. Verify Login Status
- After location is set, take snapshot and check header.
- Look for `button "Login/ Sign Up"` — if visible, the user is NOT logged in.
- If logged in, the header shows a profile icon/name instead of "Login/ Sign Up".
- If NOT logged in:
  - Click `button "Login/ Sign Up"`.
  - BigBasket uses phone number + OTP login. Enter operator phone.
  - Use `ask_user` (input_type "otp") for the OTP code.
  - Verify login succeeded by taking snapshot — "Login/ Sign Up" button should be gone.
- **If login fails or session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 4. Search & Add Items
For each item the user requested:
- Click the search bar `textbox "Search for Products..."` at the top of the page.
- Type the item name and press Enter.
- Take snapshot of search results.
- **Search results page structure**: Each product is a `listitem` containing:
  - `heading [level=3]` with brand + product name + quantity (e.g. "fresho! Capsicum - Green 1 kg")
  - Inside heading: `link` with brand name in `generic` and product name in nested `heading [level=3]`
  - Weight/variant selector: `button` with weight text (e.g. "1 kg")
  - Pricing: two `generic` elements — first is sale price (e.g. "₹133.6"), second is MRP (e.g. "₹167")
  - Delivery time badge: `generic` showing "10 mins"
  - Discount badge: `generic` with text like "Har Din Sasta!"
  - Action: `button "Add"` to add to cart
- Product URLs follow pattern: `/pd/{id}/{slug}/`
- If multiple variants (brands, sizes), use `ask_user` with `input_type: "carousel"`. Extract the REAL image URL from each product's `<img>` tag on the page. Format:
  ```json
  {
    "input_type": "carousel",
    "cards": [
      {"id": "1", "label": "Brand Name Product", "subtitle": "₹XX · 1 kg · MRP ₹YY", "image": "https://www.bigbasket.com/media/uploads/real-image...", "badge": "10 mins"}
    ]
  }
  ```
- Click `button "Add"` to add the item to cart. If user wants more than 1, click the "+" quantity button after adding.
- If out of stock, inform user and suggest alternatives.
- **After adding, clear search and search for next item.**
- Repeat for all items.

### 5. Review Cart
- Click the cart/basket icon button in the header (unlabeled `button` with `img` icon, rightmost in the header actions area).
- Alternatively navigate to `https://www.bigbasket.com/basket/`.
- Take snapshot of the cart page.
- Use `confirm_action` to present order summary:
  - Each item with brand, quantity, weight, sale price
  - Subtotal, delivery charges, total
  - Available delivery slots (BigBasket offers scheduled delivery)
- Ask user to pick a delivery slot if multiple available.
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout from the cart page.
- Verify delivery address and selected time slot.
- Apply coupons if visible and beneficial.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with items, prices, delivery charge, total, delivery slot
  - amount_inr: total amount (number)
  - description: "BigBasket grocery order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Place Order & Confirm
- Click "Place Order" or equivalent on the checkout page.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order number, items, total paid, delivery slot/date.

## Site Notes

- **Location popup on first visit**: BigBasket immediately shows a location-select overlay with `textbox "Search for area or street name"`. Products are NOT visible until a location is set. ALWAYS handle this first.
- **"Delivery in 10 mins" mode**: BigBasket now offers quick commerce (bb Now) alongside scheduled delivery. The location popup header says "Delivery in 10 mins".
- **Login method**: BigBasket uses phone number + OTP. There is NO Google sign-in. The button text is `"Login/ Sign Up"`.
- **Search bar selector**: `textbox "Search for Products..."` — appears in both regular and sticky header.
- **Product card "Add" button**: Each product card has a `button "Add"` at the bottom. After first add, it switches to a quantity stepper with +/- buttons.
- **Weight/variant selector**: Shown as a `button` inside the product heading (e.g. `button "1 kg"`). Click to see other variants.
- **Price display**: Two elements — sale price first (e.g. "₹28"), then MRP crossed out (e.g. "₹89").
- **Category navigation**: `button "Shop by Category"` opens a dropdown with categories like "Fruits & Vegetables" (`/cl/fruits-vegetables/`), "Foodgrains, Oil & Masala" (`/cl/foodgrains-oil-masala/`), etc.
- **Smart Basket**: Homepage shows "My Smart Basket" section with personalized product recommendations.
- BigBasket is scheduled delivery — delivery slots are usually same-day or next-day.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- BigBasket has a wide catalog (15K+ products) — search is reliable.
- Free delivery above a certain order value (usually ₹500-600).
- Products may show MRP vs sale price — always show the effective (lower) price.
- Some items are sold by weight (e.g. fruits/veggies) — confirm quantity.
- BigBasket membership (bb Star) may offer extra discounts.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
