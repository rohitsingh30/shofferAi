---
name: zepto-grocery
description: Order groceries from Zepto with 10-15 minute delivery — search items, add to cart, checkout, pay.
triggers:
  - zepto
  - order from zepto
  - zepto grocery
  - zeptonow
  - order on zepto
  - zepto delivery
  - quick grocery zepto
  - groceries from zepto
  - buy from zepto
  - zepto order
  - 10 minute grocery
  - instant grocery delivery
  - order vegetables on zepto
  - zepto fruits
  - zepto snacks
siteUrl: https://www.zeptonow.com
requiresAuth: true
params:
  - name: items
    required: false
    hint: List of items to order (e.g. "milk, bread, eggs, tomatoes")
  - name: address
    required: false
    hint: Delivery address or area name
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# Zepto Grocery Ordering

Chrome profile: rsinghtomar3011@gmail.com. Operator phone: 8109137158.

## Steps

### Step 0: Confirm delivery address & phone
**ALWAYS show the address picker** — even if the user mentioned a location like "Tellapur" or "Koramangala". An area name is NOT a complete delivery address (missing flat/building, street, pincode, phone). The user must pick a saved address or enter a full one. The address widget collects flat/building, street, city, pincode, AND contact phone — all critical for delivery.

- Call `ask_user` with `input_type: "address"`. Show saved addresses. If the user mentioned an area, pre-fill it in the question:
  ```json
  {"input_type": "address", "question": "Confirm your delivery address and phone:", "saved": <use the saved addresses from the system prompt>}
  ```
- **Only skip** if the user provided a FULL address with building/flat, street, city, pincode, AND phone number (e.g. "E111, Ridgewood Estate, DLF Garden City, Pune 411032").
- **Do NOT ask for items** — extract them from the user's message. If truly missing, handoff anyway and let the browser agent figure it out.
- **Do NOT show product cards, prices, or images** — the cloud LLM has no access to the site's catalog. Only the browser agent can fetch real product data.

**CRITICAL**: Do NOT open the browser until you have a complete delivery address with phone. Without a delivery location, Zepto shows ZERO products.

### 1. Gather ALL Requirements Upfront
- BEFORE opening the browser, check what the user already provided: items to order, delivery address.
- If ANY info is missing, use ONE SINGLE `ask_user` call to collect ALL missing info at once.
  Example: "I need a couple of details to order from Zepto:\n• Delivery address or area name\n• Anything else to add to the order?"
- Do NOT ask questions one at a time. Batch everything into a single prompt.
- If user has saved addresses in profile, present them as choices.
- If user provided both items and address already, skip straight to Step 2.

### 2. Open Zepto & Verify Login
- Open a NEW tab and navigate to `https://www.zeptonow.com`.
- Take a snapshot. Check if logged in — look for a profile/account icon in the header area.
- If Zepto shows a location/address popup or banner, type the user's address in the location search input, wait for autocomplete suggestions, click the best match.
- If area is not serviceable, tell user and stop.
- The header shows delivery time (e.g., "10 min delivery") and current address — verify both are correct.
- If NOT logged in: click the Login/Sign-in button, enter operator phone 8109137158, handle OTP transparently (do NOT ask user for credentials).
- **If you see a login page or wrong account, STOP and tell the user: "Session expired, please re-login in Chrome Debug."**
- Take snapshot to confirm location set and products visible on homepage.

### 3. Search & Add Items
For each item the user requested:
- Click the search bar/icon in the header area.
- Type the item name and press Enter or wait for search results to appear.
- Take snapshot of results. Each product card typically shows:
  - Product name and brand
  - Weight/size (e.g., "500 ml", "1 kg")
  - Price (with ₹ symbol)
  - "Add" or "ADD" button
  - Optional discount badge
  - Delivery time
- Find the closest match. If multiple variants (different brands, sizes), use `ask_user` (input_type "choice") presenting name, size, and price for each option.
- Click the "Add" button on the chosen product. After adding, it typically transforms into a quantity counter with `-`/count/`+` buttons.
- To add more of the same item, click `+`. To remove, click `-`.
- If out of stock (not in results or greyed out), inform user and suggest alternatives from results.
- Clear the search input and type the next item name.
- Repeat for all items. Cart count/total should update in the header.

### 4. Review Cart
- Click the cart button/icon in the header (usually shows item count and total).
- Cart may open as a sidebar panel or navigate to a cart page.
- Take snapshot. The cart should show:
  - Each item: name, quantity, price
  - Bill details: Items total, Delivery charge, Handling charge, Grand total
  - Delivery address
  - Estimated delivery time
