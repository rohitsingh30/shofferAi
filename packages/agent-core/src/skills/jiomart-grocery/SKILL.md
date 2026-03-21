---
name: jiomart-grocery
description: Order groceries from JioMart — search products, add to cart, schedule delivery, checkout, pay.
triggers:
  - jiomart
  - jio mart
  - order from jiomart
  - jiomart grocery
  - jiomart order
  - reliance grocery
  - jio grocery
  - jiomart delivery
siteUrl: https://www.jiomart.com
requiresAuth: true
params:
  - name: items
    required: true
    hint: List of items to order (e.g. "rice 5kg, atta, oil, sugar")
  - name: address
    required: false
    hint: Delivery address or pincode
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, JioMart wallet)
---

# JioMart Grocery Ordering

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### Step 0: Confirm delivery address
**ALWAYS show the address picker** — even if the user mentioned a location like "Tellapur" or "Koramangala". An area name is NOT a complete delivery address (missing flat/building, street, pincode). The user must pick a saved address or enter a full one.

- Call `ask_user` with `input_type: "address"`. Show saved addresses. If the user mentioned an area, pre-fill it in the question:
  ```json
  {"input_type": "address", "question": "Confirm your delivery address for JioMart:", "saved": [{"label": "Home", "value": "C-502, Honer Aquantis, Tellapur"}, {"label": "Office", "value": "T-Hub, Raidurg, Hyderabad"}]}
  ```
- **Only skip** if the user provided a FULL address with building/flat, street, city, and pincode (e.g. "E111, Ridgewood Estate, DLF Garden City, Pune 411032").
- **Do NOT ask for items** — extract them from the user's message. If truly missing, handoff anyway and let the browser agent figure it out.
- **Do NOT show product cards, prices, or images** — the cloud LLM has no access to the site's catalog. Only the browser agent can fetch real product data.

**CRITICAL**: Do NOT open the browser until you have a complete delivery address. Without a delivery location, JioMart shows ZERO products.

### 1. Open JioMart & Set Location
- Open a NEW tab and navigate to `https://www.jiomart.com`.
- Take snapshot. Verify logged in (account/profile icon in header).
- If location/pincode popup appears, enter the user's pincode or address, select from suggestions.
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Confirm location/pincode set and products visible.

### 2. Search & Add Items
For each item the user requested:
- Use the search bar at top to search for the item.
- Take snapshot of results.
- Find the closest match. Check brand, size/weight, price, and availability.
- If multiple variants (brands, sizes, packs), use `ask_user` (input_type "choice") with prices.
- Click "Add to Cart" or "+" to add. Adjust quantity if user specified.
- If out of stock, inform user and suggest alternatives from other brands.
- Repeat for all items.
- Dismiss any popups or recommendation modals.

### 3. Review Cart
- Click cart icon, take snapshot.
- Use `confirm_action` to present order summary:
  - Each item with brand, quantity, size, and price
  - Subtotal, delivery charges, savings, total
  - Available delivery slots (if visible)
- Ask user to pick a delivery slot if multiple available.
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 4. Checkout & Payment
- Proceed to checkout.
- Verify delivery address and slot are correct.
- Apply coupons if available and beneficial — JioMart often has bank offers.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with items, prices, savings, delivery charge, total, delivery slot
  - amount_inr: total amount (number)
  - description: "JioMart grocery order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 5. Place Order & Confirm
- Click "Place Order" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order number, items ordered, total paid, delivery date/slot.

## Site Notes

- JioMart offers scheduled delivery — usually same-day or next-day delivery slots.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator (Jio number).
- JioMart has a massive catalog backed by Reliance Retail — covers groceries, household, personal care.
- Free delivery usually above ₹199-299 depending on area.
- JioMart often has bank card offers (10-15% cashback) — check and apply.
- JioMart Smart (Reliance Smart branded items) are usually cheaper alternatives.
- COD (Cash on Delivery) is available — but prefer online payment for faster processing.
- Products may show MRP vs JioMart price — always show the effective price to user.
- JioMart uses a React-based SPA — always use Playwright fill/type methods.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
