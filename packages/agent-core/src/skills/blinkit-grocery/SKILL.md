---
name: blinkit-grocery
description: Order groceries from Blinkit with 10-minute delivery — browse real products visually, add to cart, checkout, pay.
triggers:
  - blinkit
  - order from blinkit
  - blinkit grocery
  - grocery delivery
  - order milk from blinkit
  - order bread and eggs
  - quick grocery delivery
  - groceries from blinkit
  - buy vegetables on blinkit
  - need groceries delivered
  - blinkit order
  - 10 minute delivery
  - order fruits and vegetables
  - get me groceries
  - blinkit shopping
siteUrl: https://blinkit.com
requiresAuth: true
params:
  - name: items
    required: false
    hint: List of items to order (e.g. "milk, bread, eggs") — optional, user can browse visually
  - name: address
    required: false
    hint: Delivery address or area name
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# Blinkit Grocery Ordering

Chrome profile: rsinghtomar3011@gmail.com. Operator phone: 8109137158.

**KEY PRINCIPLE**: Show real products with actual images and prices from Blinkit — never generic emoji cards. The user should feel like they're browsing a grocery app, not filling out a text form.

## Steps

### Step 0: Collect delivery address
Before opening the browser, ask for the delivery address ONLY (not items). Call `ask_user` with `input_type: "address"`, showing saved addresses if available. If the user already provided an address in their message, skip this step.

Do NOT ask what items to buy yet — we'll show them real products from the website.

### 1. Open Blinkit & Verify Login
- Open a NEW tab and navigate to `https://blinkit.com`.
- Take a snapshot. Check if logged in — look for "Account" text in the header right section `[class*="Header__HeaderRight"]`.
- If Blinkit shows a location popup (`[class*="LocationModal"]`), type the user's address in the location search input, wait for suggestions, click best match.
- If area is not serviceable, tell user and stop.
- The header shows delivery time (e.g., "Delivery in 21 minutes") and the current address — verify both are correct.
- If NOT logged in: click the Login/Sign-in button in header, enter operator phone 8109137158, handle OTP transparently (do NOT ask user for credentials).
- **If you see a login page or wrong account, STOP and tell the user: "Session expired, please re-login in Chrome Debug."**
- Take snapshot to confirm location set and products visible (homepage shows category grid with 20 categories like "Dairy, Bread & Eggs", "Fruits & Vegetables", etc.).

### 2. Show Real Categories to User
After login, the Blinkit homepage shows category tiles with images. Scrape them:
- Take a `browser_snapshot` of the homepage.
- Extract all visible category tiles — each has: category name (text), category image URL (from `cdn.grofers.com`), and link.
- Call `ask_user` with `input_type: "carousel"` and `multi_select: true`:
  - `question`: "What would you like to browse? Pick categories or search for something specific."
  - `cards`: Array of real categories from the homepage, each with:
    - `id`: category slug or link path (e.g., "/cn/dairy-bread-eggs/cid/9/921")
    - `label`: category name (e.g., "Dairy, Bread & Eggs")
    - `image`: real category image URL from cdn.grofers.com
    - `subtitle`: optional subcategory hint (e.g., "Milk, Curd, Paneer...")
  - `allow_custom`: true (so user can type "paneer" or "chocolate" to search directly)
- If the user typed specific items in their original message (e.g., "order milk and bread"), skip the category picker and go directly to Step 3 for those items.

### 3. Show Real Products with Images
Based on what the user selected (category or search term):

**If user selected a category:**
- Click the category tile/link on Blinkit to navigate to the category page.
- Take a `browser_snapshot` of the category page.
- Extract product cards — each has: product name, weight/size, price (₹), image URL from cdn.grofers.com, discount badge (e.g., "10% OFF"), delivery time badge.

**If user typed a search term:**
- Click the search bar link `a[href="/s/"]` → type the term → press Enter.
- Take a `browser_snapshot` of the search results page.
- Extract product cards from results (same data as above).

**Then show products to user:**
- Call `ask_user` with `input_type: "card_grid"`:
  - `question`: "Here's what's available — tap to add items:"
  - `cards`: Array of REAL products (up to 12-16), each with:
    - `id`: product ID from the page (the `id` attribute on the product card element)
    - `label`: product name (e.g., "Amul Taaza Toned Fresh Milk")
    - `image`: REAL product image URL from `cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=270/...`
    - `subtitle`: price and weight (e.g., "₹32 · 500 ml")
    - `badge`: discount if any (e.g., "10% OFF")
  - `show_quantity`: true
  - `multi_select`: true
  - `allow_custom`: true (so user can type more items to search)

**CRITICAL**: Use REAL image URLs from the page. Blinkit images are on `cdn.grofers.com` — these are public CDN URLs, no auth needed. Extract the `src` attribute from `<img>` tags inside product cards.

