---
name: bigbasket-grocery
description: Order groceries from BigBasket — browse real products visually, add to cart, schedule delivery, pay.
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
    required: false
    hint: List of items to order (e.g. "rice 5kg, dal, cooking oil") — optional, user can browse visually
  - name: address
    required: true
    hint: Delivery address or area name
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, wallet)
---

# BigBasket Grocery Ordering

Chrome profile: rsinghtomar3011@gmail.com.

**KEY PRINCIPLE**: Show real products with actual images and prices from BigBasket — never generic text or emoji cards. The user should feel like they're browsing a grocery app, not filling out a text form. NEVER ask the user "what items do you want?" as text. Instead, open the site, scrape real products, and show them visually.

## Steps

### Step 0: Confirm delivery address & phone
**ALWAYS show the address picker** — even if the user mentioned a location like "Tellapur" or "Koramangala". An area name is NOT a complete delivery address (missing flat/building, street, pincode, phone). The user must pick a saved address or enter a full one. The address widget collects flat/building, street, city, pincode, AND contact phone — all critical for delivery.

- Call `ask_user` with `input_type: "address"`. Show saved addresses. If the user mentioned an area, pre-fill it in the question:
  ```json
  {"input_type": "address", "question": "Confirm your delivery address and phone:", "saved": <use the saved addresses from the system prompt>}
  ```
- **Only skip** if the user provided a FULL address with building/flat, street, city, pincode, AND phone number.
- **Do NOT ask for items as text** — extract them from the user's message. If vague or missing, handoff immediately and let the browser agent browse the site visually.
- **Do NOT show product cards, prices, or images from the cloud LLM** — the cloud LLM has no access to BigBasket's catalog. Only the browser agent can fetch real product data.

**CRITICAL**: Do NOT open the browser until you have a complete delivery address with phone. Without a delivery location, BigBasket shows ZERO products and opens a location-select popup immediately.

### 1. Open BigBasket & Set Delivery Location
- Open a NEW tab and navigate to `https://www.bigbasket.com`.
- **CLEAR PREVIOUS CART FIRST**: Before doing anything else, navigate to `https://www.bigbasket.com/basket/`. If there are any leftover items from a previous session, click "Remove All" or remove each item individually. This ensures a clean cart for the new order. Then navigate back to `https://www.bigbasket.com`.
- Take snapshot immediately to confirm the page loaded and determine the current state.
- **Location popup auto-appears**: BigBasket shows a `menu "Delivery in 10 mins Select Location"` overlay with text "Select a location for delivery" and "Choose your address location to see product availability and delivery options".
- Find `textbox "Search for area or street name"` inside the popup.
- Type the user's area/locality (e.g. "Tellapur" or "Koramangala").
- Wait for location suggestions to appear, click the best match.
- Take snapshot to verify the popup closed and products are now visible.

### 2. Verify Login Status
- After location is set, take snapshot and check header.
- Look for `button "Login/ Sign Up"` — if visible, the user is NOT logged in.
- If logged in, the header shows a profile icon/name instead of "Login/ Sign Up".
- If NOT logged in:
  - Click `button "Login/ Sign Up"`.
  - BigBasket uses phone number + OTP login. Enter operator phone.
  - Use `ask_user` (input_type "otp") for the OTP code.
  - Verify login succeeded by taking snapshot — "Login/ Sign Up" button should be gone.
- **If login fails or session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Show Real Categories or Search Results to User
This step depends on what the user asked for:

**If user gave SPECIFIC items** (e.g., "order rice, dal, and cooking oil"):
- Skip category browsing. Go directly to Step 4 for each item.

**If user gave VAGUE/CATEGORICAL items** (e.g., "order fruits and vegetables", "get me groceries", "need some snacks"):
- Click `button "Shop by Category"` to open category dropdown.
- Take a `browser_snapshot`.
- Extract all visible category tiles — each has: category name (text), category image URL (from BigBasket CDN), and link.
- Call `ask_user` with `input_type: "carousel"` and `multi_select: true`:
  - `question`: "What would you like to browse? Pick categories or search for something specific."
  - `cards`: Array of real categories from the page, each with:
    - `id`: category slug or link path (e.g., "/cl/fruits-vegetables/")
    - `label`: category name (e.g., "Fruits & Vegetables")
    - `image`: real category image URL from BigBasket CDN
    - `subtitle`: subcategory hint if visible
  - `allow_custom`: true (so user can type "paneer" or "chocolate" to search directly)