- Use `confirm_action` to present cart summary to user:
  - Each item with quantity and price
  - Full bill breakdown (items total, delivery charge, handling charge, grand total)
  - Delivery address
  - Estimated delivery time
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 5. Checkout & Payment
- Click "Proceed to Pay" or "Checkout" button.
- Verify delivery address is correct on payment page.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with items, prices, delivery charge, handling charge, grand total, delivery address, estimated time
  - amount_inr: grand total amount (number)
  - description: "Zepto grocery order"
- STOP and WAIT — payment panel opens for user.
- Only proceed if payment confirmed. If cancelled, ask what to change.

### 6. Place Order & Confirm
- After payment is confirmed, handle any payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order number/ID, items ordered, total paid, estimated delivery time, delivery address.

## Site Notes

- **Site URL**: `zeptonow.com` redirects to `zepto.com`. Always navigate to `https://www.zeptonow.com`.
- **Delivery**: Zepto delivers in 6-15 minutes depending on area — time-sensitive, don't waste time.
- **Operator Chrome Profile 3** should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login with operator phone 8109137158. OTP goes to operator.

### Verified Selectors (2026-03-20)

**Header (homepage + search):**
- Logo: `a[data-testid="zepto-logo"]`
- Delivery time: `h2[data-testid="delivery-time"]` — shows "X minutes"
- Address: `h3[data-testid="user-address"]` — shows address or "Select Location"
- Search: `a[data-testid="search-bar-icon"]` → links to `/search`
- Login (logged out): `span[data-testid="login-btn"]` with text "login"
- Profile (logged in): `span[data-testid="my-account"]` with text "profile", links to `/account`
- Cart: `button[data-testid="cart-btn"]` — shows count badge when items in cart

**Login modal:**
- Login button: `button[aria-label="login"]`
- Phone input: `textbox "Enter Phone Number"` in dialog
- Country code: "+91" (pre-set)
- Continue: `button "Continue"` (disabled until phone entered)

**Location modal:**
- Trigger: `button[aria-label="Select Location"]`
- Search: `textbox "Search a new address"`
- Saved addresses: List of clickable divs with label (Home/Work/Other) + address text
- Close: `button "Location modal close Icon"`

**Search page (`/search?query={term}`):**
- URL pattern: `https://www.zepto.com/search?query={term}` — use direct navigation
- Search input: `combobox "Search"` (role=combobox)
- Results heading: `h1` — "Showing results for "{term}""
- Brand filter buttons: Top row (e.g., "Amul", "Nandini")
- Price/Brand/Weight filters: Collapsible sections with checkboxes

**Product cards (search results):**
- Card: `a[href*="/pn/"]` — each product is a link
- Product image: `img[src*="cdn.zeptonow.com"]`
- ADD button: `button` with text "ADD" inside card
- After adding: ADD becomes `button "Decrease quantity"` + qty + `button "Increase quantity"`
- Price: `span` elements (current price, then MRP strikethrough)
- Discount: `span` with "₹X OFF"
- Name: `span`/`div` with product name text
- Weight: `span` with e.g., "1 pack (1 L)", "1 pc (250 ml)"
- Rating: star icon + `span` "4.7" + count "(69.6k)"
- Delivery: `div` "X mins"

**Cart (`[role="dialog"]`):**
- Open via `button[data-testid="cart-btn"]` — URL gets `&cart=open`
- Dialog: `[role="dialog"]` (div, not native `<dialog>`)
- Cart items: image + name (`paragraph`) + size + quantity controls (`button "Remove"` / qty / `button "Add"`)
- Quantity data-testids: `{id}-minus-btn`, `{id}-cart-qty`, `{id}-plus-btn`
- Bill summary: `"Bill summary"` heading, then:
  - `button "Item Total"` → ₹amount
  - `button "Handling Fee"` → "FREE" or ₹amount
  - `button "Delivery Fee"` → ₹amount + free delivery threshold text
  - `button "To Pay"` → final ₹amount
- Pay button: `button "Click to Pay ₹{amount}"` with class `bg-skin-primary`
- Paper bag opt-out: checkbox
- "Add More Items" link → `/search`

**Image CDN pattern:**
```
https://cdn.zeptonow.com/production/ik-seo/tr:w-403,ar-{ratio},pr-true,f-auto,q-40,dpr-2/cms/product_variant/{uuid}/{slug}.jpeg
```

### Operational Notes
- **Location**: First-time visitors or profile without location see "Select Location". If already set, header shows address + delivery time.
- **Product availability** varies by area and time of day. Some items may be out of stock.
- **Minimum order**: Below minimum may incur a small cart/delivery surcharge. Minimum varies by area.
- Some areas don't have Zepto coverage — site shows "not serviceable" or similar message.
- **Quantity controls**: After clicking ADD, the button becomes Decrease/count/Increase. Click Increase to add more, Decrease to reduce.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
- **Cancellation**: Orders may not be cancellable once packed for delivery.
- **Coupons**: Cart dialog shows available coupons with "Apply" buttons and "View all coupons" link.
