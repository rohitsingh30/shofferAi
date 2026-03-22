---
name: swiggy-instamart
description: Order groceries from Swiggy Instamart with 15-30 minute delivery.
triggers:
  - swiggy instamart
  - instamart
  - swiggy grocery
  - order from swiggy instamart
  - order from instamart
  - order groceries from swiggy
  - buy groceries on swiggy
  - swiggy instamart order
  - get milk from instamart
  - instamart delivery
  - quick grocery delivery
  - swiggy instant delivery
  - order vegetables from swiggy
  - order milk and bread from swiggy
  - swiggy instamart milk
  - buy from swiggy instamart
  - swiggy grocery delivery
siteUrl: https://www.swiggy.com/instamart
requiresAuth: true
params:
  - name: items
    required: false
    hint: List of grocery items to order (e.g. "milk, bread, eggs")
  - name: address
    required: false
    hint: Delivery address or area name
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# Swiggy Instamart Grocery Ordering

Chrome profile: rsinghtomar3011@gmail.com.

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

**CRITICAL**: Do NOT open the browser until you have a complete delivery address with phone. Without a delivery location, Swiggy Instamart shows ZERO products.

### 1. Open Swiggy Instamart & Set Location
- Open a NEW tab and navigate to `https://www.swiggy.com/instamart`.
- **CLEAR PREVIOUS CART FIRST**: Check the cart icon for any existing items. If the cart has items from a previous session, navigate to the cart and remove all items. This ensures a clean cart for the new order. Then return to Instamart.
- Take snapshot. Verify logged in — look for profile name (e.g., "Rohit") or account icon in header (link with href `/my-account`).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- If "OK GOT IT" dialog appears for delivery-location confirmation, click it.
- **Check current delivery location** shown at the top of the page. If it doesn't match the user's address:
  - Click the location/address bar at the top.
  - Look for **saved addresses** — e.g., "new home" at C-502, Honer Aquantis, Tellapur. If one matches, click it directly.
  - If no saved address matches, type the user's delivery address, wait for autocomplete suggestions, click the best match.
- Take snapshot again. Confirm location is set and Instamart product categories are visible.
- **⚠️ STORE HOURS CHECK**: If the page shows "We'll reopen at 6 am" or similar, the store is closed. Inform the user with the reopening time and ask if they want to proceed (items can still be added to cart for when the store opens).
- Dismiss any app-install banners or notification prompts (click "No thanks" / "Not now" / close button).

### 2. Search & Add Each Item (loop)
**FIRST**: Check if there are pre-existing items in the cart from a previous session. If the cart badge shows items, go to the cart and remove ALL items before starting. This ensures the user only gets what they asked for.

For EACH item in the shopping list:

**a) Search for the item:**
- Click the search icon/bar on the Instamart page. Swiggy Instamart has a search bar at the top of the page.
- Type the item name (e.g., "milk") and press Enter or click search.
- Take snapshot of search results.

**b) Present options to user:**
- From the search results, extract the top 5-7 product options with: product name, brand, size/quantity, price.
- Use `ask_user` with `input_type: "carousel"` to let user pick. Extract the REAL image URL from each product's `<img>` tag on the page. Format:
  ```json
  {
    "input_type": "carousel",
    "cards": [
      {"id": "1", "label": "Amul Taaza Milk", "subtitle": "₹54 · 1 Ltr", "image": "https://instamart-media-assets.swiggy.com/real-image...", "badge": "10 mins"}
    ]
  }
  ```

**c) Add selected item to cart:**
- Click the "Add" or "ADD" button on the chosen product card.
- If a quantity stepper appears (+/- buttons), verify the quantity shows "1". If user requested more than 1, use the "+" button to increase.
- If the product already shows a quantity (e.g., from a previous session), that's fine — note it and move on.
- If an "Add to cart" confirmation modal appears, click "Add item" or confirm.
- Take snapshot to verify item was added (cart count should increase).

**d) Go back to search for next item:**
- Clear the search bar (click the X/clear button or select all text and type the next item).
- If navigated away from search results, click the search bar at the top of the page.
- Repeat for all items.
- **TIP**: After adding an item, you may land on the product detail page. Use the back button or click the search bar to return to search.

### 3. Review Cart
- Click the cart button/link (usually shows item count and total at bottom of page, or "N items" floating bar).
- Take snapshot of cart contents.
- Use `confirm_action` to present order summary:
  - Each item with quantity, size, and price
  - Subtotal, delivery fee (if any), taxes
  - Grand total
  - Estimated delivery time (typically 10-30 min)
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 4. Checkout & Payment
- Proceed to checkout page.
- Verify delivery address is correct on the checkout page.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with items, prices, delivery fee, total, estimated time
  - amount_inr: total amount (number)
  - description: "Swiggy Instamart grocery order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 5. Place Order & Confirm
- Click "Place Order" or equivalent checkout button.
- Handle payment OTP via `ask_user` if needed (input_type "otp").
- Take snapshot of order confirmation page.
- Report: order ID, items ordered with quantities, total paid, estimated delivery time.

## Site Notes

- **Swiggy Instamart URL**: `https://www.swiggy.com/instamart` — do NOT use `/` or `/restaurants` (those are for food delivery).
- **Delivery speed**: 10-30 minutes depending on items and location.
- **"OK GOT IT" dialog**: Swiggy shows this on first visit for delivery-location confirmation. Always dismiss it.
- **Location bar**: Located at the top of the page showing current delivery area (e.g., "Ujjain", "Tellapur"). Click it to change. **Saved addresses** appear as clickable cards (e.g., "new home" with full address). Prefer selecting a saved address over typing.
- **Store hours**: Instamart stores may close late at night. If closed, page shows "We'll reopen at 6 am, today" or similar. Items can still be browsed but cart modifications may be disabled.
- **Search**: The search bar is at the top of the Instamart page. Type item name and press Enter. After searching, clicking a product may navigate to its detail page — use back/search to return.
- **Product cards**: Each card shows product image, brand name, size/weight (e.g., "1 Ltr", "400g"), price (with MRP strikethrough if discounted), and an "ADD" button. Common milk brands: Amul Taaza, Arokya, Heritage, Sid's Farm, Country Delight. Common bread brands: Britannia, Modern, English Oven, NOICE.
- **Cart**: A floating bar at the bottom shows cart count and total. Click it to open the cart. **Pre-existing items from previous sessions may remain in the cart** — always check and clean up before proceeding.
- **Out of stock**: Some products may show "Out of stock" or have no "ADD" button — suggest alternatives.
- **Swiggy One**: Members get free delivery and extra discounts. Profile 3 may have Swiggy One.
- **Minimum order**: Free delivery may require a minimum order value (typically ₹149-₹199).
- **Operator Chrome Profile 3** should be logged in as rsinghtomar3011@gmail.com (shows as "Rohit" in the header). Do NOT ask user for credentials.
- **If session expired**, login transparently. Phone OTP goes to operator.
- **Swiggy uses React** — always use Playwright fill/type methods for form inputs.
- When using `confirm_action` or `collect_payment`, WAIT for user response. Do NOT auto-proceed.
- **App-install banners**: Swiggy may show "Download the app" prompts. Dismiss with close button or "No thanks".
- **Iteration budget**: The search → select → add loop can be iteration-heavy. Keep searches efficient — search for the exact product name, present top 5-7 choices, add quickly. Avoid unnecessary navigation back-and-forth.
