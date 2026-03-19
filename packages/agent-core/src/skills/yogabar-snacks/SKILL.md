---
name: yogabar-snacks
description: Buy protein bars, muesli, oats, and healthy snacks from Yogabar — browse, add to cart, order online.
triggers:
  - yogabar
  - yoga bar
  - buy protein bars online
  - yogabar muesli
  - yogabar order
  - yogabar snacks
  - healthy protein bar
  - buy muesli online
  - yogabar breakfast
siteUrl: https://www.yogabars.in
requiresAuth: true
params:
  - name: items
    required: true
    hint: Products to buy (e.g. "protein bars variety pack, dark chocolate muesli, almond butter, whey protein")
  - name: dietary_pref
    required: false
    hint: Dietary preference (high-protein, sugar-free, vegan, gluten-free)
  - name: quantity
    required: false
    hint: Quantity or pack size (e.g. "box of 10", "2 packs")
---

# Yogabar Snacks & Nutrition Order

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Identify what the user wants: specific products or category-based recommendations.
- If the user is vague (e.g. "want some healthy bars"), use `ask_user` (input_type "freetext"):
  "What type of Yogabar products are you looking for? Options: Protein Bars (10-20g protein), Muesli & Granola, Breakfast Oats, Nut Butters, Whey Protein, or Variety Packs."
- Ask about dietary goals: weight loss, muscle building, general health, diabetic-friendly.
- Check quantity: single packs, boxes of 6/10, or bulk/variety packs.

### 2. Open Yogabar & Verify Login
- Open a NEW tab and navigate to `https://www.yogabars.in`.
- Take snapshot. Verify logged in (check for account or profile icon).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Close any promotional popup or discount banner.

### 3. Search & Browse Products
- Use search bar or browse categories: Protein Bars, Muesli, Oats, Nut Butters, Protein Powders.
- Take snapshot of search results or category page.
- For each item, extract: product name, variant/flavor, pack size, price, MRP, discount, protein content.
- If multiple flavors or sizes available, use `ask_user` (input_type "choice"):
  "Product Name — Flavor — Pack of X — ₹XXX (MRP ₹YYY) — Xg protein per serving"
- If item is out of stock, inform user and suggest alternatives from Yogabar range.
- Highlight bestsellers and new launches.
- Repeat for all requested items.

### 4. Check Combo & Subscription Deals
- Check for active combos: variety packs, "Build Your Box" options, bundles.
- Compare individual vs combo pricing.
- If combo saves money, suggest it: "Variety Pack of 10 bars for ₹XXX vs buying individually at ₹YYY."
- Check for subscription/auto-delivery options if user buys regularly.
- Apply available coupon codes or first-order discounts.

### 5. Review Cart
- Add selected products to cart. Navigate to cart. Take snapshot.
- Use `confirm_action` to present order summary:
  - Each product with flavor, pack size, quantity, protein content, and price
  - Subtotal
  - Discount / coupon savings
  - Delivery charges (free delivery threshold)
  - Total payable
  - Estimated delivery date
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout. Verify or enter delivery address.
- Use `ask_user` if shipping address is needed.
- Use `collect_payment`:
  - summary: JSON with products, flavors, pack sizes, quantities, prices, total
  - amount_inr: total payable amount
  - description: "Yogabar order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Place Order & Confirm
- Complete the order on Yogabar.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order number, items ordered, total paid, estimated delivery date.
- Mention nutritional highlights: "Each bar has Xg protein, Xg fiber — great for post-workout or office snacking."

## Site Notes

- Yogabar is a leading Indian D2C health snack brand — known for protein bars, muesli, and clean-label snacking.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Session may expire after extended inactivity — if login wall appears, ask user to re-login manually in Chrome Debug.
- Popular products: 20g Protein Bars (Almond Fudge, Choco Brownie), Dark Chocolate Muesli, Whey Protein, Almond Butter.
- Protein bars come in packs of 1, 6, or 10 — bulk packs are significantly cheaper per bar.
- Free delivery above ₹499 typically. Standard delivery: 3-7 business days.
- Yogabar products are No Preservatives, No Trans Fat — FSSAI certified.
- The "Build Your Box" feature lets users mix and match flavors at a discount.
- Check for seasonal or flash sales — Yogabar frequently runs 20-40% off sitewide events.
- Use `confirm_action` for cart review, `collect_payment` for checkout. WAIT for user response.
