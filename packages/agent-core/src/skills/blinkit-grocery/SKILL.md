---
name: blinkit-grocery
description: Order groceries from Blinkit with 10-minute delivery — search items, add to cart, checkout, pay.
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
    required: true
    hint: List of items to order (e.g. "milk, bread, eggs")
  - name: address
    required: false
    hint: Delivery address or area name
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# Blinkit Grocery Ordering

Chrome profile: rsinghtomar3011@gmail.com. Operator phone: 8109137158.

## Steps

### 1. Gather ALL Requirements Upfront
- BEFORE opening the browser, check what the user already provided: items to order, delivery address.
- If ANY info is missing, use ONE SINGLE `ask_user` call to collect ALL missing info at once.
  Example: "I need a couple of details to order from Blinkit:\n• Delivery address or area name\n• Anything else to add to the order?"
- Do NOT ask questions one at a time. Batch everything into a single prompt.
- If user has saved addresses in profile, present them as choices.
- If user provided both items and address already, skip straight to Step 2.

### 2. Open Blinkit & Verify Login
- Open a NEW tab and navigate to `https://blinkit.com`.
- Take a snapshot. Check if logged in — look for "Account" text in the header right section `[class*="Header__HeaderRight"]`.
- If Blinkit shows a location popup (`[class*="LocationModal"]`), type the user's address in the location search input, wait for suggestions, click best match.
- If area is not serviceable, tell user and stop.
- The header shows delivery time (e.g., "Delivery in 21 minutes") and the current address — verify both are correct.
- If NOT logged in: click the Login/Sign-in button in header, enter operator phone 8109137158, handle OTP transparently (do NOT ask user for credentials).
- **If you see a login page or wrong account, STOP and tell the user: "Session expired, please re-login in Chrome Debug."**
- Take snapshot to confirm location set and products visible (homepage shows category grid with 20 categories like "Dairy, Bread & Eggs", "Fruits & Vegetables", etc.).

### 3. Search & Add Items
For each item the user requested:
- Click the search bar link `a[href="/s/"]` in the header (it shows a "!" icon and rotating placeholder text like Search "chocolate", Search "curd").
- This navigates to `https://blinkit.com/s/`. The search input `input[placeholder*="Search for"]` (`[class*="SearchBarContainer__Input"]`) auto-focuses.
- Type the item name and press Enter. URL becomes `/s/?q={item}`.
- Take snapshot of results. Results are `div[role="button"][id][data-pf]` cards — each has:
  - Product name (text content)
  - Weight/size (e.g., "500 ml", "1 kg")
  - Price (text with "₹")
  - "ADD" button `div[role="button"]` with text "ADD"
  - Delivery time badge (e.g., "21 mins")
  - Optional discount badge (e.g., "6% OFF", "10% OFF")
- Category sub-filters appear above results (e.g., "Milk", "Amul milk", "Cow milk") — use to narrow if too many results.
- Find closest match. If multiple variants (500ml vs 1L, different brands), use `ask_user` (input_type "choice") presenting name, size, and price.
- Click the "ADD" button on the chosen product card. After adding, the ADD button transforms into a quantity counter with `-`/count/`+` buttons.
- To add more of same item, click `+`. To remove, click `-`.
- If out of stock (item not in results or greyed out), inform user and suggest alternatives from results.
- To search next item: click the search input, clear it (`p` icon clears text), type next item name, press Enter.
- Repeat for all items. Cart count updates in the header `[class*="CartButton__Button"]` showing "X items ₹Y".

### 4. Review Cart
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

### 5. Checkout & Payment
- Click "Proceed To Pay" button at bottom of cart panel (shows "₹XX TOTAL" + "Proceed To Pay").
- This navigates to the payment page. Verify delivery address is correct.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with items, prices, delivery charge, handling charge, small cart charge, grand total, delivery address, estimated time
  - amount_inr: grand total amount (number)
  - description: "Blinkit grocery order"
- STOP and WAIT — payment panel opens for user.
- Only proceed if payment confirmed. If cancelled, ask what to change.

### 6. Place Order & Confirm
- After payment is confirmed on Blinkit, handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order number/ID, items ordered, total paid, estimated delivery time, delivery address.

## Site Notes

- **Tech stack**: React + styled-components (`SearchBarContainer__*`, `Header__*`, `CartButton__*`) + Tailwind CSS (`tw-*` prefix). No `data-testid` attributes — use `role`, text, and styled-component class patterns.
- **Product images**: Served from `cdn.grofers.com` (Blinkit's legacy CDN from Grofers rebrand).
- **Product cards**: `div[role="button"][id][data-pf="reset"]` — the `id` attribute is the numeric product ID.
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
