---
name: amazon-fresh
description: Order groceries from Amazon Fresh — search products, add to cart, schedule delivery, checkout, pay.
triggers:
  - amazon fresh
  - amazon grocery
  - order from amazon fresh
  - amazon fresh delivery
  - amazon fresh order
  - fresh grocery
  - amazon pantry
  - amazon fresh grocery
siteUrl: https://www.amazon.in/fresh
requiresAuth: true
params:
  - name: items
    required: true
    hint: List of items to order (e.g. "milk, eggs, fruits, vegetables, bread")
  - name: address
    required: false
    hint: Delivery address or pincode
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, Amazon Pay)
---

# Amazon Fresh Grocery Ordering

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### Step 0: Collect delivery address
**EXTRACT FIRST**: Parse the user's message for items AND address. Use whatever they already provided — do NOT re-ask.

- If address is missing → call `ask_user` with `input_type: "address"`, question: "What's your delivery address or pincode for Amazon Fresh?". Show saved addresses if available:
  ```json
  {"input_type": "address", "saved": [{"label": "Home", "value": "C-502, Honer Aquantis, Tellapur"}, {"label": "Office", "value": "T-Hub, Raidurg, Hyderabad"}]}
  ```
- If address is already provided → skip directly to `handoff_to_browser_agent`.
- **Do NOT ask for items** — extract them from the user's message. If truly missing, handoff anyway and let the browser agent figure it out.
- **Do NOT show product cards, prices, or images** — the cloud LLM has no access to the site's catalog. Only the browser agent can fetch real product data.

**CRITICAL**: Do NOT open the browser until you have the delivery address. Without a delivery location, Amazon Fresh shows ZERO products.

### 1. Open Amazon Fresh & Set Location
- Open a NEW tab and navigate to `https://www.amazon.in/fresh`.
- Take snapshot. Verify logged in (check for "Hello, [name]" in header).
- If location/address popup appears, type the user's address or pincode, select best match.
- If delivery address needs to be set, navigate to address selector and pick or add user's address.
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Confirm location set and Fresh products visible (green "Fresh" badge).

### 2. Search & Add Items
For each item the user requested:
- Use the search bar to search for the item. Add "amazon fresh" to search if needed to filter Fresh items.
- Take snapshot of results.
- Filter for "Amazon Fresh" items only (look for the green Fresh badge).
- Find the closest match. Check brand, size/weight, price, and Prime eligibility.
- If multiple variants (brands, sizes, organic vs regular), use `ask_user` with `input_type: "carousel"`. Extract the REAL image URL from each product's `<img>` tag on the page. Format:
  ```json
  {
    "input_type": "carousel",
    "cards": [
      {"id": "1", "label": "Brand Name Item", "subtitle": "₹XX · 1 kg", "image": "https://m.media-amazon.com/images/I/real-image...", "badge": "Fresh"}
    ]
  }
  ```
- Click "Add to Cart" to add. Adjust quantity if needed.
- If out of stock, inform user and suggest alternatives.
- Repeat for all items. Dismiss any popups or "Frequently bought together" suggestions.

### 3. Review Cart
- Navigate to cart, take snapshot.
- Ensure only Amazon Fresh items are in the cart (non-Fresh items ship separately).
- Use `confirm_action` to present order summary:
  - Each item with brand, quantity, size, and price
  - Subtotal, delivery charges, total
  - Available delivery windows (2-hour slots)
  - Prime savings if applicable
- Ask user to pick a delivery window.
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 4. Checkout & Payment
- Proceed to checkout.
- Verify delivery address and delivery window are correct.
- Apply available coupons or Subscribe & Save discounts if beneficial.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with items, prices, delivery charge, total, delivery window
  - amount_inr: total amount (number)
  - description: "Amazon Fresh grocery order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 5. Place Order & Confirm
- Click "Place Order" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order number, items ordered, total paid, delivery window.

## Site Notes

- Amazon Fresh offers 2-hour delivery windows — user must pick a slot.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- Amazon Fresh is only available in select cities (Delhi NCR, Mumbai, Bangalore, Hyderabad, etc.).
- Free delivery for Prime members above ₹199; non-Prime above ₹499 typically.
- Amazon Fresh items have a green "Fresh" badge — ensure you're adding Fresh items, not regular Amazon items.
- Subscribe & Save offers 5-10% extra discount on recurring items — mention to user.
- Fresh produce (fruits, veggies) may vary in weight — prices are per unit or per kg.
- Amazon's checkout flow may redirect to Amazon Pay — handle seamlessly.
- Amazon uses a complex React SPA — always use Playwright fill/type methods, wait for elements.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
