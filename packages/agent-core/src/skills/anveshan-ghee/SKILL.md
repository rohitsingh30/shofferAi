---
name: anveshan-ghee
description: Buy A2 ghee, honey, cold-pressed oils, and farm-to-table products from Anveshan — browse, add to cart, order online.
triggers:
  - anveshan
  - anveshan ghee
  - buy a2 ghee online
  - anveshan honey
  - farm to table food
  - anveshan order
  - cold pressed oil online
  - buy pure ghee
  - anveshan oils
siteUrl: https://www.anveshan.farm
requiresAuth: true
params:
  - name: items
    required: true
    hint: Products to buy (e.g. "A2 cow ghee 500ml, wild forest honey, cold pressed mustard oil, wood pressed coconut oil")
  - name: quantity
    required: false
    hint: Quantity or size preference (e.g. "1 litre", "2 jars")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# Anveshan Farm-to-Table Order

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Identify what the user wants: specific products or product categories.
- If the user is vague (e.g. "want pure ghee"), use `ask_user` (input_type "freetext"):
  "What Anveshan products are you looking for? Options: A2 Cow Ghee (Bilona method), A2 Buffalo Ghee, Raw Honey (Wild Forest, Ajwain, Eucalyptus), Cold-Pressed Oils (Mustard, Groundnut, Coconut, Sesame), or Combo Packs."
- Ask about size preferences (250ml/500ml/1L for ghee and oils).
- Check if buying for daily cooking or gifting (Anveshan has gift boxes).

### 2. Open Anveshan & Verify Login
- Open a NEW tab and navigate to `https://www.anveshan.farm`.
- Take snapshot. Verify logged in (check for account/profile icon).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Close any promotional popup or discount banner.

### 3. Browse & Search Products
- Use search bar or browse categories: Ghee, Honey, Oils, Combos, Gift Boxes.
- Take snapshot of product listings.
- For each item, extract: product name, variant, size, price, MRP, discount, sourcing region, key features.
- If multiple variants (sizes: 200ml/500ml/1L, or types: A2 Cow vs A2 Buffalo), use `ask_user` (input_type "choice"):
  "Product Name — Size — ₹XXX (MRP ₹YYY) — Source: [Region] — Method: [Bilona/Cold-pressed/Wood-pressed]"
- Show per-unit price for easy comparison across sizes.
- If item is out of stock, inform user and suggest alternatives.
- Repeat for all items.

### 4. Add to Cart & Check Combos
- Add each product to cart with correct quantity.
- Check for combo deals: ghee + honey, oil bundles, kitchen essentials pack.
- If a combo saves money, suggest it: "Kitchen Essentials Combo for ₹XXX saves ₹YYY vs buying separately."
- Apply active coupon codes visible on site or in banners.
- Check for first-purchase discounts.

### 5. Review Cart
- Navigate to cart. Take snapshot.
- Use `confirm_action` to present order summary:
  - Each product with variant, size, quantity, source region, and price
  - Subtotal
  - Discount / coupon savings
  - Delivery charges (free delivery threshold)
  - Total payable
  - Estimated delivery date
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout. Verify or enter delivery address.
- Use `ask_user` if address is needed.
- Use `collect_payment`:
  - summary: JSON with products, sizes, quantities, source regions, prices, total
  - amount_inr: total payable amount
  - description: "Anveshan farm-to-table order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Place Order & Confirm
- Complete the order on Anveshan.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order number, items ordered with sizes, total paid, estimated delivery date.
- Mention: "Anveshan products are sourced directly from farmers — each jar has a QR code for traceability to the farm."

## Site Notes

- Anveshan is an Indian D2C brand for farm-to-table ghee, honey, and cold-pressed oils — known for purity and traceability.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Session may expire after extended inactivity — if login wall appears, ask user to re-login manually in Chrome Debug.
- A2 Cow Ghee (Bilona method) is the flagship product — made from Gir cow milk, Rajasthan sourced.
- Honey variants: Wild Forest (multi-floral), Ajwain Honey (digestive), Eucalyptus Honey (immunity) — all raw and unprocessed.
- Cold-pressed oils retain nutrients vs refined oils — highlight this for health-conscious users.
- Larger sizes (1L) offer better per-ml value — recommend for regular use.
- Free delivery above ₹499 typically. Delivery takes 4-7 business days pan-India.
- Every product has a farm-traceability QR code — scan to see which farm it came from.
- Gift boxes available for festivals (Diwali, Holi) — good for corporate or family gifting.
- Use `confirm_action` for cart review, `collect_payment` for checkout. WAIT for user response.