**If user gave NO items** (e.g., "order from BigBasket"):
- Same as vague items — show the category browser and let them browse visually.

### 4. Search & Show Real Products with Images
For each item (specific from user message, or category/search from Step 3):

**If user selected a category:**
- Click the category link to navigate to the category page.
- Take a `browser_snapshot` of the category page.
- Extract product cards — each has: product name, weight/size, price (₹), image URL, discount badge, delivery time.

**If user typed a search term or has specific items:**
- Click the search bar `textbox "Search for Products..."` at the top of the page.
- Type the item name and press Enter.
- Take snapshot of search results.
- **Search results page structure**: Each product is a `listitem` containing:
  - `heading [level=3]` with brand + product name + quantity (e.g. "fresho! Capsicum - Green 1 kg")
  - Weight/variant selector: `button` with weight text (e.g. "1 kg")
  - Pricing: two `generic` elements — first is sale price (e.g. "₹133.6"), second is MRP (e.g. "₹167")
  - Delivery time badge: `generic` showing "10 mins"
  - Action: `button "Add"` to add to cart

**Then show products to user:**
- Call `ask_user` with `input_type: "card_grid"`:
  - `question`: "Here's what's available — tap to add items:"
  - `cards`: Array of REAL products (up to 12-16), each with:
    - `id`: product ID from the page (from URL pattern `/pd/{id}/{slug}/`)
    - `label`: product name (e.g., "fresho! Capsicum - Green")
    - `image`: REAL product image URL from BigBasket CDN — extract the `src` attribute from `<img>` tags inside product cards
    - `subtitle`: price and weight (e.g., "₹28 · 1 kg · MRP ₹89")
    - `badge`: discount or delivery time if any (e.g., "10 mins")
    - `url`: product page URL from BigBasket (extract from the `<a>` tag wrapping the product card, e.g., "https://www.bigbasket.com/pd/40015040/capsicum-green/")
  - `show_quantity`: true
  - `multi_select`: true
  - `allow_custom`: true (so user can type more items to search)

**CRITICAL**: Use REAL image URLs from the page. BigBasket product images are on their CDN (`www.bigbasket.com/media/uploads/` or similar) — these are public URLs. Extract the `src` attribute from `<img>` tags inside product cards.

### 5. Add Selected Items to Cart
For each product the user selected (with quantities):
- Find the product on the current page (it should still be visible).
- Click `button "Add"` on the product card. After adding, the button transforms into a quantity stepper with +/- buttons.
- Adjust quantity to match what the user requested.
- If user selected items from different categories/searches, search for each one:
  - Click search bar, type item name, press Enter, find the matching product, click Add, adjust qty.

**If user wants to browse more**: They can type additional items in the custom input. For each, search on BigBasket, scrape results, show another `card_grid` with real products, and let them pick. Repeat until they say they're done.

### 6. Review Cart
- Click the cart/basket icon button in the header or navigate to `https://www.bigbasket.com/basket/`.
- Take snapshot of the cart page.
- Use `confirm_action` to present order summary:
  - Each item with brand, quantity, weight, sale price
  - Subtotal, delivery charges, total
  - Available delivery slots (BigBasket offers scheduled delivery)
- Ask user to pick a delivery slot if multiple available (use `ask_user` with `input_type: "chip_bar"`).
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 7. Checkout & Payment
- Proceed to checkout from the cart page.
- Verify delivery address and selected time slot.
- Apply coupons if visible and beneficial.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with items, prices, delivery charge, total, delivery slot
  - amount_inr: total amount (number)
  - description: "BigBasket grocery order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 8. Place Order & Confirm
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
- **Product images**: Extract REAL `src` from `<img>` inside product cards. BigBasket images are on their CDN and publicly accessible.
- **Smart Basket**: Homepage shows "My Smart Basket" section with personalized product recommendations — can be scraped and shown to user.
- BigBasket offers both quick commerce (10 min) and scheduled delivery — delivery slots are same-day or next-day.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- BigBasket has a wide catalog (15K+ products) — search is reliable.
- Free delivery above a certain order value (usually ₹500-600).
- Products may show MRP vs sale price — always show the effective (lower) price.
- Some items are sold by weight (e.g. fruits/veggies) — confirm quantity.
- BigBasket membership (bb Star) may offer extra discounts.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
