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
siteUrl: https://www.swiggy.com/instamart
requiresAuth: true
params:
  - name: items
    required: true
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

### Step 0: Collect delivery address (and items if not specified)
**EXTRACT FIRST**: If the user already mentioned items (e.g. "order milk and bread"), use those directly — do NOT ask again.
Only call `ask_user` for information NOT already in the user's message.

- If items ARE in the message but address is NOT → ask ONLY for address (input_type: "layout", one section: address).
- If BOTH items and address are missing → ask for both with `input_type: "layout"` and two sections:
  1. **address** (type: "address", required): Ask for delivery address. Show saved addresses if available.
  2. **items** (type: "card_grid", required): Show common grocery items as cards with emoji (🥛 Milk, 🍞 Bread, 🥚 Eggs, 🍚 Rice, 🌾 Atta, 🫒 Oil, 🍬 Sugar, 🫘 Dal, 🧈 Butter, 🍌 Banana, 🧅 Onion, 🥔 Potato). Enable quantity steppers and custom item input.

**CRITICAL**: Do NOT open the browser until you have both the delivery address and at least one item. Without a delivery location, Instamart shows ZERO products.

### 1. Open Swiggy Instamart & Set Location
- Open a NEW tab and navigate to `https://www.swiggy.com/instamart`.
- Take snapshot. Verify logged in — look for profile name or account icon in header (link with href `/my-account`).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- If "OK GOT IT" dialog appears for delivery-location confirmation, click it.
- If location is wrong, click the location/address bar at the top, type the user's delivery address, wait for autocomplete suggestions, click the best match.
- Take snapshot again. Confirm location is set and Instamart product categories are visible.
- Dismiss any app-install banners or notification prompts (click "No thanks" / "Not now" / close button).

### 2. Search & Add Each Item (loop)
For EACH item in the shopping list:

**a) Search for the item:**
- Click the search icon/bar on the Instamart page. Swiggy Instamart has a search bar at the top of the page.
- Type the item name (e.g., "milk") and press Enter or click search.
- Take snapshot of search results.

**b) Present options to user:**
- From the search results, extract the top 5-7 product options with: product name, brand, size/quantity, price.
- Use `ask_user` (input_type "choice") to let user pick. Format: "Brand Name Size — ₹Price"
- Example: "Amul Taaza Milk 1 Ltr — ₹54"

**c) Add selected item to cart:**
- Click the "Add" or "ADD" button on the chosen product card.
- If a quantity stepper appears (+/- buttons), adjust quantity if user requested more than 1.
- If an "Add to cart" confirmation modal appears, click "Add item" or confirm.
- Take snapshot to verify item was added (cart count should increase).

**d) Go back to search for next item:**
- Click the search bar again or navigate back to search.
- Repeat for all items.

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
- **Location bar**: Located at the top of the page. If location is wrong, click it, type address, pick from autocomplete.
- **Search**: The search bar is at the top of the Instamart page. Type item name and press Enter.
- **Product cards**: Each card shows product image, brand name, size, price, and an "ADD" button.
- **Cart**: A floating bar at the bottom shows cart count and total. Click it to open the cart.
- **Out of stock**: Some products may show "Out of stock" or have no "ADD" button — suggest alternatives.
- **Swiggy One**: Members get free delivery and extra discounts. Profile 3 may have Swiggy One.
- **Minimum order**: Free delivery may require a minimum order value (typically ₹149-₹199).
- **Operator Chrome Profile 3** should be logged in as rsinghtomar3011@gmail.com. Do NOT ask user for credentials.
- **If session expired**, login transparently. Phone OTP goes to operator.
- **Swiggy uses React** — always use Playwright fill/type methods for form inputs.
- When using `confirm_action` or `collect_payment`, WAIT for user response. Do NOT auto-proceed.
- **App-install banners**: Swiggy may show "Download the app" prompts. Dismiss with close button or "No thanks".
