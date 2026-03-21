---
name: licious-meat
description: Order fresh meat and seafood from Licious — browse cuts, marinations, ready-to-cook, checkout, pay.
triggers:
  - licious
  - order meat
  - fresh meat
  - order chicken
  - order fish
  - order mutton
  - licious order
  - meat delivery
  - seafood delivery
  - order from licious
siteUrl: https://www.licious.in
requiresAuth: true
params:
  - name: items
    required: true
    hint: What to order (e.g. "chicken breast", "mutton curry cut", "prawns", "seekh kebab") or category
  - name: address
    required: false
    hint: Delivery address or area name
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# Licious — Fresh Meat & Seafood Ordering

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### Step 0: Collect delivery address
**EXTRACT FIRST**: Parse the user's message for items AND address. Use whatever they already provided — do NOT re-ask.

- If address is missing → call `ask_user` with `input_type: "address"`, question: "What's your delivery address or area name?". Show saved addresses if available.
- If address is already provided → skip directly to `handoff_to_browser_agent`.
- **Do NOT ask for items** — extract them from the user's message. If truly missing, handoff anyway and let the browser agent figure it out.
- **Do NOT show product cards, prices, or images** — the cloud LLM has no access to the site's catalog. Only the browser agent can fetch real product data.

**CRITICAL**: Do NOT open the browser until you have the delivery address. Without a delivery location, Licious shows ZERO products.

### 1. Gather Requirements
- BEFORE opening the browser, check what info user provided (items, address).
- If address not provided, use `ask_user` (input_type "freetext"): "What's your delivery address or area name for Licious delivery?"
- If items are vague, use `ask_user` (input_type "choice"): "What category are you looking for?" with options: Chicken, Mutton, Fish & Seafood, Ready to Cook, Eggs, Cold Cuts & Sausages, Spreads.

### 2. Open Licious & Set Location
- Open a NEW tab and navigate to `https://www.licious.in`.
- Take snapshot. Verify logged in (account/profile icon in header).
- If location/pincode popup appears, enter the user's delivery area or pincode.
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Confirm delivery area is serviceable and product catalog visible.
- If area not serviceable, inform user immediately.

### 3. Browse & Select Products
- Navigate to the relevant category based on user's request.
- For each product category, present options with:
  - Product name (e.g. "Chicken Breast Boneless", "Mutton Curry Cut")
  - Cut type (boneless, bone-in, curry cut, mince, etc.)
  - Weight/quantity (250g, 500g, 1kg)
  - Price
  - Freshness guarantee info if visible
- Use `ask_user` (input_type "choice") to let user pick products.
- For each product, handle options:
  - Weight/quantity variant — use `ask_user` (input_type "choice") with prices.
  - Marination: Plain, Tandoori, Lemon & Herb, etc. — use `ask_user` if available.
- Click "Add to Cart" after each item.

### 4. Suggest Add-ons
- Ask if user wants to add more from these categories:
  - Ready to Cook: Seekh Kebab, Chicken Nuggets, Fish Fingers, Marinades.
  - Eggs: Farm Fresh, Organic, Protein Eggs.
  - Cold Cuts & Sausages: Salami, Sausages, Bacon.
  - Spreads: Chicken Spread, Pate.
- Use `ask_user` (input_type "choice") with popular recommendations.
- Add selected items to cart.

### 5. Review Cart
- Open cart, take snapshot.
- Use `confirm_action` to present order summary:
  - Each item with cut type, weight, marination, and price
  - Any subscription discounts applied
  - Subtotal, delivery fee (free above threshold), taxes, total
  - Estimated delivery time and slot (express 90 min or scheduled slot)
  - Freshness guarantee details
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Select Delivery Slot
- Present available delivery slots:
  - Express delivery (90 min to 2 hours)
  - Scheduled slots (morning, afternoon, evening)
- Use `ask_user` (input_type "choice") to let user pick a delivery slot.
- Confirm slot selection.

### 7. Checkout & Payment
- Proceed to checkout.
- Verify delivery address and slot are correct.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with items (cuts, weights, marinations), prices, delivery fee, total, delivery slot
  - amount_inr: total amount (number)
  - description: "Licious meat & seafood order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 8. Place Order & Confirm
- Click "Place Order" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order number, items ordered with weights and cuts, total paid, delivery slot, estimated delivery time, freshness guarantee info.

## Site Notes

- Licious guarantees chemical-free, freshly cut meat — delivered in temperature-controlled packaging.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- Free delivery above a threshold (usually ₹399-499) — suggest adding items to reach it.
- Licious operates in select cities: Bangalore, Delhi NCR, Hyderabad, Mumbai, Pune, Chennai, Chandigarh, Jaipur.
- Express delivery (90 min) available in most metros; scheduled slots for specific time windows.
- Licious Meat Pass subscription offers discounts — check if active on the account.
- Marinated and ready-to-cook items cost more than plain cuts — inform user of price difference.
- Seafood availability varies by city and season — some items may be out of stock.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