### 4. Add Selected Items to Cart
For each product the user selected (with quantities):
- Find the product on the current page (it should still be visible).
- Click the "ADD" button on the product card. After adding, the ADD button transforms into a quantity counter with `-`/count/`+`.
- Adjust quantity to match what the user requested.
- If user selected items from different categories, search for each one:
  - Click search bar, type item name, press Enter, find the matching product, click ADD, adjust qty.
- Cart count updates in the header `[class*="CartButton__Button"]` showing "X items ₹Y".

**If user wants to browse more**: They can type additional items in the custom input. For each, search on Blinkit, scrape results, show another `card_grid` with real products, and let them pick. Repeat until they say they're done.

### 5. Review Cart
- Click the cart button in header `[class*="CartButton__Button"]` (shows items count and total, e.g., "2 items ₹84").
- Cart opens as a right-side panel (React Modal via `.ReactModalPortal`).
- Take snapshot. The cart panel shows:
  - "My Cart" heading + "Share" button
  - Out-of-stock notice if any items removed (e.g., "1 out of stock item removed — you can continue to checkout")
  - Delivery time (e.g., "Delivery in 21 minutes")
  - Shipment info (e.g., "Shipment of 3 items")
  - Each cart item: image, product name, weight, price, quantity controls (`-`/count/`+`)
  - **Bill details**: Items total, Delivery charge, Handling charge, Small cart charge (if below minimum), Grand total
  - Delivery address with "Change" button
  - Tip options: ₹20, ₹30, ₹50, Custom
  - Feeding India donation: ₹1 (can be removed with `x` icon)
- Use `confirm_action` to present cart summary:
  - Each item with quantity and price
  - Full bill breakdown (items total, delivery charge, handling charge, small cart charge, grand total)
  - Delivery address
  - Estimated delivery time
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Proceed To Pay" button at bottom of cart panel (shows "₹XX TOTAL" + "Proceed To Pay").
- This navigates to the payment page. Verify delivery address is correct.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with items, prices, delivery charge, handling charge, small cart charge, grand total, delivery address, estimated time
  - amount_inr: grand total amount (number)
  - description: "Blinkit grocery order"
- STOP and WAIT — payment panel opens for user.
- Only proceed if payment confirmed. If cancelled, ask what to change.

### 7. Place Order & Confirm
- After payment is confirmed on Blinkit, handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order number/ID, items ordered, total paid, estimated delivery time, delivery address.

## Site Notes

- **Tech stack**: React + styled-components (`SearchBarContainer__*`, `Header__*`, `CartButton__*`) + Tailwind CSS (`tw-*` prefix). No `data-testid` attributes — use `role`, text, and styled-component class patterns.
- **Product images**: Served from `cdn.grofers.com` (Blinkit's legacy CDN from Grofers rebrand). Images are PUBLIC — no auth needed to load them in the chat UI. Use `w=270` size for product cards.
- **Product cards**: `div[role="button"][id][data-pf="reset"]` — the `id` attribute is the numeric product ID.
- **Image URL pattern**: `https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=270/{path}` — extract from `<img>` tag `src` inside product cards.
- **Category tiles on homepage**: Have category name (text) + category image (from cdn.grofers.com) + link to category page. Scrape these for the visual category picker.
- **Delivery**: 10-21 minutes depending on area — time-sensitive, don't waste time.
- **Operator Chrome Profile 3** should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login with operator phone 8109137158. OTP goes to operator.
- **Location**: First-time visitors see a location popup. If already set, header shows address + "Delivery in X minutes".
- **Cart panel**: Opens as a right-side React Modal (`.ReactModalPortal`), not a separate page.
- **Bill charges**: Items total + Delivery charge (~₹25-35) + Handling charge (~₹5-11) + Small cart charge (₹20 if below minimum ~₹199). Grand total shown at bottom.
- **Minimum order**: Below minimum incurs "Small cart charge" (~₹20). Minimum varies by area (~₹99-199).
- Some areas don't have Blinkit coverage — site shows "not serviceable" message.
- **Search bar**: On homepage it's a link (`a[href="/s/"]`) that navigates to `/s/` page. On search page it's a text input. Click the link first, then type.
- **Search URL pattern**: `https://blinkit.com/s/?q={query}` — direct navigation also works.
- **Category sub-filters**: Appear above search results (e.g., searching "milk" shows "Milk", "Amul milk", "Cow milk" filters). Click to narrow results.
- **Quantity controls**: After clicking ADD, the button becomes `-`/count/`+`. Click `+` to increase, `-` to decrease. Reaching 0 removes the item.
- **Proceed To Pay**: Button at bottom of cart panel. Click to go to payment page.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
- **Tip section**: Cart panel shows tip options (₹20, ₹30, ₹50, Custom) for delivery partner. Optional.
- **Cancellation**: Orders cannot be cancelled once packed for delivery.
